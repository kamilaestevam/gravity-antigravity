// @vitest-environment node
/**
 * Testes funcionais v2 — BID Frete / Portal do Fornecedor
 * GET  /api/v1/bid-frete/portal/dashboard
 * GET  /api/v1/bid-frete/portal/cotacoes-pendentes
 * GET  /api/v1/bid-frete/portal/minhas-respostas
 * POST /api/v1/bid-frete/portal/responder/:bidRequestId
 * GET  /api/v1/bid-frete/portal/meu-desempenho
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

interface AppRequest extends Request {
  tenantId?: string
  prisma?: unknown
}

interface HttpError extends Error {
  statusCode?: number
  code?: string
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('axios', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }), get: vi.fn().mockResolvedValue({ data: {} }) },
}))

vi.mock('../../../produto/bid-frete/server/src/services/tenantIntegrations.js', () => ({
  atividadesIntegration: { cotacaoCriada: vi.fn(), aguardandoAprovacao: vi.fn() },
  historicoIntegration: { cotacaoCriada: vi.fn(), fornecedorRespondeu: vi.fn(), registrar: vi.fn() },
  notificacoesIntegration: { fornecedorRespondeu: vi.fn(), cotacaoAprovada: vi.fn() },
}))

vi.mock('../../../produto/bid-frete/server/src/services/ratingEngine.js', () => ({
  ratingEngine: { recalcular: vi.fn().mockResolvedValue({ rating_global: 4.3, fornecedor_email: 'test@test.com' }) },
}))

vi.mock('../../../produto/bid-frete/server/src/services/monetizacao.js', () => ({
  monetizacao: { resumoFornecedor: vi.fn().mockResolvedValue({ total_fretes_fechados: 5, free_tier_restante: 5 }) },
}))

const mockFornecedor = {
  findFirst: vi.fn(),
}

const mockBidRequest = {
  count: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
}

const mockBidResponse = {
  count: vi.fn(),
  create: vi.fn(),
  findMany: vi.fn(),
}

const mockDetalheTaxa = {
  createMany: vi.fn(),
}

const mockCotacao = {
  findFirst: vi.fn(),
  update: vi.fn(),
}

const mockRatingFornecedor = {
  findUnique: vi.fn(),
}

const mockAvaliacao = {
  findMany: vi.fn(),
}

const mockPrisma = {
  fornecedor: mockFornecedor,
  bidRequest: mockBidRequest,
  bidResponse: mockBidResponse,
  detalheTaxa: mockDetalheTaxa,
  cotacao: mockCotacao,
  ratingFornecedor: mockRatingFornecedor,
  avaliacao: mockAvaliacao,
}

vi.mock('../../../produto/bid-frete/server/src/middleware/tenantIsolation.js', () => ({
  tenantIsolationMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    const appReq = req as AppRequest
    appReq.tenantId = 'tenant-test-001'
    appReq.prisma = mockPrisma
    next()
  },
  prisma: { $queryRaw: vi.fn().mockResolvedValue([1]) },
}))

vi.mock('../../../produto/bid-frete/server/src/middleware/requireInternalKey.js', () => ({
  requireInternalKey: (_req: Request, _res: Response, next: NextFunction) => next(),
}))

import { portalRouter } from '../../../produto/bid-frete/server/src/routes/portal.js'

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const appReq = req as AppRequest
    appReq.tenantId = 'tenant-test-001'
    appReq.prisma = mockPrisma
    req.headers['x-user-id'] = 'user-forn-001'
    req.headers['x-internal-key'] = 'test-key'
    req.headers['x-tenant-id'] = 'tenant-test-001'
    next()
  })
  app.use('/api/v1/bid-frete/portal', portalRouter)
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

// ===========================================================================
// GET /api/v1/bid-frete/portal/dashboard — dashboard do fornecedor
// ===========================================================================

describe('GET /api/v1/bid-frete/portal/dashboard — portal KPIs', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna metricas do fornecedor', async () => {
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', nome: 'Asia Shipping', tipo: 'AGENTE_CARGA', email: 'asia@test.com' })
    mockBidRequest.count
      .mockResolvedValueOnce(5)  // pendentes
      .mockResolvedValueOnce(20) // totalRequests
    mockBidResponse.count
      .mockResolvedValueOnce(15) // respondidas
      .mockResolvedValueOnce(8)  // aprovadas
    mockRatingFornecedor.findUnique.mockResolvedValue({ rating_global: 4.5 })

    const res = await request(app).get('/api/v1/bid-frete/portal/dashboard')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('fornecedor')
    expect(res.body.fornecedor.nome).toBe('Asia Shipping')
    expect(res.body).toHaveProperty('metricas')
    expect(res.body.metricas).toHaveProperty('cotacoes_pendentes')
    expect(res.body.metricas).toHaveProperty('cotacoes_respondidas')
    expect(res.body.metricas).toHaveProperty('cotacoes_aprovadas')
    expect(res.body.metricas).toHaveProperty('total_recebidas')
    expect(res.body.metricas).toHaveProperty('taxa_resposta')
    expect(res.body.metricas).toHaveProperty('taxa_aprovacao')
    expect(res.body).toHaveProperty('rating')
  })

  it('404 — fornecedor nao encontrado para este usuario', async () => {
    mockFornecedor.findFirst.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/bid-frete/portal/dashboard')

    expect(res.status).toBe(404)
  })

  it('200 — rating pode ser null (fornecedor sem avaliacoes)', async () => {
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', nome: 'Novo', tipo: 'AGENTE_CARGA', email: 'novo@test.com' })
    mockBidRequest.count.mockResolvedValue(0)
    mockBidResponse.count.mockResolvedValue(0)
    mockRatingFornecedor.findUnique.mockRejectedValue(new Error('not found'))

    const res = await request(app).get('/api/v1/bid-frete/portal/dashboard')

    expect(res.status).toBe(200)
    expect(res.body.rating).toBeNull()
    expect(res.body.metricas.taxa_resposta).toBe('0')
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/portal/cotacoes-pendentes — pendentes
// ===========================================================================

describe('GET /api/v1/bid-frete/portal/cotacoes-pendentes — cotacoes pendentes', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna cotacoes pendentes com dados da cotacao', async () => {
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', nome: 'Asia', clerk_user_id: 'user-forn-001' })
    mockBidRequest.findMany.mockResolvedValue([
      {
        id: 'br-001', status: 'ENVIADO',
        cotacao: {
          id: 'cot-001', numero: 'BID-001', modal: 'MARITIMO', modalidade: 'FCL',
          origem_nome: 'Shanghai', origem_pais: 'China',
          destino_nome: 'Santos', destino_pais: 'Brasil',
          descricao_mercadoria: 'Auto Parts', incoterm: 'FOB',
          data_limite_resposta: '2026-04-15',
        },
      },
    ])
    mockBidRequest.updateMany.mockResolvedValue({})

    const res = await request(app).get('/api/v1/bid-frete/portal/cotacoes-pendentes')

    expect(res.status).toBe(200)
    expect(res.body.requests).toHaveLength(1)
    expect(res.body.requests[0].cotacao).toHaveProperty('numero', 'BID-001')
  })

  it('200 — marca requests ENVIADO como VISUALIZADO', async () => {
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', clerk_user_id: 'user-forn-001' })
    mockBidRequest.findMany.mockResolvedValue([
      { id: 'br-001', status: 'ENVIADO', cotacao: { id: 'c1' } },
      { id: 'br-002', status: 'VISUALIZADO', cotacao: { id: 'c2' } },
    ])
    mockBidRequest.updateMany.mockResolvedValue({})

    await request(app).get('/api/v1/bid-frete/portal/cotacoes-pendentes')

    expect(mockBidRequest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['br-001'] } },
        data: expect.objectContaining({ status: 'VISUALIZADO' }),
      })
    )
  })

  it('404 — fornecedor nao encontrado', async () => {
    mockFornecedor.findFirst.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/bid-frete/portal/cotacoes-pendentes')

    expect(res.status).toBe(404)
  })

  it('200 — retorna vazio se nenhuma cotacao pendente', async () => {
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', clerk_user_id: 'user-forn-001' })
    mockBidRequest.findMany.mockResolvedValue([])
    mockBidRequest.updateMany.mockResolvedValue({})

    const res = await request(app).get('/api/v1/bid-frete/portal/cotacoes-pendentes')

    expect(res.status).toBe(200)
    expect(res.body.requests).toHaveLength(0)
  })
})

// ===========================================================================
// POST /api/v1/bid-frete/portal/responder/:bidRequestId — responder cotacao
// ===========================================================================

describe('POST /api/v1/bid-frete/portal/responder/:bidRequestId — responder cotacao', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  const respostaValida = {
    valor_frete: 2000,
    taxas_origem: 200,
    taxas_destino: 300,
    transit_time_dias: 30,
    validade_cotacao: '2026-04-30T00:00:00.000Z',
  }

  it('201 — responde cotacao com dados validos', async () => {
    mockBidRequest.findFirst.mockResolvedValue({
      id: 'br-001', cotacao_id: 'cot-001', fornecedor_id: 'f-001', status: 'ENVIADO',
    })
    mockBidResponse.create.mockResolvedValue({ id: 'resp-001', valor_total: 2500 })
    mockBidRequest.update.mockResolvedValue({})
    mockBidRequest.count
      .mockResolvedValueOnce(3) // totalRequests
      .mockResolvedValueOnce(1) // totalRespondidos (ainda nao completo)
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', numero: 'BID-001', user_id: 'user-001' })
    mockCotacao.update.mockResolvedValue({})
    mockFornecedor.findFirst.mockResolvedValue({ nome: 'Asia Shipping' })

    const res = await request(app)
      .post('/api/v1/bid-frete/portal/responder/br-001')
      .send(respostaValida)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('response')
    expect(res.body.response).toHaveProperty('id')
  })

  it('201 — resposta com detalhes de taxas', async () => {
    mockBidRequest.findFirst.mockResolvedValue({
      id: 'br-001', cotacao_id: 'cot-001', fornecedor_id: 'f-001', status: 'ENVIADO',
    })
    mockBidResponse.create.mockResolvedValue({ id: 'resp-002', valor_total: 2500 })
    mockDetalheTaxa.createMany.mockResolvedValue({})
    mockBidRequest.update.mockResolvedValue({})
    mockBidRequest.count.mockResolvedValue(1)
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', numero: 'BID-001', user_id: 'u1' })
    mockCotacao.update.mockResolvedValue({})
    mockFornecedor.findFirst.mockResolvedValue({ nome: 'Asia Shipping' })

    const res = await request(app)
      .post('/api/v1/bid-frete/portal/responder/br-001')
      .send({
        ...respostaValida,
        detalhes_taxas: [
          { tipo: 'origem', nome: 'THC Origem', valor: 200, moeda: 'USD' },
          { tipo: 'destino', nome: 'THC Destino', valor: 300, moeda: 'USD' },
        ],
      })

    expect(res.status).toBe(201)
    expect(mockDetalheTaxa.createMany).toHaveBeenCalledTimes(1)
  })

  it('400 — rejeita dados invalidos (sem valor_frete)', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/portal/responder/br-001')
      .send({ transit_time_dias: 30, validade_cotacao: '2026-04-30T00:00:00.000Z' })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita valor_frete negativo', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/portal/responder/br-001')
      .send({ ...respostaValida, valor_frete: -100 })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita transit_time_dias zero', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/portal/responder/br-001')
      .send({ ...respostaValida, transit_time_dias: 0 })

    expect(res.status).toBe(400)
  })

  it('404 — BidRequest nao encontrado', async () => {
    mockBidRequest.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/bid-frete/portal/responder/br-inexistente')
      .send(respostaValida)

    expect(res.status).toBe(404)
  })

  it('400 — cotacao ja respondida', async () => {
    mockBidRequest.findFirst.mockResolvedValue({
      id: 'br-001', cotacao_id: 'cot-001', fornecedor_id: 'f-001', status: 'RESPONDIDO',
    })

    const res = await request(app)
      .post('/api/v1/bid-frete/portal/responder/br-001')
      .send(respostaValida)

    expect(res.status).toBe(400)
  })

  it('201 — atualiza cotacao para AGUARDANDO_APROVACAO quando todas respostas chegam', async () => {
    mockBidRequest.findFirst.mockResolvedValue({
      id: 'br-001', cotacao_id: 'cot-001', fornecedor_id: 'f-001', status: 'ENVIADO',
    })
    mockBidResponse.create.mockResolvedValue({ id: 'resp-001', valor_total: 2500 })
    mockBidRequest.update.mockResolvedValue({})
    mockBidRequest.count
      .mockResolvedValueOnce(2) // totalRequests
      .mockResolvedValueOnce(2) // totalRespondidos (todos responderam)
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', numero: 'BID-001', user_id: 'u1' })
    mockCotacao.update.mockResolvedValue({})
    mockFornecedor.findFirst.mockResolvedValue({ nome: 'Asia Shipping' })

    await request(app)
      .post('/api/v1/bid-frete/portal/responder/br-001')
      .send(respostaValida)

    expect(mockCotacao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'AGUARDANDO_APROVACAO' },
      })
    )
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/portal/minhas-respostas — historico de respostas
// ===========================================================================

describe('GET /api/v1/bid-frete/portal/minhas-respostas — historico de respostas', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna respostas com paginacao', async () => {
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', clerk_user_id: 'user-forn-001' })
    mockBidResponse.findMany.mockResolvedValue([
      {
        id: 'resp-001', valor_total: 2500,
        cotacao: { id: 'cot-001', numero: 'BID-001', origem_nome: 'Shanghai', destino_nome: 'Santos', modal: 'MARITIMO', status: 'APROVADA' },
        detalhes_taxas: [],
      },
    ])
    mockBidResponse.count.mockResolvedValue(1)

    const res = await request(app).get('/api/v1/bid-frete/portal/minhas-respostas')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('respostas')
    expect(res.body.respostas).toHaveLength(1)
    expect(res.body).toHaveProperty('pagination')
    expect(res.body.pagination.total).toBe(1)
  })

  it('404 — fornecedor nao encontrado', async () => {
    mockFornecedor.findFirst.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/bid-frete/portal/minhas-respostas')

    expect(res.status).toBe(404)
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/portal/meu-desempenho — metricas e rating
// ===========================================================================

describe('GET /api/v1/bid-frete/portal/meu-desempenho — metricas de desempenho', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna rating e avaliacoes recentes', async () => {
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', nome: 'Asia', email: 'asia@test.com', clerk_user_id: 'user-forn-001' })
    mockAvaliacao.findMany.mockResolvedValue([
      { id: 'av-001', nota_geral: 4.5, comentario: 'Excelente' },
      { id: 'av-002', nota_geral: 3.8, comentario: 'Bom' },
    ])

    const res = await request(app).get('/api/v1/bid-frete/portal/meu-desempenho')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('rating')
    expect(res.body.rating).toHaveProperty('rating_global')
    expect(res.body).toHaveProperty('avaliacoes')
    expect(res.body.avaliacoes).toHaveLength(2)
  })

  it('404 — fornecedor nao encontrado', async () => {
    mockFornecedor.findFirst.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/bid-frete/portal/meu-desempenho')

    expect(res.status).toBe(404)
  })
})
