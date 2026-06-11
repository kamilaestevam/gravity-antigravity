import type { PedidoItem } from './types'

/** Valor total câmbio exibido na lista para um item (`valor_total_cambio_item_pedido`). */
export function valorTotalCambioItemParaLista(row: PedidoItem): number | null {
  if (row.valor_total_cambio_item_pedido == null) return null
  const persistido = Number(row.valor_total_cambio_item_pedido)
  return !isNaN(persistido) ? persistido : null
}
