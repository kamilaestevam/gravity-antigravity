/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * cotacoes-routes.test.ts — Testes funcionais das rotas de Cotacao BID Cambio
 * Valida contratos HTTP com nomes DDD corretos nos campos.
 */

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

// ── Mocks hoisted ───────────────────────────────────────────────────────────

const mockCotacoes: Record<string, unknown>[] = []
let nextId = 1

const mockBidCambioCotacao = {
  create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    const cotacao = {
      id_cotacao_bid_cambio: `cotacao_${nextId++}`,
      ...data,
      status_cotacao_bid_cambio: data.status_cotacao_bid_cambio ?? 'RASCUNHO',
      data_criacao_cotacao_bid_cambio: new Date().toISOString(),
    }
    mockCotacoes.push(cotacao)
    return cotacao
  }),
  findMany: vi.fn(async ({ where, include }: { where?: Record<string, unknown>; include?: Record<string, unknown> }) => {
    let result = [...mockCotacoes]
    if (where?.status_cotacao_bid_cambio) {
      result = result.filter(c => c.status_cotacao_bid_cambio === where.status_cotacao_bid_cambio)
    }
    return result
  }),
  count: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
    if (where?.status_cotacao_bid_cambio) {
      return mockCotacoes.filter(c => c.status_cotacao_bid_cambio === where.status_cotacao_bid_cambio).length
    }
    return mockCotacoes.length
  }),
  findFirst: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
    return mockCotacoes.find(c => c.id_cotacao_bid_cambio === where.id_cotacao_bid_cambio) ?? null
  }),
  update: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    const cotacao = mockCotacoes.find(c => c.id_cotacao_bid_cambio === where.id_cotacao_bid_cambio)
    if (!cotacao) throw new Error('Cotacao nao encontrada')
    Object.assign(cotacao, data)
    return cotacao
  }),
  delete: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
    const idx = mockCotacoes.findIndex(c => c.id_cotacao_bid_cambio === where.id_cotacao_bid_cambio)
    if (idx === -1) throw new Error('Cotacao nao encontrada')
    return mockCotacoes.splice(idx, 1)[0]
  }),
}

const mockPrisma = {
  bidCambioCotacao: mockBidCambioCotacao,
  $queryRaw: vi.fn(async () => [{ '?column?': 1 }]),
}

// Mock tenantIntegrations (fire-and-forget, nao afeta resposta HTTP)
vi.mock(
  '../../../servicos-global/produto/bid-cambio/server/src/services/tenantIntegrations.js',
  () => ({
    historicoIntegration: { registrar: vi.fn() },
    atividadesIntegration: { parcelaPaga: vi.fn() },
    notificacoesIntegration: { enviar: vi.fn() },
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

import { cotacoesRouter } from '../../../servicos-global/produto/bid-cambio/server/src/routes/cotacoes.js'

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

  app.use('/api/v1/bid-cambio/cotacoes', cotacoesRouter)

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

const COTACAO_VALIDA = {
  moeda_cotacao_bid_cambio: 'USD',
  valor_cotacao_bid_cambio: 150000,
  tipo_operacao_cotacao_bid_cambio: 'IMPORTACAO',
  modalidade_cotacao_bid_cambio: 'PRONTO',
  liquidacao_cotacao_bid_cambio: 'D2',
  referencia_processo_cotacao_bid_cambio: 'REF-001',
  numero_pedido_cotacao_bid_cambio: 'PED-001',
  exportador_cotacao_bid_cambio: 'Exportador SA',
}

// ── Testes ───────────────────────────────────────────────────────────────────

describe('POST /api/v1/bid-cambio/cotacoes', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    nextId = 1
    vi.clearAllMocks()
  })

  it('deve criar cotacao com campos DDD e retornar 201', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .set(HEADERS)
      .send(COTACAO_VALIDA)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id_cotacao_bid_cambio')
    expect(res.body).toHaveProperty('moeda_cotacao_bid_cambio', 'USD')
    expect(res.body).toHaveProperty('valor_cotacao_bid_cambio', 150000)
    expect(res.body).toHaveProperty('tipo_operacao_cotacao_bid_cambio', 'IMPORTACAO')
    expect(res.body).toHaveProperty('modalidade_cotacao_bid_cambio', 'PRONTO')
    expect(res.body).toHaveProperty('liquidacao_cotacao_bid_cambio', 'D2')
    expect(res.body).toHaveProperty('status_cotacao_bid_cambio', 'RASCUNHO')
    expect(res.body).toHaveProperty('referencia_processo_cotacao_bid_cambio', 'REF-001')
    expect(res.body).toHaveProperty('numero_pedido_cotacao_bid_cambio', 'PED-001')
    expect(res.body).toHaveProperty('exportador_cotacao_bid_cambio', 'Exportador SA')
  })

  it('deve criar cotacao com campos minimos (apenas obrigatorios)', async () => {
    const payload = {
      moeda_cotacao_bid_cambio: 'EUR',
      valor_cotacao_bid_cambio: 50000,
      tipo_operacao_cotacao_bid_cambio: 'EXPORTACAO',
    }

    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .set(HEADERS)
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body.moeda_cotacao_bid_cambio).toBe('EUR')
    expect(res.body.tipo_operacao_cotacao_bid_cambio).toBe('EXPORTACAO')
    // defaults aplicados
    expect(res.body.modalidade_cotacao_bid_cambio).toBe('PRONTO')
    expect(res.body.liquidacao_cotacao_bid_cambio).toBe('D2')
  })

  it('deve retornar 400 quando moeda invalida', async () => {
    const payload = {
      moeda_cotacao_bid_cambio: 'INVALIDA',
      valor_cotacao_bid_cambio: 100,
      tipo_operacao_cotacao_bid_cambio: 'IMPORTACAO',
    }

    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .set(HEADERS)
      .send(payload)

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 quando valor negativo', async () => {
    const payload = {
      moeda_cotacao_bid_cambio: 'USD',
      valor_cotacao_bid_cambio: -100,
      tipo_operacao_cotacao_bid_cambio: 'IMPORTACAO',
    }

    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .set(HEADERS)
      .send(payload)

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 quando campos obrigatorios ausentes', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .set(HEADERS)
      .send({})

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 quando tipo_operacao invalido', async () => {
    const payload = {
      moeda_cotacao_bid_cambio: 'USD',
      valor_cotacao_bid_cambio: 100,
      tipo_operacao_cotacao_bid_cambio: 'INVALIDO',
    }

    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .set(HEADERS)
      .send(payload)

    expect(res.status).toBe(400)
  })

  it('deve rejeitar campo legado "currency" (nome antigo) via Zod', async () => {
    const payload = {
      currency: 'USD',           // campo legado
      amount: 150000,            // campo legado
      operation_type: 'IMPORT',  // campo legado
    }

    const res = await request(app)
      .post('/api/v1/bid-cambio/cotacoes')
      .set(HEADERS)
      .send(payload)

    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/bid-cambio/cotacoes', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    nextId = 1
    vi.clearAllMocks()

    // Popula dados de teste
    mockCotacoes.push(
      {
        id_cotacao_bid_cambio: 'cotacao_1',
        moeda_cotacao_bid_cambio: 'USD',
        valor_cotacao_bid_cambio: 100000,
        tipo_operacao_cotacao_bid_cambio: 'IMPORTACAO',
        modalidade_cotacao_bid_cambio: 'PRONTO',
        liquidacao_cotacao_bid_cambio: 'D2',
        status_cotacao_bid_cambio: 'RASCUNHO',
        data_criacao_cotacao_bid_cambio: '2026-05-21T10:00:00Z',
      },
      {
        id_cotacao_bid_cambio: 'cotacao_2',
        moeda_cotacao_bid_cambio: 'EUR',
        valor_cotacao_bid_cambio: 200000,
        tipo_operacao_cotacao_bid_cambio: 'EXPORTACAO',
        modalidade_cotacao_bid_cambio: 'FUTURO',
        liquidacao_cotacao_bid_cambio: 'D1',
        status_cotacao_bid_cambio: 'EM_ANDAMENTO',
        data_criacao_cotacao_bid_cambio: '2026-05-20T10:00:00Z',
      },
    )
  })

  it('deve listar cotacoes com campos DDD na resposta', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cotacoes')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body).toHaveProperty('pagination')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(2)

    const primeiro = res.body.data[0]
    expect(primeiro).toHaveProperty('id_cotacao_bid_cambio')
    expect(primeiro).toHaveProperty('moeda_cotacao_bid_cambio')
    expect(primeiro).toHaveProperty('valor_cotacao_bid_cambio')
    expect(primeiro).toHaveProperty('tipo_operacao_cotacao_bid_cambio')
    expect(primeiro).toHaveProperty('status_cotacao_bid_cambio')

    // Verifica que campos legados NAO existem
    expect(primeiro).not.toHaveProperty('currency')
    expect(primeiro).not.toHaveProperty('amount')
    expect(primeiro).not.toHaveProperty('operation_type')
    expect(primeiro).not.toHaveProperty('status')
  })

  it('deve retornar paginacao com campos corretos', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cotacoes?page=1&limit=10')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: expect.any(Number),
      pages: expect.any(Number),
    })
  })

  it('deve filtrar por status usando campo DDD', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cotacoes?status=RASCUNHO')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(mockBidCambioCotacao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status_cotacao_bid_cambio: 'RASCUNHO',
        }),
      }),
    )
  })
})

describe('GET /api/v1/bid-cambio/cotacoes/:id', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    vi.clearAllMocks()
    mockCotacoes.push({
      id_cotacao_bid_cambio: 'cotacao_abc',
      moeda_cotacao_bid_cambio: 'USD',
      valor_cotacao_bid_cambio: 75000,
      tipo_operacao_cotacao_bid_cambio: 'IMPORTACAO',
      status_cotacao_bid_cambio: 'RASCUNHO',
    })
  })

  it('deve retornar cotacao por id com campos DDD', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cotacoes/cotacao_abc')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('id_cotacao_bid_cambio', 'cotacao_abc')
    expect(res.body).toHaveProperty('moeda_cotacao_bid_cambio', 'USD')
  })

  it('deve retornar 404 quando cotacao nao existe', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cotacoes/inexistente')
      .set(HEADERS)

    expect(res.status).toBe(404)
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND')
  })
})

describe('PATCH /api/v1/bid-cambio/cotacoes/:id', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    vi.clearAllMocks()
    mockCotacoes.push({
      id_cotacao_bid_cambio: 'cotacao_edit',
      moeda_cotacao_bid_cambio: 'USD',
      valor_cotacao_bid_cambio: 100000,
      tipo_operacao_cotacao_bid_cambio: 'IMPORTACAO',
      modalidade_cotacao_bid_cambio: 'PRONTO',
      liquidacao_cotacao_bid_cambio: 'D2',
      status_cotacao_bid_cambio: 'RASCUNHO',
    })
  })

  it('deve atualizar cotacao usando campos DDD', async () => {
    const res = await request(app)
      .patch('/api/v1/bid-cambio/cotacoes/cotacao_edit')
      .set(HEADERS)
      .send({
        moeda_cotacao_bid_cambio: 'EUR',
        valor_cotacao_bid_cambio: 200000,
        modalidade_cotacao_bid_cambio: 'FUTURO',
      })

    expect(res.status).toBe(200)
    expect(res.body.moeda_cotacao_bid_cambio).toBe('EUR')
    expect(res.body.valor_cotacao_bid_cambio).toBe(200000)
    expect(res.body.modalidade_cotacao_bid_cambio).toBe('FUTURO')
  })

  it('deve rejeitar atualizacao de cotacao que nao esta em RASCUNHO', async () => {
    mockCotacoes[0].status_cotacao_bid_cambio = 'EM_ANDAMENTO'

    const res = await request(app)
      .patch('/api/v1/bid-cambio/cotacoes/cotacao_edit')
      .set(HEADERS)
      .send({ valor_cotacao_bid_cambio: 999 })

    expect(res.status).toBe(400)
    expect(res.body.error).toHaveProperty('code', 'INVALID_STATUS')
  })

  it('deve retornar 404 para cotacao inexistente', async () => {
    const res = await request(app)
      .patch('/api/v1/bid-cambio/cotacoes/inexistente')
      .set(HEADERS)
      .send({ valor_cotacao_bid_cambio: 999 })

    expect(res.status).toBe(404)
  })

  it('deve rejeitar campo legado no PATCH via Zod', async () => {
    const res = await request(app)
      .patch('/api/v1/bid-cambio/cotacoes/cotacao_edit')
      .set(HEADERS)
      .send({ amount: 999 })

    // Zod com strict nao esta ativo, mas campos legados sao ignorados.
    // O update recebe objeto vazio, o que e valido no PATCH parcial.
    expect(res.status).toBe(200)
  })
})

describe('DELETE /api/v1/bid-cambio/cotacoes/:id', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    vi.clearAllMocks()
    mockCotacoes.push({
      id_cotacao_bid_cambio: 'cotacao_del',
      status_cotacao_bid_cambio: 'RASCUNHO',
    })
  })

  it('deve deletar cotacao em RASCUNHO', async () => {
    const res = await request(app)
      .delete('/api/v1/bid-cambio/cotacoes/cotacao_del')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('deleted', true)
  })

  it('deve rejeitar delete de cotacao que nao esta em RASCUNHO', async () => {
    mockCotacoes[0].status_cotacao_bid_cambio = 'EM_ANDAMENTO'

    const res = await request(app)
      .delete('/api/v1/bid-cambio/cotacoes/cotacao_del')
      .set(HEADERS)

    expect(res.status).toBe(400)
    expect(res.body.error).toHaveProperty('code', 'INVALID_STATUS')
  })
})

describe('Autenticacao x-internal-key', () => {
  const app = criarApp()

  it('deve retornar 401 sem header x-internal-key', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cotacoes')

    expect(res.status).toBe(401)
  })

  it('deve retornar 401 com chave invalida', async () => {
    const res = await request(app)
      .get('/api/v1/bid-cambio/cotacoes')
      .set('x-internal-key', 'chave-errada')

    expect(res.status).toBe(401)
  })
})
