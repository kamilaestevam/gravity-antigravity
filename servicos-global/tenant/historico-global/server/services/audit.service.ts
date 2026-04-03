import { createHash } from 'crypto'
import { PrismaClient, ActorType, EventStatus } from '../../../generated/index.js'
import { getBoss } from '../queue/pg-boss.js'

const prisma = new PrismaClient()

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

function computeIntegrityHash(input: AuditLogInput, createdAt: Date): string {
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
 * AuditService.log() — único ponto de gravação de audit logs.
 * Encaminha para a fila PG Boss (nunca bloqueia a operação principal).
 * Retorna imediatamente após enfileirar.
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
      // Nunca lançar erro para não bloquear a operação principal
      console.error('[AuditService] Falha ao enfileirar log:', error)
    }
  },

  /**
   * Persistência direta — chamada pelo worker, nunca pelos serviços.
   */
  async persist(input: AuditLogInput): Promise<string> {
    const createdAt = new Date()
    const integrity_hash = computeIntegrityHash(input, createdAt)

    const log = await prisma.historyLog.create({
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
