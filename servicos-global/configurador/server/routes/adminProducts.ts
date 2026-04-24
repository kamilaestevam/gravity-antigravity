// server/routes/adminProducts.ts
// CRUD do catálogo master de produtos — exclusivo para gravity_admin.
// Montado em /api/admin/products pelo index.ts.

import { Router } from 'express'
import { z } from 'zod'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { rateLimitPresets } from '../middleware/rateLimiter.js'
import { productCatalogService } from '../services/productCatalogService.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'

const log = logger.child({ module: 'admin-products' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Lê os slugs de PRODUTOS registrados em contracts.json (seção "products").
 * Usa GRAVITY_CONTRACTS_PATH como fonte primária; cai em paths tradicionais
 * como fallback para compat com dev local antigo.
 */
function getContractsSlugs(): string[] {
  const candidatePaths: string[] = []

  if (process.env.GRAVITY_CONTRACTS_PATH) {
    candidatePaths.push(process.env.GRAVITY_CONTRACTS_PATH)
  }

  candidatePaths.push(
    join(__dirname, '..', '..', '..', 'contracts.json'),
    join(process.cwd(), 'servicos-global', 'contracts.json'),
    join(process.cwd(), '..', 'contracts.json'),
  )

  for (const contractsPath of candidatePaths) {
    try {
      const raw = readFileSync(contractsPath, 'utf-8')
      const contracts = JSON.parse(raw) as { products?: string[] }
      const slugs = Array.isArray(contracts.products) ? contracts.products : []
      if (slugs.length > 0) {
        log.debug('contracts.json loaded', { path: contractsPath, slug_count: slugs.length })
        return slugs
      }
    } catch {
      // tenta o próximo path
    }
  }

  log.warn('contracts.json not found — using hardcoded fallback', { tried: candidatePaths.length })
  return ['simula-custo', 'bid-frete', 'bid-cambio', 'pedido', 'nf-importacao', 'financeiro-comex']
}

export const adminProductsRouter = Router()

// Cadeia obrigatória: auth → gravity_admin check
adminProductsRouter.use(requireAuth, requireGravityAdmin)

// Rate limit moderado para operações admin (60 req/min por IP+tenant)
const adminRateLimit = rateLimitPresets.admin()

// ─── Schemas de validação ──────────────────────────────────────────────────

const PriceTierSchema = z.object({
  range_from: z.number().int().min(0),
  range_to: z.number().int().min(1).optional(),
  price: z.number().min(0),
  currency: z.string().length(3).default('BRL'),
})

const CreateProductSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().min(3).max(500),
  status: z.enum(['ATIVO', 'SUSPENSO', 'EM_BREVE', 'LEGADO', 'INATIVO']).default('ATIVO'),
  launch_date: z.string().datetime().optional(),

  has_setup: z.boolean().default(false),
  setup_price: z.number().min(0).optional(),
  setup_currency: z.string().length(3).default('BRL'),

  billing_type: z.enum([
    'MENSAL', 'POR_PROCESSO', 'POR_DOCUMENTO', 'POR_ESTIMATIVA',
    'POR_DI_DUIMP', 'POR_DUE', 'POR_PRODUTO', 'POR_FLUXO', 'POR_LPCO',
  ]).default('MENSAL'),
  unit_price: z.number().min(0),
  unit_currency: z.string().length(3).default('BRL'),
  minimum_price: z.number().min(0).default(0),
  minimum_currency: z.string().length(3).default('BRL'),
  total_price: z.number().min(0).optional(),
  total_currency: z.string().length(3).default('BRL'),

  user_limit_type: z.enum(['ILIMITADO', 'LIMITADO']).default('ILIMITADO'),
  base_users_qty: z.number().int().min(0).optional(),
  extra_user_price: z.number().min(0).optional(),
  extra_user_currency: z.string().length(3).default('BRL'),

  helpdesk_hours: z.number().int().min(0).default(0),
  extra_hour_price: z.number().min(0).optional(),
  extra_hour_currency: z.string().length(3).default('BRL'),

  backend_module: z.string().max(50).optional(),
  target_audience: z.string().max(300).optional(),

  gabi_quota_mensal: z.number().int().min(0).default(0),

  price_tiers: z.array(PriceTierSchema).optional(),
})

const UpdateProductSchema = CreateProductSchema.partial()

// ─── Rotas ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/products/available-slugs
 * Retorna slugs de contracts.json que ainda não têm produto cadastrado.
 */
adminProductsRouter.get('/available-slugs', async (_req, res, next) => {
  try {
    const allSlugs = getContractsSlugs()
    const usedSlugs = await productCatalogService.listUsedSlugs()
    const available = allSlugs.filter(slug => !usedSlugs.has(slug))
    res.json({ available, all: allSlugs })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/products
 * Lista todos os produtos do catálogo com paginação.
 */
adminProductsRouter.get('/', async (req, res, next) => {
  try {
    const result = await productCatalogService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/products/:id
 * Detalhes de um produto específico.
 */
adminProductsRouter.get('/:id', async (req, res, next) => {
  try {
    const product = await productCatalogService.getById(req.params.id)
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }
    res.json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/products
 * Cria um novo produto no catálogo.
 * Retorna 409 se o slug já existe (não faz upsert silencioso).
 */
adminProductsRouter.post('/', adminRateLimit, async (req, res, next) => {
  try {
    const parsed = CreateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }

    // Se status ATIVO, o slug deve existir em contracts.json (tem infraestrutura)
    if (parsed.data.status === 'ATIVO') {
      const contractsSlugs = getContractsSlugs()
      const moduleSlug = parsed.data.backend_module ?? parsed.data.slug
      if (!contractsSlugs.includes(moduleSlug)) {
        throw new AppError(
          `Produto ativo requer infraestrutura. O slug "${moduleSlug}" não existe em contracts.json.`,
          400,
          'MISSING_INFRASTRUCTURE',
        )
      }
    }

    const existing = await productCatalogService.getBySlug(parsed.data.slug)
    if (existing) {
      throw new AppError(
        `Já existe um produto com o slug "${parsed.data.slug}". Use PUT /admin/products/:id para atualizar.`,
        409,
        'SLUG_CONFLICT',
      )
    }

    const product = await productCatalogService.create(parsed.data)

    log.info('product created', {
      actor_id: req.auth.clerkUserId,
      resource_id: product.id,
      action: 'CREATE',
      slug: product.slug,
    })
    res.status(201).json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/admin/products/:id
 * Atualiza um produto existente.
 */
adminProductsRouter.put('/:id', adminRateLimit, async (req, res, next) => {
  try {
    const parsed = UpdateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }

    const existing = await productCatalogService.getById(req.params.id)
    if (!existing) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugTaken = await productCatalogService.getBySlug(parsed.data.slug)
      if (slugTaken) {
        throw new AppError('Já existe um produto com este slug', 409, 'CONFLICT')
      }
    }

    const product = await productCatalogService.update(req.params.id, parsed.data)

    log.info('product updated', {
      actor_id: req.auth.clerkUserId,
      resource_id: product.id,
      action: 'UPDATE',
    })
    res.json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/admin/products/:id/status
 * Alterna status Ativo/Suspenso de um produto.
 */
adminProductsRouter.patch('/:id/status', adminRateLimit, async (req, res, next) => {
  try {
    const product = await productCatalogService.toggleStatus(req.params.id)
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    log.info('product status toggled', {
      actor_id: req.auth.clerkUserId,
      resource_id: product.id,
      action: 'TOGGLE_STATUS',
      new_status: product.status,
    })
    res.json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/admin/products/:id
 * Soft-delete (marca deleted_at). Bloqueia se houver negociações ativas.
 * Use ?force=true + ?ack_negotiations=true para remover mesmo assim (hard delete).
 */
adminProductsRouter.delete('/:id', adminRateLimit, async (req, res, next) => {
  try {
    const existing = await productCatalogService.getById(req.params.id)
    if (!existing) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    const negotiationCount = await productCatalogService.countActiveNegotiations(req.params.id)
    const force = req.query.force === 'true'
    const ack = req.query.ack_negotiations === 'true'

    if (negotiationCount > 0 && !(force && ack)) {
      throw new AppError(
        `Produto possui ${negotiationCount} negociação(ões) especial(is) ativa(s). Confirme explicitamente para remover.`,
        409,
        'HAS_ACTIVE_NEGOTIATIONS',
      )
    }

    if (force) {
      await productCatalogService.hardDelete(req.params.id)
    } else {
      await productCatalogService.softDelete(req.params.id)
    }

    log.info('product deleted', {
      actor_id: req.auth.clerkUserId,
      resource_id: req.params.id,
      action: force ? 'HARD_DELETE' : 'SOFT_DELETE',
      negotiation_count: negotiationCount,
    })
    res.json({ deleted: true, id: req.params.id, mode: force ? 'hard' : 'soft' })
  } catch (err) {
    next(err)
  }
})
