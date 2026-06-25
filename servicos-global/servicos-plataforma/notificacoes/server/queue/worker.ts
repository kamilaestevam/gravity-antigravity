import { getBoss } from './pg-boss'
import { escapeHtml } from '../lib/escape-html.js'

const EMAIL_SERVICE_URL =
  process.env.EMAIL_SERVICE_URL?.trim()
  || process.env.TENANT_EMAIL_SERVICE_URL?.trim()
  || process.env.SERVIDOR_PLATAFORMA_URL?.trim()
  || 'http://127.0.0.1:3001'

function getChaveInternaServico(): string {
  return process.env.CHAVE_INTERNA_SERVICO?.trim()
    || process.env.INTERNAL_API_KEY?.trim()
    || ''
}

export interface EmailJobPayload {
  tenantId: string
  userId: string        // remetente (Clerk ID)
  senderName: string
  recipientEmails: string[]
  message: string
  emailSubject?: string
  targetEntity?: string
  targetId?: string
}

export async function dispatchEmail(payload: EmailJobPayload): Promise<void> {
  const { tenantId, userId, senderName, recipientEmails, message, emailSubject } = payload

  const senderSafe = escapeHtml(senderName)
  const messageSafe = escapeHtml(message).replace(/\n/g, '<br/>')

  const html = `
<div style="font-family:'Plus Jakarta Sans',sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0f172a;color:#f1f5f9;border-radius:8px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
    <span style="font-size:13px;font-weight:700;color:#818cf8;letter-spacing:.05em;text-transform:uppercase">Nova mensagem via Gravity</span>
  </div>
  <div style="background:#1e293b;border-left:3px solid #818cf8;padding:16px;border-radius:4px">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">De: ${senderSafe}</p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#f1f5f9">${messageSafe}</p>
  </div>
  <hr style="border:none;border-top:1px solid #334155;margin:20px 0"/>
  <p style="font-size:11px;color:#475569;margin:0">Enviado pela plataforma Gravity · responda diretamente neste e-mail</p>
</div>`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const chaveInterna = getChaveInternaServico()
    if (!chaveInterna) {
      throw new Error('CHAVE_INTERNA_SERVICO ausente — envio S2S para o serviço de e-mail bloqueado')
    }

    const res = await fetch(`${EMAIL_SERVICE_URL}/api/v1/envios-email`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': chaveInterna,
        'x-chave-interna-servico': chaveInterna,
        'x-id-organizacao': tenantId,
        'x-id-usuario': userId,
      },
      body: JSON.stringify({
        to: recipientEmails,
        subject: emailSubject?.trim() || `Mensagem de ${senderName} via Gravity`,
        body_html: html,
        body: `Nova mensagem de ${senderName}:\n\n${message}`,
      }),
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const body = await res.json().catch(() => null) as { error?: { message?: string } } | null
      throw new Error(`Email service HTTP ${res.status}: ${body?.error?.message ?? 'sem detalhe'}`)
    }
  } catch (err) {
    clearTimeout(timeout)
    // Re-throw para pg-boss acionar retry com backoff exponencial
    throw err
  }
}

export async function startWorker() {
  const boss = getBoss()

  await boss.work<EmailJobPayload>(
    'send-notification',
    { teamSize: 1, teamConcurrency: 20 },
    async ([job]) => {
      const payload = job.data
      console.log(`[WORKER] Processando job email → ${payload.recipientEmails.join(', ')}`)

      try {
        await dispatchEmail(payload)
        console.log(`[WORKER] Email enviado com sucesso para ${payload.recipientEmails.join(', ')}`)
      } catch (err) {
        console.error('[WORKER] Falha ao enviar email — pg-boss vai retry:', (err as Error).message)
        throw err
      }
    },
  )

  console.log('[WORKER] escutando fila send-notification (concorrência 20)')
}
