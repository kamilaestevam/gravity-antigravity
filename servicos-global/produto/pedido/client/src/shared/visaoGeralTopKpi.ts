/**
 * KPIs fixos do topo da Visão Geral — mapeamento fixo em useDashboardTopKpiStatus
 * + rótulos de pedido:status_config.
 */

import { useEffect, useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import type { Pedido } from './types'
import { rotuloStatusSlug } from './dashboardStatusKpi'
import {
  DASHBOARD_TOP_KPI_WIDGET_IDS,
  type DashboardTopKpiWidgetId,
} from './useDashboardTopKpiStatus'

const STATUS_CONFIG_KEY = 'pedido:status_config'
const STATUS_CONFIG_SYNC_EVENT = 'pedido:status-config-updated'

export type MapaRotuloStatus = Record<string, { label: string; cor: string }>

export interface VisaoGeralTopKpiCardPedido {
  widgetId: DashboardTopKpiWidgetId
  slug: string
  titulo: string
  cor: string
  count: number
  valor: number
}

export function lerMapaRotulosStatusPedido(): MapaRotuloStatus {
  try {
    const raw = localStorage.getItem(STATUS_CONFIG_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as MapaRotuloStatus
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/** Reage a salvar config de status ou KPIs do topo. */
export function useMapaRotulosStatusPedido(): MapaRotuloStatus {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const bump = () => setTick(n => n + 1)
    window.addEventListener(STATUS_CONFIG_SYNC_EVENT, bump)
    window.addEventListener('storage', bump)
    return () => {
      window.removeEventListener(STATUS_CONFIG_SYNC_EVENT, bump)
      window.removeEventListener('storage', bump)
    }
  }, [])

  return useMemo(() => lerMapaRotulosStatusPedido(), [tick])
}

function somaValorPedidos(lista: Pedido[]): number {
  return lista.reduce((s, p) => {
    const v = Number(p.valor_total_pedido)
    return s + (Number.isFinite(v) ? v : 0)
  }, 0)
}

export function calcularTopKpiCardsVisaoGeral(
  pedidos: Pedido[],
  mapaStatusPorWidget: Record<DashboardTopKpiWidgetId, string>,
  rotulos: MapaRotuloStatus,
  t: TFunction,
): VisaoGeralTopKpiCardPedido[] {
  return DASHBOARD_TOP_KPI_WIDGET_IDS.map(widgetId => {
    const slug = mapaStatusPorWidget[widgetId] ?? ''
    const matching = pedidos.filter(p => p.status === slug)
    const cfg = rotulos[slug]
    return {
      widgetId,
      slug,
      titulo: rotuloStatusSlug(slug, rotulos, t),
      cor: cfg?.cor ?? '#f59e0b',
      count: matching.length,
      valor: somaValorPedidos(matching),
    }
  })
}
