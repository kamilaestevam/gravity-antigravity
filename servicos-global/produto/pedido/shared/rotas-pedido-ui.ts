/**
 * Rotas de UI do produto Pedido (shell) — SSOT front + insights GABI.
 * Não confundir com `/api/v1/pedidos/lista` (REST).
 */

export const ROTA_LISTA_PEDIDO_UI = '/pedido/pedidos/lista'

/** Monta rota da Lista com query string (`status=atrasado` ou `?status=atrasado`). */
export function rotaListaPedidoUi(query?: string): string {
  if (!query) return ROTA_LISTA_PEDIDO_UI
  return query.startsWith('?')
    ? `${ROTA_LISTA_PEDIDO_UI}${query}`
    : `${ROTA_LISTA_PEDIDO_UI}?${query}`
}
