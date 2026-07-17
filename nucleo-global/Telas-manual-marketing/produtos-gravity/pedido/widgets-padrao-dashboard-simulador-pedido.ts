import type { DashboardWidgetConfig } from '@nucleo/dashboard'

/** Widgets padrão do painel Principal — espelho de dashboardStore.DEFAULT_WIDGETS */
export const WIDGETS_PADRAO_DASHBOARD_SIMULADOR_PEDIDO: DashboardWidgetConfig[] = [
  {
    id: 'kpi_total_pedidos',
    title: 'Total de Pedidos',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'total_pedidos', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 0, w: 3, h: 1.5 },
  },
  {
    id: 'kpi_pedidos_abertos',
    title: 'Pedidos em Aberto',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'pedidos_abertos', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 3, y: 0, w: 3, h: 1.5 },
  },
  {
    id: 'kpi_saldo_total',
    title: 'Saldo Total (Qtd)',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'qtd_atual_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 6, y: 0, w: 3, h: 1.5 },
  },
  {
    id: 'kpi_valor_total',
    title: 'Valor Total (BRL)',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'valor_total_brl', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 9, y: 0, w: 3, h: 1.5 },
  },
  {
    id: 'gabi_insights',
    title: 'GABI AI · Insights',
    chart_type: 'GABI_INSIGHTS',
    query_spec: { fields: [], filters: { period: '30d' } },
    position: { x: 0, y: 1.5, w: 6, h: 4 },
  },
  {
    id: 'pedidos_por_mes',
    title: 'Pedidos por Mês',
    chart_type: 'LINE',
    query_spec: {
      fields: [{ key: 'total_pedidos', operation: 'COUNT' }],
      filters: { period: '12m' },
    },
    position: { x: 0, y: 4.5, w: 6, h: 4 },
  },
  {
    id: 'valor_total_trend',
    title: 'Evolução do Valor Total',
    chart_type: 'LINE',
    query_spec: {
      fields: [{ key: 'valor_total', operation: 'SUM' }],
      filters: { period: '12m' },
    },
    position: { x: 6, y: 4.5, w: 6, h: 4 },
  },
  {
    id: 'section_alertas',
    title: 'Alertas Operacionais',
    chart_type: 'SECTION_LABEL',
    query_spec: { fields: [], filters: { period: '30d' } },
    position: { x: 0, y: 8.5, w: 12, h: 1 },
  },
  {
    id: 'kpi_pedidos_atrasados',
    title: 'Pedidos Atrasados',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'pedidos_atrasados', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 9.5, w: 4, h: 2 },
  },
  {
    id: 'kpi_sem_exportador',
    title: 'Sem Exportador',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'pedidos_sem_exportador', operation: 'COUNT' }],
      filters: { period: '30d' },
    },
    position: { x: 4, y: 9.5, w: 4, h: 2 },
  },
  {
    id: 'kpi_qtd_pronta',
    title: 'Qtd. Pronta',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'qtd_pronta_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 8, y: 9.5, w: 4, h: 2 },
  },
  {
    id: 'status_dist',
    title: 'Distribuição por Status',
    chart_type: 'DISTRIBUTION',
    query_spec: {
      fields: [
        { key: 'pedidos_abertos', operation: 'COUNT' },
        { key: 'pedidos_em_andamento', operation: 'COUNT' },
        { key: 'pedidos_consolidados', operation: 'COUNT' },
        { key: 'pedidos_cancelados', operation: 'COUNT' },
        { key: 'pedidos_rascunho', operation: 'COUNT' },
      ],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 11.5, w: 6, h: 4 },
  },
  {
    id: 'tipo_operacao_dist',
    title: 'Importação vs Exportação',
    chart_type: 'DISTRIBUTION',
    query_spec: {
      fields: [
        { key: 'pedidos_importacao', operation: 'COUNT' },
        { key: 'pedidos_exportacao', operation: 'COUNT' },
      ],
      filters: { period: '30d' },
    },
    position: { x: 6, y: 11.5, w: 6, h: 4 },
  },
  {
    id: 'kpi_qtd_inicial',
    title: 'Qtd. Inicial Total',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'qtd_inicial_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 0, y: 15.5, w: 4, h: 2 },
  },
  {
    id: 'kpi_qtd_transferida',
    title: 'Qtd. Transferida',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'qtd_transferida_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 4, y: 15.5, w: 4, h: 2 },
  },
  {
    id: 'kpi_valor_itens',
    title: 'Valor Total dos Itens',
    chart_type: 'KPI_CARD',
    query_spec: {
      fields: [{ key: 'valor_itens_total', operation: 'SUM' }],
      filters: { period: '30d' },
    },
    position: { x: 8, y: 15.5, w: 4, h: 2 },
  },
]

export const WIDGET_TITLE_KEYS_SIMULADOR: Record<string, string> = {
  kpi_total_pedidos: 'pedido.dashboard_widgets.title_kpi_total_pedidos',
  kpi_pedidos_abertos: 'pedido.dashboard_widgets.title_kpi_pedidos_abertos',
  kpi_saldo_total: 'pedido.dashboard_widgets.title_kpi_saldo_total',
  kpi_valor_total: 'pedido.dashboard_widgets.title_kpi_valor_total',
  gabi_insights: 'pedido.dashboard_widgets.title_gabi_insights',
  pedidos_por_mes: 'pedido.dashboard_widgets.title_pedidos_por_mes',
  valor_total_trend: 'pedido.dashboard_widgets.title_valor_total_trend',
  section_alertas: 'pedido.dashboard_widgets.title_section_alertas',
  kpi_pedidos_atrasados: 'pedido.dashboard_widgets.title_kpi_pedidos_atrasados',
  kpi_sem_exportador: 'pedido.dashboard_widgets.title_kpi_sem_exportador',
  kpi_qtd_pronta: 'pedido.dashboard_widgets.title_kpi_qtd_pronta',
  status_dist: 'pedido.dashboard_widgets.title_status_dist',
  tipo_operacao_dist: 'pedido.dashboard_widgets.title_tipo_operacao_dist',
  kpi_qtd_inicial: 'pedido.dashboard_widgets.title_kpi_qtd_inicial',
  kpi_qtd_transferida: 'pedido.dashboard_widgets.title_kpi_qtd_transferida',
  kpi_valor_itens: 'pedido.dashboard_widgets.title_kpi_valor_itens',
}
