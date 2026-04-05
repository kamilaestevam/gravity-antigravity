import { createHash } from 'crypto'
import { PrismaClient, ActorType, EventStatus } from '../../../generated/index.js'
import { getBoss } from '../queue/pg-boss.js'
import { captureException, captureMessage } from '../lib/sentry.js'

let _prisma: PrismaClient | null = null
function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({
      datasources: { db: { url: process.env.TENANT_DATABASE_URL } },
    })
  }
  return _prisma
}

export const AUDIT_QUEUE = 'audit:log:ingestion'

export interface AuditLogInput {
  tenant_id: string

  actor_type: ActorType
  actor_id: string
  actor_name: string
  actor_ip?: string
  actor_metadata?: Record<string, unknown>

  module: string
  resource_type: string
  resource_id?: string

  action: string
  action_detail: string

  before?: unknown
  after?: unknown

  status?: EventStatus
  error_message?: string

  product_id?: string
  user_id?: string
}

export function computeIntegrityHash(input: AuditLogInput, createdAt: Date): string {
  const payload = JSON.stringify({
    tenant_id: input.tenant_id,
    actor_type: input.actor_type,
    actor_id: input.actor_id,
    module: input.module,
    resource_type: input.resource_type,
    resource_id: input.resource_id ?? null,
    action: input.action,
    action_detail: input.action_detail,
    before: input.before ?? null,
    after: input.after ?? null,
    status: input.status ?? 'SUCCESS',
    created_at: createdAt.toISOString(),
  })
  return createHash('sha256').update(payload).digest('hex')
}

/**
 * Computa diff campo a campo entre dois snapshots de objeto.
 * Útil para serviços que precisam de diffs precisos no before/after.
 *
 * Exemplo:
 *   const { before, after } = AuditService.computeDiff(entityBefore, entityAfter)
 *   await AuditService.log({ ..., before, after })
 */
export function computeDiff<T extends Record<string, unknown>>(
  before: T,
  after: T
): { before: Partial<T>; after: Partial<T>; changed: boolean } {
  const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])) as (keyof T)[]
  const changedBefore: Partial<T> = {}
  const changedAfter: Partial<T> = {}

  for (const key of allKeys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changedBefore[key] = before[key]
      changedAfter[key] = after[key]
    }
  }

  return {
    before: changedBefore,
    after: changedAfter,
    changed: Object.keys(changedBefore).length > 0,
  }
}

/**
 * AuditService.log() — único ponto de gravação de audit logs.
 * Encaminha para a fila PG Boss (nunca bloqueia a operação principal).
 * Retorna imediatamente após enfileirar.
 *
 * Em caso de falha: emite alerta crítico via console.error (integrar Sentry em produção).
 * O log é perdido — monitorar a métrica `[AuditService] FALHA_CRITICA` no APM.
 */
export const AuditService = {
  async log(input: AuditLogInput): Promise<void> {
    try {
      const boss = getBoss()
      await boss.send(AUDIT_QUEUE, input, {
        retryLimit: 3,
        retryDelay: 5,
        retryBackoff: true,
      })
    } catch (error) {
      console.error('[AuditService] boss.send falhou:', (error as Error).message)
      // Fallback: persistir diretamente se a fila falhar
      try {
        console.log('[AuditService] tentando persist direto, TENANT_DATABASE_URL:', process.env.TENANT_DATABASE_URL ? 'SET' : 'UNSET')
        await AuditService.persist(input)
        console.log('[AuditService] persist direto OK')
      } catch (persistError) {
        console.error('[AuditService] persist direto falhou:', (persistError as Error).message)
        captureException(persistError, {
          tag: 'audit_queue_failure',
          tenant_id: input.tenant_id,
          actor_id: input.actor_id,
          action: input.action,
          module: input.module,
        })
      }
    }
  },

  /**
   * Persistência direta — chamada pelo worker, nunca pelos serviços.
   */
  async persist(input: AuditLogInput): Promise<string> {
    const createdAt = new Date()
    const integrity_hash = computeIntegrityHash(input, createdAt)

    const log = await getPrisma().historyLog.create({
      data: {
        tenant_id: input.tenant_id,
        actor_type: input.actor_type,
        actor_id: input.actor_id,
        actor_name: input.actor_name,
        actor_ip: input.actor_ip ?? null,
        actor_metadata: (input.actor_metadata as object) ?? null,
        module: input.module,
        resource_type: input.resource_type,
        resource_id: input.resource_id ?? null,
        action: input.action,
        action_detail: input.action_detail,
        before: (input.before as object) ?? null,
        after: (input.after as object) ?? null,
        status: input.status ?? EventStatus.SUCCESS,
        error_message: input.error_message ?? null,
        integrity_hash,
        product_id: input.product_id ?? null,
        user_id: input.user_id ?? null,
        created_at: createdAt,
      },
    })

    return log.id
  },
}
