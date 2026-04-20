// server/routes/tenantProducts.ts
// Ativação/desativação de produtos por tenant — gravity_admin only
// Montado em /api/admin/tenants pelo index.ts
// Ex: POST /api/admin/tenants/:tenantId/products/:productKey/activate
//
// Gestão de produtos contratados por um tenant (self-service)
// POST /api/v1/assinaturas/subscribe  — Contratar produto
// GET  /api/v1/assinaturas            — Listar produtos contratados
// DELETE /api/v1/assinaturas/:key     — Cancelar produto

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { productConfigService } from '../services/productConfigService.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const tenantProductsRouter = Router()

// ─── Self-service routes (tenant authenticated) ────────────────────────────

const SubscribeSchema = z.object({
  product_key: z.string().min(1),
})

/**
 * GET /api/v1/assinaturas
 * Lista todos os produtos contratados pelo tenant autenticado
 */
tenantProductsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const configs = await prisma.productConfig.findMany({
      where: { tenant_id: req.auth.tenantId },
      orderBy: { created_at: 'desc' },
    })

    // Enriquece com dados do catálogo
    const slugs = configs.map(c => c.product_key)
    const catalog = await prisma.product.findMany({
      where: { slug: { in: slugs } },
    })
    const catalogMap = new Map(catalog.map(p => [p.slug, p]))

    const products = configs.map(c => ({
      product_key: c.product_key,
      is_active: c.is_active,
      config: c.config,
      subscribed_at: c.created_at,
      catalog: catalogMap.get(c.product_key) ?? null,
    }))

    res.json({ products })
  } catch {
    // globalProduct ou productConfig pode não existir — retorna vazio
    res.json({ products: [] })
  }
})

/**
 * POST /api/v1/assinaturas/subscribe
 * Contrata um produto do catálogo para o tenant autenticado
 */
tenantProductsRouter.post('/subscribe', requireAuth, async (req, res, next) => {
  try {
    const parsed = SubscribeSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('product_key é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const { product_key } = parsed.data

    // Verifica se o produto existe no catálogo
    const catalogProduct =
      await prisma.product.findFirst({ where: { slug: product_key, status: { in: ['ACTIVE'] as any[] } } }).catch(() => null)

    if (!catalogProduct) {
      throw new AppError('Produto não encontrado ou inativo', 404, 'NOT_FOUND')
    }

    // Cria ou reativa o ProductConfig
    const config = await prisma.productConfig.upsert({
      where: {
        tenant_id_product_key: {
          tenant_id: req.auth.tenantId,
          product_key,
        },
      },
      create: {
        tenant_id: req.auth.tenantId,
        product_key,
        config: {},
        is_active: true,
      },
      update: {
        is_active: true,
      },
    })

    res.status(201).json({ config, catalog: catalogProduct })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/assinaturas/:key
 * Cancela (desativa) um produto do tenant
 */
tenantProductsRouter.delete('/:key', requireAuth, async (req, res, next) => {
  try {
    await prisma.productConfig.updateMany({
      where: {
        tenant_id: req.auth.tenantId,
        product_key: req.params.key,
      },
      data: { is_active: false },
    })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ─── Admin routes (gravity_admin only) ─────────────────────────────────────

const ActivateProductSchema = z.object({
  config: z.record(z.unknown()).optional().default({}),
})

/**
 * GET /api/admin/tenants/:tenantId/products
 * Lista produtos ativados para um tenant específico
 */
tenantProductsRouter.get('/:tenantId/products', requireAuth, requireGravityAdmin, async (req, res, next) => {
  try {
    const tenant = await prisma.organization.findUnique({
      where: { id: req.params.tenantId },
      select: { id: true, name: true },
    })
    if (!tenant) {
      throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
    }

    const configs = await prisma.productConfig.findMany({
      where: { tenant_id: req.params.tenantId },
      orderBy: { created_at: 'desc' },
    })

    res.json({ tenant_id: tenant.id, tenant_name: tenant.name, products: configs })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/tenants/:tenantId/products/:productKey/activate
 * Ativa um produto para um tenant
 */
tenantProductsRouter.post(
  '/:tenantId/products/:productKey/activate',
  requireAuth,
  requireGravityAdmin,
  async (req, res, next) => {
    try {
      const parsed = ActivateProductSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new AppError(
          parsed.error.errors[0]?.message ?? 'Dados inválidos',
          400,
          'VALIDATION_ERROR'
        )
      }

      const tenant = await prisma.organization.findUnique({
        where: { id: req.params.tenantId },
      })
      if (!tenant) {
        throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
      }

      const config = await productConfigService.upsertConfig(
        req.params.tenantId,
        req.params.productKey,
        parsed.data.config,
        true
      )

      console.log(
        `[admin] Produto "${req.params.productKey}" ativado para tenant "${tenant.name}" por ${req.auth.clerkUserId}`
      )

      res.json({ activated: true, config })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * POST /api/admin/tenants/:tenantId/products/:productKey/deactivate
 * Desativa um produto para um tenant
 */
tenantProductsRouter.post(
  '/:tenantId/products/:productKey/deactivate',
  requireAuth,
  requireGravityAdmin,
  async (req, res, next) => {
    try {
      const tenant = await prisma.organization.findUnique({
        where: { id: req.params.tenantId },
      })
      if (!tenant) {
        throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
      }

      await productConfigService.disableProduct(
        req.params.tenantId,
        req.params.productKey
      )

      console.log(
        `[admin] Produto "${req.params.productKey}" desativado para tenant "${tenant.name}" por ${req.auth.clerkUserId}`
      )

      res.json({ deactivated: true })
    } catch (err) {
      next(err)
    }
  }
)
