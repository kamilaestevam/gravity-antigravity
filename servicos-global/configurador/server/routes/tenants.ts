// server/routes/tenants.ts
// Gestão de tenants e empresas filhas
// POST /api/v1/tenants       — criar tenant (onboarding)
// GET  /api/v1/tenants/me    — dados do tenant atual
// GET  /api/v1/tenants/companies — listar empresas filhas
// POST /api/v1/tenants/companies — criar empresa filha

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { tenantService } from '../services/tenantService.js'
import { AppError } from '../lib/appError.js'
import { AuditService } from '../../../tenant/historico-global/server/services/audit.service.js'

export const tenantsRouter = Router()

// ─── Schemas de validação ───────────────────────────────────────────────────

const CreateTenantSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug deve ser lowercase alfanumérico com hifens'),
  clerkUserId: z.string(),
  owner: z.object({
    email: z.string().email(),
    name: z.string().min(1),
  }),
})

const UpdateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  cnpj: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  segment: z.string().optional(),
  tipo_empresa: z.string().optional(),
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
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

// ─── Rotas ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/tenants
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

    const tenant = await tenantService.createTenant(parsed.data)
    return res.status(201).json({ tenant })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/tenants/me
 * Retorna dados do tenant do usuário autenticado
 */
tenantsRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.auth.tenantId)
    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404, 'NOT_FOUND')
    }
    res.json({ tenant })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/tenants/me
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
 * GET /api/v1/tenants/companies
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
 * POST /api/v1/tenants/companies
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
 * PATCH /api/v1/tenants/companies/:id
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
 * DELETE /api/v1/tenants/companies/:id
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
