// server/routes/products.ts
// GET /api/v1/products — Catálogo público de produtos (leitura)
// CRUD exclusivo de admin via /api/admin/products (adminProducts.ts)

import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const productsRouter = Router()

/**
 * GET /api/v1/products
 * Retorna produtos ACTIVE e COMING_SOON — mesma fonte que o Admin (tabela Product)
 */
productsRouter.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: { in: ['ACTIVE', 'COMING_SOON'] as any[] } },
      select: {
        id: true, name: true, slug: true, description: true, status: true,
        unit_price: true, unit_currency: true, backend_module: true,
        billing_type: true,
      },
      orderBy: { name: 'asc' }
    })
    res.json({
      products: products.map(p => ({
        ...p,
        type_billing: p.billing_type ?? null,
        currency: p.unit_currency ?? 'BRL',
      }))
    })
  } catch {
    res.json({ products: [] })
  }
})
