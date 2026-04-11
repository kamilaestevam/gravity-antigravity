/**
 * DashboardGrid — Wrapper sobre react-grid-layout
 *
 * Suporta drag & drop e resize de widgets em modo de edição.
 * Em breakpoints pequenos (sm), desabilita drag para melhor UX mobile.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Responsive } from 'react-grid-layout'
import type { Layout, Layouts } from 'react-grid-layout'
import type { DashboardWidgetConfig } from '../tipos.js'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

export interface DashboardGridProps {
  widgets: DashboardWidgetConfig[]
  renderWidget: (widget: DashboardWidgetConfig) => React.ReactNode
  editMode?: boolean
  onLayoutChange?: (layouts: Layouts) => void
  className?: string
}

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768 }
const COLS = { lg: 12, md: 10, sm: 6 }
const ROW_HEIGHT = 65
const DEBOUNCE_MS = 100

function buildLayouts(widgets: DashboardWidgetConfig[]): Layouts {
  const rows: Layout[] = widgets.map(w => ({
    i: w.id,
    x: w.position.x,
    y: w.position.y,
    w: w.position.w,
    h: w.position.h,
    minW: 2,
    minH: 2,
  }))

  return {
    lg: rows,
    md: rows.map(r => ({ ...r, x: Math.min(r.x, 9), w: Math.min(r.w, 10) })),
    sm: rows.map(r => ({ ...r, x: 0, w: 6 })),
  }
}

export function DashboardGrid({
  widgets,
  renderWidget,
  editMode = false,
  onLayoutChange,
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

  const layouts = buildLayouts(widgets)

  return (
    <div ref={wrapperRef} style={{ width: '100%' }}>
      <Responsive
        width={gridWidth}
        className={`db-grid${className ? ` ${className}` : ''}`}
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={ROW_HEIGHT}
        draggableHandle=".db-drag-handle"
        isDraggable={editMode}
        isResizable={editMode}
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
