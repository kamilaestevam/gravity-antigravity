// server/routes/pipelines.ts
// CRUD completo para Pipelines de vendas.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { withTenantIsolation } from '../../middleware/withTenantIsolation.js'

const router = Router()

// ---------------------------------------------------------------------------
// Schemas Zod
// ---------------------------------------------------------------------------

const createPipelineSchema = z.object({
  titulo: z.string().min(1).max(300),
  etapa: z.enum([
    'PROSPECCAO', 'QUALIFICACAO', 'PROPOSTA',
    'NEGOCIACAO', 'FECHAMENTO', 'POS_VENDA',
  ]).optional(),
  valor: z.number().nonnegative().optional(),
  empresa_id: z.string().cuid().optional(),
  contato_id: z.string().cuid().optional(),
  probabilidade: z.number().int().min(0).max(100).optional(),
  data_fechamento: z.string().datetime().optional(),
  observacao: z.string().optional(),
  product_id: z.string().optional(),
})

const updatePipelineSchema = createPipelineSchema.partial()

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  busca: z.string().optional(),
  etapa: z.enum([
    'PROSPECCAO', 'QUALIFICACAO', 'PROPOSTA',
    'NEGOCIACAO', 'FECHAMENTO', 'POS_VENDA',
  ]).optional(),
  empresa_id: z.string().optional(),
  contato_id: z.string().optional(),
  product_id: z.string().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/v1/pipelines
// ---------------------------------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    const query = listQuerySchema.safeParse(req.query)
    if (!query.success) {
      throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')
    }

    const { page, limit, busca, etapa, empresa_id, contato_id, product_id } = query.data
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const where = {
      ...(busca && {
        OR: [
          { titulo: { contains: busca, mode: 'insensitive' as const } },
          { observacao: { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
      ...(etapa && { etapa }),
      ...(empresa_id && { empresa_id }),
      ...(contato_id && { contato_id }),
      ...(product_id && { product_id }),
    }

    const [total, pipelines] = await Promise.all([
      db.pipeline.count({ where }),
      db.pipeline.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    res.json({
      data: pipelines,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /api/v1/pipelines/:id
// ---------------------------------------------------------------------------

router.get('/:id', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const pipeline = await db.pipeline.findFirst({ where: { id: req.params.id } })
    if (!pipeline) throw new AppError('Pipeline não encontrado', 404, 'NOT_FOUND')
    res.json(pipeline)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/pipelines
// ---------------------------------------------------------------------------

router.post('/', async (req, res, next) => {
  try {
    const result = createPipelineSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: result.error.flatten(),
        },
      })
    }

    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const pipeline = await db.pipeline.create({
      data: { ...result.data, user_id: req.auth.userId },
    })
    res.status(201).json(pipeline)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/pipelines/:id
// ---------------------------------------------------------------------------

router.patch('/:id', async (req, res, next) => {
  try {
    const result = updatePipelineSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: result.error.flatten(),
        },
      })
    }

    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const existing = await db.pipeline.findFirst({ where: { id: req.params.id } })
    if (!existing) throw new AppError('Pipeline não encontrado', 404, 'NOT_FOUND')

    const pipeline = await db.pipeline.update({
      where: { id: req.params.id },
      data: result.data,
    })
    res.json(pipeline)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/pipelines/:id
// ---------------------------------------------------------------------------

router.delete('/:id', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const existing = await db.pipeline.findFirst({ where: { id: req.params.id } })
    if (!existing) throw new AppError('Pipeline não encontrado', 404, 'NOT_FOUND')

    await db.pipeline.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export { router as pipelinesRouter }
