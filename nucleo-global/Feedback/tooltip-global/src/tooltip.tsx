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
import React, { useState, useRef, useId, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom'
import './tooltip.css'
import type { TooltipProps } from './tipos.js'

export function TooltipGlobal({ titulo, descricao, children, interativo }: TooltipProps) {
  const [show, setShow] = useState(false)
  const [pos,  setPos]  = useState({ top: 0, bottom: 0, left: 0, usaBottom: false })
  const ref        = useRef<HTMLSpanElement>(null)
  const cardRef    = useRef<HTMLDivElement>(null)
  const tooltipId  = useId()

  const calcularPos = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      const usaBottom = r.top > 80
      const pxLeft = Math.max(138, Math.min(r.left + r.width / 2, window.innerWidth - 138))
      setPos({
        usaBottom,
        bottom: usaBottom ? window.innerHeight - r.top + 8 : 0,
        top: usaBottom ? 0 : r.bottom + 8,
        left: pxLeft,
      })
    }
  }

  const mostra = useCallback(() => {
    if (document.body.classList.contains('tooltips-disabled')) return
    calcularPos()
    setShow(true)
  }, [])

  const esconde = useCallback(() => setShow(false), [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setShow(false)
  }

  // interativo reservado para uso futuro quando a causa raiz for identificada
  // (interferência ambiental impede fechamento confiável via eventos no card)
  useEffect(() => {
    if (!show || !interativo) return
    // placeholder — não implementado
  }, [show, interativo])

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={mostra}
        onMouseLeave={esconde}
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
        <div
          ref={cardRef}
          id={tooltipId}
          role="tooltip"
          className="tg-card"
          data-start={pos.usaBottom ? 'bottom' : 'top'}
          style={{
            bottom: pos.usaBottom ? pos.bottom : 'auto',
            top:    pos.usaBottom ? 'auto'   : pos.top,
            left:   pos.left,
          }}
        >
          {titulo && <p className="tg-titulo">{titulo}</p>}
          <div className="tg-descricao">{descricao}</div>
        </div>,
        document.body
      )}
    </>
  )
}
