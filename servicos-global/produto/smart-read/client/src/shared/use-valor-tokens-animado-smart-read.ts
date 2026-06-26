/**
 * use-valor-tokens-animado-smart-read.ts — contagem progressiva enquanto o alvo sobe
 */

import { useEffect, useRef, useState } from 'react'

type Opcoes = {
  /** Quando false, congela no valor atual (IA parada) */
  animar?: boolean
  intervaloMs?: number
}

export function useValorTokensAnimadoSmartRead(
  valorAlvo: number,
  opcoes: Opcoes = {},
): number {
  const animar = opcoes.animar ?? true
  const intervaloMs = opcoes.intervaloMs ?? 36
  const [exibido, setExibido] = useState(() =>
    Number.isFinite(valorAlvo) && valorAlvo >= 0 ? valorAlvo : 0,
  )
  const alvoRef = useRef(valorAlvo)
  alvoRef.current = Number.isFinite(valorAlvo) && valorAlvo >= 0 ? valorAlvo : 0

  useEffect(() => {
    if (!animar) return

    const id = window.setInterval(() => {
      setExibido((anterior) => {
        const alvo = alvoRef.current
        if (anterior === alvo) return anterior
        if (anterior > alvo) return alvo
        const delta = alvo - anterior
        const passo = Math.max(1, Math.ceil(delta / 20))
        return Math.min(alvo, anterior + passo)
      })
    }, intervaloMs)

    return () => window.clearInterval(id)
  }, [animar, intervaloMs])

  useEffect(() => {
    if (!animar) {
      setExibido(Number.isFinite(valorAlvo) && valorAlvo >= 0 ? valorAlvo : 0)
    }
  }, [animar, valorAlvo])

  return exibido
}
