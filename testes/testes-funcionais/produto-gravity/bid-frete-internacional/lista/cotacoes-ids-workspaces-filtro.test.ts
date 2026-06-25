/// <reference types="vitest/globals" />
// @vitest-environment node

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

const mockCotacoes: Record<string, unknown>[] = []

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/shared/validar-multi-workspace-bid-frete-internacional.js',
  () => ({
    assertWorkspacesAutorizadosNoRequest: vi.fn().mockResolvedValue(undefined),
  }),
)

const mockBidFreteInternacionalCotacao = {
  findMany: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
    return mockCotacoes.filter(c => {
      const filtro = where?.id_workspace as { in?: string[] } | string | undefined
      if (!filtro) return true
      if (typeof filtro === 'string') return c.id_workspace === filtro
      if (filtro.in) return filtro.in.includes(c.id_workspace as string)
      return true
    })
  }),
  count: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
    const lista = await mockBidFreteInternacionalCotacao.findMany({ where })
    return lista.length
  }),
}

const mockPrisma = {
  cotacaoBidFreteInternacional: mockBidFreteInternacionalCotacao,
}

import { cotacoesRouter } from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/cotacoes'

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request & { prisma?: typeof mockPrisma }, _res, next) => {
    req.prisma = mockPrisma
    next()
  })
  app.use('/api/v1/bid-frete-internacional/cotacoes', cotacoesRouter)
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } })
  })
  return app
}

describe('GET /cotacoes — filtro ids_workspaces', () => {
  const app = criarApp()

  beforeEach(() => {
    mockCotacoes.length = 0
    mockCotacoes.push(
      { id_cotacao_bid_frete_internacional: 'c1', id_workspace: 'ws-sp', id_produto_gravity: 'bid-frete-internacional' },
      { id_cotacao_bid_frete_internacional: 'c2', id_workspace: 'ws-rj', id_produto_gravity: 'bid-frete-internacional' },
    )
    vi.clearAllMocks()
  })

  it('filtra cotações por ids_workspaces CSV', async () => {
    const res = await request(app)
      .get('/api/v1/bid-frete-internacional/cotacoes?ids_workspaces=ws-sp')
      .set({ 'x-id-usuario': 'user_test_01' })

    expect(res.status).toBe(200)
    expect(res.body.cotacoes).toHaveLength(1)
    expect(res.body.cotacoes[0].id_workspace).toBe('ws-sp')
    expect(mockBidFreteInternacionalCotacao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id_workspace: { in: ['ws-sp'] },
        }),
      }),
    )
  })
})
