/**
 * Popover por clique — painéis informativos do dashboard Minha jornada.
 * Evita tooltip hover (fecha ao tentar rolar) e permanece aberto até clique fora ou Esc.
 */

import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Info } from '@phosphor-icons/react'

interface PopoverInfoDashboardGuiaGravityProps {
  titulo: string
  ariaLabel: string
  children: React.ReactNode
  alinhamentoHorizontal?: 'inicio' | 'centro' | 'fim'
  posicaoPreferida?: 'abaixo' | 'acima'
}

const MARGEM_VIEWPORT_PX = 12
const MEIA_LARGURA_ESTIMADA_PX = 140

export function PopoverInfoDashboardGuiaGravity({
  titulo,
  ariaLabel,
  children,
  alinhamentoHorizontal = 'fim',
  posicaoPreferida = 'abaixo',
}: PopoverInfoDashboardGuiaGravityProps) {
  const [aberto, setAberto] = useState(false)
  const [pos, setPos] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    usaBottom: false,
    alinhamento: alinhamentoHorizontal,
  })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const calcularPos = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const r = trigger.getBoundingClientRect()
    const usaBottom = posicaoPreferida === 'acima'
    let pxLeft: number
    if (alinhamentoHorizontal === 'inicio') pxLeft = r.left
    else if (alinhamentoHorizontal === 'fim') pxLeft = r.right
    else {
      pxLeft = Math.max(
        MARGEM_VIEWPORT_PX + MEIA_LARGURA_ESTIMADA_PX,
        Math.min(r.left + r.width / 2, window.innerWidth - MARGEM_VIEWPORT_PX - MEIA_LARGURA_ESTIMADA_PX),
      )
    }
    setPos({
      usaBottom,
      bottom: usaBottom ? window.innerHeight - r.top + 8 : 0,
      top: usaBottom ? 0 : r.bottom + 8,
      left: pxLeft,
      alinhamento: alinhamentoHorizontal,
    })
  }, [alinhamentoHorizontal, posicaoPreferida])

  const fechar = useCallback(() => setAberto(false), [])

  const alternar = useCallback(() => {
    setAberto(prev => !prev)
  }, [])

  useEffect(() => {
    if (!aberto) return
    calcularPos()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
    }
    const onPointer = (e: PointerEvent) => {
      const alvo = e.target as Node
      if (triggerRef.current?.contains(alvo) || panelRef.current?.contains(alvo)) return
      fechar()
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [aberto, calcularPos, fechar])

  useEffect(() => {
    if (!aberto) return
    const id = requestAnimationFrame(calcularPos)
    return () => cancelAnimationFrame(id)
  }, [aberto, calcularPos])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`uni-dashboard-nivel-info-trigger${aberto ? ' is-aberto' : ''}`}
        aria-label={ariaLabel}
        aria-expanded={aberto}
        aria-controls={panelId}
        onClick={alternar}
      >
        <Info size={11} weight="fill" aria-hidden />
      </button>

      {aberto && ReactDOM.createPortal(
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={`${panelId}-titulo`}
          className="uni-dashboard-info-popover"
          data-start={pos.usaBottom ? 'bottom' : 'top'}
          data-align={pos.alinhamento}
          style={{
            bottom: pos.usaBottom ? pos.bottom : 'auto',
            top: pos.usaBottom ? 'auto' : pos.top,
            left: pos.left,
          }}
        >
          <p id={`${panelId}-titulo`} className="uni-dashboard-info-popover__titulo">{titulo}</p>
          <div className="uni-dashboard-info-popover__corpo">{children}</div>
        </div>,
        document.body,
      )}
    </>
  )
}
