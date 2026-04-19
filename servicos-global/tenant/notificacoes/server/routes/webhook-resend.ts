/**
 * webhook-resend.ts
 *
 * Recebe eventos de entrega do Resend e atualiza delivery_status no banco.
 *
 * SEGURANÇA: usa Svix para verificar a assinatura HMAC-SHA256.
 *   - Rejeita payloads sem assinatura válida (401)
 *   - Rejeita replays: Svix invalida timestamps fora de ±5 min
 *   - Rota montada com express.raw() — não express.json() — para que o
 *     cálculo do HMAC opere sobre os bytes originais do payload
 *
 * RESILIÊNCIA: external_id não encontrado → warn + 200 (evita retry loop do Resend)
 */

import { Router, type Request, type Response, type NextFunction } from 'express'
import express from 'express'
import { Webhook, WebhookVerificationError } from 'svix'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

export const webhookResendRoutes = Router()

// ─── Tipos do payload Resend ──────────────────────────────────────────────────
// Resend envia: { type: string, data: { email_id: string, ... } }
// Ref: https://resend.com/docs/dashboard/webhooks/event-types
interface ResendWebhookEvent {
  type:
    | 'email.sent'
    | 'email.delivered'
    | 'email.delivery_delayed'
    | 'email.bounced'
    | 'email.complained'
    | 'email.failed'
  data: {
    email_id: string
    from?: string
    to?: string[]
    subject?: string
    created_at?: string
    bounce?: { message?: string }
  }
}

// Mapeamento evento Resend → delivery_status interno
const STATUS_MAP: Record<ResendWebhookEvent['type'], string> = {
  'email.sent':             'sent',
  'email.delivered':        'delivered',
  'email.delivery_delayed': 'sent',      // ainda em trânsito — mantém "sent"
  'email.bounced':          'bounced',
  'email.complained':       'bounced',   // spam complaint tratado como bounce
  'email.failed':           'failed',
}

// ─── POST / ───────────────────────────────────────────────────────────────────
// Middleware express.raw() aplicado individualmente: esta rota precisa do body
// como Buffer; o express.json() global (montado depois) não interfere aqui.
webhookResendRoutes.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response, next: NextFunction) => {
    const secret = process.env.RESEND_WEBHOOK_SECRET ?? ''
    if (!secret) {
      return next(new AppError('RESEND_WEBHOOK_SECRET não configurado', 500, 'MISSING_CONFIG'))
    }

    // ── Validação de assinatura ──────────────────────────────────────────────
    const wh = new Webhook(secret)
    let event: ResendWebhookEvent

    try {
      event = wh.verify(req.body as Buffer, {
        'svix-id':        req.headers['svix-id'] as string        ?? '',
        'svix-timestamp': req.headers['svix-timestamp'] as string ?? '',
        'svix-signature': req.headers['svix-signature'] as string ?? '',
      }) as ResendWebhookEvent
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        console.warn('[webhook-resend] Assinatura inválida — request rejeitado')
        return res.status(401).json({ error: 'Assinatura inválida' })
      }
      return next(err)
    }

    // ── Processar evento ─────────────────────────────────────────────────────
    const { type, data } = event
    const newStatus = STATUS_MAP[type]

    if (!newStatus) {
      // Evento desconhecido (ex: tipo futuro do Resend) — aceitar sem processar
      console.info(`[webhook-resend] Evento não mapeado ignorado: ${type}`)
      return res.status(200).json({ received: true })
    }

    const emailId = data?.email_id
    if (!emailId) {
      console.warn(`[webhook-resend] Payload sem email_id para evento ${type}`)
      return res.status(200).json({ received: true })
    }

    // ── Atualizar delivery_status no banco ───────────────────────────────────
    try {
      const updated = await prisma.notificacoesTituloCorpo.updateMany({
        where: { external_id: emailId },
        data:  { delivery_status: newStatus },
      })

      if (updated.count === 0) {
        // external_id não encontrado: pode ser email de outro sistema, ou ID
        // duplicado em retry. Apenas loga — não retorna erro para evitar retry loop.
        console.warn(
          `[webhook-resend] external_id não encontrado no banco: ${emailId} (evento: ${type})`
        )
      } else {
        console.info(
          `[webhook-resend] ${updated.count} notificação(ões) → ${newStatus} (email_id: ${emailId})`
        )
      }
    } catch (dbErr) {
      // Erro de banco não deve vazar para o Resend; loga e responde 200 para
      // evitar retry infinito. O worker de cron pode reconciliar depois.
      console.error('[webhook-resend] Erro ao atualizar banco:', (dbErr as Error).message)
    }

    // Resend exige 2xx para confirmar recebimento
    return res.status(200).json({ received: true })
  }
)
