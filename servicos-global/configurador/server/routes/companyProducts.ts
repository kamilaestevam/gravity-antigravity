// server/routes/companyProducts.ts
// Gestão de produtos habilitados por workspace (Company)
// GET    /api/v1/companies/:companyId/products              — Listar produtos do workspace
// POST   /api/v1/companies/:companyId/products              — Ativar produto no workspace
// DELETE /api/v1/companies/:companyId/products/:productKey  — Desativar produto no workspace

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const companyProductsRouter = Router({ mergeParams: true })

const EnableProductSchema = z.object({
  product_key: z.string().min(1),
})

/**
 * GET /api/v1/companies/:companyId/products
 * Lista produtos habilitados no workspace
 */
companyProductsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { companyId } = req.params

    // Verifica se o workspace pertence ao tenant
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenant_id: req.auth.tenantId },
    })
    if (!company) {
      throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')
    }

    const companyProducts = await prisma.companyProduct.findMany({
      where: { company_id: companyId, tenant_id: req.auth.tenantId },
      orderBy: { created_at: 'desc' },
    })

    // Enriquece com dados do catálogo
    const slugs = companyProducts.map(cp => cp.product_key)
    const catalog = await prisma.globalProduct.findMany({
      where: { slug: { in: slugs } },
    })
    const catalogMap = new Map(catalog.map(p => [p.slug, p]))

    const products = companyProducts.map(cp => ({
      id: cp.id,
      product_key: cp.product_key,
      is_active: cp.is_active,
      activated_at: cp.created_at,
      catalog: catalogMap.get(cp.product_key) ?? null,
    }))

    res.json({ products })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/companies/:companyId/products
 * Ativa um produto no workspace (o tenant já precisa ter contratado o produto)
 */
companyProductsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { companyId } = req.params
    const parsed = EnableProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('product_key é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const { product_key } = parsed.data

    // Verifica se o workspace pertence ao tenant
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenant_id: req.auth.tenantId },
    })
    if (!company) {
      throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')
    }

    // Verifica se o tenant contratou o produto
    const tenantProduct = await prisma.productConfig.findUnique({
      where: {
        tenant_id_product_key: {
          tenant_id: req.auth.tenantId,
          product_key,
        },
      },
    })
    if (!tenantProduct || !tenantProduct.is_active) {
      throw new AppError(
        'Produto não contratado pelo tenant. Contrate primeiro via Store.',
        403,
        'PRODUCT_NOT_SUBSCRIBED'
      )
    }

    // Ativa ou reativa no workspace
    const companyProduct = await prisma.companyProduct.upsert({
      where: {
        company_id_product_key: {
          company_id: companyId,
          product_key,
        },
      },
      create: {
        tenant_id: req.auth.tenantId,
        company_id: companyId,
        product_key,
        is_active: true,
      },
      update: {
        is_active: true,
      },
    })

    res.status(201).json({ companyProduct })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/companies/:companyId/products/:productKey
 * Desativa um produto no workspace (soft delete)
 */
companyProductsRouter.delete('/:productKey', requireAuth, async (req, res, next) => {
  try {
    const { companyId, productKey } = req.params

    await prisma.companyProduct.updateMany({
      where: {
        company_id: companyId,
        product_key: productKey,
        tenant_id: req.auth.tenantId,
      },
      data: { is_active: false },
    })

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
