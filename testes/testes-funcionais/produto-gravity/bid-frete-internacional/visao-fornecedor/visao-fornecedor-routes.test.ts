/// <reference types="vitest/globals" />
// @vitest-environment node

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/integracoes-tenant.js',
  () => ({
    notificacoesIntegration: { fornecedorRespondeu: vi.fn() },
    historicoIntegration: { fornecedorRespondeu: vi.fn() },
    atividadesIntegration: { aguardandoAprovacao: vi.fn() },
  }),
)

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/enviar-proposta-disparo-bid-frete-internacional.js',
  () => ({
    enviarPropostaDisparoBidFreteInternacional: vi.fn(),
  }),
)

const mockFornecedor = {
  id_fornecedor_bid_frete_internacional: 'forn_1',
  id_organizacao: 'org_1',
  nome_fornecedor_bid_frete_internacional: 'Maersk Test',
  tipo_fornecedor_bid_frete_internacional: 'ARMADOR',
  email_fornecedor_bid_frete_internacional: 'test@maersk.com',
  id_usuario: 'user_gravity_1',
  id_clerk_usuario: 'user_clerk_1',
}

const mockPrisma = {
  fornecedorBidFreteInternacional: {
    findFirst: vi.fn(async () => mockFornecedor),
    update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      ...mockFornecedor,
      ...data,
    })),
  },
  disparoCotacaoBidFreteInternacional: {
    count: vi.fn(async () => 2),
    findMany: vi.fn(async () => []),
  },
  propostaBidFreteInternacional: {
    count: vi.fn(async () => 5),
    findMany: vi.fn(async () => []),
  },
  classificacaoBidFreteInternacional: {
    findUnique: vi.fn(async () => ({
      nota_global_classificacao_bid_frete_internacional: 4.2,
      total_cotacoes_recebidas_classificacao_bid_frete_internacional: 10,
    })),
  },
  avaliacaoBidFreteInternacional: {
    findMany: vi.fn(async () => []),
  },
  tabelaBidFreteInternacional: {
    findMany: vi.fn(async () => []),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      id_tabela_bid_frete_internacional: 'tab_1',
      ...data,
    })),
    findFirst: vi.fn(async () => ({
      id_tabela_bid_frete_internacional: 'tab_1',
      id_fornecedor_bid_frete_internacional: 'forn_1',
    })),
    update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      id_tabela_bid_frete_internacional: 'tab_1',
      ...data,
    })),
    delete: vi.fn(async () => ({})),
  },
}

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-classificacao-bid-frete-internacional.js',
  () => ({
    motorClassificacao: {
      recalcular: vi.fn(async () => ({
        nota_global_classificacao_bid_frete_internacional: 4.2,
        total_cotacoes_recebidas_classificacao_bid_frete_internacional: 10,
        total_cotacoes_respondidas_classificacao_bid_frete_internacional: 8,
        total_cotacoes_aprovadas_classificacao_bid_frete_internacional: 3,
        tempo_medio_resposta_horas_classificacao_bid_frete_internacional: 12,
        media_frete_classificacao_bid_frete_internacional: 4,
        media_atendimento_classificacao_bid_frete_internacional: 4.1,
        media_resposta_classificacao_bid_frete_internacional: 3.9,
        media_confiabilidade_classificacao_bid_frete_internacional: 4.3,
      })),
    },
  }),
)

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/monetizacao.js',
  () => ({ monetizacao: { resumoFornecedor: vi.fn(async () => ({})) } }),
)

import { visaoFornecedorBidFreteInternacionalRouter } from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/visao-fornecedor-bid-frete-internacional'

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const r = req as Request & { prisma: typeof mockPrisma; tenantId?: string }
    r.prisma = mockPrisma
    r.tenantId = (req.headers['x-id-organizacao'] as string) ?? 'org_1'
    next()
  })
  app.use('/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional', visaoFornecedorBidFreteInternacionalRouter)
  return app
}

describe('visao-fornecedor-bid-frete-internacional routes', () => {
  it('GET /dashboard retorna wrapper visao_fornecedor_bid_frete_internacional com metricas DDD', async () => {
    const app = criarApp()
    const res = await request(app)
      .get('/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/dashboard')
      .set('x-id-usuario', 'user_gravity_1')
      .set('x-id-organizacao', 'org_1')

    expect(res.status).toBe(200)
    expect(res.body.visao_fornecedor_bid_frete_internacional).toBeDefined()
    expect(res.body.visao_fornecedor_bid_frete_internacional.fornecedor_bid_frete_internacional).toMatchObject({
      id_fornecedor_bid_frete_internacional: 'forn_1',
      nome_fornecedor_bid_frete_internacional: 'Maersk Test',
    })
    expect(res.body.visao_fornecedor_bid_frete_internacional.metricas_visao_fornecedor_bid_frete_internacional).toMatchObject({
      cotacoes_pendentes_visao_fornecedor_bid_frete_internacional: expect.any(Number),
      propostas_enviadas_visao_fornecedor_bid_frete_internacional: expect.any(Number),
    })
    expect(res.body.fornecedor).toBeUndefined()
    expect(res.body.bidRequest).toBeUndefined()
  })

  it('GET /cotacoes-pendentes retorna disparos_cotacao_bid_frete_internacional', async () => {
    const app = criarApp()
    const res = await request(app)
      .get('/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/cotacoes-pendentes')
      .set('x-id-usuario', 'user_gravity_1')
      .set('x-id-organizacao', 'org_1')

    expect(res.status).toBe(200)
    expect(res.body.visao_fornecedor_bid_frete_internacional.disparos_cotacao_bid_frete_internacional).toEqual([])
  })

  it('resolver fornecedor aceita id_usuario ou id_clerk_usuario no header x-id-usuario', async () => {
    const app = criarApp()
    mockPrisma.fornecedorBidFreteInternacional.findFirst.mockClear()

    await request(app)
      .get('/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/cotacoes-pendentes')
      .set('x-id-usuario', 'user_gravity_cuid')
      .set('x-id-organizacao', 'org_1')

    expect(mockPrisma.fornecedorBidFreteInternacional.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id_organizacao: 'org_1',
          OR: [
            { id_usuario: 'user_gravity_cuid' },
            { id_clerk_usuario: 'user_gravity_cuid' },
          ],
        }),
      }),
    )
  })

  const payloadTabela = {
    origem_codigo_tabela_bid_frete_internacional: 'BRSSZ',
    origem_nome_tabela_bid_frete_internacional: 'Santos',
    destino_codigo_tabela_bid_frete_internacional: 'CNSHA',
    destino_nome_tabela_bid_frete_internacional: 'Shanghai',
    modal_tabela_bid_frete_internacional: 'MARITIMO',
    modalidade_tabela_bid_frete_internacional: 'FCL',
    moeda_tabela_bid_frete_internacional: 'USD',
    valor_frete_tabela_bid_frete_internacional: 1200,
    taxas_origem_tabela_bid_frete_internacional: 100,
    taxas_destino_tabela_bid_frete_internacional: 50,
    valor_total_tabela_bid_frete_internacional: 1350,
    dias_transito_tabela_bid_frete_internacional: 28,
    validade_inicio_tabela_bid_frete_internacional: '2026-01-01T00:00:00.000Z',
    validade_fim_tabela_bid_frete_internacional: '2026-12-31T23:59:59.999Z',
  }

  it('POST /tabelas-valor cria tabela com wrapper DDD', async () => {
    const app = criarApp()
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/tabelas-valor')
      .set('x-id-usuario', 'user_clerk_1')
      .send(payloadTabela)

    expect(res.status).toBe(201)
    expect(res.body.visao_fornecedor_bid_frete_internacional.tabela_bid_frete_internacional).toMatchObject({
      id_tabela_bid_frete_internacional: 'tab_1',
      origem_codigo_tabela_bid_frete_internacional: 'BRSSZ',
    })
  })

  it('PUT /tabelas-valor/:id atualiza tabela do fornecedor logado', async () => {
    const app = criarApp()
    const res = await request(app)
      .put('/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/tabelas-valor/tab_1')
      .set('x-id-usuario', 'user_clerk_1')
      .send({ valor_frete_tabela_bid_frete_internacional: 1300 })

    expect(res.status).toBe(200)
    expect(res.body.visao_fornecedor_bid_frete_internacional.tabela_bid_frete_internacional.valor_frete_tabela_bid_frete_internacional).toBe(1300)
  })

  it('DELETE /tabelas-valor/:id remove tabela do fornecedor logado', async () => {
    const app = criarApp()
    const res = await request(app)
      .delete('/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/tabelas-valor/tab_1')
      .set('x-id-usuario', 'user_clerk_1')

    expect(res.status).toBe(200)
    expect(mockPrisma.tabelaBidFreteInternacional.delete).toHaveBeenCalled()
  })
})
