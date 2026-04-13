// @vitest-environment node
/**
 * Testes funcionais — BID Cambio / Rotas de Cambios (Pilar 1)
 * GET    /api/v1/bid-cambio/cambios
 * GET    /api/v1/bid-cambio/cambios/totais
 * GET    /api/v1/bid-cambio/cambios/:id
 * POST   /api/v1/bid-cambio/cambios/agendar
 * POST   /api/v1/bid-cambio/cambios/pagar
 * POST   /api/v1/bid-cambio/cambios/retornar-pendente
 *
 * Estrategia: mock do Prisma (sem banco real em CI)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

interface AppRequest extends Request {
  tenantId?: string
  prisma?: unknown
  userId?: string
}

interface HttpError extends Error {
  statusCode?: number
  code?: string
}

// --- Mocks ---

vi.mock('axios', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }) },
}))

vi.mock('../../../produto/bid-cambio/server/src/services/tenantIntegrations.js', () => ({
  atividadesIntegration: { parcelaAgendada: vi.fn(), parcelaPaga: vi.fn(), proximoVencimento: vi.fn(), criarAtividade: vi.fn() },
  historicoIntegration: { registrar: vi.fn() },
  notificacoesIntegration: { enviar: vi.fn(), cotacaoRespondida: vi.fn(), cotacaoAprovada: vi.fn(), cotacaoExpirada: vi.fn() },
  emailIntegration: { enviar: vi.fn() },
}))

const mockParcelaCambio = {
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  groupBy: vi.fn(),
  aggregate: vi.fn(),
}

const mockAnexoCambio = {
  createMany: vi.fn(),
}

vi.mock('../../../produto/bid-cambio/server/src/middleware/tenantIsolation.js', () => ({
  tenantIsolationMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    const appReq = req as AppRequest
    appReq.tenantId = 'tenant-test-001'
    appReq.prisma = { parcelaCambio: mockParcelaCambio, anexoCambio: mockAnexoCambio }
    next()
  },
  withTenantIsolation: vi.fn(),
  prisma: { $queryRaw: vi.fn().mockResolvedValue([1]) },
}))

vi.mock('../../../produto/bid-cambio/server/src/middleware/requireInternalKey.js', () => ({
  requireInternalKey: (_req: Request, _res: Response, next: NextFunction) => next(),
}))

import { cambiosRouter } from '../../../produto/bid-cambio/server/src/routes/cambios.js'

// --- App de testes ---

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const appReq = req as AppRequest
    appReq.tenantId = 'tenant-test-001'
    appReq.prisma = { parcelaCambio: mockParcelaCambio, anexoCambio: mockAnexoCambio }
    req.headers['x-user-id'] = 'user-test-001'
    next()
  })
  app.use('/api/v1/bid-cambio/cambios', cambiosRouter)
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } })
  })
  return app
}

// --- Dados ---

const PARCELA_BASE = {
  id: 'parcela-001',
  tenant_id: 'tenant-test-001',
  product_id: 'bid-cambio',
  user_id: 'user-test-001',
  moeda: 'USD',
  cambio_total: 100000,
  porcentagem_parcela: 50,
  valor_a_pagar: 50000,
  valor_a_pagar_brl: 260000,
  numero_parcela: 1,
  total_parcelas: 2,
  status: 'PENDENTE',
  referencia_processo: 'PROC-001',
  numero_pedido: 'PED-001',
  data_vencimento: new Date('2026-05-01'),
  created_at: new Date(),
  updated_at: new Date(),
}

// --- Tests ---

describe('GET /api/v1/bid-cambio/cambios', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('lista parcelas com paginacao', async () => {
    mockParcelaCambio.findMany.mockResolvedValue([PARCELA_BASE])
    mockParcelaCambio.count.mockResolvedValue(1)

    const res = await request(app).get('/api/v1/bid-cambio/cambios')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.pagination.total).toBe(1)
    expect(res.body.pagination.page).toBe(1)
  })

  it('filtra por status', async () => {
    mockParcelaCambio.findMany.mockResolvedValue([])
    mockParcelaCambio.count.mockResolvedValue(0)

    const res = await request(app).get('/api/v1/bid-cambio/cambios?status=PAGO')
    expect(res.status).toBe(200)
    expect(mockParcelaCambio.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'PAGO' }) })
    )
  })

  it('rejeita status invalido', async () => {
    const res = await request(app).get('/api/v1/bid-cambio/cambios?status=INVALIDO')
    expect(res.status).toBe(500)
  })

  it('filtra por moeda', async () => {
    mockParcelaCambio.findMany.mockResolvedValue([])
    mockParcelaCambio.count.mockResolvedValue(0)

    const res = await request(app).get('/api/v1/bid-cambio/cambios?moeda=EUR')
    expect(res.status).toBe(200)
    expect(mockParcelaCambio.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ moeda: 'EUR' }) })
    )
  })
})

describe('GET /api/v1/bid-cambio/cambios/totais', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('retorna totais agrupados por moeda', async () => {
    mockParcelaCambio.groupBy.mockResolvedValue([
      { moeda: 'USD', _sum: { valor_a_pagar: 100000, valor_a_pagar_brl: 520000 }, _count: 5 },
    ])

    const res = await request(app).get('/api/v1/bid-cambio/cambios/totais')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].moeda).toBe('USD')
  })
})

describe('GET /api/v1/bid-cambio/cambios/:id', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('retorna parcela por ID', async () => {
    mockParcelaCambio.findFirst.mockResolvedValue(PARCELA_BASE)

    const res = await request(app).get('/api/v1/bid-cambio/cambios/parcela-001')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('parcela-001')
  })

  it('retorna 404 para ID inexistente', async () => {
    mockParcelaCambio.findFirst.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/bid-cambio/cambios/nao-existe')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})

describe('POST /api/v1/bid-cambio/cambios/agendar', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('agenda parcelas pendentes', async () => {
    mockParcelaCambio.findMany.mockResolvedValue([PARCELA_BASE])
    mockParcelaCambio.updateMany.mockResolvedValue({ count: 1 })

    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/agendar')
      .send({ parcela_ids: ['parcela-001'], data_agendamento: '2026-04-20' })

    expect(res.status).toBe(200)
    expect(res.body.agendadas).toBe(1)
  })

  it('rejeita parcela_ids vazio', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/agendar')
      .send({ parcela_ids: [], data_agendamento: '2026-04-20' })

    expect(res.status).toBe(500)
  })

  it('retorna 404 se nenhuma parcela pendente', async () => {
    mockParcelaCambio.findMany.mockResolvedValue([])

    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/agendar')
      .send({ parcela_ids: ['parcela-999'], data_agendamento: '2026-04-20' })

    expect(res.status).toBe(404)
  })
})

describe('POST /api/v1/bid-cambio/cambios/pagar', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('registra pagamento com taxa e valor BRL', async () => {
    mockParcelaCambio.findFirst.mockResolvedValue(PARCELA_BASE)
    mockParcelaCambio.aggregate.mockResolvedValue({ _sum: { valor_pago: 0 } })
    mockParcelaCambio.update.mockResolvedValue({ ...PARCELA_BASE, status: 'PAGO' })

    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .send({
        parcela_id: 'parcela-001',
        valor_pago: 50000,
        taxa_fechamento: 5.2345,
        banco_corretora: 'Banco XYZ',
      })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('PAGO')
    expect(res.body.valor_pago).toBe(50000)
    expect(res.body.valor_pago_brl).toBeCloseTo(50000 * 5.2345, 0)
  })

  it('RN-104: aceita valor diferente do valor_a_pagar', async () => {
    mockParcelaCambio.findFirst.mockResolvedValue(PARCELA_BASE)
    mockParcelaCambio.aggregate.mockResolvedValue({ _sum: { valor_pago: 0 } })
    mockParcelaCambio.update.mockResolvedValue({ ...PARCELA_BASE, status: 'PAGO' })

    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .send({
        parcela_id: 'parcela-001',
        valor_pago: 48000,
        taxa_fechamento: 5.20,
        banco_corretora: 'Banco ABC',
      })

    expect(res.status).toBe(200)
    expect(res.body.valor_pago).toBe(48000)
  })

  it('rejeita valor que excede limite restante', async () => {
    mockParcelaCambio.findFirst.mockResolvedValue(PARCELA_BASE)
    mockParcelaCambio.aggregate.mockResolvedValue({ _sum: { valor_pago: 90000 } }) // ja pagou 90k de 100k

    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .send({
        parcela_id: 'parcela-001',
        valor_pago: 50000,  // excede 10k restante
        taxa_fechamento: 5.20,
        banco_corretora: 'Banco ABC',
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('EXCEEDS_LIMIT')
  })

  it('retorna 404 para parcela ja paga', async () => {
    mockParcelaCambio.findFirst.mockResolvedValue(null) // nao encontra pendente/agendado

    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .send({
        parcela_id: 'parcela-001',
        valor_pago: 50000,
        taxa_fechamento: 5.20,
        banco_corretora: 'Banco ABC',
      })

    // pagarParcela lanca AppError 404 que o error handler traduz
    expect([404, 400]).toContain(res.status)
  })

  it('Zod rejeita campos obrigatorios ausentes', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .send({ parcela_id: 'parcela-001' }) // falta valor_pago, taxa, banco

    expect(res.status).toBe(500)
  })
})

describe('POST /api/v1/bid-cambio/cambios/retornar-pendente', () => {
  beforeEach(() => vi.clearAllMocks())
  const app = buildApp()

  it('RN-106: retorna parcela paga para pendente', async () => {
    const parcelaPaga = { ...PARCELA_BASE, status: 'PAGO', data_vencimento_original: new Date('2026-05-01') }
    mockParcelaCambio.findFirst.mockResolvedValue(parcelaPaga)
    mockParcelaCambio.update.mockResolvedValue({ ...parcelaPaga, status: 'PENDENTE' })

    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/retornar-pendente')
      .send({ parcela_id: 'parcela-001' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('PENDENTE')
  })

  it('retorna 404 para parcela nao-paga', async () => {
    mockParcelaCambio.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/retornar-pendente')
      .send({ parcela_id: 'parcela-001' })

    expect(res.status).toBe(404)
  })
})
