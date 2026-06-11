/**
 * Popover de edição de texto — mesmo padrão visual do EdicaoPeriodoPopoverGlobal.
 */
import React, { memo, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './tabela-virtual.css'

const POPOVER_W = 340

export interface EdicaoTextoPopoverGlobalProps {
  anchorRect: DOMRect
  label: string
  valor: string | null
  onConfirmar: (texto: string | null) => void
  onCancelar: () => void
  salvando?: boolean
  resultado?: 'sucesso' | 'erro' | null
  placeholder?: string
}

export const EdicaoTextoPopoverGlobal = memo(function EdicaoTextoPopoverGlobal({
  anchorRect: rect,
  label,
  valor,
  onConfirmar,
  onCancelar,
  salvando = false,
  resultado = null,
  placeholder = '',
}: EdicaoTextoPopoverGlobalProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [texto, setTexto] = useState(valor ?? '')

  const [pos, setPos] = useState(() => {
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_W - 8))
    return { top: rect.bottom + 8, left, arrowLeft: 16, flipUp: false }
  })

  useLayoutEffect(() => {
    const el = popoverRef.current
    if (!el) return
    const h = el.offsetHeight
    const w = el.offsetWidth
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - w - 8))
    const arrowLeft = Math.max(12, Math.min(w - 20, (rect.left + rect.width / 2) - left))
    const belowOk = rect.bottom + h + 12 <= window.innerHeight
    const top = belowOk ? rect.bottom + 8 : Math.max(8, rect.top - h - 8)
    setPos({ top, left, arrowLeft, flipUp: !belowOk })
  }, [rect])

  function confirmar() {
    onConfirmar(texto.trim() || null)
  }

  const conteudo = (
    <>
      <div className="gtv-edit-popover-backdrop" onMouseDown={() => onCancelar()} />
      <div
        className={`gtv-edit-popover-arrow${pos.flipUp ? ' gtv-edit-popover-arrow--flip' : ''}`}
        style={{
          position: 'fixed',
          left: pos.left + pos.arrowLeft,
          top: pos.flipUp ? pos.top + (popoverRef.current?.offsetHeight ?? 0) : pos.top - 8,
          zIndex: 10000,
        }}
      />
      <div
        ref={popoverRef}
        className={`gtv-edit-popover${pos.flipUp ? ' gtv-edit-popover--flip' : ''}`}
        style={{ top: pos.top, left: pos.left, position: 'fixed', zIndex: 10001 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="gtv-edit-popover-header">
          <span className="gtv-edit-popover-label">
            <svg width="11" height="11" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160l96-96,32,32-96,96ZM48,179.31,76.69,208H48Zm160-96L176,115.31,140.69,80,163.31,57.37,208,102Z"/>
            </svg>
            {label}
          </span>
          <button
            type="button"
            className="gtv-edit-popover-close"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onCancelar()}
            aria-label="Cancelar edição"
          >
            <svg width="9" height="9" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
            </svg>
          </button>
        </div>

        <div className="gtv-edit-popover-body">
          <input
            autoFocus
            type="text"
            className="gtv-edit-popover-input"
            placeholder={placeholder}
            value={texto}
            disabled={salvando}
            aria-label={label}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); confirmar() }
              if (e.key === 'Escape') { e.preventDefault(); onCancelar() }
            }}
          />
        </div>

        <div className="gtv-edit-popover-footer">
          <div className="gtv-edit-popover-hints" aria-hidden="true">
            <kbd className="gtv-edit-popover-kbd">Enter</kbd>
            <span>Confirmar</span>
            <span className="gtv-edit-popover-sep">·</span>
            <kbd className="gtv-edit-popover-kbd">Esc</kbd>
            <span>Cancelar</span>
          </div>
          <div className="gtv-edit-popover-actions">
            <button
              type="button"
              className="gtv-edit-popover-btn gtv-edit-popover-btn--ghost"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onCancelar()}
              tabIndex={-1}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={[
                'gtv-edit-popover-btn gtv-edit-popover-btn--primary',
                salvando ? 'gtv-edit-popover-btn--salvando' : '',
                resultado === 'sucesso' ? 'gtv-edit-popover-btn--sucesso' : '',
                resultado === 'erro' ? 'gtv-edit-popover-btn--erro' : '',
              ].filter(Boolean).join(' ')}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => confirmar()}
              disabled={salvando || resultado !== null}
              tabIndex={-1}
              aria-busy={salvando || undefined}
            >
              {salvando ? 'Salvando…' : resultado === 'sucesso' ? 'Salvo' : resultado === 'erro' ? 'Erro' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(conteudo, document.body)
})
