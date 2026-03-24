/**
 * @nucleo/tooltip-global — tooltip-acao.tsx
 *
 * Tooltip rica para botões de ação (filtrar, exportar, salvar, excluir).
 * - Preview animado (WebP loop) da funcionalidade
 * - Beacon azul pulsante que some após primeira visualização (localStorage)
 * - Smart positioning: aparece embaixo se não houver espaço acima
 * - Wrapper span lida com hover — filho mantém seu ref original intacto
 *
 * Uso:
 *   <TooltipAcao
 *     acaoId="filtrar-filial"
 *     titulo="Filtro por coluna"
 *     descricao="Selecione valores exatos como numa planilha."
 *     midia={filtrarWebp}
 *   >
 *     <button ...>...</button>
 *   </TooltipAcao>
 */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom'
import './tooltip-acao.css'
import type { TooltipAcaoProps } from './tipos.js'

const STORAGE_PREFIX  = 'gravity_seen_'
const HOVER_VISTO_MS  = 1500   // ms de hover para marcar como "visto"
const SHOW_DELAY_MS   = 350    // delay antes de mostrar o card
const CARD_WIDTH      = 280    // px — deve coincidir com .ta-card width
const CARD_GAP        = 8      // px entre âncora e card

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function jaViu(id: string)  { try { return localStorage.getItem(STORAGE_PREFIX + id) === '1' } catch { return false } }
function marcar(id: string) { try { localStorage.setItem(STORAGE_PREFIX + id, '1') } catch { /* noop */ } }

/* ── Componente ───────────────────────────────────────────────────────────── */

export function TooltipAcao({
  acaoId,
  titulo,
  descricao,
  midia,
  categoria = 'TUTORIAL',
  duracao,
  linkDoc,
  children,
}: TooltipAcaoProps) {
  const [visivel, setVisivel] = useState(false)
  const [visto,   setVisto]   = useState(() => jaViu(acaoId))
  const [pos, setPos]         = useState<{ top: number; left: number; posBaixo: boolean }>({ top: 0, left: 0, posBaixo: false })
  const [positioned, setPositioned] = useState(false)  // só mostra após posicionar

  const wrapRef   = useRef<HTMLSpanElement>(null)
  const cardRef   = useRef<HTMLDivElement>(null)
  const timerShow = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerViu  = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Calcula posição — smart: acima se couber, abaixo se não couber */
  useEffect(() => {
    if (!visivel || !wrapRef.current) return

    const a = wrapRef.current.getBoundingClientRect()
    const cardH = cardRef.current?.getBoundingClientRect().height ?? 260

    const spaceAbove = a.top
    const posBaixo = spaceAbove < cardH + CARD_GAP + 8

    const top = posBaixo
      ? a.bottom + window.scrollY + CARD_GAP
      : a.top + window.scrollY - cardH - CARD_GAP

    // Centraliza horizontalmente, garante que não sai da viewport
    const rawLeft = a.left + window.scrollX + a.width / 2
    const minLeft = 8
    const maxLeft = window.innerWidth - CARD_WIDTH - 8
    const left = Math.max(minLeft, Math.min(rawLeft, maxLeft))

    setPos({ top, left, posBaixo })
    setPositioned(true)
  }, [visivel])

  const mostrar = useCallback(() => {
    timerShow.current = setTimeout(() => setVisivel(true), SHOW_DELAY_MS)
    if (!visto) {
      timerViu.current = setTimeout(() => {
        marcar(acaoId)
        setVisto(true)
      }, HOVER_VISTO_MS)
    }
  }, [acaoId, visto])

  const esconder = useCallback(() => {
    if (timerShow.current) clearTimeout(timerShow.current)
    if (timerViu.current)  clearTimeout(timerViu.current)
    setVisivel(false)
    setPositioned(false)
  }, [])

  useEffect(() => () => {
    if (timerShow.current) clearTimeout(timerShow.current)
    if (timerViu.current)  clearTimeout(timerViu.current)
  }, [])

  return (
    <>
      {/*
        Wrapper span lida com mouse events.
        O filho (button) fica intocado — mantém seu próprio ref.
      */}
      <span
        ref={wrapRef}
        className="ta-anchor-wrap"
        onMouseEnter={mostrar}
        onMouseLeave={esconder}
      >
        {children}
        {!visto && <span className="ta-beacon" aria-hidden="true" />}
      </span>

      {/* Card — portal no body, invisível até ter posição calculada */}
      {visivel && ReactDOM.createPortal(
        <div
          ref={cardRef}
          role="tooltip"
          className={`ta-card${positioned ? ' ta-card--visible' : ''}`}
          data-pos-baixo={pos.posBaixo ? 'true' : undefined}
          style={{ top: pos.top, left: pos.left }}
        >
          {midia && (
            <img src={midia} alt={`Preview: ${titulo}`} className="ta-preview" />
          )}

          <div className="ta-body">
            <div className="ta-chip">
              <span className="ta-chip-dot" aria-hidden="true" />
              {categoria}{duracao ? ` · ${duracao}` : ''}
            </div>
            <p className="ta-titulo">{titulo}</p>
            <p className="ta-descricao">{descricao}</p>
          </div>

          {linkDoc && (
            <div className="ta-footer">
              <a href={linkDoc} className="ta-link" target="_blank" rel="noreferrer">
                Ver documentação →
              </a>
              {duracao && <span className="ta-duracao">{duracao}</span>}
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  )
}
