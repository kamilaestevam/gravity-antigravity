// server/routes/adminProducts.ts
// CRUD do catálogo master de produtos — exclusivo para gravity_admin
// Montado em /api/admin/products pelo index.ts

import { Router } from 'express'
import { z } from 'zod'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { productCatalogService } from '../services/productCatalogService.js'
import { AppError } from '../lib/appError.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** Lê os slugs registrados em contracts.json */
function getContractsSlugs(): string[] {
  try {
    const contractsPath = join(__dirname, '..', '..', '..', 'contracts.json')
    const raw = readFileSync(contractsPath, 'utf-8')
    const contracts = JSON.parse(raw)
    return Object.keys(contracts.services ?? {})
  } catch {
    return []
  }
}

export const adminProductsRouter = Router()

// Cadeia obrigatória: auth → gravity_admin check
adminProductsRouter.use(requireAuth, requireGravityAdmin)

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
  description: z.string().min(5).max(500),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'COMING_SOON', 'LEGACY', 'INACTIVE']).default('ACTIVE'),
  launch_date: z.string().datetime().optional(),

  has_setup: z.boolean().default(false),
  setup_price: z.number().min(0).optional(),
  setup_currency: z.string().length(3).default('BRL'),

  billing_type: z.enum([
    'MONTHLY', 'PER_PROCESS', 'PER_DOCUMENT', 'PER_ESTIMATE',
    'PER_DI_DUIMP', 'PER_DUE', 'PER_PRODUCT', 'PER_FLOW', 'PER_LPCO',
  ]).default('MONTHLY'),
  unit_price: z.number().min(0),
  unit_currency: z.string().length(3).default('BRL'),
  minimum_price: z.number().min(0).default(0),
  minimum_currency: z.string().length(3).default('BRL'),
  total_price: z.number().min(0).optional(),
  total_currency: z.string().length(3).default('BRL'),

  user_limit_type: z.enum(['UNLIMITED', 'LIMITED']).default('UNLIMITED'),
  base_users_qty: z.number().int().min(0).optional(),
  extra_user_price: z.number().min(0).optional(),
  extra_user_currency: z.string().length(3).default('BRL'),

  helpdesk_hours: z.number().int().min(0).default(0),
  extra_hour_price: z.number().min(0).optional(),
  extra_hour_currency: z.string().length(3).default('BRL'),

  backend_module: z.string().max(50).optional(),
  target_audience: z.string().max(300).optional(),

  price_tiers: z.array(PriceTierSchema).optional(),
})

const UpdateProductSchema = CreateProductSchema.partial()

// ─── Rotas ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/products/available-slugs
 * Retorna slugs de contracts.json que ainda não têm produto cadastrado
 */
adminProductsRouter.get('/available-slugs', async (_req, res, next) => {
  try {
    const allSlugs = getContractsSlugs()
    const existingProducts = await productCatalogService.list({ limit: 1000 })
    const usedSlugs = new Set(
      existingProducts.products
        .map((p: { slug?: string; backend_module?: string | null }) => p.backend_module ?? p.slug)
        .filter(Boolean)
    )
    const available = allSlugs.filter(slug => !usedSlugs.has(slug))
    res.json({ available, all: allSlugs })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/products
 * Lista todos os produtos do catálogo com paginação
 */
adminProductsRouter.get('/', async (req, res, next) => {
  try {
    const result = await productCatalogService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/products/:id
 * Detalhes de um produto específico
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
 * Cria um novo produto no catálogo
 */
adminProductsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = CreateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const existing = await productCatalogService.getBySlug(parsed.data.slug)
    if (existing) {
      throw new AppError('Já existe um produto com este slug', 409, 'CONFLICT')
    }

    // Se status ACTIVE, o slug deve existir em contracts.json (tem infraestrutura)
    if (parsed.data.status === 'ACTIVE') {
      const contractsSlugs = getContractsSlugs()
      const moduleSlug = parsed.data.backend_module ?? parsed.data.slug
      if (!contractsSlugs.includes(moduleSlug)) {
        throw new AppError(
          `Produto ativo requer infraestrutura. O slug "${moduleSlug}" não existe em contracts.json.`,
          400,
          'MISSING_INFRASTRUCTURE'
        )
      }
    }

    const product = await productCatalogService.create(parsed.data as Parameters<typeof productCatalogService.create>[0])

    console.log(`[admin] Produto "${product.name}" criado por ${req.auth.clerkUserId}`)
    res.status(201).json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/admin/products/:id
 * Atualiza um produto existente
 */
adminProductsRouter.put('/:id', async (req, res, next) => {
  try {
    const parsed = UpdateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
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

    const product = await productCatalogService.update(req.params.id, parsed.data as Parameters<typeof productCatalogService.update>[1])

    console.log(`[admin] Produto "${product.name}" atualizado por ${req.auth.clerkUserId}`)
    res.json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/admin/products/:id/status
 * Alterna status Ativo/Suspenso de um produto
 */
adminProductsRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const product = await productCatalogService.toggleStatus(req.params.id)
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    console.log(`[admin] Produto "${product.name}" status → ${product.status} por ${req.auth.clerkUserId}`)
    res.json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/admin/products/:id
 * Remove um produto do catálogo
 */
adminProductsRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await productCatalogService.getById(req.params.id)
    if (!existing) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    await productCatalogService.delete(req.params.id)

    console.log(`[admin] Produto "${existing.name}" removido por ${req.auth.clerkUserId}`)
    res.json({ deleted: true, id: req.params.id })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/products/seed
 * Seed dos produtos iniciais (idempotente)
 */
adminProductsRouter.post('/seed', async (req, res, next) => {
  try {
    const catalogResult = await productCatalogService.seedInitialProducts()

    // Ativar produtos para o tenant demo (dmmltda@gmail.com → tenant-1)
    const DEMO_TENANT_ID = 'tenant-1'
    const activateResult = await productCatalogService.activateProductsForTenant(
      DEMO_TENANT_ID,
      ['simula-custo', 'bid-cambio', 'bid-frete'],
    )

    res.json({ catalog: catalogResult, activation: activateResult })
  } catch (err) {
    next(err)
  }
})
