import type { Pedido, PedidoItem } from './types'

export interface ItemComPedidoTransferir {
  item: PedidoItem
  pedido: Pedido
}

/**
 * Monta pares item+pedido para o modal Transferir.
 *
 * Na lista virtual, `pedido.itens` costuma vir vazio — os itens selecionados
 * chegam pelo `selecaoStore` (`itensExplicitos`). Sem isso, só os itens já
 * carregados no pai aparecem no passo 2 (bug: usuário seleciona 6, vê 2).
 */
export function montarItensComPedidoParaTransferir(
  pedidos: Pedido[],
  itensExplicitos: PedidoItem[] | undefined,
  todosPedidos: Pedido[] | undefined,
): ItemComPedidoTransferir[] {
  const mapaPedidos = new Map<string, Pedido>()
  for (const p of todosPedidos ?? []) mapaPedidos.set(p.id, p)
  for (const p of pedidos) mapaPedidos.set(p.id, p)

  if (itensExplicitos && itensExplicitos.length > 0) {
    const resultado: ItemComPedidoTransferir[] = []
    for (const item of itensExplicitos) {
      const pedidoPai = mapaPedidos.get(item.pedido_id)
      if (pedidoPai) resultado.push({ item, pedido: pedidoPai })
    }
    return resultado
  }

  const resultado: ItemComPedidoTransferir[] = []
  for (const p of pedidos) {
    for (const item of p.itens ?? []) {
      resultado.push({ item, pedido: p })
    }
  }
  return resultado
}

export function inicializarItensQuantidadesTransferir(
  itensComPedido: ItemComPedidoTransferir[],
  itensSelecionadosIds: string[] | undefined,
): Map<string, number> {
  const mapa = new Map<string, number>()
  const idsDisponiveis = itensComPedido.map(ic => ic.item.id)

  if (itensSelecionadosIds && itensSelecionadosIds.length > 0) {
    const idsSet = new Set(itensSelecionadosIds)
    for (const id of idsDisponiveis) {
      if (idsSet.has(id)) mapa.set(id, 0)
    }
  } else {
    for (const id of idsDisponiveis) mapa.set(id, 0)
  }
  return mapa
}
