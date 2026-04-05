import { getBoss } from './pg-boss.js'
import { AuditService, AUDIT_QUEUE, AuditLogInput } from '../services/audit.service.js'
import { AlertEngine } from '../services/alert-engine.js'
import { captureMessage } from '../lib/sentry.js'

const WORKER_CONCURRENCY = 10
// Verifica DLQ a cada 5 minutos
const DLQ_CHECK_INTERVAL_MS = 5 * 60 * 1000

export async function startAuditWorker(): Promise<void> {
  const boss = getBoss()

  // Garantir que a queue existe antes de registrar o worker
  await boss.createQueue(AUDIT_QUEUE).catch(() => { /* já existe */ })

  await boss.work<AuditLogInput>(
    AUDIT_QUEUE,
    { teamSize: WORKER_CONCURRENCY, teamConcurrency: WORKER_CONCURRENCY },
    async (job) => {
      const data = (job as any).data ?? job
      const logId = await AuditService.persist(data)
      // Verificar regras de alerta após persistência (não bloqueia o worker)
      AlertEngine.check(job.data, logId).catch((err) =>
        console.error('[audit-worker] Erro no AlertEngine:', err)
      )
    }
  )

  // DLQ: monitora jobs que esgotaram todas as tentativas
  startDlqMonitor()

  console.log(`[historico] audit-worker iniciado (concorrência: ${WORKER_CONCURRENCY})`)
}

/**
 * DLQ Monitor — verifica periodicamente jobs que falharam definitivamente.
 * Em produção: integrar com Sentry.captureMessage para alertas em tempo real.
 * Jobs falhos ficam em state='failed' na tabela pgboss.job.
 */
function startDlqMonitor(): void {
  const check = async () => {
    try {
      const boss = getBoss()
      // PG Boss expõe getJobById mas não uma query de failed diretamente.
      // Usamos SQL via pg-boss para inspecionar jobs falhos recentes.
      const failedJobs = await (boss as any).db.executeSql(
        `SELECT id, name, data, createdon, completedon
         FROM pgboss.job
         WHERE name = $1 AND state = 'failed'
           AND completedon > NOW() - INTERVAL '10 minutes'
         LIMIT 20`,
        [AUDIT_QUEUE]
      )

      if (failedJobs?.rows?.length > 0) {
        captureMessage('DLQ_ALERT: audit logs falharam definitivamente', 'error', {
          count: failedJobs.rows.length,
          jobs: failedJobs.rows.map((r: any) => ({
            id: r.id,
            tenant_id: r.data?.tenant_id,
            action: r.data?.action,
          })),
        })
      }
    } catch {
      // DLQ monitor nunca deve derrubar o worker
    }
  }

  const interval = setInterval(check, DLQ_CHECK_INTERVAL_MS)
  if (interval.unref) interval.unref()
}
