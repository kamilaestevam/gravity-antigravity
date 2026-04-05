import { useState, useCallback, useRef } from 'react'
import type { UseGabiOnDemandResult } from './tipos'

export function useGabiOnDemand(
  campo:         string,
  contexto:      Record<string, unknown>,
  gabiEndpoint:  string,
  onTokensUsados?: (total: number) => void,
): UseGabiOnDemandResult {
  const [resposta,   setResposta]   = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [esgotado,   setEsgotado]   = useState(false)
  const [erro,       setErro]       = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const consultar = useCallback(async () => {
    if (carregando) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setCarregando(true)
    setErro(null)

    try {
      const res = await fetch(gabiEndpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ campo, contexto }),
        signal:  ctrl.signal,
      })

      if (res.status === 403) {
        setEsgotado(true)
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error?.message ?? 'Erro ao consultar GABI')
      }

      const data = await res.json()
      setResposta(data.resposta ?? '')
      if (data.tokens_total && onTokensUsados) onTokensUsados(data.tokens_total)
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setCarregando(false)
    }
  }, [campo, contexto, gabiEndpoint, carregando, onTokensUsados])

  const limpar = useCallback(() => {
    setResposta(null)
    setErro(null)
  }, [])

  return { consultar, resposta, carregando, esgotado, erro, limpar }
}
