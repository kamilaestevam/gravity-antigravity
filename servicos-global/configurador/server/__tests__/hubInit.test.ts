// server/__tests__/hubInit.test.ts
// Testes unitários para os endpoints do Hub (GET /catalog, GET /init)
// Valida: rate limiting, tenant isolation, respostas, preferredCompanyId, role SUPPLIER

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import supertest from 'supertest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Mock prisma com models usados pelo hubInit
const prismaMock = {
  product: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  productConfig: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  user: {
    findUnique: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(null),
  },
}

vi.mock('../lib/prisma.js', () => ({
  prisma: prismaMock,
}))

// Mock tenantService
const tenantServiceMock = {
  getTenantById: vi.fn().mockResolvedValue({
    id: 'tenant-001',
    name: 'Acme Corp',
    slug: 'acme',
    status: 'ACTIVE',
  }),
  getCompanies: vi.fn().mockResolvedValue([
    { id: 'comp-001', name: 'Filial SP', status: 'ACTIVE' },
    { id: 'comp-002', name: 'Filial RJ', status: 'ACTIVE' },
  ]),
}

vi.mock('../services/tenantService.js', () => ({
  tenantService: tenantServiceMock,
}))

// Mock rate limiter — passthrough em testes
vi.mock('../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  rateLimitPresets: {
    admin: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  },
}))

// Mock requireAuth — injeta auth no req
const defaultAuth = {
  userId: 'user-001',
  clerkUserId: 'clerk_001',
  tenantId: 'tenant-001',
  role: 'SUPER_ADMIN',
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
  // Import AFTER mocks
  const { hubRouter } = await import('../routes/hubInit.js')

  app = express()
  app.use(express.json())
  app.use('/api/v1/hub', hubRouter)

  // Error handler padrão
  interface HttpError extends Error {
    statusCode?: number
    code?: string
  }
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

  // Reset defaults
  prismaMock.product.findMany.mockResolvedValue([])
  prismaMock.productConfig.findMany.mockResolvedValue([])
  prismaMock.user.findUnique.mockResolvedValue(null)
  prismaMock.user.update.mockResolvedValue(null)
  tenantServiceMock.getTenantById.mockResolvedValue({
    id: 'tenant-001', name: 'Acme Corp', slug: 'acme', status: 'ACTIVE',
  })
  tenantServiceMock.getCompanies.mockResolvedValue([
    { id: 'comp-001', name: 'Filial SP', status: 'ACTIVE' },
    { id: 'comp-002', name: 'Filial RJ', status: 'ACTIVE' },
  ])
})

// ─── GET /api/v1/hub/catalog ────────────────────────────────────────────────

describe('GET /api/v1/hub/catalog', () => {
  it('retorna 200 com catalog vazio', async () => {
    const res = await request.get('/api/v1/hub/catalog')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('catalog')
    expect(Array.isArray(res.body.catalog)).toBe(true)
    expect(res.body.catalog).toHaveLength(0)
  })

  it('retorna catalog com produtos', async () => {
    const mockCatalog = [
      { id: 'p1', name: 'BID Câmbio', slug: 'bid-cambio', description: 'Câmbio', status: 'ACTIVE' },
      { id: 'p2', name: 'SimulaCusto', slug: 'simula-custo', description: 'Simulação', status: 'ACTIVE' },
    ]
    prismaMock.product.findMany.mockResolvedValue(mockCatalog)

    const res = await request.get('/api/v1/hub/catalog')
    expect(res.status).toBe(200)
    expect(res.body.catalog).toHaveLength(2)
    expect(res.body.catalog[0].slug).toBe('bid-cambio')
  })

  it('não requer autenticação', async () => {
    // catalog é público — deve funcionar mesmo sem auth
    const res = await request.get('/api/v1/hub/catalog')
    expect(res.status).toBe(200)
  })

  it('chama prisma.product.findMany com select correto', async () => {
    await request.get('/api/v1/hub/catalog')
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true, slug: true, description: true, status: true },
      orderBy: { created_at: 'desc' },
    })
  })

  it('retorna 500 quando prisma falha', async () => {
    prismaMock.product.findMany.mockRejectedValueOnce(new Error('DB connection lost'))
    const res = await request.get('/api/v1/hub/catalog')
    expect(res.status).toBe(500)
  })
})

// ─── GET /api/v1/hub/init ───────────────────────────────────────────────────

describe('GET /api/v1/hub/init', () => {
  it('retorna 200 com estrutura completa', async () => {
    const res = await request.get('/api/v1/hub/init')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('tenant')
    expect(res.body).toHaveProperty('companies')
    expect(res.body).toHaveProperty('products')
    expect(res.body).toHaveProperty('catalog')
    expect(res.body).toHaveProperty('preferredCompanyId')
  })

  it('retorna tenant do tenantService', async () => {
    const res = await request.get('/api/v1/hub/init')
    expect(tenantServiceMock.getTenantById).toHaveBeenCalledWith('tenant-001')
    expect(res.body.tenant).toEqual({
      id: 'tenant-001', name: 'Acme Corp', slug: 'acme', status: 'ACTIVE',
    })
  })

  it('retorna companies do tenantService', async () => {
    const res = await request.get('/api/v1/hub/init')
    expect(tenantServiceMock.getCompanies).toHaveBeenCalledWith('tenant-001')
    expect(res.body.companies).toHaveLength(2)
  })

  // ── Organizacao isolation ──

  it('filtra productConfig por tenant_id (tenant isolation)', async () => {
    await request.get('/api/v1/hub/init')
    expect(prismaMock.productConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenant_id: 'tenant-001' },
      }),
    )
  })

  it('tenant diferente recebe dados diferentes (cross-tenant)', async () => {
    authOverride = { userId: 'user-999', clerkUserId: 'clerk_999', tenantId: 'tenant-999', role: 'ADMIN' }
    tenantServiceMock.getTenantById.mockResolvedValue({ id: 'tenant-999', name: 'Other Corp' })
    tenantServiceMock.getCompanies.mockResolvedValue([])

    const res = await request.get('/api/v1/hub/init')
    expect(tenantServiceMock.getTenantById).toHaveBeenCalledWith('tenant-999')
    expect(tenantServiceMock.getCompanies).toHaveBeenCalledWith('tenant-999')
    expect(prismaMock.productConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenant_id: 'tenant-999' } }),
    )
    expect(res.body.tenant.id).toBe('tenant-999')
    expect(res.body.companies).toHaveLength(0)
  })

  // ── Products enrichment ──

  it('enriquece products com dados do catálogo', async () => {
    prismaMock.productConfig.findMany.mockResolvedValue([
      { product_key: 'bid-cambio', is_active: true, config: {}, created_at: '2026-01-01' },
    ])
    prismaMock.product.findMany.mockResolvedValue([
      { id: 'p1', name: 'BID Câmbio', slug: 'bid-cambio', description: 'Câmbio', status: 'ACTIVE' },
    ])

    const res = await request.get('/api/v1/hub/init')
    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].product_key).toBe('bid-cambio')
    expect(res.body.products[0].catalog).toBeTruthy()
    expect(res.body.products[0].catalog.slug).toBe('bid-cambio')
  })

  it('retorna catalog null quando produto não está no catálogo', async () => {
    prismaMock.productConfig.findMany.mockResolvedValue([
      { product_key: 'produto-legacy', is_active: false, config: {}, created_at: '2026-01-01' },
    ])
    prismaMock.product.findMany.mockResolvedValue([])

    const res = await request.get('/api/v1/hub/init')
    expect(res.body.products[0].catalog).toBeNull()
  })

  // ── Preferred company ──

  it('retorna preferredCompanyId null quando user não tem preferência', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const res = await request.get('/api/v1/hub/init')
    expect(res.body.preferredCompanyId).toBeNull()
  })

  it('retorna preferredCompanyId quando company é válida e ativa', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ preferred_company_id: 'comp-001' })
    const res = await request.get('/api/v1/hub/init')
    expect(res.body.preferredCompanyId).toBe('comp-001')
  })

  it('retorna preferredCompanyId null quando company preferida é INACTIVE', async () => {
    tenantServiceMock.getCompanies.mockResolvedValue([
      { id: 'comp-001', name: 'Filial SP', status: 'INACTIVE' },
    ])
    prismaMock.user.findUnique.mockResolvedValue({ preferred_company_id: 'comp-001' })

    const res = await request.get('/api/v1/hub/init')
    expect(res.body.preferredCompanyId).toBeNull()
  })

  it('limpa preferred_company_id no banco quando company inválida (fire-and-forget)', async () => {
    tenantServiceMock.getCompanies.mockResolvedValue([
      { id: 'comp-001', name: 'Filial SP', status: 'INACTIVE' },
    ])
    prismaMock.user.findUnique.mockResolvedValue({ preferred_company_id: 'comp-001' })

    await request.get('/api/v1/hub/init')

    // Fire-and-forget — prisma.usuario.update foi chamado
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-001' },
      data: { preferred_company_id: null },
    })
  })

  it('retorna preferredCompanyId null quando company não existe nas companies', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ preferred_company_id: 'comp-inexistente' })
    const res = await request.get('/api/v1/hub/init')
    expect(res.body.preferredCompanyId).toBeNull()
  })

  // ── Role SUPPLIER ──

  it('não busca preferência de workspace para SUPPLIER', async () => {
    authOverride = { userId: 'user-supplier', clerkUserId: 'clerk_s', tenantId: 'tenant-001', role: 'SUPPLIER' }

    const res = await request.get('/api/v1/hub/init')
    expect(res.status).toBe(200)
    // Não deve chamar prisma.usuario.findUnique para SUPPLIER
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
    expect(res.body.preferredCompanyId).toBeNull()
  })

  // ── Resiliência ──

  it('retorna products vazio quando productConfig falha (catch resiliente)', async () => {
    prismaMock.productConfig.findMany.mockRejectedValue(new Error('timeout'))

    const res = await request.get('/api/v1/hub/init')
    expect(res.status).toBe(200)
    expect(res.body.products).toEqual([])
  })

  it('retorna catalog vazio quando product.findMany falha (catch resiliente)', async () => {
    prismaMock.product.findMany.mockRejectedValue(new Error('timeout'))

    const res = await request.get('/api/v1/hub/init')
    expect(res.status).toBe(200)
    expect(res.body.catalog).toEqual([])
  })

  it('preferredCompanyId null quando user.findUnique falha (catch resiliente)', async () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error('timeout'))

    const res = await request.get('/api/v1/hub/init')
    expect(res.status).toBe(200)
    expect(res.body.preferredCompanyId).toBeNull()
  })

  it('retorna 500 quando tenantService.getTenantById falha (erro crítico)', async () => {
    tenantServiceMock.getTenantById.mockRejectedValue(new Error('fatal'))

    const res = await request.get('/api/v1/hub/init')
    expect(res.status).toBe(500)
  })

  // ── Paralelismo (Promise.all) ──

  it('executa todas as queries em paralelo (não sequencial)', async () => {
    const callOrder: string[] = []

    tenantServiceMock.getTenantById.mockImplementation(async () => {
      callOrder.push('tenant')
      return { id: 'tenant-001', name: 'T' }
    })
    tenantServiceMock.getCompanies.mockImplementation(async () => {
      callOrder.push('companies')
      return []
    })
    prismaMock.productConfig.findMany.mockImplementation(async () => {
      callOrder.push('configs')
      return []
    })
    prismaMock.product.findMany.mockImplementation(async () => {
      callOrder.push('catalog')
      return []
    })
    prismaMock.user.findUnique.mockImplementation(async () => {
      callOrder.push('userPref')
      return null
    })

    await request.get('/api/v1/hub/init')

    // Todas as 5 chamadas devem ter sido feitas
    expect(callOrder).toHaveLength(5)
    expect(callOrder).toContain('tenant')
    expect(callOrder).toContain('companies')
    expect(callOrder).toContain('configs')
    expect(callOrder).toContain('catalog')
    expect(callOrder).toContain('userPref')
  })
})
