/**
 * publicar-evento-pedido.ts — enfileira webhook via api-cockpit S2S apos mutacao de pedido.
 */

import { randomUUID } from 'node:crypto'
import {
  aplicarEnvelopeIntegracaoPedido,
  type PedidoComEnvelopeIntegracao,
} from '../../../shared/envelope-integracao-pedido.js'

const API_COCKPIT_URL = process.env.API_COCKPIT_URL ?? 'http://localhost:8016'
const CHAVE_INTERNA = process.env.CHAVE_INTERNA_SERVICO ?? ''

export type TipoEventoPedidoIntegracao = 'pedido.criado' | 'pedido.atualizado'

export async function publicarEventoPedidoIntegracao(params: {
  id_organizacao: string
  tipo_evento: TipoEventoPedidoIntegracao
  pedido: Record<string, unknown>
  id_evento?: string
}): Promise<void> {
  if (!CHAVE_INTERNA) {
    console.warn('[publicar-evento-pedido] CHAVE_INTERNA_SERVICO ausente — evento nao enfileirado')
    return
  }

  const envelope = aplicarEnvelopeIntegracaoPedido(params.pedido) as PedidoComEnvelopeIntegracao
  const idEvento = params.id_evento ?? randomUUID()
  const payload = {
    event_id: idEvento,
    event: params.tipo_evento,
    timestamp: new Date().toISOString(),
    data: envelope,
  }

  try {
    const response = await fetch(`${API_COCKPIT_URL}/api/v1/cockpit/webhooks-integracao/enfileirar-evento-integracao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-chave-interna-servico': CHAVE_INTERNA,
      },
      body: JSON.stringify({
        id_organizacao: params.id_organizacao,
        id_produto_gravity: 'pedido',
        tipo_evento: params.tipo_evento,
        payload,
        id_evento: idEvento,
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      const texto = await response.text().catch(() => '')
      console.warn('[publicar-evento-pedido] falha ao enfileirar', {
        status: response.status,
        texto,
        tipo_evento: params.tipo_evento,
      })
    }
  } catch (err) {
    console.warn('[publicar-evento-pedido] erro de rede ao enfileirar', {
      erro: err instanceof Error ? err.message : String(err),
      tipo_evento: params.tipo_evento,
    })
  }
}
