// server/routes/tenants.ts
// Gestão de organizações e workspaces
// POST /api/v1/organizacoes              — criar organização (onboarding)
// GET  /api/v1/organizacoes/me           — dados da organização atual
// GET  /api/v1/organizacoes/me/workspaces — listar workspaces
// POST /api/v1/organizacoes/me/workspaces — criar workspace

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { tenantService } from '../services/tenantService.js'
import { AppError } from '../lib/appError.js'
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'

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
  tipo_organizacao: z.string().optional(),
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
 * POST /api/v1/organizacoes
 * Cria uma nova organização + usuário owner durante o onboarding
 * Público — chamado logo após o checkout do provider de billing
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
 * GET /api/v1/organizacoes/me
 * Retorna dados da organização do usuário autenticado
 */
tenantsRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.auth.id_organizacao)
    if (!tenant) {
      throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
    }
    // DTO: mapeia Prisma `*_organizacao` → chaves legadas do contrato
    const { id_organizacao, _count, subscriptions_organizacao, ...rest } = tenant
    res.json({
      tenant: {
        id: id_organizacao,
        ...rest,
        _count: { users: _count.users_organizacao, companies: _count.companies_organizacao },
        // DTO: AssinaturaProdutoGravity rename → contrato externo legado
        subscriptions: subscriptions_organizacao.map((s) => ({
          status: s.status_assinatura_produto_gravity,
          trial_ends_at: s.data_fim_teste_assinatura_produto_gravity,
        })),
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/organizacoes/me
 * Atualiza dados cadastrais da organização autenticada
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
    const before = await tenantService.getTenantById(req.auth.id_organizacao)
    const tenant = await tenantService.updateTenant(req.auth.id_organizacao, parsed.data)

    AuditService.log({
      tenant_id: req.auth.id_organizacao,
      actor_type: 'USUARIO',
      actor_id: req.auth.id_usuario,
      actor_name: req.auth.id_usuario,
      module: 'configuracao',
      resource_type: 'Organização',
      resource_id: req.auth.id_organizacao,
      action: 'UPDATE',
      action_detail: `Atualizou dados da organização: ${Object.keys(parsed.data).join(', ')}`,
      before: before ?? undefined,
      after: tenant,
    }).catch(() => {})

    // DTO: id_organizacao → id legado do contrato
    const { id_organizacao, ...tenantRest } = tenant
    res.json({ tenant: { id: id_organizacao, ...tenantRest } })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/organizacoes/me/workspaces
 * Lista workspaces da organização autenticada
 */
tenantsRouter.get('/me/workspaces', requireAuth, async (req, res, next) => {
  try {
    const companies = await tenantService.getCompanies(req.auth.id_organizacao)
    res.json({ companies })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/organizacoes/me/workspaces
 * Cria um workspace na organização autenticada
 */
tenantsRouter.post('/me/workspaces', requireAuth, async (req, res, next) => {
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
      req.auth.id_organizacao,
      parsed.data
    )

    AuditService.log({
      tenant_id: req.auth.id_organizacao,
      actor_type: 'USUARIO',
      actor_id: req.auth.id_usuario,
      actor_name: req.auth.id_usuario,
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
 * PATCH /api/v1/organizacoes/me/workspaces/:id_workspace
 * Atualiza um workspace (nome, subdomain, cnpj, status)
 */
tenantsRouter.patch('/me/workspaces/:id_workspace', requireAuth, async (req, res, next) => {
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
      req.auth.id_organizacao,
      req.params.id_workspace,
      parsed.data
    )

    AuditService.log({
      tenant_id: req.auth.id_organizacao,
      actor_type: 'USUARIO',
      actor_id: req.auth.id_usuario,
      actor_name: req.auth.id_usuario,
      module: 'configuracao',
      resource_type: 'Empresa Filha',
      resource_id: req.params.id_workspace,
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
 * DELETE /api/v1/organizacoes/me/workspaces/:id_workspace
 * Remove um workspace da organização autenticada
 */
tenantsRouter.delete('/me/workspaces/:id_workspace', requireAuth, async (req, res, next) => {
  try {
    await tenantService.deleteCompany(req.auth.id_organizacao, req.params.id_workspace)

    AuditService.log({
      tenant_id: req.auth.id_organizacao,
      actor_type: 'USUARIO',
      actor_id: req.auth.id_usuario,
      actor_name: req.auth.id_usuario,
      module: 'configuracao',
      resource_type: 'Empresa Filha',
      resource_id: req.params.id_workspace,
      action: 'DELETE',
      action_detail: `Removeu empresa filha ${req.params.id_workspace}`,
    }).catch(() => {})

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
