/**
 * lgpd.controller.ts
 *
 * Endpoint para exercício do Direito ao Esquecimento (LGPD Art. 18).
 *
 * Estratégia: anonimizar actor_name e actor_ip de todos os logs de um ator,
 * preservando a trilha de auditoria e o integrity_hash (que não inclui esses campos).
 *
 * O sistema grava um novo log de ANONIMIZACAO documentando a solicitação —
 * conforme Barreira 3 (logs imutáveis: correções via novo log, nunca editando o original).
 *
 * Quem pode chamar:
 *   - SUPER_ADMIN / ADMIN (qualquer ator)
 *   - MASTER (apenas atores do próprio tenant)
 */

import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { PrismaClient } from '../../../generated/index.js'
import { AppError } from '../lib/errors.js'
import { extractAuthUser } from '../lib/visibility.js'
import { AuditService } from '../services/audit.service.js'

const prisma = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } })

const AnonymizeSchema = z.object({
  actor_id: z.string().min(1),
  reason: z.string().min(10).max(500),
})

/**
 * POST /lgpd/anonymize
 *
 * Body: { actor_id: string, reason: string }
 *
 * Substitui actor_name por "[Anonimizado - LGPD Art.18 - YYYY-MM-DD]"
 * e actor_ip por null em todos os logs do ator.
 * O integrity_hash é preservado (não inclui esses campos).
 */
export async function anonymizeActor(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-tenant-id'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

    const user = extractAuthUser(req)
    if (!user) throw AppError.unauthorized('Autenticação obrigatória')

    const isGravityAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
    const isMaster = user.role === 'MASTER'

    if (!isGravityAdmin && !isMaster) {
      throw AppError.forbidden('Apenas SUPER_ADMIN, ADMIN ou MASTER podem anonimizar atores')
    }

    const parsed = AnonymizeSchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const { actor_id, reason } = parsed.data

    // MASTER só pode anonimizar atores do próprio tenant
    const tenantFilter = isGravityAdmin ? {} : { tenant_id }

    // Conta quantos logs serão afetados
    const count = await prisma.historyLog.count({
      where: { actor_id, ...tenantFilter },
    })

    if (count === 0) {
      throw AppError.notFound('Nenhum log encontrado para este ator neste tenant')
    }

    const redactedName = `[Anonimizado - LGPD Art.18 - ${new Date().toISOString().slice(0, 10)}]`

    // Anonimiza em batch (apenas PII — não altera campos do integrity_hash)
    await prisma.historyLog.updateMany({
      where: { actor_id, ...tenantFilter },
      data: {
        actor_name: redactedName,
        actor_ip: null,
      },
    })

    // Grava novo log documentando a anonimização (Barreira 3)
    await AuditService.log({
      tenant_id,
      actor_type: 'USER',
      actor_id: user.id,
      actor_name: user.id, // o executor pode ser anonimizado posteriormente
      module: 'compliance',
      resource_type: 'HistoryLog',
      resource_id: actor_id,
      action: 'ANONIMIZACAO_LGPD',
      action_detail: `LGPD Art.18 — ${count} logs anonimizados para actor_id ${actor_id}. Motivo: ${reason}`,
      status: 'SUCCESS',
    })

    res.json({
      anonymized: count,
      actor_id,
      redacted_name: redactedName,
      fields_cleared: ['actor_name', 'actor_ip'],
      note: 'integrity_hash preservado — apenas campos de PII foram alterados',
    })
  } catch (error) {
    next(error)
  }
}
