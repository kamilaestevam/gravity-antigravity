// server/routes/contatos.ts
// CRUD completo para Contatos — com filtros, busca e paginação.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { withTenantIsolation } from '@organizacao/middleware/withTenantIsolation.js'

const router = Router()

// ---------------------------------------------------------------------------
// Schemas Zod
// ---------------------------------------------------------------------------

const createContatoSchema = z.object({
  empresa_id: z.string().cuid().optional(),
  nome: z.string().min(1).max(200),
  cargo: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  observacao: z.string().optional(),
})

const updateContatoSchema = createContatoSchema.partial()

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  busca: z.string().optional(),
  empresa_id: z.string().optional(),
  cargo: z.string().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/v1/contatos
// ---------------------------------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    const query = listQuerySchema.safeParse(req.query)
    if (!query.success) {
      throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')
    }

    const { page, limit, busca, empresa_id, cargo } = query.data
    const db = withTenantIsolation(prisma, req.auth.id_organizacao)

    const where = {
      ...(busca && {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' as const } },
          { email: { contains: busca, mode: 'insensitive' as const } },
          { cargo: { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
      ...(empresa_id && { empresa_id }),
      ...(cargo && { cargo: { contains: cargo, mode: 'insensitive' as const } }),
    }

    const [total, contatos] = await Promise.all([
      db.contato.count({ where }),
      db.contato.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    res.json({
      data: contatos,
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
// GET /api/v1/contatos/:id_contato
// ---------------------------------------------------------------------------

router.get('/:id_contato', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.id_organizacao)
    const contato = await db.contato.findFirst({ where: { id: req.params.id_contato } })
    if (!contato) throw new AppError('Contato não encontrado', 404, 'NOT_FOUND')
    res.json(contato)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/contatos
// ---------------------------------------------------------------------------

router.post('/', async (req, res, next) => {
  try {
    const result = createContatoSchema.safeParse(req.body)
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
    const contato = await db.contato.create({
      data: { ...result.data, user_id: req.auth.id_usuario },
    })
    res.status(201).json(contato)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/contatos/:id_contato
// ---------------------------------------------------------------------------

router.patch('/:id_contato', async (req, res, next) => {
  try {
    const result = updateContatoSchema.safeParse(req.body)
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
    const existing = await db.contato.findFirst({ where: { id: req.params.id_contato } })
    if (!existing) throw new AppError('Contato não encontrado', 404, 'NOT_FOUND')

    const contato = await db.contato.update({
      where: { id: req.params.id_contato },
      data: result.data,
    })
    res.json(contato)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/contatos/:id_contato
// ---------------------------------------------------------------------------

router.delete('/:id_contato', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.id_organizacao)
    const existing = await db.contato.findFirst({ where: { id: req.params.id_contato } })
    if (!existing) throw new AppError('Contato não encontrado', 404, 'NOT_FOUND')

    await db.contato.delete({ where: { id: req.params.id_contato } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export { router as contatosRouter }
