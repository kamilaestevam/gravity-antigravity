/**
 * Envelope dual Gravity + SAP/CPI para respostas da API publica de integracao.
 * Mantem campos DDD canonicos e aliases externos (gravityOrderId, externalRef).
 */

export interface PedidoComEnvelopeIntegracao {
  id_pedido: string
  gravityOrderId: string
  numero_pedido: string
  referencia_externa_erp_pedido: string | null
  externalRef: string | null
  status_pedido: string
  tipo_operacao_pedido: string
  id_organizacao: string
  id_workspace: string
  data_criacao_pedido?: string | Date
  data_atualizacao_pedido?: string | Date
  [chave: string]: unknown
}

/** Aplica aliases de integracao sem remover campos DDD. */
export function aplicarEnvelopeIntegracaoPedido<T extends Record<string, unknown>>(
  pedido: T,
): PedidoComEnvelopeIntegracao & T {
  const id = String(pedido.id_pedido ?? '')
  const refExt =
    pedido.referencia_externa_erp_pedido != null
      ? String(pedido.referencia_externa_erp_pedido)
      : null

  return {
    ...pedido,
    gravityOrderId: id,
    externalRef: refExt,
  } as PedidoComEnvelopeIntegracao & T
}

export function aplicarEnvelopeListaPedidos<T extends Record<string, unknown>>(
  pedidos: T[],
): Array<PedidoComEnvelopeIntegracao & T> {
  return pedidos.map(aplicarEnvelopeIntegracaoPedido)
}

/** Normaliza body de entrada: externalRef -> referencia_externa_erp_pedido */
export function normalizarBodyIntegracaoPedido(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...body }
  if (out.externalRef != null && out.referencia_externa_erp_pedido == null) {
    out.referencia_externa_erp_pedido = out.externalRef
  }
  return out
}

export function ehRequisicaoApiExterna(headers: Record<string, string | string[] | undefined>): boolean {
  return typeof headers['x-api-token-escopo'] === 'string'
}
