import { getBoss } from './pg-boss.js'
import { AuditService, AUDIT_QUEUE, AuditLogInput } from '../services/audit.service.js'
import { AlertEngine } from '../services/alert-engine.js'

const WORKER_CONCURRENCY = 10

export async function startAuditWorker(): Promise<void> {
  const boss = getBoss()

  await boss.work<AuditLogInput>(
    AUDIT_QUEUE,
    { teamSize: WORKER_CONCURRENCY, teamConcurrency: WORKER_CONCURRENCY },
    async (job) => {
      const logId = await AuditService.persist(job.data)
      // Verificar regras de alerta após persistência (não bloqueia o worker)
      AlertEngine.check(job.data, logId).catch((err) =>
        console.error('[audit-worker] Erro no AlertEngine:', err)
      )
    }
  )

  console.log(`[historico] audit-worker iniciado (concorrência: ${WORKER_CONCURRENCY})`)
}
