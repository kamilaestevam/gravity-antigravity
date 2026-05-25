/**
 * Preferências mínimas dos 4 KPIs fixos do topo do Dashboard (painel Principal).
 * O usuário escolhe qual status do configurador cada card representa.
 * Painéis customizados continuam independentes.
 */

import { useCallback, useEffect, useState } from 'react'

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

const STORAGE_KEY = 'pedido:dashboard-top-kpi-status'
const SYNC_EVENT = 'pedido:dashboard-top-kpi-updated'

const DEFAULT_BY_WIDGET: Record<DashboardTopKpiWidgetId, DashboardTopKpiStatusSlug> = {
  kpi_total_pedidos:   'rascunho',
  kpi_pedidos_abertos: 'aberto',
  kpi_saldo_total:     'em_andamento',
  kpi_valor_total:     'consolidado',
}

/** Converte slugs legados (__total__, __atrasados__) para status reais. */
function normalizarSlugSalvo(slug: string): DashboardTopKpiStatusSlug {
  if (slug === DASHBOARD_TOP_KPI_STATUS_ESPECIAL.total) return DEFAULT_BY_WIDGET.kpi_total_pedidos
  if (slug === DASHBOARD_TOP_KPI_STATUS_ESPECIAL.atrasados) return DEFAULT_BY_WIDGET.kpi_pedidos_abertos
  return slug.trim()
}

function carregar(): Record<DashboardTopKpiWidgetId, DashboardTopKpiStatusSlug> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_BY_WIDGET }
    const parsed = JSON.parse(raw) as Partial<Record<DashboardTopKpiWidgetId, DashboardTopKpiStatusSlug>>
    return {
      ...DEFAULT_BY_WIDGET,
      ...Object.fromEntries(
        DASHBOARD_TOP_KPI_WIDGET_IDS
          .filter(id => typeof parsed[id] === 'string' && parsed[id]!.trim())
          .map(id => [id, normalizarSlugSalvo(parsed[id]!)]),
      ),
    } as Record<DashboardTopKpiWidgetId, DashboardTopKpiStatusSlug>
  } catch {
    return { ...DEFAULT_BY_WIDGET }
  }
}

function salvar(next: Record<DashboardTopKpiWidgetId, DashboardTopKpiStatusSlug>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(SYNC_EVENT))
}

export function useDashboardTopKpiStatus() {
  const [mapa, setMapa] = useState<Record<DashboardTopKpiWidgetId, DashboardTopKpiStatusSlug>>(carregar)

  useEffect(() => {
    function onSync() { setMapa(carregar()) }
    window.addEventListener(SYNC_EVENT, onSync)
    window.addEventListener('storage', onSync)
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync)
      window.removeEventListener('storage', onSync)
    }
  }, [])

  const setStatusParaWidget = useCallback((widgetId: DashboardTopKpiWidgetId, statusSlug: DashboardTopKpiStatusSlug) => {
    setMapa(prev => {
      const next = { ...prev, [widgetId]: statusSlug }
      salvar(next)
      return next
    })
  }, [])

  const resetar = useCallback(() => {
    const next = { ...DEFAULT_BY_WIDGET }
    setMapa(next)
    salvar(next)
  }, [])

  return { mapa, setStatusParaWidget, resetar, defaults: DEFAULT_BY_WIDGET }
}
