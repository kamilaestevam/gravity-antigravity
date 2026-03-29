// @vitest-environment node
/**
 * Testes funcionais v2 — BID Frete / Rotas de Fornecedores
 * POST   /api/v1/bid-frete/fornecedores
 * GET    /api/v1/bid-frete/fornecedores
 * GET    /api/v1/bid-frete/fornecedores/:id
 * PUT    /api/v1/bid-frete/fornecedores/:id
 * PATCH  /api/v1/bid-frete/fornecedores/:id/status
 * DELETE /api/v1/bid-frete/fornecedores/:id
 * POST   /api/v1/bid-frete/fornecedores/:id/tabela-preco
 * GET    /api/v1/bid-frete/fornecedores/:id/tabela-preco
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFornecedor = {
  create: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
}

const mockTabelaPreco = {
  create: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

const mockRatingFornecedor = {
  findUnique: vi.fn(),
}

vi.mock('../../../produto/bid-frete/server/src/middleware/tenantIsolation.js', () => ({
  tenantIsolationMiddleware: (req: any, _res: any, next: any) => {
    req.tenantId = 'tenant-test-001'
    req.prisma = {
      fornecedor: mockFornecedor,
      tabelaPreco: mockTabelaPreco,
      ratingFornecedor: mockRatingFornecedor,
    }
    next()
  },
  prisma: { $queryRaw: vi.fn().mockResolvedValue([1]) },
}))

vi.mock('../../../produto/bid-frete/server/src/middleware/requireInternalKey.js', () => ({
  requireInternalKey: (_req: any, _res: any, next: any) => next(),
}))

import { fornecedoresRouter } from '../../../produto/bid-frete/server/src/routes/fornecedores.js'

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use((req: any, _res: any, next: any) => {
    req.tenantId = 'tenant-test-001'
    req.prisma = {
      fornecedor: mockFornecedor,
      tabelaPreco: mockTabelaPreco,
      ratingFornecedor: mockRatingFornecedor,
    }
    req.headers['x-user-id'] = 'user-test-001'
    req.headers['x-internal-key'] = 'test-key'
    req.headers['x-tenant-id'] = 'tenant-test-001'
    next()
  })
  app.use('/api/v1/bid-frete/fornecedores', fornecedoresRouter)
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

// ---------------------------------------------------------------------------
// Dados base
// ---------------------------------------------------------------------------

const fornecedorValido = {
  nome: 'Asia Shipping',
  tipo: 'AGENTE_CARGA',
  email: 'contato@asiashipping.com',
}

// ===========================================================================
// POST /api/v1/bid-frete/fornecedores — cadastrar fornecedor
// ===========================================================================

describe('POST /api/v1/bid-frete/fornecedores — cadastrar fornecedor', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('201 — cria fornecedor com dados validos (campos minimos)', async () => {
    mockFornecedor.create.mockResolvedValue({ id: 'f-001', ...fornecedorValido, status: 'ATIVO' })

    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores')
      .send(fornecedorValido)

    expect(res.status).toBe(201)
    expect(res.body.fornecedor).toHaveProperty('id', 'f-001')
    expect(res.body.fornecedor.nome).toBe('Asia Shipping')
  })

  it('201 — cria fornecedor com campos opcionais completos', async () => {
    const payload = {
      ...fornecedorValido,
      nome_fantasia: 'ASL',
      cnpj: '12345678000100',
      telefone: '+5511999999999',
      whatsapp: '+5511999999999',
      website: 'https://asiashipping.com',
      pais: 'Brasil',
      cidade: 'Santos',
      aceita_cotacao_aberta: true,
      cotacao_automatica: false,
    }
    mockFornecedor.create.mockResolvedValue({ id: 'f-002', ...payload, status: 'ATIVO' })

    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores')
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body.fornecedor.id).toBe('f-002')
  })

  it('400 — rejeita sem email', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores')
      .send({ nome: 'Teste', tipo: 'ARMADOR' })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita email invalido', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores')
      .send({ ...fornecedorValido, email: 'nao-eh-email' })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita tipo invalido', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores')
      .send({ ...fornecedorValido, tipo: 'DRONE' })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita sem nome', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores')
      .send({ tipo: 'ARMADOR', email: 'test@test.com' })

    expect(res.status).toBe(400)
  })

  it('409 — rejeita email duplicado no tenant', async () => {
    mockFornecedor.create.mockRejectedValue({ code: 'P2002' })

    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores')
      .send(fornecedorValido)

    expect(res.status).toBe(409)
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/fornecedores — listar
// ===========================================================================

describe('GET /api/v1/bid-frete/fornecedores — listar', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — lista fornecedores com paginacao', async () => {
    mockFornecedor.findMany.mockResolvedValue([
      { id: 'f-001', nome: 'Asia Shipping', tipo: 'AGENTE_CARGA', _count: { bid_requests: 5, bid_responses: 3, avaliacoes: 2 } },
      { id: 'f-002', nome: 'Maersk', tipo: 'ARMADOR', _count: { bid_requests: 10, bid_responses: 8, avaliacoes: 4 } },
    ])
    mockFornecedor.count.mockResolvedValue(2)

    const res = await request(app).get('/api/v1/bid-frete/fornecedores')

    expect(res.status).toBe(200)
    expect(res.body.fornecedores).toHaveLength(2)
    expect(res.body.pagination.total).toBe(2)
  })

  it('200 — filtra por tipo', async () => {
    mockFornecedor.findMany.mockResolvedValue([])
    mockFornecedor.count.mockResolvedValue(0)

    await request(app).get('/api/v1/bid-frete/fornecedores?tipo=ARMADOR')

    expect(mockFornecedor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tipo: 'ARMADOR' }),
      })
    )
  })

  it('200 — filtra por status', async () => {
    mockFornecedor.findMany.mockResolvedValue([])
    mockFornecedor.count.mockResolvedValue(0)

    await request(app).get('/api/v1/bid-frete/fornecedores?status=INATIVO')

    expect(mockFornecedor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'INATIVO' }),
      })
    )
  })

  it('200 — busca textual (campo busca)', async () => {
    mockFornecedor.findMany.mockResolvedValue([])
    mockFornecedor.count.mockResolvedValue(0)

    await request(app).get('/api/v1/bid-frete/fornecedores?busca=Asia')

    expect(mockFornecedor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ nome: expect.objectContaining({ contains: 'Asia' }) }),
          ]),
        }),
      })
    )
  })

  it('200 — retorna array vazio quando nenhum fornecedor', async () => {
    mockFornecedor.findMany.mockResolvedValue([])
    mockFornecedor.count.mockResolvedValue(0)

    const res = await request(app).get('/api/v1/bid-frete/fornecedores')

    expect(res.status).toBe(200)
    expect(res.body.fornecedores).toHaveLength(0)
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/fornecedores/:id — detalhe
// ===========================================================================

describe('GET /api/v1/bid-frete/fornecedores/:id — detalhe', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna fornecedor com tabela, avaliacoes e rating', async () => {
    mockFornecedor.findFirst.mockResolvedValue({
      id: 'f-001', nome: 'Asia Shipping', email: 'test@test.com',
      tabelas_preco: [{ id: 'tp-001', origem_nome: 'Shanghai', destino_nome: 'Santos' }],
      avaliacoes: [{ id: 'av-001', nota_geral: 4.5 }],
      _count: { bid_requests: 10, bid_responses: 8, avaliacoes: 5 },
    })
    mockRatingFornecedor.findUnique.mockResolvedValue({ rating_global: 4.2 })

    const res = await request(app).get('/api/v1/bid-frete/fornecedores/f-001')

    expect(res.status).toBe(200)
    expect(res.body.fornecedor.nome).toBe('Asia Shipping')
    expect(res.body.fornecedor.tabelas_preco).toHaveLength(1)
    expect(res.body.rating_global.rating_global).toBe(4.2)
  })

  it('200 — retorna fornecedor sem rating (tabela nao existe)', async () => {
    mockFornecedor.findFirst.mockResolvedValue({
      id: 'f-002', nome: 'Novo Fornecedor', email: 'novo@test.com',
      tabelas_preco: [], avaliacoes: [],
      _count: { bid_requests: 0, bid_responses: 0, avaliacoes: 0 },
    })
    mockRatingFornecedor.findUnique.mockRejectedValue(new Error('table not found'))

    const res = await request(app).get('/api/v1/bid-frete/fornecedores/f-002')

    expect(res.status).toBe(200)
    expect(res.body.fornecedor.nome).toBe('Novo Fornecedor')
    expect(res.body.rating_global).toBeNull()
  })

  it('404 — fornecedor nao encontrado', async () => {
    mockFornecedor.findFirst.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/bid-frete/fornecedores/nao-existe')

    expect(res.status).toBe(404)
  })
})

// ===========================================================================
// PUT /api/v1/bid-frete/fornecedores/:id — atualizar
// ===========================================================================

describe('PUT /api/v1/bid-frete/fornecedores/:id — atualizar', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — atualiza fornecedor', async () => {
    mockFornecedor.update.mockResolvedValue({ id: 'f-001', nome: 'Asia Shipping Updated', email: 'new@test.com' })

    const res = await request(app)
      .put('/api/v1/bid-frete/fornecedores/f-001')
      .send({ nome: 'Asia Shipping Updated' })

    expect(res.status).toBe(200)
    expect(res.body.fornecedor.nome).toBe('Asia Shipping Updated')
  })

  it('500 — erro no banco', async () => {
    mockFornecedor.update.mockRejectedValue(new Error('DB error'))

    const res = await request(app)
      .put('/api/v1/bid-frete/fornecedores/f-001')
      .send({ nome: 'test' })

    expect(res.status).toBe(500)
  })
})

// ===========================================================================
// PATCH /api/v1/bid-frete/fornecedores/:id/status
// ===========================================================================

describe('PATCH /api/v1/bid-frete/fornecedores/:id/status', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — altera status para INATIVO', async () => {
    mockFornecedor.update.mockResolvedValue({ id: 'f-001', status: 'INATIVO' })

    const res = await request(app)
      .patch('/api/v1/bid-frete/fornecedores/f-001/status')
      .send({ status: 'INATIVO' })

    expect(res.status).toBe(200)
    expect(res.body.fornecedor.status).toBe('INATIVO')
  })

  it('200 — altera status para BLOQUEADO', async () => {
    mockFornecedor.update.mockResolvedValue({ id: 'f-001', status: 'BLOQUEADO' })

    const res = await request(app)
      .patch('/api/v1/bid-frete/fornecedores/f-001/status')
      .send({ status: 'BLOQUEADO' })

    expect(res.status).toBe(200)
    expect(res.body.fornecedor.status).toBe('BLOQUEADO')
  })

  it('200 — reativa fornecedor (ATIVO)', async () => {
    mockFornecedor.update.mockResolvedValue({ id: 'f-001', status: 'ATIVO' })

    const res = await request(app)
      .patch('/api/v1/bid-frete/fornecedores/f-001/status')
      .send({ status: 'ATIVO' })

    expect(res.status).toBe(200)
    expect(res.body.fornecedor.status).toBe('ATIVO')
  })

  it('400 — status invalido', async () => {
    const res = await request(app)
      .patch('/api/v1/bid-frete/fornecedores/f-001/status')
      .send({ status: 'APROVADO' })

    expect(res.status).toBe(400)
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/fornecedores/:id/tabela-preco — tabela de precos
// ===========================================================================

describe('GET /api/v1/bid-frete/fornecedores/:id/tabela-preco — listar tabela', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna tabela de precos do fornecedor', async () => {
    mockTabelaPreco.findMany.mockResolvedValue([
      { id: 'tp-001', origem_nome: 'Shanghai', destino_nome: 'Santos', valor_total: 2500 },
      { id: 'tp-002', origem_nome: 'Ningbo', destino_nome: 'Santos', valor_total: 2300 },
    ])

    const res = await request(app).get('/api/v1/bid-frete/fornecedores/f-001/tabela-preco')

    expect(res.status).toBe(200)
    expect(res.body.tabelas).toHaveLength(2)
  })

  it('200 — retorna array vazio se sem tabela', async () => {
    mockTabelaPreco.findMany.mockResolvedValue([])

    const res = await request(app).get('/api/v1/bid-frete/fornecedores/f-002/tabela-preco')

    expect(res.status).toBe(200)
    expect(res.body.tabelas).toHaveLength(0)
  })
})

// ===========================================================================
// POST /api/v1/bid-frete/fornecedores/:id/tabela-preco — adicionar rota
// ===========================================================================

describe('POST /:id/tabela-preco — adicionar tabela de precos', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  const tabelaValida = {
    origem_codigo: 'CNSHA', origem_nome: 'Shanghai',
    destino_codigo: 'BRSSZ', destino_nome: 'Santos',
    modal: 'MARITIMO', modalidade: 'FCL',
    valor_frete: 2000, taxas_origem: 200, taxas_destino: 300, valor_total: 2500,
    transit_time_dias: 30,
    validade_inicio: '2026-01-01T00:00:00.000Z',
    validade_fim: '2026-06-30T00:00:00.000Z',
  }

  it('201 — adiciona rota na tabela', async () => {
    mockTabelaPreco.create.mockResolvedValue({ id: 'tp-001', ...tabelaValida })

    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores/f-001/tabela-preco')
      .send(tabelaValida)

    expect(res.status).toBe(201)
    expect(res.body.tabela).toHaveProperty('id', 'tp-001')
  })

  it('400 — rejeita tabela sem campos obrigatorios', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores/f-001/tabela-preco')
      .send({ origem_codigo: 'CNSHA' })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita modal invalido na tabela', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores/f-001/tabela-preco')
      .send({ ...tabelaValida, modal: 'FERROVIARIO' })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita valor_frete negativo', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/fornecedores/f-001/tabela-preco')
      .send({ ...tabelaValida, valor_frete: -100 })

    expect(res.status).toBe(400)
  })
})

// ===========================================================================
// DELETE /api/v1/bid-frete/fornecedores/:id — excluir
// ===========================================================================

describe('DELETE /api/v1/bid-frete/fornecedores/:id — excluir fornecedor', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — exclui fornecedor', async () => {
    mockFornecedor.delete.mockResolvedValue({})

    const res = await request(app).delete('/api/v1/bid-frete/fornecedores/f-001')

    expect(res.status).toBe(200)
    expect(res.body.deleted).toBe(true)
  })

  it('500 — erro ao excluir fornecedor com dependencias', async () => {
    mockFornecedor.delete.mockRejectedValue(new Error('Foreign key constraint'))

    const res = await request(app).delete('/api/v1/bid-frete/fornecedores/f-001')

    expect(res.status).toBe(500)
  })
})
