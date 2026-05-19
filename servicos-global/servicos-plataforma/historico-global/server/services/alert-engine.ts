import { PrismaClient, AcaoExecutadaPor, AlertaStatus } from '../../../generated/index.js'
import { AuditLogInput } from './audit.service.js'
import { NotificationDispatcher } from './notification-dispatcher.js'

// Lazy initialization — evita ESM hoisting ler process.env antes do dotenv.config()
let _prisma: PrismaClient | undefined
function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })
  }
  return _prisma
}

export const AlertEngine = {
  /**
   * Verifica todas as regras de alerta ativas após um log ser persistido.
   * Chamado de forma assíncrona pelo worker — nunca bloqueia.
   */
  async check(log: AuditLogInput, logId: string): Promise<void> {
    const rules = await getPrisma().alertaRegra.findMany({
      where: {
        habilitada_regra_alerta: true,
        OR: [
          { id_organizacao: log.id_organizacao },
          { id_organizacao: null }, // regras globais Gravity
        ],
      },
    })

    await Promise.allSettled(
      rules.map((rule) => AlertEngine.evaluateRule(rule, log, logId))
    )
  },

  async evaluateRule(
    rule: Awaited<ReturnType<PrismaClient['alertaRegra']['findFirst']>> & object,
    log: AuditLogInput,
    logId: string
  ): Promise<void> {
    if (!rule) return

    // Verificar se o log bate com os filtros da regra
    if (rule.tipo_ator_regra_alerta && rule.tipo_ator_regra_alerta !== log.tipo_ator_historico_log) return
    if (rule.acao_regra_alerta && rule.acao_regra_alerta !== log.acao_historico_log) return
    if (rule.modulo_regra_alerta && rule.modulo_regra_alerta !== log.modulo_historico_log) return

    // Se tem threshold, contar eventos recentes
    if (rule.limiar_contagem_regra_alerta && rule.limiar_janela_segundos_regra_alerta) {
      const windowStart = new Date(
        Date.now() - rule.limiar_janela_segundos_regra_alerta * 1000
      )

      const recentCount = await getPrisma().historicoLog.count({
        where: {
          id_organizacao: log.id_organizacao,
          id_ator_historico_log: log.id_ator_historico_log,
          ...(rule.tipo_ator_regra_alerta ? { tipo_ator_historico_log: rule.tipo_ator_regra_alerta } : {}),
          ...(rule.acao_regra_alerta ? { acao_historico_log: rule.acao_regra_alerta } : {}),
          ...(rule.modulo_regra_alerta ? { modulo_historico_log: rule.modulo_regra_alerta } : {}),
          data_criacao_historico_log: { gte: windowStart },
        },
      })

      if (recentCount < rule.limiar_contagem_regra_alerta) return

      // Buscar IDs dos logs recentes para referenciar no alerta
      const recentLogs = await getPrisma().historicoLog.findMany({
        where: {
          id_organizacao: log.id_organizacao,
          id_ator_historico_log: log.id_ator_historico_log,
          data_criacao_historico_log: { gte: windowStart },
        },
        select: { id_historico_log: true },
        take: 50,
      })

      const alertEvent = await getPrisma().alertaData.create({
        data: {
          id_organizacao: log.id_organizacao,
          id_regra_evento_alerta: rule.id_regra_alerta,
          tipo_ator_evento_alerta: log.tipo_ator_historico_log as AcaoExecutadaPor,
          id_ator_evento_alerta: log.id_ator_historico_log,
          nome_ator_evento_alerta: log.nome_ator_historico_log,
          modulo_evento_alerta: log.modulo_historico_log,
          acao_evento_alerta: log.acao_historico_log,
          contagem_eventos_evento_alerta: recentCount,
          janela_segundos_evento_alerta: rule.limiar_janela_segundos_regra_alerta,
          ids_logs_auditoria_evento_alerta: recentLogs.map((l) => l.id_historico_log),
          status_evento_alerta: AlertaStatus.PENDENTE,
        },
      })

      await NotificationDispatcher.dispatch(rule, alertEvent)
    } else {
      // Regra sem threshold — dispara sempre que o filtro bate (ex: cross-organizacao)
      const alertEvent = await getPrisma().alertaData.create({
        data: {
          id_organizacao: log.id_organizacao,
          id_regra_evento_alerta: rule.id_regra_alerta,
          tipo_ator_evento_alerta: log.tipo_ator_historico_log as AcaoExecutadaPor,
          id_ator_evento_alerta: log.id_ator_historico_log,
          nome_ator_evento_alerta: log.nome_ator_historico_log,
          modulo_evento_alerta: log.modulo_historico_log,
          acao_evento_alerta: log.acao_historico_log,
          contagem_eventos_evento_alerta: 1,
          janela_segundos_evento_alerta: 0,
          ids_logs_auditoria_evento_alerta: [logId],
          status_evento_alerta: AlertaStatus.PENDENTE,
        },
      })

      await NotificationDispatcher.dispatch(rule, alertEvent)
    }
  },
}
