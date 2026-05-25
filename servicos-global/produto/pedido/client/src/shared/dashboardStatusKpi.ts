/**
 * Resolve contagem e rótulo de KPI por status (configurador + distribuição dinâmica).
 */

import type { DashboardDistributionGroup, DashboardKpis } from './api'
import type { PedidoStatusConfig } from './types'
import { DASHBOARD_TOP_KPI_STATUS_ESPECIAL } from './useDashboardTopKpiStatus'

export function mapaRotulosStatusConfig(
  lista: PedidoStatusConfig[] | undefined,
): Record<string, { label: string; cor: string }> {
  const map: Record<string, { label: string; cor: string }> = {}
  for (const s of lista ?? []) {
    if (!s.nome?.trim()) continue
    map[s.nome] = { label: s.rotulo, cor: s.cor }
  }
  return map
}

const KPI_POR_STATUS: Record<string, keyof DashboardKpis> = {
  aberto:        'pedidos_abertos',
  em_andamento:  'pedidos_em_andamento',
  rascunho:      'pedidos_rascunho',
  consolidado:   'pedidos_consolidados',
  cancelado:     'pedidos_cancelados',
  aprovado:      'pedidos_concluidos',
  transferencia: 'pedidos_em_andamento',
}

export function contagemPorStatusSlug(
  slug: string,
  kpis: DashboardKpis,
  distribuicao: DashboardDistributionGroup[],
): number {
  if (slug === DASHBOARD_TOP_KPI_STATUS_ESPECIAL.total) return kpis.total_pedidos
  if (slug === DASHBOARD_TOP_KPI_STATUS_ESPECIAL.atrasados) return kpis.pedidos_atrasados

  const kpiKey = KPI_POR_STATUS[slug]
  if (kpiKey) {
    const v = kpis[kpiKey]
    return typeof v === 'number' ? v : 0
  }

  const grupo = distribuicao.find(g => g.status === slug)
  return grupo?.count ?? 0
}

export function rotuloStatusSlug(
  slug: string,
  statusConfig: Record<string, { label: string; cor: string }>,
  t: (key: string, opts?: { defaultValue?: string }) => string,
): string {
  if (slug === DASHBOARD_TOP_KPI_STATUS_ESPECIAL.total) {
    return t('pedido.dashboard.kpi_status.total', { defaultValue: 'Total de pedidos' })
  }
  if (slug === DASHBOARD_TOP_KPI_STATUS_ESPECIAL.atrasados) {
    return t('pedido.dashboard.kpi_status.atrasados', { defaultValue: 'Pedidos atrasados' })
  }
  return statusConfig[slug]?.label ?? slug.replace(/_/g, ' ')
}
