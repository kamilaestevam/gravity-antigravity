import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../lib/errors.js'
import { IngestHistorySchema, ListHistoryQuerySchema } from '../schemas/history.schema.js'

const prisma = new PrismaClient()

// POST /logs
export async function ingestLog(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = req.headers['x-tenant-id'] as string || (req as any).auth?.tenantId || (req as any).tenant_id
    if (!tenant_id) {
      throw AppError.unauthorized('Tenant ID is required for ingestion')
    }

    const bodyValidate = IngestHistorySchema.safeParse(req.body)
    if (!bodyValidate.success) {
      throw AppError.validation(bodyValidate.error.issues[0].message)
    }

    const body = bodyValidate.data;

    // Fire and forget pattern (async write)
    Promise.resolve().then(async () => {
      try {
        await prisma.historyLog.create({
          data: {
            tenant_id,
            actor_id: body.actor_id,
            actor_type: body.actor_type,
            action: body.action,
            product_id: body.product_id,
            user_id: body.user_id,
            metadata: body.metadata || {},
          }
        })
      } catch (err) {
        console.error('[History] Async save failed:', err)
      }
    })

    return res.status(202).json({ accepted: true })
  } catch (error) {
    next(error)
  }
}

// GET /logs
export async function listLogs(req: Request, res: Response, next: NextFunction) {
  try {
    // Assuming withTenantIsolation populates req.auth.tenantId or req.tenant_id
    const rawTenantId = (req as any).tenantId || (req as any).tenant_id || req.headers['x-tenant-id'] || (req as any).auth?.tenantId
    
    const queryValidate = ListHistoryQuerySchema.safeParse({
      ...req.query,
      tenant_id: rawTenantId
    })

    if (!queryValidate.success) {
      throw AppError.validation(queryValidate.error.issues[0].message)
    }

    const query = queryValidate.data;

    if (!query.tenant_id) {
      throw AppError.unauthorized('Tenant ID is required')
    }

    const { tenant_id, startDate, endDate, actor_id, actor_type, action, product_id, user_id, limit, offset } = query

    const where: any = { tenant_id }

    if (startDate || endDate) {
      where.created_at = {}
      if (startDate) where.created_at.gte = new Date(startDate)
      if (endDate) where.created_at.lte = new Date(endDate)
    }

    if (actor_id) where.actor_id = actor_id
    if (actor_type) where.actor_type = actor_type
    if (action) where.action = action
    if (product_id) where.product_id = product_id
    if (user_id) where.user_id = user_id

    const [logs, total] = await Promise.all([
      prisma.historyLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.historyLog.count({ where })
    ])

    res.json({
      data: logs,
      meta: {
        total,
        limit,
        offset
      }
    })
  } catch (error) {
    next(error)
  }
}

// GET /logs/:id
export async function getLogById(req: Request, res: Response, next: NextFunction) {
  try {
    const rawTenantId = (req as any).tenantId || (req as any).tenant_id || req.headers['x-tenant-id'] || (req as any).auth?.tenantId
    if (!rawTenantId) {
      throw AppError.unauthorized('Tenant ID is required')
    }

    const log = await prisma.historyLog.findFirst({
      where: {
        id: req.params.id,
        tenant_id: rawTenantId
      }
    })

    if (!log) {
      throw AppError.notFound('History Log')
    }

    res.json(log)
  } catch (error) {
    next(error)
  }
}
