/**
 * selecaoStore.ts — Estado de seleção do produto Pedido
 *
 * Centraliza pedidosSelecionados e itensSelecionados para que qualquer
 * componente possa consumir sem prop drilling, e expõe hasMixedTipos como
 * estado derivado (computed) sem recálculo disperso.
 *
 * Padrão: estado de UI do produto vive em produto/shared/state (ver state-management skill).
 * Esta store NÃO persiste — seleção é efêmera e deve resetar ao navegar.
 */

import { create } from 'zustand'
import type { Pedido, PedidoItem } from '../types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface SelecaoState {
  /** Pedidos pai selecionados via checkbox da tabela */
  pedidosSelecionados: Pedido[]

  /** Itens filho selecionados via checkbox da tabela */
  itensSelecionados: PedidoItem[]

  /**
   * true quando a seleção contém pedidos de tipos diferentes
   * (importacao e exportacao ao mesmo tempo).
   *
   * false quando:
   * - seleção vazia
   * - todos os pedidos são do mesmo tipo
   */
  hasMixedTipos: boolean

  /** Substitui toda a lista de pedidos selecionados e recalcula hasMixedTipos */
  setPedidosSelecionados: (pedidos: Pedido[]) => void

  /** Substitui toda a lista de itens selecionados */
  setItensSelecionados: (itens: PedidoItem[]) => void

  /** Limpa pedidos e itens selecionados */
  limparSelecao: () => void
}

// ── Derivado ──────────────────────────────────────────────────────────────────

function calcularHasMixedTipos(pedidos: Pedido[]): boolean {
  if (pedidos.length === 0) return false
  const tipos = new Set(pedidos.map(p => p.tipo_operacao))
  return tipos.size > 1
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useSelecaoStore = create<SelecaoState>((set) => ({
  pedidosSelecionados: [],
  itensSelecionados: [],
  hasMixedTipos: false,

  setPedidosSelecionados: (pedidos) =>
    set({
      pedidosSelecionados: pedidos,
      hasMixedTipos: calcularHasMixedTipos(pedidos),
    }),

  setItensSelecionados: (itens) =>
    set({ itensSelecionados: itens }),

  limparSelecao: () =>
    set({
      pedidosSelecionados: [],
      itensSelecionados: [],
      hasMixedTipos: false,
    }),
}))

// ── Selectors convenientes (evitam re-render se só um campo muda) ─────────────

/** Hook para consumir apenas hasMixedTipos — não re-renderiza por mudança de lista */
export const useHasMixedTipos = (): boolean =>
  useSelecaoStore(s => s.hasMixedTipos)

/** Hook para consumir apenas pedidosSelecionados */
export const usePedidosSelecionados = (): Pedido[] =>
  useSelecaoStore(s => s.pedidosSelecionados)

/** Hook para consumir apenas itensSelecionados */
export const useItensSelecionados = (): PedidoItem[] =>
  useSelecaoStore(s => s.itensSelecionados)
