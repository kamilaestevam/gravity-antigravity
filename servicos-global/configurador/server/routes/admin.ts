// server/routes/admin.ts
// Rotas exclusivas para gravity_admin — gestão de todos os tenants da plataforma
// GET   /api/v1/admin/tenants       — listar todos os tenants
// GET   /api/v1/admin/tenants/:id   — detalhes de um tenant
// PATCH /api/v1/admin/tenants/:id   — atualizar status
// GET   /api/v1/admin/stats         — estatísticas globais da plataforma
// GET   /api/v1/admin/usuarios-globais         — listar todos os usuários de todos os tenants
// GET   /api/v1/admin/financeiro-admin/invoices — listar faturas globais
// GET   /api/v1/admin/deploy       — listar histórico de deploys
// GET   /api/v1/admin/testes-gerais/logs     — listar logs de testes
// POST  /api/v1/admin/testes-gerais/logs     — registrar resultados de um run de testes
// GET   /api/v1/admin/visao-geral — dados da plataforma (Visão Geral Admin)
// PUT   /api/v1/admin/visao-geral — atualizar dados da plataforma

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { prisma } from '../lib/prisma.js'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'
import { spawn } from 'child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { walkSuite, type TestLogEntry } from '../utils/playwright-parser.js'
import { analyzeTestFailure, getMetrics as getGeminiMetrics } from '../lib/gemini-test-analyzer.js'
import { generateTestPlan, expandTestPlan } from '../lib/agente-plano-teste.js'
import { generateAndSaveSpec } from '../lib/gerador-specs.js'
import { generateTestidMapping } from '../lib/extrator-testids.js'
import { AuditService } from '../../../tenant/historico-global/server/services/audit.service.js'
import { securityAudit } from '../../../tenant/historico-global/server/lib/securityAuditLogger.js'
import { getBillingProvider } from '../lib/billing/index.js'
import { deployLogService } from '../services/deployLogService.js'
import { rateLimitPresets } from '../middleware/rateLimiter.js'

export const adminRouter = Router()

// Cadeia obrigatória: auth → gravity_admin check
adminRouter.use(requireAuth, requireGravityAdmin)

// Rate limit extra-restritivo nas rotas de billing — operações financeiras
// (create/void/send) disparam calls ao Stripe que têm rate limit próprio,
// e o /admin/financeiro-admin/invoices pode ser usado para enumerar tenants via
// customer_id. O preset admin (60 req/min por tenant:IP) evita flood.
adminRouter.use('/financeiro-admin', rateLimitPresets.admin())

const UpdateTenantSchema = z.object({
  status_organizacao: z.enum(['ATIVO', 'SUSPENSO', 'CANCELADO', 'CONFIGURACAO_PENDENTE']).optional(),
  nome_organizacao: z.string().min(2).max(200).optional(),
  subdominio_organizacao: z.string().min(2).max(100).regex(/^[a-z][a-z0-9-]*$/, 'Subdomínio inválido').optional(),
  note: z.string().optional(),
})

const CreateTenantSchema = z.object({
  nome_organizacao: z.string().min(2).max(200),
  subdominio_organizacao: z.string().min(2).max(100).regex(/^[a-z][a-z0-9-]*$/, 'Subdomínio inválido'),
  plano: z.string().max(100).optional(),
  cnpj_organizacao: z.string().max(20).optional(),
})

const UpdateWorkspaceSchema = z.object({
  status: z.enum(['ATIVO', 'INATIVO']),
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
            { nome_organizacao: { contains: search, mode: 'insensitive' as const } },
            { subdominio_organizacao: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [tenants, total] = await Promise.all([
      prisma.organizacao.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          nome_organizacao: true,
          subdominio_organizacao: true,
          status_organizacao: true,
          created_at: true,
          _count: { select: { users: true, companies: true } },
          subscriptions: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: { status: true },
          },
          companies: {
            select: {
              id: true, name: true, subdomain: true, status: true,
              _count: { select: { memberships: true } },
            },
            orderBy: { created_at: 'desc' },
            take: 5,
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.organizacao.count({ where }),
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
    const idParsed = z.string().min(1).safeParse(req.params.id)
    if (!idParsed.success) throw new AppError('ID inválido', 400, 'VALIDATION_ERROR')

    const tenant = await prisma.organizacao.findUnique({
      where: { id: idParsed.data },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, created_at: true },
          orderBy: { created_at: 'desc' as const },
          take: 50,
        },
        companies: {
          select: { id: true, name: true, subdomain: true, status: true },
          orderBy: { created_at: 'desc' as const },
          take: 50,
        },
        subscriptions: {
          orderBy: { created_at: 'desc' as const },
          take: 1,
        },
        product_configs: {
          select: { product_key: true, is_active: true, updated_at: true },
          take: 50,
        },
      },
    })

    if (!tenant) {
      throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
    }

    // DTO DDD: Prisma `users[].role` → JSON `users[].tipo_usuario`
    const { users, ...tenantRest } = tenant
    res.json({
      tenant: {
        ...tenantRest,
        users: users.map(({ role, ...u }) => ({ ...u, tipo_usuario: role })),
      },
    })
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

    // Impede que admin suspenda/cancele o próprio tenant HQ
    if (req.params.id === req.auth.tenantId) {
      throw new AppError('Não é possível alterar o status do próprio tenant HQ', 403, 'FORBIDDEN')
    }

    const existing = await prisma.organizacao.findUnique({
      where: { id: req.params.id },
    })
    if (!existing) {
      throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
    }

    const tenant = await prisma.organizacao.update({
      where: { id: req.params.id },
      data: {
        ...(parsed.data.status_organizacao && { status_organizacao: parsed.data.status_organizacao }),
        ...(parsed.data.nome_organizacao && { nome_organizacao: parsed.data.nome_organizacao.trim() }),
        ...(parsed.data.subdominio_organizacao && { subdominio_organizacao: parsed.data.subdominio_organizacao }),
      },
      select: { id: true, nome_organizacao: true, subdominio_organizacao: true, status_organizacao: true },
    })

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Organizacao',
      resource_id: tenant.id,
      action: 'TENANT_STATUS_CHANGED',
      action_detail: `Status alterado de ${existing.status_organizacao} para ${tenant.status_organizacao}`,
      before: { status: existing.status_organizacao },
      after: { status: tenant.status_organizacao },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ tenant })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/tenants
 * Cria uma nova organização (tenant) na plataforma
 */
adminRouter.post('/tenants', async (req, res, next) => {
  try {
    const parsed = CreateTenantSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const existing = await prisma.organizacao.findUnique({ where: { subdominio_organizacao: parsed.data.subdominio_organizacao } })
    if (existing) throw new AppError('Subdomínio já está em uso', 409, 'CONFLICT')

    const tenant = await prisma.organizacao.create({
      data: {
        nome_organizacao: parsed.data.nome_organizacao.trim(),
        subdominio_organizacao: parsed.data.subdominio_organizacao,
        status_organizacao: 'ATIVO',
        ...(parsed.data.cnpj_organizacao && { cnpj_organizacao: parsed.data.cnpj_organizacao }),
      },
      select: {
        id: true, nome_organizacao: true, subdominio_organizacao: true, status_organizacao: true, created_at: true,
        _count: { select: { users: true, companies: true } },
      },
    })

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Organizacao',
      resource_id: tenant.id,
      action: 'TENANT_CREATED',
      action_detail: `Organização "${tenant.nome_organizacao}" criada — slug: ${tenant.subdominio_organizacao}`,
      after: { nome_organizacao: tenant.nome_organizacao, subdominio_organizacao: tenant.subdominio_organizacao, status_organizacao: tenant.status_organizacao },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.status(201).json({ tenant })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/admin/workspaces/:id
 * Atualiza status de um workspace (company) — operação administrativa
 */
adminRouter.patch('/workspaces/:id', async (req, res, next) => {
  try {
    const idParsed = z.string().min(1).safeParse(req.params.id)
    if (!idParsed.success) throw new AppError('ID inválido', 400, 'VALIDATION_ERROR')

    const parsed = UpdateWorkspaceSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const existing = await prisma.empresa.findUnique({ where: { id: idParsed.data } })
    if (!existing) throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')

    const company = await prisma.empresa.update({
      where: { id: idParsed.data },
      data: { status: parsed.data.status },
      select: { id: true, name: true, status: true, tenant_id: true },
    })

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Workspace',
      resource_id: company.id,
      action: 'WORKSPACE_STATUS_CHANGED',
      action_detail: `Workspace "${company.name}" — status alterado de ${existing.status} para ${company.status}`,
      before: { status: existing.status },
      after: { status: company.status },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ workspace: company })
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
      prisma.organizacao.count(),
      prisma.organizacao.count({ where: { status_organizacao: 'ATIVO' } }),
      prisma.organizacao.count({ where: { status_organizacao: 'SUSPENSO' } }),
      prisma.usuario.count(),
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
 * GET /api/admin/usuarios-globais
 * Lista todos os usuários de todos os tenants da plataforma (gravity_admin)
 */
const ListUsersQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(500).default(100),
  search: z.string().max(255).optional(),
})

adminRouter.get('/usuarios-globais', async (req, res, next) => {
  try {
    const parsed = ListUsersQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Query inválida', 400, 'VALIDATION_ERROR')
    }
    const { page, limit, search } = parsed.data
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.usuario.findMany({
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
            select: { nome_organizacao: true, subdominio_organizacao: true },
          },
          memberships: {
            where: { is_active: true },
            select: {
              id: true,
              company_id: true,
              role: true,
              is_active: true,
              company: {
                select: { name: true, subdomain: true },
              },
            },
            orderBy: { created_at: 'desc' as const },
            take: 20,
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.usuario.count({ where }),
    ])

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Usuario',
      action: 'USERS_GLOBAL_LIST_VIEWED',
      action_detail: `Listagem global — ${total} usuários (page=${page}, limit=${limit}${search ? `, search="${search}"` : ''})`,
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    // DTO DDD: Prisma `role` → JSON `tipo_usuario` (incluindo memberships aninhadas)
    const usuarios = users.map(({ role, memberships, ...rest }) => ({
      ...rest,
      tipo_usuario: role,
      memberships: memberships.map(({ role: mRole, ...m }) => ({
        ...m,
        tipo_usuario: mRole,
      })),
    }))
    res.json({
      users: usuarios,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

// ─── Billing / Invoices ─────────────────────────────────────────────────────
// Delegadas ao BillingProvider configurado (server/lib/billing).
// Providers suportados hoje: 'stripe'. Skeletons: 'itau', 'santander'.
// Ver docs/BILLING.md para detalhes de arquitetura e checklist de ativação.

const ListInvoicesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(['DRAFT', 'OPEN', 'PAID', 'VOID', 'OVERDUE', 'UNCOLLECTIBLE']).optional(),
  customer_id: z.string().optional(),
})

const CreateInvoiceBodySchema = z.object({
  customer_tenant_id: z.string().min(1),
  description: z.string().min(1).max(500),
  line_items: z.array(z.object({
    description: z.string().min(1).max(200),
    amount_cents: z.number().int().min(0),
    quantity: z.number().int().min(1).default(1),
  })).min(1),
  due_date: z.string().datetime().optional(),
  currency: z.string().length(3).default('brl'),
  metadata: z.record(z.string()).optional(),
  auto_finalize: z.boolean().default(true),
})

const VoidInvoiceBodySchema = z.object({
  reason: z.string().max(500).optional(),
})

/**
 * GET /api/admin/financeiro-admin/invoices
 * Lista invoices via BillingProvider (Stripe por padrão).
 */
adminRouter.get('/financeiro-admin/invoices', async (req, res, next) => {
  try {
    const parsed = ListInvoicesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Query inválida', 400, 'VALIDATION_ERROR')
    }

    const provider = getBillingProvider()
    const result = await provider.listInvoices(parsed.data)

    res.json({
      invoices: result.invoices,
      pagination: {
        has_more: result.has_more,
        next_cursor: result.next_cursor,
      },
      provider: provider.name,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/financeiro-admin/invoices/:id
 */
adminRouter.get('/financeiro-admin/invoices/:id', async (req, res, next) => {
  try {
    const provider = getBillingProvider()
    const invoice = await provider.getInvoice(req.params.id)
    if (!invoice) {
      throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')
    }
    res.json({ invoice })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/financeiro-admin/invoices
 * Cria uma fatura manual via provider (Stripe).
 */
adminRouter.post('/financeiro-admin/invoices', async (req, res, next) => {
  try {
    const parsed = CreateInvoiceBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body inválido', 400, 'VALIDATION_ERROR')
    }

    const provider = getBillingProvider()
    const invoice = await provider.createInvoice(parsed.data)

    // Audit trail imutável (fire-and-forget) — compliance LGPD/SOC2 pra operações financeiras.
    // O frontend (useHistoricoLogger) é best-effort; audit no backend é a fonte autoritária.
    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Invoice',
      resource_id: invoice.id,
      action: 'INVOICE_CREATED',
      action_detail: `Fatura ${invoice.number ?? invoice.id} criada para tenant ${parsed.data.customer_tenant_id} — ${invoice.amount_due_cents} ${invoice.currency}`,
      after: { customer_tenant_id: parsed.data.customer_tenant_id, amount_due_cents: invoice.amount_due_cents, currency: invoice.currency, auto_finalize: parsed.data.auto_finalize },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.status(201).json({ invoice })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/financeiro-admin/invoices/:id/void
 * Anula uma fatura. Stripe: void_invoice. Manual: soft-delete.
 */
adminRouter.post('/financeiro-admin/invoices/:id/void', async (req, res, next) => {
  try {
    const parsed = VoidInvoiceBodySchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body inválido', 400, 'VALIDATION_ERROR')
    }

    const provider = getBillingProvider()
    const invoice = await provider.voidInvoice({ id: req.params.id, reason: parsed.data.reason })

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Invoice',
      resource_id: invoice.id,
      action: 'INVOICE_VOIDED',
      action_detail: `Fatura ${invoice.number ?? invoice.id} anulada${parsed.data.reason ? ` — motivo: ${parsed.data.reason}` : ''}`,
      before: { status: 'OPEN' },
      after: { status: 'VOID', reason: parsed.data.reason ?? null },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ invoice })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/financeiro-admin/invoices/:id/send
 * Envia a fatura ao cliente (email).
 */
adminRouter.post('/financeiro-admin/invoices/:id/send', async (req, res, next) => {
  try {
    const provider = getBillingProvider()
    const invoice = await provider.sendInvoice(req.params.id)

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Invoice',
      resource_id: invoice.id,
      action: 'INVOICE_SENT',
      action_detail: `Fatura ${invoice.number ?? invoice.id} enviada para ${invoice.customer.email ?? invoice.customer.name}`,
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ invoice })
  } catch (err) {
    next(err)
  }
})

// ─── Deploy Log ─────────────────────────────────────────────────────────────
// CRUD manual do histórico de deploys da plataforma Gravity.
// Ver server/services/deployLogService.ts

const DeployEnvironmentEnum = z.enum(['DESENVOLVIMENTO', 'HOMOLOGACAO', 'PRODUCAO', 'TODOS'])
const DeployStatusEnum = z.enum(['SUCESSO', 'FALHOU', 'REVERTIDO', 'EM_ANDAMENTO'])

const ListDeploysQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  area: z.string().max(50).optional(),
  environment: DeployEnvironmentEnum.optional(),
  status: DeployStatusEnum.optional(),
  search: z.string().max(200).optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
})

const CreateDeployBodySchema = z.object({
  area: z.string().min(1).max(50),
  version: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  environment: DeployEnvironmentEnum.default('PRODUCAO'),
  status: DeployStatusEnum.default('SUCESSO'),
  deployed_at: z.string().datetime().optional(),
})

/**
 * GET /api/admin/deploy
 * Lista histórico de deploys com paginação + filtros.
 */
adminRouter.get('/deploy', async (req, res, next) => {
  try {
    const parsed = ListDeploysQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Query inválida', 400, 'VALIDATION_ERROR')
    }

    const result = await deployLogService.list(parsed.data)
    res.json({ deploys: result.deploys, pagination: result.pagination })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/deploy
 * Registra um deploy manualmente. deployed_by vem do req.auth (snapshot do admin).
 */
adminRouter.post('/deploy', async (req, res, next) => {
  try {
    const parsed = CreateDeployBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body inválido', 400, 'VALIDATION_ERROR')
    }

    // Resolve nome do admin a partir do banco
    const user = await prisma.usuario.findUnique({
      where: { id: req.auth.userId },
      select: { id: true, name: true, email: true },
    })
    const deployedBy = user?.name ?? user?.email ?? req.auth.clerkUserId

    const deploy = await deployLogService.create({
      ...parsed.data,
      deployed_by: deployedBy,
      deployed_by_user_id: user?.id,
      deployed_at: parsed.data.deployed_at ? new Date(parsed.data.deployed_at) : undefined,
    })

    res.status(201).json({ deploy })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/admin/deploy/:id
 * Remove um registro de deploy (audit mantido via logEvent do frontend).
 */
adminRouter.delete('/deploy/:id', async (req, res, next) => {
  try {
    const existing = await deployLogService.getById(req.params.id)
    if (!existing) {
      throw new AppError('Deploy não encontrado', 404, 'NOT_FOUND')
    }
    await deployLogService.delete(req.params.id)
    res.json({ deleted: true, id: req.params.id })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/testes-gerais/plans
 * Lista os planos de teste disponíveis, opcionalmente filtrados por produto.
 * Query: ?product=configurador
 */
adminRouter.get('/testes-gerais/plans', (_req, res, next) => {
  try {
    const registryPath = resolve(process.cwd(), '..', '..', 'testes', 'testes-e2e', 'test-plans-registry.json')
    let plans: unknown[] = []
    try {
      plans = JSON.parse(readFileSync(registryPath, 'utf-8'))
    } catch {
      // Registry ainda não existe — retorna vazio
    }

    const product = _req.query.product as string | undefined
    if (product) {
      plans = (plans as Array<{ product: string }>).filter(p => p.product === product)
    }

    res.json({ plans })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/testes-gerais/logs
 * Lista logs de testes — lê da tabela Testes se existir;
 * fallback: lê todos os arquivos JSON em data/test-logs/
 */
adminRouter.get('/testes-gerais/logs', async (_req, res, next) => {
  try {
    const byId = new Map<string, Record<string, unknown>>()

    // 1. Lê arquivos JSON em data/test-logs/ (fonte primária — run-tests escreve aqui)
    try {
      const dir = join(process.cwd(), 'data', 'test-logs')
      if (existsSync(dir)) {
        const files = readdirSync(dir)
          .filter(f => f.endsWith('.json') && !f.startsWith('playwright-run-'))
          .sort()
          .reverse()

        for (const file of files.slice(0, 7)) { // até 7 dias de histórico
          try {
            const content = JSON.parse(readFileSync(join(dir, file), 'utf-8'))
            if (Array.isArray(content)) {
              for (const entry of content) {
                if (entry && typeof entry === 'object' && typeof (entry as { id?: unknown }).id === 'string') {
                  byId.set((entry as { id: string }).id, entry as Record<string, unknown>)
                }
              }
            }
          } catch { /* arquivo inválido — ignora */ }
        }
      }
    } catch { /* diretório não existe */ }

    // 2. Merge com banco (complementa, não substitui — id é único)
    try {
      const dbLogs = await (prisma as any).testLog?.findMany?.({
        orderBy: { created_at: 'desc' },
        take: 500,
      }) ?? []
      for (const log of dbLogs) {
        if (log && typeof log.id === 'string' && !byId.has(log.id)) {
          byId.set(log.id, log)
        }
      }
    } catch {
      // Tabela não existe — ok
    }

    // 3. Ordena por created_at DESC (mais recentes primeiro) para a UI renderizar
    //    a execução atual no topo da tabela e da paginação.
    const logs = Array.from(byId.values()).sort((a, b) => {
      const ta = String(a.created_at ?? '')
      const tb = String(b.created_at ?? '')
      return tb.localeCompare(ta)
    })

    res.json({ logs })
  } catch (err) {
    next(err)
  }
})

// ── Constantes para run-tests ─────────────────────────────────────────────────
const monorepoRoot = resolve(process.cwd(), '..', '..')
let pwRunning = false

/** Timeout máximo de um run completo (15 min). Previne loops infinitos/DoS. */
const RUN_TESTS_TIMEOUT_MS = 15 * 60 * 1000

/**
 * Whitelist de env vars seguras para o processo Playwright.
 *
 * Antes, o spawn herdava todo o `process.env` — incluindo secrets sensíveis
 * (STRIPE_SECRET_KEY, CLERK_SECRET_KEY, DATABASE_URL, ENCRYPTION_KEY,
 * INTERNAL_SERVICE_KEY). Se um teste falhasse e logasse `process.env` no
 * stack trace, esses valores iam parar nos arquivos data/test-logs/*.json
 * que são expostos via GET /admin/testes-gerais/logs.
 *
 * Agora só passamos env vars estritamente necessárias para o Playwright rodar
 * nos ambientes de teste locais/CI. Em dev, o test runner usa o .env.test
 * separado do monorepo, que tem chaves dummy (ex: sk_test_dummy_vitest).
 */
function buildSafeTestEnv(): Record<string, string> {
  const safeKeys = [
    // Runtime
    'PATH', 'HOME', 'USER', 'USERNAME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'SYSTEMROOT',
    'NODE_ENV', 'TEMP', 'TMP', 'TZ', 'LANG', 'LC_ALL',
    // Playwright-specific
    'PLAYWRIGHT_BROWSERS_PATH', 'PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD', 'DEBUG',
    // Portas dos serviços em dev (sem credentials)
    'PORT', 'VITE_PORT',
  ]
  const env: Record<string, string> = {}
  for (const key of safeKeys) {
    const value = process.env[key]
    if (value !== undefined) env[key] = value
  }
  env.CI = '1'
  return env
}

/**
 * POST /api/admin/testes-gerais/run
 * Dispara os testes Playwright em background e persiste os resultados.
 * Retorna imediatamente com { started: true }.
 * Requer SUPER_ADMIN: dispara spawn pesado com acesso ao monorepo.
 */
const RunTestsSchema = z.object({
  modulos: z.array(z.string().max(100)).optional(),
  planos:  z.array(z.string().max(100)).optional(),
})

adminRouter.post('/testes-gerais/run', async (req, res, next) => {
  try {
    // Só SUPER_ADMIN pode disparar run — é operação destrutiva que spawn
    // Playwright consumindo CPU/memória por até 15 min, faz CRUD de verdade
    // nos bancos de teste e pode disparar webhooks externos. ADMIN (CFO,
    // suporte, etc) não precisa desse poder. Mesmo padrão do endpoint
    // POST /admin/usuarios-globais/:userId/promote.
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Somente Super Admin pode disparar runs de teste', 403, 'FORBIDDEN')
    }

    if (pwRunning) {
      throw new AppError('Já existe um run em andamento', 409, 'CONFLICT')
    }

    const parsed = RunTestsSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { modulos, planos } = parsed.data
    let specArgs: string[] = []
    let projectArgs: string[] = []

    if (Array.isArray(planos) && planos.length > 0) {
      // Modo por plano: resolve spec files do registry
      try {
        const registryPath2 = resolve(monorepoRoot, 'testes', 'testes-e2e', 'test-plans-registry.json')
        const registry = JSON.parse(readFileSync(registryPath2, 'utf-8')) as Array<{
          id: string; specFile: string
        }>
        specArgs = planos
          .map(planId => registry.find(p => p.id === planId)?.specFile)
          .filter((f): f is string => !!f)
      } catch { /* registry não existe */ }
    } else if (Array.isArray(modulos) && modulos.length > 0) {
      projectArgs = modulos.flatMap((m: string) => ['--project', m])
    }

    // Audit trail: início do run — quem disparou, com quais planos/módulos
    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'TestRun',
      action: 'RUN_TESTS_STARTED',
      action_detail: `Run iniciado — ${planos?.length ?? 0} plano(s), ${modulos?.length ?? 0} módulo(s)`,
      after: { planos: planos ?? [], modulos: modulos ?? [], specArgs, projectArgs },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    pwRunning = true
    res.json({ started: true })

    // ── Roda Playwright em background (não bloqueia o response) ──────────────
    const dir = join(process.cwd(), 'data', 'test-logs')
    mkdirSync(dir, { recursive: true })

    const proc = spawn(
      'npx',
      ['playwright', 'test', ...specArgs, ...projectArgs, '--reporter=json'],
      {
        cwd:        monorepoRoot,
        env:        buildSafeTestEnv(),
        shell:      true,
        windowsHide: true,
        timeout:    RUN_TESTS_TIMEOUT_MS,
      }
    )

    let pwStdout = ''
    let pwStderr = ''
    proc.stdout?.on('data', (chunk: Buffer) => { pwStdout += chunk.toString() })
    proc.stderr?.on('data', (chunk: Buffer) => { pwStderr += chunk.toString() })

    proc.on('close', () => {
      pwRunning = false
      const entries: TestLogEntry[] = []
      const created_at = new Date().toISOString()

      // Tenta parsear o JSON do stdout
      const raw = pwStdout.trim()
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { suites?: unknown[] }
          for (const suite of (parsed.suites ?? [])) {
            walkSuite(suite as Parameters<typeof walkSuite>[0], entries)
          }
        } catch {
          entries.push({
            type: 'E2E', module: 'playwright/parse-error',
            test_name: 'JSON parse falhou',
            result: 'ERRO',
            duration: '0ms',
            error_log: (pwStderr || pwStdout).slice(0, 500),
            ai_analysis: null,
          })
        }
      } else {
        entries.push({
          type: 'E2E', module: 'playwright/sem-output',
          test_name: 'Playwright não gerou saída',
          result: 'ERRO',
          duration: '0ms',
          error_log: pwStderr.slice(0, 500) || null,
          ai_analysis: null,
        })
      }

      // Salva no arquivo JSON do dia
      const filePath = join(dir, `${created_at.slice(0, 10)}.json`)
      let existing: unknown[] = []
      try { existing = JSON.parse(readFileSync(filePath, 'utf-8')) } catch { /* novo */ }
      // entries já vem com ai_analysis populado pelo walkSuite (quando há falha).
      // Preservamos esse valor em vez de sobrescrever com null.
      const novosLogs = entries.map((e, i) => ({
        id: `${Date.now()}-${i}`,
        created_at,
        ...e,
      }))
      writeFileSync(filePath, JSON.stringify([...existing, ...novosLogs], null, 2))

      // Audit trail: fim do run — quantos passaram/falharam
      const aprovados = entries.filter(e => e.result === 'APROVADO').length
      const reprovados = entries.filter(e => e.result === 'REPROVADO').length
      const erros = entries.filter(e => e.result === 'ERRO').length
      AuditService.log({
        tenant_id: req.auth.tenantId,
        actor_type: 'USER',
        actor_id: req.auth.userId,
        actor_name: req.auth.userId,
        actor_ip: req.ip,
        module: 'admin',
        resource_type: 'TestRun',
        action: 'RUN_TESTS_COMPLETED',
        action_detail: `Run concluído — ${entries.length} testes (${aprovados} aprovados, ${reprovados} reprovados, ${erros} erros)`,
        after: { total: entries.length, aprovados, reprovados, erros },
        status: reprovados + erros > 0 ? 'PARTIAL' : 'SUCCESS',
      }).catch(() => { /* fire-and-forget */ })

      console.log(`[admin/testes-gerais/run] Run concluído — ${entries.length} entradas salvas`)
    })

  } catch (err) {
    pwRunning = false
    next(err)
  }
})

/**
 * GET /api/admin/testes-gerais/run/status
 * Verifica se há um run em andamento.
 */
adminRouter.get('/testes-gerais/run/status', (_req, res) => {
  res.json({ running: pwRunning })
})

/**
 * POST /api/admin/testes-gerais/logs
 * Registra resultados de um run de testes (Playwright, Vitest, etc.)
 * Tenta salvar no banco; se Testes não existir, salva em arquivo JSON local.
 */
const AiAnalysisSchema = z.object({
  erroResumo:       z.string(),
  motivo:           z.string(),
  sugestaoCorrecao: z.string(),
  arquivo:          z.string(),
  codigoDiff:       z.object({ old: z.string(), new: z.string() }).optional(),
  provaVisual:      z.string().optional(),
}).nullable().optional()

const TestLogEntrySchema = z.object({
  type:         z.string().max(50),
  module:       z.string().max(100),
  test_name:    z.string().max(255),
  result:       z.enum(['APROVADO', 'REPROVADO', 'ERRO']),
  duration:     z.string().max(50),
  error_log:    z.string().nullable().optional(),
  ai_analysis:  AiAnalysisSchema,
})

const TestLogBatchSchema = z.object({
  entries: z.array(TestLogEntrySchema).min(1).max(500),
})

adminRouter.post('/testes-gerais/logs', async (req, res, next) => {
  try {
    const parse = TestLogBatchSchema.safeParse(req.body)
    if (!parse.success) {
      throw new AppError(parse.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR')
    }

    const { entries } = parse.data
    const created_at = new Date().toISOString()
    let salvouNoBanco = false

    // Tenta salvar no banco (requer migração futura com modelo Testes)
    try {
      if ((prisma as any).testLog?.createMany) {
        await (prisma as any).testLog.createMany({
          data: entries.map(e => ({
            type:      e.type,
            module:    e.module,
            test_name: e.test_name,
            result:    e.result,
            duration:  e.duration,
            error_log: e.error_log ?? null,
            created_at,
          })),
        })
        salvouNoBanco = true
      }
    } catch {
      // Tabela não existe ainda — fallback para arquivo JSON
    }

    // Fallback: persiste em arquivo JSON local (lido pela mesma GET /test-logs via merge futuro)
    if (!salvouNoBanco) {
      const { writeFileSync, readFileSync, mkdirSync } = await import('fs')
      const { join } = await import('path')
      const dir = join(process.cwd(), 'data', 'test-logs')
      mkdirSync(dir, { recursive: true })
      const filePath = join(dir, `${created_at.slice(0, 10)}.json`)
      let existing: unknown[] = []
      try { existing = JSON.parse(readFileSync(filePath, 'utf-8')) } catch { /* novo arquivo */ }
      const novosLogs = entries.map((e, i) => ({
        id: `${Date.now()}-${i}`,
        created_at,
        ...e,
        error_log:   e.error_log ?? null,
        ai_analysis: e.ai_analysis ?? null,
      }))
      writeFileSync(filePath, JSON.stringify([...existing, ...novosLogs], null, 2))
    }

    // Audit trail: ingestão externa de test-logs (ex: CI pipeline enviando
    // resultados de Vitest). Registra quem enviou e quantos batches.
    const aprovados = entries.filter(e => e.result === 'APROVADO').length
    const reprovados = entries.filter(e => e.result === 'REPROVADO').length
    const erros = entries.filter(e => e.result === 'ERRO').length
    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'TestLogBatch',
      action: 'TEST_LOGS_INGESTED',
      action_detail: `${entries.length} test-logs ingeridos (${aprovados} aprovados, ${reprovados} reprovados, ${erros} erros)`,
      after: { total: entries.length, aprovados, reprovados, erros, persistedInDb: salvouNoBanco },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.status(201).json({ ok: true, saved: entries.length, banco: salvouNoBanco })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/visao-geral
 * Dados da plataforma para a Visão Geral Admin (tenant HQ do gravity_admin)
 */
adminRouter.get('/visao-geral', async (req, res, next) => {
  try {
    if (!req.auth?.clerkUserId) {
      res.json({ config: null })
      return
    }

    // Busca o tenant do usuário admin logado
    const user = await prisma.usuario.findFirst({
      where: { clerk_user_id: req.auth.clerkUserId },
      select: { tenant_id: true },
    })

    if (!user) {
      res.json({ config: null })
      return
    }

    // Campos core — sempre existem na migration init
    const tenant = await prisma.organizacao.findUnique({
      where: { id: user.tenant_id },
      select: {
        id: true,
        nome_organizacao: true,
        subdominio_organizacao: true,
        cnpj_organizacao: true,
        estado_organizacao: true,
        cidade_organizacao: true,
        created_at: true,
      },
    })

    if (!tenant) {
      res.json({ config: null })
      return
    }

    // Campos opcionais adicionados após init — isolados para não bloquear se migration pendente
    let extras: { segmento_organizacao?: string | null; tipo_empresa_organizacao?: string | null } = {}
    try {
      const row = await prisma.organizacao.findUnique({
        where: { id: tenant.id },
        select: { segmento_organizacao: true, tipo_empresa_organizacao: true },
      })
      if (row) extras = row
    } catch {
      // Colunas segmento_organizacao/tipo_empresa_organizacao ainda não migradas — retorna sem elas
    }

    res.json({ config: { ...tenant, ...extras } })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/admin/visao-geral
 * Atualiza dados cadastrais da plataforma (tenant HQ)
 */
const PlatformConfigSchema = z.object({
  nome_organizacao: z.string().min(1).max(200).optional(),
  cnpj_organizacao: z.string().max(20).optional(),
  estado_organizacao: z.string().max(2).optional(),
  cidade_organizacao: z.string().max(200).optional(),
  segmento_organizacao: z.string().max(200).optional(),
  tipo_empresa_organizacao: z.string().max(500).optional(),
})

/**
 * POST /api/admin/usuarios-globais/:userId/promote
 * Promove um usuário para SUPER_ADMIN ou ADMIN.
 * Apenas SUPER_ADMIN pode chamar este endpoint.
 */
const PromoteSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN']),
})

adminRouter.post('/usuarios-globais/:userId/promote', async (req, res, next) => {
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

    const user = await prisma.usuario.findUnique({
      where: { id: req.params.userId },
      select: { id: true, email: true, role: true, clerk_user_id: true, tenant_id: true },
    })
    if (!user || user.tenant_id !== req.auth.tenantId) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const updated = await prisma.usuario.update({
      where: { id: req.params.userId },
      data: { role: parsed.data.role },
      select: { id: true, email: true, role: true },
    })

    securityAudit.roleChanged(req.auth.tenantId, req.auth.userId, {
      targetUserId: req.params.userId,
      oldRole: user.role,
      newRole: updated.role,
    }).catch(() => { /* fire-and-forget */ })

    // DTO DDD: Prisma `role` → JSON `tipo_usuario`
    const { role: updRole, ...updRest } = updated
    res.json({ user: { ...updRest, tipo_usuario: updRole } })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/usuarios-globais/invite
 * Convida um usuário com role de plataforma (SUPER_ADMIN, ADMIN, MASTER, STANDARD, SUPPLIER).
 * Apenas SUPER_ADMIN pode convidar SUPER_ADMIN ou ADMIN.
 * ADMIN pode convidar MASTER, STANDARD e SUPPLIER.
 */
const AdminInviteSchema = z.object({
  email: z.string().email().max(255),
  name:  z.string().min(1).max(200),
  role:  z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR']),
})

adminRouter.post('/usuarios-globais/invite', async (req, res, next) => {
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

    // Verifica se já existe usuário com esse e-mail no tenant HQ
    const existing = await prisma.usuario.findFirst({ where: { email, tenant_id: req.auth.tenantId } })
    if (existing) {
      throw new AppError('Já existe um usuário com esse e-mail', 409, 'CONFLICT')
    }

    // Cria convite via Clerk — sem publicMetadata (Mandamento 01: Clerk só autentica)
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
    })

    // Cria registro pendente no banco (clerk_user_id será atualizado no webhook user.created)
    const user = await prisma.usuario.create({
      data: {
        tenant_id:     req.auth.tenantId,
        clerk_user_id: `pending_${invitation.id}`,
        email,
        name,
        role,
      },
    })

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Usuario',
      resource_id: user.id,
      action: 'USER_INVITED',
      action_detail: `Convite enviado — role=${role}`,
      after: { email: user.email, role: user.role },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.status(201).json({
      message: 'Convite enviado com sucesso',
      user: { id: user.id, email: user.email, tipo_usuario: user.role },
    })
  } catch (err) {
    next(err)
  }
})

adminRouter.put('/visao-geral', async (req, res, next) => {
  try {
    const parsed = PlatformConfigSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const user = await prisma.usuario.findFirst({
      where: { clerk_user_id: req.auth.clerkUserId },
      select: { tenant_id: true },
    })

    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const before = await prisma.organizacao.findUnique({
      where: { id: user.tenant_id },
      select: { nome_organizacao: true, cnpj_organizacao: true, estado_organizacao: true, cidade_organizacao: true, segmento_organizacao: true, tipo_empresa_organizacao: true },
    })

    const tenant = await prisma.organizacao.update({
      where: { id: user.tenant_id },
      data: parsed.data,
      select: {
        id: true,
        nome_organizacao: true,
        subdominio_organizacao: true,
        cnpj_organizacao: true,
        estado_organizacao: true,
        cidade_organizacao: true,
        segmento_organizacao: true,
        tipo_empresa_organizacao: true,
        created_at: true,
      },
    })

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'PlatformConfig',
      resource_id: tenant.id,
      action: 'PLATFORM_CONFIG_UPDATED',
      action_detail: `Campos alterados: ${Object.keys(parsed.data).join(', ')}`,
      before: before ?? undefined,
      after: parsed.data,
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ config: tenant })
  } catch (err) {
    next(err)
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// Onda 2 — Sistema de Testes: Planos, Análise Gemini, Schedules, Métricas
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Test Plans ─────────────────────────────────────────────────────────────

const GeneratePlanSchema = z.object({
  escopo:             z.string().min(1),
  sublocal:           z.string().min(1),
  tela:               z.string().min(1),
  rota:               z.string().min(1),
  componenteFilePath: z.string().min(1),
  criticidade:        z.string().min(1),
  temDinheiro:        z.boolean().optional(),
})

/**
 * POST /api/admin/testes-gerais/plans/generate
 * Gera um plano de teste 20/20 para uma tela via Gemini.
 * Requer SUPER_ADMIN.
 */
adminRouter.post('/testes-gerais/plans/generate', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode gerar planos', 403, 'FORBIDDEN')
    }

    const parsed = GeneratePlanSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const plan = await generateTestPlan(parsed.data)

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'TestPlan',
      resource_id: plan.id,
      action: 'TEST_PLAN_GENERATED',
      action_detail: `Plano ${plan.id} gerado — ${plan.passos.length} passos, cobertura ${plan.coberturaPercentual}%`,
      after: { id: plan.id, passos: plan.passos.length, cobertura: plan.coberturaPercentual },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.status(201).json({ plan })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/testes-gerais/plans/:id/expand
 * Expande um plano existente preservando passos humano-original.
 * Requer SUPER_ADMIN.
 */
const ExpandPlanSchema = z.object({
  componenteFilePath: z.string().min(1),
})

adminRouter.post('/testes-gerais/plans/:id/expand', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode expandir planos', 403, 'FORBIDDEN')
    }

    const parsed = ExpandPlanSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    // Carrega plano existente do registry
    const registryPath = resolve(process.cwd(), '..', '..', 'testes', 'test-plans-registry.json')
    if (!existsSync(registryPath)) {
      throw new AppError('Registry não encontrado', 404, 'NOT_FOUND')
    }

    const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      planos: Array<{ id: string; planoFile: string }>
    }
    const entry = registry.planos.find(p => p.id === req.params.id)
    if (!entry) {
      throw new AppError('Plano não encontrado no registry', 404, 'NOT_FOUND')
    }

    const planPath = resolve(process.cwd(), '..', '..', 'testes', entry.planoFile)
    if (!existsSync(planPath)) {
      throw new AppError('Arquivo do plano não encontrado', 404, 'NOT_FOUND')
    }

    const existingPlan = JSON.parse(readFileSync(planPath, 'utf-8'))
    const expanded = await expandTestPlan(existingPlan, parsed.data.componenteFilePath)

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'TestPlan',
      resource_id: expanded.id,
      action: 'TEST_PLAN_EXPANDED',
      action_detail: `Plano ${expanded.id} expandido — ${expanded.passos.length} passos (antes: ${existingPlan.passos?.length ?? 0})`,
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ plan: expanded })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/testes-gerais/plans/:id/generate-spec
 * Gera arquivo .spec.ts a partir do plano JSON.
 */
adminRouter.post('/testes-gerais/plans/:id/generate-spec', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode gerar specs', 403, 'FORBIDDEN')
    }

    const registryPath = resolve(process.cwd(), '..', '..', 'testes', 'test-plans-registry.json')
    if (!existsSync(registryPath)) {
      throw new AppError('Registry não encontrado', 404, 'NOT_FOUND')
    }

    const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      planos: Array<{ id: string; planoFile: string }>
    }
    const entry = registry.planos.find(p => p.id === req.params.id)
    if (!entry) {
      throw new AppError('Plano não encontrado no registry', 404, 'NOT_FOUND')
    }

    const planPath = resolve(process.cwd(), '..', '..', 'testes', entry.planoFile)
    const plan = JSON.parse(readFileSync(planPath, 'utf-8'))
    const specPath = generateAndSaveSpec(plan)

    res.json({ specPath })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/testes-gerais/plans/extract-testids
 * Extrai data-testid de um componente e gera mapeamento.
 */
const ExtractTestidsSchema = z.object({
  componenteFilePath: z.string().min(1),
  escopo:             z.string().min(1),
  sublocal:           z.string().min(1),
})

adminRouter.post('/testes-gerais/plans/extract-testids', async (req, res, next) => {
  try {
    const parsed = ExtractTestidsSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const mapping = generateTestidMapping(
      parsed.data.componenteFilePath,
      parsed.data.escopo,
      parsed.data.sublocal,
    )

    res.json({ mapping })
  } catch (err) {
    next(err)
  }
})

// ─── Test Logs — Gemini Re-analysis ─────────────────────────────────────────

/**
 * POST /api/admin/testes-gerais/logs/:id/reanalyze
 * Re-analisa uma falha com Gemini (forceRefresh: true, bypassa cache).
 * Requer SUPER_ADMIN.
 */
adminRouter.post('/testes-gerais/logs/:id/reanalyze', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode reanalizar', 403, 'FORBIDDEN')
    }

    const logEntry = findLogEntry(req.params.id)
    if (!logEntry) {
      throw new AppError('Log entry não encontrada', 404, 'NOT_FOUND')
    }
    if (logEntry.result === 'APROVADO') {
      throw new AppError('Não é possível reanalisar teste aprovado', 400, 'INVALID')
    }

    const analysis = await analyzeTestFailure({
      errorLog:        String(logEntry.error_log ?? ''),
      testName:        String(logEntry.test_name ?? ''),
      specFilePath:    `${String(logEntry.module ?? '')}/${String(logEntry.test_name ?? '')}`,
      specFileContent: readSpecFileContent(logEntry),
      componentFileContent: null,
      forceRefresh:    true,
    })

    updateLogEntryAnalysis(req.params.id, analysis)

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Testes',
      resource_id: req.params.id,
      action: 'TEST_LOG_REANALYZED',
      action_detail: `Re-análise Gemini — categoria=${analysis.categoria}, confiança=${analysis.confianca}`,
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ analysis })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/testes-gerais/logs/:id/apply-fix
 * Aplica o codigoDiff sugerido pelo Gemini no arquivo fonte.
 * Requer SUPER_ADMIN. Gemini é sugestor, humano valida antes de aplicar.
 */
adminRouter.post('/testes-gerais/logs/:id/apply-fix', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode aplicar correções', 403, 'FORBIDDEN')
    }

    const logEntry = findLogEntry(req.params.id)
    if (!logEntry) {
      throw new AppError('Log entry não encontrada', 404, 'NOT_FOUND')
    }

    const analysis = logEntry.ai_analysis as Record<string, unknown> | null
    if (!analysis?.codigoDiff) {
      throw new AppError('Nenhum diff disponível para aplicar', 400, 'NO_DIFF')
    }

    const diff = analysis.codigoDiff as {
      arquivo: string
      old: string
      new: string
    }

    const filePath = resolve(monorepoRoot, diff.arquivo)
    if (!existsSync(filePath)) {
      throw new AppError(`Arquivo não encontrado: ${diff.arquivo}`, 404, 'FILE_NOT_FOUND')
    }

    const content = readFileSync(filePath, 'utf-8')
    if (!content.includes(diff.old)) {
      throw new AppError('Código original não encontrado no arquivo — pode ter sido alterado', 409, 'CONFLICT')
    }

    const updated = content.replace(diff.old, diff.new)
    writeFileSync(filePath, updated, 'utf-8')

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Testes',
      resource_id: req.params.id,
      action: 'TEST_FIX_APPLIED',
      action_detail: `Diff aplicado em ${diff.arquivo}`,
      before: { old: diff.old.slice(0, 200) },
      after: { new: diff.new.slice(0, 200) },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ applied: true, arquivo: diff.arquivo })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/testes-gerais/logs/:id/reject
 * Marca a análise como ruim (feedback loop para melhorar o prompt).
 */
const RejectSchema = z.object({
  motivo: z.string().min(10).max(500),
})

adminRouter.post('/testes-gerais/logs/:id/reject', async (req, res, next) => {
  try {
    const parsed = RejectSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Motivo é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const logEntry = findLogEntry(req.params.id)
    if (!logEntry) {
      throw new AppError('Log entry não encontrada', 404, 'NOT_FOUND')
    }

    // Marca no log que a análise foi rejeitada
    updateLogEntryField(req.params.id, 'ai_rejected', {
      rejeitadoEm: new Date().toISOString(),
      rejeitadoPor: req.auth.userId,
      motivo: parsed.data.motivo,
    })

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Testes',
      resource_id: req.params.id,
      action: 'TEST_ANALYSIS_REJECTED',
      action_detail: `Análise rejeitada — ${parsed.data.motivo.slice(0, 100)}`,
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ rejected: true })
  } catch (err) {
    next(err)
  }
})

// ─── Helpers para manipular log entries em arquivos JSON ─────────────────────

function findLogEntry(id: string): Record<string, unknown> | null {
  const dir = join(process.cwd(), 'data', 'test-logs')
  if (!existsSync(dir)) return null

  const files = readdirSync(dir)
    .filter(f => f.endsWith('.json') && !f.startsWith('playwright-run-') && !f.startsWith('_'))
    .sort()
    .reverse()

  for (const file of files.slice(0, 14)) {
    try {
      const content = JSON.parse(readFileSync(join(dir, file), 'utf-8'))
      if (Array.isArray(content)) {
        const entry = content.find((e: Record<string, unknown>) => e.id === id)
        if (entry) return entry as Record<string, unknown>
      }
    } catch { /* skip */ }
  }
  return null
}

function updateLogEntryAnalysis(id: string, analysis: Record<string, unknown>): void {
  updateLogEntryField(id, 'ai_analysis', analysis)
}

function updateLogEntryField(id: string, field: string, value: unknown): void {
  const dir = join(process.cwd(), 'data', 'test-logs')
  if (!existsSync(dir)) return

  const files = readdirSync(dir)
    .filter(f => f.endsWith('.json') && !f.startsWith('playwright-run-') && !f.startsWith('_'))
    .sort()
    .reverse()

  for (const file of files.slice(0, 14)) {
    const filePath = join(dir, file)
    try {
      const content = JSON.parse(readFileSync(filePath, 'utf-8'))
      if (Array.isArray(content)) {
        const idx = content.findIndex((e: Record<string, unknown>) => e.id === id)
        if (idx >= 0) {
          content[idx][field] = value
          writeFileSync(filePath, JSON.stringify(content, null, 2))
          return
        }
      }
    } catch { /* skip */ }
  }
}

function readSpecFileContent(logEntry: Record<string, unknown>): string {
  const module = String(logEntry.module ?? '')
  const testName = String(logEntry.test_name ?? '')

  // Tenta localizar o spec no diretório de testes
  const possiblePaths = [
    resolve(monorepoRoot, 'testes', 'testes-e2e', module, `${testName}.spec.ts`),
    resolve(monorepoRoot, 'testes', 'testes-e2e', module.toLowerCase(), `${testName}.spec.ts`),
  ]

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return readFileSync(p, 'utf-8')
    }
  }
  return ''
}

// ─── Test Schedules (CRUD) ──────────────────────────────────────────────────

const CreateScheduleSchema = z.object({
  name:        z.string().min(1).max(200),
  cron:        z.string().min(1).max(100),
  planos:      z.array(z.string()).optional(),
  modulos:     z.array(z.string()).optional(),
  ambientes:   z.array(z.string()).optional(),
  ativo:       z.boolean().default(true),
  notificar:   z.boolean().default(true),
})

const UpdateScheduleSchema = CreateScheduleSchema.partial()

/**
 * GET /api/admin/testes-gerais/schedules
 * Lista todos os agendamentos de testes.
 */
adminRouter.get('/testes-gerais/schedules', async (_req, res, next) => {
  try {
    let schedules: unknown[] = []
    try {
      schedules = await (prisma as any).testSchedule?.findMany?.({
        orderBy: { created_at: 'desc' },
      }) ?? []
    } catch {
      // Tabela não existe — retorna vazio
    }
    res.json({ schedules })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/testes-gerais/schedules
 * Cria um novo agendamento de testes.
 */
adminRouter.post('/testes-gerais/schedules', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode criar agendamentos', 403, 'FORBIDDEN')
    }

    const parsed = CreateScheduleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    let schedule: unknown = null
    try {
      schedule = await (prisma as any).testSchedule?.create?.({
        data: {
          tenant_id: 'platform',
          name:      parsed.data.name,
          cron:      parsed.data.cron,
          config:    JSON.stringify({
            planos:    parsed.data.planos ?? [],
            modulos:   parsed.data.modulos ?? [],
            ambientes: parsed.data.ambientes ?? ['Local'],
            notificar: parsed.data.notificar,
          }),
          is_active: parsed.data.ativo,
        },
      })
    } catch {
      // Fallback: persiste em arquivo JSON
      const schedDir = join(process.cwd(), 'data', 'test-schedules')
      mkdirSync(schedDir, { recursive: true })
      const schedFile = join(schedDir, 'schedules.json')
      const existing: unknown[] = existsSync(schedFile)
        ? JSON.parse(readFileSync(schedFile, 'utf-8'))
        : []
      schedule = {
        id: `sched-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...parsed.data,
      }
      existing.push(schedule)
      writeFileSync(schedFile, JSON.stringify(existing, null, 2))
    }

    res.status(201).json({ schedule })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/admin/testes-gerais/schedules/:id
 * Atualiza um agendamento existente.
 */
adminRouter.patch('/testes-gerais/schedules/:id', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode editar agendamentos', 403, 'FORBIDDEN')
    }

    const parsed = UpdateScheduleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    let schedule: unknown = null
    try {
      const updateData: Record<string, unknown> = {}
      if (parsed.data.name !== undefined) updateData.name = parsed.data.name
      if (parsed.data.cron !== undefined) updateData.cron = parsed.data.cron
      if (parsed.data.ativo !== undefined) updateData.is_active = parsed.data.ativo
      if (parsed.data.planos || parsed.data.modulos || parsed.data.ambientes || parsed.data.notificar !== undefined) {
        updateData.config = JSON.stringify({
          planos:    parsed.data.planos,
          modulos:   parsed.data.modulos,
          ambientes: parsed.data.ambientes,
          notificar: parsed.data.notificar,
        })
      }
      schedule = await (prisma as any).testSchedule?.update?.({
        where: { id: req.params.id },
        data: updateData,
      })
    } catch {
      throw new AppError('Schedule não encontrado ou tabela não existe', 404, 'NOT_FOUND')
    }

    res.json({ schedule })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/admin/testes-gerais/schedules/:id
 * Remove um agendamento.
 */
adminRouter.delete('/testes-gerais/schedules/:id', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode remover agendamentos', 403, 'FORBIDDEN')
    }

    try {
      await (prisma as any).testSchedule?.delete?.({
        where: { id: req.params.id },
      })
    } catch {
      throw new AppError('Schedule não encontrado', 404, 'NOT_FOUND')
    }

    res.json({ deleted: true, id: req.params.id })
  } catch (err) {
    next(err)
  }
})

// ─── Gemini Metrics ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/testes-gerais/gemini-metrics
 * Agrega métricas de custo, latência, confiança do Gemini analyzer.
 */
adminRouter.get('/testes-gerais/gemini-metrics', async (_req, res, next) => {
  try {
    const cacheMetrics = getGeminiMetrics()

    // Lê métricas dos arquivos diários
    const metricsDir = resolve(process.cwd(), 'data', 'test-logs', '_metrics')
    const dailyMetrics: Record<string, unknown>[] = []

    if (existsSync(metricsDir)) {
      const files = readdirSync(metricsDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, 30) // últimos 30 dias

      for (const file of files) {
        try {
          const entries = JSON.parse(readFileSync(join(metricsDir, file), 'utf-8')) as Array<Record<string, unknown>>
          const date = file.replace('.json', '')

          let totalTokens = 0
          let totalDuration = 0
          let countAlta = 0
          let countMedia = 0
          let countBaixa = 0
          let countDiffs = 0
          let countFallback = 0

          for (const e of entries) {
            totalTokens += (Number(e.tokensInput) || 0) + (Number(e.tokensOutput) || 0)
            totalDuration += Number(e.duracaoMs) || 0
            if (e.confianca === 'alta') countAlta++
            if (e.confianca === 'media') countMedia++
            if (e.confianca === 'baixa') countBaixa++
            if (e.validouDiff) countDiffs++
            if (e.cacheHit) countFallback++
          }

          // Custo estimado: ~$0.075 per 1M input tokens (Flash)
          const custoEstimado = (totalTokens / 1_000_000) * 0.075

          dailyMetrics.push({
            date,
            totalAnalises: entries.length,
            totalTokens,
            custoEstimadoUSD: Math.round(custoEstimado * 10000) / 10000,
            latenciaMediaMs: entries.length > 0 ? Math.round(totalDuration / entries.length) : 0,
            confianca: { alta: countAlta, media: countMedia, baixa: countBaixa },
            diffsValidados: countDiffs,
          })
        } catch { /* skip invalid */ }
      }
    }

    res.json({
      cache: cacheMetrics,
      daily: dailyMetrics,
    })
  } catch (err) {
    next(err)
  }
})

// ─── Pentest ────────────────────────────────────────────────────────────────

const RunPentestSchema = z.object({
  targetUrl: z.string().url(),
  scanType:  z.enum(['baseline', 'full', 'api']).default('baseline'),
})

/**
 * POST /api/admin/testes-gerais/pentest
 * Dispara container ZAP contra URL alvo.
 * Requer SUPER_ADMIN.
 */
adminRouter.post('/testes-gerais/pentest', async (req, res, next) => {
  try {
    if (req.auth.role !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode disparar pentest', 403, 'FORBIDDEN')
    }

    const parsed = RunPentestSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { targetUrl, scanType } = parsed.data
    const reportDir = join(process.cwd(), 'data', 'pentest-reports')
    mkdirSync(reportDir, { recursive: true })
    const reportFile = join(reportDir, `zap-${Date.now()}.json`)

    // Mapa de scan type → script ZAP
    const zapScripts: Record<string, string> = {
      baseline: 'zap-baseline.py',
      full:     'zap-full-scan.py',
      api:      'zap-api-scan.py',
    }

    const zapProcess = spawn(
      'docker',
      [
        'run', '--rm',
        '-v', `${reportDir}:/zap/wrk:rw`,
        'ghcr.io/zaproxy/zaproxy:stable',
        zapScripts[scanType],
        '-t', targetUrl,
        '-J', `zap-${Date.now()}.json`,
      ],
      {
        shell: true,
        windowsHide: true,
        timeout: 30 * 60 * 1000, // 30 min max
      },
    )

    let zapStdout = ''
    let zapStderr = ''
    zapProcess.stdout?.on('data', (chunk: Buffer) => { zapStdout += chunk.toString() })
    zapProcess.stderr?.on('data', (chunk: Buffer) => { zapStderr += chunk.toString() })

    zapProcess.on('close', (code) => {
      AuditService.log({
        tenant_id: req.auth.tenantId,
        actor_type: 'USER',
        actor_id: req.auth.userId,
        actor_name: req.auth.userId,
        actor_ip: req.ip,
        module: 'admin',
        resource_type: 'Pentest',
        action: 'PENTEST_COMPLETED',
        action_detail: `ZAP ${scanType} scan em ${targetUrl} — exit code ${code}`,
        after: { targetUrl, scanType, exitCode: code, reportFile },
        status: code === 0 ? 'SUCCESS' : 'PARTIAL',
      }).catch(() => { /* fire-and-forget */ })
    })

    res.json({ started: true, scanType, targetUrl })
  } catch (err) {
    next(err)
  }
})
