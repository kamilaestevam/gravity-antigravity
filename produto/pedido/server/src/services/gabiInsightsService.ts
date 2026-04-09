/**
 * gabiInsightsService.ts — Motor de Insights da Gabi para o Dashboard Pedido
 *
 * Fase 1: Templates por role — gera insights ranqueados com base em KPIs + role do usuário
 * Fase 2: Integra scores de comportamento para re-ranquear (via behaviorTrackingService)
 * Fase 3: Enriquece texto via LLM (gabiLlmInsightsService) com fallback determinístico
 *
 * Regras:
 *  - Sempre retorna no mínimo 2 insights
 *  - Nunca expõe dados de outro tenant
 *  - Fallback seguro se LLM falhar ou exceder quota
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface KpiSnapshot {
  total_pedidos: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  pedidos_atrasados: number
  pedidos_sem_exportador: number
  pedidos_cancelados: number
  pedidos_consolidados: number
  pedidos_importacao: number
  pedidos_exportacao: number
  qtd_saldo_total: number
  qtd_pronta_total: number
  qtd_transferida_total: number
  qtd_inicial_total: number
  valor_total: number
  valor_itens_total: number
  ticket_medio: number
  taxa_atraso: number
  taxa_transferencia: number
}

export type UserRole = 'operador' | 'gerente' | 'diretor' | 'admin' | 'default'

export interface GabiInsight {
  id: string
  variante: 'default' | 'warn'
  tag: string
  /** Texto em linguagem natural — substituído pelo LLM na Fase 3 */
  texto: string
  stat?: { label: string; valor: string }
  textoLink?: string
  /** Rota para navegação — inclui filtros pré-aplicados */
  rota?: string
  /** Score de relevância para ranking (maior = mais relevante) */
  score: number
}

// ── Pesos de relevância por role ──────────────────────────────────────────────
// Cada role tem um mapa: insightId → peso base
// Fase 2: scores de comportamento multiplicam esses pesos

const ROLE_WEIGHTS: Record<UserRole, Record<string, number>> = {
  operador: {
    atrasados:      100,
    sem_exportador:  90,
    qtd_pronta:      80,
    abertos:         70,
    financeiro:      20,
    distribuicao:    10,
    cancelados:      60,
    tendencia:       15,
  },
  gerente: {
    atrasados:       80,
    financeiro:     100,
    sem_exportador:  70,
    abertos:         60,
    qtd_pronta:      50,
    distribuicao:    40,
    cancelados:      65,
    tendencia:       55,
  },
  diretor: {
    financeiro:     100,
    distribuicao:    90,
    tendencia:       85,
    atrasados:       60,
    abertos:         40,
    qtd_pronta:      30,
    sem_exportador:  50,
    cancelados:      45,
  },
  admin: {
    atrasados:      100,
    financeiro:     100,
    distribuicao:   100,
    sem_exportador: 100,
    abertos:        100,
    qtd_pronta:     100,
    cancelados:     100,
    tendencia:      100,
  },
  default: {
    atrasados:       80,
    financeiro:      60,
    sem_exportador:  70,
    abertos:         70,
    qtd_pronta:      50,
    distribuicao:    40,
    cancelados:      50,
    tendencia:       40,
  },
}

// ── Formatadores ──────────────────────────────────────────────────────────────

const fmtNum = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n))
const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`

// ── Candidatos de insight (todos possíveis) ───────────────────────────────────

function buildCandidates(kpis: KpiSnapshot, role: UserRole): GabiInsight[] {
  const weights = ROLE_WEIGHTS[role] ?? ROLE_WEIGHTS.default
  const candidates: GabiInsight[] = []

  // ── ATRASADOS ─────────────────────────────────────────────────────────────
  if (kpis.pedidos_atrasados > 0) {
    candidates.push({
      id: 'atrasados',
      variante: 'warn',
      tag: 'Atenção · Pedidos Atrasados',
      texto: `${kpis.pedidos_atrasados} pedido${kpis.pedidos_atrasados > 1 ? 's' : ''} com prazo vencido. Ação imediata recomendada.`,
      stat: { label: 'Taxa de atraso', valor: fmtPct(kpis.taxa_atraso) },
      textoLink: 'Ver atrasados',
      rota: '/pedidos/lista?status=atrasado',
      score: weights.atrasados ?? 0,
    })
  }

  // ── SEM EXPORTADOR ────────────────────────────────────────────────────────
  if (kpis.pedidos_sem_exportador > 0) {
    candidates.push({
      id: 'sem_exportador',
      variante: 'warn',
      tag: 'Atenção · Sem Exportador',
      texto: `${kpis.pedidos_sem_exportador} pedido${kpis.pedidos_sem_exportador > 1 ? 's' : ''} sem exportador vinculado. Bloqueio de faturamento em risco.`,
      textoLink: 'Corrigir agora',
      rota: '/pedidos/lista?sem_exportador=true',
      score: weights.sem_exportador ?? 0,
    })
  }

  // ── ABERTOS / TRANSFERÊNCIA ────────────────────────────────────────────────
  if (kpis.pedidos_abertos > 0) {
    candidates.push({
      id: 'abertos',
      variante: 'default',
      tag: 'Oportunidade · Transferência',
      texto: `${kpis.pedidos_abertos} pedido${kpis.pedidos_abertos > 1 ? 's' : ''} em aberto prontos para iniciar transferência.`,
      stat: kpis.qtd_transferida_total > 0
        ? { label: 'Qtd. já transferida', valor: fmtNum(kpis.qtd_transferida_total) }
        : undefined,
      textoLink: 'Ver pedidos',
      rota: '/pedidos/lista?status=aberto',
      score: weights.abertos ?? 0,
    })
  }

  // ── QTD PRONTA / EMBARQUE ─────────────────────────────────────────────────
  if (kpis.qtd_pronta_total > 0) {
    candidates.push({
      id: 'qtd_pronta',
      variante: 'default',
      tag: 'Operação · Qtd. Pronta',
      texto: `${fmtNum(kpis.qtd_pronta_total)} unidades prontas disponíveis para embarque imediato.`,
      stat: kpis.qtd_saldo_total > 0
        ? { label: 'Saldo total disponível', valor: fmtNum(kpis.qtd_saldo_total) }
        : undefined,
      score: weights.qtd_pronta ?? 0,
    })
  }

  // ── FINANCEIRO ────────────────────────────────────────────────────────────
  if (kpis.valor_total > 0) {
    candidates.push({
      id: 'financeiro',
      variante: 'default',
      tag: 'Financeiro · Carteira',
      texto: `Carteira do período totaliza ${fmtBRL(kpis.valor_total)} em pedidos.`,
      stat: kpis.ticket_medio > 0
        ? { label: 'Ticket médio por pedido', valor: fmtBRL(kpis.ticket_medio) }
        : undefined,
      score: weights.financeiro ?? 0,
    })
  }

  // ── DISTRIBUIÇÃO IMP/EXP ──────────────────────────────────────────────────
  const totalOps = kpis.pedidos_importacao + kpis.pedidos_exportacao
  if (totalOps > 0) {
    const pctImp = Math.round((kpis.pedidos_importacao / totalOps) * 100)
    candidates.push({
      id: 'distribuicao',
      variante: 'default',
      tag: 'Análise · Imp. vs Exp.',
      texto: `${pctImp}% das operações são importações e ${100 - pctImp}% exportações no período.`,
      stat: { label: 'Total de operações', valor: fmtNum(totalOps) },
      score: weights.distribuicao ?? 0,
    })
  }

  // ── CANCELADOS ────────────────────────────────────────────────────────────
  if (kpis.pedidos_cancelados > 0 && kpis.total_pedidos > 0) {
    const pctCancel = ((kpis.pedidos_cancelados / kpis.total_pedidos) * 100).toFixed(1)
    candidates.push({
      id: 'cancelados',
      variante: kpis.pedidos_cancelados / kpis.total_pedidos > 0.1 ? 'warn' : 'default',
      tag: 'Alerta · Cancelamentos',
      texto: `${kpis.pedidos_cancelados} pedido${kpis.pedidos_cancelados > 1 ? 's' : ''} cancelado${kpis.pedidos_cancelados > 1 ? 's' : ''} no período (${pctCancel}% do total).`,
      stat: { label: 'Total no período', valor: fmtNum(kpis.total_pedidos) },
      textoLink: 'Ver cancelados',
      rota: '/pedidos/lista?status=cancelado',
      score: weights.cancelados ?? 0,
    })
  }

  return candidates
}

// ── Padding — garante mínimo de 2 insights ────────────────────────────────────

const FALLBACK_INSIGHTS: GabiInsight[] = [
  {
    id: 'status_ok',
    variante: 'default',
    tag: 'Status · Tudo em dia',
    texto: 'Nenhuma pendência identificada. Operação normalizada no período selecionado.',
    score: 1,
  },
  {
    id: 'dica_periodo',
    variante: 'default',
    tag: 'Dica · Gabi AI',
    texto: 'Use o filtro de período para explorar tendências históricas dos seus pedidos.',
    textoLink: 'Explorar dados',
    rota: '/pedidos/dashboard',
    score: 0,
  },
]

// ── Função principal ──────────────────────────────────────────────────────────

/**
 * Gera lista de insights ranqueados para exibição no carrossel do Dashboard.
 *
 * @param kpis       - Snapshot de KPIs do período
 * @param role       - Role do usuário (determina pesos de relevância)
 * @param behaviorScores - (Fase 2) Scores de comportamento por insightId → multiplicador
 * @returns          - Insights ordenados por score decrescente, mínimo 2
 */
export function generateInsights(
  kpis: KpiSnapshot,
  role: UserRole = 'default',
  behaviorScores: Record<string, number> = {},
): GabiInsight[] {
  const candidates = buildCandidates(kpis, role)

  // Fase 2: multiplica score base pelo multiplicador de comportamento (1.0 se não houver)
  const scored = candidates.map(ins => ({
    ...ins,
    score: ins.score * (behaviorScores[ins.id] ?? 1.0),
  }))

  // Ordena por score decrescente
  scored.sort((a, b) => b.score - a.score)

  // Garante mínimo de 2 insights
  if (scored.length === 0) return [...FALLBACK_INSIGHTS]
  if (scored.length === 1) return [scored[0]!, ...FALLBACK_INSIGHTS.slice(1)]

  return scored
}

/**
 * Normaliza o role recebido para os valores suportados.
 * Headers HTTP podem trazer valores variados — normalizamos aqui.
 */
export function normalizeRole(raw: string | undefined): UserRole {
  if (!raw) return 'default'
  const lower = raw.toLowerCase()
  if (lower.includes('diretor') || lower.includes('director')) return 'diretor'
  if (lower.includes('gerente') || lower.includes('manager'))   return 'gerente'
  if (lower.includes('admin'))                                   return 'admin'
  if (lower.includes('operador') || lower.includes('operator')) return 'operador'
  return 'default'
}
