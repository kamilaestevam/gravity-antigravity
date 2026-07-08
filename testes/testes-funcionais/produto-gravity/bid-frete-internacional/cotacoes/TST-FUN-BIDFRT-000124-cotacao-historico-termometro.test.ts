/// <reference types="vitest/globals" />
// TST-FUN-BIDFRT-000124 — GET cotação retorna histórico termômetro filtrado

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

const COTACAO_ATUAL = {
  id_cotacao_bid_frete_internacional: 'cot_atual',
  id_organizacao: 'org_test_01',
  id_produto_gravity: 'bid-frete-internacional',
  numero_cotacao_bid_frete_internacional: 'BID-20260707-0001',
  status_cotacao_bid_frete_internacional: 'EM_ANALISE',
  tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  modalidade_cotacao_bid_frete_internacional: 'FCL',
  tipo_container_cotacao_bid_frete_internacional: '40HC',
  origem_codigo_cotacao_bid_frete_internacional: 'CNSHA',
  destino_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
  incoterm_cotacao_bid_frete_internacional: 'FOB',
  data_criacao_cotacao_bid_frete_internacional: new Date().toISOString(),
  data_atualizacao_cotacao_bid_frete_internacional: new Date().toISOString(),
  disparos_cotacao: [],
  propostas: [],
  bid_bid_frete_internacional: null,
}

const HISTORICO_COMPATIVEL = {
  id_cotacao_bid_frete_internacional: 'cot_hist_40hc',
  numero_cotacao_bid_frete_internacional: 'BID-20260301-0002',
  tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  modalidade_cotacao_bid_frete_internacional: 'FCL',
  tipo_container_cotacao_bid_frete_internacional: '40HC',
  origem_codigo_cotacao_bid_frete_internacional: 'CNSHA',
  destino_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
  incoterm_cotacao_bid_frete_internacional: 'FOB',
  data_aprovacao_cotacao_bid_frete_internacional: '2026-03-15T10:00:00.000Z',
  data_atualizacao_cotacao_bid_frete_internacional: '2026-03-15T10:00:00.000Z',
  propostas: [
    {
      status_proposta_bid_frete_internacional: 'APROVADA',
      valor_frete_proposta_bid_frete_internacional: 1200,
      valor_total_proposta_bid_frete_internacional: 1500,
      moeda_proposta_bid_frete_internacional: 'USD',
    },
  ],
}

const HISTORICO_INCOMPATIVEL_CONTAINER = {
  ...HISTORICO_COMPATIVEL,
  id_cotacao_bid_frete_internacional: 'cot_hist_20gp',
  numero_cotacao_bid_frete_internacional: 'BID-20260301-0003',
  tipo_container_cotacao_bid_frete_internacional: '20GP',
}

const HISTORICO_PROPOSTA_ABERTA = {
  ...HISTORICO_COMPATIVEL,
  id_cotacao_bid_frete_internacional: 'cot_hist_prop',
  numero_cotacao_bid_frete_internacional: 'BID-20260401-0004',
  propostas: [
    {
      data_criacao_proposta_bid_frete_internacional: '2026-04-10T08:00:00.000Z',
      valor_total_proposta_bid_frete_internacional: 980,
      moeda_proposta_bid_frete_internacional: 'USD',
    },
  ],
}

const mockPrisma = {
  cotacaoBidFreteInternacional: {
    findFirst: vi.fn(async () => COTACAO_ATUAL),
    findMany: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      if (where.status_cotacao_bid_frete_internacional === 'APROVADA') {
        return [HISTORICO_COMPATIVEL, HISTORICO_INCOMPATIVEL_CONTAINER]
      }
      if (
        where.propostas != null
        && typeof where.propostas === 'object'
        && 'some' in (where.propostas as object)
      ) {
        return [HISTORICO_PROPOSTA_ABERTA, HISTORICO_INCOMPATIVEL_CONTAINER, COTACAO_ATUAL]
      }
      return []
    }),
  },
  ganhoBidFreteInternacional: {
    findFirst: vi.fn(async () => null),
  },
}

vi.mock(
  '../../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/snapshot-empresa-pagadora-taxa-fechamento-cotacao-bid-frete-internacional.js',
  () => ({
    lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional: vi.fn(() => null),
    registrarEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional: vi.fn(),
  }),
)

import { cotacoesRouter } from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/cotacoes'
import { parseHistoricoTermometroListaFromServer } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/cotacao-historico-termometro-api-schema'

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request & { prisma?: typeof mockPrisma }, _res: Response, next: NextFunction) => {
    req.prisma = mockPrisma as unknown as typeof req.prisma
    next()
  })
  app.use('/api/v1/bid-frete-internacional/cotacoes', cotacoesRouter)
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode ?? 500
    res.status(statusCode).json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } })
  })
  return app
}

describe('GET /api/v1/bid-frete-internacional/cotacoes/:id — termômetro histórico', () => {
  it('retorna histórico filtrado por matching FCL (exclui container incompatível)', async () => {
    const app = criarApp()
    const res = await request(app).get('/api/v1/bid-frete-internacional/cotacoes/cot_atual')

    expect(res.status).toBe(200)
    expect(res.body.cotacao.historico_aprovado).toHaveLength(1)
    expect(res.body.cotacao.historico_aprovado[0].id_cotacao_bid_frete_internacional).toBe('cot_hist_40hc')

    expect(res.body.cotacao.historico_propostas_recebidas).toHaveLength(1)
    expect(res.body.cotacao.historico_propostas_recebidas[0].id_cotacao_bid_frete_internacional)
      .toBe('cot_hist_prop')
  })

  it('parse Zod aceita histórico retornado pelo GET', async () => {
    const app = criarApp()
    const res = await request(app).get('/api/v1/bid-frete-internacional/cotacoes/cot_atual')

    const aprovado = parseHistoricoTermometroListaFromServer(
      res.body.cotacao.historico_aprovado,
      'historico_aprovado',
    )
    const propostas = parseHistoricoTermometroListaFromServer(
      res.body.cotacao.historico_propostas_recebidas,
      'historico_propostas_recebidas',
    )

    expect(aprovado).toHaveLength(1)
    expect(propostas).toHaveLength(1)
    expect(aprovado?.[0].propostas?.[0].valor_frete_proposta_bid_frete_internacional).toBe(1200)
  })
})
