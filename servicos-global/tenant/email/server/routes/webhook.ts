// server/routes/webhook.ts
// POST /api/v1/email/webhook — recebe inbound de emails via Resend Webhooks.
//
// Pipeline:
//  1) Valida assinatura HMAC com RESEND_WEBHOOK_SECRET
//  2) Aplica deduplicação em 3 camadas (Resend ID, timestamp+conteúdo, hash)
//  3) Extrai thread via Reply-To dinâmico (reply+{dedup_key}@dominio)
//  4) Persiste EmailMessage com direction: INBOUND
//  5) Emite evento email:received (para integração futura com Gabi)

import { Router, Request, Response, NextFunction } from 'express'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { isDuplicateResendId, isDuplicateContent } from '../services/dedup.js'

export const webhookRouter = Router()

// ---- Utilitário de verificação de assinatura HMAC -------------------------

function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  try {
    const expected = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')
    const sigBuffer = Buffer.from(signature, 'hex')
    const expBuffer = Buffer.from(expected, 'hex')
    if (sigBuffer.length !== expBuffer.length) return false
    return timingSafeEqual(sigBuffer, expBuffer)
  } catch {
    return false
  }
}

// ---- Extrair dedup_key do endereço Reply-To --------------------------------

function extractDedupKeyFromAddress(address: string): string | null {
  const match = address.match(/reply\+([a-f0-9-]+)@/i)
  return match?.[1] ?? null
}

// ---- Webhook handler -------------------------------------------------------

// Usa express.raw() para preservar o body bruto para validação HMAC.
// O servidor deve montar esta rota ANTES do json() middleware.

webhookRouter.post(
  '/api/v1/email/webhook',
  async (req: Request, res: Response, next: NextFunction) => {
    const secret = process.env.RESEND_WEBHOOK_SECRET
    if (!secret) {
      return next(new AppError('RESEND_WEBHOOK_SECRET não configurado', 500, 'CONFIG_ERROR'))
    }

    const signature = req.headers['svix-signature'] as string | undefined
    if (!signature) {
      return next(new AppError('Assinatura do webhook ausente', 401, 'INVALID_SIGNATURE'))
    }

    const rawBody: Buffer = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body))
    if (!verifyWebhookSignature(rawBody, signature.replace('v1,', ''), secret)) {
      return next(new AppError('Assinatura do webhook inválida', 401, 'INVALID_SIGNATURE'))
    }

    const payload = JSON.parse(rawBody.toString('utf8'))

    // Suporta apenas eventos de email inbound
    if (payload.type !== 'email.received') {
      res.json({ ignored: true, type: payload.type })
      return
    }

    const data = payload.data as {
      email_id: string
      from: string
      to: string[]
      subject?: string
      html?: string
      text?: string
      headers?: Record<string, string>
    }

    const resendId = data.email_id
    const from    = data.from
    const to      = (data.to ?? []).join(', ')
    const body    = data.text ?? data.html ?? ''

    // Extrair tenant_id a partir do header, ou fallback via dedup_key
    // Em produção, o Reply-To encode o dedup_key que vincula ao EmailEnviado (e portanto ao tenant)
    let tenantId: string | null = null
    let parentDedupKey: string | null = null

    // Tentar extrair de reply+{dedup_key} no endereço to
    for (const addr of data.to ?? []) {
      const key = extractDedupKeyFromAddress(addr)
      if (key) {
        parentDedupKey = key
        // Buscar o EmailEnviado para obter o tenant_id
        const parent = await prisma.emailEnviado.findFirst({
          where: { dedup_key: key },
          select: { tenant_id: true, id: true },
        })
        if (parent) {
          tenantId = parent.tenant_id
        }
        break
      }
    }

    // Se não achou tenant, rejeitar silenciosamente (segurança)
    if (!tenantId) {
      console.warn(`[WEBHOOK] Email inbound sem tenant_id identificável — resend_id:${resendId}`)
      res.json({ accepted: false, reason: 'tenant_not_identified' })
      return
    }

    // ---- Deduplicação Camada 1: Resend ID ---------------------------------
    if (await isDuplicateResendId(resendId)) {
      res.json({ accepted: false, reason: 'duplicate_resend_id' })
      return
    }

    // ---- Deduplicação Camadas 2+3: conteúdo e janela temporal -------------
    if (await isDuplicateContent(tenantId, from, body)) {
      res.json({ accepted: false, reason: 'duplicate_content' })
      return
    }

    // ---- Encontrar ou criar thread -----------------------------------------
    let threadId: string

    if (parentDedupKey) {
      // Tentar encontrar thread via mensagem pai
      const parentMsg = await prisma.emailMessage.findFirst({
        where: { dedup_key: parentDedupKey, tenant_id: tenantId },
        select: { thread_id: true },
      })
      if (parentMsg) {
        threadId = parentMsg.thread_id
      } else {
        // Criar nova thread
        const thread = await prisma.emailThread.create({
          data: {
            tenant_id: tenantId,
            subject: data.subject ?? '(sem assunto)',
          },
        })
        threadId = thread.id
      }
    } else {
      // Criar nova thread
      const thread = await prisma.emailThread.create({
        data: {
          tenant_id: tenantId,
          subject: data.subject ?? '(sem assunto)',
        },
      })
      threadId = thread.id
    }

    // ---- Persistir mensagem inbound ----------------------------------------
    const message = await prisma.emailMessage.create({
      data: {
        tenant_id: tenantId,
        thread_id: threadId,
        resend_id: resendId,
        direction: 'INBOUND',
        from,
        to,
        subject: data.subject,
        body,
        body_html: data.html ?? null,
        parent_message_id: parentDedupKey ?? null,
        gabi_action: 'none',
      },
    })

    // ---- Atualizar thread --------------------------------------------------
    await prisma.emailThread.update({
      where: { id: threadId },
      data: {
        mensagens_count: { increment: 1 },
        ultimo_contato: new Date(),
      },
    })

    // ---- Emitir evento (extensível para Gabi) ------------------------------
    console.log(
      `[WEBHOOK] email:received tenant:${tenantId} thread:${threadId} msg:${message.id}`
    )

    res.json({ accepted: true, message_id: message.id, thread_id: threadId })
  }
)
