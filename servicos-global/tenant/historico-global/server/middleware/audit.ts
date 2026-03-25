import { createHash } from 'crypto'
import { Request, Response, NextFunction } from 'express'
// Using generic typed prisma client since real one might not exist yet
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Configuração de Limiar Anômalo
const ANOMALY_THRESHOLD = { count: 50, windowSeconds: 10 }

export interface AuditLogData {
  tenant_id: string
  actor_id: string | null
  actor_type: string
  action: string
  entity_id: string | null
  description: string
  diff: any
  created_at: Date
}

export function computeLogHash(log: AuditLogData): string {
  const payload = JSON.stringify({
    tenant_id: log.tenant_id,
    actor_id: log.actor_id,
    actor_type: log.actor_type,
    action: log.action,
    entity_id: log.entity_id,
    description: log.description,
    diff: log.diff,
    created_at: log.created_at.toISOString()
  })
  return createHash('sha256').update(payload).digest('hex')
}

// Simulando captura de estado
async function captureState(req: Request, body?: any) {
  return body || req.body || null
}

function buildDescription(action: string, entityLabel: string, before: any, after: any) {
  return `${action} executado(a) em ${entityLabel}`
}

function buildDiff(before: any, after: any) {
  const diffs = []
  if (!before && after) {
    for (const [key, value] of Object.entries(after)) {
      diffs.push({ field: key, label: key, before: null, after: value })
    }
  } else if (before && after) {
    for (const [key, value] of Object.entries(after)) {
      if (before[key] !== value) {
        diffs.push({ field: key, label: key, before: before[key], after: value })
      }
    }
  }
  return diffs.length > 0 ? diffs : null
}

// Funcação de verificação de anomalia
export async function checkAnomalyAfterLog(tenantId: string, actorId: string | null) {
  if (!actorId) return
  try {
    const recent = await prisma.logAlteracao.count({
      where: {
        tenant_id: tenantId,
        actor_id: actorId,
        created_at: { gte: new Date(Date.now() - ANOMALY_THRESHOLD.windowSeconds * 1000) }
      }
    })
    if (recent > ANOMALY_THRESHOLD.count) {
      console.warn(`[SENTRY] Anomalia no histórico: ${recent} logs em ${ANOMALY_THRESHOLD.windowSeconds}s para o ator ${actorId}`)
    }
  } catch (error) {
    console.error('Erro ao checar anomalia:', error)
  }
}

export interface ActorContext {
  actorType: 'user' | 'system' | 'gabi'
  actorId: string | null
  actorName: string
}

export function auditMiddleware(
  action: string,
  entity: string,
  entityLabel: string,
  explicitActor?: ActorContext
) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      // 1. Barreira: Ator explícito
      const auth = req.auth || {}
      
      const actorType = explicitActor?.actorType ?? (auth.isGabi ? 'gabi' : 'user')
      const actorId = explicitActor?.actorId ?? auth.userId ?? null
      const actorName = explicitActor?.actorName ?? (auth.isGabi ? 'Gabi AI' : (auth.userName ?? 'Unknown'))
      
      const before = await captureState(req)

      const originalJson = res.json.bind(res)

      res.json = (body: any): Response => {
        // Grava de forma assíncrona
        setImmediate(async () => {
          try {
            const after = await captureState(req, body)
            
            const logData: Omit<AuditLogData, 'integrity_hash'> = {
              tenant_id: auth.tenantId || 'unknown-tenant', // Should come from req.auth
              actor_id: actorId,
              actor_type: actorType,
              action,
              entity_id: body?.id || req.params?.id || null,
              description: buildDescription(action, entityLabel, before, after),
              diff: buildDiff(before, after),
              created_at: new Date()
            }
            
            const hash = computeLogHash(logData)

            await prisma.logAlteracao.create({
              data: {
                tenant_id: logData.tenant_id,
                product_id: auth.productId || null,
                actor_id: logData.actor_id,
                actor_type: logData.actor_type,
                actor_name: actorName,
                action: logData.action,
                entity: entity,
                entity_label: entityLabel,
                entity_id: logData.entity_id,
                description: logData.description,
                diff: logData.diff,
                integrity_hash: hash,
                ip_address: req.ip,
                user_agent: req.headers['user-agent'] as string | undefined
              }
            })

            await checkAnomalyAfterLog(logData.tenant_id, logData.actor_id)
            
          } catch (error) {
            console.error('[CRITICAL] Erro ao gravar log de auditoria:', error)
          }
        })

        return originalJson(body)
      }

      next()
    } catch (e) {
      next(e)
    }
  }
}
