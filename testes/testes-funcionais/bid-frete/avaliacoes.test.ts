// @vitest-environment node
/**
 * Testes funcionais v2 — BID Frete / Avaliacoes de Fornecedores
 * POST /api/v1/bid-frete/avaliacoes                    Avaliar fornecedor
 * GET  /api/v1/bid-frete/avaliacoes/fornecedor/:id     Rating de um fornecedor
 * GET  /api/v1/bid-frete/avaliacoes/ranking             Ranking global
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
  atividadesIntegration: { cotacaoCriada: vi.fn() },
  historicoIntegration: { cotacaoCriada: vi.fn(), fornecedorAvaliado: vi.fn(), registrar: vi.fn() },
  notificacoesIntegration: { fornecedorRespondeu: vi.fn() },
}))

vi.mock('../../../produto/bid-frete/server/src/services/ratingEngine.js', () => ({
  ratingEngine: { recalcular: vi.fn().mockResolvedValue({ rating_global: 4.3, fornecedor_email: 'test@test.com' }) },
}))

const mockAvaliacao = {
  create: vi.fn(),
  findMany: vi.fn(),
}

const mockFornecedor = {
  findFirst: vi.fn(),
  findMany: vi.fn(),
}

const mockRatingFornecedor = {
  findUnique: vi.fn(),
  findMany: vi.fn(),
}

const mockPrisma = {
  avaliacao: mockAvaliacao,
  fornecedor: mockFornecedor,
  ratingFornecedor: mockRatingFornecedor,
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

import { avaliacoesRouter } from '../../../produto/bid-frete/server/src/routes/avaliacoes.js'

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const appReq = req as AppRequest
    appReq.tenantId = 'tenant-test-001'
    appReq.prisma = mockPrisma
    req.headers['x-user-id'] = 'user-test-001'
    req.headers['x-internal-key'] = 'test-key'
    req.headers['x-tenant-id'] = 'tenant-test-001'
    next()
  })
  app.use('/api/v1/bid-frete/avaliacoes', avaliacoesRouter)
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

// ===========================================================================
// POST /api/v1/bid-frete/avaliacoes — avaliar fornecedor
// ===========================================================================

describe('POST /api/v1/bid-frete/avaliacoes — avaliar fornecedor', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('201 — cria avaliacao com notas 1-5', async () => {
    mockAvaliacao.create.mockResolvedValue({
      id: 'av-001', fornecedor_id: 'f-001',
      nota_frete: 5, nota_atendimento: 4, nota_resposta: 5, nota_confiabilidade: 4, nota_geral: 4.5,
    })
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', email: 'asia@test.com' })

    const res = await request(app)
      .post('/api/v1/bid-frete/avaliacoes')
      .send({
        fornecedor_id: 'f-001',
        nota_frete: 5,
        nota_atendimento: 4,
        nota_resposta: 5,
        nota_confiabilidade: 4,
        comentario: 'Excelente fornecedor',
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('avaliacao')
    expect(res.body.avaliacao).toHaveProperty('id')
  })

  it('201 — cria avaliacao com apenas uma nota', async () => {
    mockAvaliacao.create.mockResolvedValue({
      id: 'av-002', fornecedor_id: 'f-001', nota_frete: 3, nota_geral: 3,
    })
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', email: 'asia@test.com' })

    const res = await request(app)
      .post('/api/v1/bid-frete/avaliacoes')
      .send({ fornecedor_id: 'f-001', nota_frete: 3 })

    expect(res.status).toBe(201)
  })

  it('201 — cria avaliacao vinculada a cotacao', async () => {
    mockAvaliacao.create.mockResolvedValue({ id: 'av-003', fornecedor_id: 'f-001', cotacao_id: 'cot-001' })
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', email: 'asia@test.com' })

    const res = await request(app)
      .post('/api/v1/bid-frete/avaliacoes')
      .send({ fornecedor_id: 'f-001', cotacao_id: 'cot-001', nota_atendimento: 5 })

    expect(res.status).toBe(201)
  })

  it('400 — rejeita sem fornecedor_id', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/avaliacoes')
      .send({ nota_frete: 5 })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita nota_frete acima de 5', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/avaliacoes')
      .send({ fornecedor_id: 'f-001', nota_frete: 6 })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita nota_frete abaixo de 1', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/avaliacoes')
      .send({ fornecedor_id: 'f-001', nota_frete: 0 })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita nota_atendimento acima de 5', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/avaliacoes')
      .send({ fornecedor_id: 'f-001', nota_atendimento: 10 })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita nota_resposta abaixo de 1', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/avaliacoes')
      .send({ fornecedor_id: 'f-001', nota_resposta: -1 })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita nota_confiabilidade fracionaria', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/avaliacoes')
      .send({ fornecedor_id: 'f-001', nota_confiabilidade: 3.5 })

    expect(res.status).toBe(400)
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/avaliacoes/fornecedor/:id — rating de um fornecedor
// ===========================================================================

describe('GET /api/v1/bid-frete/avaliacoes/fornecedor/:id — rating do fornecedor', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna rating e avaliacoes do fornecedor', async () => {
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-001', nome: 'Asia Shipping', email: 'asia@test.com' })
    mockRatingFornecedor.findUnique.mockResolvedValue({ rating_global: 4.5, taxa_resposta: 85 })
    mockAvaliacao.findMany.mockResolvedValue([
      { id: 'av-001', nota_geral: 4.5, comentario: 'Excelente' },
      { id: 'av-002', nota_geral: 4.0, comentario: 'Bom' },
    ])

    const res = await request(app).get('/api/v1/bid-frete/avaliacoes/fornecedor/f-001')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('fornecedor_nome', 'Asia Shipping')
    expect(res.body).toHaveProperty('rating')
    expect(res.body.rating.rating_global).toBe(4.5)
    expect(res.body).toHaveProperty('avaliacoes')
    expect(res.body.avaliacoes).toHaveLength(2)
  })

  it('200 — retorna rating null se tabela nao existe', async () => {
    mockFornecedor.findFirst.mockResolvedValue({ id: 'f-002', nome: 'Novo', email: 'novo@test.com' })
    mockRatingFornecedor.findUnique.mockRejectedValue(new Error('table not found'))
    mockAvaliacao.findMany.mockResolvedValue([])

    const res = await request(app).get('/api/v1/bid-frete/avaliacoes/fornecedor/f-002')

    expect(res.status).toBe(200)
    expect(res.body.rating).toBeNull()
    expect(res.body.avaliacoes).toHaveLength(0)
  })

  it('404 — fornecedor nao encontrado', async () => {
    mockFornecedor.findFirst.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/bid-frete/avaliacoes/fornecedor/nao-existe')

    expect(res.status).toBe(404)
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/avaliacoes/ranking — ranking global
// ===========================================================================

describe('GET /api/v1/bid-frete/avaliacoes/ranking — ranking global de fornecedores', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna ranking ordenado por rating', async () => {
    mockFornecedor.findMany.mockResolvedValue([
      { id: 'f-001', nome: 'Asia Shipping', tipo: 'AGENTE_CARGA', email: 'asia@test.com' },
      { id: 'f-002', nome: 'Maersk', tipo: 'ARMADOR', email: 'maersk@test.com' },
    ])
    mockRatingFornecedor.findMany.mockResolvedValue([
      { fornecedor_email: 'asia@test.com', rating_global: 4.5 },
      { fornecedor_email: 'maersk@test.com', rating_global: 4.2 },
    ])

    const res = await request(app).get('/api/v1/bid-frete/avaliacoes/ranking')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ranking')
    expect(res.body.ranking).toBeInstanceOf(Array)
    expect(res.body.ranking.length).toBe(2)
    expect(res.body.ranking[0]).toHaveProperty('posicao', 1)
    expect(res.body.ranking[0]).toHaveProperty('fornecedor_nome')
    expect(res.body.ranking[0]).toHaveProperty('rating_global')
  })

  it('200 — filtra ranking por tipo', async () => {
    mockFornecedor.findMany.mockResolvedValue([])
    mockRatingFornecedor.findMany.mockResolvedValue([])

    await request(app).get('/api/v1/bid-frete/avaliacoes/ranking?tipo=ARMADOR')

    expect(mockFornecedor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tipo: 'ARMADOR' }),
      })
    )
  })

  it('200 — retorna ranking vazio se nenhum fornecedor avaliado', async () => {
    mockFornecedor.findMany.mockResolvedValue([])
    mockRatingFornecedor.findMany.mockResolvedValue([])

    const res = await request(app).get('/api/v1/bid-frete/avaliacoes/ranking')

    expect(res.status).toBe(200)
    expect(res.body.ranking).toHaveLength(0)
  })

  it('200 — aceita limit customizado', async () => {
    mockFornecedor.findMany.mockResolvedValue([])
    mockRatingFornecedor.findMany.mockResolvedValue([])

    await request(app).get('/api/v1/bid-frete/avaliacoes/ranking?limit=5')

    expect(mockRatingFornecedor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
      })
    )
  })
})
