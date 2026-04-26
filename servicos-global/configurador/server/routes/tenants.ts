// server/routes/tenants.ts
// Gestão de tenants e empresas filhas
// POST /api/v1/organizacao       — criar tenant (onboarding)
// GET  /api/v1/organizacao/me    — dados do tenant atual
// GET  /api/v1/organizacao/companies — listar empresas filhas
// POST /api/v1/organizacao/companies — criar empresa filha

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { tenantService } from '../services/tenantService.js'
import { AppError } from '../lib/appError.js'
import { AuditService } from '../../../tenant/historico-global/server/services/audit.service.js'

export const tenantsRouter = Router()

// ─── Schemas de validação ───────────────────────────────────────────────────

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
const isoPaisRegex = /^[A-Z]{2}$/

export const CreateTenantSchema = z
  .object({
    nome_organizacao: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    subdominio_organizacao: z
      .string()
      .min(2)
      .regex(/^[a-z0-9-]+$/, 'Slug deve ser lowercase alfanumérico com hifens'),
    clerkUserId: z.string(),
    owner: z.object({
      email: z.string().email(),
      name: z.string().min(1),
    }),
    cnpj_organizacao: z
      .string()
      .regex(cnpjRegex, 'CNPJ precisa estar no formato XX.XXX.XXX/XXXX-XX')
      .optional(),
    pais: z
      .string()
      .regex(isoPaisRegex, 'País precisa ser código ISO-2 (ex: BR, US, CN)')
      .default('BR'),
  })
  .superRefine((data, ctx) => {
    if (data.pais === 'BR' && !data.cnpj_organizacao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cnpj_organizacao'],
        message: 'CNPJ é obrigatório quando país = BR',
      })
    }
    if (data.pais !== 'BR' && data.cnpj_organizacao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cnpj_organizacao'],
        message: 'CNPJ só pode ser preenchido quando país = BR',
      })
    }
  })

const UpdateTenantSchema = z.object({
  nome_organizacao: z.string().min(2).optional(),
  cnpj_organizacao: z.string().optional(),
  estado_organizacao: z.string().optional(),
  cidade_organizacao: z.string().optional(),
  segmento_organizacao: z.string().optional(),
  tipo_empresa_organizacao: z.string().optional(),
})

const CreateCompanySchema = z.object({
  name: z.string().min(2),
  subdomain: z.string().optional(),
  cnpj: z.string().optional(),
})

const UpdateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  subdomain: z.string().optional(),
  cnpj: z.string().optional(),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
})

// ─── Rotas ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/organizacao
 * Cria um novo tenant + usuário owner durante o onboarding
 * Público — chamado logo após o checkout do Stripe
 */
tenantsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = CreateTenantSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const tenant = await tenantService.createTenant({
      ...parsed.data,
      correlationId: req.correlationId,
    })
    return res.status(201).json({ tenant })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/organizacao/me
 * Retorna dados do tenant do usuário autenticado
 */
tenantsRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.auth.tenantId)
    if (!tenant) {
      throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
    }
    // DTO: mapeia Prisma `*_organizacao` → chaves legadas do contrato
    const { _count, subscriptions_organizacao, ...rest } = tenant
    res.json({
      tenant: {
        ...rest,
        _count: { users: _count.users_organizacao, companies: _count.companies_organizacao },
        subscriptions: subscriptions_organizacao,
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/organizacao/me
 * Atualiza dados cadastrais do tenant autenticado
 */
tenantsRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const parsed = UpdateTenantSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }
    const before = await tenantService.getTenantById(req.auth.tenantId)
    const tenant = await tenantService.updateTenant(req.auth.tenantId, parsed.data)

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      module: 'configuracao',
      resource_type: 'Organização',
      resource_id: req.auth.tenantId,
      action: 'UPDATE',
      action_detail: `Atualizou dados da organização: ${Object.keys(parsed.data).join(', ')}`,
      before: before ?? undefined,
      after: tenant,
    }).catch(() => {})

    res.json({ tenant })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/organizacao/companies
 * Lista empresas filhas do tenant autenticado
 */
tenantsRouter.get('/companies', requireAuth, async (req, res, next) => {
  try {
    const companies = await tenantService.getCompanies(req.auth.tenantId)
    res.json({ companies })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/organizacao/companies
 * Cria uma empresa filha no tenant autenticado
 */
tenantsRouter.post('/companies', requireAuth, async (req, res, next) => {
  try {
    const parsed = CreateCompanySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }
    const company = await tenantService.createCompany(
      req.auth.tenantId,
      parsed.data
    )

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      module: 'configuracao',
      resource_type: 'Empresa Filha',
      resource_id: company.id,
      action: 'CREATE',
      action_detail: `Criou empresa filha "${company.name}"`,
      after: company,
    }).catch(() => {})

    res.status(201).json({ company })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/organizacao/companies/:id
 * Atualiza uma empresa filha (nome, subdomain, cnpj, status)
 */
tenantsRouter.patch('/companies/:id', requireAuth, async (req, res, next) => {
  try {
    const parsed = UpdateCompanySchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }
    const company = await tenantService.updateCompany(
      req.auth.tenantId,
      req.params.id,
      parsed.data
    )

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      module: 'configuracao',
      resource_type: 'Empresa Filha',
      resource_id: req.params.id,
      action: 'UPDATE',
      action_detail: `Atualizou empresa filha: ${Object.keys(parsed.data).join(', ')}`,
      after: company,
    }).catch(() => {})

    res.json({ company })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/organizacao/companies/:id
 * Remove uma empresa filha do tenant autenticado
 */
tenantsRouter.delete('/companies/:id', requireAuth, async (req, res, next) => {
  try {
    await tenantService.deleteCompany(req.auth.tenantId, req.params.id)

    AuditService.log({
      tenant_id: req.auth.tenantId,
      actor_type: 'USER',
      actor_id: req.auth.userId,
      actor_name: req.auth.userId,
      module: 'configuracao',
      resource_type: 'Empresa Filha',
      resource_id: req.params.id,
      action: 'DELETE',
      action_detail: `Removeu empresa filha ${req.params.id}`,
    }).catch(() => {})

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
