// server/routes/empresas.ts
// CRUD completo para Empresas — com filtros, busca e paginação.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { withTenantIsolation } from '@plataforma/middleware/withTenantIsolation.js'

const router = Router()

// ---------------------------------------------------------------------------
// Schemas Zod
// ---------------------------------------------------------------------------

const createEmpresaSchema = z.object({
  nome: z.string().min(1).max(200),
  cnpj: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  site: z.string().url().optional().or(z.literal('')),
  segmento: z.string().optional(),
  status: z.enum(['ATIVA', 'INATIVA', 'PROSPECTO', 'CLIENTE', 'CHURNED']).optional(),
  observacao: z.string().optional(),
})

const updateEmpresaSchema = createEmpresaSchema.partial()

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  busca: z.string().optional(),
  status: z.enum(['ATIVA', 'INATIVA', 'PROSPECTO', 'CLIENTE', 'CHURNED']).optional(),
  segmento: z.string().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/v1/empresas
// ---------------------------------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    const query = listQuerySchema.safeParse(req.query)
    if (!query.success) {
      throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')
    }

    const { page, limit, busca, status, segmento } = query.data
    const db = withTenantIsolation(prisma, req.auth.id_organizacao)

    const where = {
      ...(busca && {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' as const } },
          { email: { contains: busca, mode: 'insensitive' as const } },
          { cnpj: { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
      ...(segmento && { segmento }),
    }

    const [total, empresas] = await Promise.all([
      db.empresa.count({ where }),
      db.empresa.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    res.json({
      data: empresas,
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
// GET /api/v1/empresas/:id_empresa
// ---------------------------------------------------------------------------

router.get('/:id_empresa', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.id_organizacao)
    const empresa = await db.empresa.findFirst({ where: { id: req.params.id_empresa } })
    if (!empresa) throw new AppError('Empresa não encontrada', 404, 'NOT_FOUND')
    res.json(empresa)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/empresas
// ---------------------------------------------------------------------------

router.post('/', async (req, res, next) => {
  try {
    const result = createEmpresaSchema.safeParse(req.body)
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
    const empresa = await db.empresa.create({
      data: { ...result.data, user_id: req.auth.id_usuario },
    })
    res.status(201).json(empresa)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/empresas/:id_empresa
// ---------------------------------------------------------------------------

router.patch('/:id_empresa', async (req, res, next) => {
  try {
    const result = updateEmpresaSchema.safeParse(req.body)
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
    const existing = await db.empresa.findFirst({ where: { id: req.params.id_empresa } })
    if (!existing) throw new AppError('Empresa não encontrada', 404, 'NOT_FOUND')

    const empresa = await db.empresa.update({
      where: { id: req.params.id_empresa },
      data: result.data,
    })
    res.json(empresa)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/empresas/:id_empresa
// ---------------------------------------------------------------------------

router.delete('/:id_empresa', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.id_organizacao)
    const existing = await db.empresa.findFirst({ where: { id: req.params.id_empresa } })
    if (!existing) throw new AppError('Empresa não encontrada', 404, 'NOT_FOUND')

    await db.empresa.delete({ where: { id: req.params.id_empresa } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export { router as empresasRouter }
