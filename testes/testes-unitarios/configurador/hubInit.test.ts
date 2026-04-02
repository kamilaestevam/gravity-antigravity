/**
 * Testes unitários — endpoint GET /api/v1/hub/init
 * Localização: testes/testes-unitarios/configurador/hubInit.test.ts
 *
 * Valida que o endpoint agregado retorna companies, tenant, products e catalog
 * numa única chamada, com resiliência quando produtos falham.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ── Mocks ── */
const mockTenant = {
  id: 'tenant-1',
  name: 'DMM Importação',
  slug: 'dmm',
  status: 'ACTIVE',
  subscriptions: [{ status: 'TRIALING', trial_ends_at: new Date() }],
  _count: { users: 3, companies: 2 },
}

const mockCompanies = [
  { id: 'comp-1', name: 'DMM Importação', subdomain: null, cnpj: null, status: 'ACTIVE', created_at: new Date(), _count: { memberships: 2 } },
  { id: 'comp-2', name: 'Fiação Fides', subdomain: null, cnpj: null, status: 'ACTIVE', created_at: new Date(), _count: { memberships: 1 } },
]

const mockConfigs = [
  { product_key: 'simula-custo', is_active: true, config: {}, created_at: new Date() },
  { product_key: 'bid-frete', is_active: false, config: {}, created_at: new Date() },
]

const mockCatalog = [
  { id: 'p1', name: 'SimulaCusto', slug: 'simula-custo', description: 'Cálculo fiscal', status: 'ACTIVE' },
  { id: 'p2', name: 'BID Frete', slug: 'bid-frete', description: 'Cotação frete', status: 'ACTIVE' },
  { id: 'p3', name: 'Smart Read', slug: 'smart-read', description: null, status: 'COMING_SOON' },
]

// Mock prisma
const mockPrisma = {
  productConfig: {
    findMany: vi.fn().mockResolvedValue(mockConfigs),
  },
  product: {
    findMany: vi.fn().mockResolvedValue(mockCatalog),
  },
}

// Mock tenantService
const mockTenantService = {
  getTenantById: vi.fn().mockResolvedValue(mockTenant),
  getCompanies: vi.fn().mockResolvedValue(mockCompanies),
}

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: mockPrisma,
}))

vi.mock('../../../servicos-global/configurador/server/services/tenantService.js', () => ({
  tenantService: mockTenantService,
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (_req: any, _res: any, next: any) => {
    _req.auth = { userId: 'user-1', tenantId: 'tenant-1', clerkUserId: 'clerk-1' }
    next()
  },
}))

/* ── Helper para simular request/response Express ── */
function createMockReqRes() {
  const req: any = {
    auth: { userId: 'user-1', tenantId: 'tenant-1', clerkUserId: 'clerk-1' },
    headers: { authorization: 'Bearer mock-token' },
    path: '/init',
  }
  const jsonData: any = {}
  const res: any = {
    json: vi.fn((data: any) => { Object.assign(jsonData, data) }),
    status: vi.fn().mockReturnThis(),
  }
  const next = vi.fn()
  return { req, res, next, jsonData }
}

/* ── Testes ── */

describe('GET /api/v1/hub/init', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTenantService.getTenantById.mockResolvedValue(mockTenant)
    mockTenantService.getCompanies.mockResolvedValue(mockCompanies)
    mockPrisma.productConfig.findMany.mockResolvedValue(mockConfigs)
    mockPrisma.product.findMany.mockResolvedValue(mockCatalog)
  })

  it('retorna tenant, companies, products e catalog', async () => {
    const { hubRouter } = await import('../../../servicos-global/configurador/server/routes/hubInit.js')

    // Extrair o handler (requireAuth + async handler)
    const layer = (hubRouter as any).stack?.find((l: any) => l.route?.path === '/init')
    const handler = layer?.route?.stack?.at(-1)?.handle

    expect(handler).toBeDefined()

    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    const data = res.json.mock.calls[0][0]

    // Tenant
    expect(data.tenant).toBeDefined()
    expect(data.tenant.name).toBe('DMM Importação')
    expect(data.tenant.subscriptions).toHaveLength(1)

    // Companies
    expect(data.companies).toHaveLength(2)
    expect(data.companies[0].name).toBe('DMM Importação')
    expect(data.companies[1].name).toBe('Fiação Fides')

    // Products (enriquecidos com catálogo)
    expect(data.products).toHaveLength(2)
    expect(data.products[0].product_key).toBe('simula-custo')
    expect(data.products[0].is_active).toBe(true)
    expect(data.products[0].catalog).toBeDefined()
    expect(data.products[0].catalog.name).toBe('SimulaCusto')

    // Catálogo completo
    expect(data.catalog).toHaveLength(3)
    expect(data.catalog.map((p: any) => p.slug)).toContain('smart-read')
  })

  it('retorna companies mesmo quando productConfig falha', async () => {
    mockPrisma.productConfig.findMany.mockRejectedValue(new Error('DB error'))

    const { hubRouter } = await import('../../../servicos-global/configurador/server/routes/hubInit.js')
    const layer = (hubRouter as any).stack?.find((l: any) => l.route?.path === '/init')
    const handler = layer?.route?.stack?.at(-1)?.handle

    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    const data = res.json.mock.calls[0][0]
    expect(data.companies).toHaveLength(2)
    expect(data.products).toHaveLength(0) // fallback vazio
    expect(data.tenant.name).toBe('DMM Importação')
  })

  it('retorna companies mesmo quando catalog falha', async () => {
    mockPrisma.product.findMany.mockRejectedValue(new Error('DB error'))

    const { hubRouter } = await import('../../../servicos-global/configurador/server/routes/hubInit.js')
    const layer = (hubRouter as any).stack?.find((l: any) => l.route?.path === '/init')
    const handler = layer?.route?.stack?.at(-1)?.handle

    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    const data = res.json.mock.calls[0][0]
    expect(data.companies).toHaveLength(2)
    expect(data.catalog).toHaveLength(0) // fallback vazio
  })

  it('chama tenantService com o tenantId correto', async () => {
    const { hubRouter } = await import('../../../servicos-global/configurador/server/routes/hubInit.js')
    const layer = (hubRouter as any).stack?.find((l: any) => l.route?.path === '/init')
    const handler = layer?.route?.stack?.at(-1)?.handle

    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    expect(mockTenantService.getTenantById).toHaveBeenCalledWith('tenant-1')
    expect(mockTenantService.getCompanies).toHaveBeenCalledWith('tenant-1')
    expect(mockPrisma.productConfig.findMany).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-1' },
      orderBy: { created_at: 'desc' },
    })
  })

  it('product sem match no catálogo retorna catalog: null', async () => {
    mockPrisma.productConfig.findMany.mockResolvedValue([
      { product_key: 'inexistente', is_active: true, config: {}, created_at: new Date() },
    ])

    const { hubRouter } = await import('../../../servicos-global/configurador/server/routes/hubInit.js')
    const layer = (hubRouter as any).stack?.find((l: any) => l.route?.path === '/init')
    const handler = layer?.route?.stack?.at(-1)?.handle

    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    const data = res.json.mock.calls[0][0]
    expect(data.products[0].catalog).toBeNull()
  })

  it('retorna companies vazio quando tenant não tem empresas', async () => {
    mockTenantService.getCompanies.mockResolvedValue([])

    const { hubRouter } = await import('../../../servicos-global/configurador/server/routes/hubInit.js')
    const layer = (hubRouter as any).stack?.find((l: any) => l.route?.path === '/init')
    const handler = layer?.route?.stack?.at(-1)?.handle

    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    const data = res.json.mock.calls[0][0]
    expect(data.companies).toHaveLength(0)
    expect(data.tenant).toBeDefined()
  })
})
