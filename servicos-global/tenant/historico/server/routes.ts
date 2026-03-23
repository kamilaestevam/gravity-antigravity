import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from './lib/errors.js'
import { z } from 'zod'

export const historicoRouter = Router()
const prisma = new PrismaClient()

// Schema de validação para query
const ListagemQuerySchema = z.object({
  tenant_id: z.string().min(1, 'Tenant ID é obrigatório'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  entity: z.string().optional(),
  user_id: z.string().optional(),
  action: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
})

historicoRouter.get('/', async (req, res, next) => {
  try {
    const query = ListagemQuerySchema.safeParse({
      ...req.query,
      // Fallback pra pegar o tenant_id do auth se nao passar na query
      tenant_id: req.query.tenant_id || (req as any).auth?.tenantId
    })

    if (!query.success) {
      throw AppError.validation(query.error.errors[0].message)
    }

    const { tenant_id, startDate, endDate, entity, user_id, action, limit, offset } = query.data

    const where: any = { tenant_id }

    if (startDate || endDate) {
      where.created_at = {}
      if (startDate) where.created_at.gte = new Date(startDate)
      if (endDate) where.created_at.lte = new Date(endDate)
    }

    if (entity) where.entity = entity
    if (user_id) where.actor_id = user_id
    if (action) where.action = action

    const [logs, total] = await Promise.all([
      prisma.logAlteracao.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.logAlteracao.count({ where })
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
})

historicoRouter.get('/:id', async (req, res, next) => {
  try {
    const tenant_id = req.query.tenant_id || (req as any).auth?.tenantId
    if (!tenant_id) {
      throw AppError.unauthorized('Tenant ID não encontrado.')
    }

    const log = await prisma.logAlteracao.findFirst({
      where: {
        id: req.params.id,
        tenant_id: tenant_id as string
      }
    })

    if (!log) {
      throw AppError.notFound('Log de Histórico')
    }

    res.json(log)
  } catch (error) {
    next(error)
  }
})

historicoRouter.get('/stats/counts', async (req, res, next) => {
  try {
    const tenant_id = req.query.tenant_id || (req as any).auth?.tenantId
    if (!tenant_id) {
        throw AppError.unauthorized('Tenant ID não encontrado.')
    }

    const counts = await prisma.logAlteracao.groupBy({
      by: ['action'],
      where: { tenant_id: tenant_id as string },
      _count: { action: true }
    })

    res.json(counts)
  } catch (error) {
    next(error)
  }
})
