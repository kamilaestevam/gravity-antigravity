/**
 * DashboardGrid — Wrapper sobre react-grid-layout
 *
 * Drag/resize por widget via menu ⋮ (moving / resizing), não modo global.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Responsive } from 'react-grid-layout'
import type { Layout, Layouts } from 'react-grid-layout'
import type { DashboardWidgetConfig } from '../tipos.js'
import type { WidgetLayoutInteracao } from './widgetLayoutInteracao.js'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './dashboard-grid.css'

export type { WidgetLayoutInteracao, WidgetLayoutModo } from './widgetLayoutInteracao.js'

export interface DashboardGridProps {
  widgets: DashboardWidgetConfig[]
  renderWidget: (widget: DashboardWidgetConfig) => React.ReactNode
  layoutInteracao?: WidgetLayoutInteracao | null
  onLayoutChange?: (layouts: Layouts) => void
  onLayoutInteracaoFim?: () => void
  className?: string
}

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768 }
const COLS = { lg: 12, md: 10, sm: 6 }
const ROW_HEIGHT = 65
const DEBOUNCE_MS = 100

function buildLayouts(
  widgets: DashboardWidgetConfig[],
  layoutInteracao: WidgetLayoutInteracao | null | undefined,
): Layouts {
  const rows: Layout[] = widgets.map(w => {
    const emMovimento = layoutInteracao?.widgetId === w.id && layoutInteracao.modo === 'moving'
    const emRedimensionamento = layoutInteracao?.widgetId === w.id && layoutInteracao.modo === 'resizing'
    return {
      i: w.id,
      x: w.position.x,
      y: w.position.y,
      w: w.position.w,
      h: w.position.h,
      minW: 2,
      minH: w.position.h < 2 ? 1 : 2,
      isDraggable: emMovimento,
      isResizable: emRedimensionamento,
    }
  })

  return {
    lg: rows,
    md: rows.map(r => ({ ...r, x: Math.min(r.x, 9), w: Math.min(r.w, 10) })),
    sm: rows.map(r => ({ ...r, x: 0, w: 6 })),
  }
}

export function DashboardGrid({
  widgets,
  renderWidget,
  layoutInteracao = null,
  onLayoutChange,
  onLayoutInteracaoFim,
  className = '',
}: DashboardGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [gridWidth, setGridWidth] = useState(1280)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    setGridWidth(el.offsetWidth)
    const ro = new ResizeObserver(() => setGridWidth(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleLayoutChange = useCallback(
    (_currentLayout: Layout[], allLayouts: Layouts) => {
      if (!onLayoutChange) return
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        onLayoutChange(allLayouts)
      }, DEBOUNCE_MS)
    },
    [onLayoutChange],
  )

  const layouts = buildLayouts(widgets, layoutInteracao)
  const gridEmInteracao = layoutInteracao != null

  return (
    <div ref={wrapperRef} style={{ width: '100%' }} data-dashboard-grid-version="layout-menu-v1">
      <Responsive
        width={gridWidth}
        className={`db-grid${gridEmInteracao ? ' db-grid--layout-interacao' : ''}${className ? ` ${className}` : ''}`}
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={ROW_HEIGHT}
        draggableHandle=".db-drag-handle"
        draggableCancel=".db-no-drag, .db-no-drag *, button, a, input, textarea, select"
        isDraggable={false}
        isResizable={false}
        resizeHandles={['se', 's', 'e', 'w', 'n', 'sw', 'nw', 'ne']}
        onLayoutChange={handleLayoutChange}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        useCSSTransforms
      >
        {widgets.map(widget => (
          <div key={widget.id} data-widget-id={widget.id} style={{ height: '100%' }}>
            {renderWidget(widget)}
          </div>
        ))}
      </Responsive>
    </div>
  )
}
