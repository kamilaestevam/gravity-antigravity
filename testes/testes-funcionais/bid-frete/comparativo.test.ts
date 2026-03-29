// @vitest-environment node
/**
 * Testes funcionais v2 — BID Frete / Comparativo e Aprovacao
 * GET  /api/v1/bid-frete/comparativo/:cotacaoId         Ranking comparativo
 * POST /api/v1/bid-frete/comparativo/:cotacaoId/aprovar  Aprovar cotacao
 * POST /api/v1/bid-frete/comparativo/:cotacaoId/reprovar Reprovar cotacao
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('axios', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }), get: vi.fn().mockResolvedValue({ data: {} }) },
}))

vi.mock('../../../produto/bid-frete/server/src/services/tenantIntegrations.js', () => ({
  atividadesIntegration: { cotacaoCriada: vi.fn(), aguardandoAprovacao: vi.fn() },
  historicoIntegration: { cotacaoCriada: vi.fn(), cotacaoAprovada: vi.fn(), cotacaoReprovada: vi.fn(), registrar: vi.fn() },
  notificacoesIntegration: { fornecedorRespondeu: vi.fn(), cotacaoAprovada: vi.fn() },
  gabiIntegration: { analisarPropostas: vi.fn().mockResolvedValue({ recomendacao: 'Fornecedor A' }) },
}))

const mockCotacao = {
  findFirst: vi.fn(),
  update: vi.fn(),
}

const mockBidResponse = {
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
}

const mockRatingFornecedor = {
  findMany: vi.fn(),
}

const mockSaving = {
  create: vi.fn(),
}

const mockPrisma = {
  cotacao: mockCotacao,
  bidResponse: mockBidResponse,
  ratingFornecedor: mockRatingFornecedor,
  saving: mockSaving,
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

import { comparativoRouter } from '../../../produto/bid-frete/server/src/routes/comparativo.js'

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
  app.use('/api/v1/bid-frete/comparativo', comparativoRouter)
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

// ===========================================================================
// GET /api/v1/bid-frete/comparativo/:cotacaoId — ranking
// ===========================================================================

describe('GET /api/v1/bid-frete/comparativo/:cotacaoId — ranking comparativo', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna ranking ordenado por valor com tags', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', numero: 'BID-001', valor_target: 3000 })
    mockBidResponse.findMany.mockResolvedValue([
      {
        id: 'r-001', valor_total: 2200, valor_frete: 1800, taxas_origem: 200, taxas_destino: 200,
        transit_time_dias: 25, free_time_dias: 14, moeda: 'USD', transbordos: 0,
        validade_cotacao: '2026-04-15', via_tabela_padrao: false, via_api: false,
        fornecedor: { id: 'f-001', nome: 'Asia Shipping', tipo: 'AGENTE_CARGA', email: 'asia@test.com' },
        detalhes_taxas: [],
      },
      {
        id: 'r-002', valor_total: 2800, valor_frete: 2200, taxas_origem: 300, taxas_destino: 300,
        transit_time_dias: 20, free_time_dias: 21, moeda: 'USD', transbordos: 1,
        validade_cotacao: '2026-04-15', via_tabela_padrao: false, via_api: false,
        fornecedor: { id: 'f-002', nome: 'Maersk', tipo: 'ARMADOR', email: 'maersk@test.com' },
        detalhes_taxas: [],
      },
    ])
    mockRatingFornecedor.findMany.mockResolvedValue([
      { fornecedor_email: 'asia@test.com', rating_global: 4.5 },
      { fornecedor_email: 'maersk@test.com', rating_global: 4.2 },
    ])
    mockBidResponse.update.mockResolvedValue({})

    const res = await request(app).get('/api/v1/bid-frete/comparativo/cot-001')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ranking')
    expect(res.body.ranking).toBeInstanceOf(Array)
    expect(res.body.ranking.length).toBe(2)
    expect(res.body).toHaveProperty('saving')
    expect(res.body.saving).toHaveProperty('vs_target')
    expect(res.body.saving).toHaveProperty('vs_media')
    expect(res.body).toHaveProperty('cotacao')

    // O ranking deve conter as tags de melhor preco/transit
    const allTags = res.body.ranking.flatMap((r: any) => r.tags)
    expect(allTags).toContain('MELHOR_PRECO')
    expect(allTags).toContain('MELHOR_TRANSIT')
  })

  it('200 — retorna ranking vazio quando sem respostas', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', numero: 'BID-001', valor_target: null })
    mockBidResponse.findMany.mockResolvedValue([])
    mockRatingFornecedor.findMany.mockResolvedValue([])

    const res = await request(app).get('/api/v1/bid-frete/comparativo/cot-001')

    expect(res.status).toBe(200)
    expect(res.body.ranking).toHaveLength(0)
    expect(res.body.saving.vs_target).toBeNull()
    expect(res.body.saving.vs_media).toBeNull()
  })

  it('500 — cotacao nao encontrada', async () => {
    mockCotacao.findFirst.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/bid-frete/comparativo/nao-existe')

    expect(res.status).toBe(500) // comparativoEngine lanca Error generico
  })
})

// ===========================================================================
// POST /api/v1/bid-frete/comparativo/:cotacaoId/aprovar
// ===========================================================================

describe('POST /api/v1/bid-frete/comparativo/:cotacaoId/aprovar — aprovar cotacao', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — aprova cotacao com response_id', async () => {
    mockBidResponse.findFirst.mockResolvedValue({
      id: 'r-001', cotacao_id: 'cot-001', fornecedor_id: 'f-001', valor_total: 2200, moeda: 'USD',
    })
    mockCotacao.findFirst.mockResolvedValue({
      id: 'cot-001', valor_target: 3000, company_id: 'comp-001', user_id: 'user-001', numero: 'BID-001',
    })
    mockBidResponse.update.mockResolvedValue({})
    mockBidResponse.updateMany.mockResolvedValue({})
    mockBidResponse.findMany.mockResolvedValue([
      { valor_total: 2200 },
      { valor_total: 2800 },
    ])
    mockCotacao.update.mockResolvedValue({})
    mockSaving.create.mockResolvedValue({})

    const res = await request(app)
      .post('/api/v1/bid-frete/comparativo/cot-001/aprovar')
      .send({ response_id: 'r-001' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('approved', true)
    expect(res.body).toHaveProperty('saving_percentual')
  })

  it('400 — rejeita sem response_id', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/comparativo/cot-001/aprovar')
      .send({})

    expect(res.status).toBe(400)
  })

  it('500 — resposta nao encontrada', async () => {
    mockBidResponse.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/bid-frete/comparativo/cot-001/aprovar')
      .send({ response_id: 'r-inexistente' })

    expect(res.status).toBe(500) // comparativoEngine lanca Error generico
  })
})

// ===========================================================================
// POST /api/v1/bid-frete/comparativo/:cotacaoId/reprovar
// ===========================================================================

describe('POST /api/v1/bid-frete/comparativo/:cotacaoId/reprovar — reprovar cotacao', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — reprova cotacao com motivo', async () => {
    mockCotacao.update.mockResolvedValue({ id: 'cot-001', status: 'REPROVADA' })
    mockBidResponse.updateMany.mockResolvedValue({ count: 3 })

    const res = await request(app)
      .post('/api/v1/bid-frete/comparativo/cot-001/reprovar')
      .send({ motivo: 'Valores acima do orcamento' })

    expect(res.status).toBe(200)
    expect(res.body.reprovada).toBe(true)
    expect(mockCotacao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'REPROVADA',
          motivo_reprovacao: 'Valores acima do orcamento',
        }),
      })
    )
    expect(mockBidResponse.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'REPROVADA' },
      })
    )
  })

  it('200 — reprova cotacao sem motivo (motivo null)', async () => {
    mockCotacao.update.mockResolvedValue({ id: 'cot-001', status: 'REPROVADA' })
    mockBidResponse.updateMany.mockResolvedValue({ count: 2 })

    const res = await request(app)
      .post('/api/v1/bid-frete/comparativo/cot-001/reprovar')
      .send({})

    expect(res.status).toBe(200)
    expect(res.body.reprovada).toBe(true)
    expect(mockCotacao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'REPROVADA',
          motivo_reprovacao: null,
        }),
      })
    )
  })

  it('200 — marca todas as respostas como reprovadas', async () => {
    mockCotacao.update.mockResolvedValue({})
    mockBidResponse.updateMany.mockResolvedValue({ count: 5 })

    await request(app)
      .post('/api/v1/bid-frete/comparativo/cot-001/reprovar')
      .send({ motivo: 'Teste' })

    expect(mockBidResponse.updateMany).toHaveBeenCalledWith({
      where: { cotacao_id: 'cot-001' },
      data: { status: 'REPROVADA' },
    })
  })
})
