/**
 * @nucleo/tooltip-global — tooltip.tsx
 *
 * Tooltip acessível renderizada via ReactDOM.createPortal no document.body,
 * escapando qualquer overflow:hidden do DOM pai.
 *
 * Uso:
 *   <TooltipGlobal texto="Empresa filha vinculada ao tenant">
 *     <span>Filial</span>
 *   </TooltipGlobal>
 */
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  cloneElement,
  type ReactElement,
} from 'react'
import ReactDOM from 'react-dom'
import './tooltip.css'
import type { TooltipProps, TooltipPosicao } from './tipos.js'

/* ── Cálculo de posição ────────────────────────────────────────────────────── */

const GAP = 8 // px entre âncora e tooltip

interface Pos { top: number; left: number }

function calcularPosicao(
  anchor: DOMRect,
  balao: DOMRect,
  pos: TooltipPosicao,
  scroll: { x: number; y: number },
): Pos {
  const { x, y } = scroll
  switch (pos) {
    case 'top':
      return {
        top: anchor.top + y - balao.height - GAP,
        left: anchor.left + x + anchor.width / 2,
      }
    case 'bottom':
      return {
        top: anchor.bottom + y + GAP,
        left: anchor.left + x + anchor.width / 2,
      }
    case 'left':
      return {
        top: anchor.top + y + anchor.height / 2,
        left: anchor.left + x - balao.width - GAP,
      }
    case 'right':
      return {
        top: anchor.top + y + anchor.height / 2,
        left: anchor.right + x + GAP,
      }
  }
}

/* ── Componente ────────────────────────────────────────────────────────────── */

export function TooltipGlobal({
  texto,
  posicao = 'top',
  delay = 300,
  children,
}: TooltipProps) {
  const [visivel, setVisivel] = useState(false)
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0 })

  const anchorRef = useRef<HTMLElement | null>(null)
  const balaoRef  = useRef<HTMLDivElement | null>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Recalcula posição quando o tooltip fica visível */
  useEffect(() => {
    if (!visivel || !anchorRef.current || !balaoRef.current) return
    const aRect = anchorRef.current.getBoundingClientRect()
    const bRect = balaoRef.current.getBoundingClientRect()
    setPos(calcularPosicao(aRect, bRect, posicao, { x: window.scrollX, y: window.scrollY }))
  }, [visivel, posicao])

  const mostrar = useCallback(() => {
    timerRef.current = setTimeout(() => setVisivel(true), delay)
  }, [delay])

  const esconder = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisivel(false)
  }, [])

  // Limpa timer ao desmontar
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  /* Injeta os event handlers no filho sem criar wrapper extra */
  const child = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: (node: HTMLElement | null) => { anchorRef.current = node },
    onMouseEnter: (e: React.MouseEvent) => {
      mostrar()
      const original = (children as ReactElement<Record<string, unknown>>).props.onMouseEnter
      if (typeof original === 'function') original(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      esconder()
      const original = (children as ReactElement<Record<string, unknown>>).props.onMouseLeave
      if (typeof original === 'function') original(e)
    },
    onFocus: (e: React.FocusEvent) => {
      mostrar()
      const original = (children as ReactElement<Record<string, unknown>>).props.onFocus
      if (typeof original === 'function') original(e)
    },
    onBlur: (e: React.FocusEvent) => {
      esconder()
      const original = (children as ReactElement<Record<string, unknown>>).props.onBlur
      if (typeof original === 'function') original(e)
    },
  })

  return (
    <>
      {child}
      {visivel && ReactDOM.createPortal(
        <div
          ref={balaoRef}
          role="tooltip"
          className="tg-balao"
          data-pos={posicao}
          style={{ top: pos.top, left: pos.left }}
        >
          {texto}
        </div>,
        document.body,
      )}
    </>
  )
}
