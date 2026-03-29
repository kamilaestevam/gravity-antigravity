// @vitest-environment node
// testes/testes-funcionais/configurador/tenantProducts.test.ts
// Testes funcionais — ativacao/desativacao de produtos por tenant (gravity_admin)
//
// Rotas testadas:
//   GET  /api/admin/tenants/:tenantId/products                         — lista produtos do tenant
//   POST /api/admin/tenants/:tenantId/products/:productKey/activate    — ativa produto
//   POST /api/admin/tenants/:tenantId/products/:productKey/deactivate  — desativa produto

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { tenantProductsRouter } from '../../../servicos-global/configurador/server/routes/tenantProducts.js'
import { errorHandler } from '../../../servicos-global/configurador/server/middleware/errorHandler.js'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  tenant: {
    findUnique: vi.fn(),
  },
  productConfig: {
    findMany: vi.fn(),
  },
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: mockPrisma,
}))

const mockProductConfigService = vi.hoisted(() => ({
  getConfig: vi.fn(),
  upsertConfig: vi.fn(),
  listActiveProducts: vi.fn(),
  disableProduct: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/services/productConfigService.js', () => ({
  productConfigService: mockProductConfigService,
}))

// Mock requireAuth — simula usuario autenticado
vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (
    req: Record<string, unknown>,
    _res: unknown,
    next: () => void
  ) => {
    req.auth = { clerkUserId: 'admin-user-001' }
    next()
  },
}))

// Mock requireGravityAdmin — passa direto
vi.mock('../../../servicos-global/configurador/server/middleware/requireGravityAdmin.js', () => ({
  requireGravityAdmin: (
    _req: unknown,
    _res: unknown,
    next: () => void
  ) => next(),
}))

// ─── App de teste isolado ────────────────────────────────────────────────────

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/admin/tenants', tenantProductsRouter)
  app.use(errorHandler)
  return app
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const TENANT_FIXTURE = {
  id: 'tenant-001',
  name: 'Empresa Teste Ltda',
}

const PRODUCT_CONFIG_FIXTURE = {
  id: 'pc-001',
  tenant_id: 'tenant-001',
  product_key: 'simula-custo',
  is_active: true,
  config: { maxSimulations: 100 },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const UPSERT_RESULT = {
  id: 'pc-001',
  tenant_id: 'tenant-001',
  product_key: 'simula-custo',
  is_active: true,
  config: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// ─── GET /api/admin/tenants/:tenantId/products ──────────────────────────────

describe('GET /api/admin/tenants/:tenantId/products — lista produtos do tenant', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — lista produtos ativados para o tenant', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValueOnce(TENANT_FIXTURE)
    mockPrisma.productConfig.findMany.mockResolvedValueOnce([PRODUCT_CONFIG_FIXTURE])

    const res = await request(app).get('/api/admin/tenants/tenant-001/products')

    expect(res.status).toBe(200)
    expect(res.body.tenant_id).toBe('tenant-001')
    expect(res.body.tenant_name).toBe('Empresa Teste Ltda')
    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].product_key).toBe('simula-custo')
  })

  it('200 — tenant sem produtos ativados', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValueOnce(TENANT_FIXTURE)
    mockPrisma.productConfig.findMany.mockResolvedValueOnce([])

    const res = await request(app).get('/api/admin/tenants/tenant-001/products')

    expect(res.status).toBe(200)
    expect(res.body.products).toEqual([])
  })

  it('404 — tenant nao encontrado', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValueOnce(null)

    const res = await request(app).get('/api/admin/tenants/inexistente/products')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockPrisma.productConfig.findMany).not.toHaveBeenCalled()
  })
})

// ─── POST /api/admin/tenants/:tenantId/products/:productKey/activate ────────

describe('POST /api/admin/tenants/:tenantId/products/:productKey/activate — ativar produto', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — produto ativado com sucesso (sem config customizado)', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValueOnce(TENANT_FIXTURE)
    mockProductConfigService.upsertConfig.mockResolvedValueOnce(UPSERT_RESULT)

    const res = await request(app)
      .post('/api/admin/tenants/tenant-001/products/simula-custo/activate')
      .send({})

    expect(res.status).toBe(200)
    expect(res.body.activated).toBe(true)
    expect(res.body.config).toBeDefined()
    expect(mockProductConfigService.upsertConfig).toHaveBeenCalledWith(
      'tenant-001',
      'simula-custo',
      {},
      true
    )
  })

  it('200 — produto ativado com config customizado', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValueOnce(TENANT_FIXTURE)
    mockProductConfigService.upsertConfig.mockResolvedValueOnce({
      ...UPSERT_RESULT,
      config: { maxSimulations: 200 },
    })

    const res = await request(app)
      .post('/api/admin/tenants/tenant-001/products/simula-custo/activate')
      .send({ config: { maxSimulations: 200 } })

    expect(res.status).toBe(200)
    expect(res.body.activated).toBe(true)
    expect(mockProductConfigService.upsertConfig).toHaveBeenCalledWith(
      'tenant-001',
      'simula-custo',
      { maxSimulations: 200 },
      true
    )
  })

  it('404 — tenant nao encontrado', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValueOnce(null)

    const res = await request(app)
      .post('/api/admin/tenants/inexistente/products/simula-custo/activate')
      .send({})

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockProductConfigService.upsertConfig).not.toHaveBeenCalled()
  })
})

// ─── POST /api/admin/tenants/:tenantId/products/:productKey/deactivate ──────

describe('POST /api/admin/tenants/:tenantId/products/:productKey/deactivate — desativar produto', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — produto desativado com sucesso', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValueOnce(TENANT_FIXTURE)
    mockProductConfigService.disableProduct.mockResolvedValueOnce({ count: 1 })

    const res = await request(app)
      .post('/api/admin/tenants/tenant-001/products/simula-custo/deactivate')

    expect(res.status).toBe(200)
    expect(res.body.deactivated).toBe(true)
    expect(mockProductConfigService.disableProduct).toHaveBeenCalledWith(
      'tenant-001',
      'simula-custo'
    )
  })

  it('404 — tenant nao encontrado', async () => {
    mockPrisma.tenant.findUnique.mockResolvedValueOnce(null)

    const res = await request(app)
      .post('/api/admin/tenants/inexistente/products/simula-custo/deactivate')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockProductConfigService.disableProduct).not.toHaveBeenCalled()
  })
})
