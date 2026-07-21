import type { Active } from '@dnd-kit/core'

export type CaixaArrasteKanban = {
  left: number
  top: number
  width: number
}

/** Mede o card na viewport — fallback no DOM se o dnd-kit ainda não tiver rect. */
export function medirRectArrasteKanban(active: Active): CaixaArrasteKanban | null {
  const rects = active.rect.current
  const medido = rects?.initial ?? rects?.translated ?? null
  if (medido && medido.width > 0) {
    return { left: medido.left, top: medido.top, width: medido.width }
  }

  if (typeof document === 'undefined') return null
  const el = document.querySelector(`[data-card-id="${active.id}"]`)
  const dom = el?.getBoundingClientRect()
  if (!dom || dom.width <= 0) return null
  return { left: dom.left, top: dom.top, width: dom.width }
}
