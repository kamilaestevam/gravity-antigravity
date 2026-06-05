/**
 * hubInsightsService.ts — Motor de Insights Cross-Produto para o Hub
 *
 * Fase 1: Busca KPIs de cada produto ativo via REST (Promise.allSettled)
 * Fase 2: Gera insights ranqueados com role-weights (role do usuário)
 * Fase 3: Cache in-memory com id_organizacao isolation (TTL 5min)
 *
 * Regras:
 *  - Nunca expõe dados de outro tenant (cache-key inclui id_organizacao)
 *  - Carrossel: ~90% insights operacionais (KPIs/alertas) · ~10% dicas de plataforma
 *  - Cada fetcher tem timeout de 3s (AbortSignal.timeout)
 *  - Erros individuais de produto não bloqueiam os demais
 */

// ── Tipos ───────────────────────────────────────────────────────────────────

export interface HubInsight {
  id: string
  variante: 'default' | 'warn'
  tag: string
  texto: string
  stat?: { label: string; valor: string }
  textoLink?: string
  rota?: string
  score: number
  produto?: string
}

export type HubUserRole = 'operador' | 'gerente' | 'diretor' | 'admin' | 'default'

interface ProductFetcherContext {
  id_organizacao: string
  id_usuario: string
  role: HubUserRole
  token: string
  internalKey: string
}

// ── Constantes de serviço (portas do contracts.json) ────────────────────────

// Lazy getters — evita ESM top-level read antes de dotenv/--env-file (Mand. 08)
function getPedidoUrl(): string { return process.env.PEDIDO_SERVICE_URL ?? 'http://localhost:8030' }
function getBidCambioUrl(): string { return process.env.BID_CAMBIO_URL ?? 'http://localhost:8025' }
function getBidFreteUrl(): string { return process.env.BID_FRETE_SERVICE_URL ?? 'http://localhost:8023' }
function getSimulaCustoUrl(): string { return process.env.SIMULA_CUSTO_SERVICE_URL ?? 'http://localhost:8020' }
function getLpcoUrl(): string { return process.env.LPCO_SERVICE_URL ?? 'http://localhost:8027' }
function getNfImportUrl(): string { return process.env.NF_IMPORTACAO_SERVICE_URL ?? 'http://localhost:8028' }
function getChaveInterna(): string {
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave) console.warn('[hub-insights] CHAVE_INTERNA_SERVICO ausente — chamadas inter-serviço falharão')
  return chave ?? ''
}

const FETCH_TIMEOUT_MS = 3_000

/** Mínimo de cards no carrossel GABI do HUB. */
const MIN_INSIGHTS_HUB = 4
/** Alvo quando há dados operacionais suficientes. */
const TARGET_INSIGHTS_HUB = 10
/** Teto do carrossel (evita lista infinita). */
const MAX_INSIGHTS_HUB = 12
/** Fração máxima de dicas de plataforma no carrossel. */
const FRACAO_DICAS_PLATAFORMA = 0.1
/** Insere 1 dica de plataforma a cada N insights operacionais. */
const INTERVALO_INSIGHT_OPERACIONAL = 9

/** Aliases de chave de produto → chave usada pelos fetchers (paridade Store/HUB). */
export function normalizarChavesProdutosAtivosHub(keys: Iterable<string>): Set<string> {
  const out = new Set<string>()
  for (const key of keys) {
    out.add(key)
    if (key === 'bid-frete-internacional') out.add('bid-frete')
    if (key === 'nf-import') out.add('nf-importacao')
  }
  return out
}

function montarHeadersChamadaInterServicoHub(ctx: ProductFetcherContext): Record<string, string> {
  return {
    'x-chave-interna-servico': ctx.internalKey,
    'x-internal-key': ctx.internalKey,
    'x-id-organizacao': ctx.id_organizacao,
    'x-id-usuario': ctx.id_usuario,
    'x-user-role': ctx.role,
    'Content-Type': 'application/json',
  }
}

function urlBidFreteInternacionalDashboard(path: string): string {
  return `${getBidFreteUrl()}/api/v1/bid-frete-internacional/dashboard${path}`
}

function insightOperacionalSemPendencia(
  id: string,
  produto: string,
  tag: string,
  rota: string,
  score: number,
): HubInsight {
  return {
    id,
    variante: 'default',
    tag,
    texto: `Nenhuma pendência crítica em ${produto} no período analisado.`,
    textoLink: `Abrir ${produto}`,
    rota,
    score,
    produto,
  }
}

// ── Role weights — pesos de relevância por role cross-produto ───────────────

const HUB_ROLE_WEIGHTS: Record<HubUserRole, Record<string, number>> = {
  operador: {
    pedidos_atrasados:     100,
    cambio_vencimentos:     90,
    frete_alertas:          85,
    lpco_suspensas:         95,
    simula_inviavel:        70,
    pedidos_abertos:        75,
    pedidos_volume:         50,
    cambio_economia:        30,
    nf_pendentes:           80,
    pedidos_sem_exportador: 90,
    pedidos_financeiro:     25,
    simula_atencao:         60,
    pedidos_cancelados:     65,
  },
  gerente: {
    pedidos_financeiro:    100,
    cambio_economia:        95,
    pedidos_atrasados:      80,
    cambio_vencimentos:     75,
    frete_alertas:          70,
    lpco_suspensas:         85,
    simula_inviavel:        65,
    pedidos_abertos:        60,
    pedidos_volume:         55,
    nf_pendentes:           70,
    pedidos_sem_exportador: 70,
    simula_atencao:         55,
    pedidos_cancelados:     60,
  },
  diretor: {
    pedidos_financeiro:    100,
    cambio_economia:       100,
    pedidos_volume:         90,
    pedidos_atrasados:      60,
    cambio_vencimentos:     55,
    frete_alertas:          50,
    lpco_suspensas:         70,
    simula_inviavel:        50,
    pedidos_abertos:        40,
    nf_pendentes:           55,
    pedidos_sem_exportador: 50,
    simula_atencao:         45,
    pedidos_cancelados:     50,
  },
  admin: {
    pedidos_atrasados:     100,
    cambio_vencimentos:    100,
    frete_alertas:         100,
    lpco_suspensas:        100,
    simula_inviavel:       100,
    pedidos_abertos:       100,
    pedidos_volume:        100,
    cambio_economia:       100,
    nf_pendentes:          100,
    pedidos_sem_exportador:100,
    pedidos_financeiro:    100,
    simula_atencao:        100,
    pedidos_cancelados:    100,
  },
  default: {
    pedidos_atrasados:      80,
    cambio_vencimentos:     75,
    frete_alertas:          70,
    lpco_suspensas:         80,
    simula_inviavel:        60,
    pedidos_abertos:        65,
    pedidos_volume:         50,
    cambio_economia:        55,
    nf_pendentes:           65,
    pedidos_sem_exportador: 70,
    pedidos_financeiro:     50,
    simula_atencao:         55,
    pedidos_cancelados:     55,
  },
}

// ── Formatadores ────────────────────────────────────────────────────────────

const fmtNum = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n))
const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)

// ── Cache in-memory com TTL ─────────────────────────────────────────────────

interface CacheEntry {
  insights: HubInsight[]
  timestamp: number
}

const CACHE_TTL_MS = 5 * 60 * 1_000 // 5 minutos
const CACHE_MAX_ENTRIES = 200
const insightsCache = new Map<string, CacheEntry>()

function getCacheKey(id_organizacao: string, id_usuario: string): string {
  return `v2:${id_organizacao}:${id_usuario}`
}

function getCached(id_organizacao: string, id_usuario: string): HubInsight[] | null {
  const entry = insightsCache.get(getCacheKey(id_organizacao, id_usuario))
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    insightsCache.delete(getCacheKey(id_organizacao, id_usuario))
    return null
  }
  return entry.insights
}

function setCache(id_organizacao: string, id_usuario: string, insights: HubInsight[]): void {
  // Evict oldest entries if cache is full
  if (insightsCache.size >= CACHE_MAX_ENTRIES) {
    const firstKey = insightsCache.keys().next().value as string
    insightsCache.delete(firstKey)
  }
  insightsCache.set(getCacheKey(id_organizacao, id_usuario), {
    insights,
    timestamp: Date.now(),
  })
}

// ── Helper: fetch com timeout + headers internos ────────────────────────────

async function fetchProduct(
  url: string,
  ctx: ProductFetcherContext,
): Promise<unknown> {
  const response = await fetch(url, {
    headers: montarHeadersChamadaInterServicoHub(ctx),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
}

// ── Fetchers por produto ────────────────────────────────────────────────────

async function fetchPedidoInsights(
  ctx: ProductFetcherContext,
  role: HubUserRole,
): Promise<HubInsight[]> {
  const weights = HUB_ROLE_WEIGHTS[role] ?? HUB_ROLE_WEIGHTS.default

  try {
    const gabi = await fetchProduct(
      `${getPedidoUrl()}/api/v1/pedidos/dashboard/insights?period=30d`,
      ctx,
    ) as { insights?: Array<Omit<HubInsight, 'produto'>> }

    const doMotorGabi = (gabi.insights ?? []).map(ins => ({
      ...ins,
      variante: ins.variante ?? 'default',
      score: ins.score ?? 0,
      produto: 'Pedido',
    }))

    if (doMotorGabi.length > 0) return doMotorGabi
  } catch {
    // Fallback: agrega KPIs manualmente abaixo
  }

  const insights: HubInsight[] = []

  let data: Record<string, number>
  try {
    data = await fetchProduct(
      `${getPedidoUrl()}/api/v1/pedidos/dashboard/kpis`,
      ctx,
    ) as Record<string, number>
  } catch {
    insights.push(
      insightOperacionalSemPendencia(
        'pedidos_indisponivel',
        'Pedido',
        'Operação · Pedido',
        '/pedido/dashboard',
        weights.pedidos_abertos ?? 40,
      ),
    )
    return insights
  }

  const atrasados = data.pedidos_atrasados ?? 0
  const abertos = data.pedidos_abertos ?? 0
  const semExportador = data.pedidos_sem_exportador ?? 0
  const total = data.total_pedidos ?? 0
  const cancelados = data.pedidos_cancelados ?? 0
  const valorTotal = data.valor_total ?? 0
  const ticketMedio = data.ticket_medio ?? 0

  if (atrasados > 0) {
    insights.push({
      id: 'pedidos_atrasados',
      variante: 'warn',
      tag: 'Atenção · Pedidos Atrasados',
      texto: `${atrasados} pedido${atrasados > 1 ? 's' : ''} com prazo vencido. Ação imediata recomendada.`,
      stat: total > 0
        ? { label: 'Taxa de atraso', valor: `${((atrasados / total) * 100).toFixed(1)}%` }
        : undefined,
      textoLink: 'Ver atrasados',
      rota: '/pedido/lista?status=atrasado',
      score: weights.pedidos_atrasados ?? 0,
      produto: 'Pedido',
    })
  }

  if (semExportador > 0) {
    insights.push({
      id: 'pedidos_sem_exportador',
      variante: 'warn',
      tag: 'Atenção · Sem Exportador',
      texto: `${semExportador} pedido${semExportador > 1 ? 's' : ''} sem exportador vinculado. Risco de bloqueio de faturamento.`,
      textoLink: 'Corrigir agora',
      rota: '/pedido/lista?sem_exportador=true',
      score: weights.pedidos_sem_exportador ?? 0,
      produto: 'Pedido',
    })
  }

  if (abertos > 0) {
    insights.push({
      id: 'pedidos_abertos',
      variante: 'default',
      tag: 'Operação · Pedidos em Aberto',
      texto: `${abertos} pedido${abertos > 1 ? 's' : ''} em aberto prontos para transferência.`,
      stat: { label: 'Total no período', valor: fmtNum(total) },
      textoLink: 'Ver pedidos',
      rota: '/pedido/lista?status=aberto',
      score: weights.pedidos_abertos ?? 0,
      produto: 'Pedido',
    })
  }

  if (cancelados > 0 && total > 0) {
    const pctCancel = ((cancelados / total) * 100).toFixed(1)
    insights.push({
      id: 'pedidos_cancelados',
      variante: cancelados / total > 0.1 ? 'warn' as const : 'default' as const,
      tag: 'Alerta · Cancelamentos',
      texto: `${cancelados} pedido${cancelados > 1 ? 's' : ''} cancelado${cancelados > 1 ? 's' : ''} no período (${pctCancel}% do total).`,
      stat: { label: 'Total no período', valor: fmtNum(total) },
      textoLink: 'Ver cancelados',
      rota: '/pedido/lista?status=cancelado',
      score: weights.pedidos_cancelados ?? 0,
      produto: 'Pedido',
    })
  }

  if (valorTotal > 0) {
    insights.push({
      id: 'pedidos_financeiro',
      variante: 'default',
      tag: 'Financeiro · Carteira de Pedidos',
      texto: `Carteira do período totaliza ${fmtBRL(valorTotal)} em pedidos.`,
      stat: ticketMedio > 0
        ? { label: 'Ticket médio', valor: fmtBRL(ticketMedio) }
        : undefined,
      rota: '/pedido/dashboard',
      score: weights.pedidos_financeiro ?? 0,
      produto: 'Pedido',
    })
  }

  if (total > 0) {
    insights.push({
      id: 'pedidos_volume',
      variante: 'default',
      tag: 'Visão Geral · Pedidos',
      texto: `${fmtNum(total)} pedido${total > 1 ? 's' : ''} no período, ${fmtNum(abertos)} em aberto.`,
      stat: { label: 'Pedidos no período', valor: fmtNum(total) },
      rota: '/pedido/dashboard',
      score: weights.pedidos_volume ?? 0,
      produto: 'Pedido',
    })
  }

  if (insights.length === 0) {
    insights.push(
      insightOperacionalSemPendencia(
        'pedidos_sem_pendencia',
        'Pedido',
        'Operação · Pedido',
        '/pedido/dashboard',
        weights.pedidos_abertos ?? 40,
      ),
    )
  }

  return insights
}

async function fetchBidCambioInsights(
  ctx: ProductFetcherContext,
  role: HubUserRole,
): Promise<HubInsight[]> {
  const weights = HUB_ROLE_WEIGHTS[role] ?? HUB_ROLE_WEIGHTS.default
  const insights: HubInsight[] = []

  // Vencimentos próximos (30 dias)
  try {
    const venc = await fetchProduct(
      `${getBidCambioUrl()}/api/v1/bid-cambio/dashboard/vencimentos?dias=30`,
      ctx,
    ) as { proximos_vencimentos?: { total?: number } }
    const total = venc.proximos_vencimentos?.total ?? 0
    if (total > 0) {
      insights.push({
        id: 'cambio_vencimentos',
        variante: 'warn',
        tag: 'Alerta de Prazo · BID Câmbio',
        texto: `${total} parcela${total > 1 ? 's' : ''} vence${total === 1 ? '' : 'm'} em menos de 30 dias. Revise para não perder o prazo.`,
        textoLink: 'Ver parcelas',
        rota: '/bid-cambio',
        score: weights.cambio_vencimentos ?? 0,
        produto: 'BID Câmbio',
      })
    }
  } catch {
    // Silently skip — resilience pattern
  }

  // Economia acumulada
  try {
    const dash = await fetchProduct(
      `${getBidCambioUrl()}/api/v1/bid-cambio/dashboard`,
      ctx,
    ) as { financeiro?: { economia_acumulada_mes?: number } }
    const eco = dash.financeiro?.economia_acumulada_mes ?? 0
    if (eco > 0) {
      insights.push({
        id: 'cambio_economia',
        variante: 'default',
        tag: 'Economia · BID Câmbio',
        texto: `Economia de ${fmtBRL(eco)} este mês operando câmbio pelo marketplace Gravity.`,
        stat: { label: 'Economia acumulada', valor: fmtBRL(eco) },
        textoLink: 'Ver detalhes',
        rota: '/bid-cambio',
        score: weights.cambio_economia ?? 0,
        produto: 'BID Câmbio',
      })
    }
  } catch {
    // Silently skip
  }

  if (insights.length === 0) {
    insights.push(
      insightOperacionalSemPendencia(
        'cambio_sem_pendencia',
        'BID Câmbio',
        'Operação · BID Câmbio',
        '/bid-cambio',
        weights.cambio_vencimentos ?? 50,
      ),
    )
  }

  return insights
}

async function fetchBidFreteInsights(
  ctx: ProductFetcherContext,
  role: HubUserRole,
): Promise<HubInsight[]> {
  const weights = HUB_ROLE_WEIGHTS[role] ?? HUB_ROLE_WEIGHTS.default
  const insights: HubInsight[] = []

  type AlertaFrete = { tipo: string; label?: string; count: number; cor?: string }

  const [calendario, alertasInsights] = await Promise.allSettled([
    fetchProduct(urlBidFreteInternacionalDashboard('/calendario'), ctx) as Promise<{
      alertas?: AlertaFrete[]
    }>,
    fetchProduct(urlBidFreteInternacionalDashboard('/insights-alertas'), ctx) as Promise<{
      alertas?: AlertaFrete[]
    }>,
  ])

  const alertas: AlertaFrete[] = []
  if (calendario.status === 'fulfilled') alertas.push(...(calendario.value.alertas ?? []))
  if (alertasInsights.status === 'fulfilled') alertas.push(...(alertasInsights.value.alertas ?? []))

  const porTipo = new Map<string, AlertaFrete>()
  for (const a of alertas) {
    const prev = porTipo.get(a.tipo)
    if (!prev || a.count > prev.count) porTipo.set(a.tipo, a)
  }

  const scorePorTipo: Record<string, number> = {
    fora_prazo: weights.frete_alertas ?? 85,
    vence_hoje: (weights.frete_alertas ?? 85) - 5,
    vencimento: (weights.frete_alertas ?? 85) - 10,
    resposta: 75,
    aprovacao: 70,
    respostas: 65,
    nova: 55,
  }

  for (const [tipo, alerta] of porTipo) {
    if (alerta.count <= 0) continue
    const warn = tipo === 'fora_prazo' || tipo === 'vence_hoje' || alerta.cor === 'red'
    const label = alerta.label ?? tipo.replace(/_/g, ' ')
    insights.push({
      id: `frete_${tipo}`,
      variante: warn ? 'warn' : 'default',
      tag: `Alerta · BID Frete · ${label}`,
      texto: `${alerta.count} ocorrência${alerta.count > 1 ? 's' : ''}: ${label}.`,
      textoLink: 'Ver cotações',
      rota: '/bid-frete',
      score: scorePorTipo[tipo] ?? weights.frete_alertas ?? 60,
      produto: 'BID Frete Internacional',
    })
  }

  if (insights.length === 0) {
    insights.push(
      insightOperacionalSemPendencia(
        'frete_sem_pendencia',
        'BID Frete Internacional',
        'Operação · BID Frete',
        '/bid-frete',
        weights.frete_alertas ?? 50,
      ),
    )
  }

  return insights
}

async function fetchSimulaCustoInsights(
  ctx: ProductFetcherContext,
  role: HubUserRole,
): Promise<HubInsight[]> {
  const weights = HUB_ROLE_WEIGHTS[role] ?? HUB_ROLE_WEIGHTS.default
  const insights: HubInsight[] = []

  const data = await fetchProduct(
    `${getSimulaCustoUrl()}/api/v1/simula-custo/dashboard/kpis`,
    ctx,
  ) as { inviavel?: number; atencao?: number; mediaLandedCostBrl?: number }

  const inviavel = data.inviavel ?? 0
  const atencao = data.atencao ?? 0
  const media = data.mediaLandedCostBrl ?? 0

  if (inviavel > 0) {
    insights.push({
      id: 'simula_inviavel',
      variante: 'warn',
      tag: 'Simulações · SimulaCusto',
      texto: `${inviavel} simulaç${inviavel > 1 ? 'ões inviáveis' : 'ão inviável'} detectada${inviavel > 1 ? 's' : ''}.`,
      stat: media > 0 ? { label: 'Média landed cost', valor: fmtBRL(media) } : undefined,
      textoLink: 'Ver simulações',
      rota: '/simula-custo',
      score: weights.simula_inviavel ?? 0,
      produto: 'SimulaCusto',
    })
  }

  if (atencao > 0) {
    insights.push({
      id: 'simula_atencao',
      variante: 'default',
      tag: 'Atenção · SimulaCusto',
      texto: `${atencao} simulaç${atencao > 1 ? 'ões requerem' : 'ão requer'} atenção.`,
      stat: media > 0 ? { label: 'Média landed cost', valor: fmtBRL(media) } : undefined,
      textoLink: 'Ver simulações',
      rota: '/simula-custo',
      score: weights.simula_atencao ?? 0,
      produto: 'SimulaCusto',
    })
  }

  return insights
}

async function fetchLpcoInsights(
  ctx: ProductFetcherContext,
  role: HubUserRole,
): Promise<HubInsight[]> {
  const weights = HUB_ROLE_WEIGHTS[role] ?? HUB_ROLE_WEIGHTS.default
  const insights: HubInsight[] = []

  const data = await fetchProduct(
    `${getLpcoUrl()}/api/v1/lpcos/stats`,
    ctx,
  ) as Record<string, number>

  const suspensas = data.SUSPENSA ?? data.suspensa ?? 0

  if (suspensas > 0) {
    insights.push({
      id: 'lpco_suspensas',
      variante: 'warn',
      tag: 'Atenção · LPCO',
      texto: `${suspensas} licença${suspensas > 1 ? 's' : ''} suspensa${suspensas > 1 ? 's' : ''}. Regularize para retomar as operações de importação.`,
      textoLink: 'Ver licenças',
      rota: '/produto/lpco',
      score: weights.lpco_suspensas ?? 0,
      produto: 'LPCO',
    })
  }

  return insights
}

async function fetchNfImportInsights(
  ctx: ProductFetcherContext,
  role: HubUserRole,
): Promise<HubInsight[]> {
  const weights = HUB_ROLE_WEIGHTS[role] ?? HUB_ROLE_WEIGHTS.default
  const insights: HubInsight[] = []

  const data = await fetchProduct(
    `${getNfImportUrl()}/api/v1/nf-importacao/dashboard/kpis`,
    ctx,
  ) as { pendentes?: number; total?: number }

  const pendentes = data.pendentes ?? 0

  if (pendentes > 0) {
    insights.push({
      id: 'nf_pendentes',
      variante: 'warn',
      tag: 'Pendência · NF Importação',
      texto: `${pendentes} nota${pendentes > 1 ? 's' : ''} fiscal${pendentes > 1 ? 'is' : ''} de importação pendente${pendentes > 1 ? 's' : ''} de processamento.`,
      textoLink: 'Ver notas',
      rota: '/produto/nf-importacao',
      score: weights.nf_pendentes ?? 0,
      produto: 'NF Importação',
    })
  }

  return insights
}

// ── Feature discovery cards ─────────────────────────────────────────────────

function buildHubFeatureDiscovery(activeProducts: Set<string>): HubInsight[] {
  const features: HubInsight[] = []

  if (!activeProducts.has('simula-custo')) {
    features.push({
      id: 'feat_simula_custo',
      variante: 'default',
      tag: 'Sabia que você pode? · SimulaCusto',
      texto: 'Simule o custo total de importação antes de fechar negócio. Inclui impostos, frete, seguro e landed cost.',
      textoLink: 'Conhecer produto',
      rota: '/store',
      score: 8,
    })
  }

  if (!activeProducts.has('bid-cambio')) {
    features.push({
      id: 'feat_bid_cambio',
      variante: 'default',
      tag: 'Sabia que você pode? · BID Câmbio',
      texto: 'Compare taxas de câmbio de múltiplos bancos em tempo real e feche operações pelo melhor preço.',
      textoLink: 'Conhecer produto',
      rota: '/store',
      score: 7,
    })
  }

  if (!activeProducts.has('bid-frete')) {
    features.push({
      id: 'feat_bid_frete',
      variante: 'default',
      tag: 'Sabia que você pode? · BID Frete Internacional',
      texto: 'Receba cotações de frete internacional de múltiplos fornecedores e compare lado a lado.',
      textoLink: 'Conhecer produto',
      rota: '/store',
      score: 6,
    })
  }

  if (!activeProducts.has('pedido')) {
    features.push({
      id: 'feat_pedido',
      variante: 'default',
      tag: 'Sabia que você pode? · Pedido',
      texto: 'Gerencie todo o ciclo de importação: do pedido ao embarque, com kanban, transferências e dashboards.',
      textoLink: 'Conhecer produto',
      rota: '/store',
      score: 5,
    })
  }

  return features
}

// ── Fallback insights ───────────────────────────────────────────────────────

const FALLBACK_INSIGHTS: HubInsight[] = [
  {
    id: 'hub_status_ok',
    variante: 'default',
    tag: 'Status · Tudo em dia',
    texto: 'Nenhuma pendência identificada nos seus produtos. Operação normalizada.',
    score: 3,
  },
  {
    id: 'hub_dica_gabi',
    variante: 'default',
    tag: 'Dica · GABI AI',
    texto: 'A GABI monitora todos os seus produtos em tempo real e destaca o que precisa de atenção.',
    score: 2,
  },
  {
    id: 'hub_dica_store',
    variante: 'default',
    tag: 'Dica · Store de Módulos',
    texto: 'Ative novos produtos na Store para ampliar os insights da GABI com dados de toda sua operação COMEX.',
    textoLink: 'Explorar Store',
    rota: '/configurador/assinaturas',
    score: 1,
  },
  {
    id: 'hub_dica_configurador',
    variante: 'default',
    tag: 'Dica · Configurações',
    texto: 'Configure regras fiscais, permissões de equipe e preferências de workspace no Configurador.',
    textoLink: 'Configurar',
    rota: '/configurador/organizacao',
    score: 0,
  },
  {
    id: 'hub_dica_relatorios',
    variante: 'default',
    tag: 'Dica · Relatórios',
    texto: 'Gere relatórios consolidados com dados de todos os seus produtos. Exporte em PDF, CSV ou Excel.',
    textoLink: 'Ver relatórios',
    rota: '/configurador/financeiro',
    score: 0,
  },
]

// ── Contextual static insights (baseados em contexto, não em KPIs) ──────────

function buildContextInsights(
  activeProductKeys: Set<string>,
): HubInsight[] {
  const insights: HubInsight[] = []
  const count = activeProductKeys.size

  if (count > 0) {
    const nomes: string[] = []
    if (activeProductKeys.has('simula-custo')) nomes.push('SimulaCusto')
    if (activeProductKeys.has('bid-cambio')) nomes.push('BID Câmbio')
    if (activeProductKeys.has('bid-frete')) nomes.push('BID Frete Internacional')
    if (activeProductKeys.has('pedido')) nomes.push('Pedido')
    if (activeProductKeys.has('lpco')) nomes.push('LPCO')
    if (activeProductKeys.has('nf-importacao') || activeProductKeys.has('nf-import')) nomes.push('NF Import')

    insights.push({
      id: 'hub_produtos_ativos',
      variante: 'default',
      tag: 'Ecossistema · Gravity',
      texto: `Você tem ${count} produto${count > 1 ? 's' : ''} ativo${count > 1 ? 's' : ''}: ${nomes.join(', ')}. A GABI analisa todos em tempo real.`,
      textoLink: 'Gerenciar produtos',
      rota: '/configurador/assinaturas',
      score: 2,
    })
  }

  if (activeProductKeys.has('simula-custo') && activeProductKeys.has('bid-cambio')) {
    insights.push({
      id: 'hub_cross_simula_cambio',
      variante: 'default',
      tag: 'Integração · SimulaCusto + Câmbio',
      texto: 'SimulaCusto e BID Câmbio trabalham juntos: simule o custo total e feche câmbio pelo melhor preço, tudo integrado.',
      score: 1,
    })
  }

  if (activeProductKeys.has('pedido') && activeProductKeys.has('lpco')) {
    insights.push({
      id: 'hub_cross_pedido_lpco',
      variante: 'default',
      tag: 'Integração · Pedido + LPCO',
      texto: 'Seus pedidos de importação e licenças estão conectados. A GABI alerta sobre licenças que afetam pedidos em andamento.',
      score: 1,
    })
  }

  return insights
}

// ── Composição do carrossel (90% operacional · 10% plataforma) ──────────────

export type CategoriaInsightHub = 'operacional' | 'plataforma'

export function classificarInsightHub(insight: HubInsight): CategoriaInsightHub {
  if (insight.id.startsWith('feat_')) return 'plataforma'
  if (insight.id.startsWith('hub_dica_')) return 'plataforma'
  if (insight.id === 'hub_produtos_ativos' || insight.id.startsWith('hub_cross_')) return 'plataforma'
  return 'operacional'
}

function deduplicarInsightsPorId(insights: HubInsight[]): HubInsight[] {
  const vistos = new Set<string>()
  const out: HubInsight[] = []
  for (const ins of insights) {
    if (vistos.has(ins.id)) continue
    vistos.add(ins.id)
    out.push(ins)
  }
  return out
}

/** Dicas de uso da plataforma (Store, integrações, produtos não contratados). */
export function listarDicasPlataformaHub(chavesProdutos: Set<string>): HubInsight[] {
  return deduplicarInsightsPorId([
    ...buildHubFeatureDiscovery(chavesProdutos),
    ...buildContextInsights(chavesProdutos),
    ...FALLBACK_INSIGHTS.filter(f => f.id.startsWith('hub_dica_')),
  ]).sort((a, b) => b.score - a.score)
}

function calcularQuotaDicasPlataforma(tamanhoAlvo: number, dicasDisponiveis: number): number {
  if (dicasDisponiveis <= 0 || tamanhoAlvo <= 0) return 0
  if (tamanhoAlvo < 10) {
    return Math.min(dicasDisponiveis, Math.floor(tamanhoAlvo * FRACAO_DICAS_PLATAFORMA))
  }
  return Math.min(dicasDisponiveis, Math.max(1, Math.round(tamanhoAlvo * FRACAO_DICAS_PLATAFORMA)))
}

/** Intercala 1 dica a cada 9 operacionais (≈90/10). Dicas restantes vão ao final. */
export function intercalarInsightsHubOperacionaisDicas(
  operacionais: HubInsight[],
  dicas: HubInsight[],
): HubInsight[] {
  const result: HubInsight[] = []
  let dicaIdx = 0

  for (let i = 0; i < operacionais.length; i++) {
    result.push(operacionais[i]!)
    if ((i + 1) % INTERVALO_INSIGHT_OPERACIONAL === 0 && dicaIdx < dicas.length) {
      result.push(dicas[dicaIdx++]!)
    }
  }

  while (dicaIdx < dicas.length) {
    result.push(dicas[dicaIdx++]!)
  }

  return result
}

export function comporCarrosselInsightsHub(
  operacionaisBrutos: HubInsight[],
  chavesProdutos: Set<string>,
  opts: { algumProdutoRespondeu: boolean },
): HubInsight[] {
  const operacionais = deduplicarInsightsPorId(
    [...operacionaisBrutos].sort((a, b) => b.score - a.score),
  )

  if (operacionais.length === 0 && opts.algumProdutoRespondeu) {
    const statusOk = FALLBACK_INSIGHTS.find(f => f.id === 'hub_status_ok')
    if (statusOk) operacionais.push(statusOk)
  }

  const dicasPool = listarDicasPlataformaHub(chavesProdutos).filter(
    d => !operacionais.some(o => o.id === d.id),
  )

  const tamanhoAlvo = Math.min(
    MAX_INSIGHTS_HUB,
    Math.max(
      MIN_INSIGHTS_HUB,
      operacionais.length >= TARGET_INSIGHTS_HUB ? operacionais.length : TARGET_INSIGHTS_HUB,
    ),
  )

  const maxDicas = calcularQuotaDicasPlataforma(tamanhoAlvo, dicasPool.length)
  const qtdOperacional = Math.min(operacionais.length, Math.max(1, tamanhoAlvo - maxDicas))
  const reais = operacionais.slice(0, qtdOperacional)
  const dicas = dicasPool.slice(0, maxDicas)

  let result = intercalarInsightsHubOperacionaisDicas(reais, dicas)

  if (result.length < MIN_INSIGHTS_HUB) {
    const ids = new Set(result.map(r => r.id))
    const extrasOperacionais = operacionais
      .filter(o => !ids.has(o.id))
      .slice(0, MIN_INSIGHTS_HUB - result.length)
    result = [...result, ...extrasOperacionais]

  }

  return result.slice(0, MAX_INSIGHTS_HUB)
}

// ── Normalizar role ─────────────────────────────────────────────────────────

export function normalizeHubRole(raw: string | undefined): HubUserRole {
  if (!raw) return 'default'
  const lower = raw.toLowerCase()
  if (lower.includes('super_admin') || lower.includes('admin')) return 'admin'
  if (lower.includes('diretor') || lower.includes('director')) return 'diretor'
  if (lower.includes('gerente') || lower.includes('manager')) return 'gerente'
  if (lower.includes('operador') || lower.includes('operator') || lower.includes('padrao') || lower.includes('standard')) return 'operador'
  return 'default'
}

// ── Função principal ────────────────────────────────────────────────────────

/**
 * Gera insights cross-produto para o Hub.
 *
 * @param id_organizacao   - ID do tenant (obrigatório para isolamento)
 * @param id_usuario       - ID do usuário (para cache + personalização futura)
 * @param role             - Role canônico do usuário
 * @param activeProductKeys - Set de product_keys ativos para este tenant
 * @returns                - Lista ranqueada de insights, mínimo 4
 */
export async function generateHubInsights(
  id_organizacao: string,
  id_usuario: string,
  role: HubUserRole,
  activeProductKeys: Set<string>,
): Promise<HubInsight[]> {
  const chavesProdutos = normalizarChavesProdutosAtivosHub(activeProductKeys)

  // 1. Check cache
  const cached = getCached(id_organizacao, id_usuario)
  if (cached) return cached

  // 2. Build fetch context
  const ctx: ProductFetcherContext = {
    id_organizacao,
    id_usuario,
    role,
    token: '', // Inter-service: chave interna S2S (não JWT)
    internalKey: getChaveInterna(),
  }

  // 3. Build fetcher array based on active products
  const fetchers: Array<Promise<HubInsight[]>> = []

  if (chavesProdutos.has('pedido')) {
    fetchers.push(fetchPedidoInsights(ctx, role))
  }
  if (chavesProdutos.has('bid-cambio')) {
    fetchers.push(fetchBidCambioInsights(ctx, role))
  }
  if (chavesProdutos.has('bid-frete')) {
    fetchers.push(fetchBidFreteInsights(ctx, role))
  }
  if (chavesProdutos.has('simula-custo')) {
    fetchers.push(fetchSimulaCustoInsights(ctx, role))
  }
  if (chavesProdutos.has('lpco')) {
    fetchers.push(fetchLpcoInsights(ctx, role))
  }
  if (chavesProdutos.has('nf-importacao') || chavesProdutos.has('nf-import')) {
    fetchers.push(fetchNfImportInsights(ctx, role))
  }

  // 4. Execute in parallel with resilience (Promise.allSettled)
  const results = await Promise.allSettled(fetchers)
  const algumProdutoRespondeu = results.some(r => r.status === 'fulfilled')

  const insightsOperacionais: HubInsight[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      insightsOperacionais.push(...result.value)
    }
    // rejected → silently skip (resilience pattern)
  }

  // 5. Compor carrossel: ~90% operacional (KPIs/alertas) · ~10% dicas de plataforma
  let result = comporCarrosselInsightsHub(insightsOperacionais, chavesProdutos, {
    algumProdutoRespondeu,
  })

  // 6. Cache with tenant isolation
  setCache(id_organizacao, id_usuario, result)

  return result
}

// ── Export para testes ───────────────────────────────────────────────────────

export const _testExports = {
  insightsCache,
  getCached,
  setCache,
  CACHE_TTL_MS,
  HUB_ROLE_WEIGHTS,
  FALLBACK_INSIGHTS,
  normalizarChavesProdutosAtivosHub,
  classificarInsightHub,
  listarDicasPlataformaHub,
  intercalarInsightsHubOperacionaisDicas,
  comporCarrosselInsightsHub,
  buildHubFeatureDiscovery,
  buildContextInsights,
  fetchPedidoInsights,
  fetchBidCambioInsights,
  fetchBidFreteInsights,
  fetchSimulaCustoInsights,
  fetchLpcoInsights,
  fetchNfImportInsights,
}
