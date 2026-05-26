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

const DELAY_ESCONDER_INTERATIVO_MS = 120

function tooltipsGlobaisDesabilitados(): boolean {
  return typeof document !== 'undefined' && document.body.classList.contains('tooltips-disabled')
}

export function TooltipGlobal({
  titulo,
  descricao,
  children,
  interativo,
  posicaoPreferida = 'auto',
}: TooltipProps) {
  const [show, setShow] = useState(false)
  const [bloqueado, setBloqueado] = useState(tooltipsGlobaisDesabilitados)
  const [pos,  setPos]  = useState({ top: 0, bottom: 0, left: 0, usaBottom: false })
  const ref        = useRef<HTMLSpanElement>(null)
  const cardRef    = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId  = useId()

  const limparTimerEsconder = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const calcularPos = useCallback(() => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      let usaBottom: boolean
      if (posicaoPreferida === 'abaixo') {
        usaBottom = false
      } else if (posicaoPreferida === 'acima') {
        usaBottom = true
      } else {
        usaBottom = r.top > 80
      }
      const pxLeft = Math.max(138, Math.min(r.left + r.width / 2, window.innerWidth - 138))
      setPos({
        usaBottom,
        bottom: usaBottom ? window.innerHeight - r.top + 8 : 0,
        top: usaBottom ? 0 : r.bottom + 8,
        left: pxLeft,
      })
    }
  }, [posicaoPreferida])

  useEffect(() => {
    const sincronizar = () => {
      const off = tooltipsGlobaisDesabilitados()
      setBloqueado(off)
      if (off) setShow(false)
    }
    sincronizar()
    const obs = new MutationObserver(sincronizar)
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const mostra = useCallback(() => {
    if (bloqueado || tooltipsGlobaisDesabilitados()) return
    limparTimerEsconder()
    calcularPos()
    setShow(true)
  }, [bloqueado, calcularPos, limparTimerEsconder])

  const esconde = useCallback(() => {
    limparTimerEsconder()
    if (interativo) {
      hideTimerRef.current = setTimeout(() => setShow(false), DELAY_ESCONDER_INTERATIVO_MS)
      return
    }
    setShow(false)
  }, [interativo, limparTimerEsconder])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      limparTimerEsconder()
      setShow(false)
    }
  }

  useEffect(() => () => limparTimerEsconder(), [limparTimerEsconder])

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

      {show && !bloqueado && ReactDOM.createPortal(
        <div
          ref={cardRef}
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
          onMouseEnter={interativo ? mostra : undefined}
          onMouseLeave={interativo ? esconde : undefined}
        >
          {titulo && <p className="tg-titulo">{titulo}</p>}
          <div className="tg-descricao">{descricao}</div>
        </div>,
        document.body
      )}
    </>
  )
}
