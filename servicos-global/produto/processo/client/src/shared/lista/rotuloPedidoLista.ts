/**
 * rotuloPedidoLista — rótulo da tag de sequência do pedido na árvore da lista.
 */
export function rotuloPedidoLista(sequencia: number | null | undefined): string {
  if (sequencia != null && sequencia > 0) {
    return `P-${sequencia}`
  }
  return 'P'
}
