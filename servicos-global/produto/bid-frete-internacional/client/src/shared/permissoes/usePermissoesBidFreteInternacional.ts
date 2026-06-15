// client/src/shared/permissoes/usePermissoesBidFreteInternacional.ts
//
// Paridade usePermissoesPedido — permissões granulares via Configurador (/me + workspace).
// UX only; backend valida 403 em mutações.

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import { useEffect, useRef } from 'react'

const CONFIGURADOR_URL = import.meta.env.VITE_CONFIGURADOR_URL ?? ''
const SLUG_PRODUTO = 'bid-frete-internacional'

const TIPOS_BYPASS: ReadonlyArray<string> = ['Super Admin', 'Admin', 'Master']

export type EstadoPermissao = 'permitido' | 'negado' | 'indeterminado'

export type SecaoBidFreteInternacional =
  | 'dashboard'
  | 'kanban'
  | 'lista'
  | 'configuracao'
  | 'relatorios'
  | 'historico'

export interface UsePermissoesBidFreteInternacionalResult {
  carregando: boolean
  erro: string | null
  bypass: boolean
  estado: (secao: SecaoBidFreteInternacional, acao: 'ver' | 'editar') => EstadoPermissao
  podeVer: (secao: SecaoBidFreteInternacional) => boolean
  podeEditar: (secao: SecaoBidFreteInternacional) => boolean
  pode: (secao: SecaoBidFreteInternacional, acao: 'ver' | 'editar') => boolean
  recarregar: () => void
}

interface PermissaoUsuarioApiItem {
  permissao_usuario: string
  id_workspace: string
  id_produto_gravity: string
}

interface PermissoesResponse {
  permissoes: PermissaoUsuarioApiItem[]
}

export function usePermissoesBidFreteInternacional(): UsePermissoesBidFreteInternacionalResult {
  const { getToken, isSignedIn } = useAuth()
  const currentUser = useShellStore((s: { currentUser: { id?: string; role?: string } }) => s.currentUser)
  const idWorkspaceAtivo = useShellStore((s: { idWorkspaceAtivo: string | null }) => s.idWorkspaceAtivo)
  const meStatus = useShellStore((s: { meStatus: 'idle' | 'loading' | 'success' | 'error' }) => s.meStatus)

  const idUsuario = currentUser?.id
  const role = currentUser?.role ?? ''
  const bypass = TIPOS_BYPASS.includes(role)

  const enabled = !bypass && !!isSignedIn && !!idUsuario && !!idWorkspaceAtivo

  const query = useQuery<Set<string>, Error>({
    queryKey: ['permissoes', SLUG_PRODUTO, idUsuario, idWorkspaceAtivo],
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error('Sem token de autenticação')
      const url = `${CONFIGURADOR_URL}/api/v1/usuarios/${encodeURIComponent(idUsuario!)}/permissoes?id_workspace=${encodeURIComponent(idWorkspaceAtivo!)}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status} ao carregar permissões`)
      const data: PermissoesResponse = await res.json()
      const set = new Set<string>()
      for (const p of data.permissoes) {
        if (p.permissao_usuario.startsWith(`${SLUG_PRODUTO}:`)) set.add(p.permissao_usuario)
      }
      return set
    },
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  })

  const terminalIncompleto = !bypass && meStatus === 'success' && (!idUsuario || !idWorkspaceAtivo)
  const jaLogou = useRef(false)
  useEffect(() => {
    if (terminalIncompleto && !jaLogou.current) {
      jaLogou.current = true
      console.warn(
        '[usePermissoesBidFreteInternacional] /me concluiu mas identidade/workspace está incompleto.',
        { idUsuario: idUsuario ?? null, idWorkspaceAtivo, meStatus },
        '→ tratando como NEGADO (Mand. 08).',
      )
    }
    if (!terminalIncompleto) jaLogou.current = false
  }, [terminalIncompleto, idUsuario, idWorkspaceAtivo, meStatus])

  const carregando =
    !bypass &&
    !!isSignedIn &&
    !terminalIncompleto &&
    meStatus !== 'error' &&
    (meStatus === 'idle' || meStatus === 'loading' || (!!idUsuario && !!idWorkspaceAtivo && query.isPending))

  function temChaveNoBanco(secao: SecaoBidFreteInternacional, acao: 'ver' | 'editar'): boolean {
    if (!query.data) return false
    return query.data.has(`${SLUG_PRODUTO}:${secao}:${acao}`)
  }

  function estado(secao: SecaoBidFreteInternacional, acao: 'ver' | 'editar'): EstadoPermissao {
    if (bypass) return 'permitido'
    if (carregando) return 'indeterminado'
    return temChaveNoBanco(secao, acao) ? 'permitido' : 'negado'
  }

  function podeVer(secao: SecaoBidFreteInternacional): boolean {
    return estado(secao, 'ver') === 'permitido'
  }

  function podeEditar(secao: SecaoBidFreteInternacional): boolean {
    return estado(secao, 'editar') === 'permitido'
  }

  function pode(secao: SecaoBidFreteInternacional, acao: 'ver' | 'editar'): boolean {
    return estado(secao, acao) === 'permitido'
  }

  return {
    carregando,
    erro: !bypass && query.error ? String(query.error.message ?? query.error) : null,
    bypass,
    estado,
    podeVer,
    podeEditar,
    pode,
    recarregar: () => { void query.refetch() },
  }
}
