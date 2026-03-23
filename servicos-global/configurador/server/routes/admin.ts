// server/routes/admin.ts
// Rotas exclusivas para gravity_admin — gestão de todos os tenants da plataforma
// GET   /api/admin/tenants       — listar todos os tenants
// GET   /api/admin/tenants/:id   — detalhes de um tenant
// PATCH /api/admin/tenants/:id   — atualizar status/plano
// GET   /api/admin/stats         — estatísticas globais da plataforma

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const adminRouter = Router()

// Cadeia obrigatória: auth → gravity_admin check
adminRouter.use(requireAuth, requireGravityAdmin)

const UpdateTenantSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'CANCELLED', 'PENDING_SETUP']).optional(),
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
  note: z.string().optional(),
})

/**
 * GET /api/admin/tenants
 * Lista todos os tenants da plataforma com paginação
 */
adminRouter.get('/tenants', async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 20)
    const skip = (page - 1) * limit
    const search = req.query.search as string | undefined

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          created_at: true,
          _count: { select: { users: true, companies: true } },
          subscriptions: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: { plan: true, status: true },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.tenant.count({ where }),
    ])

    res.json({
      tenants,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/tenants/:id
 * Detalhes completos de um tenant específico
 */
adminRouter.get('/tenants/:id', async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, created_at: true },
        },
        companies: {
          select: { id: true, name: true, subdomain: true, status: true },
        },
        subscriptions: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
        product_configs: {
          select: { product_key: true, is_active: true, updated_at: true },
        },
      },
    })

    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404, 'NOT_FOUND')
    }

    res.json({ tenant })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/admin/tenants/:id
 * Atualiza status ou plano de um tenant (operação administrativa)
 */
adminRouter.patch('/tenants/:id', async (req, res, next) => {
  try {
    const parsed = UpdateTenantSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const existing = await prisma.tenant.findUnique({
      where: { id: req.params.id },
    })
    if (!existing) {
      throw new AppError('Tenant não encontrado', 404, 'NOT_FOUND')
    }

    const tenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: {
        ...(parsed.data.status && { status: parsed.data.status }),
      },
      select: { id: true, name: true, status: true },
    })

    console.log(
      `[admin] Tenant ${req.params.id} atualizado pelo gravity_admin ${req.auth.clerkUserId}:`,
      parsed.data
    )

    res.json({ tenant })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/stats
 * Estatísticas globais da plataforma para o painel admin
 */
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalUsers,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count(),
    ])

    res.json({
      stats: {
        totalTenants,
        activeTenants,
        suspendedTenants,
        totalUsers,
      },
    })
  } catch (err) {
    next(err)
  }
})
