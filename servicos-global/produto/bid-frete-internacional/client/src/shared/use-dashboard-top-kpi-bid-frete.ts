/**
 * KPIs fixos do topo da Visão Geral (BID Frete Internacional).
 * Mapeamento status → slot é fixo no código (sem configuração por usuário).
 */

export const BID_FRETE_DASHBOARD_TOP_KPI_WIDGET_IDS = [
  'kpi_cotacoes_andamento',
  'kpi_cotacoes_aprovadas',
  'kpi_valor_em_aberto',
  'kpi_cotacoes_expiradas',
] as const

export type BidFreteDashboardTopKpiWidgetId = (typeof BID_FRETE_DASHBOARD_TOP_KPI_WIDGET_IDS)[number]

export type BidFreteDashboardTopKpiStatusSlug = string

/** Mapeamento fixo widget → status de cotação. */
export const BID_FRETE_DASHBOARD_TOP_KPI_STATUS_MAPA: Record<
  BidFreteDashboardTopKpiWidgetId,
  BidFreteDashboardTopKpiStatusSlug
> = {
  kpi_cotacoes_andamento: 'AGUARDANDO_APROVACAO',
  kpi_cotacoes_aprovadas: 'EM_COTACAO',
  kpi_valor_em_aberto: 'AGUARDANDO_APROVACAO',
  kpi_cotacoes_expiradas: 'EXPIRADA',
}

const LEGACY_STORAGE_KEY = 'bid-frete:dashboard-top-kpi-status'

/** Remove preferência legada de localStorage (configuração removida em TASK-000325). */
export function limparPreferenciaLegadaDashboardTopKpiBidFrete(): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

if (typeof window !== 'undefined') {
  limparPreferenciaLegadaDashboardTopKpiBidFrete()
}

/** @deprecated Use BID_FRETE_DASHBOARD_TOP_KPI_STATUS_MAPA — mantido para imports legados. */
export function lerDashboardTopKpiStatusBidFreteInternacional(): Record<
  BidFreteDashboardTopKpiWidgetId,
  BidFreteDashboardTopKpiStatusSlug
> {
  return { ...BID_FRETE_DASHBOARD_TOP_KPI_STATUS_MAPA }
}
