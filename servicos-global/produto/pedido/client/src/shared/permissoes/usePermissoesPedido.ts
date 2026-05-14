// client/src/shared/permissoes/usePermissoesPedido.ts
//
// Hook React Query — carrega as permissões granulares do usuário logado
// para o produto Pedido no workspace ativo. Bypass natural pra Master/SAdmin/Admin
// (Mandamento 04 LIMBO).
//
// Defesa em profundidade: este hook serve APENAS pra UX (esconder/opacar
// menus + botões). O backend (helper `criarRequirePermissao` no resolver-
// organizacao) é a fonte da verdade — toda rota protegida valida 403
// independente do que esse hook devolve.
//
// ─────────────────────────────────────────────────────────────────────────────
// SEMÂNTICA DE ESTADO (revisão Coordenador + Líder Técnico 2026-05-14)
//
// Pivô da implementação anterior (otimista) para **estado tri-state explícito**
// — motivo: a versão otimista violava Mand. 08 (fail loud). Quando `meStatus`
// chegava a 'success' mas `idWorkspaceAtivo` ficava `null` (cenário real de
// Standard sem workspace resolvido), o hook tratava como "ainda carregando"
// indefinidamente e `podeVer` retornava `true` sem rastro — destravava sidebar
// inteira em silêncio.
//
// Nova máquina de estados:
//   1. `carregando = true`  → ME genuinamente em voo (idle/loading) OU query
//                              pendente com identidade completa.
//   2. `carregando = false` + identidade incompleta após `success` → estado
//                              TERMINAL NEGADO. Emite console.warn (Mand. 08)
//                              e fecha tudo. NÃO é mais "carregando".
//   3. `carregando = false` + query resolvida → decisão real por chave.
//
// API:
//   - `estado(secao, acao)` → 'permitido' | 'negado' | 'indeterminado'
//                              Tri-state. Use quando callsite quer renderizar
//                              skeleton em 'indeterminado'.
//   - `podeVer`/`podeEditar`  ESTRITOS — só retornam `true` em 'permitido'.
//                              Callsites que querem evitar flash de "Sem
//                              permissão" durante load DEVEM checar `carregando`
//                              explicitamente (ver App.tsx Sidebar).
//
// FAIL-SAFE: se `meStatus === 'error'`, idem terminal negado (silenciosamente —
// erro do /me já é logado pelo shell).
// ─────────────────────────────────────────────────────────────────────────────
//
// Cache: TanStack Query (já infra do produto). Stale 60s. Refetch on focus.
// Invalidação cross-tab via broadcastQueryClient pode ser plugada depois.

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import { useEffect, useRef } from 'react'

const CONFIGURADOR_URL = import.meta.env.VITE_CONFIGURADOR_URL ?? ''
const SLUG_PRODUTO = 'pedido'

/** Tipos UI do shell — derivados do `resolveRole` em useMeSync. */
const TIPOS_BYPASS: ReadonlyArray<string> = ['Super Admin', 'Admin', 'Master']

/** Tri-state explícito — substitui semântica dupla otimista/estrita anterior. */
export type EstadoPermissao = 'permitido' | 'negado' | 'indeterminado'

export interface UsePermissoesPedidoResult {
  /** True enquanto /me está em voo OU query de permissões pendente com identidade completa.
   *  Quando false após /me terminar, decisão é definitiva (permitido ou negado). */
  carregando: boolean
  /** Mensagem de erro do fetch de permissões (não inclui erro do /me). */
  erro: string | null
  /** Master/SAdmin/Admin têm bypass — funções retornam permitido sem checar Set. */
  bypass: boolean
  /** Tri-state — use quando quiser renderizar skeleton em 'indeterminado'. */
  estado: (secao: SecaoPedido, acao: 'ver' | 'editar') => EstadoPermissao
  /** ESTRITO: true só em 'permitido'. Use combinado com `carregando` se quiser otimismo. */
  podeVer: (secao: SecaoPedido) => boolean
  /** ESTRITO: true só em 'permitido'. Use em Salvar/Excluir/Transferir. */
  podeEditar: (secao: SecaoPedido) => boolean
  /**
   * @deprecated Use `estado()`, `podeVer()` ou `podeEditar()` direto.
   */
  pode: (secao: SecaoPedido, acao: 'ver' | 'editar') => boolean
  recarregar: () => void
}

/** Seções do produto Pedido (alinhado a shared/permissoes-canonicas do Configurador). */
export type SecaoPedido =
  | 'dashboard'
  | 'kanban'
  | 'lista'
  | 'configuracao'
  | 'relatorios'
  | 'historico'

interface PermissaoUsuarioApiItem {
  permissao_usuario: string
  id_workspace: string
  id_produto_gravity: string
}

interface PermissoesResponse {
  permissoes: PermissaoUsuarioApiItem[]
}

export function usePermissoesPedido(): UsePermissoesPedidoResult {
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

  // ───── Estado terminal incompleto (Mand. 08 fail-loud) ────────────────────
  // /me chegou em 'success' mas identidade/workspace continua null. Isso é
  // ESTADO TERMINAL, não carregamento. Não pode ser tratado como otimismo
  // (foi o bug 2026-05-14: sidebar destravava em silêncio para Standard sem
  // workspace resolvido). Loga uma vez por sessão de identidade incompleta.
  const terminalIncompleto = !bypass && meStatus === 'success' && (!idUsuario || !idWorkspaceAtivo)
  const jaLogou = useRef(false)
  useEffect(() => {
    if (terminalIncompleto && !jaLogou.current) {
      jaLogou.current = true
      // eslint-disable-next-line no-console
      console.warn(
        '[usePermissoesPedido] /me concluiu mas identidade/workspace está incompleto.',
        { idUsuario: idUsuario ?? null, idWorkspaceAtivo, meStatus },
        '→ tratando como NEGADO (Mand. 08). Verifique vínculo do usuário ou workspace ativo.'
      )
    }
    if (!terminalIncompleto) jaLogou.current = false
  }, [terminalIncompleto, idUsuario, idWorkspaceAtivo, meStatus])

  // ───── carregando ─────────────────────────────────────────────────────────
  // True só durante /me em voo OU query pendente com identidade completa.
  // Terminal incompleto NÃO conta como carregando — vira NEGADO direto.
  const carregando =
    !bypass &&
    !!isSignedIn &&
    !terminalIncompleto &&
    meStatus !== 'error' &&
    (meStatus === 'idle' || meStatus === 'loading' || (!!idUsuario && !!idWorkspaceAtivo && query.isPending))

  function temChaveNoBanco(secao: SecaoPedido, acao: 'ver' | 'editar'): boolean {
    if (!query.data) return false
    return query.data.has(`${SLUG_PRODUTO}:${secao}:${acao}`)
  }

  function estado(secao: SecaoPedido, acao: 'ver' | 'editar'): EstadoPermissao {
    if (bypass) return 'permitido'
    if (carregando) return 'indeterminado'
    return temChaveNoBanco(secao, acao) ? 'permitido' : 'negado'
  }

  // podeVer/podeEditar agora ESTRITOS — só true em 'permitido'.
  // Callsites que precisam evitar flash devem checar `carregando` antes
  // (ver App.tsx Sidebar: `if (carregando || podeVer(secao)) renderiza normal`).
  function podeVer(secao: SecaoPedido): boolean {
    return estado(secao, 'ver') === 'permitido'
  }

  function podeEditar(secao: SecaoPedido): boolean {
    return estado(secao, 'editar') === 'permitido'
  }

  function pode(secao: SecaoPedido, acao: 'ver' | 'editar'): boolean {
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
