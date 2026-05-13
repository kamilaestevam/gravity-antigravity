// shell/hooks/useMeSync.ts
// Busca contexto do usuário em GET /api/v1/me e popula o shell store.
// Mandamento 01: Clerk = porteiro (valida JWT). Backend = fonte de verdade (user + tenant + role).
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
  PADRAO:      'Standard',
  FORNECEDOR:  'Fornecedor',
}

export function resolveRole(raw: string): string {
  const label = ROLE_LABELS[raw]
  if (!label && raw) console.warn('[resolveRole] tipo_usuario desconhecido:', raw)
  return label ?? 'Standard'
}

export function useMeSync() {
  const { isSignedIn, userId, getToken } = useAuth()
  const { user } = useUser()
  const { setCurrentUser, clearCurrentUser, setMeStatus, setWorkspaces, setWorkspaceAtivo } = useShellStore()

  // Rastreia o userId do Clerk para o qual já fizemos a chamada — evita refetch em re-renders
  const fetchedForRef = useRef<string | null>(null)

  // Limpa o store quando o usuário desloga
  useEffect(() => {
    if (isSignedIn === false) {
      clearCurrentUser()
      fetchedForRef.current = null
      // clearCurrentUser já reseta meStatus para 'idle'
    }
  }, [isSignedIn, clearCurrentUser])

  // Popula o store quando o usuário autentica
  useEffect(() => {
    if (!isSignedIn || !userId) return
    if (fetchedForRef.current === userId) return

    fetchedForRef.current = userId
    setMeStatus('loading')

    async function fetchMe() {
      try {
        const token = await getToken()
        if (!token) {
          setMeStatus('error')
          fetchedForRef.current = null
          return
        }

        const res = await fetch(`${CONFIGURADOR_URL}/api/v1/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          console.warn('[useMeSync] /api/v1/me retornou', res.status)
          setMeStatus('error')
          fetchedForRef.current = null
          return
        }

        const data = await res.json()
        const { usuario, organizacao, workspaces } = data

        const idSessao = sessionStorage.getItem('gravity_company_id')

        const wsAtivo = Array.isArray(workspaces)
          ? workspaces.find((ws: { id: string }) => ws.id === idSessao)
            ?? workspaces.find((ws: { id: string }) => ws.id === usuario.id_workspace_preferido_usuario)
            ?? workspaces[0]
          : undefined

        setCurrentUser({
          id:         usuario.id_usuario,
          name:       usuario.nome_usuario ?? '',
          email:      usuario.email_usuario ?? '',
          avatarUrl:  user?.imageUrl ?? undefined,
          idOrganizacao:   usuario.id_organizacao ?? undefined,
          nomeOrganizacao: organizacao?.nome_organizacao ?? undefined,
          idWorkspacePreferido:   wsAtivo?.id ?? undefined,
          nomeWorkspacePreferido: wsAtivo?.nome_workspace ?? undefined,
          role:       resolveRole(usuario.tipo_usuario ?? ''),
        })

        if (Array.isArray(workspaces)) {
          setWorkspaces(workspaces)
          if (wsAtivo?.id) setWorkspaceAtivo(wsAtivo.id)
        }

        setMeStatus('success')
      } catch {
        setMeStatus('error')
        fetchedForRef.current = null
      }
    }

    fetchMe()
  }, [isSignedIn, userId, getToken, user?.imageUrl, setCurrentUser, setMeStatus, setWorkspaces, setWorkspaceAtivo])
}
