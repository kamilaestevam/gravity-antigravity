// navegar-destino-pos-autenticacao.ts
// Navegação pós-sessão Clerk usando o porteiro SSOT (GET /api/v1/me).
// Consumido por LoginGlobal (via prop), CadastroContinuarPage e fluxos OTP.

import type { NavigateFunction } from 'react-router-dom'
import {
  resolverDestinoPosAutenticacao,
  gravarDestinoCache,
  invalidarCacheDestinoPosAutenticacao,
  ROTAS,
} from './destino-pos-autenticacao.js'

export async function navegarDestinoPosAutenticacao(args: {
  getToken: () => Promise<string | null>
  navigate: NavigateFunction
  userId?: string | null
}): Promise<void> {
  const { getToken, navigate, userId } = args

  if (userId) {
    invalidarCacheDestinoPosAutenticacao(userId)
  }

  const token = await getToken()
  if (!token) {
    console.warn('[porteiro] sem token após autenticação — redirecionando para login')
    navigate(ROTAS.login, { replace: true })
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

  const destino = resolverDestinoPosAutenticacao(res.status, corpo)
  if (userId) {
    gravarDestinoCache(userId, destino)
  }

  if (destino === 'trial') {
    navigate(ROTAS.trial, { replace: true })
    return
  }

  navigate(ROTAS.hub, { replace: true })
}
