/**
 * dados-dashboard-simulador-bid-frete.ts — KPIs, trend, GABI insights e
 * contagens de status do Dashboard do simulador BID Frete Internacional.
 * Espelha o contrato da API real (DashboardKpis/DashboardTrendBucket) a partir
 * das cotações mock do escopo.
 */

import type { TFunction } from 'i18next'
import type {
  DashboardWidgetConfig,
  DerivedMetric,
  EnrichedCatalogField,
  PeriodOption,
} from '../../../Dashboard/dashboard-global/src/index'
import { generateSuggestions as generateSuggestionsNucleo } from '../../../Dashboard/dashboard-global/src/index'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  STATUS_SIMULADOR_BID_FRETE,
  agregarInsightsBidFreteEmpresasSimulador,
  listarCotacoesEmpresasSimuladorBidFrete,
  savingsCotacaoSimuladorBidFrete,
  type CotacaoSimuladorBidFrete,
  type StatusCotacaoSimuladorBidFrete,
} from './dados-simulador-bid-frete'
import { CATALOGO_DASHBOARD_SIMULADOR_BID_FRETE } from './catalogo-dashboard-simulador-bid-frete'

// ─── Contratos (paridade com shared/api.ts do produto real) ──────────────────

export type DashboardKpisBidFreteSimulador = {
  period: string
  saving_total: number
  valor_medio_ganho_bid_frete_internacional: number
  transit_time: number
  ganho_percentual_ganho_bid_frete_internacional: number
  cotacoes_andamento: number
  cotacoes_passadas: number
  valor_andamento_usd: number
  valor_aprovado_usd: number
  volume_mensal: number
  cotacoes_status: Record<string, number>
  [key: string]: number | string | Record<string, number>
}

export type DashboardTrendBucketBidFreteSimulador = {
  month: string
  label: string
  volume_mensal: number
  saving_total: number
  valor_aprovado_usd: number
  valor_andamento_usd: number
  valor_medio_ganho_bid_frete_internacional: number
  ganho_percentual_ganho_bid_frete_internacional: number
  cotacoes_andamento: number
  cotacoes_passadas: number
  transit_time: number
  [key: string]: string | number
}

export type GabiInsightItemBidFreteSimulador = {
  id: string
  variante: 'default' | 'warn'
  tag: string
  texto: string
  stat?: { label: string; valor: string }
  textoLink?: string
}

// ─── Status da toolbar (paridade com dashboard.tsx real) ─────────────────────

export const STATUS_OPTIONS_BID_FRETE = [
  'rascunho',
  'em_cotacao',
  'aguardando_aprovacao',
  'aprovada',
] as const

export const STATUS_LABELS_BID_FRETE: Record<string, string> = {
  rascunho: 'Rascunho',
  em_cotacao: 'Em Cotação',
  aguardando_aprovacao: 'Aguardando Aprovação',
  aprovada: 'Aprovada',
}

const STATUS_COLORS_HEX: Record<string, string> = {
  rascunho: '#94a3b8',
  em_cotacao: '#818cf8',
  aguardando_aprovacao: '#fbbf24',
  aprovada: '#22c55e',
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export const STATUS_ACTIVE_COLORS_BID_FRETE: Record<string, { bg: string; border: string; text: string }> =
  Object.fromEntries(
    STATUS_OPTIONS_BID_FRETE.map(opt => {
      const cor = STATUS_COLORS_HEX[opt] ?? '#94a3b8'
      return [opt, { bg: hexToRgba(cor, 0.15), border: cor, text: cor }]
    }),
  )

/** Rótulos das fatias do gráfico "Cotações por Status" (chaves da API real). */
export const STATUS_SLICE_LABELS_BID_FRETE: Record<string, string> = Object.fromEntries(
  (Object.keys(STATUS_SIMULADOR_BID_FRETE) as StatusCotacaoSimuladorBidFrete[]).map(status => [
    status,
    STATUS_SIMULADOR_BID_FRETE[status].rotulo,
  ]),
)

// ─── Métricas derivadas (paridade com derivedMetrics.ts real) ────────────────

export const BUILT_IN_DERIVED_BID_FRETE: DerivedMetric[] = [
  {
    id: 'saving_medio_por_cotacao',
    label: 'Saving Médio por Cotação',
    description: 'Valor médio economizado por cotação finalizada no período',
    inputFields: ['saving_total', 'cotacoes_passadas'],
    operation: 'RATIO',
    formula: ({ saving_total, cotacoes_passadas }) =>
      cotacoes_passadas > 0 ? saving_total / cotacoes_passadas : null,
    fieldType: 'currency',
  },
  {
    id: 'taxa_conclusao_cotacoes',
    label: 'Taxa de Conclusão de Cotações',
    description: 'Percentual de cotações passadas em relação ao total (andamento + passadas)',
    inputFields: ['cotacoes_passadas', 'cotacoes_andamento'],
    operation: 'CUSTOM',
    formula: ({ cotacoes_passadas, cotacoes_andamento }) => {
      const total = cotacoes_passadas + cotacoes_andamento
      return total > 0 ? (cotacoes_passadas / total) * 100 : null
    },
    fieldType: 'percentage',
  },
  {
    id: 'ticket_medio_aprovado',
    label: 'Ticket Médio Aprovado',
    description: 'Valor médio das propostas aprovadas',
    inputFields: ['valor_aprovado_usd', 'cotacoes_passadas'],
    operation: 'RATIO',
    formula: ({ valor_aprovado_usd, cotacoes_passadas }) =>
      cotacoes_passadas > 0 ? valor_aprovado_usd / cotacoes_passadas : null,
    fieldType: 'currency',
  },
]

export function computeDerivedBidFrete(
  metric: DerivedMetric,
  values: Record<string, number>,
): number | null {
  try {
    return metric.formula(values)
  } catch {
    return null
  }
}

// ─── KPIs do escopo ──────────────────────────────────────────────────────────

const FATOR_PERIODO: Record<string, number> = {
  tudo: 2.6,
  '7d': 0.3,
  '30d': 1,
  '6m': 1.9,
  '1a': 2.4,
  '90d': 1.5,
  '12m': 2.2,
  current_month: 0.4,
  current_year: 2,
  ytd: 1.9,
}

function escalaPeriodo(period: string): number {
  if (period.startsWith('custom:')) return 1
  return FATOR_PERIODO[period] ?? 1
}

function statusParaSlugToolbar(status: StatusCotacaoSimuladorBidFrete): string | null {
  if (status === 'RASCUNHO') return 'rascunho'
  if (status === 'ENVIADA_FORNECEDORES' || status === 'EM_COTACAO') return 'em_cotacao'
  if (status === 'AGUARDANDO_APROVACAO') return 'aguardando_aprovacao'
  if (status === 'APROVADA') return 'aprovada'
  return null
}

function filtrarCotacoesPorStatus(
  cotacoes: CotacaoSimuladorBidFrete[],
  statusFiltro: string[],
): CotacaoSimuladorBidFrete[] {
  if (statusFiltro.length === 0) return cotacoes
  return cotacoes.filter(c => {
    const slug = statusParaSlugToolbar(c.status)
    return slug != null && statusFiltro.includes(slug)
  })
}

export function buildDashboardKpisBidFreteSimulador(
  empresas: PerfilEmpresaSimulador[],
  period: string,
  statusFiltro: string[] = [],
): DashboardKpisBidFreteSimulador {
  const todas = listarCotacoesEmpresasSimuladorBidFrete(empresas)
  const cotacoes = filtrarCotacoesPorStatus(todas, statusFiltro)
  const fator = escalaPeriodo(period)

  const aprovadas = cotacoes.filter(c => c.status === 'APROVADA')
  const reprovadas = cotacoes.filter(c => c.status === 'REPROVADA')
  const andamento = cotacoes.filter(
    c => c.status === 'ENVIADA_FORNECEDORES' || c.status === 'EM_COTACAO' || c.status === 'AGUARDANDO_APROVACAO',
  )

  const savingTotal = aprovadas.reduce((s, c) => s + (savingsCotacaoSimuladorBidFrete(c) ?? 0), 0)
  const valorAprovado = aprovadas.reduce((s, c) => s + (c.melhorLanceUsd ?? 0), 0)
  const valorAndamento = andamento.reduce((s, c) => s + c.valorMetaUsd, 0)

  const ganhosPct = aprovadas
    .map(c => {
      const savings = savingsCotacaoSimuladorBidFrete(c)
      return savings != null && c.valorMetaUsd > 0 ? (savings / c.valorMetaUsd) * 100 : null
    })
    .filter((v): v is number => v != null)
  const ganhoPercentualMedio = ganhosPct.length > 0
    ? ganhosPct.reduce((s, v) => s + v, 0) / ganhosPct.length
    : 0

  const transitTimes = cotacoes
    .map(c => c.transitTimeDias)
    .filter((v): v is number => v != null)
  const transitTimeMedio = transitTimes.length > 0
    ? transitTimes.reduce((s, v) => s + v, 0) / transitTimes.length
    : 0

  const cotacoesPassadas = Math.round((aprovadas.length + reprovadas.length) * fator)
  const cotacoesStatus: Record<string, number> = {}
  for (const status of Object.keys(STATUS_SIMULADOR_BID_FRETE) as StatusCotacaoSimuladorBidFrete[]) {
    const count = cotacoes.filter(c => c.status === status).length
    cotacoesStatus[status] = status === 'APROVADA' || status === 'REPROVADA'
      ? Math.round(count * fator)
      : count
  }

  return {
    period,
    saving_total: Math.round(savingTotal * fator),
    valor_medio_ganho_bid_frete_internacional: aprovadas.length > 0 ? Math.round(valorAprovado / aprovadas.length) : 0,
    transit_time: Math.round(transitTimeMedio * 10) / 10,
    ganho_percentual_ganho_bid_frete_internacional: Math.round(ganhoPercentualMedio * 10) / 10,
    cotacoes_andamento: andamento.length,
    cotacoes_passadas: cotacoesPassadas,
    valor_andamento_usd: Math.round(valorAndamento),
    valor_aprovado_usd: Math.round(valorAprovado * fator),
    volume_mensal: Math.max(1, Math.round(cotacoes.length * fator)),
    cotacoes_status: cotacoesStatus,
  }
}

// ─── Trend mensal (12m) ──────────────────────────────────────────────────────

export function buildTrendBucketsBidFreteSimulador(
  empresas: PerfilEmpresaSimulador[],
): DashboardTrendBucketBidFreteSimulador[] {
  const insights = agregarInsightsBidFreteEmpresasSimulador(empresas)
  return insights.cotacoesPorMes.map((mes, idx) => {
    const passadas = mes.aprovadas + mes.recusadas
    return {
      month: mes.mes,
      label: mes.mes,
      volume_mensal: mes.total,
      saving_total: mes.aprovadas * 820,
      valor_aprovado_usd: mes.aprovadas * 9800,
      valor_andamento_usd: mes.emAndamento * 11600,
      valor_medio_ganho_bid_frete_internacional: mes.aprovadas > 0 ? 9800 : 0,
      ganho_percentual_ganho_bid_frete_internacional: mes.aprovadas > 0 ? 11 + (idx % 3) : 0,
      cotacoes_andamento: mes.emAndamento,
      cotacoes_passadas: passadas,
      transit_time: 24 + (idx % 4) * 2,
    }
  })
}

// ─── GABI insights (paridade com dashboard-operacional-insights.ts) ──────────

const fmtNum = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n))
const fmtUSD = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`

export function buildInsightsGabiBidFreteSimulador(
  kpis: DashboardKpisBidFreteSimulador,
  prev?: DashboardKpisBidFreteSimulador | null,
): GabiInsightItemBidFreteSimulador[] {
  const items: GabiInsightItemBidFreteSimulador[] = []

  const rascunhosCount = Number(kpis.cotacoes_status['RASCUNHO'] ?? 0)
  if (rascunhosCount > 0) {
    items.push({
      id: 'rascunhos_ativos',
      variante: 'warn',
      tag: 'Atenção · Rascunhos Pendentes',
      texto: `${rascunhosCount} cotação${rascunhosCount > 1 ? 's' : ''} em rascunho. Finalize e envie para negociação de frete.`,
      stat: { label: 'Em rascunho', valor: fmtNum(rascunhosCount) },
      textoLink: 'Ver cotações',
    })
  }

  if (kpis.cotacoes_andamento > 0) {
    items.push({
      id: 'cotacoes_andamento',
      variante: 'default',
      tag: 'Operacional · Em Cotação',
      texto: `${kpis.cotacoes_andamento} rodada${kpis.cotacoes_andamento > 1 ? 's' : ''} de cotação de frete ativa${kpis.cotacoes_andamento > 1 ? 's' : ''} no mercado.`,
      stat: kpis.valor_andamento_usd > 0
        ? { label: 'Valor em cotação', valor: fmtUSD(kpis.valor_andamento_usd) }
        : { label: 'Cotações ativas', valor: fmtNum(kpis.cotacoes_andamento) },
      textoLink: 'Acompanhar BIDs',
    })
  }

  if (kpis.saving_total > 0) {
    items.push({
      id: 'saving_total',
      variante: 'default',
      tag: 'Financeiro · Saving Acumulado',
      texto: `Economia gerada (saving) nas negociações de frete acumulada em ${fmtUSD(kpis.saving_total)}.`,
      stat: kpis.ganho_percentual_ganho_bid_frete_internacional > 0
        ? { label: 'Redução média', valor: fmtPct(kpis.ganho_percentual_ganho_bid_frete_internacional) }
        : { label: 'Total economizado', valor: fmtUSD(kpis.saving_total) },
      textoLink: 'Ver comparativos',
    })
  }

  if (kpis.valor_aprovado_usd > 0) {
    items.push({
      id: 'valor_aprovado',
      variante: 'default',
      tag: 'Financeiro · Adjudicado',
      texto: `Adjudicação de frete internacional totaliza ${fmtUSD(kpis.valor_aprovado_usd)} em propostas aprovadas.`,
      stat: kpis.valor_medio_ganho_bid_frete_internacional > 0
        ? { label: 'Ticket médio ganho', valor: fmtUSD(kpis.valor_medio_ganho_bid_frete_internacional) }
        : undefined,
      textoLink: 'Ver adjudicadas',
    })
  }

  if (prev && prev.cotacoes_passadas > 0 && kpis.cotacoes_passadas > 0) {
    const delta = kpis.cotacoes_passadas - prev.cotacoes_passadas
    if (Math.abs(delta) > 0) {
      const pct = Math.abs((delta / prev.cotacoes_passadas) * 100)
      const crescendo = delta > 0
      items.push({
        id: 'tendencia_volume',
        variante: 'default',
        tag: 'Tendência · BIDs Fechados',
        texto: `Volume de cotações adjudicadas ${crescendo ? 'cresceu' : 'caiu'} ${fmtPct(pct)} em relação ao período anterior.`,
        stat: { label: 'Período anterior', valor: fmtNum(prev.cotacoes_passadas) },
        textoLink: 'Explorar dados',
      })
    }
  }

  if (items.length === 0) {
    items.push({
      id: 'status_ok',
      variante: 'default',
      tag: 'Gabi AI · Tudo em dia',
      texto: 'Nenhuma pendência crítica ou anomalia operacional identificada no período selecionado.',
      stat: { label: 'Período', valor: kpis.period },
      textoLink: 'Ver cotações',
    })
  }

  return items
}

// ─── Contagens de status da toolbar ──────────────────────────────────────────

export function buildStatusCountsBidFreteSimulador(
  kpis: DashboardKpisBidFreteSimulador,
): Record<string, number> {
  const s = kpis.cotacoes_status
  const rascunho = Number(s['RASCUNHO'] ?? 0)
  const emCotacao = Number(s['EM_COTACAO'] ?? 0) + Number(s['ENVIADA_FORNECEDORES'] ?? 0)
  const aguardando = Number(s['AGUARDANDO_APROVACAO'] ?? 0)
  const aprovada = Number(s['APROVADA'] ?? 0)
  const reprovada = Number(s['REPROVADA'] ?? 0)
  return {
    todos: rascunho + emCotacao + aguardando + aprovada + reprovada,
    rascunho,
    em_cotacao: emCotacao,
    aguardando_aprovacao: aguardando,
    aprovada,
  }
}

// ─── Períodos e sugestões ────────────────────────────────────────────────────

export function buildPeriodOptionsBidFreteSimulador(t: TFunction): PeriodOption[] {
  return [
    { value: 'tudo', label: t('nucleo.dashboard.periodo.tudo', { defaultValue: 'Tudo' }) },
    { value: '7d', label: t('nucleo.dashboard.periodo.ultimos_7_dias', { defaultValue: 'Últimos 7 dias' }) },
    { value: '30d', label: t('nucleo.dashboard.periodo.ultimos_30_dias', { defaultValue: 'Últimos 30 dias' }) },
    { value: '6m', label: t('nucleo.dashboard.periodo.ultimos_6_meses', { defaultValue: '6 meses' }) },
    { value: '1a', label: t('nucleo.dashboard.periodo.ultimo_ano', { defaultValue: '1 ano' }) },
    { value: '90d', label: t('nucleo.dashboard.periodo.ultimos_90_dias', { defaultValue: 'Últimos 90 dias' }) },
    { value: '12m', label: t('nucleo.dashboard.periodo.ultimos_12_meses', { defaultValue: 'Últimos 12 meses' }) },
    { value: 'current_month', label: t('nucleo.dashboard.periodo.mes_atual', { defaultValue: 'Mês atual' }) },
    { value: 'current_year', label: t('nucleo.dashboard.periodo.ano_atual', { defaultValue: 'Ano atual' }) },
    { value: 'custom', label: t('nucleo.dashboard.periodo.personalizado', { defaultValue: 'Personalizado' }) },
  ]
}

export function gerarSugestoesDashboardBidFreteSimulador(
  widgets: DashboardWidgetConfig[],
  derivedMetrics: DerivedMetric[],
  gridBottom: number,
  catalog: EnrichedCatalogField[] = CATALOGO_DASHBOARD_SIMULADOR_BID_FRETE,
) {
  return generateSuggestionsNucleo(
    catalog,
    widgets.map(w => w.id),
    derivedMetrics,
    gridBottom,
    widgets.flatMap(w => w.query_spec.fields.map(f => f.key)),
  )
}
