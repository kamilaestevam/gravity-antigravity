/// <reference types="vitest/globals" />
// @vitest-environment node
// TST-FUN-BIDFRT-LISTA-001 — POST cotação persiste id_workspace do header (lista)

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
  findMany: vi.fn(async () => [...mockCotacoes]),
  count: vi.fn(async () => mockCotacoes.length),
  findFirst: vi.fn(async () => null),
  update: vi.fn(),
  delete: vi.fn(),
}

const mockPrisma = {
  cotacaoBidFreteInternacional: mockBidFreteInternacionalCotacao,
}

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-bid-frete-internacional.js',
  () => ({
    motorBid: {
      disparar: vi.fn(async () => ({ disparos: 0, enviados: false, results: [] })),
      dispararCotacaoAberta: vi.fn(async () => ({ disparos: 0, enviados: false, results: [] })),
    },
  }),
)

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/integracoes-tenant.js',
  () => ({
    atividadesIntegration: { cotacaoCriada: vi.fn() },
    historicoIntegration: { cotacaoCriada: vi.fn(), registrar: vi.fn() },
  }),
)

import { cotacoesRouter } from '../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/cotacoes'

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
  descricao_mercadoria_cotacao_bid_frete_internacional: 'Maquinários',
  incoterm_cotacao_bid_frete_internacional: 'FOB',
  quantidade_cotacao_bid_frete_internacional: 1,
  disparar_ao_criar: false,
}

describe('POST /cotacoes — id_workspace para coluna Workspace da lista', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    nextId = 1
    vi.clearAllMocks()
  })

  it('persiste id_workspace quando header x-id-workspace está presente', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes')
      .set({
        'x-id-usuario': 'user_test_01',
        'x-id-workspace': 'ws_filial_sp',
      })
      .send(COTACAO_VALIDA)

    expect(res.status).toBe(201)
    expect(res.body.cotacao.id_workspace).toBe('ws_filial_sp')
    expect(mockBidFreteInternacionalCotacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id_workspace: 'ws_filial_sp' }),
      }),
    )
  })

  it('não injeta id_workspace quando header está ausente', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes')
      .set({ 'x-id-usuario': 'user_test_01' })
      .send(COTACAO_VALIDA)

    expect(res.status).toBe(201)
    expect(res.body.cotacao.id_workspace).toBeUndefined()
    const createArg = mockBidFreteInternacionalCotacao.create.mock.calls[0][0] as { data: Record<string, unknown> }
    expect(createArg.data).not.toHaveProperty('id_workspace')
  })

  it('GET lista retorna id_workspace persistido para resolução de nome no front', async () => {
    await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes')
      .set({
        'x-id-usuario': 'user_test_01',
        'x-id-workspace': 'ws_filial_rj',
      })
      .send(COTACAO_VALIDA)

    const res = await request(app)
      .get('/api/v1/bid-frete-internacional/cotacoes')
      .set({ 'x-id-usuario': 'user_test_01' })

    expect(res.status).toBe(200)
    expect(res.body.cotacoes[0].id_workspace).toBe('ws_filial_rj')
  })
})
