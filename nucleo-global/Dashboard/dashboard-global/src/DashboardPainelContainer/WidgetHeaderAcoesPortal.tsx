/**
 * WidgetHeaderAcoesPortal — período e menu ⋮ fora da árvore do react-grid-layout.
 * Evita conflito de mousedown com DraggableCore em modo edição.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface WidgetHeaderAcoesPortalProps {
  anchorRef: React.RefObject<HTMLElement | null>
  ativo: boolean
  children: React.ReactNode
}

export function WidgetHeaderAcoesPortal({
  anchorRef,
  ativo,
  children,
}: WidgetHeaderAcoesPortalProps) {
  const [coords, setCoords] = useState<{ top: number; left: number; height: number } | null>(null)

  const atualizarCoords = useCallback(() => {
    if (!anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    setCoords({ top: r.top, left: r.left, height: r.height })
  }, [anchorRef])

  useEffect(() => {
    if (!ativo) {
      setCoords(null)
      return
    }
    atualizarCoords()
    window.addEventListener('resize', atualizarCoords)
    window.addEventListener('scroll', atualizarCoords, true)

    let frame = 0
    const tick = () => {
      atualizarCoords()
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', atualizarCoords)
      window.removeEventListener('scroll', atualizarCoords, true)
      cancelAnimationFrame(frame)
    }
  }, [ativo, atualizarCoords])

  if (!ativo || !coords) return null

  return createPortal(
    <div
      className="dashboard-widget-header-acoes db-no-drag"
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        height: coords.height,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      {children}
    </div>,
    document.body,
  )
}
