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
 * GET /api/v1/hub/catalog
 * Catálogo global de produtos — público, sem auth.
 * Qualquer usuário autenticado ou não pode ver o que existe na plataforma.
 */
hubRouter.get('/catalog', async (_req, res, next) => {
  try {
    const catalog = await prisma.product.findMany({
      select: { id: true, name: true, slug: true, description: true, status: true },
      orderBy: { created_at: 'desc' },
    })
    res.json({ catalog })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/hub/init
 * Carrega dados do tenant (companies + produtos contratados) + catálogo numa única chamada.
 * Requer auth. Se o tenant não tiver produtos contratados, retorna catalog completo para sugestão.
 */
hubRouter.get('/init', requireAuth, async (req, res, next) => {
  try {
    const tenantId = req.auth.tenantId

    // Tudo em paralelo — 1 único requireAuth
    const [tenant, companies, configs, mergedCatalog] = await Promise.all([
      tenantService.getTenantById(tenantId),
      tenantService.getCompanies(tenantId),
      prisma.productConfig.findMany({
        where: { tenant_id: tenantId },
        orderBy: { created_at: 'desc' },
      }).catch(() => []),
      prisma.product.findMany({
        select: { id: true, name: true, slug: true, description: true, status: true },
        orderBy: { created_at: 'desc' },
      }).catch(() => []),
    ])

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
