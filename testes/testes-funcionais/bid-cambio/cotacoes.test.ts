// @vitest-environment node
/**
 * Testes funcionais — BID Cambio / Rotas de Cotacoes (Pilar 2)
 * POST   /api/v1/bid-cambio/cotacoes
 * GET    /api/v1/bid-cambio/cotacoes
 * GET    /api/v1/bid-cambio/cotacoes/:id
 * PATCH  /api/v1/bid-cambio/cotacoes/:id
 * DELETE /api/v1/bid-cambio/cotacoes/:id
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// --- Mocks ---

vi.mock('axios', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }) },
}))

vi.mock('../../../produto/bid-cambio/server/src/services/tenantIntegrations.js', () => ({
  atividadesIntegration: { criarAtividade: vi.fn() },
  historicoIntegration: { registrar: vi.fn() },
  notificacoesIntegration: { enviar: vi.fn() },
  emailIntegration: { enviar: vi.fn() },
}))

const mockCotacaoCambio = {
  create: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
}

vi.mock('../../../produto/bid-cambio/server/src/middleware/tenantIsolation.js', () => ({
  tenantIsolationMiddleware: vi.fn(),
  withTenantIsolation: vi.fn(),
  prisma: { $queryRaw: vi.fn().mockResolvedValue([1]) },
}))

vi.mock('../../../produto/bid-cambio/server/src/middleware/requireInternalKey.js', () => ({
  requireInternalKey: (_req: any, _res: any, next: any) => next(),
}))

import { cotacoesRouter } from '../../../produto/bid-cambio/server/src/routes/cotacoes.js'

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use((req: any, _res: any, next: any) => {
    req.tenantId = 'tenant-test-001'
    req.prisma = { cotacaoCambio: mockCotacaoCambio }
    req.headers['x-user-id'] = 'user-test-001'
    next()
  })
  app.use('/api/v1/bid-cambio/cotacoes', cotacoesRouter)
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } })
  })
  return app
}

const COTACAO_BASE = {
  id: 'cotacao-001',
  tenant_id: 'tenant-test-001',
  product_id: 'bid-cambio',
  user_id: 'user-test-001',
  moeda: 'USD',
  valor: 50000,
  tipo_operacao: 'IMPORTACAO',
  modalidade: 'PRONTO',
  liquidacao: 'D2',
  status: 'RASCUNHO',
  created_at: new Date(),
  updated_at: new Date(),
}

describe('POST /api/v1/bid-cambio/cotacoes', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('cria cotacao com dados validos', async () => {
    mockCotacaoCambio.create.mockResolvedValue(COTACAO_BASE)

    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .send({ moeda: 'USD', valor: 50000, tipo_operacao: 'IMPORTACAO' })

    expect(res.status).toBe(201)
    expect(res.body.moeda).toBe('USD')
    expect(res.body.status).toBe('RASCUNHO')
  })

  it('aplica defaults: modalidade=PRONTO, liquidacao=D2', async () => {
    mockCotacaoCambio.create.mockResolvedValue(COTACAO_BASE)

    await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .send({ moeda: 'EUR', valor: 10000, tipo_operacao: 'EXPORTACAO' })

    expect(mockCotacaoCambio.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ modalidade: 'PRONTO', liquidacao: 'D2' }),
      })
    )
  })

  it('rejeita moeda invalida', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .send({ moeda: 'INVALIDA', valor: 50000, tipo_operacao: 'IMPORTACAO' })

    expect(res.status).toBe(500)
  })

  it('rejeita valor negativo', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .send({ moeda: 'USD', valor: -100, tipo_operacao: 'IMPORTACAO' })

    expect(res.status).toBe(500)
  })

  it('rejeita tipo_operacao invalido', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .send({ moeda: 'USD', valor: 50000, tipo_operacao: 'INVALIDO' })

    expect(res.status).toBe(500)
  })
})

describe('GET /api/v1/bid-cambio/cotacoes', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('lista cotacoes com paginacao', async () => {
    mockCotacaoCambio.findMany.mockResolvedValue([COTACAO_BASE])
    mockCotacaoCambio.count.mockResolvedValue(1)

    const res = await request(app).get('/api/v1/bid-cambio/cotacoes')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.pagination).toBeDefined()
  })

  it('filtra por status', async () => {
    mockCotacaoCambio.findMany.mockResolvedValue([])
    mockCotacaoCambio.count.mockResolvedValue(0)

    await request(app).get('/api/v1/bid-cambio/cotacoes?status=APROVADA')
    expect(mockCotacaoCambio.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'APROVADA' }) })
    )
  })
})

describe('GET /api/v1/bid-cambio/cotacoes/:id', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('retorna cotacao com bid_requests e bid_responses', async () => {
    mockCotacaoCambio.findFirst.mockResolvedValue({ ...COTACAO_BASE, bid_requests: [], bid_responses: [] })

    const res = await request(app).get('/api/v1/bid-cambio/cotacoes/cotacao-001')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('cotacao-001')
  })

  it('retorna 404 para ID inexistente', async () => {
    mockCotacaoCambio.findFirst.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/bid-cambio/cotacoes/nao-existe')
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/v1/bid-cambio/cotacoes/:id', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('atualiza cotacao em RASCUNHO', async () => {
    mockCotacaoCambio.findFirst.mockResolvedValue(COTACAO_BASE)
    mockCotacaoCambio.update.mockResolvedValue({ ...COTACAO_BASE, valor: 60000 })

    const res = await request(app)
      .patch('/api/v1/bid-cambio/cotacoes/cotacao-001')
      .send({ valor: 60000 })

    expect(res.status).toBe(200)
  })

  it('rejeita edicao de cotacao nao-RASCUNHO', async () => {
    mockCotacaoCambio.findFirst.mockResolvedValue({ ...COTACAO_BASE, status: 'ENVIADA_CORRETORAS' })

    const res = await request(app)
      .patch('/api/v1/bid-cambio/cotacoes/cotacao-001')
      .send({ valor: 60000 })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_STATUS')
  })
})

describe('DELETE /api/v1/bid-cambio/cotacoes/:id', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('deleta cotacao em RASCUNHO', async () => {
    mockCotacaoCambio.findFirst.mockResolvedValue(COTACAO_BASE)
    mockCotacaoCambio.delete.mockResolvedValue(COTACAO_BASE)

    const res = await request(app).delete('/api/v1/bid-cambio/cotacoes/cotacao-001')
    expect(res.status).toBe(200)
    expect(res.body.deleted).toBe(true)
  })

  it('rejeita exclusao de cotacao nao-RASCUNHO', async () => {
    mockCotacaoCambio.findFirst.mockResolvedValue({ ...COTACAO_BASE, status: 'APROVADA' })

    const res = await request(app).delete('/api/v1/bid-cambio/cotacoes/cotacao-001')
    expect(res.status).toBe(400)
  })
})
