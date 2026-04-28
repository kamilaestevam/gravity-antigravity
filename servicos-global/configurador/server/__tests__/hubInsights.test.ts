// server/__tests__/hubInsights.test.ts
// Testes unitários para:
//   1. hubInsightsService.ts — motor de insights cross-produto
//   2. GET /api/v1/hub/insights — endpoint no hubInit router
// Valida: role-weights, cache TTL, tenant isolation, resilience, feature discovery

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import supertest from 'supertest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Intercept global fetch for product service calls
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

// Mock prisma
const prismaMock = {
  product: { findMany: vi.fn().mockResolvedValue([]) },
  produtoGravityConfiguracao: { findMany: vi.fn().mockResolvedValue([]) },
  user: { findUnique: vi.fn().mockResolvedValue(null), update: vi.fn().mockResolvedValue(null) },
}

vi.mock('../lib/prisma.js', () => ({ prisma: prismaMock }))

// Mock tenantService
const tenantServiceMock = {
  getTenantById: vi.fn().mockResolvedValue({ id: 'tenant-001', name: 'Acme Corp', slug: 'acme', status: 'ATIVO' }),
  getCompanies: vi.fn().mockResolvedValue([]),
}

vi.mock('../services/tenantService.js', () => ({ tenantService: tenantServiceMock }))

// Mock rate limiter
vi.mock('../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  rateLimitPresets: {
    admin: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  },
}))

// Mock requireAuth
const defaultAuth = {
  id_usuario: 'user-001',
  clerkUserId: 'clerk_001',
  id_organizacao: 'tenant-001',
  tipo_usuario: 'ADMIN',
}

let authOverride: Record<string, string> | null = null

vi.mock('../middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req.auth = authOverride ?? defaultAuth
    next()
  },
}))

// ─── App setup ──────────────────────────────────────────────────────────────

let app: express.Express
let request: ReturnType<typeof supertest>

beforeAll(async () => {
  const { hubRouter } = await import('../routes/hubInit.js')
  app = express()
  app.use(express.json())
  app.use('/api/v1/hub', hubRouter)

  interface HttpError extends Error { statusCode?: number; code?: string }
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({
      error: { code: err.code ?? 'INTERNAL', message: err.message },
    })
  })

  request = supertest(app)
})

beforeEach(() => {
  vi.clearAllMocks()
  authOverride = null
  prismaMock.product.findMany.mockResolvedValue([])
  prismaMock.produtoGravityConfiguracao.findMany.mockResolvedValue([])
  prismaMock.user.findUnique.mockResolvedValue(null)
  prismaMock.user.update.mockResolvedValue(null)
  tenantServiceMock.getTenantById.mockResolvedValue({ id: 'tenant-001', name: 'Acme Corp', slug: 'acme', status: 'ATIVO' })
  tenantServiceMock.getCompanies.mockResolvedValue([])

  // Default: all product fetches fail (resilience test)
  fetchMock.mockRejectedValue(new Error('service unavailable'))
})

afterEach(async () => {
  // Clear the insights cache between tests
  const { _testExports } = await import('../services/hubInsightsService.js')
  _testExports.insightsCache.clear()
})

// ─── GET /api/v1/hub/insights ───────────────────────────────────────────────

describe('GET /api/v1/hub/insights', () => {
  it('retorna 200 com insights array', async () => {
    const res = await request.get('/api/v1/hub/insights')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('insights')
    expect(Array.isArray(res.body.insights)).toBe(true)
    expect(res.body).toHaveProperty('count')
  })

  it('retorna fallback quando nenhum produto está ativo (mínimo 4)', async () => {
    prismaMock.produtoGravityConfiguracao.findMany.mockResolvedValue([])
    const res = await request.get('/api/v1/hub/insights')
    expect(res.status).toBe(200)
    // Com nenhum produto, deve retornar feature cards + fallbacks (mínimo 4)
    expect(res.body.insights.length).toBeGreaterThanOrEqual(4)
  })

  it('busca insights quando há produtos ativos', async () => {
    prismaMock.produtoGravityConfiguracao.findMany.mockResolvedValue([
      { chave_produto_config_produto_gravity: 'pedido', ativo_config_produto_gravity: true },
    ])

    // Mock fetch para o endpoint de KPIs do pedido
    fetchMock.mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('pedidos/dashboard/kpis')) {
        return {
          ok: true,
          json: async () => ({
            pedidos_atrasados: 5,
            pedidos_abertos: 10,
            total_pedidos: 50,
            pedidos_sem_exportador: 3,
            pedidos_cancelados: 2,
            valor_total: 150000,
            ticket_medio: 3000,
          }),
        }
      }
      throw new Error('not found')
    })

    const res = await request.get('/api/v1/hub/insights')
    expect(res.status).toBe(200)
    expect(res.body.insights.length).toBeGreaterThan(0)

    // Deve ter insight de pedidos atrasados
    const atrasados = res.body.insights.find((i: { id: string }) => i.id === 'pedidos_atrasados')
    expect(atrasados).toBeTruthy()
    expect(atrasados.variante).toBe('warn')
    expect(atrasados.produto).toBe('Pedido')
  })

  // ── Organizacao isolation ──

  it('filtra productConfig por tenant_id (tenant isolation)', async () => {
    await request.get('/api/v1/hub/insights')
    expect(prismaMock.produtoGravityConfiguracao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_organizacao_config_produto_gravity: 'tenant-001', ativo_config_produto_gravity: true },
      }),
    )
  })

  it('tenant diferente recebe dados isolados (cross-tenant)', async () => {
    authOverride = { id_usuario: 'user-999', clerkUserId: 'clerk_999', id_organizacao: 'tenant-999', tipo_usuario: 'ADMIN' }

    await request.get('/api/v1/hub/insights')
    expect(prismaMock.produtoGravityConfiguracao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_organizacao_config_produto_gravity: 'tenant-999', ativo_config_produto_gravity: true },
      }),
    )
  })

  // ── Role weights ──

  it('normaliza role para weights (SUPER_ADMIN → admin)', async () => {
    authOverride = { id_usuario: 'user-001', clerkUserId: 'clerk_001', id_organizacao: 'tenant-001', tipo_usuario: 'SUPER_ADMIN' }

    prismaMock.produtoGravityConfiguracao.findMany.mockResolvedValue([
      { chave_produto_config_produto_gravity: 'pedido', ativo_config_produto_gravity: true },
    ])

    fetchMock.mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('pedidos/dashboard/kpis')) {
        return {
          ok: true,
          json: async () => ({
            pedidos_atrasados: 3,
            pedidos_abertos: 5,
            total_pedidos: 20,
            pedidos_sem_exportador: 0,
            pedidos_cancelados: 0,
            valor_total: 50000,
            ticket_medio: 2500,
          }),
        }
      }
      throw new Error('not found')
    })

    const res = await request.get('/api/v1/hub/insights')
    expect(res.status).toBe(200)
    // Admin role should have all weights at 100 — atrasados should be high score
    const atrasados = res.body.insights.find((i: { id: string }) => i.id === 'pedidos_atrasados')
    expect(atrasados).toBeTruthy()
  })

  // ── Resilience ──

  it('retorna insights de fallback + context quando todos os produtos falham', async () => {
    prismaMock.produtoGravityConfiguracao.findMany.mockResolvedValue([
      { chave_produto_config_produto_gravity: 'pedido', ativo_config_produto_gravity: true },
      { chave_produto_config_produto_gravity: 'bid-cambio', ativo_config_produto_gravity: true },
    ])

    // All fetches fail
    fetchMock.mockRejectedValue(new Error('timeout'))

    const res = await request.get('/api/v1/hub/insights')
    expect(res.status).toBe(200)
    // Should return context insights + fallbacks (mínimo 4)
    expect(res.body.insights.length).toBeGreaterThanOrEqual(4)
    // Deve ter o insight de "produtos ativos" (context)
    const context = res.body.insights.find((i: { id: string }) => i.id === 'hub_produtos_ativos')
    expect(context).toBeTruthy()
  })

  it('retorna insights parciais quando apenas 1 produto falha', async () => {
    prismaMock.produtoGravityConfiguracao.findMany.mockResolvedValue([
      { chave_produto_config_produto_gravity: 'pedido', ativo_config_produto_gravity: true },
      { chave_produto_config_produto_gravity: 'bid-cambio', ativo_config_produto_gravity: true },
    ])

    fetchMock.mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('pedidos/dashboard/kpis')) {
        return {
          ok: true,
          json: async () => ({
            pedidos_atrasados: 5,
            pedidos_abertos: 10,
            total_pedidos: 50,
            pedidos_sem_exportador: 0,
            pedidos_cancelados: 0,
            valor_total: 0,
            ticket_medio: 0,
          }),
        }
      }
      // bid-cambio fails
      throw new Error('service unavailable')
    })

    const res = await request.get('/api/v1/hub/insights')
    expect(res.status).toBe(200)
    // Should have pedido insights but no cambio insights
    const pedido = res.body.insights.find((i: { id: string }) => i.id === 'pedidos_atrasados')
    expect(pedido).toBeTruthy()
    const cambio = res.body.insights.find((i: { id: string }) => i.id === 'cambio_vencimentos')
    expect(cambio).toBeFalsy()
  })

  it('retorna fallback resiliente quando productConfig falha', async () => {
    prismaMock.produtoGravityConfiguracao.findMany.mockRejectedValue(new Error('DB timeout'))

    const res = await request.get('/api/v1/hub/insights')
    expect(res.status).toBe(200)
    // Should return the error fallback
    expect(res.body.insights.length).toBeGreaterThanOrEqual(1)
    expect(res.body.insights[0].id).toBe('hub_error_fallback')
  })

  // ── Feature discovery ──

  it('inclui feature discovery cards quando há dados suficientes', async () => {
    prismaMock.produtoGravityConfiguracao.findMany.mockResolvedValue([
      { chave_produto_config_produto_gravity: 'pedido', ativo_config_produto_gravity: true },
    ])

    fetchMock.mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('pedidos/dashboard/kpis')) {
        return {
          ok: true,
          json: async () => ({
            pedidos_atrasados: 5,
            pedidos_abertos: 10,
            total_pedidos: 50,
            pedidos_sem_exportador: 3,
            pedidos_cancelados: 2,
            valor_total: 150000,
            ticket_medio: 3000,
          }),
        }
      }
      throw new Error('not found')
    })

    const res = await request.get('/api/v1/hub/insights')
    expect(res.status).toBe(200)
    // With enough data insights (>= 2), feature discovery cards should be interleaved
    const features = res.body.insights.filter((i: { id: string }) => i.id.startsWith('feat_'))
    expect(features.length).toBeGreaterThan(0)
    // Features should be for products NOT active (pedido is active, so no feat_pedido)
    expect(features.find((f: { id: string }) => f.id === 'feat_pedido')).toBeFalsy()
  })

  // ── Sorting ──

  it('retorna insights ordenados por score (descendente)', async () => {
    prismaMock.produtoGravityConfiguracao.findMany.mockResolvedValue([
      { chave_produto_config_produto_gravity: 'pedido', ativo_config_produto_gravity: true },
    ])

    fetchMock.mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('pedidos/dashboard/kpis')) {
        return {
          ok: true,
          json: async () => ({
            pedidos_atrasados: 5,
            pedidos_abertos: 10,
            total_pedidos: 50,
            pedidos_sem_exportador: 3,
            pedidos_cancelados: 2,
            valor_total: 150000,
            ticket_medio: 3000,
          }),
        }
      }
      throw new Error('not found')
    })

    const res = await request.get('/api/v1/hub/insights')
    const insights = res.body.insights.filter((i: { id: string }) => !i.id.startsWith('feat_'))
    for (let i = 0; i < insights.length - 1; i++) {
      expect(insights[i].score).toBeGreaterThanOrEqual(insights[i + 1].score)
    }
  })
})

// ─── Unit tests: hubInsightsService ─────────────────────────────────────────

describe('hubInsightsService', () => {
  describe('normalizeHubRole', () => {
    it('normaliza SUPER_ADMIN para admin', async () => {
      const { normalizeHubRole } = await import('../services/hubInsightsService.js')
      expect(normalizeHubRole('SUPER_ADMIN')).toBe('admin')
    })

    it('normaliza ADMIN para admin', async () => {
      const { normalizeHubRole } = await import('../services/hubInsightsService.js')
      expect(normalizeHubRole('ADMIN')).toBe('admin')
    })

    it('normaliza PADRAO para operador', async () => {
      const { normalizeHubRole } = await import('../services/hubInsightsService.js')
      expect(normalizeHubRole('PADRAO')).toBe('operador')
    })

    it('normaliza undefined para default', async () => {
      const { normalizeHubRole } = await import('../services/hubInsightsService.js')
      expect(normalizeHubRole(undefined)).toBe('default')
    })

    it('normaliza gerente para gerente', async () => {
      const { normalizeHubRole } = await import('../services/hubInsightsService.js')
      expect(normalizeHubRole('gerente')).toBe('gerente')
    })

    it('normaliza DIRECTOR para diretor', async () => {
      const { normalizeHubRole } = await import('../services/hubInsightsService.js')
      expect(normalizeHubRole('DIRECTOR')).toBe('diretor')
    })
  })

  describe('cache isolation', () => {
    it('cache key inclui tenant_id (isolamento)', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      _testExports.setCache('tenant-A', 'user-1', [{ id: 'a', variante: 'default', tag: 'A', texto: 'A', score: 1 }])
      _testExports.setCache('tenant-B', 'user-1', [{ id: 'b', variante: 'default', tag: 'B', texto: 'B', score: 1 }])

      const cacheA = _testExports.getCached('tenant-A', 'user-1')
      const cacheB = _testExports.getCached('tenant-B', 'user-1')

      expect(cacheA).not.toBeNull()
      expect(cacheA?.[0]?.id).toBe('a')
      expect(cacheB).not.toBeNull()
      expect(cacheB?.[0]?.id).toBe('b')
    })

    it('cache retorna null para tenant inexistente', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const result = _testExports.getCached('tenant-inexistente', 'user-1')
      expect(result).toBeNull()
    })

    it('cache expira após TTL', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      _testExports.setCache('tenant-ttl', 'user-1', [{ id: 'ttl', variante: 'default', tag: 'TTL', texto: 'T', score: 1 }])

      // Manually expire by modifying the entry timestamp
      const entry = _testExports.insightsCache.get('tenant-ttl:user-1')
      if (entry) {
        entry.timestamp = Date.now() - _testExports.CACHE_TTL_MS - 1
      }

      const result = _testExports.getCached('tenant-ttl', 'user-1')
      expect(result).toBeNull()
    })
  })

  describe('feature discovery', () => {
    it('gera cards para produtos não ativos', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const cards = _testExports.buildHubFeatureDiscovery(new Set())
      // Com nenhum produto ativo, deve ter feature discovery para todos
      expect(cards.length).toBeGreaterThan(0)
      expect(cards.every(c => c.id.startsWith('feat_'))).toBe(true)
    })

    it('não gera card para produto já ativo', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const cards = _testExports.buildHubFeatureDiscovery(new Set(['simula-custo', 'bid-cambio', 'bid-frete', 'pedido']))
      // Nenhum card para produtos já ativos
      expect(cards.find(c => c.id === 'feat_simula_custo')).toBeFalsy()
      expect(cards.find(c => c.id === 'feat_bid_cambio')).toBeFalsy()
      expect(cards.find(c => c.id === 'feat_bid_frete')).toBeFalsy()
      expect(cards.find(c => c.id === 'feat_pedido')).toBeFalsy()
    })
  })

  describe('role weights', () => {
    it('admin tem todos os pesos em 100', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const adminWeights = _testExports.HUB_ROLE_WEIGHTS.admin
      for (const value of Object.values(adminWeights)) {
        expect(value).toBe(100)
      }
    })

    it('operador prioriza atrasados e lpco', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const opWeights = _testExports.HUB_ROLE_WEIGHTS.operador
      expect(opWeights.pedidos_atrasados).toBe(100)
      expect(opWeights.lpco_suspensas).toBe(95)
    })

    it('diretor prioriza financeiro e economia', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const dirWeights = _testExports.HUB_ROLE_WEIGHTS.diretor
      expect(dirWeights.pedidos_financeiro).toBe(100)
      expect(dirWeights.cambio_economia).toBe(100)
    })
  })

  describe('context insights', () => {
    it('gera insight de "produtos ativos" quando há produtos', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const cards = _testExports.buildContextInsights(new Set(['pedido', 'bid-cambio']))
      const prodAtivos = cards.find(c => c.id === 'hub_produtos_ativos')
      expect(prodAtivos).toBeTruthy()
      expect(prodAtivos?.texto).toContain('2 produtos ativos')
    })

    it('gera insight cross quando simula-custo + bid-cambio ativos', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const cards = _testExports.buildContextInsights(new Set(['simula-custo', 'bid-cambio']))
      const cross = cards.find(c => c.id === 'hub_cross_simula_cambio')
      expect(cross).toBeTruthy()
    })

    it('gera insight cross quando pedido + lpco ativos', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const cards = _testExports.buildContextInsights(new Set(['pedido', 'lpco']))
      const cross = cards.find(c => c.id === 'hub_cross_pedido_lpco')
      expect(cross).toBeTruthy()
    })

    it('não gera nada quando nenhum produto ativo', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const cards = _testExports.buildContextInsights(new Set())
      expect(cards).toHaveLength(0)
    })
  })

  describe('fallback insights', () => {
    it('tem no mínimo 5 fallbacks definidos', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      expect(_testExports.FALLBACK_INSIGHTS.length).toBeGreaterThanOrEqual(5)
    })

    it('fallbacks têm IDs únicos', async () => {
      const { _testExports } = await import('../services/hubInsightsService.js')
      const ids = _testExports.FALLBACK_INSIGHTS.map(f => f.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })
})
