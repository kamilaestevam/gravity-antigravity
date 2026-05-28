/// <reference types="vitest/globals" />
// @vitest-environment node

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

const { mockDisparar, mockDispararCotacaoAberta } = vi.hoisted(() => ({
  mockDisparar: vi.fn(async () => ({
    disparos: 1,
    enviados: true,
    results: [{
      id_fornecedor_bid_frete_internacional: 'forn_1',
      canal_disparo_cotacao_bid_frete_internacional: 'EMAIL',
      id_disparo_cotacao_bid_frete_internacional: 'disp_1',
    }],
  })),
  mockDispararCotacaoAberta: vi.fn(async () => ({ disparos: 2, enviados: true, results: [] })),
}))

vi.mock(
  '../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-bid-frete-internacional.js',
  () => ({
    motorBid: {
      disparar: mockDisparar,
      dispararCotacaoAberta: mockDispararCotacaoAberta,
    },
  }),
)

import { solicitacaoCotacaoBidFreteInternacionalRouter } from '../../../servicos-global/produto/bid-frete-internacional/server/src/routes/solicitacao-cotacao-bid-frete-internacional'

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request & { prisma?: object; tenantId?: string }, _res, next) => {
    req.prisma = {}
    req.tenantId = 'org_test'
    next()
  })
  app.use('/api/v1/bid-frete-internacional/solicitacao-cotacao-bid-frete-internacional', solicitacaoCotacaoBidFreteInternacionalRouter)
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } })
  })
  return app
}

describe('solicitacao-cotacao-bid-frete-internacional routes', () => {
  beforeEach(() => {
    mockDisparar.mockClear()
  })

  it('POST /disparar exige x-id-usuario', async () => {
    const app = criarApp()
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/solicitacao-cotacao-bid-frete-internacional/disparar')
      .send({
        id_cotacao_bid_frete_internacional: 'cot_1',
        fornecedor_ids: ['forn_1'],
        canais: ['EMAIL'],
      })
    expect(res.status).toBe(401)
  })

  it('POST /disparar delega ao motorBid', async () => {
    const app = criarApp()
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/solicitacao-cotacao-bid-frete-internacional/disparar')
      .set('x-id-usuario', 'user_1')
      .send({
        id_cotacao_bid_frete_internacional: 'cot_1',
        fornecedor_ids: ['forn_1'],
        canais: ['EMAIL'],
      })
    expect(res.status).toBe(200)
    expect(res.body.disparos).toBe(1)
    expect(mockDisparar).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id_cotacao_bid_frete_internacional: 'cot_1',
        fornecedor_ids: ['forn_1'],
        canais: ['EMAIL'],
        id_usuario: 'user_1',
        id_organizacao: 'org_test',
      }),
    )
  })
})
