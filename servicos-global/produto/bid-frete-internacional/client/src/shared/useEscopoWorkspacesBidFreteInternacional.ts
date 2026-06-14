/**
 * Escopo de workspaces — BID Frete Internacional (paridade Pedido).
 * Persistido em lista_painel_usuario_global (meta); cache em sessionStorage por org.
 */

import { create } from 'zustand'
import { bidFreteConfigApi, getApiContext } from './api'

const SESSION_KEY_LEGACY = 'bid-frete-internacional:workspaces_escopo'

function chaveSessionEscopo(idOrganizacao: string | null | undefined): string {
  if (idOrganizacao) return `bid-frete-internacional:workspaces_escopo:${idOrganizacao}`
  return SESSION_KEY_LEGACY
}

interface EscopoWorkspacesBidFreteState {
  idsWorkspacesEscopo: string[]
  hidratado: boolean
  sinalAbrirMenuWorkspaces: number
  hidratar: (
    idsDisponiveis: readonly string[],
    idWorkspacePreferido: string,
    idsPreferenciaBackend?: string[] | null,
  ) => void
  aplicarPreferenciaBackend: (
    idsDisponiveis: readonly string[],
    idWorkspacePreferido: string,
    idsPreferenciaBackend: string[],
  ) => void
  definirEscopo: (ids: readonly string[]) => void
  alternarWorkspace: (id: string) => void
  pedirAbrirMenuWorkspaces: () => void
  reiniciarHidratacao: () => void
}

function idsEscopoIguais(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function resolverIdsEscopoPermitidos(
  idsDisponiveis: readonly string[],
  idWorkspacePreferido: string,
  idsPreferenciaBackend: string[] | null | undefined,
): string[] {
  const permitidos = new Set(idsDisponiveis)
  const backend = idsPreferenciaBackend ?? undefined
  const fallbackLocal = backend === undefined ? lerSessionStorage() : null
  let ids = (backend ?? fallbackLocal ?? []).filter(id => permitidos.has(id))
  if (ids.length === 0 && idWorkspacePreferido && permitidos.has(idWorkspacePreferido)) {
    ids = [idWorkspacePreferido]
  }
  if (ids.length === 0 && idsDisponiveis.length > 0) {
    ids = [idsDisponiveis[0]]
  }
  return ids
}

let persistTimer: ReturnType<typeof setTimeout> | null = null
let idsPendentesPersistencia: string[] | null = null

function lerSessionStorage(): string[] | null {
  try {
    const ctx = getApiContext()
    const orgId = ctx.idOrganizacao
    const raw =
      (orgId ? sessionStorage.getItem(chaveSessionEscopo(orgId)) : null)
      ?? sessionStorage.getItem(SESSION_KEY_LEGACY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const ids = parsed.filter((id): id is string => typeof id === 'string' && id.length > 0)
    return ids.length > 0 ? ids : null
  } catch {
    return null
  }
}

function gravarSessionStorage(ids: string[]): void {
  try {
    const ctx = getApiContext()
    const orgId = ctx.idOrganizacao
    if (!orgId) {
      sessionStorage.setItem(SESSION_KEY_LEGACY, JSON.stringify(ids))
      return
    }
    sessionStorage.setItem(chaveSessionEscopo(orgId), JSON.stringify(ids))
  } catch { /* quota / private mode */ }
}

function podePersistirNoBackend(): boolean {
  const ctx = getApiContext()
  return Boolean(ctx.idOrganizacao && ctx.userId)
}

function persistirEscopoNoBackend(ids: string[]): void {
  idsPendentesPersistencia = ids
  if (persistTimer) clearTimeout(persistTimer)

  const executar = () => {
    if (!podePersistirNoBackend()) return
    const payload = idsPendentesPersistencia
    if (!payload) return
    idsPendentesPersistencia = null

    void bidFreteConfigApi
      .salvarEscopoWorkspaces({ ids_workspaces_escopo: payload })
      .then(() => {
        gravarSessionStorage(payload)
      })
      .catch(err => {
        console.warn('[useEscopoWorkspacesBidFreteInternacional] falha ao persistir escopo', err)
        idsPendentesPersistencia = payload
        persistTimer = setTimeout(executar, 1_500)
      })
  }

  persistTimer = setTimeout(executar, 150)
}

function flushPersistenciaEscopo(): void {
  if (persistTimer) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
  if (idsPendentesPersistencia && podePersistirNoBackend()) {
    const payload = idsPendentesPersistencia
    idsPendentesPersistencia = null
    void bidFreteConfigApi
      .salvarEscopoWorkspaces({ ids_workspaces_escopo: payload })
      .then(() => gravarSessionStorage(payload))
      .catch(() => {
        idsPendentesPersistencia = payload
      })
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushPersistenciaEscopo)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPersistenciaEscopo()
  })
}

export const useEscopoWorkspacesBidFreteInternacional = create<EscopoWorkspacesBidFreteState>((set, get) => ({
  idsWorkspacesEscopo: [],
  hidratado: false,
  sinalAbrirMenuWorkspaces: 0,

  reiniciarHidratacao: () => {
    set({ hidratado: false, idsWorkspacesEscopo: [] })
  },

  hidratar: (idsDisponiveis, idWorkspacePreferido, idsPreferenciaBackend = null) => {
    const ids = resolverIdsEscopoPermitidos(
      idsDisponiveis,
      idWorkspacePreferido,
      idsPreferenciaBackend,
    )
    const { idsWorkspacesEscopo: atual, hidratado } = get()
    if (hidratado && idsEscopoIguais(atual, ids)) return
    gravarSessionStorage(ids)
    set({ idsWorkspacesEscopo: ids, hidratado: true })
  },

  /** Refina escopo após GET backend (pode rodar com hidratado=true). */
  aplicarPreferenciaBackend: (
    idsDisponiveis,
    idWorkspacePreferido,
    idsPreferenciaBackend,
  ) => {
    const ids = resolverIdsEscopoPermitidos(
      idsDisponiveis,
      idWorkspacePreferido,
      idsPreferenciaBackend,
    )
    const { idsWorkspacesEscopo: atual, hidratado } = get()
    if (hidratado && idsEscopoIguais(atual, ids)) return
    gravarSessionStorage(ids)
    set({ idsWorkspacesEscopo: ids, hidratado: true })
  },

  definirEscopo: (ids) => {
    const dedup = [...new Set(ids.filter(Boolean))]
    const { idsWorkspacesEscopo: atual, hidratado } = get()
    if (hidratado && idsEscopoIguais(atual, dedup)) return
    gravarSessionStorage(dedup)
    set({ idsWorkspacesEscopo: dedup, hidratado: true })
    persistirEscopoNoBackend(dedup)
  },

  alternarWorkspace: (id) => {
    const atual = get().idsWorkspacesEscopo
    const tem = atual.includes(id)
    const next = tem ? atual.filter(x => x !== id) : [...atual, id]
    get().definirEscopo(next)
  },

  pedirAbrirMenuWorkspaces: () => {
    set(s => ({ sinalAbrirMenuWorkspaces: s.sinalAbrirMenuWorkspaces + 1 }))
  },
}))

/** Query param `ids_workspaces` — omitido quando escopo = só o workspace ativo da sessão (paridade Pedido). */
export function resolverIdsWorkspacesParaApi(
  idsEscopo: readonly string[],
  idWorkspaceAtivo: string,
  _idsDisponiveis?: readonly string[],
): string[] | undefined {
  if (idsEscopo.length === 0) return undefined
  const ehPadrao = idsEscopo.length === 1 && idsEscopo[0] === idWorkspaceAtivo
  return ehPadrao ? undefined : [...idsEscopo]
}

export function anexarIdsWorkspacesQuery(
  params: URLSearchParams,
  idsWorkspacesFiltro: string[] | undefined,
): void {
  if (idsWorkspacesFiltro?.length) {
    params.set('ids_workspaces', idsWorkspacesFiltro.join(','))
  }
}
