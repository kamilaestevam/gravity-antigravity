/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * parcelas-routes.test.ts — Testes funcionais das rotas de Parcelas (cambios) BID Cambio
 * Valida contratos HTTP com nomes DDD corretos nos campos.
 */

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

// ── Mocks hoisted ───────────────────────────────────────────────────────────

const mockParcelas: Record<string, unknown>[] = []
let nextId = 1

const mockBidCambioParcela = {
  findMany: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
    let result = [...mockParcelas]
    if (where?.status_parcela_bid_cambio) {
      result = result.filter(p => p.status_parcela_bid_cambio === where.status_parcela_bid_cambio)
    }
    if (where?.moeda_parcela_bid_cambio) {
      result = result.filter(p => p.moeda_parcela_bid_cambio === where.moeda_parcela_bid_cambio)
    }
    return result
  }),
  count: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
    let result = [...mockParcelas]
    if (where?.status_parcela_bid_cambio) {
      result = result.filter(p => p.status_parcela_bid_cambio === where.status_parcela_bid_cambio)
    }
    return result.length
  }),
  findFirst: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
    return mockParcelas.find(p => p.id_parcela_bid_cambio === where.id_parcela_bid_cambio) ?? null
  }),
  groupBy: vi.fn(async () => {
    return [
      {
        moeda_parcela_bid_cambio: 'USD',
        _sum: { valor_a_pagar_parcela_bid_cambio: 50000, valor_a_pagar_brl_parcela_bid_cambio: 250000 },
        _count: 3,
      },
    ]
  }),
  update: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    const parcela = mockParcelas.find(p => p.id_parcela_bid_cambio === where.id_parcela_bid_cambio)
    if (!parcela) throw new Error('Parcela nao encontrada')
    Object.assign(parcela, data)
    return parcela
  }),
}

const mockBidCambioAnexo = {
  createMany: vi.fn(async () => ({ count: 1 })),
}

const mockPrisma = {
  bidCambioParcela: mockBidCambioParcela,
  bidCambioAnexo: mockBidCambioAnexo,
  $queryRaw: vi.fn(async () => [{ '?column?': 1 }]),
  $transaction: vi.fn(async (ops: Array<Promise<unknown>>) => {
    const results = []
    for (const op of ops) results.push(await op)
    return results
  }),
}

// Mock tenantIntegrations
vi.mock(
  '../../../servicos-global/produto/bid-cambio/server/src/services/tenantIntegrations.js',
  () => ({
    historicoIntegration: { registrar: vi.fn() },
    atividadesIntegration: { parcelaPaga: vi.fn() },
    notificacoesIntegration: { enviar: vi.fn() },
  }),
)

// Mock parcelaEngine — servicos chamados pelas rotas
const mockAgendarParcelas = vi.fn(async () => ({ agendadas: 2, erros: [] }))
const mockPagarParcela = vi.fn(async (_prisma: unknown, _tenantId: string, _userId: string, input: Record<string, unknown>) => ({
  id_parcela_bid_cambio: input.id_parcela_bid_cambio,
  status_parcela_bid_cambio: 'PAGO',
  valor_pago_parcela_bid_cambio: input.valor_pago_parcela_bid_cambio,
  taxa_fechamento_parcela_bid_cambio: input.taxa_fechamento_parcela_bid_cambio,
  data_pagamento_parcela_bid_cambio: new Date().toISOString(),
}))
const mockRetornarParaPendente = vi.fn(async () => ({
  id_parcela_bid_cambio: 'parcela_1',
  status_parcela_bid_cambio: 'PENDENTE',
}))
const mockRecalcularParcelas = vi.fn(async () => ({ recalculadas: 1 }))

vi.mock(
  '../../../servicos-global/produto/bid-cambio/server/src/services/parcelaEngine.js',
  () => ({
    agendarParcelas: (...args: unknown[]) => mockAgendarParcelas(...args),
    pagarParcela: (...args: unknown[]) => mockPagarParcela(...args),
    retornarParaPendente: (...args: unknown[]) => mockRetornarParaPendente(...args),
    recalcularParcelas: (...args: unknown[]) => mockRecalcularParcelas(...args),
  }),
)

// Mock prisma export from tenantIsolation
vi.mock(
  '../../../servicos-global/produto/bid-cambio/server/src/middleware/tenantIsolation.js',
  () => ({
    prisma: { $queryRaw: vi.fn(async () => [{ '?column?': 1 }]) },
    tenantIsolationMiddleware: vi.fn((req: Request, _res: Response, next: NextFunction) => {
      next()
    }),
  }),
)

// Mock cronJobs
vi.mock(
  '../../../servicos-global/produto/bid-cambio/server/src/services/cronJobs.js',
  () => ({ startCronJobs: vi.fn() }),
)

// Mock observability middleware
vi.mock(
  '../../../servicos-plataforma/middleware/apiObservability.js',
  () => ({
    apiObservability: vi.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
  }),
)

// Mock product audit plugin
vi.mock(
  '../../../servicos-plataforma/historico-global/src/product-audit-plugin.js',
  () => ({
    createProductAuditPlugin: vi.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
  }),
)

// ── App de teste ─────────────────────────────────────────────────────────────

import { cambiosRouter } from '../../../servicos-global/produto/bid-cambio/server/src/routes/cambios.js'

function criarApp() {
  const app = express()
  app.use(express.json())

  // Simula requireInternalKey
  app.use((req: Request, res: Response, next: NextFunction) => {
    const key = req.headers['x-internal-key'] as string | undefined
    if (!key || key !== 'test-key') {
      return res.status(401).json({ error: 'Chave interna invalida', code: 'UNAUTHORIZED' })
    }
    next()
  })

  // Injeta prisma mock e tenantId no req
  app.use((req: Request & { prisma?: typeof mockPrisma; tenantId?: string }, _res: Response, next: NextFunction) => {
    req.prisma = mockPrisma as unknown as typeof req.prisma
    req.tenantId = 'org_test_01'
    next()
  })

  app.use('/api/v1/bid-cambio/cambios', cambiosRouter)

  // Error handler
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message, issues: (err as unknown as { issues: unknown[] }).issues } })
    }
    if (err.statusCode && err.statusCode < 500) {
      return res.status(err.statusCode).json({ error: { code: err.code ?? 'BAD_REQUEST', message: err.message } })
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
  })

  return app
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const HEADERS = {
  'x-internal-key': 'test-key',
  'x-id-organizacao': 'org_test_01',
  'x-id-usuario': 'user_test_01',
}

function criarParcelaMock(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const id = `parcela_${nextId++}`
  return {
    id_parcela_bid_cambio: id,
    moeda_parcela_bid_cambio: 'USD',
    valor_a_pagar_parcela_bid_cambio: 10000,
    valor_a_pagar_brl_parcela_bid_cambio: 50000,
    status_parcela_bid_cambio: 'PENDENTE',
    numero_parcela_bid_cambio: 1,
    total_parcelas_parcela_bid_cambio: 3,
    porcentagem_parcela_bid_cambio: 33.33,
    cambio_total_parcela_bid_cambio: 30000,
    referencia_processo_parcela_bid_cambio: 'REF-001',
    numero_pedido_parcela_bid_cambio: 'PED-001',
    exportador_parcela_bid_cambio: 'Exportador SA',
    data_vencimento_parcela_bid_cambio: '2026-06-15T00:00:00Z',
    data_criacao_parcela_bid_cambio: '2026-05-21T00:00:00Z',
    ...overrides,
  }
}

// ── Testes: GET /api/v1/bid-cambio/cambios ───────────────────────────────────

describe('GET /api/v1/bid-cambio/cambios', () => {
  const app = criarApp()

  beforeEach(() => {
    mockParcelas.length = 0
    nextId = 1
    vi.clearAllMocks()

    mockParcelas.push(
      criarParcelaMock({ status_parcela_bid_cambio: 'PENDENTE' }),
      criarParcelaMock({ status_parcela_bid_cambio: 'AGENDADO', moeda_parcela_bid_cambio: 'EUR' }),
      criarParcelaMock({ status_parcela_bid_cambio: 'PAGO' }),
    )
  })

  it('deve listar parcelas com campos DDD na resposta', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cambios')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body).toHaveProperty('pagination')
    expect(Array.isArray(res.body.data)).toBe(true)

    const primeira = res.body.data[0]
    expect(primeira).toHaveProperty('id_parcela_bid_cambio')
    expect(primeira).toHaveProperty('moeda_parcela_bid_cambio')
    expect(primeira).toHaveProperty('valor_a_pagar_parcela_bid_cambio')
    expect(primeira).toHaveProperty('valor_a_pagar_brl_parcela_bid_cambio')
    expect(primeira).toHaveProperty('status_parcela_bid_cambio')
    expect(primeira).toHaveProperty('numero_parcela_bid_cambio')
    expect(primeira).toHaveProperty('total_parcelas_parcela_bid_cambio')
    expect(primeira).toHaveProperty('porcentagem_parcela_bid_cambio')
    expect(primeira).toHaveProperty('cambio_total_parcela_bid_cambio')
    expect(primeira).toHaveProperty('referencia_processo_parcela_bid_cambio')
    expect(primeira).toHaveProperty('data_vencimento_parcela_bid_cambio')

    // Campos legados NAO existem
    expect(primeira).not.toHaveProperty('currency')
    expect(primeira).not.toHaveProperty('amount')
    expect(primeira).not.toHaveProperty('status')
    expect(primeira).not.toHaveProperty('installment_number')
  })

  it('deve filtrar por status_parcela_bid_cambio via query', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cambios?status_parcela_bid_cambio=PENDENTE')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(mockBidCambioParcela.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status_parcela_bid_cambio: 'PENDENTE',
        }),
      }),
    )
  })

  it('deve filtrar por moeda_parcela_bid_cambio via query', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cambios?moeda_parcela_bid_cambio=EUR')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(mockBidCambioParcela.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          moeda_parcela_bid_cambio: 'EUR',
        }),
      }),
    )
  })

  it('deve retornar paginacao correta', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cambios?page=1&limit=10')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: expect.any(Number),
      pages: expect.any(Number),
    })
  })
})

// ── Testes: GET /api/v1/bid-cambio/cambios/totais ────────────────────────────

describe('GET /api/v1/bid-cambio/cambios/totais', () => {
  const app = criarApp()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar totais agrupados por moeda com campos DDD', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cambios/totais')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)

    const primeiroGrupo = res.body[0]
    expect(primeiroGrupo).toHaveProperty('moeda_parcela_bid_cambio', 'USD')
    expect(primeiroGrupo._sum).toHaveProperty('valor_a_pagar_parcela_bid_cambio')
    expect(primeiroGrupo._sum).toHaveProperty('valor_a_pagar_brl_parcela_bid_cambio')
  })
})

// ── Testes: GET /api/v1/bid-cambio/cambios/:id ───────────────────────────────

describe('GET /api/v1/bid-cambio/cambios/:id', () => {
  const app = criarApp()

  beforeEach(() => {
    mockParcelas.length = 0
    nextId = 1
    vi.clearAllMocks()
    mockParcelas.push(criarParcelaMock({ id_parcela_bid_cambio: 'parcela_abc' }))
  })

  it('deve retornar parcela por id com campos DDD', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cambios/parcela_abc')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('id_parcela_bid_cambio', 'parcela_abc')
    expect(res.body).toHaveProperty('status_parcela_bid_cambio', 'PENDENTE')
    expect(res.body).toHaveProperty('moeda_parcela_bid_cambio', 'USD')
  })

  it('deve retornar 404 quando parcela nao existe', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cambios/inexistente')
      .set(HEADERS)

    expect(res.status).toBe(404)
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND')
  })
})

// ── Testes: POST /api/v1/bid-cambio/cambios/agendar ─────────────────────────

describe('POST /api/v1/bid-cambio/cambios/agendar', () => {
  const app = criarApp()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve agendar parcelas com campos DDD', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/agendar')
      .set(HEADERS)
      .send({
        parcela_ids: ['parcela_1', 'parcela_2'],
        data_agendamento_parcela_bid_cambio: '2026-06-01T00:00:00Z',
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('agendadas', 2)
    expect(mockAgendarParcelas).toHaveBeenCalled()
  })

  it('deve retornar 400 com parcela_ids vazio', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/agendar')
      .set(HEADERS)
      .send({
        parcela_ids: [],
        data_agendamento_parcela_bid_cambio: '2026-06-01T00:00:00Z',
      })

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 com data invalida', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/agendar')
      .set(HEADERS)
      .send({
        parcela_ids: ['parcela_1'],
        data_agendamento_parcela_bid_cambio: 'nao-e-uma-data',
      })

    expect(res.status).toBe(400)
  })

  it('deve rejeitar payload com campo legado schedule_date', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/agendar')
      .set(HEADERS)
      .send({
        parcela_ids: ['parcela_1'],
        schedule_date: '2026-06-01',  // campo legado
      })

    // Sem data_agendamento_parcela_bid_cambio, Zod rejeita
    expect(res.status).toBe(400)
  })
})

// ── Testes: POST /api/v1/bid-cambio/cambios/pagar ───────────────────────────

describe('POST /api/v1/bid-cambio/cambios/pagar', () => {
  const app = criarApp()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve pagar parcela com campos DDD', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .set(HEADERS)
      .send({
        id_parcela_bid_cambio: 'parcela_1',
        valor_pago_parcela_bid_cambio: 10000,
        taxa_fechamento_parcela_bid_cambio: 5.1234,
        banco_corretora_parcela_bid_cambio: 'Banco ABC',
        numero_contrato_cambio_parcela_bid_cambio: 'CONT-001',
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('id_parcela_bid_cambio', 'parcela_1')
    expect(res.body).toHaveProperty('status_parcela_bid_cambio', 'PAGO')
    expect(res.body).toHaveProperty('valor_pago_parcela_bid_cambio', 10000)
    expect(res.body).toHaveProperty('taxa_fechamento_parcela_bid_cambio', 5.1234)
    expect(mockPagarParcela).toHaveBeenCalled()
  })

  it('deve aceitar pagamento com anexos usando campos DDD', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .set(HEADERS)
      .send({
        id_parcela_bid_cambio: 'parcela_2',
        valor_pago_parcela_bid_cambio: 5000,
        taxa_fechamento_parcela_bid_cambio: 4.9876,
        banco_corretora_parcela_bid_cambio: 'Corretora XYZ',
        anexos: [
          {
            nome_original_anexo_bid_cambio: 'swift.pdf',
            url_anexo_bid_cambio: 'https://storage.example.com/swift.pdf',
            categoria_anexo_bid_cambio: 'SWIFT',
          },
        ],
      })

    expect(res.status).toBe(200)
    expect(mockPagarParcela).toHaveBeenCalled()
  })

  it('deve retornar 400 sem campos obrigatorios', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .set(HEADERS)
      .send({})

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 com valor negativo', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .set(HEADERS)
      .send({
        id_parcela_bid_cambio: 'parcela_1',
        valor_pago_parcela_bid_cambio: -100,
        taxa_fechamento_parcela_bid_cambio: 5.0,
        banco_corretora_parcela_bid_cambio: 'Banco ABC',
      })

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 com banco vazio', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .set(HEADERS)
      .send({
        id_parcela_bid_cambio: 'parcela_1',
        valor_pago_parcela_bid_cambio: 100,
        taxa_fechamento_parcela_bid_cambio: 5.0,
        banco_corretora_parcela_bid_cambio: '',
      })

    expect(res.status).toBe(400)
  })

  it('deve rejeitar payload com campos legados', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/pagar')
      .set(HEADERS)
      .send({
        installment_id: 'parcela_1',   // legado
        amount_paid: 10000,             // legado
        closing_rate: 5.0,              // legado
        broker_bank: 'Banco ABC',       // legado
      })

    // Zod rejeita porque campos DDD obrigatorios estao ausentes
    expect(res.status).toBe(400)
  })
})

// ── Testes: POST /api/v1/bid-cambio/cambios/retornar-pendente ────────────────

describe('POST /api/v1/bid-cambio/cambios/retornar-pendente', () => {
  const app = criarApp()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar parcela para pendente com campo DDD', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/retornar-pendente')
      .set(HEADERS)
      .send({ id_parcela_bid_cambio: 'parcela_1' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('status_parcela_bid_cambio', 'PENDENTE')
    expect(mockRetornarParaPendente).toHaveBeenCalled()
  })

  it('deve retornar 400 sem id_parcela_bid_cambio', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/retornar-pendente')
      .set(HEADERS)
      .send({})

    expect(res.status).toBe(400)
  })

  it('deve rejeitar campo legado installment_id', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/retornar-pendente')
      .set(HEADERS)
      .send({ installment_id: 'parcela_1' })  // legado

    expect(res.status).toBe(400)
  })
})

// ── Testes: POST /api/v1/bid-cambio/cambios/exportar ─────────────────────────

describe('POST /api/v1/bid-cambio/cambios/exportar', () => {
  const app = criarApp()

  beforeEach(() => {
    mockParcelas.length = 0
    nextId = 1
    vi.clearAllMocks()
    mockParcelas.push(criarParcelaMock())
  })

  it('deve exportar CSV com campos DDD', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/exportar')
      .set(HEADERS)
      .send({ formato: 'csv' })

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/csv')
    expect(res.headers['content-disposition']).toContain('attachment')
  })

  it('deve exportar XLSX (JSON) com campos DDD', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/exportar')
      .set(HEADERS)
      .send({ formato: 'xlsx' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('formato', 'xlsx')
    expect(res.body).toHaveProperty('headers')
    expect(res.body).toHaveProperty('rows')
    expect(res.body).toHaveProperty('total')
    expect(Array.isArray(res.body.headers)).toBe(true)
    expect(Array.isArray(res.body.rows)).toBe(true)
  })

  it('deve filtrar exportacao por status_parcela_bid_cambio', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cambios/exportar')
      .set(HEADERS)
      .send({ formato: 'csv', status_parcela_bid_cambio: 'PENDENTE' })

    expect(res.status).toBe(200)
    expect(mockBidCambioParcela.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status_parcela_bid_cambio: 'PENDENTE',
        }),
      }),
    )
  })
})

// ── Testes: Autenticacao ─────────────────────────────────────────────────────

describe('Autenticacao x-internal-key (cambios)', () => {
  const app = criarApp()

  it('deve retornar 401 sem header x-internal-key', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cambios')

    expect(res.status).toBe(401)
  })

  it('deve retornar 401 com chave invalida', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cambios')
      .set('x-internal-key', 'chave-errada')

    expect(res.status).toBe(401)
  })
})
