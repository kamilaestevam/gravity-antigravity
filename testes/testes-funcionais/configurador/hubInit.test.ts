// @vitest-environment node
// testes/testes-funcionais/configurador/hubInit.test.ts
// Testes funcionais — GET /api/v1/hub/init (endpoint agregado)
//
// Valida o contrato HTTP do endpoint que carrega todos os dados do hub
// numa única chamada: tenant, companies, products, catalog.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { hubRouter } from '../../../servicos-global/configurador/server/routes/hubInit.js'
import { errorHandler } from '../../../servicos-global/configurador/server/middleware/errorHandler.js'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (
    req: { auth: { tenantId: string; userId: string; clerkUserId: string } },
    _res: unknown,
    next: () => void
  ) => {
    req.auth = { tenantId: 'tenant-001', userId: 'user-001', clerkUserId: 'clerk-001' }
    next()
  },
}))

const mockGetTenantById = vi.fn()
const mockGetCompanies = vi.fn()
vi.mock('../../../servicos-global/configurador/server/services/tenantService.js', () => ({
  tenantService: {
    getTenantById: (...args: unknown[]) => mockGetTenantById(...args),
    getCompanies: (...args: unknown[]) => mockGetCompanies(...args),
  },
}))

const mockProductConfigFindMany = vi.fn()
const mockProductFindMany = vi.fn()
vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    productConfig: { findMany: (...args: unknown[]) => mockProductConfigFindMany(...args) },
    product: { findMany: (...args: unknown[]) => mockProductFindMany(...args) },
  },
}))

// ─── App de teste ───────────────────────────────────────────────────────────

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/hub', hubRouter)
  app.use(errorHandler)
  return app
}

// ─── Dados de teste ─────────────────────────────────────────────────────────

const TENANT = {
  id: 'tenant-001',
  name: 'DMM Importação',
  slug: 'dmm',
  status: 'ACTIVE',
  subscriptions: [{ status: 'TRIALING', trial_ends_at: new Date() }],
  _count: { users: 3, companies: 2 },
}

const COMPANIES = [
  { id: 'comp-1', name: 'DMM Importação', subdomain: null, cnpj: '12345678000100', status: 'ACTIVE', created_at: new Date(), _count: { memberships: 3 } },
  { id: 'comp-2', name: 'Fiação Fides', subdomain: 'fides', cnpj: null, status: 'ACTIVE', created_at: new Date(), _count: { memberships: 1 } },
]

const PRODUCT_CONFIGS = [
  { product_key: 'simula-custo', is_active: true, config: {}, created_at: new Date() },
  { product_key: 'bid-frete', is_active: false, config: {}, created_at: new Date() },
]

const CATALOG = [
  { id: 'p1', name: 'SimulaCusto', slug: 'simula-custo', description: 'Cálculo fiscal', status: 'ACTIVE' },
  { id: 'p2', name: 'BID Frete', slug: 'bid-frete', description: 'Cotação frete', status: 'ACTIVE' },
  { id: 'p3', name: 'Smart Read', slug: 'smart-read', description: null, status: 'COMING_SOON' },
]

// ─── Testes ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockGetTenantById.mockResolvedValue(TENANT)
  mockGetCompanies.mockResolvedValue(COMPANIES)
  mockProductConfigFindMany.mockResolvedValue(PRODUCT_CONFIGS)
  mockProductFindMany.mockResolvedValue(CATALOG)
})

describe('GET /api/v1/hub/init', () => {
  it('retorna 200 com tenant, companies, products e catalog', async () => {
    const app = buildApp()
    const res = await request(app).get('/api/v1/hub/init')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('tenant')
    expect(res.body).toHaveProperty('companies')
    expect(res.body).toHaveProperty('products')
    expect(res.body).toHaveProperty('catalog')
  })

  it('retorna tenant com subscriptions e _count', async () => {
    const app = buildApp()
    const res = await request(app).get('/api/v1/hub/init')

    expect(res.body.tenant.name).toBe('DMM Importação')
    expect(res.body.tenant.subscriptions).toHaveLength(1)
    expect(res.body.tenant._count.users).toBe(3)
    expect(res.body.tenant._count.companies).toBe(2)
  })

  it('retorna companies com nome, status e memberships', async () => {
    const app = buildApp()
    const res = await request(app).get('/api/v1/hub/init')

    expect(res.body.companies).toHaveLength(2)
    expect(res.body.companies[0].name).toBe('DMM Importação')
    expect(res.body.companies[0].status).toBe('ACTIVE')
    expect(res.body.companies[0]._count.memberships).toBe(3)
    expect(res.body.companies[1].name).toBe('Fiação Fides')
  })

  it('retorna products enriquecidos com catalog', async () => {
    const app = buildApp()
    const res = await request(app).get('/api/v1/hub/init')

    expect(res.body.products).toHaveLength(2)
    expect(res.body.products[0].product_key).toBe('simula-custo')
    expect(res.body.products[0].is_active).toBe(true)
    expect(res.body.products[0].catalog.name).toBe('SimulaCusto')
    expect(res.body.products[1].product_key).toBe('bid-frete')
    expect(res.body.products[1].catalog.name).toBe('BID Frete')
  })

  it('retorna catalog completo', async () => {
    const app = buildApp()
    const res = await request(app).get('/api/v1/hub/init')

    expect(res.body.catalog).toHaveLength(3)
    expect(res.body.catalog.map((p: { slug: string }) => p.slug)).toEqual(
      expect.arrayContaining(['simula-custo', 'bid-frete', 'smart-read'])
    )
  })

  it('chama tenantService com o tenantId do auth', async () => {
    const app = buildApp()
    await request(app).get('/api/v1/hub/init')

    expect(mockGetTenantById).toHaveBeenCalledWith('tenant-001')
    expect(mockGetCompanies).toHaveBeenCalledWith('tenant-001')
  })

  it('filtra productConfig pelo tenant_id', async () => {
    const app = buildApp()
    await request(app).get('/api/v1/hub/init')

    expect(mockProductConfigFindMany).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-001' },
      orderBy: { created_at: 'desc' },
    })
  })

  // ─── Resiliência ──────────────────────────────────────────────────────────

  it('retorna companies mesmo quando productConfig falha', async () => {
    mockProductConfigFindMany.mockRejectedValue(new Error('DB error'))

    const app = buildApp()
    const res = await request(app).get('/api/v1/hub/init')

    expect(res.status).toBe(200)
    expect(res.body.companies).toHaveLength(2)
    expect(res.body.products).toHaveLength(0)
    expect(res.body.tenant.name).toBe('DMM Importação')
  })

  it('retorna companies mesmo quando catalog falha', async () => {
    mockProductFindMany.mockRejectedValue(new Error('DB error'))

    const app = buildApp()
    const res = await request(app).get('/api/v1/hub/init')

    expect(res.status).toBe(200)
    expect(res.body.companies).toHaveLength(2)
    expect(res.body.catalog).toHaveLength(0)
  })

  it('retorna product com catalog: null quando slug não existe no catálogo', async () => {
    mockProductConfigFindMany.mockResolvedValue([
      { product_key: 'produto-fantasma', is_active: true, config: {}, created_at: new Date() },
    ])

    const app = buildApp()
    const res = await request(app).get('/api/v1/hub/init')

    expect(res.body.products[0].product_key).toBe('produto-fantasma')
    expect(res.body.products[0].catalog).toBeNull()
  })

  it('retorna companies vazio quando tenant não tem empresas', async () => {
    mockGetCompanies.mockResolvedValue([])

    const app = buildApp()
    const res = await request(app).get('/api/v1/hub/init')

    expect(res.status).toBe(200)
    expect(res.body.companies).toHaveLength(0)
    expect(res.body.tenant).toBeDefined()
  })

  it('retorna 500 quando tenantService falha', async () => {
    mockGetTenantById.mockRejectedValue(new Error('Tenant DB down'))

    const app = buildApp()
    const res = await request(app).get('/api/v1/hub/init')

    expect(res.status).toBe(500)
  })
})
