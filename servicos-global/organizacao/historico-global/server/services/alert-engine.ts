import { PrismaClient, AcaoExecutadaPor, AlertaStatus } from '../../../generated/index.js'
import { AuditLogInput } from './audit.service.js'
import { NotificationDispatcher } from './notification-dispatcher.js'

const prisma = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } })

export const AlertEngine = {
  /**
   * Verifica todas as regras de alerta ativas após um log ser persistido.
   * Chamado de forma assíncrona pelo worker — nunca bloqueia.
   */
  async check(log: AuditLogInput, logId: string): Promise<void> {
    const rules = await prisma.regraAlerta.findMany({
      where: {
        enabled: true,
        OR: [
          { tenant_id: log.tenant_id },
          { tenant_id: null }, // regras globais Gravity
        ],
      },
    })

    await Promise.allSettled(
      rules.map((rule) => AlertEngine.evaluateRule(rule, log, logId))
    )
  },

  async evaluateRule(
    rule: Awaited<ReturnType<typeof prisma.regraAlerta.findFirst>> & object,
    log: AuditLogInput,
    logId: string
  ): Promise<void> {
    if (!rule) return

    // Verificar se o log bate com os filtros da regra
    if (rule.actor_type && rule.actor_type !== log.actor_type) return
    if (rule.action && rule.action !== log.action) return
    if (rule.module && rule.module !== log.module) return

    // Se tem threshold, contar eventos recentes
    if (rule.threshold_count && rule.threshold_window_seconds) {
      const windowStart = new Date(
        Date.now() - rule.threshold_window_seconds * 1000
      )

      const recentCount = await prisma.historicoLog.count({
        where: {
          tenant_id: log.tenant_id,
          actor_id: log.actor_id,
          ...(rule.actor_type ? { actor_type: rule.actor_type } : {}),
          ...(rule.action ? { action: rule.action } : {}),
          ...(rule.module ? { module: rule.module } : {}),
          created_at: { gte: windowStart },
        },
      })

      if (recentCount < rule.threshold_count) return

      // Buscar IDs dos logs recentes para referenciar no alerta
      const recentLogs = await prisma.historicoLog.findMany({
        where: {
          tenant_id: log.tenant_id,
          actor_id: log.actor_id,
          created_at: { gte: windowStart },
        },
        select: { id: true },
        take: 50,
      })

      const alertEvent = await prisma.eventoAlerta.create({
        data: {
          tenant_id: log.tenant_id,
          rule_id: rule.id,
          actor_type: log.actor_type as AcaoExecutadaPor,
          actor_id: log.actor_id,
          actor_name: log.actor_name,
          module: log.module,
          action: log.action,
          event_count: recentCount,
          window_seconds: rule.threshold_window_seconds,
          audit_log_ids: recentLogs.map((l) => l.id),
          status: AlertaStatus.PENDENTE,
        },
      })

      await NotificationDispatcher.dispatch(rule, alertEvent)
    } else {
      // Regra sem threshold — dispara sempre que o filtro bate (ex: cross-tenant)
      const alertEvent = await prisma.eventoAlerta.create({
        data: {
          tenant_id: log.tenant_id,
          rule_id: rule.id,
          actor_type: log.actor_type as AcaoExecutadaPor,
          actor_id: log.actor_id,
          actor_name: log.actor_name,
          module: log.module,
          action: log.action,
          event_count: 1,
          window_seconds: 0,
          audit_log_ids: [logId],
          status: AlertaStatus.PENDENTE,
        },
      })

      await NotificationDispatcher.dispatch(rule, alertEvent)
    }
  },
}
