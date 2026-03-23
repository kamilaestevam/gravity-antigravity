// server/services/email.ts
// Único ponto de envio de emails — toda chamada ao Resend passa aqui.
// Implementa retry com backoff exponencial e log completo em EmailEnviado + FilaEmail.

import { randomUUID } from 'crypto'
import { resend } from '../lib/resend.js'
import { prisma } from '../lib/prisma.js'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface SendEmailOptions {
  tenantId: string
  userId?: string
  productId?: string
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  templateId?: string
  /** Se true, não grava log em EmailEnviado (usado para auto-replies da Gabi) */
  skipLog?: boolean
}

interface SendEmailResult {
  resendId: string | null
  dedupKey: string
  success: boolean
  error?: string
}

// ---------------------------------------------------------------------------
// Constantes de retry
// ---------------------------------------------------------------------------

const MAX_TENTATIVAS = 5
// Backoff: tentativa 1=1min, 2=2min, 3=4min, 4=8min, 5=16min
function calcBackoffMs(tentativa: number): number {
  return Math.pow(2, tentativa - 1) * 60 * 1000
}

// ---------------------------------------------------------------------------
// Função principal — única interface pública deste módulo
// ---------------------------------------------------------------------------

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  const {
    tenantId,
    userId = 'system',
    productId,
    to,
    subject,
    html,
    text,
    from = process.env.EMAIL_FROM ?? 'Gravity <no-reply@resend.dev>',
    templateId,
    skipLog = false,
  } = opts

  const dedupKey = randomUUID()

  // Reply-To dinâmico para threading via inbound webhook
  let replyTo: string | undefined
  if (process.env.EMAIL_INBOUND_ADDRESS) {
    const [local, domain] = process.env.EMAIL_INBOUND_ADDRESS.split('@')
    replyTo = `${local}+${dedupKey}@${domain}`
  }

  // Criar registro na fila e no log (a não ser que skipLog)
  let filaId: string | undefined
  let logId: string | undefined

  if (!skipLog) {
    const [log, fila] = await Promise.all([
      prisma.emailEnviado.create({
        data: {
          tenant_id: tenantId,
          product_id: productId,
          user_id: userId,
          to: Array.isArray(to) ? to.join(', ') : to,
          from,
          reply_to: replyTo,
          subject,
          template_id: templateId,
          dedup_key: dedupKey,
          status: 'PENDENTE',
        },
      }),
      prisma.filaEmail.create({
        data: {
          tenant_id: tenantId,
          product_id: productId,
          user_id: userId,
          template_id: templateId,
          payload: JSON.stringify({ to, subject, html, text, from, replyTo }),
          status: 'PENDENTE',
        },
      }),
    ])
    logId = log.id
    filaId = fila.id
  }

  // Tentar envio com retry exponencial
  let lastError: string | undefined
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      // Atualizar status para PROCESSANDO
      if (logId) {
        await prisma.emailEnviado.update({
          where: { id: logId },
          data: { status: 'PROCESSANDO', tentativas: tentativa },
        })
      }
      if (filaId) {
        await prisma.filaEmail.update({
          where: { id: filaId },
          data: { status: 'PROCESSANDO', tentativas: tentativa },
        })
      }

      const { data, error } = await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        reply_to: replyTo,
        headers: {
          'X-Dedup-Key': dedupKey,
          'X-Tenant-Id': tenantId,
        },
      })

      if (error || !data) {
        throw new Error(error?.message ?? 'Resend retornou erro sem detalhes')
      }

      // Sucesso — atualizar status
      const now = new Date()
      if (logId) {
        await prisma.emailEnviado.update({
          where: { id: logId },
          data: {
            status: 'ENVIADO',
            resend_id: data.id,
            enviado_at: now,
          },
        })
      }
      if (filaId) {
        await prisma.filaEmail.update({
          where: { id: filaId },
          data: {
            status: 'ENVIADO',
            processado_at: now,
            email_enviado_id: logId,
          },
        })
      }

      return { resendId: data.id, dedupKey, success: true }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      console.error(
        `[EMAIL_SERVICE] Tentativa ${tentativa}/${MAX_TENTATIVAS} falhou — tenant:${tenantId} erro:${lastError}`
      )

      if (tentativa < MAX_TENTATIVAS) {
        const nextRetryAt = new Date(Date.now() + calcBackoffMs(tentativa))
        if (logId) {
          await prisma.emailEnviado.update({
            where: { id: logId },
            data: {
              tentativas: tentativa,
              next_retry_at: nextRetryAt,
              error_message: lastError,
            },
          })
        }
        if (filaId) {
          await prisma.filaEmail.update({
            where: { id: filaId },
            data: {
              tentativas: tentativa,
              next_retry_at: nextRetryAt,
              erro: lastError,
              status: 'PENDENTE', // volta para pendente para retry
            },
          })
        }
        // Aguardar antes da próxima tentativa (apenas em contexto de retry síncrono)
        await sleep(calcBackoffMs(tentativa))
      }
    }
  }

  // Esgotou tentativas — marcar como FALHOU
  if (logId) {
    await prisma.emailEnviado.update({
      where: { id: logId },
      data: { status: 'FALHOU', error_message: lastError },
    })
  }
  if (filaId) {
    await prisma.filaEmail.update({
      where: { id: filaId },
      data: { status: 'FALHOU', erro: lastError },
    })
  }

  return {
    resendId: null,
    dedupKey,
    success: false,
    error: lastError,
  }
}

// ---------------------------------------------------------------------------
// Interpolação de template
// ---------------------------------------------------------------------------

/**
 * Substitui variáveis como {{nome}}, {{plano}} no template com os valores fornecidos.
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
