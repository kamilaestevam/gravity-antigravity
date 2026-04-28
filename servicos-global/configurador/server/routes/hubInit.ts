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
 * GET /api/v1/hub/catalogo
 * Catálogo global de produtos — público, sem auth.
 * Qualquer usuário autenticado ou não pode ver o que existe na plataforma.
 */
hubRouter.get('/catalogo', async (_req, res, next) => {
  try {
    const rows = await prisma.produtoGravity.findMany({
      select: {
        id_produto_gravity: true,
        nome_produto_gravity: true,
        slug_produto_gravity: true,
        descricao_produto_gravity: true,
        status_produto_gravity: true,
      },
      orderBy: { data_criacao_produto_gravity: 'desc' },
    })
    // DTO: ProdutoGravity rename → contrato legado público
    const catalog = rows.map(p => ({
      id: p.id_produto_gravity,
      name: p.nome_produto_gravity,
      slug: p.slug_produto_gravity,
      description: p.descricao_produto_gravity,
      status: p.status_produto_gravity,
    }))
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
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario
    const role = req.auth.tipo_usuario

    // Tudo em paralelo — 1 único requireAuth
    const [tenant, companies, configs, mergedCatalog, userPref] = await Promise.all([
      tenantService.getTenantById(tenantId),
      tenantService.getCompanies(tenantId),
      prisma.produtoGravityConfiguracao.findMany({
        where: { id_organizacao_config_produto_gravity: tenantId },
        orderBy: { data_criacao_config_produto_gravity: 'desc' },
      }).catch(() => []),
      prisma.produtoGravity.findMany({
        select: {
          id_produto_gravity: true,
          nome_produto_gravity: true,
          slug_produto_gravity: true,
          descricao_produto_gravity: true,
          status_produto_gravity: true,
        },
        orderBy: { data_criacao_produto_gravity: 'desc' },
      }).then(rows => rows.map(p => ({
        id: p.id_produto_gravity,
        name: p.nome_produto_gravity,
        slug: p.slug_produto_gravity,
        description: p.descricao_produto_gravity,
        status: p.status_produto_gravity,
      }))).catch(() => [] as Array<{ id: string; name: string; slug: string; description: string; status: string }>),
      // Fornecedor nunca tem preferido — evita round-trip desnecessário
      role === 'FORNECEDOR'
        ? Promise.resolve(null)
        : prisma.usuario.findUnique({
            where: { id_usuario: userId },
            select: { preferred_company_id: true },
          }).catch(() => null),
    ])

    // Enriquece produtos contratados com dados do catálogo
    const catalogMap = new Map(mergedCatalog.map((p: { slug: string }) => [p.slug, p]))

    // DTO: ConfiguracaoProduto Prisma rename → contrato legado do hub
    const products = configs.map(c => ({
      product_key: c.chave_produto_config_produto_gravity,
      is_active: c.ativo_config_produto_gravity,
      config: c.configuracao_config_produto_gravity,
      subscribed_at: c.data_criacao_config_produto_gravity,
      catalog: catalogMap.get(c.chave_produto_config_produto_gravity) ?? null,
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
            where: { id_usuario: userId },
            data: { preferred_company_id: null },
          })
          .catch(() => {
            // Ignora — próxima chamada tentará de novo
          })
      }
    }

    // DTO: mapeia Prisma `*_organizacao` → chaves legadas do contrato
    const tenantDto = tenant
      ? (() => {
          const { id_organizacao, _count, subscriptions_organizacao, ...rest } = tenant
          return {
            id: id_organizacao,
            ...rest,
            _count: { users: _count.users_organizacao, companies: _count.companies_organizacao },
            // DTO: AssinaturaProdutoGravity rename → contrato externo legado
            subscriptions: subscriptions_organizacao.map((s) => ({
              status: s.status_assinatura_produto_gravity,
              trial_ends_at: s.data_fim_teste_assinatura_produto_gravity,
            })),
          }
        })()
      : null

    res.json({
      tenant: tenantDto,
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
    const tenantId = req.auth.id_organizacao
    const userId = req.auth.id_usuario
    const role = normalizeHubRole(req.auth.tipo_usuario)

    // Busca produtos ativos do tenant (leve — Prisma com select mínimo)
    const configs = await prisma.produtoGravityConfiguracao.findMany({
      where: {
        id_organizacao_config_produto_gravity: tenantId,
        ativo_config_produto_gravity: true,
      },
      select: { chave_produto_config_produto_gravity: true },
    })

    const activeProductKeys = new Set(configs.map(c => c.chave_produto_config_produto_gravity))

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
