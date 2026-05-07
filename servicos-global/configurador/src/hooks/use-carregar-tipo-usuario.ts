// src/hooks/use-carregar-tipo-usuario.ts
// Carrega o tipo_usuario canonico do banco (via /api/v1/me).
// Fonte de verdade para autorizacao no frontend — nao usa Clerk publicMetadata
// (Mandamento 01: Clerk so autenticacao, autorizacao vem do Prisma).
//
// Cache por id de usuario no nivel de modulo: uma unica chamada por sessao,
// compartilhada entre todos os componentes que usam o hook.

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'

export type TipoUsuario = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR' | null

const cacheTipoUsuario = new Map<string, TipoUsuario>()

/** Limpa o cache de tipo_usuario — deve ser chamado no logout para evitar vazamento entre sessoes */
export function limparCacheTipoUsuario(): void {
  cacheTipoUsuario.clear()
}

export function useCarregarTipoUsuario() {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth()

  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(() =>
    userId ? (cacheTipoUsuario.get(userId) ?? null) : null
  )
  const [pronto, setPronto] = useState(() =>
    !!(userId && cacheTipoUsuario.has(userId))
  )
  const buscandoRef = useRef(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return

    // Cache hit — ja buscamos para este usuario
    if (cacheTipoUsuario.has(userId)) {
      const armazenado = cacheTipoUsuario.get(userId)!
      setTipoUsuario(armazenado)
      setPronto(true)
      return
    }

    // Evita disparo duplo dentro do mesmo render
    if (buscandoRef.current) return
    buscandoRef.current = true

    getToken()
      .then(token => {
        if (!token) {
          setPronto(true)
          return
        }
        return fetch('/api/v1/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => (r.ok ? r.json() : null))
          .then(data => {
            const tipoUsuarioBanco = (data?.usuario?.tipo_usuario ?? null) as TipoUsuario
            cacheTipoUsuario.set(userId, tipoUsuarioBanco)
            setTipoUsuario(tipoUsuarioBanco)
            setPronto(true)
          })
      })
      .catch(() => {
        // Falha silenciosa — `pronto` sinaliza que a verificacao terminou
        setPronto(true)
      })
  }, [isLoaded, isSignedIn, userId, getToken])

  const gravityAdmin = tipoUsuario === 'SUPER_ADMIN' || tipoUsuario === 'ADMIN'

  return { pronto, gravityAdmin, tipoUsuario }
}
