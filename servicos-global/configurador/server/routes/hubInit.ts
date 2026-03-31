// server/routes/hubInit.ts
// Endpoint agregado para a tela Hub (SelecionarWorkspace)
// GET /api/v1/hub/init — retorna companies + tenant + produtos + catálogo em 1 chamada
// Elimina 4 round-trips (cada um com verifyToken + DB lookup) → 1 único

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { tenantService } from '../services/tenantService.js'
import { productCatalogService } from '../services/productCatalogService.js'
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

    // Tudo em paralelo — 1 único requireAuth, 4 queries simultâneas
    const [tenant, companies, configs, catalogResult] = await Promise.all([
      tenantService.getTenantById(tenantId),
      tenantService.getCompanies(tenantId),
      prisma.productConfig.findMany({
        where: { tenant_id: tenantId },
        orderBy: { created_at: 'desc' },
      }),
      productCatalogService.list({}),
    ])

    // Enriquece produtos contratados com dados do catálogo
    const slugs = configs.map(c => c.product_key)
    const catalogItems = await prisma.globalProduct.findMany({
      where: { slug: { in: slugs } },
    })
    const catalogMap = new Map(catalogItems.map(p => [p.slug, p]))

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
      catalog: catalogResult.products ?? [],
    })
  } catch (err) {
    next(err)
  }
})
