/**
 * Preferências dos 4 KPIs fixos do topo da Visão Geral (BID Frete Internacional).
 */

import { useCallback, useEffect, useState } from 'react'

export const BID_FRETE_DASHBOARD_TOP_KPI_WIDGET_IDS = [
  'kpi_cotacoes_andamento',
  'kpi_cotacoes_aprovadas',
  'kpi_valor_em_aberto',
  'kpi_cotacoes_expiradas',
] as const

export type BidFreteDashboardTopKpiWidgetId = (typeof BID_FRETE_DASHBOARD_TOP_KPI_WIDGET_IDS)[number]

export type BidFreteDashboardTopKpiStatusSlug = string

const STORAGE_KEY = 'bid-frete:dashboard-top-kpi-status'
const SYNC_EVENT = 'bid-frete:dashboard-top-kpi-updated'

const DEFAULT_BY_WIDGET: Record<BidFreteDashboardTopKpiWidgetId, BidFreteDashboardTopKpiStatusSlug> = {
  kpi_cotacoes_andamento: 'AGUARDANDO_APROVACAO',
  kpi_cotacoes_aprovadas: 'EM_COTACAO',
  kpi_valor_em_aberto: 'AGUARDANDO_APROVACAO',
  kpi_cotacoes_expiradas: 'EXPIRADA',
}

function carregar(): Record<BidFreteDashboardTopKpiWidgetId, BidFreteDashboardTopKpiStatusSlug> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_BY_WIDGET }
    const parsed = JSON.parse(raw) as Partial<Record<BidFreteDashboardTopKpiWidgetId, BidFreteDashboardTopKpiStatusSlug>>
    return {
      ...DEFAULT_BY_WIDGET,
      ...Object.fromEntries(
        BID_FRETE_DASHBOARD_TOP_KPI_WIDGET_IDS
          .filter(id => typeof parsed[id] === 'string' && parsed[id]!.trim())
          .map(id => [id, String(parsed[id]).trim()]),
      ),
    } as Record<BidFreteDashboardTopKpiWidgetId, BidFreteDashboardTopKpiStatusSlug>
  } catch {
    return { ...DEFAULT_BY_WIDGET }
  }
}

function salvar(next: Record<BidFreteDashboardTopKpiWidgetId, BidFreteDashboardTopKpiStatusSlug>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(SYNC_EVENT))
}

export function lerDashboardTopKpiStatusBidFreteInternacional(): Record<
  BidFreteDashboardTopKpiWidgetId,
  BidFreteDashboardTopKpiStatusSlug
> {
  return carregar()
}

export function useDashboardTopKpiBidFrete() {
  const [mapa, setMapa] = useState<Record<BidFreteDashboardTopKpiWidgetId, BidFreteDashboardTopKpiStatusSlug>>(carregar)

  useEffect(() => {
    function onSync() { setMapa(carregar()) }
    window.addEventListener(SYNC_EVENT, onSync)
    window.addEventListener('storage', onSync)
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync)
      window.removeEventListener('storage', onSync)
    }
  }, [])

  const persistirMapa = useCallback((next: Record<BidFreteDashboardTopKpiWidgetId, BidFreteDashboardTopKpiStatusSlug>) => {
    setMapa(next)
    salvar(next)
  }, [])

  const setStatusParaWidget = useCallback((widgetId: BidFreteDashboardTopKpiWidgetId, statusSlug: BidFreteDashboardTopKpiStatusSlug) => {
    setMapa(prev => {
      const next = { ...prev, [widgetId]: statusSlug }
      salvar(next)
      return next
    })
  }, [])

  const resetar = useCallback(() => {
    persistirMapa({ ...DEFAULT_BY_WIDGET })
  }, [persistirMapa])

  return { mapa, setStatusParaWidget, persistirMapa, resetar, defaults: DEFAULT_BY_WIDGET }
}
