/// <reference types="vitest/globals" />
// TST-FUN-BIDFRT-000120 — POST /cotacoes filtra fornecedor inelegível ao modal antes do disparo

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

const { fetchCadastrosJson, mockDisparar } = vi.hoisted(() => ({
  fetchCadastrosJson: vi.fn(),
  mockDisparar: vi.fn(async () => ({ disparos: 1, enviados: true, results: [] })),
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
      disparar: mockDisparar,
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

const ID_TRANSPORTADORA_INT = 'BR-TRANSCAPRI-00001'
const ID_ARMADOR = 'BR-MAERSK-00001'

function mockCadastrosParceirosFrete() {
  fetchCadastrosJson.mockImplementation(async (path: string) => {
    if (path === '/api/v1/fornecedores') {
      return {
        itens: [
          {
            id_fornecedor: ID_TRANSPORTADORA_INT,
            nome_fornecedor: 'TRANSCAPRI',
            pais_fornecedor: 'BR',
            ativo_fornecedor: true,
            pode_ser_agente_fornecedor: false,
            pode_ser_armador_fornecedor: false,
            pode_ser_cia_aerea_fornecedor: false,
            pode_ser_transportadora_rodoviaria_nacional_fornecedor: false,
            pode_ser_transportadora_rodoviaria_internacional_fornecedor: true,
          },
          {
            id_fornecedor: ID_ARMADOR,
            nome_fornecedor: 'Maersk',
            pais_fornecedor: 'DK',
            ativo_fornecedor: true,
            pode_ser_agente_fornecedor: false,
            pode_ser_armador_fornecedor: true,
            pode_ser_cia_aerea_fornecedor: false,
            pode_ser_transportadora_rodoviaria_nacional_fornecedor: false,
            pode_ser_transportadora_rodoviaria_internacional_fornecedor: false,
          },
        ],
        total: 2,
      }
    }
    throw new Error(`Cadastros mock não configurado: ${path}`)
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

const COTACAO_MARITIMA = {
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
  quantidade_volume_cotacao_bid_frete_internacional: 1,
  visibilidade_cotacao_bid_frete_internacional: 'DIRECIONADA',
  disparar_ao_criar: true,
  canais_disparo: ['EMAIL'],
  fornecedor_ids: [ID_TRANSPORTADORA_INT, ID_ARMADOR],
}

describe('TST-FUN-BIDFRT-000120 — elegibilidade fornecedor por modal no POST /cotacoes', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    nextId = 1
    vi.clearAllMocks()
    mockCadastrosParceirosFrete()
  })

  it('cotação MARITIMO não dispara transportadora rodoviária internacional — só armador', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes')
      .set(HEADERS)
      .send(COTACAO_MARITIMA)

    expect(res.status).toBe(201)
    expect(mockDisparar).toHaveBeenCalledTimes(1)
    expect(mockDisparar).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fornecedor_ids: [ID_ARMADOR],
      }),
    )
    expect(mockDisparar).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fornecedor_ids: expect.arrayContaining([ID_TRANSPORTADORA_INT]),
      }),
    )
  })

  it('cotação MARITIMO só com transportadora internacional retorna disparo vazio sem chamar motor com IDs', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/cotacoes')
      .set(HEADERS)
      .send({
        ...COTACAO_MARITIMA,
        fornecedor_ids: [ID_TRANSPORTADORA_INT],
      })

    expect(res.status).toBe(201)
    expect(mockDisparar).not.toHaveBeenCalled()
    expect(res.body.disparo).toMatchObject({
      disparos: 0,
      message: expect.stringContaining('elegivel'),
    })
  })
})
