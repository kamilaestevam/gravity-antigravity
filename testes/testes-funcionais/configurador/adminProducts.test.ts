// @vitest-environment node
// testes/testes-funcionais/configurador/adminProducts.test.ts
// Testes funcionais — CRUD do catalogo master de produtos (gravity_admin)
//
// Rotas testadas:
//   GET    /api/admin/products          — lista com paginacao, search, status
//   GET    /api/admin/products/:id      — detalhes de produto
//   POST   /api/admin/products          — cria produto
//   PUT    /api/admin/products/:id      — atualiza produto
//   PATCH  /api/admin/products/:id/status — toggle status
//   DELETE /api/admin/products/:id      — remove produto
//   POST   /api/admin/products/seed     — seed idempotente

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { adminProductsRouter } from '../../../servicos-global/configurador/server/routes/adminProducts.js'
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
  activateProductsForTenant: vi.fn().mockResolvedValue({ activated: 3 }),
  listPublic: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/services/productCatalogService.js', () => ({
  productCatalogService: mockProductCatalogService,
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
  app.use('/api/admin/products', adminProductsRouter)
  app.use(errorHandler)
  return app
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const PRODUCT_FIXTURE = {
  id: 'prod-001',
  name: 'SimulaCusto',
  slug: 'simula-custo',
  description: 'Gestao de custos estimados de exportacao e importacao',
  status: 'ACTIVE',
  billing_type: 'PER_ESTIMATE',
  unit_price: 10.99,
  unit_currency: 'BRL',
  minimum_price: 0,
  minimum_currency: 'BRL',
  user_limit_type: 'LIMITED',
  base_users_qty: 10,
  backend_module: 'simula-custo',
  target_audience: 'Importadores e exportadores',
  has_setup: false,
  setup_price: null,
  setup_currency: 'BRL',
  total_price: null,
  total_currency: 'BRL',
  extra_user_price: null,
  extra_user_currency: 'BRL',
  helpdesk_hours: 0,
  extra_hour_price: null,
  extra_hour_currency: 'BRL',
  launch_date: null,
  price_tiers: [],
  negotiations: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const CREATE_BODY = {
  name: 'Novo Produto',
  slug: 'novo-produto',
  description: 'Descricao do novo produto teste',
  status: 'COMING_SOON',
  billing_type: 'MONTHLY',
  unit_price: 99.99,
}

// ─── GET /api/admin/products ────────────────────────────────────────────────

describe('GET /api/admin/products — lista de produtos', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — lista vazia', async () => {
    mockProductCatalogService.list.mockResolvedValueOnce({
      products: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 0 },
    })

    const res = await request(app).get('/api/admin/products')

    expect(res.status).toBe(200)
    expect(res.body.products).toEqual([])
    expect(res.body.pagination.total).toBe(0)
  })

  it('200 — lista com dados', async () => {
    mockProductCatalogService.list.mockResolvedValueOnce({
      products: [PRODUCT_FIXTURE],
      pagination: { page: 1, limit: 50, total: 1, pages: 1 },
    })

    const res = await request(app).get('/api/admin/products')

    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].slug).toBe('simula-custo')
  })

  it('200 — filtro por search', async () => {
    mockProductCatalogService.list.mockResolvedValueOnce({
      products: [PRODUCT_FIXTURE],
      pagination: { page: 1, limit: 50, total: 1, pages: 1 },
    })

    const res = await request(app)
      .get('/api/admin/products')
      .query({ search: 'simula' })

    expect(res.status).toBe(200)
    expect(mockProductCatalogService.list).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'simula' })
    )
  })

  it('200 — filtro por status', async () => {
    mockProductCatalogService.list.mockResolvedValueOnce({
      products: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 0 },
    })

    const res = await request(app)
      .get('/api/admin/products')
      .query({ status: 'SUSPENDED' })

    expect(res.status).toBe(200)
    expect(mockProductCatalogService.list).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'SUSPENDED' })
    )
  })
})

// ─── GET /api/admin/products/:id ────────────────────────────────────────────

describe('GET /api/admin/products/:id — detalhes de produto', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — produto encontrado', async () => {
    mockProductCatalogService.getById.mockResolvedValueOnce(PRODUCT_FIXTURE)

    const res = await request(app).get('/api/admin/products/prod-001')

    expect(res.status).toBe(200)
    expect(res.body.product.id).toBe('prod-001')
    expect(res.body.product.name).toBe('SimulaCusto')
  })

  it('404 — produto nao encontrado', async () => {
    mockProductCatalogService.getById.mockResolvedValueOnce(null)

    const res = await request(app).get('/api/admin/products/inexistente')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})

// ─── POST /api/admin/products ───────────────────────────────────────────────

describe('POST /api/admin/products — criar produto', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('201 — produto criado com sucesso', async () => {
    mockProductCatalogService.getBySlug.mockResolvedValueOnce(null)
    mockProductCatalogService.create.mockResolvedValueOnce({
      ...PRODUCT_FIXTURE,
      id: 'prod-new',
      name: CREATE_BODY.name,
      slug: CREATE_BODY.slug,
    })

    const res = await request(app)
      .post('/api/admin/products')
      .send(CREATE_BODY)

    expect(res.status).toBe(201)
    expect(res.body.product.slug).toBe('novo-produto')
    expect(mockProductCatalogService.create).toHaveBeenCalledTimes(1)
  })

  it('400 — dados invalidos (nome curto)', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({ name: 'X', slug: 'x', description: 'ab', unit_price: 10 })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockProductCatalogService.create).not.toHaveBeenCalled()
  })

  it('400 — slug com caracteres invalidos', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({ ...CREATE_BODY, slug: 'INVALID SLUG!' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('409 — slug duplicado', async () => {
    mockProductCatalogService.getBySlug.mockResolvedValueOnce(PRODUCT_FIXTURE)

    const res = await request(app)
      .post('/api/admin/products')
      .send({ ...CREATE_BODY, slug: 'simula-custo' })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
    expect(mockProductCatalogService.create).not.toHaveBeenCalled()
  })
})

// ─── PUT /api/admin/products/:id ────────────────────────────────────────────

describe('PUT /api/admin/products/:id — atualizar produto', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — produto atualizado com sucesso', async () => {
    mockProductCatalogService.getById.mockResolvedValueOnce(PRODUCT_FIXTURE)
    mockProductCatalogService.update.mockResolvedValueOnce({
      ...PRODUCT_FIXTURE,
      name: 'SimulaCusto Pro',
    })

    const res = await request(app)
      .put('/api/admin/products/prod-001')
      .send({ name: 'SimulaCusto Pro' })

    expect(res.status).toBe(200)
    expect(res.body.product.name).toBe('SimulaCusto Pro')
  })

  it('404 — produto nao encontrado', async () => {
    mockProductCatalogService.getById.mockResolvedValueOnce(null)

    const res = await request(app)
      .put('/api/admin/products/inexistente')
      .send({ name: 'Novo Nome' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockProductCatalogService.update).not.toHaveBeenCalled()
  })

  it('409 — conflito de slug ao atualizar', async () => {
    mockProductCatalogService.getById.mockResolvedValueOnce(PRODUCT_FIXTURE)
    mockProductCatalogService.getBySlug.mockResolvedValueOnce({
      ...PRODUCT_FIXTURE,
      id: 'prod-outro',
      slug: 'slug-ocupado',
    })

    const res = await request(app)
      .put('/api/admin/products/prod-001')
      .send({ slug: 'slug-ocupado' })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
    expect(mockProductCatalogService.update).not.toHaveBeenCalled()
  })

  it('200 — atualizar com mesmo slug nao gera conflito', async () => {
    mockProductCatalogService.getById.mockResolvedValueOnce(PRODUCT_FIXTURE)
    mockProductCatalogService.update.mockResolvedValueOnce(PRODUCT_FIXTURE)

    const res = await request(app)
      .put('/api/admin/products/prod-001')
      .send({ slug: 'simula-custo' })

    expect(res.status).toBe(200)
    // Nao deve verificar slug duplicado quando slug nao muda
    expect(mockProductCatalogService.getBySlug).not.toHaveBeenCalled()
  })
})

// ─── PATCH /api/admin/products/:id/status ───────────────────────────────────

describe('PATCH /api/admin/products/:id/status — toggle status', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — status alternado com sucesso', async () => {
    mockProductCatalogService.toggleStatus.mockResolvedValueOnce({
      ...PRODUCT_FIXTURE,
      status: 'SUSPENDED',
    })

    const res = await request(app).patch('/api/admin/products/prod-001/status')

    expect(res.status).toBe(200)
    expect(res.body.product.status).toBe('SUSPENDED')
  })

  it('404 — produto nao encontrado', async () => {
    mockProductCatalogService.toggleStatus.mockResolvedValueOnce(null)

    const res = await request(app).patch('/api/admin/products/inexistente/status')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})

// ─── DELETE /api/admin/products/:id ─────────────────────────────────────────

describe('DELETE /api/admin/products/:id — remover produto', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — produto removido com sucesso', async () => {
    mockProductCatalogService.getById.mockResolvedValueOnce(PRODUCT_FIXTURE)
    mockProductCatalogService.delete.mockResolvedValueOnce(undefined)

    const res = await request(app).delete('/api/admin/products/prod-001')

    expect(res.status).toBe(200)
    expect(res.body.deleted).toBe(true)
    expect(res.body.id).toBe('prod-001')
    expect(mockProductCatalogService.delete).toHaveBeenCalledWith('prod-001')
  })

  it('404 — produto nao encontrado', async () => {
    mockProductCatalogService.getById.mockResolvedValueOnce(null)

    const res = await request(app).delete('/api/admin/products/inexistente')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockProductCatalogService.delete).not.toHaveBeenCalled()
  })
})

// ─── POST /api/admin/products/seed ──────────────────────────────────────────

describe('POST /api/admin/products/seed — seed de produtos', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — seed executado com sucesso (primeira vez)', async () => {
    mockProductCatalogService.seedInitialProducts.mockResolvedValueOnce({
      seeded: true,
      count: 3,
    })

    const res = await request(app).post('/api/admin/products/seed')

    expect(res.status).toBe(200)
    expect(res.body.catalog.seeded).toBe(true)
    expect(res.body.catalog.count).toBe(3)
    expect(res.body.activation).toBeDefined()
  })

  it('200 — seed idempotente (ja existem produtos)', async () => {
    mockProductCatalogService.seedInitialProducts.mockResolvedValueOnce({
      seeded: false,
      count: 3,
    })

    const res = await request(app).post('/api/admin/products/seed')

    expect(res.status).toBe(200)
    expect(res.body.catalog.seeded).toBe(false)
  })
})
