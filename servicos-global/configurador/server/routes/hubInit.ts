// server/routes/hubInit.ts
// Endpoint agregado para a tela Hub (SelecionarWorkspace)
// GET /api/v1/hub/init — retorna companies + tenant + produtos + catálogo em 1 chamada
// GET /api/v1/hub/insights — retorna insights cross-produto da GABI para o carrossel do Hub
// Elimina 4 round-trips (cada um com verifyToken + DB lookup) → 1 único

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { tenantService } from '../services/tenantService.js'
import { prisma } from '../lib/prisma.js'
import { generateHubInsights, normalizeHubRole } from '../services/hubInsightsService.js'

export const hubRouter = Router()

/**
 * GET /api/v1/hub/catalog
 * Catálogo global de produtos — público, sem auth.
 * Qualquer usuário autenticado ou não pode ver o que existe na plataforma.
 */
hubRouter.get('/catalog', async (_req, res, next) => {
  try {
    const catalog = await prisma.produtoGravity.findMany({
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
    const userId = req.auth.userId
    const role = req.auth.role

    // Tudo em paralelo — 1 único requireAuth
    const [tenant, companies, configs, mergedCatalog, userPref] = await Promise.all([
      tenantService.getTenantById(tenantId),
      tenantService.getCompanies(tenantId),
      prisma.configuracaoProduto.findMany({
        where: { tenant_id: tenantId },
        orderBy: { created_at: 'desc' },
      }).catch(() => []),
      prisma.produtoGravity.findMany({
        select: { id: true, name: true, slug: true, description: true, status: true },
        orderBy: { created_at: 'desc' },
      }).catch(() => []),
      // Fornecedor nunca tem preferido — evita round-trip desnecessário
      role === 'FORNECEDOR'
        ? Promise.resolve(null)
        : prisma.usuario.findUnique({
            where: { id: userId },
            select: { preferred_company_id: true },
          }).catch(() => null),
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

    // Workspace preferido — valida que ainda aponta para company ATIVA
    // onde o usuário tem membership ativa. Se inválido, retorna null
    // (frontend mostra tela de seleção normalmente).
    let preferredCompanyId: string | null = null
    if (userPref?.preferred_company_id) {
      const stillValid = companies.some(
        (c: { id: string; status?: string }) =>
          c.id === userPref.preferred_company_id && c.status !== 'INATIVO',
      )
      if (stillValid) {
        preferredCompanyId = userPref.preferred_company_id
      } else {
        // Fallback silencioso: limpa no banco (fire-and-forget, não bloqueia resposta)
        prisma.usuario
          .update({
            where: { id: userId },
            data: { preferred_company_id: null },
          })
          .catch(() => {
            // Ignora — próxima chamada tentará de novo
          })
      }
    }

    res.json({
      tenant,
      companies,
      products,
      catalog: mergedCatalog,
      preferredCompanyId,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/hub/insights
 * Insights cross-produto da GABI para o carrossel do Hub.
 * Busca KPIs de cada produto ativo via inter-service REST (Promise.allSettled).
 * Ranqueia por role-weights. Cache in-memory por tenant+user (TTL 5min).
 * Resiliente: se nenhum produto responde, retorna fallback estático.
 */
hubRouter.get('/insights', requireAuth, async (req, res) => {
  try {
    const tenantId = req.auth.tenantId
    const userId = req.auth.userId
    const role = normalizeHubRole(req.auth.role)

    // Busca produtos ativos do tenant (leve — Prisma com select mínimo)
    const configs = await prisma.configuracaoProduto.findMany({
      where: { tenant_id: tenantId, is_active: true },
      select: { product_key: true },
    })

    const activeProductKeys = new Set(configs.map(c => c.product_key))

    const insights = await generateHubInsights(
      tenantId,
      userId,
      role,
      activeProductKeys,
    )

    res.json({ insights, count: insights.length, cached: false })
  } catch {
    // Resilient — always return something usable
    res.json({
      insights: [
        {
          id: 'hub_error_fallback',
          variante: 'default',
          tag: 'GABI AI · Pronta',
          texto: 'Sua assistente está monitorando seus produtos. Insights serão atualizados em breve.',
          score: 0,
        },
      ],
      count: 1,
      cached: false,
    })
  }
})
