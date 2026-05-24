/// <reference types="vitest/globals" />
// @vitest-environment node

/**
 * cotacoes-routes.test.ts — Testes funcionais das rotas de Cotacao BID Frete Internacional
 * Valida contratos HTTP com nomes DDD corretos nos campos.
 */

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

// ── Mocks hoisted ───────────────────────────────────────────────────────────

const mockCotacoes: Record<string, unknown>[] = []
let nextId = 1

const mockBidFreteInternacionalCotacao = {
  create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    const cotacao = {
      id_cotacao_bid_frete_internacional: `cotacao_${nextId++}`,
      ...data,
      status_cotacao_bid_frete_internacional: data.status_cotacao_bid_frete_internacional ?? 'RASCUNHO',
      data_criacao_cotacao_bid_frete_internacional: new Date().toISOString(),
    }
    mockCotacoes.push(cotacao)
    return cotacao
  }),
  findMany: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
    let result = [...mockCotacoes]
    if (where?.status_cotacao_bid_frete_internacional) {
      result = result.filter(c => c.status_cotacao_bid_frete_internacional === where.status_cotacao_bid_frete_internacional)
    }
    return result
  }),
  count: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
    if (where?.status_cotacao_bid_frete_internacional) {
      return mockCotacoes.filter(c => c.status_cotacao_bid_frete_internacional === where.status_cotacao_bid_frete_internacional).length
    }
    return mockCotacoes.length
  }),
  findFirst: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
    return mockCotacoes.find(c => c.id_cotacao_bid_frete_internacional === where.id_cotacao_bid_frete_internacional) ?? null
  }),
  update: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    const cotacao = mockCotacoes.find(c => c.id_cotacao_bid_frete_internacional === where.id_cotacao_bid_frete_internacional)
    if (!cotacao) throw new Error('Cotacao nao encontrada')
    Object.assign(cotacao, data)
    return cotacao
  }),
  delete: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
    const idx = mockCotacoes.findIndex(c => c.id_cotacao_bid_frete_internacional === where.id_cotacao_bid_frete_internacional)
    if (idx === -1) throw new Error('Cotacao nao encontrada')
    return mockCotacoes.splice(idx, 1)[0]
  }),
}

const mockPrisma = {
  bidFreteInternacionalCotacao: mockBidFreteInternacionalCotacao,
}

// Mock integracoes-tenant S2S
vi.mock(
  '../../../servicos-global/produto/bid-frete-internacional/server/src/services/integracoes-tenant.js',
  () => ({
    atividadesIntegration: { cotacaoCriada: vi.fn() },
    historicoIntegration: { cotacaoCriada: vi.fn(), registrar: vi.fn() },
  }),
)

// ── App de teste ─────────────────────────────────────────────────────────────

import { cotacoesRouter } from '../../../servicos-global/produto/bid-frete-internacional/server/src/routes/cotacoes'

function criarApp() {
  const app = express()
  app.use(express.json())

  // Injeta prisma mock e tenantId no req
  app.use((req: Request & { prisma?: typeof mockPrisma; tenantId?: string }, _res: Response, next: NextFunction) => {
    req.prisma = mockPrisma as unknown as typeof req.prisma
    req.tenantId = 'org_test_01'
    next()
  })

  app.use('/api/v1/bid-frete-internacional/cotacoes', cotacoesRouter)

  // Error handler
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message } })
    }
    const statusCode = err.statusCode ?? 500
    res.status(statusCode).json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } })
  })

  return app
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const HEADERS = {
  'x-id-usuario': 'user_test_01',
}

const COTACAO_VALIDA = {
  tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  modalidade_cotacao_bid_frete_internacional: 'FCL',
  origem_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
  origem_nome_cotacao_bid_frete_internacional: 'Porto de Santos',
  origem_pais_cotacao_bid_frete_internacional: 'Brasil',
  destino_codigo_cotacao_bid_frete_internacional: 'NLRTM',
  destino_nome_cotacao_bid_frete_internacional: 'Porto de Roterdã',
  destino_pais_cotacao_bid_frete_internacional: 'Holanda',
  descricao_mercadoria_cotacao_bid_frete_internacional: 'Maquinários e Autopeças',
  incoterm_cotacao_bid_frete_internacional: 'FOB',
  quantidade_cotacao_bid_frete_internacional: 2,
}

// ── Testes ───────────────────────────────────────────────────────────────────

describe('POST /api/v1/bid-frete-internacional/cotacoes', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    nextId = 1
    vi.clearAllMocks()
  })

  it('deve criar cotacao com campos DDD e retornar 201', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes')
      .set(HEADERS)
      .send(COTACAO_VALIDA)

    expect(res.status).toBe(201)
    expect(res.body.cotacao).toHaveProperty('id_cotacao_bid_frete_internacional')
    expect(res.body.cotacao).toHaveProperty('tipo_operacao_cotacao_bid_frete_internacional', 'IMPORTACAO')
    expect(res.body.cotacao).toHaveProperty('modal_cotacao_bid_frete_internacional', 'MARITIMO')
    expect(res.body.cotacao).toHaveProperty('status_cotacao_bid_frete_internacional', 'RASCUNHO')
    expect(res.body.cotacao).toHaveProperty('numero_cotacao_bid_frete_internacional')
    expect(res.body.cotacao.numero_cotacao_bid_frete_internacional).toContain('BID-')
  })

  it('deve retornar 400 se campo obrigatorio origem_codigo estiver ausente', async () => {
    const { origem_codigo_cotacao_bid_frete_internacional, ...invalido } = COTACAO_VALIDA

    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes')
      .set(HEADERS)
      .send(invalido)

    expect(res.status).toBe(400)
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})

describe('GET /api/v1/bid-frete-internacional/cotacoes', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    nextId = 1
    vi.clearAllMocks()

    mockCotacoes.push({
      id_cotacao_bid_frete_internacional: 'cotacao_1',
      tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
      status_cotacao_bid_frete_internacional: 'RASCUNHO',
      id_produto_gravity: 'bid-frete-internacional',
    })
  })

  it('deve retornar a lista de cotacoes com paginacao', async () => {
    const res = await request(app)
      .get('/api/v1/bid-frete-internacional/cotacoes')
      .set(HEADERS)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('cotacoes')
    expect(res.body).toHaveProperty('pagination')
    expect(res.body.cotacoes.length).toBe(1)
  })
})

describe('PATCH /api/v1/bid-frete-internacional/cotacoes/:id/status', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    vi.clearAllMocks()
    mockCotacoes.push({
      id_cotacao_bid_frete_internacional: 'cotacao_test',
      status_cotacao_bid_frete_internacional: 'RASCUNHO',
    })
  })

  it('deve aprovar cotacao e registrar data de aprovacao', async () => {
    const res = await request(app)
      .patch('/api/v1/bid-frete-internacional/cotacoes/cotacao_test/status')
      .send({
        status: 'APROVADA',
        id_fornecedor_vencedor_cotacao_bid_frete_internacional: 'forn-xyz'
      })

    expect(res.status).toBe(200)
    expect(res.body.cotacao.status_cotacao_bid_frete_internacional).toBe('APROVADA')
    expect(res.body.cotacao.id_fornecedor_vencedor_cotacao_bid_frete_internacional).toBe('forn-xyz')
    expect(res.body.cotacao).toHaveProperty('data_aprovacao_cotacao_bid_frete_internacional')
  })
})
