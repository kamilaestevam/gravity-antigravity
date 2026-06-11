/**
 * selecaoStore.ts — Estado de seleção do produto Processo (lista hierárquica).
 */
import { create } from 'zustand'
import type { Pedido, PedidoItem } from '../lista/pedidoTypes'
import type { ProcessoAvoLinha } from '../lista/mockListaHierarquica'

interface SelecaoState {
  processosSelecionados: ProcessoAvoLinha[]
  pedidosSelecionados: Pedido[]
  itensSelecionados: PedidoItem[]
  hasMixedTipos: boolean
  setProcessosSelecionados: (processos: ProcessoAvoLinha[]) => void
  setPedidosSelecionados: (pedidos: Pedido[]) => void
  setItensSelecionados: (itens: PedidoItem[]) => void
  limparSelecao: () => void
}

function calcularHasMixedTipos(pedidos: Pedido[]): boolean {
  if (pedidos.length === 0) return false
  const tipos = new Set(pedidos.map(p => p.tipo_operacao))
  return tipos.size > 1
}

export const useSelecaoStore = create<SelecaoState>((set) => ({
  processosSelecionados: [],
  pedidosSelecionados: [],
  itensSelecionados: [],
  hasMixedTipos: false,

  setProcessosSelecionados: (processos) =>
    set({ processosSelecionados: processos }),

  setPedidosSelecionados: (pedidos) =>
    set({
      pedidosSelecionados: pedidos,
      hasMixedTipos: calcularHasMixedTipos(pedidos),
    }),

  setItensSelecionados: (itens) =>
    set({ itensSelecionados: itens }),

  limparSelecao: () =>
    set({
      processosSelecionados: [],
      pedidosSelecionados: [],
      itensSelecionados: [],
      hasMixedTipos: false,
    }),
}))

export const useHasMixedTipos = (): boolean =>
  useSelecaoStore(s => s.hasMixedTipos)

export const usePedidosSelecionados = (): Pedido[] =>
  useSelecaoStore(s => s.pedidosSelecionados)

export const useItensSelecionados = (): PedidoItem[] =>
  useSelecaoStore(s => s.itensSelecionados)

export const useProcessosSelecionados = (): ProcessoAvoLinha[] =>
  useSelecaoStore(s => s.processosSelecionados)
