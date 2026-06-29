import { useState, useCallback, useRef } from 'react'
import { z } from 'zod'
import type { UseGabiOnDemandResult } from './tipos'

const gabiFieldHelpResponseSchema = z.object({
  titulo: z.string().optional(),
  texto: z.string(),
  exemplo: z.string().optional(),
  quota: z
    .object({
      tokens_usados: z.number().optional(),
    })
    .optional(),
})

function formatarRespostaFieldHelp(data: z.infer<typeof gabiFieldHelpResponseSchema>): string {
  const partes = [data.titulo, data.texto, data.exemplo].filter(
    (p): p is string => typeof p === 'string' && p.length > 0,
  )
  return partes.join('\n\n')
}

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

      const raw: unknown = await res.json()
      const parsed = gabiFieldHelpResponseSchema.safeParse(raw)
      if (!parsed.success) {
        throw new Error('Resposta GABI inválida (contrato ajuda-campo)')
      }
      setResposta(formatarRespostaFieldHelp(parsed.data))
      if (parsed.data.quota?.tokens_usados != null && onTokensUsados) {
        onTokensUsados(parsed.data.quota.tokens_usados)
      }
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
