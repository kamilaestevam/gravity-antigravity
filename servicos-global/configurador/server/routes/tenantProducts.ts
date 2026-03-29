// server/routes/tenantProducts.ts
// Gestão de produtos contratados por um tenant
// POST /api/v1/tenants/products/subscribe  — Contratar produto
// GET  /api/v1/tenants/products            — Listar produtos contratados
// DELETE /api/v1/tenants/products/:key     — Cancelar produto

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const tenantProductsRouter = Router()

const SubscribeSchema = z.object({
  product_key: z.string().min(1),
})

/**
 * GET /api/v1/tenants/products
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
    const catalog = await prisma.globalProduct.findMany({
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
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/tenants/products/subscribe
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
    const catalogProduct = await prisma.globalProduct.findFirst({
      where: { slug: product_key, status: 'Ativo' },
    })
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
 * DELETE /api/v1/tenants/products/:key
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
