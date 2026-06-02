import type { PedidoStatusConfig } from './types'

/** Slugs reservados pelo backend (importação, transferência, consolidação). */
export const SLUGS_STATUS_SISTEMA_PEDIDO = new Set([
  'rascunho',
  'aberto',
  'transferencia',
  'consolidado',
  'cancelado',
])

export function statusEhSistemaPedido(
  s: Pick<PedidoStatusConfig, 'nome' | 'is_sistema'>,
): boolean {
  return s.is_sistema === true || SLUGS_STATUS_SISTEMA_PEDIDO.has(s.nome)
}

export function normalizarListaStatus(lista: PedidoStatusConfig[]): PedidoStatusConfig[] {
  return lista.map(s => ({
    ...s,
    is_sistema: statusEhSistemaPedido(s),
  }))
}
