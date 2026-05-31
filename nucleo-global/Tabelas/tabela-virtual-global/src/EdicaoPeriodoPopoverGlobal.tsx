/**
 * Popover de edição de data — mesmo padrão da lista Pedido (GTEditPopover / tipo periodo).
 */
import React, { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import './tabela-virtual.css'
import {
  aplicarMascaraData,
  brToIso,
  dateToIso,
  isoParaHoraInput,
  isoToBR,
  mesclarDataHoraIso,
  parseDateValor,
} from './edicao-periodo-popover-utils.js'

const POPOVER_W = 340

export interface EdicaoPeriodoPopoverGlobalProps {
  anchorRect: DOMRect
  label: string
  valorIso: string | null
  onConfirmar: (iso: string | null) => void
  onCancelar: () => void
  salvando?: boolean
  resultado?: 'sucesso' | 'erro' | null
  placeholderData?: string
  /** Quando true, exibe campo de hora (HH:mm) abaixo da data. */
  comHorario?: boolean
}

export const EdicaoPeriodoPopoverGlobal = memo(function EdicaoPeriodoPopoverGlobal({
  anchorRect: rect,
  label,
  valorIso,
  onConfirmar,
  onCancelar,
  salvando = false,
  resultado = null,
  placeholderData = 'DD/MM/AAAA',
  comHorario = false,
}: EdicaoPeriodoPopoverGlobalProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [calendarioAberto, setCalendarioAberto] = useState(false)
  const [periodoText, setPeriodoText] = useState(() => isoToBR(valorIso))
  const [horaText, setHoraText] = useState(() => isoParaHoraInput(valorIso))
  const [dataIsoLocal, setDataIsoLocal] = useState<string | null>(valorIso)

  useEffect(() => {
    setPeriodoText(isoToBR(valorIso))
    setHoraText(isoParaHoraInput(valorIso))
    setDataIsoLocal(valorIso)
    setCalendarioAberto(false)
  }, [valorIso])

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
  }, [rect, calendarioAberto])

  function handlePeriodoTextChange(text: string) {
    const masked = aplicarMascaraData(text)
    setPeriodoText(masked)
    const iso = brToIso(masked)
    if (iso) setDataIsoLocal(iso)
  }

  function handleCalendarioMudar(val: { inicio: Date | null; fim: Date | null }) {
    if (val.inicio) {
      const iso = dateToIso(val.inicio)
      setPeriodoText(val.inicio.toLocaleDateString('pt-BR'))
      setDataIsoLocal(iso)
    }
  }

  function confirmar() {
    const isoData = brToIso(periodoText) ?? dataIsoLocal
    const final = comHorario ? mesclarDataHoraIso(isoData, horaText) : isoData
    onConfirmar(final)
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
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              autoFocus
              className="gtv-edit-popover-input"
              placeholder={placeholderData}
              value={periodoText}
              disabled={salvando}
              style={{ paddingRight: 36 }}
              onChange={(e) => handlePeriodoTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); confirmar() }
                if (e.key === 'Escape') { e.preventDefault(); onCancelar() }
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!salvando) setCalendarioAberto((v) => !v)
              }}
              disabled={salvando}
              aria-label="Abrir calendário"
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: salvando ? 'not-allowed' : 'pointer',
                color: calendarioAberto ? '#a78bfa' : '#94a3b8',
                borderRadius: 4,
                padding: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"/>
              </svg>
            </button>
          </div>

          {comHorario ? (
            <div className="gtv-edit-popover-hora-row">
              <span className="gtv-edit-popover-hora-label">Hora</span>
              <input
                type="time"
                className="gtv-edit-popover-input"
                value={horaText}
                disabled={salvando}
                onChange={(e) => setHoraText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); confirmar() }
                  if (e.key === 'Escape') { e.preventDefault(); onCancelar() }
                }}
              />
            </div>
          ) : null}

          {calendarioAberto ? (
            <div style={{ marginTop: 8 }}>
              <CampoCalendarioGlobal
                valor={parseDateValor(dataIsoLocal ?? valorIso)}
                aoMudarValor={(val) => {
                  handleCalendarioMudar(val)
                  setCalendarioAberto(false)
                }}
                disabled={salvando}
                modoUnico
                semTrigger
              />
            </div>
          ) : null}
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
