/**
 * Agregações dos gráficos da visão Insights (cliente).
 * Fonte: cotações do tenant filtradas por workspace.
 */

const MESES_CURTOS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const

const STATUS_APROVADAS = new Set(['APROVADA'])
const STATUS_ANDAMENTO = new Set([
  'RASCUNHO',
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'FALTA_INFORMACAO',
])
const STATUS_RECUSADAS = new Set(['REPROVADA', 'CANCELADA', 'EXPIRADA'])

const CORES_MODAL_PADRAO: Record<string, string> = {
  MARITIMO: '#34d399',
  AEREO: '#a78bfa',
  RODOVIARIO: '#fbbf24',
}

export type BucketStatusCotacaoInsights = 'aprovadas' | 'andamento' | 'recusadas'

export function classificarBucketStatusCotacaoInsights(
  status: string,
): BucketStatusCotacaoInsights | null {
  if (STATUS_APROVADAS.has(status)) return 'aprovadas'
  if (STATUS_ANDAMENTO.has(status)) return 'andamento'
  if (STATUS_RECUSADAS.has(status)) return 'recusadas'
  return null
}

export type CotacaoParaInsightsGraficos = {
  status_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: string
  incoterm_cotacao_bid_frete_internacional: string
  data_criacao_cotacao_bid_frete_internacional: Date
  data_aprovacao_cotacao_bid_frete_internacional: Date | null
  numero_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  origem_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  ganho_valor_cotacao_bid_frete_internacional: number | null
  ganho_percentual_cotacao_bid_frete_internacional: number | null
  valor_aprovado_ganho_bid_frete_internacional: number | null
  fornecedor_vencedor: { nome_fornecedor_bid_frete_internacional: string } | null
  proposta_aprovada: {
    valor_total_proposta_bid_frete_internacional: number
    dias_transito_proposta_bid_frete_internacional: number
    fornecedor: { nome_fornecedor_bid_frete_internacional: string } | null
  } | null
}

export type MesCotacoesInsights = {
  mes: string
  chave_mes: string
  aprovadas: number
  andamento: number
  recusadas: number
}

export type ModalDistribuicaoInsights = {
  modal_cotacao_bid_frete_internacional: string
  count: number
  pct: number
  cor: string
}

export type IncotermRankingInsights = {
  incoterm_cotacao_bid_frete_internacional: string
  count: number
  pct: number
}

export type MelhorCotacaoMesInsights = {
  numero_cotacao_bid_frete_internacional: string
  origem: string
  destino: string
  modal_cotacao_bid_frete_internacional: string
  saving_pct: number
  ganho_valor_cotacao_bid_frete_internacional: number
  valor_aprovado_ganho_bid_frete_internacional: number
  fornecedor: string
  transit_time: number | null
}

export type InsightsGraficosBidFreteInternacional = {
  total_cotacoes: number
  cotacoes_por_mes: MesCotacoesInsights[]
  distribuicao_modal: ModalDistribuicaoInsights[]
  top_incoterms: IncotermRankingInsights[]
  melhor_cotacao_mes: MelhorCotacaoMesInsights | null
}

function chaveMesUtc(data: Date): string {
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}`
}

function rotuloMesPt(chave: string): string {
  const [, mesStr] = chave.split('-')
  const idx = Number(mesStr) - 1
  return MESES_CURTOS_PT[idx] ?? chave
}

function ultimosSeisMesesChaves(agora: Date): string[] {
  const chaves: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - i, 1))
    chaves.push(chaveMesUtc(d))
  }
  return chaves
}

function montarCotacoesPorMes(
  cotacoes: CotacaoParaInsightsGraficos[],
  agora: Date,
): MesCotacoesInsights[] {
  const chaves = ultimosSeisMesesChaves(agora)
  const acumulado = new Map<string, { aprovadas: number; andamento: number; recusadas: number }>()
  for (const chave of chaves) {
    acumulado.set(chave, { aprovadas: 0, andamento: 0, recusadas: 0 })
  }

  for (const c of cotacoes) {
    const chave = chaveMesUtc(c.data_criacao_cotacao_bid_frete_internacional)
    const bucket = acumulado.get(chave)
    if (!bucket) continue
    const grupo = classificarBucketStatusCotacaoInsights(c.status_cotacao_bid_frete_internacional)
    if (!grupo) continue
    bucket[grupo] += 1
  }

  return chaves.map(chave => {
    const b = acumulado.get(chave) ?? { aprovadas: 0, andamento: 0, recusadas: 0 }
    return {
      mes: rotuloMesPt(chave),
      chave_mes: chave,
      aprovadas: b.aprovadas,
      andamento: b.andamento,
      recusadas: b.recusadas,
    }
  })
}

function montarDistribuicaoModal(cotacoes: CotacaoParaInsightsGraficos[]): ModalDistribuicaoInsights[] {
  const contagem = new Map<string, number>()
  for (const c of cotacoes) {
    const modal = c.modal_cotacao_bid_frete_internacional || 'MARITIMO'
    contagem.set(modal, (contagem.get(modal) ?? 0) + 1)
  }
  const total = cotacoes.length
  if (total === 0) return []

  return [...contagem.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([modal, count]) => ({
      modal_cotacao_bid_frete_internacional: modal,
      count,
      pct: Math.round((count / total) * 100),
      cor: CORES_MODAL_PADRAO[modal] ?? '#94a3b8',
    }))
}

function montarTopIncoterms(cotacoes: CotacaoParaInsightsGraficos[]): IncotermRankingInsights[] {
  const contagem = new Map<string, number>()
  for (const c of cotacoes) {
    const inc = (c.incoterm_cotacao_bid_frete_internacional || '').trim().toUpperCase()
    if (!inc) continue
    contagem.set(inc, (contagem.get(inc) ?? 0) + 1)
  }
  const total = [...contagem.values()].reduce((a, b) => a + b, 0)
  if (total === 0) return []

  return [...contagem.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([incoterm, count]) => ({
      incoterm_cotacao_bid_frete_internacional: incoterm,
      count,
      pct: Math.round((count / total) * 100),
    }))
}

function montarMelhorCotacaoMes(
  cotacoes: CotacaoParaInsightsGraficos[],
  agora: Date,
): MelhorCotacaoMesInsights | null {
  const inicioMes = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), 1))
  const candidatas = cotacoes.filter(c => {
    if (c.status_cotacao_bid_frete_internacional !== 'APROVADA') return false
    const ref = c.data_aprovacao_cotacao_bid_frete_internacional ?? c.data_criacao_cotacao_bid_frete_internacional
    return ref >= inicioMes
  })

  if (candidatas.length === 0) return null

  const ordenadas = [...candidatas].sort((a, b) => {
    const pctA = a.ganho_percentual_cotacao_bid_frete_internacional ?? 0
    const pctB = b.ganho_percentual_cotacao_bid_frete_internacional ?? 0
    if (pctB !== pctA) return pctB - pctA
    const valA = a.ganho_valor_cotacao_bid_frete_internacional ?? 0
    const valB = b.ganho_valor_cotacao_bid_frete_internacional ?? 0
    return valB - valA
  })

  const melhor = ordenadas[0]
  const fornecedor =
    melhor.proposta_aprovada?.fornecedor?.nome_fornecedor_bid_frete_internacional
    ?? melhor.fornecedor_vencedor?.nome_fornecedor_bid_frete_internacional
    ?? '—'

  const origem = melhor.origem_codigo_cotacao_bid_frete_internacional
    ? `${melhor.origem_nome_cotacao_bid_frete_internacional} (${melhor.origem_codigo_cotacao_bid_frete_internacional})`
    : melhor.origem_nome_cotacao_bid_frete_internacional

  const destino = melhor.destino_codigo_cotacao_bid_frete_internacional
    ? `${melhor.destino_nome_cotacao_bid_frete_internacional} (${melhor.destino_codigo_cotacao_bid_frete_internacional})`
    : melhor.destino_nome_cotacao_bid_frete_internacional

  return {
    numero_cotacao_bid_frete_internacional: melhor.numero_cotacao_bid_frete_internacional,
    origem,
    destino,
    modal_cotacao_bid_frete_internacional: melhor.modal_cotacao_bid_frete_internacional,
    saving_pct: Math.round((melhor.ganho_percentual_cotacao_bid_frete_internacional ?? 0) * 10) / 10,
    ganho_valor_cotacao_bid_frete_internacional: melhor.ganho_valor_cotacao_bid_frete_internacional ?? 0,
    valor_aprovado_ganho_bid_frete_internacional:
      melhor.proposta_aprovada?.valor_total_proposta_bid_frete_internacional ?? 0,
    fornecedor,
    transit_time: melhor.proposta_aprovada?.dias_transito_proposta_bid_frete_internacional ?? null,
  }
}

export function agregarInsightsGraficosBidFreteInternacional(
  cotacoes: CotacaoParaInsightsGraficos[],
  agora: Date = new Date(),
): InsightsGraficosBidFreteInternacional {
  return {
    total_cotacoes: cotacoes.length,
    cotacoes_por_mes: montarCotacoesPorMes(cotacoes, agora),
    distribuicao_modal: montarDistribuicaoModal(cotacoes),
    top_incoterms: montarTopIncoterms(cotacoes),
    melhor_cotacao_mes: montarMelhorCotacaoMes(cotacoes, agora),
  }
}
