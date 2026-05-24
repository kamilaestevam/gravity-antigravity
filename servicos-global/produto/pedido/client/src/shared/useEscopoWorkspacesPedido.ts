/**
 * Escopo de workspaces do produto Pedido — SSOT para Lista, Kanban, Dashboard e Visão Geral.
 * Persistido em sessionStorage (sessão do browser); default = workspace ativo do Hub.
 */

import { create } from 'zustand'
import { z } from 'zod'

const SESSION_KEY = 'pedido:workspaces_escopo'

const idsSchema = z.array(z.string().min(1))

function lerPersistido(): string[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = idsSchema.safeParse(JSON.parse(raw))
    return parsed.success && parsed.data.length > 0 ? parsed.data : null
  } catch {
    return null
  }
}

function persistir(ids: string[]): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(ids))
  } catch { /* quota / private mode */ }
}

interface EscopoWorkspacesPedidoState {
  idsWorkspacesEscopo: string[]
  hidratado: boolean
  /** Incrementa a cada pedido de abertura do menu lateral de workspaces. */
  sinalAbrirMenuWorkspaces: number
  hidratar: (idsDisponiveis: readonly string[], idWorkspacePreferido: string) => void
  definirEscopo: (ids: readonly string[]) => void
  alternarWorkspace: (id: string) => void
  pedirAbrirMenuWorkspaces: () => void
}

export const useEscopoWorkspacesPedido = create<EscopoWorkspacesPedidoState>((set, get) => ({
  idsWorkspacesEscopo: [],
  hidratado: false,
  sinalAbrirMenuWorkspaces: 0,

  hidratar: (idsDisponiveis, idWorkspacePreferido) => {
    if (get().hidratado) return
    const permitidos = new Set(idsDisponiveis)
    const salvo = lerPersistido()
    let ids = (salvo ?? []).filter(id => permitidos.has(id))
    if (ids.length === 0 && idWorkspacePreferido && permitidos.has(idWorkspacePreferido)) {
      ids = [idWorkspacePreferido]
    }
    if (ids.length === 0 && idsDisponiveis.length > 0) {
      ids = [idsDisponiveis[0]]
    }
    persistir(ids)
    set({ idsWorkspacesEscopo: ids, hidratado: true })
  },

  definirEscopo: (ids) => {
    const dedup = [...new Set(ids.filter(Boolean))]
    persistir(dedup)
    set({ idsWorkspacesEscopo: dedup, hidratado: true })
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
): string[] | undefined {
  if (idsEscopo.length === 0) return undefined
  const ehPadrao = idsEscopo.length === 1 && idsEscopo[0] === idWorkspaceAtivo
  return ehPadrao ? undefined : [...idsEscopo]
}
