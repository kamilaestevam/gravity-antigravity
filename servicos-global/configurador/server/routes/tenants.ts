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

const CreateCompanySchema = z.object({
  name: z.string().min(2),
  subdomain: z.string().optional(),
  cnpj: z.string().optional(),
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
    res.status(201).json({ company })
  } catch (err) {
    next(err)
  }
})
