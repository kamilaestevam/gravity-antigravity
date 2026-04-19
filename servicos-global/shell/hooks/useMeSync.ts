// shell/hooks/useMeSync.ts
// Substitui useSyncClerkToShell — busca contexto do usuário em GET /api/v1/me
// em vez de ler publicMetadata do Clerk.
//
// Clerk = porteiro (valida JWT). Backend = fonte de verdade (user + tenant + role).
//
// Deve ser chamado uma vez no Layout principal (ou App.tsx do produto).
// Requer que esteja dentro de um <ClerkProvider>.

import { useEffect, useRef } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useShellStore } from '../store'

const CONFIGURADOR_URL = import.meta.env.VITE_CONFIGURADOR_URL ?? ''

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN:       'Admin',
  MASTER:      'Master',
  STANDARD:    'Standard',
  SUPPLIER:    'Fornecedor',
}

function resolveRole(raw: string): string {
  return ROLE_LABELS[raw] ?? (raw || 'Standard')
}

export function useMeSync() {
  const { isSignedIn, userId, getToken } = useAuth()
  const { user } = useUser()
  const { setCurrentUser, clearCurrentUser } = useShellStore()

  // Rastreia o userId do Clerk para o qual já fizemos a chamada — evita refetch em re-renders
  const fetchedForRef = useRef<string | null>(null)

  // Limpa o store quando o usuário desloga
  useEffect(() => {
    if (isSignedIn === false) {
      clearCurrentUser()
      fetchedForRef.current = null
    }
  }, [isSignedIn, clearCurrentUser])

  // Popula o store quando o usuário autentica
  useEffect(() => {
    if (!isSignedIn || !userId) return
    if (fetchedForRef.current === userId) return

    fetchedForRef.current = userId

    async function fetchMe() {
      try {
        const token = await getToken()
        if (!token) return

        const res = await fetch(`${CONFIGURADOR_URL}/api/v1/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          console.warn('[useMeSync] /api/v1/me retornou', res.status)
          return
        }

        const data = await res.json()
        const { usuario, organizacao } = data

        setCurrentUser({
          id:         usuario.id_usuario,
          name:       usuario.nome_usuario ?? '',
          email:      usuario.email_usuario ?? '',
          avatarUrl:  user?.imageUrl ?? undefined,
          tenantId:   usuario.id_organizacao_usuario ?? undefined,
          tenantName: organizacao?.nome_organizacao ?? undefined,
          role:       resolveRole(usuario.tipo_usuario ?? ''),
        })
      } catch {
        // fire-and-forget — não bloqueia renderização
      }
    }

    fetchMe()
  }, [isSignedIn, userId, getToken, user?.imageUrl, setCurrentUser])
}
