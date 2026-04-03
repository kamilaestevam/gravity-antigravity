// server/routes/hubInit.ts
// Endpoint agregado para a tela Hub (SelecionarWorkspace)
// GET /api/v1/hub/init — retorna companies + tenant + produtos + catálogo em 1 chamada
// Elimina 4 round-trips (cada um com verifyToken + DB lookup) → 1 único

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { tenantService } from '../services/tenantService.js'
import { prisma } from '../lib/prisma.js'

export const hubRouter = Router()

/**
 * GET /api/v1/hub/init
 * Carrega todos os dados necessários para a tela Hub numa única chamada.
 * Substitui 4 chamadas separadas:
 *   - GET /api/v1/tenants/companies
 *   - GET /api/v1/tenants/me
 *   - GET /api/v1/tenants/products
 *   - GET /api/admin/products
 */
hubRouter.get('/init', requireAuth, async (req, res, next) => {
  try {
    const tenantId = req.auth.tenantId

    // Tudo em paralelo — 1 único requireAuth
    const [tenant, companies, configs, catalogProducts, globalProducts] = await Promise.all([
      tenantService.getTenantById(tenantId),
      tenantService.getCompanies(tenantId),
      prisma.productConfig.findMany({
        where: { tenant_id: tenantId },
        orderBy: { created_at: 'desc' },
      }).catch(() => []),
      // Query leve: só campos necessários para o hub (sem price_tiers/negotiations)
      prisma.product.findMany({
        select: { id: true, name: true, slug: true, description: true, status: true },
        orderBy: { created_at: 'desc' },
      }).catch(() => []),
      // Catálogo secundário (GlobalProduct) — inclui produtos Em Breve
      prisma.globalProduct.findMany({
        select: { id: true, name: true, slug: true, description: true, status: true },
        orderBy: { created_at: 'desc' },
      }).catch(() => []),
    ])

    // Merge catálogos: Product tem precedência; GlobalProduct complementa
    const productSlugs = new Set(catalogProducts.map((p: { slug: string }) => p.slug))
    const mergedCatalog = [
      ...catalogProducts,
      ...globalProducts.filter((gp: { slug: string }) => !productSlugs.has(gp.slug)),
    ]

    // Enriquece produtos contratados com dados do catálogo
    const catalogMap = new Map(mergedCatalog.map((p: { slug: string }) => [p.slug, p]))

    const products = configs.map(c => ({
      product_key: c.product_key,
      is_active: c.is_active,
      config: c.config,
      subscribed_at: c.created_at,
      catalog: catalogMap.get(c.product_key) ?? null,
    }))

    res.json({
      tenant,
      companies,
      products,
      catalog: mergedCatalog,
    })
  } catch (err) {
    next(err)
  }
})
