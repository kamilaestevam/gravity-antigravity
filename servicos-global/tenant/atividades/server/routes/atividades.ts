// server/routes/atividades.ts
// CRUD completo para Atividades — com filtros, busca, paginação e suporte kanban.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { withTenantIsolation } from '../../middleware/withTenantIsolation.js'

const router = Router()

// ---------------------------------------------------------------------------
// Schemas Zod
// ---------------------------------------------------------------------------

const createAtividadeSchema = z.object({
  titulo: z.string().min(1).max(300),
  descricao: z.string().optional(),
  tipo: z.enum(['TAREFA', 'REUNIAO', 'LIGACAO', 'EMAIL', 'FOLLOW_UP', 'VISITA', 'OUTRO']).optional(),
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA']).optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  data_inicio: z.string().datetime().optional(),
  data_fim: z.string().datetime().optional(),
  data_venc: z.string().datetime().optional(),
  empresa_id: z.string().cuid().optional(),
  contato_id: z.string().cuid().optional(),
  pipeline_id: z.string().cuid().optional(),
  product_id: z.string().optional(),
})

const updateAtividadeSchema = createAtividadeSchema.partial()

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  busca: z.string().optional(),
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA']).optional(),
  tipo: z.enum(['TAREFA', 'REUNIAO', 'LIGACAO', 'EMAIL', 'FOLLOW_UP', 'VISITA', 'OUTRO']).optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  empresa_id: z.string().optional(),
  contato_id: z.string().optional(),
  pipeline_id: z.string().optional(),
  product_id: z.string().optional(),
  data_venc_ate: z.string().datetime().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/v1/atividades
// ---------------------------------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    const query = listQuerySchema.safeParse(req.query)
    if (!query.success) {
      throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')
    }

    const {
      page, limit, busca, status, tipo, prioridade,
      empresa_id, contato_id, pipeline_id, product_id, data_venc_ate,
    } = query.data

    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const where = {
      ...(busca && {
        OR: [
          { titulo: { contains: busca, mode: 'insensitive' as const } },
          { descricao: { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
      ...(tipo && { tipo }),
      ...(prioridade && { prioridade }),
      ...(empresa_id && { empresa_id }),
      ...(contato_id && { contato_id }),
      ...(pipeline_id && { pipeline_id }),
      ...(product_id && { product_id }),
      ...(data_venc_ate && { data_venc: { lte: new Date(data_venc_ate) } }),
    }

    const [total, atividades] = await Promise.all([
      db.atividade.count({ where }),
      db.atividade.findMany({
        where,
        orderBy: [{ prioridade: 'desc' }, { data_venc: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    res.json({
      data: atividades,
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
// GET /api/v1/atividades/:id
// ---------------------------------------------------------------------------

router.get('/:id', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const atividade = await db.atividade.findFirst({ where: { id: req.params.id } })
    if (!atividade) throw new AppError('Atividade não encontrada', 404, 'NOT_FOUND')
    res.json(atividade)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/atividades
// ---------------------------------------------------------------------------

router.post('/', async (req, res, next) => {
  try {
    const result = createAtividadeSchema.safeParse(req.body)
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
    const atividade = await db.atividade.create({
      data: { ...result.data, user_id: req.auth.userId },
    })
    res.status(201).json(atividade)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/atividades/:id
// ---------------------------------------------------------------------------

router.patch('/:id', async (req, res, next) => {
  try {
    const result = updateAtividadeSchema.safeParse(req.body)
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
    const existing = await db.atividade.findFirst({ where: { id: req.params.id } })
    if (!existing) throw new AppError('Atividade não encontrada', 404, 'NOT_FOUND')

    const atividade = await db.atividade.update({
      where: { id: req.params.id },
      data: result.data,
    })
    res.json(atividade)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/atividades/:id
// ---------------------------------------------------------------------------

router.delete('/:id', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const existing = await db.atividade.findFirst({ where: { id: req.params.id } })
    if (!existing) throw new AppError('Atividade não encontrada', 404, 'NOT_FOUND')

    await db.atividade.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export { router as atividadesRouter }
