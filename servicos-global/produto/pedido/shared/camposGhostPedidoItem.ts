/**
 * Campos que existem apenas em PedidoItem mas aparecem como coluna na linha do
 * pedido (pai). Edição inline no pai grava via PATCH em cada item — nunca em
 * PATCH /pedidos/:id/campo.
 */
export const CAMPOS_GHOST_ITEM_EDITAVEIS_NO_PEDIDO: ReadonlySet<string> = new Set([
  'ncm',
  'descricao_item',
  'cobertura_cambial',
])

export function isCampoGhostItemNoPedido(campo: string): boolean {
  return CAMPOS_GHOST_ITEM_EDITAVEIS_NO_PEDIDO.has(campo)
}
