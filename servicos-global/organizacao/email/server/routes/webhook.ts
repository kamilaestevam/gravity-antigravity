// server/routes/webhook.ts
// POST /api/v1/email/webhook — recebe inbound de emails via Resend Webhooks.
//
// Pipeline:
//  1) Valida assinatura HMAC com RESEND_WEBHOOK_SECRET
//  2) Aplica deduplicação em 3 camadas (Resend ID, timestamp+conteúdo, hash)
//  3) Extrai thread via Reply-To dinâmico (reply+{dedup_key}@dominio)
//  4) Persiste EmailMensagem com direcao: RECEBIDO
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
    // Em produção, o Reply-To encode o dedup_key que vincula ao EmailRegistroEnvio (e portanto ao tenant)
    let tenantId: string | null = null
    let parentDedupKey: string | null = null

    // Tentar extrair de reply+{dedup_key} no endereço to
    for (const addr of data.to ?? []) {
      const key = extractDedupKeyFromAddress(addr)
      if (key) {
        parentDedupKey = key
        // Buscar o EmailRegistroEnvio para obter o tenant_id.
        // DESIGN NOTE: This is an inbound webhook called by Resend, so the tenant
        // is unknown at request time. We resolve it by looking up the dedup_key
        // from the Reply-To address, which links back to an outbound email we sent.
        // If no match is found, we reject the email (see below).
        const parents = await prisma.emailRegistroEnvio.findMany({
          where: { chave_dedup_email_registro_envio: key },
          select: {
            id_organizacao_email_registro_envio: true,
            id_email_registro_envio: true,
          },
        })
        if (parents.length > 1) {
          console.warn(
            `[WEBHOOK] Multiple emailEnviado records match dedup_key=${key} — ` +
            `tenant_ids: ${parents.map(p => p.id_organizacao_email_registro_envio).join(', ')}. Using first match.`
          )
        }
        if (parents.length > 0) {
          tenantId = parents[0].id_organizacao_email_registro_envio
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
      const parentMsg = await prisma.emailMensagem.findFirst({
        where: {
          chave_dedup_email_mensagem: parentDedupKey,
          id_organizacao_email_mensagem: tenantId,
        },
        select: { id_thread_email_mensagem: true },
      })
      if (parentMsg) {
        threadId = parentMsg.id_thread_email_mensagem
      } else {
        // Criar nova thread
        const thread = await prisma.emailAssuntosParticipantes.create({
          data: {
            id_organizacao_email_assuntos_participantes: tenantId,
            assunto_email_assuntos_participantes: data.subject ?? '(sem assunto)',
          },
        })
        threadId = thread.id_email_assuntos_participantes
      }
    } else {
      // Criar nova thread
      const thread = await prisma.emailAssuntosParticipantes.create({
        data: {
          id_organizacao_email_assuntos_participantes: tenantId,
          assunto_email_assuntos_participantes: data.subject ?? '(sem assunto)',
        },
      })
      threadId = thread.id_email_assuntos_participantes
    }

    // ---- Persistir mensagem inbound ----------------------------------------
    const message = await prisma.emailMensagem.create({
      data: {
        id_organizacao_email_mensagem: tenantId,
        id_thread_email_mensagem: threadId,
        id_resend_email_mensagem: resendId,
        direcao_email_mensagem: 'RECEBIDO',
        remetente_email_mensagem: from,
        destinatario_email_mensagem: to,
        assunto_email_mensagem: data.subject,
        corpo_email_mensagem: body,
        corpo_html_email_mensagem: data.html ?? null,
        id_mensagem_pai_email_mensagem: parentDedupKey ?? null,
        acao_gabi_email_mensagem: 'none',
      },
    })

    // ---- Atualizar thread --------------------------------------------------
    await prisma.emailAssuntosParticipantes.update({
      where: { id_email_assuntos_participantes: threadId },
      data: {
        contagem_mensagens_email_assuntos_participantes: { increment: 1 },
        ultimo_contato_email_assuntos_participantes: new Date(),
      },
    })

    // ---- Emitir evento (extensível para Gabi) ------------------------------
    console.log(
      `[WEBHOOK] email:received tenant:${tenantId} thread:${threadId} msg:${message.id_email_mensagem}`
    )

    res.json({ accepted: true, message_id: message.id_email_mensagem, thread_id: threadId })
  }
)
