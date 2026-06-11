/**
 * @nucleo/tabela-virtual-global — useGTJanelaVirtual
 *
 * Windowing (virtualização real) das linhas da tabela: calcula, a partir do
 * scroll do container, qual fatia de `linhas` precisa estar montada no DOM e
 * quanto de altura os spacers (topo/fundo) devem ocupar para o scrollbar
 * permanecer correto.
 *
 * Motivação: a tabela renderizava TODAS as linhas pai+filho da página de uma
 * vez — com ~100 pedidos + ~800 itens × dezenas de colunas, o "Expandir todos"
 * bloqueava a main thread por ~8s (INP 8.040ms medido em 2026-06-11). Com a
 * janela, o custo de render passa a ser proporcional ao viewport (~20-40
 * linhas), não à página.
 *
 * As alturas são determinísticas (células `white-space: nowrap` + `min-height`
 * fixo), então o chamador fornece a altura estimada por linha e o hook usa
 * soma de prefixos + busca binária — sem ResizeObserver por linha.
 */

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'

export interface GTJanelaVirtualResultado {
  /** Windowing ativo? (false quando a página tem poucas linhas — render integral) */
  ativo: boolean
  /** Índice inicial (inclusivo) da fatia a renderizar */
  inicio: number
  /** Índice final (exclusivo) da fatia a renderizar */
  fim: number
  /** Altura do spacer acima da fatia (px) */
  alturaTopo: number
  /** Altura do spacer abaixo da fatia (px) */
  alturaFundo: number
  /** Offset acumulado (px) do topo de cada linha, relativo à primeira linha.
   *  offsets[i] = soma das alturas das linhas 0..i-1. length = linhas + 1. */
  offsets: number[]
}

// Altura estimada do viewport antes da primeira medição (evita janela vazia
// no primeiro paint quando o container ainda não foi medido).
const VIEWPORT_FALLBACK_PX = 900

/** Soma de prefixos: offsets[i] = soma das alturas das linhas 0..i-1. */
export function somaPrefixosAlturas(alturas: number[]): number[] {
  const out = new Array<number>(alturas.length + 1)
  out[0] = 0
  for (let i = 0; i < alturas.length; i++) out[i + 1] = out[i] + alturas[i]
  return out
}

/** Maior índice i tal que offsets[i] <= alvo (busca binária em soma de prefixos). */
export function indicePorOffset(offsets: number[], alvo: number): number {
  let lo = 0
  let hi = offsets.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (offsets[mid] <= alvo) lo = mid
    else hi = mid - 1
  }
  return lo
}

/** Núcleo puro do windowing — calcula a fatia [inicio, fim) e os spacers. */
export function calcularJanelaVirtual(
  offsets: number[],
  scrollTop: number,
  alturaViewport: number,
  overscan: number,
): { inicio: number; fim: number; alturaTopo: number; alturaFundo: number } {
  const total = offsets.length - 1
  const viewport = alturaViewport > 0 ? alturaViewport : VIEWPORT_FALLBACK_PX
  const alturaTotal = offsets[total]

  let inicio = indicePorOffset(offsets, Math.max(0, scrollTop))
  let fim = indicePorOffset(offsets, Math.min(alturaTotal, scrollTop + viewport)) + 1
  inicio = Math.max(0, inicio - overscan)
  fim = Math.min(total, fim + overscan)

  return {
    inicio,
    fim,
    alturaTopo: offsets[inicio],
    alturaFundo: alturaTotal - offsets[fim],
  }
}

export function useGTJanelaVirtual(
  scrollRef: RefObject<HTMLElement | null>,
  alturas: number[],
  opts?: {
    /** Mínimo de linhas para ativar a janela (abaixo disso, render integral). Default 80. */
    minLinhas?: number
    /** Linhas extras renderizadas acima/abaixo do viewport. Default 12. */
    overscan?: number
  },
): GTJanelaVirtualResultado {
  const minLinhas = opts?.minLinhas ?? 80
  const overscan = opts?.overscan ?? 12
  const ativo = alturas.length >= minLinhas

  const offsets = useMemo(() => somaPrefixosAlturas(alturas), [alturas])

  const [scrollTop, setScrollTop] = useState(0)
  const [alturaViewport, setAlturaViewport] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!ativo) return
    const el = scrollRef.current
    if (!el) return

    const sincronizar = () => {
      rafRef.current = null
      setScrollTop(el.scrollTop)
    }
    const onScroll = () => {
      // Throttle por frame: N eventos de scroll → 1 setState por paint
      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(sincronizar)
    }

    setScrollTop(el.scrollTop)
    setAlturaViewport(el.clientHeight)
    el.addEventListener('scroll', onScroll, { passive: true })

    const ro = new ResizeObserver(() => setAlturaViewport(el.clientHeight))
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    // alturas.length: o container é desmontado/remontado quando os dados trocam
    // (estado `carregando`) — religa o listener no novo elemento.
  }, [ativo, scrollRef, alturas.length])

  return useMemo<GTJanelaVirtualResultado>(() => {
    const total = alturas.length
    if (!ativo || total === 0) {
      return { ativo: false, inicio: 0, fim: total, alturaTopo: 0, alturaFundo: 0, offsets }
    }
    return {
      ativo: true,
      ...calcularJanelaVirtual(offsets, scrollTop, alturaViewport, overscan),
      offsets,
    }
  }, [ativo, alturas.length, offsets, scrollTop, alturaViewport, overscan])
}
