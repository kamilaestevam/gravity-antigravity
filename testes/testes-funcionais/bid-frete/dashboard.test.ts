// @vitest-environment node
/**
 * Testes funcionais v2 — BID Frete / Dashboard
 * GET /api/v1/bid-frete/dashboard       KPIs e metricas gerais
 * GET /api/v1/bid-frete/dashboard/calendario   Alertas do calendario
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
  historicoIntegration: { cotacaoCriada: vi.fn(), registrar: vi.fn() },
  notificacoesIntegration: { fornecedorRespondeu: vi.fn() },
}))

const mockCotacao = {
  count: vi.fn(),
  findMany: vi.fn(),
  groupBy: vi.fn(),
}

const mockBidResponse = {
  aggregate: vi.fn(),
  count: vi.fn(),
}

const mockSaving = {
  findMany: vi.fn(),
}

vi.mock('../../../produto/bid-frete/server/src/services/savingsEngine.js', () => ({
  savingsEngine: {
    calcularMetricas: vi.fn().mockResolvedValue({
      total_cotacoes_aprovadas: 5,
      total_saving_vs_target: 10000,
      total_saving_vs_media: 8000,
      total_valor_aprovado: 50000,
      media_saving_percentual: 15.5,
      moeda: 'USD',
    }),
  },
}))

vi.mock('../../../produto/bid-frete/server/src/middleware/tenantIsolation.js', () => ({
  tenantIsolationMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    const appReq = req as AppRequest
    appReq.tenantId = 'tenant-test-001'
    appReq.prisma = {
      cotacao: mockCotacao,
      bidResponse: mockBidResponse,
      saving: mockSaving,
    }
    next()
  },
  prisma: { $queryRaw: vi.fn().mockResolvedValue([1]) },
}))

vi.mock('../../../produto/bid-frete/server/src/middleware/requireInternalKey.js', () => ({
  requireInternalKey: (_req: Request, _res: Response, next: NextFunction) => next(),
}))

import { dashboardRouter } from '../../../produto/bid-frete/server/src/routes/dashboard.js'

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const appReq = req as AppRequest
    appReq.tenantId = 'tenant-test-001'
    appReq.prisma = {
      cotacao: mockCotacao,
      bidResponse: mockBidResponse,
      saving: mockSaving,
    }
    req.headers['x-user-id'] = 'user-test-001'
    req.headers['x-internal-key'] = 'test-key'
    req.headers['x-tenant-id'] = 'tenant-test-001'
    next()
  })
  app.use('/api/v1/bid-frete/dashboard', dashboardRouter)
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

// ===========================================================================
// GET /api/v1/bid-frete/dashboard — KPIs
// ===========================================================================

describe('GET /api/v1/bid-frete/dashboard — KPIs gerais', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna estrutura completa de KPIs', async () => {
    mockCotacao.count
      .mockResolvedValueOnce(10) // cotacoesAndamento
      .mockResolvedValueOnce(25) // cotacoesPassadas
    mockBidResponse.aggregate
      .mockResolvedValueOnce({ _sum: { valor_total: 50000 } }) // valoresAndamento
      .mockResolvedValueOnce({ _sum: { valor_total: 120000 } }) // valoresPassadas
    mockCotacao.findMany.mockResolvedValue([
      { data_aprovacao: '2026-03-01', data_limite_resposta: '2026-03-15' },
      { data_aprovacao: '2026-03-20', data_limite_resposta: '2026-03-10' },
    ])
    mockCotacao.groupBy.mockResolvedValue([
      { status: 'RASCUNHO', _count: 5 },
      { status: 'EM_COTACAO', _count: 3 },
      { status: 'APROVADA', _count: 10 },
    ])

    const res = await request(app).get('/api/v1/bid-frete/dashboard')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('cotacoes_andamento', 10)
    expect(res.body).toHaveProperty('cotacoes_passadas', 25)
    expect(res.body).toHaveProperty('valor_andamento_usd', 50000)
    expect(res.body).toHaveProperty('valor_aprovado_usd', 120000)
    expect(res.body).toHaveProperty('aprovacao')
    expect(res.body.aprovacao).toHaveProperty('total')
    expect(res.body.aprovacao).toHaveProperty('em_tempo')
    expect(res.body.aprovacao).toHaveProperty('fora_prazo')
    expect(res.body.aprovacao).toHaveProperty('percentual_em_tempo')
    expect(res.body).toHaveProperty('savings')
    expect(res.body).toHaveProperty('funil')
    expect(res.body.funil).toBeInstanceOf(Array)
  })

  it('200 — funil contém status e count', async () => {
    mockCotacao.count.mockResolvedValue(0)
    mockBidResponse.aggregate.mockResolvedValue({ _sum: { valor_total: null } })
    mockCotacao.findMany.mockResolvedValue([])
    mockCotacao.groupBy.mockResolvedValue([
      { status: 'RASCUNHO', _count: 3 },
    ])

    const res = await request(app).get('/api/v1/bid-frete/dashboard')

    expect(res.body.funil[0]).toHaveProperty('status', 'RASCUNHO')
    expect(res.body.funil[0]).toHaveProperty('count', 3)
  })

  it('200 — lida com dados vazios (nenhuma cotacao)', async () => {
    mockCotacao.count.mockResolvedValue(0)
    mockBidResponse.aggregate.mockResolvedValue({ _sum: { valor_total: null } })
    mockCotacao.findMany.mockResolvedValue([])
    mockCotacao.groupBy.mockResolvedValue([])

    const res = await request(app).get('/api/v1/bid-frete/dashboard')

    expect(res.status).toBe(200)
    expect(res.body.cotacoes_andamento).toBe(0)
    expect(res.body.cotacoes_passadas).toBe(0)
    expect(res.body.valor_andamento_usd).toBe(0)
    expect(res.body.valor_aprovado_usd).toBe(0)
    expect(res.body.aprovacao.total).toBe(0)
    expect(res.body.aprovacao.percentual_em_tempo).toBe('0')
    expect(res.body.funil).toHaveLength(0)
  })

  it('200 — aceita filtro company_id', async () => {
    mockCotacao.count.mockResolvedValue(0)
    mockBidResponse.aggregate.mockResolvedValue({ _sum: { valor_total: null } })
    mockCotacao.findMany.mockResolvedValue([])
    mockCotacao.groupBy.mockResolvedValue([])

    const res = await request(app).get('/api/v1/bid-frete/dashboard?company_id=comp-001')

    expect(res.status).toBe(200)
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/dashboard/calendario — alertas
// ===========================================================================

describe('GET /api/v1/bid-frete/dashboard/calendario — alertas do calendario', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna array de alertas com 4 tipos', async () => {
    mockBidResponse.count.mockResolvedValue(3)  // respostasRecentes
    mockCotacao.count
      .mockResolvedValueOnce(2) // proximoVencimento
      .mockResolvedValueOnce(1) // venceHoje
      .mockResolvedValueOnce(0) // foraPrazo

    const res = await request(app).get('/api/v1/bid-frete/dashboard/calendario')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('alertas')
    expect(res.body.alertas).toHaveLength(4)

    const tipos = res.body.alertas.map((a: { tipo: string }) => a.tipo)
    expect(tipos).toContain('respostas')
    expect(tipos).toContain('vencimento')
    expect(tipos).toContain('vence_hoje')
    expect(tipos).toContain('fora_prazo')
  })

  it('200 — cada alerta tem tipo, label, count e cor', async () => {
    mockBidResponse.count.mockResolvedValue(0)
    mockCotacao.count.mockResolvedValue(0)

    const res = await request(app).get('/api/v1/bid-frete/dashboard/calendario')

    for (const alerta of res.body.alertas) {
      expect(alerta).toHaveProperty('tipo')
      expect(alerta).toHaveProperty('label')
      expect(alerta).toHaveProperty('count')
      expect(alerta).toHaveProperty('cor')
      expect(typeof alerta.count).toBe('number')
    }
  })

  it('200 — lida com zero alertas (counts todos zerados)', async () => {
    mockBidResponse.count.mockResolvedValue(0)
    mockCotacao.count.mockResolvedValue(0)

    const res = await request(app).get('/api/v1/bid-frete/dashboard/calendario')

    expect(res.status).toBe(200)
    const totalAlerts = res.body.alertas.reduce((acc: number, a: { count: number }) => acc + a.count, 0)
    expect(totalAlerts).toBe(0)
  })

  it('200 — cores sao green, yellow, orange, red', async () => {
    mockBidResponse.count.mockResolvedValue(0)
    mockCotacao.count.mockResolvedValue(0)

    const res = await request(app).get('/api/v1/bid-frete/dashboard/calendario')

    const cores = res.body.alertas.map((a: { cor: string }) => a.cor)
    expect(cores).toContain('green')
    expect(cores).toContain('yellow')
    expect(cores).toContain('orange')
    expect(cores).toContain('red')
  })
})
