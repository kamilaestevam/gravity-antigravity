/**
 * Mapa widget id → data-sds-tutorial-alvo (guia Gabi do Dashboard marketing).
 */

export const ALVO_TUTORIAL_WIDGET_DASHBOARD_SIMULADOR: Record<string, string> = {
  kpi_total_pedidos: 'pedido-dashboard-kpi-rascunho',
  kpi_pedidos_abertos: 'pedido-dashboard-kpi-aberto',
  kpi_saldo_total: 'pedido-dashboard-kpi-andamento',
  kpi_valor_total: 'pedido-dashboard-kpi-consolidado',
  gabi_insights: 'pedido-dashboard-gabi',
  pedidos_por_mes: 'pedido-dashboard-grafico-pedidos-mes',
  valor_total_trend: 'pedido-dashboard-grafico-valor',
  section_alertas: 'pedido-dashboard-section-alertas',
  kpi_pedidos_atrasados: 'pedido-dashboard-kpi-atrasados',
  kpi_sem_exportador: 'pedido-dashboard-kpi-sem-exportador',
  kpi_qtd_pronta: 'pedido-dashboard-kpi-qtd-pronta',
  status_dist: 'pedido-dashboard-dist-status',
  tipo_operacao_dist: 'pedido-dashboard-dist-operacao',
  kpi_qtd_inicial: 'pedido-dashboard-kpi-qtd-inicial',
  kpi_qtd_transferida: 'pedido-dashboard-kpi-qtd-transferida',
  kpi_valor_itens: 'pedido-dashboard-kpi-valor-itens',
}

export function resolverAlvoTutorialWidgetDashboardSimulador(widgetId: string): string | undefined {
  return ALVO_TUTORIAL_WIDGET_DASHBOARD_SIMULADOR[widgetId]
}
