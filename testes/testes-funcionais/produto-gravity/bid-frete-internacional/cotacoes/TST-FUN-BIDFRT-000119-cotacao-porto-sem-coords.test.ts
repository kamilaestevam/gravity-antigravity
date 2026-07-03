/// <reference types="vitest/globals" />
// TST-FUN-BIDFRT-000119 — POST cotação com porto Cadastros sem lat/long (AEJEA)

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

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
}

const mockPrisma = {
  cotacaoBidFreteInternacional: mockBidFreteInternacionalCotacao,
}

const { fetchCadastrosJson } = vi.hoisted(() => ({
  fetchCadastrosJson: vi.fn(),
}))

vi.mock(
  '../../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/cadastros-client.js',
  () => ({
    fetchCadastrosJson,
  }),
)

vi.mock(
  '../../../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-bid-frete-internacional.js',
  () => ({
    motorBid: {
      disparar: vi.fn(async () => ({ disparos: 0, enviados: false, results: [] })),
      dispararCotacaoAberta: vi.fn(async () => ({ disparos: 0, enviados: false, results: [] })),
    },
  }),
)

vi.mock(
  '../../../../../servicos-global/produto/bid-frete-internacional/server/src/services/integracoes-tenant.js',
  () => ({
    atividadesIntegration: { cotacaoCriada: vi.fn() },
    historicoIntegration: { cotacaoCriada: vi.fn(), registrar: vi.fn() },
  }),
)

import { cotacoesRouter } from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/cotacoes'

const PORTO_AEJEA = {
  codigo_unlocode_porto: 'AEJEA',
  nome_porto: 'Jebel Ali',
  codigo_pais_porto: 'AE',
  latitude_porto: null,
  longitude_porto: null,
  ativo_porto: true,
}

const PORTO_BRAAR = {
  codigo_unlocode_porto: 'BRAAR',
  nome_porto: 'Acará',
  codigo_pais_porto: 'BR',
  latitude_porto: -1.58,
  longitude_porto: -48.47,
  ativo_porto: true,
}

function mockCadastrosRotaMaritima() {
  fetchCadastrosJson.mockImplementation(async (path: string) => {
    if (path === '/api/v1/cadastros/portos') {
      return { itens: [PORTO_AEJEA, PORTO_BRAAR], total: 2 }
    }
    if (path === '/api/v1/cadastros/aeroportos') {
      return { itens: [], total: 0 }
    }
    if (path.endsWith('/AEJEA')) return PORTO_AEJEA
    if (path.endsWith('/BRAAR')) return PORTO_BRAAR
    throw new Error('Cadastros 404: Porto')
  })
}

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request & { prisma?: typeof mockPrisma; tenantId?: string }, _res: Response, next: NextFunction) => {
    req.prisma = mockPrisma as unknown as typeof req.prisma
    req.tenantId = 'org_test_01'
    next()
  })
  app.use('/api/v1/bid-frete-internacional/cotacoes', cotacoesRouter)
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode ?? 500
    res.status(statusCode).json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } })
  })
  return app
}

const HEADERS = { 'x-id-usuario': 'user_test_01' }

const COTACAO_AEJEA_BRAAR = {
  tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  modalidade_cotacao_bid_frete_internacional: 'FCL',
  porto_origem_cotacao_bid_frete_internacional: 'AEJEA',
  porto_destino_cotacao_bid_frete_internacional: 'BRAAR',
  origem_codigo_cotacao_bid_frete_internacional: 'AEJEA',
  origem_nome_cotacao_bid_frete_internacional: 'Jebel Ali',
  origem_pais_cotacao_bid_frete_internacional: 'AE',
  destino_codigo_cotacao_bid_frete_internacional: 'BRAAR',
  destino_nome_cotacao_bid_frete_internacional: 'Acará',
  destino_pais_cotacao_bid_frete_internacional: 'BR',
  descricao_mercadoria_cotacao_bid_frete_internacional: 'Mercadoria teste',
  incoterm_cotacao_bid_frete_internacional: 'CIP',
  quantidade_volume_cotacao_bid_frete_internacional: 1,
  tipo_container_cotacao_bid_frete_internacional: '22G0',
  disparar_ao_criar: false,
}

describe('TST-FUN-BIDFRT-000119 — POST cotação rota Cadastros sem coords', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    nextId = 1
    vi.clearAllMocks()
    mockCadastrosRotaMaritima()
  })

  it('deve criar cotação 201 quando origem AEJEA existe no Cadastros sem lat/long', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes')
      .set(HEADERS)
      .send(COTACAO_AEJEA_BRAAR)

    expect(res.status).toBe(201)
    expect(res.body.cotacao.origem_codigo_cotacao_bid_frete_internacional).toBe('AEJEA')
    expect(res.body.cotacao.destino_codigo_cotacao_bid_frete_internacional).toBe('BRAAR')
  })

  it('deve retornar 400 quando origem não existe no Cadastros', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes')
      .set(HEADERS)
      .send({
        ...COTACAO_AEJEA_BRAAR,
        porto_origem_cotacao_bid_frete_internacional: 'ZZZZZ',
        origem_codigo_cotacao_bid_frete_internacional: 'ZZZZZ',
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.message).toContain('origem_codigo_cotacao_bid_frete_internacional')
  })
})
