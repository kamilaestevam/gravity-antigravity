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

  const fetchedForRef = useRef<string | null>(null)
  const getTokenRef = useRef(getToken)
  const userImageRef = useRef(user?.imageUrl)
  getTokenRef.current = getToken
  userImageRef.current = user?.imageUrl

  useEffect(() => {
    if (isSignedIn === false) {
      clearCurrentUser()
      fetchedForRef.current = null
    }
  }, [isSignedIn, clearCurrentUser])

  const doFetchMe = useRef(async () => {
    try {
      const token = await getTokenRef.current()
      if (!token) {
        setMeStatus('error')
        return
      }

      const res = await fetch(`${CONFIGURADOR_URL}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        console.warn('[useMeSync] /api/v1/me retornou', res.status)
        setMeStatus('error')
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
        avatarUrl:  userImageRef.current ?? undefined,
        idOrganizacao:   usuario.id_organizacao ?? undefined,
        nomeOrganizacao: organizacao?.nome_organizacao ?? undefined,
        idWorkspacePreferido:   wsAtivo?.id ?? undefined,
        nomeWorkspacePreferido: wsAtivo?.nome_workspace ?? undefined,
        // Label PT-BR traduzido — apenas para exibição na UI.
        role:       resolveRole(usuario.tipo_usuario ?? ''),
        // Valor RAW do enum tipo_usuario — usado para autorização frontend
        // (ex: useOrganizacaoOverride checa se é SUPER_ADMIN/ADMIN).
        // Mandamento 08: autorização não pode depender de label traduzido.
        tipoUsuario: usuario.tipo_usuario ?? undefined,
      })

      if (Array.isArray(workspaces)) {
        setWorkspaces(workspaces)
        if (wsAtivo?.id) setWorkspaceAtivo(wsAtivo.id)
      }

      setMeStatus('success')
    } catch {
      setMeStatus('error')
    }
  }).current

  useEffect(() => {
    if (!isSignedIn || !userId) return
    if (fetchedForRef.current === userId) return

    fetchedForRef.current = userId
    setMeStatus('loading')
    doFetchMe()
  }, [isSignedIn, userId, getToken, user?.imageUrl, setCurrentUser, setMeStatus, setWorkspaces, setWorkspaceAtivo, doFetchMe])

  const refetchMe = useRef(async () => {
    setMeStatus('loading')
    await doFetchMe()
  }).current

  return { refetchMe }
}
