// use-destino-pos-autenticacao.ts
// Hook do porteiro SSOT — uma chamada GET /api/v1/me por sessão Clerk (cache em módulo).

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import {
  resolverDestinoPosAutenticacao,
  obterDestinoCacheado,
  gravarDestinoCache,
  type DestinoPosAutenticacao,
} from '../routing/destino-pos-autenticacao.js'

export {
  limparCacheDestinoPosAutenticacao,
  invalidarCacheDestinoPosAutenticacao,
} from '../routing/destino-pos-autenticacao.js'

export function useDestinoPosAutenticacao(): {
  destino: DestinoPosAutenticacao
  pronto: boolean
} {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth()

  const [destino, setDestino] = useState<DestinoPosAutenticacao>(() =>
    userId && obterDestinoCacheado(userId) ? obterDestinoCacheado(userId)! : 'carregando',
  )

  const buscandoRef = useRef(false)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn || !userId) {
      setDestino('carregando')
      return
    }

    const cacheado = obterDestinoCacheado(userId)
    if (cacheado) {
      setDestino(cacheado)
      return
    }

    if (buscandoRef.current) return
    buscandoRef.current = true

    getToken()
      .then(async (token) => {
        if (!token) {
          const resolvido = resolverDestinoPosAutenticacao(401, null)
          gravarDestinoCache(userId, resolvido)
          setDestino(resolvido)
          return
        }

        const res = await fetch('/api/v1/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        let corpo: unknown = null
        try {
          if (res.headers.get('content-type')?.includes('application/json')) {
            corpo = await res.json()
          }
        } catch {
          corpo = null
        }

        const resolvido = resolverDestinoPosAutenticacao(res.status, corpo)
        gravarDestinoCache(userId, resolvido)
        setDestino(resolvido)
      })
      .catch((err) => {
        console.warn('[useDestinoPosAutenticacao] falha ao consultar /me — assumindo trial', err)
        const resolvido = resolverDestinoPosAutenticacao(0, null)
        gravarDestinoCache(userId, resolvido)
        setDestino(resolvido)
      })
      .finally(() => {
        buscandoRef.current = false
      })
  }, [isLoaded, isSignedIn, userId, getToken])

  const pronto = destino !== 'carregando'

  return { destino, pronto }
}
