/**
 * entregar-webhook-integracao.ts — entrega HTTP com HMAC e log.
 */

import { PrismaClient } from '../../../../generated/index.js'
import { generateHMACSignature } from '../crypto'

export interface PayloadWebhookIntegracao {
  event_id: string
  event: string
  timestamp: string
  data: Record<string, unknown>
}

export async function entregarWebhookIntegracao(
  prisma: PrismaClient,
  params: {
    id_organizacao: string
    id_webhook_configuracao: string
    url: string
    segredo: string
    payload: PayloadWebhookIntegracao
    quantidade_tentativas: number
  },
): Promise<{ sucesso: boolean; codigo: number; erro: string | null; latenciaMs: number }> {
  const corpo = JSON.stringify(params.payload)
  const assinatura = generateHMACSignature(corpo, params.segredo)
  const inicio = Date.now()
  let codigo = 0
  let erro: string | null = null

  try {
    const response = await fetch(params.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gravity-Signature': assinatura,
        'X-Gravity-Event-Id': params.payload.event_id,
      },
      body: corpo,
      signal: AbortSignal.timeout(15_000),
    })
    codigo = response.status
    if (!response.ok) {
      erro = `HTTP ${response.status}`
    }
  } catch (e: unknown) {
    codigo = 0
    erro = e instanceof Error ? e.message : String(e)
  }

  const latenciaMs = Date.now() - inicio

  await prisma.webhookLog.create({
    data: {
      id_organizacao: params.id_organizacao,
      id_webhook_configuracao: params.id_webhook_configuracao,
      evento_webhook_log: params.payload.event,
      codigo_resposta_http_webhook_log: codigo,
      latencia_ms_webhook_log: latenciaMs,
      quantidade_tentativas_webhook_log: params.quantidade_tentativas,
      payload_webhook_log: params.payload as object,
      erro_webhook_log: erro,
    },
  })

  return { sucesso: codigo >= 200 && codigo < 300, codigo, erro, latenciaMs }
}

/** Backoff exponencial: 30s, 2m, 8m, 32m (max 4 retries apos 1a tentativa). */
export function calcularProximaTentativaWebhook(tentativas: number): Date {
  const segundos = Math.min(30 * 4 ** tentativas, 32 * 60)
  return new Date(Date.now() + segundos * 1000)
}

export const MAX_TENTATIVAS_WEBHOOK = 5
