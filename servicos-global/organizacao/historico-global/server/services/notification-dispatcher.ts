import { PrismaClient } from '../../../generated/index.js'

const prisma = new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })

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

    if (rule.canal_inapp_regra_alerta) {
      tasks.push(
        NotificationDispatcher.sendInapp(rule, alertEvent)
      )
    }

    if (rule.canal_email_regra_alerta && rule.destinatarios_email_regra_alerta.length > 0) {
      tasks.push(
        NotificationDispatcher.sendEmail(rule, alertEvent)
      )
    }

    if (rule.canal_whatsapp_regra_alerta && rule.destinatarios_whatsapp_regra_alerta.length > 0) {
      tasks.push(
        NotificationDispatcher.sendWhatsapp(rule, alertEvent)
      )
    }

    await Promise.allSettled(tasks)
  },

  async sendInapp(rule: AlertRule, alertEvent: AlertEvent): Promise<void> {
    if (!rule || !alertEvent) return

    const logId = await prisma.alertaRegistro.create({
      data: {
        id_organizacao: alertEvent.id_organizacao,
        id_evento_notificacao_alerta: alertEvent.id_evento_alerta,
        canal_notificacao_alerta: 'inapp',
        destinatario_notificacao_alerta: rule.destinatarios_usuarios_regra_alerta.join(',') || 'admin',
        status_notificacao_alerta: 'pending',
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
            id_organizacao: alertEvent.id_organizacao,
            destinatarios_usuarios_regra_alerta: rule.destinatarios_usuarios_regra_alerta,
            type: 'sistema',
            title: `Alerta: ${rule.nome_regra_alerta}`,
            message: `${alertEvent.contagem_eventos_evento_alerta} ação(ões) de "${alertEvent.acao_evento_alerta}" detectada(s) em "${alertEvent.modulo_evento_alerta}" por ${alertEvent.nome_ator_evento_alerta}`,
            id_evento_alerta: alertEvent.id_evento_alerta,
          }),
        })
      },
      logId.id_notificacao_alerta,
      rule.destinatarios_usuarios_regra_alerta.join(',') || 'admin'
    )
  },

  async sendEmail(rule: AlertRule, alertEvent: AlertEvent): Promise<void> {
    if (!rule || !alertEvent) return

    for (const recipient of rule.destinatarios_email_regra_alerta) {
      const logId = await prisma.alertaRegistro.create({
        data: {
          id_organizacao: alertEvent.id_organizacao,
          id_evento_notificacao_alerta: alertEvent.id_evento_alerta,
          canal_notificacao_alerta: 'email',
          destinatario_notificacao_alerta: recipient,
          status_notificacao_alerta: 'pending',
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
              'x-id-organizacao': alertEvent.id_organizacao,
            },
            body: JSON.stringify({
              to: recipient,
              subject: `⚠️ Alerta Gravity: ${rule.nome_regra_alerta}`,
              html: buildEmailHtml(rule, alertEvent),
            }),
          })
        },
        logId.id_notificacao_alerta,
        recipient
      )
    }
  },

  async sendWhatsapp(rule: AlertRule, alertEvent: AlertEvent): Promise<void> {
    if (!rule || !alertEvent) return

    for (const phone of rule.destinatarios_whatsapp_regra_alerta) {
      const logId = await prisma.alertaRegistro.create({
        data: {
          id_organizacao: alertEvent.id_organizacao,
          id_evento_notificacao_alerta: alertEvent.id_evento_alerta,
          canal_notificacao_alerta: 'whatsapp',
          destinatario_notificacao_alerta: phone,
          status_notificacao_alerta: 'pending',
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
              'x-id-organizacao': alertEvent.id_organizacao,
            },
            body: JSON.stringify({
              to: phone,
              text: buildWhatsappText(rule, alertEvent),
            }),
          })
        },
        logId.id_notificacao_alerta,
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
      await prisma.alertaRegistro.update({
        where: { id_notificacao_alerta: notificationLogId },
        data: { status_notificacao_alerta: 'sent', enviado_em_notificacao_alerta: new Date(), tentativas_notificacao_alerta: attempt + 1 },
      })
    } catch (error) {
      if (attempt < RETRY_DELAYS_MS.length) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
        return NotificationDispatcher.withRetry(fn, notificationLogId, recipient, attempt + 1)
      }

      await prisma.alertaRegistro.update({
        where: { id_notificacao_alerta: notificationLogId },
        data: {
          status_notificacao_alerta: 'failed',
          tentativas_notificacao_alerta: attempt + 1,
          mensagem_erro_notificacao_alerta: error instanceof Error ? error.message : String(error),
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
    <h2>⚠️ Alerta de Segurança — ${rule.nome_regra_alerta}</h2>
    <table>
      <tr><td><b>Ator</b></td><td>${alertEvent.nome_ator_evento_alerta} (${alertEvent.tipo_ator_evento_alerta})</td></tr>
      <tr><td><b>Ação</b></td><td>${alertEvent.acao_evento_alerta}</td></tr>
      <tr><td><b>Módulo</b></td><td>${alertEvent.modulo_evento_alerta}</td></tr>
      <tr><td><b>Eventos detectados</b></td><td>${alertEvent.contagem_eventos_evento_alerta} em ${alertEvent.janela_segundos_evento_alerta}s</td></tr>
      <tr><td><b>Horário</b></td><td>${alertEvent.data_criacao_evento_alerta.toISOString()}</td></tr>
    </table>
    ${adminUrl ? `<p><a href="${adminUrl}/admin/historico-global?alert=${alertEvent.id_evento_alerta}">Revisar no painel</a></p>` : ''}
  `
}

function buildWhatsappText(rule: AlertRule, alertEvent: AlertEvent): string {
  if (!rule || !alertEvent) return ''
  return (
    `⚠️ Alerta Gravity: ${rule.nome_regra_alerta}\n` +
    `Ação: ${alertEvent.acao_evento_alerta} em ${alertEvent.modulo_evento_alerta}\n` +
    `Ator: ${alertEvent.nome_ator_evento_alerta}\n` +
    `${alertEvent.contagem_eventos_evento_alerta} evento(s) em ${alertEvent.janela_segundos_evento_alerta}s\n` +
    `Horário: ${alertEvent.data_criacao_evento_alerta.toLocaleString('pt-BR')}`
  )
}
