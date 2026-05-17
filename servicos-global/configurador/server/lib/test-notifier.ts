// server/lib/test-notifier.ts
// Notificações quando um run de testes falha (email/console)
// Integra com o serviço de email/whatsapp do tenant quando disponível

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface NotificationPayload {
  scheduleId:   string
  totalFalhas:  number
  totalTestes:  number
  timestamp:    string
}

// ─── Enviar notificação ──────────────────────────────────────────────────────

export async function notifyTestFailures(
  scheduleId: string,
  totalFalhas: number,
  totalTestes: number,
): Promise<void> {
  const payload: NotificationPayload = {
    scheduleId,
    totalFalhas,
    totalTestes,
    timestamp: new Date().toISOString(),
  }

  // 1. Sempre loga no console
  console.warn(
    `[test-notifier] ⚠ Schedule ${scheduleId}: ${totalFalhas}/${totalTestes} testes falharam`,
  )

  // 2. Tenta notificar via serviço de email do tenant
  const emailServiceUrl = process.env.EMAIL_SERVICE_URL
  if (emailServiceUrl) {
    try {
      const response = await fetch(`${emailServiceUrl}/api/v1/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env.CHAVE_INTERNA_SERVICO ?? '',
        },
        body: JSON.stringify({
          to: process.env.TEST_NOTIFY_EMAIL ?? 'admin@gravity.app',
          subject: `[Gravity Testes] ${totalFalhas} falha(s) no schedule ${scheduleId}`,
          html: buildEmailHtml(payload),
        }),
      })
      if (!response.ok) {
        console.error(`[test-notifier] Email falhou: ${response.status}`)
      }
    } catch (err) {
      console.error('[test-notifier] Erro ao enviar email:', err)
    }
  }

  // 3. Tenta notificar via WhatsApp (se configurado)
  const whatsappServiceUrl = process.env.WHATSAPP_SERVICE_URL
  if (whatsappServiceUrl && process.env.TEST_NOTIFY_PHONE) {
    try {
      await fetch(`${whatsappServiceUrl}/api/v1/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env.CHAVE_INTERNA_SERVICO ?? '',
        },
        body: JSON.stringify({
          to: process.env.TEST_NOTIFY_PHONE,
          message: `⚠ Gravity Testes: ${totalFalhas}/${totalTestes} falharam (schedule ${scheduleId})`,
        }),
      })
    } catch {
      // WhatsApp é best-effort
    }
  }
}

// ─── Template de email ───────────────────────────────────────────────────────

function buildEmailHtml(payload: NotificationPayload): string {
  const taxa = Math.round((1 - payload.totalFalhas / payload.totalTestes) * 100)
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Falhas em Testes Automatizados</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Schedule</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.scheduleId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Falhas</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; color: #dc2626;">${payload.totalFalhas} de ${payload.totalTestes}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Taxa de sucesso</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${taxa}%</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Horário</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.timestamp}</td>
        </tr>
      </table>
      <p style="margin-top: 16px;">
        Acesse o <a href="${process.env.APP_URL ?? 'http://localhost:8000'}/admin/testes">painel de testes</a> para detalhes.
      </p>
    </div>
  `
}
