/**
 * Testes unitarios — Admin Products / Available Slugs + Validacao ACTIVE
 *
 * Testa:
 *   - GET /available-slugs retorna slugs de contracts.json nao cadastrados
 *   - POST rejeita status ACTIVE quando slug nao existe em contracts.json
 *   - POST aceita COMING_SOON sem slug em contracts.json
 *   - POST aceita ACTIVE quando slug existe em contracts.json
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const CONTRACTS_MOCK = vi.hoisted(() => ({
  services: {
    'simula-custo': { baseUrl: 'http://localhost:8020', pathPrefix: '/api/v1/simula-custo' },
    'bid-frete': { baseUrl: 'http://localhost:8023', pathPrefix: '/api/v1/bid-frete' },
    'bid-cambio': { baseUrl: 'http://localhost:8025', pathPrefix: '/api/v1/bid-cambio' },
    'pedido': { baseUrl: 'http://localhost:8025', pathPrefix: '/api/v1/pedidos' },
    'email': { baseUrl: 'http://localhost:8022', pathPrefix: '/api/v1/email' },
  }
}))

// Mock fs para retornar nosso contracts.json fake
vi.mock('fs', () => ({
  readFileSync: vi.fn().mockReturnValue(JSON.stringify(CONTRACTS_MOCK)),
}))

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

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req.auth = { clerkUserId: 'admin-001' }
    next()
  },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireGravityAdmin.js', () => ({
  requireGravityAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

import { adminProductsRouter } from '../../../servicos-global/configurador/server/routes/adminProducts'

// ── App de teste ──────────────────────────────────────────────────────────────

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/admin/products', adminProductsRouter)
  app.use((err: { statusCode?: number; message: string }, _req: unknown, res: express.Response, _next: unknown) => {
    res.status(err.statusCode ?? 500).json({ error: { message: err.message, code: (err as { code?: string }).code } })
  })
  return app
}

// ── Testes: GET /available-slugs ──────────────────────────────────────────────

describe('GET /api/admin/products/available-slugs', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('retorna todos os slugs quando nenhum produto existe', async () => {
    mockProductCatalogService.list.mockResolvedValueOnce({
      products: [],
      pagination: { page: 1, limit: 1000, total: 0 },
    })

    const res = await request(app).get('/api/admin/products/available-slugs')

    expect(res.status).toBe(200)
    expect(res.body.available).toContain('simula-custo')
    expect(res.body.available).toContain('pedido')
    expect(res.body.available).toContain('bid-frete')
    expect(res.body.all).toHaveLength(5)
  })

  it('exclui slugs de produtos ja cadastrados', async () => {
    mockProductCatalogService.list.mockResolvedValueOnce({
      products: [
        { slug: 'simula-custo', backend_module: 'simula-custo' },
        { slug: 'bid-frete', backend_module: 'bid-frete' },
      ],
      pagination: { page: 1, limit: 1000, total: 2 },
    })

    const res = await request(app).get('/api/admin/products/available-slugs')

    expect(res.status).toBe(200)
    expect(res.body.available).not.toContain('simula-custo')
    expect(res.body.available).not.toContain('bid-frete')
    expect(res.body.available).toContain('pedido')
    expect(res.body.available).toContain('bid-cambio')
    expect(res.body.available).toContain('email')
  })

  it('retorna array vazio quando todos os slugs estao em uso', async () => {
    mockProductCatalogService.list.mockResolvedValueOnce({
      products: Object.keys(CONTRACTS_MOCK.services).map(s => ({ slug: s, backend_module: s })),
      pagination: { page: 1, limit: 1000, total: 5 },
    })

    const res = await request(app).get('/api/admin/products/available-slugs')

    expect(res.status).toBe(200)
    expect(res.body.available).toHaveLength(0)
    expect(res.body.all).toHaveLength(5)
  })
})

// ── Testes: Validacao ACTIVE exige contracts.json ─────────────────────────────

describe('POST /api/admin/products — validacao de infra para ACTIVE', () => {
  const app = buildApp()

  beforeEach(() => {
    vi.clearAllMocks()
    mockProductCatalogService.getBySlug.mockResolvedValue(null)
    mockProductCatalogService.create.mockImplementation((data: Record<string, unknown>) =>
      Promise.resolve({ id: 'prod-new', ...data })
    )
  })

  it('201 — aceita ACTIVE quando slug existe em contracts.json', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({
        name: 'Pedido',
        slug: 'pedido',
        description: 'Gestao de pedidos COMEX',
        status: 'ACTIVE',
        billing_type: 'PER_PROCESS',
        unit_price: 1.99,
        backend_module: 'pedido',
      })

    expect(res.status).toBe(201)
  })

  it('400 — rejeita ACTIVE quando slug NAO existe em contracts.json', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({
        name: 'Produto Fantasma',
        slug: 'fantasma',
        description: 'Produto sem infraestrutura',
        status: 'ACTIVE',
        billing_type: 'MONTHLY',
        unit_price: 9.99,
        backend_module: 'fantasma',
      })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toContain('contracts.json')
    expect(res.body.error.code).toBe('MISSING_INFRASTRUCTURE')
  })

  it('201 — aceita COMING_SOON mesmo sem slug em contracts.json', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({
        name: 'Produto Futuro',
        slug: 'produto-futuro',
        description: 'Produto em desenvolvimento livre',
        status: 'COMING_SOON',
        billing_type: 'MONTHLY',
        unit_price: 0,
      })

    expect(res.status).toBe(201)
  })

  it('400 — ACTIVE sem backend_module usa slug como fallback e rejeita se inexistente', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({
        name: 'Sem Modulo',
        slug: 'nao-existe',
        description: 'Produto sem modulo backend',
        status: 'ACTIVE',
        billing_type: 'MONTHLY',
        unit_price: 5.00,
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('MISSING_INFRASTRUCTURE')
  })

  it('201 — ACTIVE sem backend_module mas slug existe em contracts.json', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({
        name: 'Email Service',
        slug: 'email',
        description: 'Servico de email da plataforma',
        status: 'ACTIVE',
        billing_type: 'MONTHLY',
        unit_price: 0,
      })

    expect(res.status).toBe(201)
  })

  it('409 — rejeita slug duplicado independente do status', async () => {
    mockProductCatalogService.getBySlug.mockResolvedValueOnce({ id: 'existing', slug: 'pedido' })

    const res = await request(app)
      .post('/api/admin/products')
      .send({
        name: 'Pedido Duplicado',
        slug: 'pedido',
        description: 'Tentativa de duplicar',
        status: 'ACTIVE',
        billing_type: 'PER_PROCESS',
        unit_price: 1.99,
        backend_module: 'pedido',
      })

    expect(res.status).toBe(409)
  })
})
