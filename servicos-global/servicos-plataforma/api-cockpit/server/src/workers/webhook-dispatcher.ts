/**
 * webhook-dispatcher.ts — Worker de entrega de webhooks com retry e DLQ logica.
 */

import { PrismaClient } from '../../../../generated/index.js'
import { logger } from '../../../../middleware/logger.js'
import {
  calcularProximaTentativaWebhook,
  entregarWebhookIntegracao,
  MAX_TENTATIVAS_WEBHOOK,
  type PayloadWebhookIntegracao,
} from '../services/entregar-webhook-integracao.js'
import { limparSessoesOAuthExpiradas } from '../lib/sessao-oauth-api.js'

const INTERVALO_MS = 15_000
const LOTE_MAX = 20

const prisma = new PrismaClient()
let timer: ReturnType<typeof setInterval> | undefined

export async function processarLoteWebhooksPendentes(): Promise<number> {
  const agora = new Date()
  const pendentes = await prisma.webhookEventoEnfileirado.findMany({
    where: {
      status_webhook_evento_enfileirado: 'PENDENTE',
      proxima_tentativa_webhook_evento_enfileirado: { lte: agora },
    },
    orderBy: { data_criacao_webhook_evento_enfileirado: 'asc' },
    take: LOTE_MAX,
  })

  let processados = 0

  for (const evento of pendentes) {
    const webhooks = await prisma.webhookConfiguracao.findMany({
      where: {
        id_organizacao: evento.id_organizacao,
        ativo_webhook_configuracao: true,
        eventos_webhook_configuracao: { has: evento.tipo_evento_webhook_enfileirado },
      },
    })

    if (webhooks.length === 0) {
      await prisma.webhookEventoEnfileirado.update({
        where: { id_webhook_evento_enfileirado: evento.id_webhook_evento_enfileirado },
        data: {
          status_webhook_evento_enfileirado: 'ENTREGUE',
          ultimo_erro_webhook_evento_enfileirado: 'Nenhum webhook ativo para o evento',
        },
      })
      processados++
      continue
    }

    const payload = evento.payload_evento_webhook_enfileirado as PayloadWebhookIntegracao
    const tentativa = evento.quantidade_tentativas_webhook_evento_enfileirado + 1
    let algumSucesso = false
    const erros: string[] = []

    for (const wh of webhooks) {
      const resultado = await entregarWebhookIntegracao(prisma, {
        id_organizacao: evento.id_organizacao,
        id_webhook_configuracao: wh.id_webhook_configuracao,
        url: wh.url_webhook_configuracao,
        segredo: wh.segredo_webhook_configuracao,
        payload,
        quantidade_tentativas: tentativa,
      })
      if (resultado.sucesso) {
        algumSucesso = true
      } else {
        erros.push(`${wh.id_webhook_configuracao}: ${resultado.erro ?? resultado.codigo}`)
      }
    }

    if (algumSucesso) {
      await prisma.webhookEventoEnfileirado.update({
        where: { id_webhook_evento_enfileirado: evento.id_webhook_evento_enfileirado },
        data: {
          status_webhook_evento_enfileirado: 'ENTREGUE',
          quantidade_tentativas_webhook_evento_enfileirado: tentativa,
          ultimo_erro_webhook_evento_enfileirado: erros.length ? erros.join('; ') : null,
        },
      })
    } else if (tentativa >= MAX_TENTATIVAS_WEBHOOK) {
      await prisma.webhookEventoEnfileirado.update({
        where: { id_webhook_evento_enfileirado: evento.id_webhook_evento_enfileirado },
        data: {
          status_webhook_evento_enfileirado: 'FALHA_PERMANENTE',
          quantidade_tentativas_webhook_evento_enfileirado: tentativa,
          ultimo_erro_webhook_evento_enfileirado: erros.join('; '),
        },
      })
      logger.warn('[webhook-dispatcher] evento em falha permanente (DLQ)', {
        id_evento: evento.id_evento_webhook_enfileirado,
        erros,
      })
    } else {
      await prisma.webhookEventoEnfileirado.update({
        where: { id_webhook_evento_enfileirado: evento.id_webhook_evento_enfileirado },
        data: {
          quantidade_tentativas_webhook_evento_enfileirado: tentativa,
          proxima_tentativa_webhook_evento_enfileirado: calcularProximaTentativaWebhook(tentativa),
          ultimo_erro_webhook_evento_enfileirado: erros.join('; '),
        },
      })
    }

    processados++
  }

  limparSessoesOAuthExpiradas()
  return processados
}

export function iniciarWorkerWebhookDispatcher(): void {
  if (timer) return
  timer = setInterval(() => {
    void processarLoteWebhooksPendentes().catch((err) => {
      logger.error('[webhook-dispatcher] falha no lote', {
        erro: err instanceof Error ? err.message : String(err),
      })
    })
  }, INTERVALO_MS)
  timer.unref()
  logger.info('[webhook-dispatcher] worker iniciado', { intervaloMs: INTERVALO_MS })
}

export function pararWorkerWebhookDispatcher(): void {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}
