/**
 * rotuloItemLista — rótulo da tag de sequência do item na árvore da lista.
 */
export function rotuloItemLista(sequencia: number | null | undefined): string {
  if (sequencia != null && sequencia > 0) {
    return `Item ${sequencia}`
  }
  return 'Item'
}
