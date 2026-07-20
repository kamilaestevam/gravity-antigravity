import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import {
  guiaGravityRankingResponseSchema,
  type GuiaGravityRankingResponse,
} from '../../shared/guia-gravity/guia-gravity-jornada-schema.js'

export interface EstadoRankingGuiaGravity {
  carregando: boolean
  erro: string | null
  ranking: GuiaGravityRankingResponse['ranking']
  recarregar: () => Promise<void>
}

export function useRankingGuiaGravity(limite = 10): EstadoRankingGuiaGravity {
  const { getToken, isSignedIn } = useAuth()
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [ranking, setRanking] = useState<GuiaGravityRankingResponse['ranking']>([])

  const recarregar = useCallback(async () => {
    if (!isSignedIn) {
      setCarregando(false)
      return
    }
    setCarregando(true)
    setErro(null)
    try {
      const token = await getToken()
      if (!token) throw new Error('Sessão expirada')
      const res = await fetch(`/api/v1/guia-gravity/ranking?limite=${limite}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Falha ao carregar ranking (${res.status})`)
      const raw = await res.json()
      const parsed = guiaGravityRankingResponseSchema.parse(raw)
      setRanking(parsed.ranking)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar ranking')
      setRanking([])
    } finally {
      setCarregando(false)
    }
  }, [getToken, isSignedIn, limite])

  useEffect(() => {
    void recarregar()
  }, [recarregar])

  return { carregando, erro, ranking, recarregar }
}
