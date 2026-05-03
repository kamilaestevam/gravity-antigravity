// server/routes/admin.ts
// Rotas exclusivas para gravity_admin — gestão de todas as organizações da plataforma
// Montado em /api/v1/admin pelo index.ts
// GET   /api/v1/admin/organizacoes                     — listar todas as organizações
// GET   /api/v1/admin/organizacoes/:id_organizacao     — detalhes de uma organização
// PATCH /api/v1/admin/organizacoes/:id_organizacao     — atualizar status
// GET   /api/v1/admin/estatisticas-plataforma          — estatísticas globais da plataforma
// GET   /api/v1/admin/usuarios                         — listar todos os usuários
// GET   /api/v1/admin/financeiro-admin                 — listar faturas globais
// GET   /api/v1/admin/deploys                          — listar histórico de deploys
// GET   /api/v1/admin/analises-erro                    — listar análises de erro de testes
// POST  /api/v1/admin/analises-erro                    — registrar resultados de um run de testes
// GET   /api/v1/admin/painel-visao-geral               — dados da plataforma (Visão Geral Admin)
// PUT   /api/v1/admin/painel-visao-geral               — atualizar dados da plataforma

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
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'
import { auditMiddleware } from '../../../servicos-plataforma/historico-global/server/middleware/audit.js'
import { AcaoExecutadaPor } from '../../../servicos-plataforma/generated/index.js'
import { securityAudit } from '../../../servicos-plataforma/historico-global/server/lib/securityAuditLogger.js'
import { getBillingProvider } from '../lib/billing/index.js'
import { deployLogService } from '../services/deployLogService.js'
import { rateLimitPresets } from '../middleware/rateLimiter.js'

export const adminRouter = Router()

// Cadeia obrigatória: auth → gravity_admin check
adminRouter.use(requireAuth, requireGravityAdmin)

// Auditoria automática de TODAS as ações admin (fire-and-forget).
// Conforme skills `seguranca/seguranca-5-camadas` (camada 5) e `observabilidade-minima`.
// Body redatado por DEFAULT_SENSITIVE_FIELDS (password/token/secret/api_key/...).
// resourceTypeFromPath deriva o tipo de recurso a partir do path para melhor categorização.
adminRouter.use(auditMiddleware({
  modulo_historico_log: 'admin',
  tipo_recurso_historico_log: 'admin_action',
  acao_historico_log: 'ADMIN_ACTION',
  tipo_ator_historico_log: AcaoExecutadaPor.USUARIO,
  resourceTypeFromPath: (req) => {
    const path = req.path.split('/').filter(Boolean)[0] ?? 'admin_action'
    if (path === 'organizacoes') return 'Organizacao'
    if (path === 'workspaces') return 'Workspace'
    if (path === 'usuarios') return 'Usuario'
    if (path === 'financeiro-admin') return 'Fatura'
    if (path === 'registros-deploy' || path === 'deploys') return 'RegistroDeploy'
    if (path === 'painel-visao-geral') return 'PainelVisaoGeral'
    return path
  },
}))

// Rate limit extra-restritivo nas rotas de billing — operações financeiras
// (create/void/send) disparam calls ao provider externo que tem rate limit próprio,
// e o /financeiro-admin pode ser usado para enumerar organizações via customer_id.
// O preset admin (60 req/min por tenant:IP) evita flood.
adminRouter.use('/financeiro-admin', rateLimitPresets.admin())

const UpdateOrganizacaoSchema = z.object({
  status_organizacao: z.enum(['ATIVO', 'SUSPENSO', 'CANCELADO', 'CONFIGURACAO_PENDENTE']).optional(),
  nome_organizacao: z.string().min(2).max(200).optional(),
  subdominio_organizacao: z.string().min(2).max(100).regex(/^[a-z][a-z0-9-]*$/, 'Subdomínio inválido').optional(),
  note: z.string().optional(),
})

const CreateOrganizacaoSchema = z.object({
  nome_organizacao: z.string().min(2).max(200),
  subdominio_organizacao: z.string().min(2).max(100).regex(/^[a-z][a-z0-9-]*$/, 'Subdomínio inválido'),
  cnpj_organizacao: z.string().max(20).optional(),
})

const AtualizarWorkspaceAdminSchema = z.object({
  status_workspace: z.enum(['ATIVO', 'INATIVO']),
})

/**
 * GET /api/v1/admin/organizacoes
 * Lista todas as organizações da plataforma com paginação
 */
adminRouter.get('/organizacoes', async (req, res, next) => {
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

    // PARIDADE ABSOLUTA: retorna nomes Prisma como vêm do banco — sem tradução.
    const [organizacoes, total] = await Promise.all([
      prisma.organizacao.findMany({
        where,
        skip,
        take: limit,
        select: {
          id_organizacao: true,
          nome_organizacao: true,
          subdominio_organizacao: true,
          status_organizacao: true,
          data_criacao_organizacao: true,
          _count: { select: { users_organizacao: true, companies_organizacao: true } },
          companies_organizacao: {
            select: {
              id_workspace: true, nome_workspace: true, subdominio_workspace: true, status_workspace: true,
              _count: { select: { memberships: true } },
            },
            orderBy: { data_criacao_workspace: 'desc' },
            take: 5,
          },
        },
        orderBy: { data_criacao_organizacao: 'desc' },
      }),
      prisma.organizacao.count({ where }),
    ])

    // DTO normalizado: renomeia relations Prisma (em inglês — schema intocável,
    // Mand. 02) para DDD PT-BR no payload exposto à UI.
    const organizacoesDto = organizacoes.map(({ companies_organizacao, _count, ...rest }) => ({
      ...rest,
      _count: {
        usuarios: _count.users_organizacao,
        workspaces: _count.companies_organizacao,
      },
      workspaces: (companies_organizacao ?? []).map(({ _count: wcount, ...wrest }) => ({
        ...wrest,
        _count: { vinculos_workspace: wcount?.memberships ?? 0 },
      })),
    }))

    res.json({
      organizacoes: organizacoesDto,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/admin/organizacoes/:id_organizacao
 * Detalhes completos de uma organização específica
 */
adminRouter.get('/organizacoes/:id_organizacao', async (req, res, next) => {
  try {
    const idParsed = z.string().min(1).safeParse(req.params.id_organizacao)
    if (!idParsed.success) throw new AppError('ID inválido', 400, 'VALIDATION_ERROR')

    const tenant = await prisma.organizacao.findUnique({
      where: { id_organizacao: idParsed.data },
      include: {
        users_organizacao: {
          select: { id_usuario: true, nome_usuario: true, email_usuario: true, tipo_usuario: true, data_criacao_usuario: true },
          orderBy: { data_criacao_usuario: 'desc' as const },
          take: 50,
        },
        companies_organizacao: {
          select: { id_workspace: true, nome_workspace: true, subdominio_workspace: true, status_workspace: true },
          orderBy: { data_criacao_workspace: 'desc' as const },
          take: 50,
        },
        subscriptions_organizacao: {
          orderBy: { data_criacao_assinatura_produto_gravity: 'desc' as const },
          take: 1,
        },
        product_configs_organizacao: {
          select: {
            chave_produto_configuracao_produto_gravity: true,
            ativo_configuracao_produto_gravity: true,
            data_atualizacao_configuracao_produto_gravity: true,
          },
          take: 50,
        },
      },
    })

    if (!tenant) {
      throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
    }

    // PARIDADE ABSOLUTA: nomes Prisma direto. Renomeia apenas back-relations
    // `*_organizacao` para chaves DDD limpas (workspaces, usuarios, configuracoes_produto).
    const {
      users_organizacao,
      companies_organizacao,
      subscriptions_organizacao: _ignored,
      product_configs_organizacao,
      ...rest
    } = tenant
    res.json({
      organizacao: {
        ...rest,
        usuarios: users_organizacao,
        workspaces: companies_organizacao,
        configuracoes_produto: product_configs_organizacao,
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/admin/organizacoes/:id_organizacao
 * Atualiza status de uma organização (operação administrativa)
 */
adminRouter.patch('/organizacoes/:id_organizacao', async (req, res, next) => {
  try {
    const parsed = UpdateOrganizacaoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    // Impede que admin suspenda/cancele a própria organização HQ
    if (req.params.id_organizacao === req.auth.id_organizacao) {
      throw new AppError('Não é possível alterar o status da própria organização HQ', 403, 'FORBIDDEN')
    }

    const existing = await prisma.organizacao.findUnique({
      where: { id_organizacao: req.params.id_organizacao },
    })
    if (!existing) {
      throw new AppError('Organização não encontrada', 404, 'NOT_FOUND')
    }

    const tenant = await prisma.organizacao.update({
      where: { id_organizacao: req.params.id_organizacao },
      data: {
        ...(parsed.data.status_organizacao && { status_organizacao: parsed.data.status_organizacao }),
        ...(parsed.data.nome_organizacao && { nome_organizacao: parsed.data.nome_organizacao.trim() }),
        ...(parsed.data.subdominio_organizacao && { subdominio_organizacao: parsed.data.subdominio_organizacao }),
      },
      select: { id_organizacao: true, nome_organizacao: true, subdominio_organizacao: true, status_organizacao: true },
    })

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Organização',
      id_recurso_historico_log: tenant.id_organizacao,
      acao_historico_log: 'ORGANIZACAO_STATUS_ALTERADO',
      detalhe_acao_historico_log: `Status alterado de ${existing.status_organizacao} para ${tenant.status_organizacao}`,
      estado_anterior_historico_log: { status: existing.status_organizacao },
      estado_posterior_historico_log: { status: tenant.status_organizacao },
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    // PARIDADE ABSOLUTA
    res.json({ organizacao: tenant })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/organizacoes
 * Cria uma nova organização na plataforma
 */
adminRouter.post('/organizacoes', async (req, res, next) => {
  try {
    const parsed = CreateOrganizacaoSchema.safeParse(req.body)
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
        id_organizacao: true, nome_organizacao: true, subdominio_organizacao: true, status_organizacao: true, data_criacao_organizacao: true,
        _count: { select: { users_organizacao: true, companies_organizacao: true } },
      },
    })

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Organização',
      id_recurso_historico_log: tenant.id_organizacao,
      acao_historico_log: 'ORGANIZACAO_CRIADA',
      detalhe_acao_historico_log: `Organização "${tenant.nome_organizacao}" criada — slug: ${tenant.subdominio_organizacao}`,
      estado_posterior_historico_log: { nome_organizacao: tenant.nome_organizacao, subdominio_organizacao: tenant.subdominio_organizacao, status_organizacao: tenant.status_organizacao },
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    // PARIDADE ABSOLUTA: nomes Prisma direto. _count renomeado para chaves DDD.
    const { _count, ...rest } = tenant
    res.status(201).json({
      organizacao: {
        ...rest,
        _count: {
          usuarios: _count.users_organizacao,
          workspaces: _count.companies_organizacao,
        },
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/admin/workspaces/:id_workspace
 * Atualiza status de um workspace — operação administrativa
 */
adminRouter.patch('/workspaces/:id_workspace', async (req, res, next) => {
  try {
    const idParsed = z.string().min(1).safeParse(req.params.id_workspace)
    if (!idParsed.success) throw new AppError('ID inválido', 400, 'VALIDATION_ERROR')

    const parsed = AtualizarWorkspaceAdminSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const existing = await prisma.workspace.findUnique({ where: { id_workspace: idParsed.data } })
    if (!existing) throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')

    const workspace = await prisma.workspace.update({
      where: { id_workspace: idParsed.data },
      data: { status_workspace: parsed.data.status_workspace },
      select: { id_workspace: true, nome_workspace: true, status_workspace: true, id_organizacao: true },
    })

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Workspace',
      id_recurso_historico_log: workspace.id_workspace,
      acao_historico_log: 'WORKSPACE_STATUS_ALTERADO',
      detalhe_acao_historico_log: `Workspace "${workspace.nome_workspace}" — status alterado de ${existing.status_workspace} para ${workspace.status_workspace}`,
      estado_anterior_historico_log: { status_workspace: existing.status_workspace },
      estado_posterior_historico_log: { status_workspace: workspace.status_workspace },
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ workspace })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/admin/estatisticas-plataforma
 * Estatísticas globais da plataforma para o painel admin
 */
adminRouter.get('/estatisticas-plataforma', async (_req, res, next) => {
  try {
    const [
      totalOrganizacoes,
      ativasOrganizacoes,
      suspensasOrganizacoes,
      totalUsuarios,
    ] = await Promise.all([
      prisma.organizacao.count(),
      prisma.organizacao.count({ where: { status_organizacao: 'ATIVO' } }),
      prisma.organizacao.count({ where: { status_organizacao: 'SUSPENSO' } }),
      prisma.usuario.count(),
    ])

    // PARIDADE ABSOLUTA: chaves DDD em PT-BR.
    res.json({
      stats: {
        totalOrganizacoes,
        ativasOrganizacoes,
        suspensasOrganizacoes,
        totalUsuarios,
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/admin/usuarios
 * Lista todos os usuários de todos os tenants da plataforma (gravity_admin)
 */
const ListUsersQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(500).default(100),
  search: z.string().max(255).optional(),
})

adminRouter.get('/usuarios', async (req, res, next) => {
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
            { nome_usuario: { contains: search, mode: 'insensitive' as const } },
            { email_usuario: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        select: {
          id_usuario: true,
          nome_usuario: true,
          email_usuario: true,
          tipo_usuario: true,
          data_criacao_usuario: true,
          id_organizacao: true,
          tenant: {
            select: { nome_organizacao: true, subdominio_organizacao: true },
          },
          memberships: {
            where: { ativo_usuario_workspace: true },
            select: {
              id_usuario_workspace: true,
              id_workspace: true,
              tipo_usuario_workspace: true,
              ativo_usuario_workspace: true,
              company: {
                select: { nome_workspace: true, subdominio_workspace: true },
              },
            },
            orderBy: { data_criacao_usuario_workspace: 'desc' as const },
            take: 20,
          },
        },
        orderBy: { data_criacao_usuario: 'desc' },
      }),
      prisma.usuario.count({ where }),
    ])

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Usuario',
      acao_historico_log: 'USERS_GLOBAL_LIST_VIEWED',
      detalhe_acao_historico_log: `Listagem global — ${total} usuários (page=${page}, limit=${limit}${search ? `, search="${search}"` : ''})`,
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    // PARIDADE ABSOLUTA: nomes Prisma direto. Renomeia apenas relações back:
    // `tenant` (relação) → `organizacao`, `company` (relação) → `workspace`.
    const usuarios = users.map(({ memberships, tenant, ...rest }) => ({
      ...rest,
      organizacao: tenant,
      memberships: memberships.map(({ company, ...m }) => ({
        ...m,
        workspace: company,
      })),
    }))
    res.json({
      usuarios,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

// ─── Billing / Invoices ─────────────────────────────────────────────────────
// Delegadas ao BillingProvider configurado (server/lib/billing).
// Provider OFICIAL: 'conta_azul'. Skeletons: 'itau', 'santander'.
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
 * GET /api/v1/admin/financeiro-admin
 * Lista faturas via BillingProvider configurado.
 */
adminRouter.get('/financeiro-admin', async (req, res, next) => {
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
 * GET /api/v1/admin/financeiro-admin/:id_fatura
 */
adminRouter.get('/financeiro-admin/:id_fatura', async (req, res, next) => {
  try {
    const provider = getBillingProvider()
    const invoice = await provider.getInvoice(req.params.id_fatura)
    if (!invoice) {
      throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND')
    }
    res.json({ invoice })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/financeiro-admin
 * Cria uma fatura manual via BillingProvider configurado.
 */
adminRouter.post('/financeiro-admin', async (req, res, next) => {
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
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Invoice',
      id_recurso_historico_log: invoice.id,
      acao_historico_log: 'INVOICE_CREATED',
      detalhe_acao_historico_log: `Fatura ${invoice.number ?? invoice.id} criada para tenant ${parsed.data.customer_tenant_id} — ${invoice.amount_due_cents} ${invoice.currency}`,
      estado_posterior_historico_log: { customer_tenant_id: parsed.data.customer_tenant_id, amount_due_cents: invoice.amount_due_cents, currency: invoice.currency, auto_finalize: parsed.data.auto_finalize },
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.status(201).json({ invoice })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/financeiro-admin/:id_fatura/anular
 * Anula uma fatura. Conta Azul: cancelamento. Manual: soft-delete.
 */
adminRouter.post('/financeiro-admin/:id_fatura/anular', async (req, res, next) => {
  try {
    const parsed = VoidInvoiceBodySchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body inválido', 400, 'VALIDATION_ERROR')
    }

    const provider = getBillingProvider()
    const invoice = await provider.voidInvoice({ id: req.params.id_fatura, reason: parsed.data.reason })

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Invoice',
      id_recurso_historico_log: invoice.id,
      acao_historico_log: 'INVOICE_VOIDED',
      detalhe_acao_historico_log: `Fatura ${invoice.number ?? invoice.id} anulada${parsed.data.reason ? ` — motivo: ${parsed.data.reason}` : ''}`,
      estado_anterior_historico_log: { status: 'OPEN' },
      estado_posterior_historico_log: { status: 'VOID', reason: parsed.data.reason ?? null },
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ invoice })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/financeiro-admin/:id_fatura/enviar
 * Envia a fatura ao cliente (email).
 */
adminRouter.post('/financeiro-admin/:id_fatura/enviar', async (req, res, next) => {
  try {
    const provider = getBillingProvider()
    const invoice = await provider.sendInvoice(req.params.id_fatura)

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Invoice',
      id_recurso_historico_log: invoice.id,
      acao_historico_log: 'INVOICE_SENT',
      detalhe_acao_historico_log: `Fatura ${invoice.number ?? invoice.id} enviada para ${invoice.customer.email ?? invoice.customer.name}`,
      status_historico_log: 'SUCESSO',
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
 * GET /api/v1/admin/registros-deploy
 * Lista histórico de deploys com paginação + filtros.
 */
adminRouter.get('/registros-deploy', async (req, res, next) => {
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
 * POST /api/v1/admin/registros-deploy
 * Registra um deploy manualmente. deployed_by vem do req.auth (snapshot do admin).
 */
adminRouter.post('/registros-deploy', async (req, res, next) => {
  try {
    const parsed = CreateDeployBodySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body inválido', 400, 'VALIDATION_ERROR')
    }

    // Resolve nome do admin a partir do banco
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: req.auth.id_usuario },
      select: { id_usuario: true, nome_usuario: true, email_usuario: true },
    })
    const deployedBy = user?.nome_usuario ?? user?.email_usuario ?? req.auth.clerkUserId

    const deploy = await deployLogService.create({
      ...parsed.data,
      deployed_by: deployedBy,
      deployed_by_user_id: user?.id_usuario,
      deployed_at: parsed.data.deployed_at ? new Date(parsed.data.deployed_at) : undefined,
    })

    res.status(201).json({ deploy })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/admin/registros-deploy/:id_deploy
 * Remove um registro de deploy (audit mantido via logEvent do frontend).
 */
adminRouter.delete('/registros-deploy/:id_deploy', async (req, res, next) => {
  try {
    const existing = await deployLogService.getById(req.params.id_deploy)
    if (!existing) {
      throw new AppError('Deploy não encontrado', 404, 'NOT_FOUND')
    }
    await deployLogService.delete(req.params.id_deploy)
    res.json({ deleted: true, id: req.params.id_deploy })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/admin/planos-teste
 * Lista os planos de teste disponíveis, opcionalmente filtrados por escopo (TestePlano.escopo_plano_teste).
 * Query: ?escopo=ADMIN
 *
 * Fonte: testes/test-plans-registry.json (arquivo gerado automaticamente).
 * Formato esperado: { planos: TestePlano[] } onde cada TestePlano tem { id, escopo, ... }
 */
adminRouter.get('/planos-teste', (req, res, next) => {
  try {
    const registryPath = resolve(process.cwd(), '..', '..', 'testes', 'test-plans-registry.json')
    let planos: Array<{ id: string; escopo: string; tipo: string }> = []
    try {
      const raw = JSON.parse(readFileSync(registryPath, 'utf-8')) as { planos?: typeof planos }
      planos = Array.isArray(raw.planos) ? raw.planos : []
    } catch {
      // Registry ainda não existe — retorna vazio
    }

    const escopo = req.query.escopo as string | undefined
    if (escopo) {
      planos = planos.filter(p => p.escopo === escopo)
    }

    res.json({ planos })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/admin/testes
 * Lista testes (model Teste) — lê da tabela `teste` se existir;
 * fallback: lê todos os arquivos JSON em data/test-logs/
 */
adminRouter.get('/testes', async (_req, res, next) => {
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

    // 3. Ordena por created_at DESC (mais recentes primeiro), com id DESC como
    //    tiebreaker — IDs são da forma "${Date.now()}-${i}", então id DESC dentro
    //    do mesmo created_at coloca o último teste do batch no topo.
    //    Sem tiebreaker, todas as 300+ entradas de um run em lote ficavam na
    //    ordem alfabética do nome do teste (ordem de execução do Playwright).
    const logs = Array.from(byId.values()).sort((a, b) => {
      const ta = String(a.created_at ?? '')
      const tb = String(b.created_at ?? '')
      const cmp = tb.localeCompare(ta)
      if (cmp !== 0) return cmp
      const ida = String(a.id ?? '')
      const idb = String(b.id ?? '')
      return idb.localeCompare(ida, undefined, { numeric: true })
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
 * (CLERK_SECRET_KEY, DATABASE_URL, ENCRYPTION_KEY, INTERNAL_SERVICE_KEY).
 * Se um teste falhasse e logasse `process.env` no
 * stack trace, esses valores iam parar nos arquivos data/test-logs/*.json
 * que são expostos via GET /admin/testes.
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
    // Windows-specific (sem isso o cmd.exe não resolve npx.cmd e o spawn trava
    // até timeout sem produzir stdout/stderr — bug observado em 03/05/2026):
    'PATHEXT', 'COMSPEC', 'WINDIR', 'ProgramFiles', 'ProgramFiles(x86)', 'ProgramData',
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
 * POST /api/v1/admin/testes/disparar
 * Dispara os testes Playwright em background e persiste os resultados.
 * Retorna imediatamente com { started: true }.
 * Requer SUPER_ADMIN: dispara spawn pesado com acesso ao monorepo.
 */
const RunTestsSchema = z.object({
  modulos: z.array(z.string().max(100)).optional(),
  planos:  z.array(z.string().max(100)).optional(),
})

adminRouter.post('/testes/disparar', async (req, res, next) => {
  try {
    // Só SUPER_ADMIN pode disparar run — é operação destrutiva que spawn
    // Playwright consumindo CPU/memória por até 15 min, faz CRUD de verdade
    // nos bancos de teste e pode disparar webhooks externos. ADMIN (CFO,
    // suporte, etc) não precisa desse poder. Mesmo padrão do endpoint
    // POST /admin/usuarios/:id_usuario/promover.
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
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
    const planosSemSpec: string[] = []
    /** Projects do Playwright derivados do path dos specs selecionados. */
    const projectsDerivados = new Set<string>()

    if (Array.isArray(planos) && planos.length > 0) {
      // Modo por plano: resolve spec files do registry.
      // Path correto: testes/test-plans-registry.json (NÃO testes/testes-e2e/...).
      // Formato: { planos: [{ id, specFile, ... }] } — não array direto.
      const registryPath2 = resolve(monorepoRoot, 'testes', 'test-plans-registry.json')
      let registryPlanos: Array<{ id: string; specFile?: string }> = []
      try {
        const raw = JSON.parse(readFileSync(registryPath2, 'utf-8')) as { planos?: typeof registryPlanos }
        registryPlanos = Array.isArray(raw.planos) ? raw.planos : []
      } catch (err) {
        throw new AppError(
          `Registry não encontrado em ${registryPath2}: ${err instanceof Error ? err.message : 'erro desconhecido'}`,
          500,
          'REGISTRY_READ_ERROR',
        )
      }

      // Para cada plano selecionado, resolve o specFile e verifica que o arquivo existe.
      // Mandamento 08: erro alto, sem fallback silencioso.
      for (const planId of planos) {
        const entry = registryPlanos.find(p => p.id === planId)
        if (!entry) {
          planosSemSpec.push(`${planId} (não consta no registry)`)
          continue
        }
        if (!entry.specFile) {
          planosSemSpec.push(`${planId} (sem campo specFile no registry)`)
          continue
        }
        const specPath = resolve(monorepoRoot, entry.specFile)
        if (!existsSync(specPath)) {
          planosSemSpec.push(`${planId} (specFile ${entry.specFile} não existe — gerar via POST /admin/planos-teste/${planId}/gerar-spec)`)
          continue
        }
        specArgs.push(entry.specFile)

        // Deriva o --project do Playwright a partir do path:
        //   testes/testes-e2e/{projeto}/...  ->  --project={projeto}
        // Sem --project, Playwright tenta rodar o spec contra TODOS os 16
        // projects da config, marca todos como `skipped` silenciosamente, e a
        // tabela de Histórico não recebe entradas. Causa raiz do bug 03/05/2026.
        const matchProjeto = entry.specFile.match(/^testes\/testes-e2e\/([^/]+)\//)
        if (matchProjeto) {
          projectsDerivados.add(matchProjeto[1])
        }
      }

      // Adiciona --project para cada projeto distinto detectado nos specs.
      if (projectsDerivados.size > 0) {
        projectArgs = Array.from(projectsDerivados).flatMap(p => ['--project', p])
      }

      if (planosSemSpec.length > 0 && specArgs.length === 0) {
        // Nenhum plano selecionado tem spec executável. Bloqueia o run com erro
        // explícito — antes engolíamos o erro e Playwright rodava todos os specs.
        throw new AppError(
          `Nenhum plano selecionado tem spec executável:\n  • ${planosSemSpec.join('\n  • ')}`,
          400,
          'NO_SPEC_FILES',
        )
      }
    } else if (Array.isArray(modulos) && modulos.length > 0) {
      projectArgs = modulos.flatMap((m: string) => ['--project', m])
    }

    // Audit trail: início do run — quem disparou, com quais planos/módulos
    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'TestRun',
      acao_historico_log: 'RUN_TESTS_STARTED',
      detalhe_acao_historico_log: `Run iniciado — ${planos?.length ?? 0} plano(s), ${modulos?.length ?? 0} módulo(s)`,
      estado_posterior_historico_log: { planos: planos ?? [], modulos: modulos ?? [], specArgs, projectArgs },
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    pwRunning = true
    res.json({ started: true })

    // ── Roda Playwright em background (não bloqueia o response) ──────────────
    const dir = join(process.cwd(), 'data', 'test-logs')
    mkdirSync(dir, { recursive: true })

    // DEBUG: arquivo de diagnóstico — captura TUDO do spawn em tempo real.
    // Usado para diagnosticar por que entries não estão sendo gravadas.
    const debugPath = join(dir, '_debug-spawn.log')
    const debugLog = (msg: string) => {
      try {
        const line = `[${new Date().toISOString()}] ${msg}\n`
        writeFileSync(debugPath, line, { flag: 'a' })
      } catch { /* ignora */ }
    }
    debugLog('=== NEW RUN ===')
    debugLog(`cwd=${monorepoRoot}`)
    debugLog(`cmd=npx playwright test ${specArgs.join(' ')} ${projectArgs.join(' ')} --reporter=json`)
    debugLog(`specArgs=${JSON.stringify(specArgs)}`)
    debugLog(`projectArgs=${JSON.stringify(projectArgs)}`)
    debugLog(`planosSemSpec=${JSON.stringify(planosSemSpec)}`)

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

    debugLog(`spawn pid=${proc.pid}`)

    let pwStdout = ''
    let pwStderr = ''
    proc.stdout?.on('data', (chunk: Buffer) => {
      const s = chunk.toString()
      pwStdout += s
      debugLog(`STDOUT (${s.length} bytes): ${s.slice(0, 200).replace(/\n/g, '\\n')}`)
    })
    proc.stderr?.on('data', (chunk: Buffer) => {
      const s = chunk.toString()
      pwStderr += s
      debugLog(`STDERR (${s.length} bytes): ${s.slice(0, 200).replace(/\n/g, '\\n')}`)
    })

    proc.on('error', (err) => {
      debugLog(`PROC ERROR: ${err.message}`)
    })
    proc.on('exit', (code, signal) => {
      debugLog(`PROC EXIT code=${code} signal=${signal}`)
    })

    proc.on('close', () => {
      debugLog(`PROC CLOSE — pwStdout.length=${pwStdout.length}, pwStderr.length=${pwStderr.length}`)
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
      try {
        writeFileSync(filePath, JSON.stringify([...existing, ...novosLogs], null, 2))
        debugLog(`WROTE ${novosLogs.length} entries to ${filePath}`)
      } catch (writeErr) {
        debugLog(`WRITE FAILED: ${writeErr instanceof Error ? writeErr.message : String(writeErr)}`)
      }

      // Audit trail: fim do run — quantos passaram/falharam
      const aprovados = entries.filter(e => e.result === 'APROVADO').length
      const reprovados = entries.filter(e => e.result === 'REPROVADO').length
      const erros = entries.filter(e => e.result === 'ERRO').length
      AuditService.log({
        id_organizacao: req.auth.id_organizacao,
        tipo_ator_historico_log: 'USUARIO',
        id_ator_historico_log: req.auth.id_usuario,
        nome_ator_historico_log: req.auth.id_usuario,
        ip_ator_historico_log: req.ip,
        modulo_historico_log: 'admin',
        tipo_recurso_historico_log: 'TestRun',
        acao_historico_log: 'RUN_TESTS_COMPLETED',
        detalhe_acao_historico_log: `Run concluído — ${entries.length} testes (${aprovados} aprovados, ${reprovados} reprovados, ${erros} erros)`,
        estado_posterior_historico_log: { total: entries.length, aprovados, reprovados, erros },
        status_historico_log: reprovados + erros > 0 ? 'PARCIAL' : 'SUCESSO',
      }).catch(() => { /* fire-and-forget */ })

      console.log(`[admin/testes/disparar] Run concluído — ${entries.length} entradas salvas`)
    })

  } catch (err) {
    pwRunning = false
    next(err)
  }
})

/**
 * GET /api/v1/admin/testes/status
 * Verifica se há um run em andamento.
 */
adminRouter.get('/testes/status', (_req, res) => {
  res.json({ running: pwRunning })
})

/**
 * POST /api/v1/admin/testes
 * Registra resultados de um run de testes (Playwright, Vitest, etc.)
 * Tenta salvar no model Teste; se tabela `teste` não existir, salva em arquivo JSON local.
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

adminRouter.post('/testes', async (req, res, next) => {
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
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'TestLogBatch',
      acao_historico_log: 'TEST_LOGS_INGESTED',
      detalhe_acao_historico_log: `${entries.length} test-logs ingeridos (${aprovados} aprovados, ${reprovados} reprovados, ${erros} erros)`,
      estado_posterior_historico_log: { total: entries.length, aprovados, reprovados, erros, persistedInDb: salvouNoBanco },
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.status(201).json({ ok: true, saved: entries.length, banco: salvouNoBanco })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/admin/visao-geral
 * Dados da plataforma para a Visão Geral Admin (tenant HQ do gravity_admin)
 */
adminRouter.get('/visao-geral', async (req, res, next) => {
  try {
    // req.auth.id_organizacao é garantido pelo requireAuth — query redundante removida (REGRA 04)
    if (!req.auth?.id_organizacao) {
      throw new AppError('Sessão inválida', 401, 'UNAUTHORIZED')
    }

    // Query única — campos core + opcionais + assinatura mais recente
    const tenant = await prisma.organizacao.findUnique({
      where: { id_organizacao: req.auth.id_organizacao },
      select: {
        id_organizacao: true,
        nome_organizacao: true,
        subdominio_organizacao: true,
        cnpj_organizacao: true,
        estado_organizacao: true,
        cidade_organizacao: true,
        segmento_organizacao: true,
        tipo_organizacao: true,
        data_criacao_organizacao: true,
        subscriptions_organizacao: {
          take: 1,
          orderBy: { data_criacao_assinatura_produto_gravity: 'desc' },
          select: { status_assinatura_produto_gravity: true },
        },
      },
    })

    if (!tenant) {
      throw new AppError('Configuração de plataforma não encontrada', 404, 'NOT_FOUND')
    }

    // Auditoria fire-and-forget — leitura de config de plataforma (REGRA 08 — sem silêncio)
    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'PlatformConfig',
      id_recurso_historico_log: tenant.id_organizacao,
      acao_historico_log: 'PLATFORM_CONFIG_VIEWED',
      detalhe_acao_historico_log: 'Visão Geral Admin consultada',
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    // DTO: id_organizacao → id, subscriptions_organizacao → subscriptions
    const { id_organizacao, subscriptions_organizacao, ...tenantRest } = tenant
    res.json({
      config: {
        id: id_organizacao,
        ...tenantRest,
        subscriptions: subscriptions_organizacao.map((s) => ({
          status: s.status_assinatura_produto_gravity,
        })),
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/v1/admin/visao-geral
 * Atualiza dados cadastrais da plataforma (tenant HQ)
 */
const PlatformConfigSchema = z.object({
  nome_organizacao: z.string().min(1).max(200).optional(),
  cnpj_organizacao: z.string().max(20).optional(),
  estado_organizacao: z.string().max(2).optional(),
  cidade_organizacao: z.string().max(200).optional(),
  segmento_organizacao: z.string().max(200).optional(),
  tipo_organizacao: z.string().max(500).optional(),
})

/**
 * POST /api/v1/admin/usuarios/:id_usuario/promover
 * Promove um usuário para SUPER_ADMIN ou ADMIN.
 * Apenas SUPER_ADMIN pode chamar este endpoint.
 */
const PromoteSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN']),
})

adminRouter.post('/usuarios/:id_usuario/promover', async (req, res, next) => {
  try {
    // Apenas SUPER_ADMIN pode promover — ADMIN tem acesso ao painel mas não pode promover
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
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
    if (req.params.id_usuario === req.auth.id_usuario) {
      throw new AppError('Não é possível alterar o próprio role', 400, 'INVALID_OPERATION')
    }

    const user = await prisma.usuario.findUnique({
      where: { id_usuario: req.params.id_usuario },
      select: { id_usuario: true, email_usuario: true, tipo_usuario: true, id_clerk_usuario: true, id_organizacao: true },
    })
    if (!user || user.id_organizacao !== req.auth.id_organizacao) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const updated = await prisma.usuario.update({
      where: { id_usuario: req.params.id_usuario },
      data: { tipo_usuario: parsed.data.role },
      select: { id_usuario: true, email_usuario: true, tipo_usuario: true },
    })

    securityAudit.roleChanged(req.auth.id_organizacao, req.auth.id_usuario, {
      targetUserId: req.params.id_usuario,
      oldRole: user.tipo_usuario,
      newRole: updated.tipo_usuario,
    }).catch(() => { /* fire-and-forget */ })

    // DTO DDD: Prisma `email_usuario` → `email`, `id_usuario` → `id`
    const { email_usuario, id_usuario, ...updRest } = updated
    res.json({ user: { ...updRest, id: id_usuario, email: email_usuario } })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/usuarios/convidar
 * Convida um usuário com role de plataforma (SUPER_ADMIN, ADMIN, MASTER, STANDARD, SUPPLIER).
 * Apenas SUPER_ADMIN pode convidar SUPER_ADMIN ou ADMIN.
 * ADMIN pode convidar MASTER, STANDARD e SUPPLIER.
 */
const AdminInviteSchema = z.object({
  email: z.string().email().max(255),
  name:  z.string().min(1).max(200),
  role:  z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR']),
})

adminRouter.post('/usuarios/convidar', async (req, res, next) => {
  try {
    const parsed = AdminInviteSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { email, name, role } = parsed.data

    // ADMIN não pode criar SUPER_ADMIN ou outro ADMIN
    if (req.auth.tipo_usuario === 'ADMIN' && (role === 'SUPER_ADMIN' || role === 'ADMIN')) {
      throw new AppError('ADMIN não pode convidar usuários com role SUPER_ADMIN ou ADMIN', 403, 'FORBIDDEN')
    }

    // Verifica se já existe usuário com esse e-mail no tenant HQ
    const existing = await prisma.usuario.findFirst({ where: { email_usuario: email, id_organizacao: req.auth.id_organizacao } })
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
        id_organizacao: req.auth.id_organizacao,
        id_clerk_usuario: `pending_${invitation.id}`,
        email_usuario: email,
        nome_usuario:  name,
        tipo_usuario:  role,
      },
    })

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Usuario',
      id_recurso_historico_log: user.id_usuario,
      acao_historico_log: 'USER_INVITED',
      detalhe_acao_historico_log: `Convite enviado — role=${role}`,
      estado_posterior_historico_log: { email: user.email_usuario, role: user.tipo_usuario },
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.status(201).json({
      message: 'Convite enviado com sucesso',
      user: { id: user.id_usuario, email: user.email_usuario, tipo_usuario: user.tipo_usuario },
    })
  } catch (err) {
    next(err)
  }
})

adminRouter.put('/visao-geral', async (req, res, next) => {
  try {
    // Apenas SUPER_ADMIN pode alterar config de plataforma — ADMIN só visualiza
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Somente Super Admin pode alterar a configuração da plataforma', 403, 'FORBIDDEN')
    }

    const parsed = PlatformConfigSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    // req.auth.id_organizacao é garantido pelo requireAuth — query redundante removida (REGRA 04)
    const before = await prisma.organizacao.findUnique({
      where: { id_organizacao: req.auth.id_organizacao },
      select: { nome_organizacao: true, cnpj_organizacao: true, estado_organizacao: true, cidade_organizacao: true, segmento_organizacao: true, tipo_organizacao: true },
    })

    const tenant = await prisma.organizacao.update({
      where: { id_organizacao: req.auth.id_organizacao },
      data: parsed.data,
      select: {
        id_organizacao: true,
        nome_organizacao: true,
        subdominio_organizacao: true,
        cnpj_organizacao: true,
        estado_organizacao: true,
        cidade_organizacao: true,
        segmento_organizacao: true,
        tipo_organizacao: true,
        data_criacao_organizacao: true,
      },
    })

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'PlatformConfig',
      id_recurso_historico_log: tenant.id_organizacao,
      acao_historico_log: 'PLATFORM_CONFIG_UPDATED',
      detalhe_acao_historico_log: `Campos alterados: ${Object.keys(parsed.data).join(', ')}`,
      estado_anterior_historico_log: before ?? undefined,
      estado_posterior_historico_log: parsed.data,
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    // DTO: id_organizacao → id legado do contrato
    const { id_organizacao, ...tenantRest } = tenant
    res.json({ config: { id: id_organizacao, ...tenantRest } })
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
 * POST /api/v1/admin/planos-teste/gerar
 * Gera um plano de teste 20/20 para uma tela via Gemini.
 * Requer SUPER_ADMIN.
 */
adminRouter.post('/planos-teste/gerar', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode gerar planos', 403, 'FORBIDDEN')
    }

    const parsed = GeneratePlanSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const plan = await generateTestPlan(parsed.data)

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'TestPlan',
      id_recurso_historico_log: plan.id,
      acao_historico_log: 'TEST_PLAN_GENERATED',
      detalhe_acao_historico_log: `Plano ${plan.id} gerado — ${plan.passos.length} passos, cobertura ${plan.coberturaPercentual}%`,
      estado_posterior_historico_log: { id: plan.id, passos: plan.passos.length, cobertura: plan.coberturaPercentual },
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.status(201).json({ plan })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/planos-teste/:id_plano_teste/expandir
 * Expande um plano existente preservando passos humano-original.
 * Requer SUPER_ADMIN.
 */
const ExpandPlanSchema = z.object({
  componenteFilePath: z.string().min(1),
})

adminRouter.post('/planos-teste/:id_plano_teste/expandir', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
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
    const entry = registry.planos.find(p => p.id === req.params.id_plano_teste)
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
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'TestPlan',
      id_recurso_historico_log: expanded.id,
      acao_historico_log: 'TEST_PLAN_EXPANDED',
      detalhe_acao_historico_log: `Plano ${expanded.id} expandido — ${expanded.passos.length} passos (antes: ${existingPlan.passos?.length ?? 0})`,
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ plan: expanded })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/planos-teste/:id_plano_teste/gerar-spec
 * Gera arquivo .spec.ts a partir do plano JSON.
 */
adminRouter.post('/planos-teste/:id_plano_teste/gerar-spec', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode gerar specs', 403, 'FORBIDDEN')
    }

    const registryPath = resolve(process.cwd(), '..', '..', 'testes', 'test-plans-registry.json')
    if (!existsSync(registryPath)) {
      throw new AppError('Registry não encontrado', 404, 'NOT_FOUND')
    }

    const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      planos: Array<{ id: string; planoFile: string }>
    }
    const entry = registry.planos.find(p => p.id === req.params.id_plano_teste)
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
 * POST /api/v1/admin/planos-teste/extrair-testids
 * Extrai data-testid de um componente e gera mapeamento.
 */
const ExtractTestidsSchema = z.object({
  componenteFilePath: z.string().min(1),
  escopo:             z.string().min(1),
  sublocal:           z.string().min(1),
})

adminRouter.post('/planos-teste/extrair-testids', async (req, res, next) => {
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

// ─── Teste — Gemini Re-analysis ─────────────────────────────────────────────

/**
 * POST /api/v1/admin/testes/:id_teste/reanalisar
 * Re-analisa uma falha com Gemini (forceRefresh: true, bypassa cache).
 * Atualiza Teste.analise_ia_teste (campo Json).
 * Requer SUPER_ADMIN.
 */
adminRouter.post('/testes/:id_teste/reanalisar', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode reanalizar', 403, 'FORBIDDEN')
    }

    const logEntry = findLogEntry(req.params.id_teste)
    if (!logEntry) {
      throw new AppError('Teste não encontrado', 404, 'NOT_FOUND')
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

    updateLogEntryAnalysis(req.params.id_teste, analysis)

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Teste',
      id_recurso_historico_log: req.params.id_teste,
      acao_historico_log: 'TESTE_REANALISADO',
      detalhe_acao_historico_log: `Re-análise Gemini — categoria=${analysis.categoria}, confiança=${analysis.confianca}`,
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ analysis })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/testes/:id_teste/aplicar-correcao
 * Aplica o codigoDiff sugerido pelo Gemini no arquivo fonte.
 * Requer SUPER_ADMIN. Gemini é sugestor, humano valida antes de aplicar.
 */
adminRouter.post('/testes/:id_teste/aplicar-correcao', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode aplicar correções', 403, 'FORBIDDEN')
    }

    const logEntry = findLogEntry(req.params.id_teste)
    if (!logEntry) {
      throw new AppError('Teste não encontrado', 404, 'NOT_FOUND')
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
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Teste',
      id_recurso_historico_log: req.params.id_teste,
      acao_historico_log: 'TESTE_CORRECAO_APLICADA',
      detalhe_acao_historico_log: `Diff aplicado em ${diff.arquivo}`,
      estado_anterior_historico_log: { old: diff.old.slice(0, 200) },
      estado_posterior_historico_log: { new: diff.new.slice(0, 200) },
      status_historico_log: 'SUCESSO',
    }).catch(() => { /* fire-and-forget */ })

    res.json({ applied: true, arquivo: diff.arquivo })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/testes/:id_teste/rejeitar
 * Marca a análise IA como ruim (feedback loop para melhorar o prompt).
 */
const RejectSchema = z.object({
  motivo: z.string().min(10).max(500),
})

adminRouter.post('/testes/:id_teste/rejeitar', async (req, res, next) => {
  try {
    const parsed = RejectSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Motivo é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const logEntry = findLogEntry(req.params.id_teste)
    if (!logEntry) {
      throw new AppError('Teste não encontrado', 404, 'NOT_FOUND')
    }

    // Marca no Teste que a análise foi rejeitada
    updateLogEntryField(req.params.id_teste, 'ai_rejected', {
      rejeitadoEm: new Date().toISOString(),
      rejeitadoPor: req.auth.id_usuario,
      motivo: parsed.data.motivo,
    })

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.id_usuario,
      ip_ator_historico_log: req.ip,
      modulo_historico_log: 'admin',
      tipo_recurso_historico_log: 'Teste',
      id_recurso_historico_log: req.params.id_teste,
      acao_historico_log: 'TESTE_ANALISE_REJEITADA',
      detalhe_acao_historico_log: `Análise rejeitada — ${parsed.data.motivo.slice(0, 100)}`,
      status_historico_log: 'SUCESSO',
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
 * GET /api/v1/admin/agendamentos-teste
 * Lista todos os agendamentos de testes (model TesteAgendamento).
 */
adminRouter.get('/agendamentos-teste', async (_req, res, next) => {
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
 * POST /api/v1/admin/agendamentos-teste
 * Cria um novo agendamento de testes (model TesteAgendamento).
 */
adminRouter.post('/agendamentos-teste', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
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
 * PATCH /api/v1/admin/agendamentos-teste/:id_agendamento_teste
 * Atualiza um agendamento existente.
 */
adminRouter.patch('/agendamentos-teste/:id_agendamento_teste', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
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
        where: { id: req.params.id_agendamento_teste },
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
 * DELETE /api/v1/admin/agendamentos-teste/:id_agendamento_teste
 * Remove um agendamento.
 */
adminRouter.delete('/agendamentos-teste/:id_agendamento_teste', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
      throw new AppError('Apenas Super Admin pode remover agendamentos', 403, 'FORBIDDEN')
    }

    try {
      await (prisma as any).testSchedule?.delete?.({
        where: { id: req.params.id_agendamento_teste },
      })
    } catch {
      throw new AppError('Schedule não encontrado', 404, 'NOT_FOUND')
    }

    res.json({ deleted: true, id: req.params.id_agendamento_teste })
  } catch (err) {
    next(err)
  }
})

// ─── Métricas LLM ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/metricas-llm
 * Agrega métricas de custo, latência, confiança dos providers LLM (Gemini etc.).
 * Model: LLMMetricas (tabela `metricas_llm`).
 */
adminRouter.get('/metricas-llm', async (_req, res, next) => {
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
 * POST /api/v1/admin/testes/pentest
 * Dispara container ZAP contra URL alvo (cria Teste com tipo_teste='PEN').
 * Requer SUPER_ADMIN.
 */
adminRouter.post('/testes/pentest', async (req, res, next) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN') {
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
        id_organizacao: req.auth.id_organizacao,
        tipo_ator_historico_log: 'USUARIO',
        id_ator_historico_log: req.auth.id_usuario,
        nome_ator_historico_log: req.auth.id_usuario,
        ip_ator_historico_log: req.ip,
        modulo_historico_log: 'admin',
        tipo_recurso_historico_log: 'Pentest',
        acao_historico_log: 'PENTEST_COMPLETED',
        detalhe_acao_historico_log: `ZAP ${scanType} scan em ${targetUrl} — exit code ${code}`,
        estado_posterior_historico_log: { targetUrl, scanType, exitCode: code, reportFile },
        status_historico_log: code === 0 ? 'SUCESSO' : 'PARCIAL',
      }).catch(() => { /* fire-and-forget */ })
    })

    res.json({ started: true, scanType, targetUrl })
  } catch (err) {
    next(err)
  }
})
