/**
 * KPIs fixos do topo do Dashboard e da Visão Geral (4 cards).
 * Mapeamento status → slot é fixo no código (sem configuração por usuário).
 */

export const DASHBOARD_TOP_KPI_WIDGET_IDS = [
  'kpi_total_pedidos',
  'kpi_pedidos_abertos',
  'kpi_saldo_total',
  'kpi_valor_total',
] as const

export type DashboardTopKpiWidgetId = (typeof DASHBOARD_TOP_KPI_WIDGET_IDS)[number]

/** Slug do status_pedido ou chaves especiais calculadas pelo backend. */
export type DashboardTopKpiStatusSlug = string

export const DASHBOARD_TOP_KPI_STATUS_ESPECIAL = {
  total: '__total__',
  atrasados: '__atrasados__',
} as const

/** Mapeamento fixo widget → status (fonte única para Dashboard e Visão Geral). */
export const DASHBOARD_TOP_KPI_STATUS_MAPA: Record<DashboardTopKpiWidgetId, DashboardTopKpiStatusSlug> = {
  kpi_total_pedidos:   'rascunho',
  kpi_pedidos_abertos: 'aberto',
  kpi_saldo_total:     'em_andamento',
  kpi_valor_total:     'consolidado',
}

const LEGACY_STORAGE_KEY = 'pedido:dashboard-top-kpi-status'

/** Remove preferência legada de localStorage (configuração removida em TASK-000325). */
export function limparPreferenciaLegadaDashboardTopKpi(): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

if (typeof window !== 'undefined') {
  limparPreferenciaLegadaDashboardTopKpi()
}
