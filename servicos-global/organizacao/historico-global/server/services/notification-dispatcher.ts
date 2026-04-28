import { PrismaClient } from '../../../generated/index.js'

const prisma = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } })

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || ''
const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || ''
const NOTIFICACOES_SERVICE_URL = process.env.NOTIFICACOES_SERVICE_URL || ''
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || ''

const RETRY_DELAYS_MS = [5_000, 15_000, 45_000]

type AlertRule = Awaited<ReturnType<typeof prisma.alertaRegra.findFirst>>
type AlertEvent = Awaited<ReturnType<typeof prisma.alertaData.findFirst>>

export const NotificationDispatcher = {
  /**
   * Dispara notificações em paralelo para todos os canais ativos da regra.
   * Falha em um canal não impede os outros.
   */
  async dispatch(rule: AlertRule, alertEvent: AlertEvent): Promise<void> {
    if (!rule || !alertEvent) return

    const tasks: Promise<void>[] = []

    if (rule.channel_inapp) {
      tasks.push(
        NotificationDispatcher.sendInapp(rule, alertEvent)
      )
    }

    if (rule.channel_email && rule.recipients_email.length > 0) {
      tasks.push(
        NotificationDispatcher.sendEmail(rule, alertEvent)
      )
    }

    if (rule.channel_whatsapp && rule.recipients_whatsapp.length > 0) {
      tasks.push(
        NotificationDispatcher.sendWhatsapp(rule, alertEvent)
      )
    }

    await Promise.allSettled(tasks)
  },

  async sendInapp(rule: AlertRule, alertEvent: AlertEvent): Promise<void> {
    if (!rule || !alertEvent) return

    const logId = await prisma.registroNotificacaoAlerta.create({
      data: {
        alert_event_id: alertEvent.id,
        channel: 'inapp',
        recipient: rule.recipients_user_ids.join(',') || 'admin',
        status: 'pending',
      },
    })

    await NotificationDispatcher.withRetry(
      async () => {
        if (!NOTIFICACOES_SERVICE_URL) return

        await fetch(`${NOTIFICACOES_SERVICE_URL}/api/v1/internal/notificacoes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-key': INTERNAL_KEY,
          },
          body: JSON.stringify({
            tenant_id: alertEvent.tenant_id,
            user_ids: rule.recipients_user_ids,
            type: 'sistema',
            title: `Alerta: ${rule.name}`,
            message: `${alertEvent.event_count} ação(ões) de "${alertEvent.action}" detectada(s) em "${alertEvent.module}" por ${alertEvent.actor_name}`,
            alert_event_id: alertEvent.id,
          }),
        })
      },
      logId.id,
      rule.recipients_user_ids.join(',') || 'admin'
    )
  },

  async sendEmail(rule: AlertRule, alertEvent: AlertEvent): Promise<void> {
    if (!rule || !alertEvent) return

    for (const recipient of rule.recipients_email) {
      const logId = await prisma.registroNotificacaoAlerta.create({
        data: {
          alert_event_id: alertEvent.id,
          channel: 'email',
          recipient,
          status: 'pending',
        },
      })

      await NotificationDispatcher.withRetry(
        async () => {
          if (!EMAIL_SERVICE_URL) return

          await fetch(`${EMAIL_SERVICE_URL}/api/v1/email/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-key': INTERNAL_KEY,
              'x-tenant-id': alertEvent.tenant_id,
            },
            body: JSON.stringify({
              to: recipient,
              subject: `⚠️ Alerta Gravity: ${rule.name}`,
              html: buildEmailHtml(rule, alertEvent),
            }),
          })
        },
        logId.id,
        recipient
      )
    }
  },

  async sendWhatsapp(rule: AlertRule, alertEvent: AlertEvent): Promise<void> {
    if (!rule || !alertEvent) return

    for (const phone of rule.recipients_whatsapp) {
      const logId = await prisma.registroNotificacaoAlerta.create({
        data: {
          alert_event_id: alertEvent.id,
          channel: 'whatsapp',
          recipient: phone,
          status: 'pending',
        },
      })

      await NotificationDispatcher.withRetry(
        async () => {
          if (!WHATSAPP_SERVICE_URL) return

          await fetch(`${WHATSAPP_SERVICE_URL}/api/v1/whatsapp/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-key': INTERNAL_KEY,
              'x-tenant-id': alertEvent.tenant_id,
            },
            body: JSON.stringify({
              to: phone,
              text: buildWhatsappText(rule, alertEvent),
            }),
          })
        },
        logId.id,
        phone
      )
    }
  },

  async withRetry(
    fn: () => Promise<void>,
    notificationLogId: string,
    recipient: string,
    attempt = 0
  ): Promise<void> {
    try {
      await fn()
      await prisma.registroNotificacaoAlerta.update({
        where: { id: notificationLogId },
        data: { status: 'sent', sent_at: new Date(), attempts: attempt + 1 },
      })
    } catch (error) {
      if (attempt < RETRY_DELAYS_MS.length) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
        return NotificationDispatcher.withRetry(fn, notificationLogId, recipient, attempt + 1)
      }

      await prisma.registroNotificacaoAlerta.update({
        where: { id: notificationLogId },
        data: {
          status: 'failed',
          attempts: attempt + 1,
          error_message: error instanceof Error ? error.message : String(error),
        },
      })

      console.error(
        `[NotificationDispatcher] FALHA_DEFINITIVA ao notificar ${recipient} após ${attempt + 1} tentativas`
      )
    }
  },
}

function buildEmailHtml(rule: AlertRule, alertEvent: AlertEvent): string {
  if (!rule || !alertEvent) return ''
  const adminUrl = process.env.ADMIN_URL || ''
  return `
    <h2>⚠️ Alerta de Segurança — ${rule.name}</h2>
    <table>
      <tr><td><b>Ator</b></td><td>${alertEvent.actor_name} (${alertEvent.actor_type})</td></tr>
      <tr><td><b>Ação</b></td><td>${alertEvent.action}</td></tr>
      <tr><td><b>Módulo</b></td><td>${alertEvent.module}</td></tr>
      <tr><td><b>Eventos detectados</b></td><td>${alertEvent.event_count} em ${alertEvent.window_seconds}s</td></tr>
      <tr><td><b>Horário</b></td><td>${alertEvent.created_at.toISOString()}</td></tr>
    </table>
    ${adminUrl ? `<p><a href="${adminUrl}/admin/historico-global?alert=${alertEvent.id}">Revisar no painel</a></p>` : ''}
  `
}

function buildWhatsappText(rule: AlertRule, alertEvent: AlertEvent): string {
  if (!rule || !alertEvent) return ''
  return (
    `⚠️ Alerta Gravity: ${rule.name}\n` +
    `Ação: ${alertEvent.action} em ${alertEvent.module}\n` +
    `Ator: ${alertEvent.actor_name}\n` +
    `${alertEvent.event_count} evento(s) em ${alertEvent.window_seconds}s\n` +
    `Horário: ${alertEvent.created_at.toLocaleString('pt-BR')}`
  )
}
