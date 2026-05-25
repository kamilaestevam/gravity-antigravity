/**
 * Escopo de workspaces do produto Pedido — SSOT para Lista, Kanban, Dashboard e Visão Geral.
 * Persistido em preferencia_usuario_coluna_pedido (meta em colunas_largura); default = workspace ativo.
 */

import { create } from 'zustand'
import { getApiContext, pedidoConfigApi } from './api'

const SESSION_KEY = 'pedido:workspaces_escopo'

interface EscopoWorkspacesPedidoState {
  idsWorkspacesEscopo: string[]
  hidratado: boolean
  /** Incrementa a cada pedido de abertura do menu lateral de workspaces. */
  sinalAbrirMenuWorkspaces: number
  hidratar: (
    idsDisponiveis: readonly string[],
    idWorkspacePreferido: string,
    idsPreferenciaBackend?: string[] | null,
  ) => void
  definirEscopo: (ids: readonly string[]) => void
  alternarWorkspace: (id: string) => void
  pedirAbrirMenuWorkspaces: () => void
  reiniciarHidratacao: () => void
}

let persistTimer: ReturnType<typeof setTimeout> | null = null
let idsPendentesPersistencia: string[] | null = null

function lerSessionStorage(): string[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
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
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(ids))
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

    void pedidoConfigApi
      .salvarPreferenciaUsuarioColunaPedido({ ids_workspaces_escopo: payload })
      .then(() => {
        gravarSessionStorage(payload)
      })
      .catch(err => {
        console.warn('[useEscopoWorkspacesPedido] falha ao persistir escopo de workspaces', err)
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
    void pedidoConfigApi
      .salvarPreferenciaUsuarioColunaPedido({ ids_workspaces_escopo: payload })
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

export const useEscopoWorkspacesPedido = create<EscopoWorkspacesPedidoState>((set, get) => ({
  idsWorkspacesEscopo: [],
  hidratado: false,
  sinalAbrirMenuWorkspaces: 0,

  reiniciarHidratacao: () => {
    set({ hidratado: false, idsWorkspacesEscopo: [] })
  },

  hidratar: (idsDisponiveis, idWorkspacePreferido, idsPreferenciaBackend = null) => {
    if (get().hidratado) return
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
    gravarSessionStorage(ids)
    set({ idsWorkspacesEscopo: ids, hidratado: true })
  },

  definirEscopo: (ids) => {
    const dedup = [...new Set(ids.filter(Boolean))]
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

/** Query param `ids_workspaces` — omitido quando escopo = só o workspace ativo da sessão. */
export function resolverIdsWorkspacesParaApi(
  idsEscopo: readonly string[],
  idWorkspaceAtivo: string,
  _idsDisponiveis?: readonly string[],
): string[] | undefined {
  if (idsEscopo.length === 0) return undefined
  const ehPadrao = idsEscopo.length === 1 && idsEscopo[0] === idWorkspaceAtivo
  return ehPadrao ? undefined : [...idsEscopo]
}
