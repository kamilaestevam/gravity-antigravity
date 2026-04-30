/**
 * integrity-check-worker.ts
 *
 * Job semanal de integridade: recalcula o SHA256 de cada HistoryLog
 * e alerta se o hash armazenado divergir do calculado.
 *
 * Conforme SKILL.md, Barreira 4:
 *   "Job semanal recalcula o hash de todos os logs e alerta via Sentry se houver discrepância."
 *
 * Em produção: substituir console.error por Sentry.captureMessage (ver TODO abaixo).
 */

import { createHash } from 'crypto'
import { getBoss } from './pg-boss.js'
import { PrismaClient } from '../../../generated/index.js'
import { captureMessage } from '../lib/sentry.js'

const prisma = new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })

export const INTEGRITY_QUEUE = 'audit:integrity:check'

// Processar em lotes para não travar o banco
const BATCH_SIZE = 500

interface IntegrityCheckJobInput {
  /** Se presente, verifica apenas os logs deste tenant. Senão, verifica todos. */
  tenant_id?: string
  /** Offset para jobs em batches */
  offset?: number
}

interface IntegrityResult {
  checked: number
  tampered: number
  tamperedIds: string[]
}

/**
 * Recalcula o hash de um log com os mesmos campos usados na gravação original.
 * Deve ser idêntico a AuditService.computeIntegrityHash().
 */
function recomputeHash(log: {
  tenant_id: string
  actor_type: string
  actor_id: string
  module: string
  resource_type: string
  resource_id: string | null
  action: string
  action_detail: string
  before: unknown
  after: unknown
  status: string
  created_at: Date
}): string {
  const payload = JSON.stringify({
    tenant_id: log.tenant_id,
    actor_type: log.actor_type,
    actor_id: log.actor_id,
    module: log.module,
    resource_type: log.resource_type,
    resource_id: log.resource_id ?? null,
    action: log.action,
    action_detail: log.action_detail,
    before: log.before ?? null,
    after: log.after ?? null,
    status: log.status ?? 'SUCCESS',
    created_at: log.created_at.toISOString(),
  })
  return createHash('sha256').update(payload).digest('hex')
}

export async function startIntegrityCheckWorker(): Promise<void> {
  const boss = getBoss()

  await boss.work<IntegrityCheckJobInput>(
    INTEGRITY_QUEUE,
    { teamSize: 1, teamConcurrency: 1 }, // single worker — não sobrecarregar o banco
    async (job) => {
      const { tenant_id, offset = 0 } = job.data

      const result = await checkBatch({ tenant_id, offset })

      if (result.tampered > 0) {
        captureMessage('INTEGRITY_VIOLATION: logs adulterados detectados', 'fatal', {
          tampered: result.tampered,
          tamperedIds: result.tamperedIds,
          tenant_id: tenant_id ?? 'todos',
          offset,
        })
      }

      // Se havia mais registros neste offset, enfileira o próximo batch
      if (result.checked === BATCH_SIZE) {
        await boss.send(INTEGRITY_QUEUE, {
          tenant_id,
          offset: offset + BATCH_SIZE,
        })
      } else {
        console.log(
          `[integrity-check] Verificação concluída — ${offset + result.checked} logs verificados, ${result.tampered} problema(s)`
        )
      }
    }
  )

  // Garantir que a queue existe antes de agendar
  await boss.createQueue(INTEGRITY_QUEUE).catch(() => { /* já existe */ })

  // Agendar execução semanal via cron PG Boss
  await boss.schedule(INTEGRITY_QUEUE, '0 3 * * 0', {}, { // Domingo 03:00
    tz: 'America/Sao_Paulo',
  })

  console.log('[historico] integrity-check-worker iniciado (cron: domingo 03h BRT)')
}

async function checkBatch(opts: { tenant_id?: string; offset: number }): Promise<IntegrityResult> {
  const logs = await prisma.historicoLog.findMany({
    where: opts.tenant_id ? { tenant_id: opts.tenant_id } : undefined,
    orderBy: { created_at: 'asc' },
    skip: opts.offset,
    take: BATCH_SIZE,
    select: {
      id: true,
      tenant_id: true,
      actor_type: true,
      actor_id: true,
      module: true,
      resource_type: true,
      resource_id: true,
      action: true,
      action_detail: true,
      before: true,
      after: true,
      status: true,
      integrity_hash: true,
      created_at: true,
    },
  })

  const tamperedIds: string[] = []

  for (const log of logs) {
    const expected = recomputeHash(log)
    if (expected !== log.integrity_hash) {
      tamperedIds.push(log.id)
    }
  }

  return {
    checked: logs.length,
    tampered: tamperedIds.length,
    tamperedIds,
  }
}

/**
 * Dispara uma verificação de integridade imediata para um tenant específico.
 * Útil para investigações manuais ou testes.
 */
export async function triggerIntegrityCheck(tenant_id?: string): Promise<void> {
  const boss = getBoss()
  await boss.send(INTEGRITY_QUEUE, { tenant_id, offset: 0 })
  console.log(`[integrity-check] Verificação manual disparada para tenant: ${tenant_id ?? 'todos'}`)
}
