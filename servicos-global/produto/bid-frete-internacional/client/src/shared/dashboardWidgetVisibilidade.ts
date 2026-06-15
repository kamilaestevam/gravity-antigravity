/**
 * Helpers de visibilidade e ordem dos widgets no Dashboard (paridade Colunas da Lista).
 */

import type { DashboardWidgetConfig } from '@nucleo/dashboard'

export const WIDGET_CONFIG_IS_VISIVEL = 'is_visivel'
export const WIDGET_CONFIG_ORDEM_PAINEL = 'ordem_painel'

export function widgetEstaVisivel(widget: DashboardWidgetConfig): boolean {
  return widget.config?.[WIDGET_CONFIG_IS_VISIVEL] !== false
}

function indiceOrdemWidget(widget: DashboardWidgetConfig): number {
  const ordem = widget.config?.[WIDGET_CONFIG_ORDEM_PAINEL]
  if (typeof ordem === 'number' && Number.isFinite(ordem)) return ordem
  return widget.position.y * 1000 + widget.position.x
}

export function ordenarWidgetsLista(widgets: DashboardWidgetConfig[]): DashboardWidgetConfig[] {
  return [...widgets].sort((a, b) => indiceOrdemWidget(a) - indiceOrdemWidget(b))
}

/** Reorganiza posições x/y em fluxo left-to-right (12 colunas), preservando w/h. */
export function reflowPosicoesWidgets(widgets: DashboardWidgetConfig[]): DashboardWidgetConfig[] {
  const COLS = 12
  let x = 0
  let y = 0
  let rowH = 0

  return widgets.map((w, i) => {
    const pw = w.position.w
    const ph = w.position.h
    if (x + pw > COLS) {
      x = 0
      y += rowH
      rowH = 0
    }
    const next = {
      ...w,
      position: { ...w.position, x, y },
      config: { ...w.config, [WIDGET_CONFIG_ORDEM_PAINEL]: i },
    }
    x += pw
    rowH = Math.max(rowH, ph)
    return next
  })
}

export function idsWidgetsVisiveis(widgets: DashboardWidgetConfig[]): string[] {
  return ordenarWidgetsLista(widgets)
    .filter(widgetEstaVisivel)
    .map(w => w.id)
}

export function reordenarWidgetsLista(
  widgets: DashboardWidgetConfig[],
  fromId: string,
  toId: string,
): DashboardWidgetConfig[] {
  const sorted = ordenarWidgetsLista(widgets)
  const fromIdx = sorted.findIndex(w => w.id === fromId)
  const toIdx = sorted.findIndex(w => w.id === toId)
  if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return widgets

  const reordered = [...sorted]
  const [item] = reordered.splice(fromIdx, 1)
  reordered.splice(toIdx, 0, item)
  return reflowPosicoesWidgets(reordered)
}

export function ordenarWidgetsPorPadrao(
  widgets: DashboardWidgetConfig[],
  idsOrdemPadrao: string[],
): DashboardWidgetConfig[] {
  return [...widgets].sort((a, b) => {
    const ia = idsOrdemPadrao.indexOf(a.id)
    const ib = idsOrdemPadrao.indexOf(b.id)
    const sa = ia === -1 ? 999 + widgets.indexOf(a) : ia
    const sb = ib === -1 ? 999 + widgets.indexOf(b) : ib
    return sa - sb
  })
}

/** Índice visual no grid (y principal, x desempate) — usado após drag/resize. */
export function indicePosicaoGridWidget(widget: DashboardWidgetConfig): number {
  return widget.position.y * 1000 + widget.position.x
}

/** Recalcula ordem_painel a partir das posições x/y após mover/redimensionar no grid. */
export function sincronizarOrdemPainelPorPosicaoGrid(
  widgets: DashboardWidgetConfig[],
): DashboardWidgetConfig[] {
  const sorted = [...widgets].sort(
    (a, b) => indicePosicaoGridWidget(a) - indicePosicaoGridWidget(b),
  )
  const ordemPorId = new Map(sorted.map((w, i) => [w.id, i]))
  return widgets.map(w => ({
    ...w,
    config: { ...w.config, [WIDGET_CONFIG_ORDEM_PAINEL]: ordemPorId.get(w.id) ?? 0 },
  }))
}
