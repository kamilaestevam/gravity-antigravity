// server/routes/admin.ts
// Rotas exclusivas para gravity_admin — gestão de todos os tenants da plataforma
// GET   /api/admin/tenants       — listar todos os tenants
// GET   /api/admin/tenants/:id   — detalhes de um tenant
// PATCH /api/admin/tenants/:id   — atualizar status
// GET   /api/admin/stats         — estatísticas globais da plataforma
// GET   /api/admin/users         — listar todos os usuários de todos os tenants
// GET   /api/admin/billing/invoices — listar faturas globais
// GET   /api/admin/deploys       — listar histórico de deploys
// GET   /api/admin/test-logs     — listar logs de testes
// GET   /api/admin/platform-config — dados da plataforma (Visão Geral Admin)
// PUT   /api/admin/platform-config — atualizar dados da plataforma

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { prisma } from '../lib/prisma.js'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'

export const adminRouter = Router()

// Cadeia obrigatória: auth → gravity_admin check
adminRouter.use(requireAuth, requireGravityAdmin)

const UpdateTenantSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'CANCELLED', 'PENDING_SETUP']).optional(),
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
            select: { status: true },
          },
          companies: {
            select: { id: true, name: true, subdomain: true, status: true },
            orderBy: { created_at: 'desc' },
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

/**
 * GET /api/admin/users
 * Lista todos os usuários de todos os tenants da plataforma (gravity_admin)
 */
adminRouter.get('/users', async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 100)
    const skip = (page - 1) * limit
    const search = req.query.search as string | undefined

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
          tenant_id: true,
          tenant: {
            select: { name: true, slug: true },
          },
          memberships: {
            select: {
              id: true,
              company_id: true,
              role: true,
              is_active: true,
              company: {
                select: { name: true, subdomain: true },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/billing/invoices
 * Lista todas as faturas de todos os tenants (gravity_admin)
 */
adminRouter.get('/billing/invoices', async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 50)
    const skip = (page - 1) * limit

    const subscriptions = await prisma.subscription.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        status: true,
        stripe_subscription_id: true,
        current_period_start: true,
        current_period_end: true,
        created_at: true,
        tenant: {
          select: { id: true, name: true, slug: true, stripe_customer_id: true },
        },
      },
    })

    const total = await prisma.subscription.count()

    res.json({
      invoices: subscriptions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/deploys
 * Lista histórico de deploys — lê da tabela DeployLog se existir,
 * senão retorna array vazio (tabela será criada em migration futura)
 */
adminRouter.get('/deploys', async (_req, res, next) => {
  try {
    // Tenta ler da tabela DeployLog; se não existir, retorna vazio
    let deploys: unknown[] = []
    try {
      deploys = await (prisma as any).deployLog?.findMany?.({
        orderBy: { created_at: 'desc' },
        take: 100,
      }) ?? []
    } catch {
      // Tabela não existe ainda — retorna vazio
    }

    res.json({ deploys })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/test-logs
 * Lista logs de testes — lê da tabela TestLog se existir,
 * senão retorna array vazio (tabela será criada em migration futura)
 */
adminRouter.get('/test-logs', async (_req, res, next) => {
  try {
    let logs: unknown[] = []
    try {
      logs = await (prisma as any).testLog?.findMany?.({
        orderBy: { created_at: 'desc' },
        take: 100,
      }) ?? []
    } catch {
      // Tabela não existe ainda — retorna vazio
    }

    res.json({ logs })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/platform-config
 * Dados da plataforma para a Visão Geral Admin (tenant HQ do gravity_admin)
 */
adminRouter.get('/platform-config', async (req, res, next) => {
  try {
    if (!req.auth?.clerkUserId) {
      res.json({ config: null })
      return
    }

    // Busca o tenant do usuário admin logado
    const user = await prisma.user.findFirst({
      where: { clerk_user_id: req.auth.clerkUserId },
      select: { tenant_id: true },
    })

    if (!user) {
      res.json({ config: null })
      return
    }

    // Campos core — sempre existem na migration init
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenant_id },
      select: {
        id: true,
        name: true,
        slug: true,
        cnpj: true,
        state: true,
        city: true,
        created_at: true,
      },
    })

    if (!tenant) {
      res.json({ config: null })
      return
    }

    // Campos opcionais adicionados após init — isolados para não bloquear se migration pendente
    let extras: { segment?: string | null; tipo_empresa?: string | null } = {}
    try {
      const row = await prisma.tenant.findUnique({
        where: { id: tenant.id },
        select: { segment: true, tipo_empresa: true },
      })
      if (row) extras = row
    } catch {
      // Colunas segment/tipo_empresa ainda não migradas — retorna sem elas
    }

    res.json({ config: { ...tenant, ...extras } })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/admin/platform-config
 * Atualiza dados cadastrais da plataforma (tenant HQ)
 */
const PlatformConfigSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  cnpj: z.string().max(20).optional(),
  state: z.string().max(2).optional(),
  city: z.string().max(200).optional(),
  segment: z.string().max(200).optional(),
  tipo_empresa: z.string().max(500).optional(),
})

/**
 * POST /api/admin/users/:userId/promote
 * Promove um usuário para SUPER_ADMIN ou ADMIN.
 * Apenas SUPER_ADMIN pode chamar este endpoint.
 */
const PromoteSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN']),
})

adminRouter.post('/users/:userId/promote', async (req, res, next) => {
  try {
    // Apenas SUPER_ADMIN pode promover — ADMIN tem acesso ao painel mas não pode promover
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Somente Super Admin pode promover usuários', 403, 'FORBIDDEN')
    }

    const parsed = PromoteSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Role inválido',
        400,
        'VALIDATION_ERROR'
      )
    }

    // Impede auto-promoção/alteração
    if (req.params.userId === req.auth.userId) {
      throw new AppError('Não é possível alterar o próprio role', 400, 'INVALID_OPERATION')
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { id: true, email: true, role: true, clerk_user_id: true },
    })
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const updated = await prisma.user.update({
      where: { id: req.params.userId },
      data: { role: parsed.data.role },
      select: { id: true, email: true, role: true },
    })

    // Sincroniza publicMetadata no Clerk para que o frontend reflita o novo role imediatamente.
    // Usuários com clerk_user_id 'pending_...' ainda não aceitaram o convite — não há conta para atualizar.
    if (!user.clerk_user_id.startsWith('pending_')) {
      await clerkClient.users.updateUserMetadata(user.clerk_user_id, {
        publicMetadata: { role: parsed.data.role },
      })
    }

    console.log(
      `[admin] Usuário ${updated.email} promovido para ${updated.role} por ${req.auth.userId}`
    )

    res.json({ user: updated })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/users/invite
 * Convida um usuário com role de plataforma (SUPER_ADMIN, ADMIN, MASTER, STANDARD, SUPPLIER).
 * Apenas SUPER_ADMIN pode convidar SUPER_ADMIN ou ADMIN.
 * ADMIN pode convidar MASTER, STANDARD e SUPPLIER.
 */
const AdminInviteSchema = z.object({
  email: z.string().email().max(255),
  name:  z.string().min(1).max(200),
  role:  z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'STANDARD', 'SUPPLIER']),
})

adminRouter.post('/users/invite', async (req, res, next) => {
  try {
    const parsed = AdminInviteSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { email, name, role } = parsed.data

    // ADMIN não pode criar SUPER_ADMIN ou outro ADMIN
    if (req.auth.role === 'ADMIN' && (role === 'SUPER_ADMIN' || role === 'ADMIN')) {
      throw new AppError('ADMIN não pode convidar usuários com role SUPER_ADMIN ou ADMIN', 403, 'FORBIDDEN')
    }

    // Verifica se já existe usuário com esse e-mail
    const existing = await prisma.user.findFirst({ where: { email } })
    if (existing) {
      throw new AppError('Já existe um usuário com esse e-mail', 409, 'CONFLICT')
    }

    // Cria convite via Clerk
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role, invitedBy: req.auth.clerkUserId, isAdminInvite: true },
    })

    // Cria registro pendente no banco (clerk_user_id será atualizado no webhook user.created)
    const user = await prisma.user.create({
      data: {
        tenant_id:     req.auth.tenantId,
        clerk_user_id: `pending_${invitation.id}`,
        email,
        name,
        role,
      },
    })

    console.log(`[admin] Convite enviado para ${email} (${role}) por ${req.auth.userId}`)

    res.status(201).json({
      message: 'Convite enviado com sucesso',
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
})

adminRouter.put('/platform-config', async (req, res, next) => {
  try {
    const parsed = PlatformConfigSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const user = await prisma.user.findFirst({
      where: { clerk_user_id: req.auth.clerkUserId },
      select: { tenant_id: true },
    })

    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const tenant = await prisma.tenant.update({
      where: { id: user.tenant_id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        slug: true,
        cnpj: true,
        state: true,
        city: true,
        segment: true,
        tipo_empresa: true,
        created_at: true,
      },
    })

    res.json({ config: tenant })
  } catch (err) {
    next(err)
  }
})
