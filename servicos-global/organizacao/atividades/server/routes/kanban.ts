// server/routes/kanban.ts
// CRUD completo para KanbanCards — com ordenação por posição.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { withTenantIsolation } from '@organizacao/middleware/withTenantIsolation.js'

const router = Router()

// ---------------------------------------------------------------------------
// Schemas Zod
// ---------------------------------------------------------------------------

const createKanbanCardSchema = z.object({
  titulo: z.string().min(1).max(300),
  descricao: z.string().optional(),
  status: z.enum(['ABERTO', 'EM_PROGRESSO', 'BLOQUEADO', 'CONCLUIDO']).optional(),
  posicao: z.number().int().min(0).optional(),
  cor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  etiquetas: z.array(z.string()).optional(),
  data_venc: z.string().datetime().optional(),
  atividade_id: z.string().cuid().optional(),
  empresa_id: z.string().cuid().optional(),
  contato_id: z.string().cuid().optional(),
  product_id: z.string().optional(),
})

const updateKanbanCardSchema = createKanbanCardSchema.partial()

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  busca: z.string().optional(),
  status: z.enum(['ABERTO', 'EM_PROGRESSO', 'BLOQUEADO', 'CONCLUIDO']).optional(),
  product_id: z.string().optional(),
  empresa_id: z.string().optional(),
})

const reorderSchema = z.object({
  cards: z.array(
    z.object({
      id: z.string().cuid(),
      posicao: z.number().int().min(0),
      status: z.enum(['ABERTO', 'EM_PROGRESSO', 'BLOQUEADO', 'CONCLUIDO']),
    })
  ),
})

// ---------------------------------------------------------------------------
// GET /api/v1/colunas-kanban
// ---------------------------------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    const query = listQuerySchema.safeParse(req.query)
    if (!query.success) {
      throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')
    }

    const { page, limit, busca, status, product_id, empresa_id } = query.data
    const db = withTenantIsolation(prisma, req.auth.id_organizacao)

    const where = {
      ...(busca && {
        OR: [
          { titulo: { contains: busca, mode: 'insensitive' as const } },
          { descricao: { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
      ...(product_id && { product_id }),
      ...(empresa_id && { empresa_id }),
    }

    const [total, cards] = await Promise.all([
      db.kanbanCard.count({ where }),
      db.kanbanCard.findMany({
        where,
        orderBy: [{ status: 'asc' }, { posicao: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    res.json({
      data: cards,
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
// GET /api/v1/colunas-kanban/:id_coluna_kanban
// ---------------------------------------------------------------------------

router.get('/:id_coluna_kanban', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.id_organizacao)
    const card = await db.kanbanCard.findFirst({ where: { id: req.params.id_coluna_kanban } })
    if (!card) throw new AppError('Card não encontrado', 404, 'NOT_FOUND')
    res.json(card)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/colunas-kanban
// ---------------------------------------------------------------------------

router.post('/', async (req, res, next) => {
  try {
    const result = createKanbanCardSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: result.error.flatten(),
        },
      })
    }

    const db = withTenantIsolation(prisma, req.auth.id_organizacao)
    const card = await db.kanbanCard.create({
      data: { ...result.data, user_id: req.auth.id_usuario },
    })
    res.status(201).json(card)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/colunas-kanban/:id_coluna_kanban
// ---------------------------------------------------------------------------

router.patch('/:id_coluna_kanban', async (req, res, next) => {
  try {
    const result = updateKanbanCardSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: result.error.flatten(),
        },
      })
    }

    const db = withTenantIsolation(prisma, req.auth.id_organizacao)
    const existing = await db.kanbanCard.findFirst({ where: { id: req.params.id_coluna_kanban } })
    if (!existing) throw new AppError('Card não encontrado', 404, 'NOT_FOUND')

    const card = await db.kanbanCard.update({
      where: { id: req.params.id_coluna_kanban },
      data: result.data,
    })
    res.json(card)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/colunas-kanban/reordenar
// Reordena múltiplos cards em lote (drag-and-drop).
// ---------------------------------------------------------------------------

router.post('/reordenar', async (req, res, next) => {
  try {
    const result = reorderSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: result.error.flatten(),
        },
      })
    }

    const db = withTenantIsolation(prisma, req.auth.id_organizacao)

    // Atualiza posição e status de cada card em paralelo
    await Promise.all(
      result.data.cards.map((c) =>
        db.kanbanCard.update({
          where: { id: c.id },
          data: { posicao: c.posicao, status: c.status },
        })
      )
    )

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/colunas-kanban/:id_coluna_kanban
// ---------------------------------------------------------------------------

router.delete('/:id_coluna_kanban', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.id_organizacao)
    const existing = await db.kanbanCard.findFirst({ where: { id: req.params.id_coluna_kanban } })
    if (!existing) throw new AppError('Card não encontrado', 404, 'NOT_FOUND')

    await db.kanbanCard.delete({ where: { id: req.params.id_coluna_kanban } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export { router as kanbanRouter }
