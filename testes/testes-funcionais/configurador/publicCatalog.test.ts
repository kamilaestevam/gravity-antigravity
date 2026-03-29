// @vitest-environment node
// testes/testes-funcionais/configurador/publicCatalog.test.ts
// Testes funcionais — catalogo publico de produtos (sem autenticacao)
//
// Rotas testadas:
//   GET /api/v1/catalog/products       — lista produtos ativos/coming_soon
//   GET /api/v1/catalog/products/:slug — detalhes de produto por slug

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { publicCatalogRouter } from '../../../servicos-global/configurador/server/routes/publicCatalog.js'
import { errorHandler } from '../../../servicos-global/configurador/server/middleware/errorHandler.js'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockProductCatalogService = vi.hoisted(() => ({
  list: vi.fn(),
  getById: vi.fn(),
  getBySlug: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  toggleStatus: vi.fn(),
  delete: vi.fn(),
  seedInitialProducts: vi.fn(),
  listPublic: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/services/productCatalogService.js', () => ({
  productCatalogService: mockProductCatalogService,
}))

// ─── App de teste isolado ────────────────────────────────────────────────────

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/catalog', publicCatalogRouter)
  app.use(errorHandler)
  return app
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ACTIVE_PRODUCT = {
  id: 'prod-001',
  name: 'SimulaCusto',
  slug: 'simula-custo',
  description: 'Gestao de custos estimados de exportacao e importacao',
  status: 'ACTIVE',
  billing_type: 'PER_ESTIMATE',
  unit_price: 10.99,
  price_tiers: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const COMING_SOON_PRODUCT = {
  id: 'prod-002',
  name: 'Smart Read',
  slug: 'smart-read',
  description: 'Leitura inteligente de documentos via OCR e IA',
  status: 'COMING_SOON',
  billing_type: 'PER_DOCUMENT',
  unit_price: 5.99,
  price_tiers: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const SUSPENDED_PRODUCT = {
  id: 'prod-003',
  name: 'Produto Suspenso',
  slug: 'produto-suspenso',
  description: 'Este produto esta suspenso e nao deve aparecer',
  status: 'SUSPENDED',
  billing_type: 'MONTHLY',
  unit_price: 0,
  price_tiers: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// ─── GET /api/v1/catalog/products ───────────────────────────────────────────

describe('GET /api/v1/catalog/products — catalogo publico', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — lista produtos ACTIVE e COMING_SOON', async () => {
    mockProductCatalogService.listPublic.mockResolvedValueOnce([
      ACTIVE_PRODUCT,
      COMING_SOON_PRODUCT,
    ])

    const res = await request(app).get('/api/v1/catalog/products')

    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(2)
    expect(res.body.products[0].status).toBe('ACTIVE')
    expect(res.body.products[1].status).toBe('COMING_SOON')
  })

  it('200 — lista vazia quando nao ha produtos', async () => {
    mockProductCatalogService.listPublic.mockResolvedValueOnce([])

    const res = await request(app).get('/api/v1/catalog/products')

    expect(res.status).toBe(200)
    expect(res.body.products).toEqual([])
  })
})

// ─── GET /api/v1/catalog/products/:slug ─────────────────────────────────────

describe('GET /api/v1/catalog/products/:slug — detalhes publicos por slug', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — produto ACTIVE encontrado', async () => {
    mockProductCatalogService.getBySlug.mockResolvedValueOnce(ACTIVE_PRODUCT)

    const res = await request(app).get('/api/v1/catalog/products/simula-custo')

    expect(res.status).toBe(200)
    expect(res.body.product.slug).toBe('simula-custo')
    expect(res.body.product.status).toBe('ACTIVE')
  })

  it('200 — produto COMING_SOON encontrado', async () => {
    mockProductCatalogService.getBySlug.mockResolvedValueOnce(COMING_SOON_PRODUCT)

    const res = await request(app).get('/api/v1/catalog/products/smart-read')

    expect(res.status).toBe(200)
    expect(res.body.product.slug).toBe('smart-read')
    expect(res.body.product.status).toBe('COMING_SOON')
  })

  it('404 — produto nao encontrado (slug inexistente)', async () => {
    mockProductCatalogService.getBySlug.mockResolvedValueOnce(null)

    const res = await request(app).get('/api/v1/catalog/products/nao-existe')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Produto não encontrado')
  })

  it('404 — produto SUSPENDED nao e visivel publicamente', async () => {
    mockProductCatalogService.getBySlug.mockResolvedValueOnce(SUSPENDED_PRODUCT)

    const res = await request(app).get('/api/v1/catalog/products/produto-suspenso')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Produto não encontrado')
  })

  it('404 — produto LEGACY nao e visivel publicamente', async () => {
    mockProductCatalogService.getBySlug.mockResolvedValueOnce({
      ...ACTIVE_PRODUCT,
      slug: 'produto-legacy',
      status: 'LEGACY',
    })

    const res = await request(app).get('/api/v1/catalog/products/produto-legacy')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Produto não encontrado')
  })

  it('404 — produto INACTIVE nao e visivel publicamente', async () => {
    mockProductCatalogService.getBySlug.mockResolvedValueOnce({
      ...ACTIVE_PRODUCT,
      slug: 'produto-inativo',
      status: 'INACTIVE',
    })

    const res = await request(app).get('/api/v1/catalog/products/produto-inativo')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Produto não encontrado')
  })
})
