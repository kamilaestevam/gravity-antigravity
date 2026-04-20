// @vitest-environment node
// TST-FUNC-CONF-STORE-001 — POST /api/v1/assinaturas/subscribe + GET /api/v1/assinaturas
// Valida: POST contrata produto e retorna 201; validação Zod rejeita body inválido;
//         404 quando produto inexistente no catálogo; GET lista assinaturas do tenant autenticado.
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockProdutoFindFirst,
  mockProdutoFindMany,
  mockConfigUpsert,
  mockConfigFindMany,
  mockConfigUpdateMany,
} = vi.hoisted(() => ({
  mockProdutoFindFirst:  vi.fn(),
  mockProdutoFindMany:   vi.fn(),
  mockConfigUpsert:      vi.fn(),
  mockConfigFindMany:    vi.fn(),
  mockConfigUpdateMany:  vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    produtoGravity:       { findFirst: mockProdutoFindFirst, findMany: mockProdutoFindMany },
    configuracaoProduto: {
      upsert:      mockConfigUpsert,
      findMany:    mockConfigFindMany,
      updateMany:  mockConfigUpdateMany,
    },
    organizacao: { findUnique: vi.fn() },
  },
}))

// Bypass auth — injeta req.auth diretamente para isolar o teste do middleware Clerk
vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (
    req:  Record<string, unknown>,
    _res: Record<string, unknown>,
    next: () => void,
  ) => {
    req['auth'] = {
      userId:      'usr_func_01',
      tenantId:    'ten_func_01',
      clerkUserId: 'clerk_func_01',
      role:        'MASTER',
      name:        'Func Tester',
    }
    next()
  },
}))

// requireGravityAdmin — não testado aqui; rotas admin ficam fora do escopo
vi.mock('../../../../servicos-global/configurador/server/middleware/requireGravityAdmin.js', () => ({
  requireGravityAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

// productConfigService — apenas rotas admin usam; mock preventivo
vi.mock('../../../../servicos-global/configurador/server/services/productConfigService.js', () => ({
  productConfigService: {
    upsertConfig:    vi.fn(),
    disableProduct:  vi.fn(),
  },
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { tenantProductsRouter } from '../../../../servicos-global/configurador/server/routes/tenantProducts.js'
import { AppError } from '../../../../servicos-global/configurador/server/lib/appError.js'

// ─── App de teste ─────────────────────────────────────────────────────────────
const app = express()
app.use(express.json())
app.use('/api/v1/assinaturas', tenantProductsRouter)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
})

// ─── Fixtures ────────────────────────────────────────────────────────────────
const PRODUTO_CATALOGO = {
  id:          'prod_pedido',
  name:        'Pedido',
  slug:        'pedido',
  description: 'Gestão completa de pedidos',
  status:      'ACTIVE',
  category:    'COMERCIAL',
}

const CONFIG_CRIADO = {
  id:          'cfg_01',
  tenant_id:   'ten_func_01',
  product_key: 'pedido',
  is_active:   true,
  config:      {},
  created_at:  new Date('2026-04-20T00:00:00Z'),
}

// ─── Testes ───────────────────────────────────────────────────────────────────
describe('TST-FUNC-CONF-STORE-001 — POST /api/v1/assinaturas/subscribe', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Caminho feliz ─────────────────────────────────────────────────────────
  it('retorna 201 com config e catalog ao contratar produto ativo', async () => {
    mockProdutoFindFirst.mockResolvedValue(PRODUTO_CATALOGO)
    mockConfigUpsert.mockResolvedValue(CONFIG_CRIADO)

    const res = await request(app)
      .post('/api/v1/assinaturas/subscribe')
      .send({ product_key: 'pedido' })

    expect(res.status).toBe(201)
    expect(res.body.config.product_key).toBe('pedido')
    expect(res.body.config.is_active).toBe(true)
    expect(res.body.catalog.slug).toBe('pedido')
  })

  it('upsert é chamado com tenant_id correto do req.auth', async () => {
    mockProdutoFindFirst.mockResolvedValue(PRODUTO_CATALOGO)
    mockConfigUpsert.mockResolvedValue(CONFIG_CRIADO)

    await request(app)
      .post('/api/v1/assinaturas/subscribe')
      .send({ product_key: 'pedido' })

    expect(mockConfigUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenant_id_product_key: {
            tenant_id:   'ten_func_01',
            product_key: 'pedido',
          },
        },
        create: expect.objectContaining({ tenant_id: 'ten_func_01', product_key: 'pedido', is_active: true }),
        update: expect.objectContaining({ is_active: true }),
      })
    )
  })

  // ── Validação Zod ─────────────────────────────────────────────────────────
  it('retorna 400 quando product_key está ausente no body', async () => {
    const res = await request(app)
      .post('/api/v1/assinaturas/subscribe')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockProdutoFindFirst).not.toHaveBeenCalled()
  })

  it('retorna 400 quando product_key é string vazia', async () => {
    const res = await request(app)
      .post('/api/v1/assinaturas/subscribe')
      .send({ product_key: '' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  // ── Produto inexistente no catálogo ───────────────────────────────────────
  it('retorna 404 quando produto não existe no catálogo', async () => {
    mockProdutoFindFirst.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/assinaturas/subscribe')
      .send({ product_key: 'produto-inexistente' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockConfigUpsert).not.toHaveBeenCalled()
  })

  it('retorna 404 quando findFirst lança exceção (produto inativo ou schema ausente)', async () => {
    mockProdutoFindFirst.mockRejectedValue(new Error('Table not found'))

    const res = await request(app)
      .post('/api/v1/assinaturas/subscribe')
      .send({ product_key: 'pedido' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})

describe('TST-FUNC-CONF-STORE-001 — GET /api/v1/assinaturas', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 200 com lista de produtos contratados do tenant autenticado', async () => {
    mockConfigFindMany.mockResolvedValue([CONFIG_CRIADO])
    mockProdutoFindMany.mockResolvedValue([PRODUTO_CATALOGO])

    const res = await request(app).get('/api/v1/assinaturas')

    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].product_key).toBe('pedido')
    expect(res.body.products[0].is_active).toBe(true)
  })

  it('configFindMany é chamado filtrando pelo tenant_id do req.auth', async () => {
    mockConfigFindMany.mockResolvedValue([])
    mockProdutoFindMany.mockResolvedValue([])

    await request(app).get('/api/v1/assinaturas')

    expect(mockConfigFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenant_id: 'ten_func_01' },
      })
    )
  })

  it('retorna products vazio quando tenant não tem assinaturas', async () => {
    mockConfigFindMany.mockResolvedValue([])
    mockProdutoFindMany.mockResolvedValue([])

    const res = await request(app).get('/api/v1/assinaturas')

    expect(res.status).toBe(200)
    expect(res.body.products).toEqual([])
  })

  it('enriquece produto com dados do catálogo quando slug existe', async () => {
    mockConfigFindMany.mockResolvedValue([CONFIG_CRIADO])
    mockProdutoFindMany.mockResolvedValue([PRODUTO_CATALOGO])

    const res = await request(app).get('/api/v1/assinaturas')

    expect(res.body.products[0].catalog).toMatchObject({
      slug: 'pedido',
      name: 'Pedido',
    })
  })

  it('catalog é null quando slug do config não existe no catálogo', async () => {
    mockConfigFindMany.mockResolvedValue([{ ...CONFIG_CRIADO, product_key: 'modulo-orphan' }])
    mockProdutoFindMany.mockResolvedValue([])

    const res = await request(app).get('/api/v1/assinaturas')

    expect(res.status).toBe(200)
    expect(res.body.products[0].catalog).toBeNull()
  })

  it('retorna { products: [] } se banco lançar exceção (degradação graciosa)', async () => {
    mockConfigFindMany.mockRejectedValue(new Error('DB offline'))

    const res = await request(app).get('/api/v1/assinaturas')

    expect(res.status).toBe(200)
    expect(res.body.products).toEqual([])
  })
})

describe('TST-FUNC-CONF-STORE-001 — DELETE /api/v1/assinaturas/:key', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna { ok: true } ao cancelar produto do tenant autenticado', async () => {
    mockConfigUpdateMany.mockResolvedValue({ count: 1 })

    const res = await request(app).delete('/api/v1/assinaturas/pedido')

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('updateMany é chamado apenas com tenant_id do req.auth — isolamento de tenant', async () => {
    mockConfigUpdateMany.mockResolvedValue({ count: 1 })

    await request(app).delete('/api/v1/assinaturas/pedido')

    expect(mockConfigUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenant_id:   'ten_func_01',
          product_key: 'pedido',
        },
        data: { is_active: false },
      })
    )
  })
})
