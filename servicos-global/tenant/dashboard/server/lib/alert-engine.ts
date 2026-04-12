import type { PrismaClient } from '@prisma/client'
import { sseHandler } from './sse-handler.js'

// ---------------------------------------------------------------------------
// Tipos compartilhados (espelho dos tipos do query-engine)
// ---------------------------------------------------------------------------

type WidgetDataValue =
  | number
  | Record<string, number>
  | Array<{ label: string; value: number }>
  | Array<{ month: string; value: number }>

type WidgetData = Record<string, WidgetDataValue>

interface WidgetResult {
  data: WidgetData
  chartType: string
  partial: boolean
  cached: boolean
  computed_at: string
}

// ---------------------------------------------------------------------------
// Tipos locais
// ---------------------------------------------------------------------------

interface AlertCondition {
  metric_key: string
  condition: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'change_pct'
  threshold: number | { value: number; pct: number }
}

interface AlertCheckResult {
  alertId: string
  triggered: boolean
  currentValue: number
  threshold: number
}

// Anti-spam: 1 hora entre disparos consecutivos do mesmo alerta
const ALERT_COOLDOWN_MS = 60 * 60 * 1000

const NOTIFICACOES_URL = 'http://localhost:3001/api/v1/notificacoes'

// ---------------------------------------------------------------------------
// Helpers de avaliação de condição
// ---------------------------------------------------------------------------

function extractNumericValue(data: WidgetData, metricKey: string): number | null {
  const value = data[metricKey]
  if (typeof value === 'number') return value
  return null
}

function evaluateCondition(
  current: number,
  condition: AlertCondition['condition'],
  threshold: AlertCondition['threshold']
): boolean {
  const numericThreshold =
    typeof threshold === 'number' ? threshold : threshold.value

  switch (condition) {
    case 'gt':
      return current > numericThreshold
    case 'lt':
      return current < numericThreshold
    case 'gte':
      return current >= numericThreshold
    case 'lte':
      return current <= numericThreshold
    case 'eq':
      return current === numericThreshold
    case 'change_pct':
      // Para change_pct o threshold é { value: referência, pct: percentual mínimo }
      if (typeof threshold === 'number') return false
      const ref = threshold.value
      if (ref === 0) return false
      const changePct = Math.abs((current - ref) / ref) * 100
      return changePct >= threshold.pct
    default:
      return false
  }
}

function isOnCooldown(lastTriggered: Date | null): boolean {
  if (!lastTriggered) return false
  return Date.now() - lastTriggered.getTime() < ALERT_COOLDOWN_MS
}

function resolveNumericThreshold(
  threshold: AlertCondition['threshold']
): number {
  return typeof threshold === 'number' ? threshold : threshold.value
}

// ---------------------------------------------------------------------------
// Chamadas externas
// ---------------------------------------------------------------------------

async function sendNotification(
  tenantId: string,
  userId: string,
  title: string,
  message: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const internalKey = process.env.INTERNAL_SERVICE_KEY

  try {
    const response = await fetch(NOTIFICACOES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': internalKey ?? '',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        tenant_id: tenantId,
        user_id: userId,
        type: 'dashboard_alert',
        title,
        message,
        metadata,
      }),
    })

    if (!response.ok) {
      console.error(
        `[ALERT_ENGINE] Falha ao enviar notificação: HTTP ${response.status}`
      )
    }
  } catch (err) {
    const message_ = err instanceof Error ? err.message : String(err)
    console.error(`[ALERT_ENGINE] Erro ao chamar serviço de notificações: ${message_}`)
  }
}

async function updateLastTriggered(
  prisma: PrismaClient,
  alertId: string
): Promise<void> {
  try {
    await prisma.dashboardAlert.update({
      where: { id: alertId },
      data: { last_triggered: new Date() },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[ALERT_ENGINE] Falha ao atualizar last_triggered do alerta ${alertId}: ${message}`)
  }
}

// ---------------------------------------------------------------------------
// AlertEngine
// ---------------------------------------------------------------------------

export class AlertEngine {
  /**
   * Avalia todos os alertas ativos de um tenant contra os dados de um WidgetResult.
   *
   * Para cada alerta disparado e fora do período de cooldown:
   * - Envia notificação in-app ao usuário do alerta
   * - Atualiza last_triggered no banco
   * - Emite evento SSE para o tenant
   */
  async checkAlerts(
    prisma: PrismaClient,
    tenantId: string,
    widgetResult: WidgetResult,
    widgetId?: string
  ): Promise<AlertCheckResult[]> {
    const results: AlertCheckResult[] = []

    let alerts: Array<{
      id: string
      tenant_id: string
      user_id: string
      metric_key: string
      condition: string
      threshold: unknown
      last_triggered: Date | null
      widget_id: string | null
    }>

    try {
      alerts = await prisma.dashboardAlert.findMany({
        where: {
          tenant_id: tenantId,
          is_active: true,
          ...(widgetId ? { widget_id: widgetId } : {}),
        },
        select: {
          id: true,
          tenant_id: true,
          user_id: true,
          metric_key: true,
          condition: true,
          threshold: true,
          last_triggered: true,
          widget_id: true,
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[ALERT_ENGINE] Falha ao buscar alertas do tenant ${tenantId}: ${message}`)
      return results
    }

    for (const alert of alerts) {
      const currentValue = extractNumericValue(widgetResult.data, alert.metric_key)

      if (currentValue === null) {
        // Métrica não está nos dados deste resultado — pular
        continue
      }

      const alertCondition = alert.condition as AlertCondition['condition']
      const threshold = alert.threshold as AlertCondition['threshold']
      const numericThreshold = resolveNumericThreshold(threshold)
      const triggered = evaluateCondition(currentValue, alertCondition, threshold)

      results.push({
        alertId: alert.id,
        triggered,
        currentValue,
        threshold: numericThreshold,
      })

      if (!triggered) continue
      if (isOnCooldown(alert.last_triggered)) continue

      // Disparar notificação, atualizar banco e emitir SSE
      const title = `Alerta: ${alert.metric_key}`
      const messageText =
        `Métrica "${alert.metric_key}" atingiu ${currentValue} ` +
        `(condição: ${alert.condition} ${numericThreshold})`

      await sendNotification(tenantId, alert.user_id, title, messageText, {
        alert_id: alert.id,
        metric_key: alert.metric_key,
        current_value: currentValue,
        threshold: numericThreshold,
        condition: alert.condition,
        widget_id: alert.widget_id,
      })

      await updateLastTriggered(prisma, alert.id)

      sseHandler.sendToTenant(tenantId, {
        type: 'alert_triggered',
        data: {
          alert_id: alert.id,
          metric_key: alert.metric_key,
          current_value: currentValue,
          threshold: numericThreshold,
          condition: alert.condition,
        },
      })
    }

    return results
  }
}

export const alertEngine = new AlertEngine()
