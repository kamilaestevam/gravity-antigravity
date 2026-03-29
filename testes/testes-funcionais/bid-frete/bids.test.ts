// @vitest-environment node
/**
 * Testes funcionais v2 — BID Frete / Rotas de Disparo de BIDs
 * POST /api/v1/bid-frete/bids/disparar
 * POST /api/v1/bid-frete/bids/cotacao-aberta
 * GET  /api/v1/bid-frete/bids/cotacao/:id
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

vi.mock('../../../produto/bid-frete/server/src/services/tenantIntegrations.js', () => ({
  atividadesIntegration: { cotacaoCriada: vi.fn(), aguardandoAprovacao: vi.fn() },
  historicoIntegration: { cotacaoCriada: vi.fn(), bidsDisparados: vi.fn(), registrar: vi.fn() },
  notificacoesIntegration: { fornecedorRespondeu: vi.fn(), cotacaoAprovada: vi.fn() },
}))

const mockBidRequest = {
  create: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  count: vi.fn(),
  updateMany: vi.fn(),
}

const mockCotacao = {
  findFirst: vi.fn(),
  update: vi.fn(),
}

const mockFornecedor = {
  findMany: vi.fn(),
}

const mockTabelaPreco = {
  findFirst: vi.fn(),
}

const mockBidResponse = {
  create: vi.fn(),
}

const mockPrisma = {
  bidRequest: mockBidRequest,
  cotacao: mockCotacao,
  fornecedor: mockFornecedor,
  tabelaPreco: mockTabelaPreco,
  bidResponse: mockBidResponse,
}

vi.mock('../../../produto/bid-frete/server/src/middleware/tenantIsolation.js', () => ({
  tenantIsolationMiddleware: (req: any, _res: any, next: any) => {
    req.tenantId = 'tenant-test-001'
    req.prisma = mockPrisma
    next()
  },
  prisma: { $queryRaw: vi.fn().mockResolvedValue([1]) },
}))

vi.mock('../../../produto/bid-frete/server/src/middleware/requireInternalKey.js', () => ({
  requireInternalKey: (_req: any, _res: any, next: any) => next(),
}))

import { bidsRouter } from '../../../produto/bid-frete/server/src/routes/bids.js'

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use((req: any, _res: any, next: any) => {
    req.tenantId = 'tenant-test-001'
    req.prisma = mockPrisma
    req.headers['x-user-id'] = 'user-test-001'
    req.headers['x-internal-key'] = 'test-key'
    req.headers['x-tenant-id'] = 'tenant-test-001'
    next()
  })
  app.use('/api/v1/bid-frete/bids', bidsRouter)
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

// ===========================================================================
// POST /api/v1/bid-frete/bids/disparar — disparo direcionado
// ===========================================================================

describe('POST /api/v1/bid-frete/bids/disparar — disparo de BIDs', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — dispara BIDs para fornecedores selecionados', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', numero: 'BID-001', origem_codigo: 'CNSHA', destino_codigo: 'BRSSZ', modal: 'MARITIMO' })
    mockFornecedor.findMany.mockResolvedValue([
      { id: 'f-001', nome: 'Asia Shipping', email: 'asia@test.com', status: 'ATIVO', cotacao_automatica: false },
      { id: 'f-002', nome: 'Maersk', email: 'maersk@test.com', status: 'ATIVO', cotacao_automatica: false },
    ])
    mockTabelaPreco.findFirst.mockResolvedValue(null) // sem tabela padrao
    mockBidRequest.create.mockResolvedValue({ id: 'br-001' })
    mockBidRequest.update.mockResolvedValue({})
    mockCotacao.update.mockResolvedValue({})

    const res = await request(app)
      .post('/api/v1/bid-frete/bids/disparar')
      .send({
        cotacao_id: 'cot-001',
        fornecedor_ids: ['f-001', 'f-002'],
        canais: ['EMAIL'],
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('disparos')
    expect(res.body.disparos).toBeGreaterThanOrEqual(2)
    expect(res.body).toHaveProperty('results')
  })

  it('400 — rejeita sem cotacao_id', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/bids/disparar')
      .send({ fornecedor_ids: ['f-001'], canais: ['EMAIL'] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita sem fornecedor_ids', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/bids/disparar')
      .send({ cotacao_id: 'cot-001', canais: ['EMAIL'] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita fornecedor_ids vazio', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/bids/disparar')
      .send({ cotacao_id: 'cot-001', fornecedor_ids: [], canais: ['EMAIL'] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita sem canais', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/bids/disparar')
      .send({ cotacao_id: 'cot-001', fornecedor_ids: ['f-001'] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita canal invalido', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/bids/disparar')
      .send({ cotacao_id: 'cot-001', fornecedor_ids: ['f-001'], canais: ['POMBO_CORREIO'] })

    expect(res.status).toBe(400)
  })

  it('500 — cotacao nao encontrada lanca erro', async () => {
    mockCotacao.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/bid-frete/bids/disparar')
      .send({ cotacao_id: 'inexistente', fornecedor_ids: ['f-001'], canais: ['EMAIL'] })

    expect(res.status).toBe(500) // bidEngine lanca Error generico
  })
})

// ===========================================================================
// POST /api/v1/bid-frete/bids/cotacao-aberta — disparo aberto
// ===========================================================================

describe('POST /api/v1/bid-frete/bids/cotacao-aberta — disparo aberto', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — dispara para todos os fornecedores ativos que aceitam cotacao aberta', async () => {
    mockFornecedor.findMany.mockResolvedValueOnce([{ id: 'f-001' }, { id: 'f-002' }]) // busca fornecedores ativos
    // bidEngine mocks
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', numero: 'BID-001', origem_codigo: 'CNSHA', destino_codigo: 'BRSSZ', modal: 'MARITIMO' })
    mockFornecedor.findMany.mockResolvedValueOnce([
      { id: 'f-001', nome: 'Asia', email: 'a@t.com', status: 'ATIVO', cotacao_automatica: false },
      { id: 'f-002', nome: 'Maersk', email: 'm@t.com', status: 'ATIVO', cotacao_automatica: false },
    ])
    mockTabelaPreco.findFirst.mockResolvedValue(null)
    mockBidRequest.create.mockResolvedValue({ id: 'br-001' })
    mockBidRequest.update.mockResolvedValue({})
    mockCotacao.update.mockResolvedValue({})

    const res = await request(app)
      .post('/api/v1/bid-frete/bids/cotacao-aberta')
      .send({ cotacao_id: 'cot-001', canais: ['EMAIL'] })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('disparos')
  })

  it('200 — retorna 0 disparos se nenhum fornecedor aceita cotacao aberta', async () => {
    mockFornecedor.findMany.mockResolvedValue([])

    const res = await request(app)
      .post('/api/v1/bid-frete/bids/cotacao-aberta')
      .send({ cotacao_id: 'cot-001', canais: ['EMAIL'] })

    expect(res.status).toBe(200)
    expect(res.body.disparos).toBe(0)
    expect(res.body.message).toBeDefined()
  })

  it('400 — rejeita sem cotacao_id', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/bids/cotacao-aberta')
      .send({ canais: ['EMAIL'] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita sem canais', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/bids/cotacao-aberta')
      .send({ cotacao_id: 'cot-001' })

    expect(res.status).toBe(400)
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/bids/cotacao/:id — listar BidRequests
// ===========================================================================

describe('GET /api/v1/bid-frete/bids/cotacao/:id — listar BidRequests de uma cotacao', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna lista de BidRequests com fornecedor e response', async () => {
    mockBidRequest.findMany.mockResolvedValue([
      {
        id: 'br-001', cotacao_id: 'cot-001', canal: 'EMAIL', status: 'ENVIADO',
        fornecedor: { id: 'f-001', nome: 'Asia Shipping', tipo: 'AGENTE_CARGA', email: 'asia@test.com', whatsapp: null },
        response: { id: 'resp-001', valor_total: 2500, transit_time_dias: 30, status: 'EM_ANALISE' },
      },
      {
        id: 'br-002', cotacao_id: 'cot-001', canal: 'EMAIL', status: 'PENDENTE',
        fornecedor: { id: 'f-002', nome: 'Maersk', tipo: 'ARMADOR', email: 'maersk@test.com', whatsapp: null },
        response: null,
      },
    ])

    const res = await request(app).get('/api/v1/bid-frete/bids/cotacao/cot-001')

    expect(res.status).toBe(200)
    expect(res.body.requests).toHaveLength(2)
    expect(res.body.requests[0]).toHaveProperty('fornecedor')
    expect(res.body.requests[0].fornecedor.nome).toBe('Asia Shipping')
    expect(res.body.requests[0]).toHaveProperty('response')
    expect(res.body.requests[1].response).toBeNull()
  })

  it('200 — retorna array vazio se cotacao sem bid requests', async () => {
    mockBidRequest.findMany.mockResolvedValue([])

    const res = await request(app).get('/api/v1/bid-frete/bids/cotacao/cot-vazia')

    expect(res.status).toBe(200)
    expect(res.body.requests).toHaveLength(0)
  })
})
