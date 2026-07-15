import type { TFunction } from 'i18next'
import type {
  DashboardWidgetConfig,
  DerivedMetric,
  EnrichedCatalogField,
  PeriodOption,
} from '@nucleo/dashboard'
import { generateSuggestions as generateSuggestionsNucleo } from '@nucleo/dashboard'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import { agregarInsightsPedidosEmpresasSimulador } from './dados-insights-simulador-pedido'
import {
  listarPedidosEmpresasSimulador,
  type LinhaListaPedidoSimulador,
  type StatusListaPedidoSimulador,
} from './dados-lista-simulador-pedido'
import { CATALOGO_DASHBOARD_SIMULADOR_PEDIDO } from './catalogo-dashboard-simulador-pedido'

export type DashboardKpisSimulador = {
  period: string
  total_pedidos: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  pedidos_concluidos: number
  pedidos_consolidados: number
  pedidos_cancelados: number
  pedidos_rascunho: number
  pedidos_atrasados: number
  pedidos_sem_exportador: number
  pedidos_importacao: number
  pedidos_exportacao: number
  valor_total: number
  valor_total_brl: number
  moedas_sem_taxa: string[]
  cobertura_pendente: number
  ticket_medio: number
  qtd_total: number
  itens_prontos: number
  qtd_pronta_total: number
  qtd_inicial_total: number
  qtd_atual_total: number
  qtd_transferida_total: number
  valor_itens_total: number
  taxa_atraso: number
  taxa_conclusao_itens: number
  exposicao_financeira: number
  taxa_transferencia: number
  [key: string]: number | string | string[]
}

export type DashboardTrendBucketSimulador = {
  month: string
  label: string
  total_pedidos: number
  valor_total: number
  cobertura_pendente: number
  valor_itens_total: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  pedidos_consolidados: number
  pedidos_atrasados: number
  qtd_atual_total: number
  [key: string]: string | number
}

export type GabiInsightItemSimulador = {
  id: string
  variante: 'default' | 'warn'
  tag: string
  texto: string
  stat?: { label: string; valor: string }
  textoLink?: string
}

/** KPIs fixos do topo — paridade useDashboardTopKpiStatus.ts */
export const DASHBOARD_TOP_KPI_WIDGET_IDS = [
  'kpi_total_pedidos',
  'kpi_pedidos_abertos',
  'kpi_saldo_total',
  'kpi_valor_total',
] as const

export type DashboardTopKpiWidgetIdSimulador = (typeof DASHBOARD_TOP_KPI_WIDGET_IDS)[number]

export const DASHBOARD_TOP_KPI_STATUS_MAPA: Record<DashboardTopKpiWidgetIdSimulador, string> = {
  kpi_total_pedidos: 'rascunho',
  kpi_pedidos_abertos: 'aberto',
  kpi_saldo_total: 'em_andamento',
  kpi_valor_total: 'consolidado',
}

const KPI_POR_STATUS_SLUG: Record<string, keyof DashboardKpisSimulador> = {
  aberto: 'pedidos_abertos',
  em_andamento: 'pedidos_em_andamento',
  rascunho: 'pedidos_rascunho',
  consolidado: 'pedidos_consolidados',
  cancelado: 'pedidos_cancelados',
}

const TOP_KPI_ROTULOS_PADRAO: Record<string, string> = {
  rascunho: 'Rascunho',
  aberto: 'Aberto',
  em_andamento: 'Em Andamento',
  consolidado: 'Consolidado',
}

export function contagemTopKpiPorStatusSlug(
  slug: string,
  kpis: DashboardKpisSimulador,
): number {
  const kpiKey = KPI_POR_STATUS_SLUG[slug]
  if (kpiKey) return Number(kpis[kpiKey] ?? 0)
  return 0
}

export function rotuloTopKpiStatusSlug(slug: string, t: TFunction): string {
  return t(`pedido.dashboard.kpi_status.${slug}`, {
    defaultValue: TOP_KPI_ROTULOS_PADRAO[slug] ?? slug.replace(/_/g, ' '),
  })
}

export const STATUS_OPTIONS = ['abertos', 'em_andamento', 'atrasados', 'concluidos'] as const

export const STATUS_CONFIG_MAP: Record<string, string> = {
  abertos: 'aberto',
  em_andamento: 'em_andamento',
  atrasados: 'atrasados',
  concluidos: 'consolidado',
}

export const STATUS_LABELS: Record<string, string> = {
  abertos: 'Abertos',
  em_andamento: 'Em andamento',
  atrasados: 'Atrasados',
  concluidos: 'Concluídos',
}

export const STATUS_ACTIVE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  abertos: { bg: 'rgba(129,140,248,0.15)', border: '#818cf8', text: '#818cf8' },
  em_andamento: { bg: 'rgba(251,191,36,0.15)', border: '#fbbf24', text: '#fbbf24' },
  atrasados: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#ef4444' },
  concluidos: { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', text: '#22c55e' },
}

export const BUILT_IN_DERIVED_SIMULADOR: DerivedMetric[] = [
  {
    id: 'taxa_atraso',
    label: 'Taxa de Atraso dos Pedidos',
    description: 'Percentual de pedidos atrasados em relação ao total',
    inputFields: ['pedidos_atrasados', 'total_pedidos'],
    operation: 'RATIO',
    formula: ({ pedidos_atrasados, total_pedidos }) =>
      total_pedidos > 0 ? (pedidos_atrasados / total_pedidos) * 100 : null,
    fieldType: 'percentage',
  },
  {
    id: 'ticket_medio',
    label: 'Ticket Médio',
    description: 'Valor médio por pedido no período',
    inputFields: ['valor_total', 'total_pedidos'],
    operation: 'RATIO',
    formula: ({ valor_total, total_pedidos }) =>
      total_pedidos > 0 ? valor_total / total_pedidos : null,
    fieldType: 'currency',
  },
  {
    id: 'taxa_conclusao_itens',
    label: 'Conclusão de Itens',
    description: 'Percentual de itens prontos em relação à quantidade inicial',
    inputFields: ['itens_prontos', 'qtd_inicial_total'],
    operation: 'RATIO',
    formula: ({ itens_prontos, qtd_inicial_total }) =>
      qtd_inicial_total > 0 ? (itens_prontos / qtd_inicial_total) * 100 : null,
    fieldType: 'percentage',
  },
  {
    id: 'exposicao_financeira',
    label: 'Exposição Financeira',
    description: 'Percentual da cobertura pendente sobre o valor total',
    inputFields: ['cobertura_pendente', 'valor_total'],
    operation: 'RATIO',
    formula: ({ cobertura_pendente, valor_total }) =>
      valor_total > 0 ? (cobertura_pendente / valor_total) * 100 : null,
    fieldType: 'percentage',
  },
  {
    id: 'taxa_transferencia',
    label: 'Progresso de Transferência',
    description: 'Percentual da quantidade transferida em relação à inicial',
    inputFields: ['qtd_transferida_total', 'qtd_inicial_total'],
    operation: 'RATIO',
    formula: ({ qtd_transferida_total, qtd_inicial_total }) =>
      qtd_inicial_total > 0 ? (qtd_transferida_total / qtd_inicial_total) * 100 : null,
    fieldType: 'percentage',
  },
]

const FATOR_PERIODO: Record<string, number> = {
  tudo: 1,
  '7d': 0.28,
  '30d': 1,
  '6m': 1.8,
  '1a': 2.4,
  '90d': 1.5,
  '12m': 2.2,
  current_month: 0.35,
  current_year: 2,
  ytd: 1.9,
}

function escalaPeriodo(period: string): number {
  if (period.startsWith('custom:')) return 1
  return FATOR_PERIODO[period] ?? 1
}

function statusListaParaFiltro(status: StatusListaPedidoSimulador): string | null {
  if (status === 'ABERTO') return 'abertos'
  if (status === 'EM ANDAMENTO' || status === 'TRANSFERIDO') return 'em_andamento'
  if (status === 'CONSOLIDADO') return 'concluidos'
  return null
}

function filtrarPedidosPorStatus(
  pedidos: LinhaListaPedidoSimulador[],
  statusFiltro: string[],
): LinhaListaPedidoSimulador[] {
  if (statusFiltro.length === 0) return pedidos
  return pedidos.filter(p => {
    const slug = statusListaParaFiltro(p.status)
    if (statusFiltro.includes('atrasados')) {
      // Simulação: pedidos com alerta de incoterm contam como atrasados
      if (p.alertaIncoterm) return true
    }
    return slug != null && statusFiltro.includes(slug)
  })
}

function contarPorStatusLista(pedidos: LinhaListaPedidoSimulador[]) {
  let abertos = 0
  let emAndamento = 0
  let consolidados = 0
  let rascunho = 0
  let importacao = 0
  let exportacao = 0
  let semExportador = 0
  let atrasados = 0
  let qtdItens = 0
  let qtdTransferida = 0
  let valorTotal = 0

  for (const p of pedidos) {
    qtdItens += p.itens
    valorTotal += p.valorFob
    if (p.vincularExportador) semExportador += 1
    if (p.alertaIncoterm) atrasados += 1
    if (p.tipoOperacao === 'IMPORTAÇÃO') importacao += 1
    else exportacao += 1

    switch (p.status) {
      case 'ABERTO':
        abertos += 1
        break
      case 'EM ANDAMENTO':
        emAndamento += 1
        break
      case 'TRANSFERIDO':
        emAndamento += 1
        qtdTransferida += p.itens
        break
      case 'CONSOLIDADO':
        consolidados += 1
        break
      case 'RASCUNHO':
        rascunho += 1
        break
      default:
        break
    }
  }

  return {
    abertos,
    emAndamento,
    consolidados,
    rascunho,
    importacao,
    exportacao,
    semExportador,
    atrasados,
    qtdItens,
    qtdTransferida,
    valorTotal,
  }
}

export function buildDashboardKpisSimulador(
  empresas: PerfilEmpresaSimulador[],
  period: string,
  statusFiltro: string[] = [],
): DashboardKpisSimulador {
  const insights = agregarInsightsPedidosEmpresasSimulador(empresas)
  const pedidosBrutos = listarPedidosEmpresasSimulador(empresas)
  const pedidos = filtrarPedidosPorStatus(pedidosBrutos, statusFiltro)
  const contagem = contarPorStatusLista(pedidos)
  const fator = escalaPeriodo(period)

  const alertaAtrasados = insights.alertas.find(a => a.rotulo.toLowerCase().includes('atrasad'))
  const pedidosAtrasados = statusFiltro.length === 0 || statusFiltro.includes('atrasados')
    ? Math.round((alertaAtrasados?.valor ?? contagem.atrasados) * fator)
    : contagem.atrasados

  const totalPedidos = Math.max(1, Math.round(pedidos.length * fator))
  const valorTotal = Math.round(contagem.valorTotal * fator)
  const valorBrl = Math.round(valorTotal * 5.42)
  const qtdInicial = Math.round(contagem.qtdItens * 1.15 * fator)
  const qtdAtual = Math.round(contagem.qtdItens * fator)
  const qtdPronta = Math.round(qtdAtual * 0.42)
  const qtdTransferida = Math.round(contagem.qtdTransferida * fator)
  const coberturaPendente = Math.round(valorTotal * 0.18)
  const ticketMedio = totalPedidos > 0 ? valorTotal / totalPedidos : 0

  const taxaAtraso = totalPedidos > 0 ? (pedidosAtrasados / totalPedidos) * 100 : 0
  const taxaConclusao = qtdInicial > 0 ? (qtdPronta / qtdInicial) * 100 : 0
  const exposicao = valorTotal > 0 ? (coberturaPendente / valorTotal) * 100 : 0
  const taxaTransf = qtdInicial > 0 ? (qtdTransferida / qtdInicial) * 100 : 0

  return {
    period,
    total_pedidos: totalPedidos,
    pedidos_abertos: Math.round(contagem.abertos * fator),
    pedidos_em_andamento: Math.round(contagem.emAndamento * fator),
    pedidos_concluidos: Math.round(contagem.consolidados * fator),
    pedidos_consolidados: Math.round(contagem.consolidados * fator),
    pedidos_cancelados: Math.max(0, Math.round(totalPedidos * 0.02)),
    pedidos_rascunho: Math.round(contagem.rascunho * fator),
    pedidos_atrasados: pedidosAtrasados,
    pedidos_sem_exportador: Math.round(contagem.semExportador * fator),
    pedidos_importacao: Math.round(contagem.importacao * fator),
    pedidos_exportacao: Math.round(contagem.exportacao * fator),
    valor_total: valorTotal,
    valor_total_brl: valorBrl,
    moedas_sem_taxa: ['CNY'],
    cobertura_pendente: coberturaPendente,
    ticket_medio: ticketMedio,
    qtd_total: qtdAtual,
    itens_prontos: qtdPronta,
    qtd_pronta_total: qtdPronta,
    qtd_inicial_total: qtdInicial,
    qtd_atual_total: qtdAtual,
    qtd_transferida_total: qtdTransferida,
    valor_itens_total: Math.round(valorTotal * 0.94),
    taxa_atraso: taxaAtraso,
    taxa_conclusao_itens: taxaConclusao,
    exposicao_financeira: exposicao,
    taxa_transferencia: taxaTransf,
  }
}

export function buildTrendBucketsSimulador(
  empresas: PerfilEmpresaSimulador[],
): DashboardTrendBucketSimulador[] {
  const insights = agregarInsightsPedidosEmpresasSimulador(empresas)
  return insights.pedidosPorMes.map(mes => ({
    month: mes.mes,
    label: mes.mes,
    total_pedidos: mes.total,
    valor_total: mes.total * 3180,
    cobertura_pendente: mes.total * 580,
    valor_itens_total: mes.total * 2990,
    pedidos_abertos: mes.aprovadas,
    pedidos_em_andamento: mes.emAndamento,
    pedidos_consolidados: Math.max(0, mes.total - mes.aprovadas - mes.emAndamento - mes.recusadas),
    pedidos_atrasados: mes.recusadas,
    qtd_atual_total: mes.total * 4,
  }))
}

const fmtNum = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n))
const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`

export function buildInsightsGabiSimulador(kpis: DashboardKpisSimulador): GabiInsightItemSimulador[] {
  const items: GabiInsightItemSimulador[] = []

  if (kpis.pedidos_atrasados > 0) {
    const taxa = kpis.total_pedidos > 0 ? (kpis.pedidos_atrasados / kpis.total_pedidos) * 100 : 0
    items.push({
      id: 'atrasados',
      variante: 'warn',
      tag: 'ATRASO',
      texto: `${kpis.pedidos_atrasados} pedidos com prazo vencido no escopo selecionado.`,
      stat: { label: 'Taxa de atraso', valor: fmtPct(taxa) },
      textoLink: 'Ver na lista',
    })
  }

  if (kpis.pedidos_sem_exportador > 0) {
    items.push({
      id: 'sem_exportador',
      variante: 'warn',
      tag: 'CADASTRO',
      texto: `${kpis.pedidos_sem_exportador} pedidos aguardam vínculo com exportador.`,
      stat: { label: 'Pendências', valor: fmtNum(kpis.pedidos_sem_exportador) },
      textoLink: 'Corrigir agora',
    })
  }

  if (kpis.pedidos_rascunho > 0) {
    items.push({
      id: 'rascunho',
      variante: 'warn',
      tag: 'RASCUNHO',
      texto: `${kpis.pedidos_rascunho} pedidos em rascunho ainda não publicados.`,
      stat: { label: 'Em rascunho', valor: fmtNum(kpis.pedidos_rascunho) },
      textoLink: 'Publicar pedidos',
    })
  }

  if (kpis.pedidos_abertos > 0) {
    items.push({
      id: 'abertos',
      variante: 'default',
      tag: 'OPERACIONAL',
      texto: `${kpis.pedidos_abertos} pedidos abertos aguardando próxima etapa.`,
      stat: { label: 'Qtd. transferida', valor: fmtNum(kpis.qtd_transferida_total) },
      textoLink: 'Acompanhar pipeline',
    })
  }

  if (kpis.valor_total > 0) {
    items.push({
      id: 'financeiro',
      variante: 'default',
      tag: 'FINANCEIRO',
      texto: `Exposição de ${fmtBRL(kpis.valor_total)} em pedidos no período.`,
      stat: { label: 'Ticket médio', valor: fmtBRL(kpis.ticket_medio) },
      textoLink: 'Ver detalhes',
    })
  }

  const totalOps = kpis.pedidos_importacao + kpis.pedidos_exportacao
  if (totalOps > 0) {
    const pctImp = Math.round((kpis.pedidos_importacao / totalOps) * 100)
    items.push({
      id: 'imp_exp',
      variante: 'default',
      tag: 'MIX OPERACIONAL',
      texto: `Mix ${pctImp}% importação e ${100 - pctImp}% exportação no escopo.`,
      stat: { label: 'Total operações', valor: fmtNum(totalOps) },
      textoLink: 'Explorar mapa',
    })
  }

  if (items.length === 0) {
    items.push({
      id: 'status_ok',
      variante: 'default',
      tag: 'GABI',
      texto: 'Operação estável no período selecionado.',
      stat: { label: 'Pedidos', valor: fmtNum(kpis.total_pedidos) },
      textoLink: 'Explorar dashboard',
    })
  }

  return items
}

export function buildStatusCountsSimulador(kpis: DashboardKpisSimulador): Record<string, number> {
  return {
    todos: kpis.total_pedidos,
    abertos: kpis.pedidos_abertos,
    em_andamento: kpis.pedidos_em_andamento,
    atrasados: kpis.pedidos_atrasados,
    concluidos: kpis.pedidos_consolidados,
  }
}

export function buildPeriodOptionsSimulador(t: TFunction): PeriodOption[] {
  return [
    { value: 'tudo', label: t('pedido.config.cards.periodo_tudo', { defaultValue: 'Tudo' }) },
    { value: '7d', label: t('nucleo.dashboard.periodo.ultimos_7_dias', { defaultValue: 'Últimos 7 dias' }) },
    { value: '30d', label: t('nucleo.dashboard.periodo.ultimos_30_dias', { defaultValue: 'Últimos 30 dias' }) },
    { value: '6m', label: t('pedido.config.cards.periodo_6m', { defaultValue: '6 meses' }) },
    { value: '1a', label: t('pedido.config.cards.periodo_1a', { defaultValue: '1 ano' }) },
    { value: '90d', label: t('nucleo.dashboard.periodo.ultimos_90_dias', { defaultValue: 'Últimos 90 dias' }) },
    { value: '12m', label: t('nucleo.dashboard.periodo.ultimos_12_meses', { defaultValue: 'Últimos 12 meses' }) },
    { value: 'current_month', label: t('nucleo.dashboard.periodo.mes_atual', { defaultValue: 'Mês atual' }) },
    { value: 'current_year', label: t('nucleo.dashboard.periodo.ano_atual', { defaultValue: 'Ano atual' }) },
    { value: 'custom', label: t('nucleo.dashboard.periodo.personalizado', { defaultValue: 'Personalizado' }) },
  ]
}

export function gerarSugestoesDashboardSimulador(
  widgets: DashboardWidgetConfig[],
  derivedMetrics: DerivedMetric[],
  gridBottom: number,
  catalog: EnrichedCatalogField[] = CATALOGO_DASHBOARD_SIMULADOR_PEDIDO,
) {
  return generateSuggestionsNucleo(
    catalog,
    widgets.map(w => w.id),
    derivedMetrics,
    gridBottom,
    widgets.flatMap(w => w.query_spec.fields.map(f => f.key)),
  )
}

export function computeDerivedSimulador(
  metric: DerivedMetric,
  values: Record<string, number>,
): number | null {
  try {
    return metric.formula(values)
  } catch {
    return null
  }
}
