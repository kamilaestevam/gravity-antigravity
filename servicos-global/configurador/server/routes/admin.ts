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
// POST  /api/admin/test-logs     — registrar resultados de um run de testes
// GET   /api/admin/platform-config — dados da plataforma (Visão Geral Admin)
// PUT   /api/admin/platform-config — atualizar dados da plataforma

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
// e o /admin/billing/invoices pode ser usado para enumerar tenants via
// customer_id. O preset admin (60 req/min por tenant:IP) evita flood.
adminRouter.use('/billing', rateLimitPresets.admin())

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
            take: 5,
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

    // Impede que admin suspenda/cancele o próprio tenant HQ
    if (req.params.id === req.auth.tenantId) {
      throw new AppError('Não é possível alterar o status do próprio tenant HQ', 403, 'FORBIDDEN')
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

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'Tenant',
      resource_id: tenant.id,
      action: 'TENANT_STATUS_CHANGED',
      action_detail: `Status alterado de ${existing.status} para ${tenant.status}`,
      before: { status: existing.status },
      after: { status: tenant.status },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

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
const ListUsersQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(500).default(100),
  search: z.string().max(255).optional(),
})

adminRouter.get('/users', async (req, res, next) => {
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
      prisma.user.count({ where }),
    ])

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'User',
      action: 'USERS_GLOBAL_LIST_VIEWED',
      action_detail: `Listagem global — ${total} usuários (page=${page}, limit=${limit}${search ? `, search="${search}"` : ''})`,
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

    res.json({
      users,
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
 * GET /api/admin/billing/invoices
 * Lista invoices via BillingProvider (Stripe por padrão).
 */
adminRouter.get('/billing/invoices', async (req, res, next) => {
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
 * GET /api/admin/billing/invoices/:id
 */
adminRouter.get('/billing/invoices/:id', async (req, res, next) => {
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
 * POST /api/admin/billing/invoices
 * Cria uma fatura manual via provider (Stripe).
 */
adminRouter.post('/billing/invoices', async (req, res, next) => {
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
 * POST /api/admin/billing/invoices/:id/void
 * Anula uma fatura. Stripe: void_invoice. Manual: soft-delete.
 */
adminRouter.post('/billing/invoices/:id/void', async (req, res, next) => {
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
 * POST /api/admin/billing/invoices/:id/send
 * Envia a fatura ao cliente (email).
 */
adminRouter.post('/billing/invoices/:id/send', async (req, res, next) => {
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

const DeployEnvironmentEnum = z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'ALL'])
const DeployStatusEnum = z.enum(['SUCCESS', 'FAILED', 'ROLLBACK', 'IN_PROGRESS'])

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
  environment: DeployEnvironmentEnum.default('PRODUCTION'),
  status: DeployStatusEnum.default('SUCCESS'),
  deployed_at: z.string().datetime().optional(),
})

/**
 * GET /api/admin/deploys
 * Lista histórico de deploys com paginação + filtros.
 */
adminRouter.get('/deploys', async (req, res, next) => {
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
 * POST /api/admin/deploys
 * Registra um deploy manualmente. deployed_by vem do req.auth (snapshot do admin).
 */
adminRouter.post('/deploys', async (req, res, next) => {
  try {
    const parsed = CreateDeployBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body inválido', 400, 'VALIDATION_ERROR')
    }

    // Resolve nome do admin a partir do banco
    const user = await prisma.user.findUnique({
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
 * DELETE /api/admin/deploys/:id
 * Remove um registro de deploy (audit mantido via logEvent do frontend).
 */
adminRouter.delete('/deploys/:id', async (req, res, next) => {
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
 * GET /api/admin/test-plans
 * Lista os planos de teste disponíveis, opcionalmente filtrados por produto.
 * Query: ?product=configurador
 */
adminRouter.get('/test-plans', (_req, res, next) => {
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
 * GET /api/admin/test-logs
 * Lista logs de testes — lê da tabela TestLog se existir;
 * fallback: lê todos os arquivos JSON em data/test-logs/
 */
adminRouter.get('/test-logs', async (_req, res, next) => {
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
 * que são expostos via GET /admin/test-logs.
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
 * POST /api/admin/run-tests
 * Dispara os testes Playwright em background e persiste os resultados.
 * Retorna imediatamente com { started: true }.
 * Requer SUPER_ADMIN: dispara spawn pesado com acesso ao monorepo.
 */
const RunTestsSchema = z.object({
  modulos: z.array(z.string().max(100)).optional(),
  planos:  z.array(z.string().max(100)).optional(),
})

adminRouter.post('/run-tests', async (req, res, next) => {
  try {
    // Só SUPER_ADMIN pode disparar run — é operação destrutiva que spawn
    // Playwright consumindo CPU/memória por até 15 min, faz CRUD de verdade
    // nos bancos de teste e pode disparar webhooks externos. ADMIN (CFO,
    // suporte, etc) não precisa desse poder. Mesmo padrão do endpoint
    // POST /admin/users/:userId/promote.
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

      console.log(`[admin/run-tests] Run concluído — ${entries.length} entradas salvas`)
    })

  } catch (err) {
    pwRunning = false
    next(err)
  }
})

/**
 * GET /api/admin/run-tests/status
 * Verifica se há um run em andamento.
 */
adminRouter.get('/run-tests/status', (_req, res) => {
  res.json({ running: pwRunning })
})

/**
 * POST /api/admin/test-logs
 * Registra resultados de um run de testes (Playwright, Vitest, etc.)
 * Tenta salvar no banco; se TestLog não existir, salva em arquivo JSON local.
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

adminRouter.post('/test-logs', async (req, res, next) => {
  try {
    const parse = TestLogBatchSchema.safeParse(req.body)
    if (!parse.success) {
      throw new AppError(parse.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR')
    }

    const { entries } = parse.data
    const created_at = new Date().toISOString()
    let salvouNoBanco = false

    // Tenta salvar no banco (requer migração futura com modelo TestLog)
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
      select: { id: true, email: true, role: true, clerk_user_id: true, tenant_id: true },
    })
    if (!user || user.tenant_id !== req.auth.tenantId) {
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

    securityAudit.roleChanged(req.auth.tenantId, req.auth.userId, {
      targetUserId: req.params.userId,
      oldRole: user.role,
      newRole: updated.role,
    }).catch(() => { /* fire-and-forget */ })

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

    // Verifica se já existe usuário com esse e-mail no tenant HQ
    const existing = await prisma.user.findFirst({ where: { email, tenant_id: req.auth.tenantId } })
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

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      actor_ip: req.ip,
      module: 'admin',
      resource_type: 'User',
      resource_id: user.id,
      action: 'USER_INVITED',
      action_detail: `Convite enviado — role=${role}`,
      after: { email: user.email, role: user.role },
      status: 'SUCCESS',
    }).catch(() => { /* fire-and-forget */ })

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

    const before = await prisma.tenant.findUnique({
      where: { id: user.tenant_id },
      select: { name: true, cnpj: true, state: true, city: true, segment: true, tipo_empresa: true },
    })

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
