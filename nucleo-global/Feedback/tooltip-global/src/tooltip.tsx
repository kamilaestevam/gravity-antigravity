/**
 * @nucleo/tooltip-global — tooltip.tsx
 * Tooltip unificada: renderiza card minimalista com título descritivo via portal.
 * Use position:fixed calculada no onMouseEnter = zero flash.
 *
 * ⚠️  ANTES DE ESCREVER QUALQUER titulo OU descricao:
 *     Leia obrigatoriamente a skill de escrita de tooltips:
 *     skills/ux/tooltip/SKILL.md
 *
 *     Regras principais:
 *     - Sem ponto final na descricao
 *     - Linguagem do usuário — nunca mencione implementação técnica
 *     - Máximo ~90 caracteres na descricao
 *     - descricao responde: "o que esse campo faz pela minha empresa?"
 */
import React, { useState, useRef, useId, useCallback } from 'react'
import ReactDOM from 'react-dom'
import './tooltip.css'
import type { TooltipProps } from './tipos.js'

export function TooltipGlobal({ titulo, descricao, children, interativo }: TooltipProps) {
  const [show, setShow] = useState(false)
  const [pos,  setPos]  = useState({ top: 0, bottom: 0, left: 0, usaBottom: false, rowTop: 0, rowHeight: 0 })
  const ref = useRef<HTMLSpanElement>(null)
  const tooltipId = useId()
  // Flag: mouse está sobre o card — impede que o overlay feche antes do tempo
  const sobreCardRef = useRef(false)

  const calcularPos = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      const row = interativo ? ref.current.closest('tr') : null
      const rowRect = row ? row.getBoundingClientRect() : r
      const espacoAcima = r.top
      const usaBottom = espacoAcima > 80
      const pxLeft = Math.max(138, Math.min(r.left + r.width / 2, window.innerWidth - 138))
      setPos({
        usaBottom,
        bottom: usaBottom ? window.innerHeight - r.top + 8 : 0,
        top: usaBottom ? 0 : r.bottom + 8,
        left: pxLeft,
        rowTop: rowRect.top,
        rowHeight: rowRect.height,
      })
    }
  }

  const mostra = useCallback(() => {
    if (document.body.classList.contains('tooltips-disabled')) return
    calcularPos()
    setShow(true)
  }, [interativo])

  const esconde = useCallback(() => setShow(false), [])

  // Overlay saiu → aguarda 50ms para o onMouseEnter do card poder disparar primeiro
  const onOverlayLeave = useCallback(() => {
    setTimeout(() => {
      if (!sobreCardRef.current) esconde()
    }, 50)
  }, [esconde])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setShow(false)
  }

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={mostra}
        onMouseLeave={interativo ? undefined : esconde}
        onFocus={mostra}
        onBlur={esconde}
        onKeyDown={onKeyDown}
        className="tg-trigger"
        data-tg-mute={!descricao}
        aria-describedby={show ? tooltipId : undefined}
      >
        {children}
      </span>

      {show && ReactDOM.createPortal(
        <>
          {/* Overlay cobre toda a linha — fecha somente se mouse não estiver no card */}
          {interativo && (
            <div
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                top: pos.rowTop,
                height: pos.rowHeight,
                zIndex: 99998,
                pointerEvents: 'auto',
              }}
              onMouseLeave={onOverlayLeave}
            />
          )}
          <div
            id={tooltipId}
            role="tooltip"
            className="tg-card"
            data-start={pos.usaBottom ? 'bottom' : 'top'}
            data-interativo={interativo ? 'true' : undefined}
            style={{
              bottom: pos.usaBottom ? pos.bottom : 'auto',
              top:    pos.usaBottom ? 'auto'   : pos.top,
              left:   pos.left,
            }}
            onMouseEnter={interativo ? () => { sobreCardRef.current = true } : undefined}
            onMouseLeave={interativo ? () => { sobreCardRef.current = false; esconde() } : undefined}
          >
            {titulo && <p className="tg-titulo">{titulo}</p>}
            <div className="tg-descricao">{descricao}</div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
