// src/hooks/useLoadSystemRole.ts
// Carrega o role canônico do usuário a partir do banco (via /api/v1/me).
// Fonte de verdade para autorização no frontend — não usa Clerk publicMetadata.
//
// Cache por userId no nível de módulo: uma única chamada por sessão,
// compartilhada entre todos os componentes que usam o hook.

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'

export type SystemRole = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'STANDARD' | 'SUPPLIER' | null

const roleCache = new Map<string, SystemRole>()

/** Limpa o cache de role — deve ser chamado no logout para evitar vazamento entre sessões */
export function invalidateRoleCache(): void {
  roleCache.clear()
}

export function useLoadSystemRole() {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth()

  const [role, setRole] = useState<SystemRole>(() =>
    userId ? (roleCache.get(userId) ?? null) : null
  )
  const [isReady, setIsReady] = useState(() =>
    !!(userId && roleCache.has(userId))
  )
  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return

    // Cache hit — já buscamos para este usuário
    if (roleCache.has(userId)) {
      const cached = roleCache.get(userId)!
      setRole(cached)
      setIsReady(true)
      return
    }

    // Evita disparo duplo dentro do mesmo render
    if (fetchingRef.current) return
    fetchingRef.current = true

    getToken()
      .then(token => {
        if (!token) {
          setIsReady(true)
          return
        }
        return fetch('/api/v1/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => (r.ok ? r.json() : null))
          .then(data => {
            const dbRole = (data?.user?.role ?? null) as SystemRole
            roleCache.set(userId, dbRole)
            setRole(dbRole)
            setIsReady(true)
          })
      })
      .catch(() => {
        // Falha silenciosa — isReady sinaliza que a verificação terminou
        setIsReady(true)
      })
  }, [isLoaded, isSignedIn, userId, getToken])

  const isGravityAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN'

  return { isReady, isGravityAdmin, role }
}
