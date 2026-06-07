import type { PedidoItem } from './types'

/**
 * Valor total exibido na lista para um item: `valor_total_item` persistido,
 * ou unitário × qtd. inicial quando o total ainda não foi gravado.
 */
export function valorTotalItemParaLista(row: PedidoItem): number | null {
  if (row.valor_total_item != null) {
    const persistido = Number(row.valor_total_item)
    if (!isNaN(persistido)) return persistido
  }
  if (row.valor_por_unidade_item == null || row.quantidade_inicial_pedido == null) return null
  const unitario = Number(row.valor_por_unidade_item)
  const qtdInicial = Number(row.quantidade_inicial_pedido)
  if (!isNaN(unitario) && !isNaN(qtdInicial)) return unitario * qtdInicial
  return null
}
