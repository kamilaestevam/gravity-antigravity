/// <reference types="vitest/globals" />
// @vitest-environment node

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/shared/validar-multi-workspace-bid-frete-internacional.js',
  () => ({
    assertWorkspacesAutorizadosNoRequest: vi.fn(async () => {
      const err = new Error('1 workspace(s) não autorizado(s) para este usuário') as Error & {
        statusCode?: number
        code?: string
      }
      err.statusCode = 403
      err.code = 'WORKSPACE_NAO_AUTORIZADO'
      throw err
    }),
  }),
)

const mockPrisma = {
  cotacaoBidFreteInternacional: {
    findMany: vi.fn(async () => []),
    count: vi.fn(async () => 0),
  },
}

import { cotacoesRouter } from '../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/cotacoes'

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

describe('GET /cotacoes — workspace não autorizado', () => {
  it('retorna 403 WORKSPACE_NAO_AUTORIZADO quando ids_workspaces inclui workspace bloqueado', async () => {
    const res = await request(criarApp())
      .get('/api/v1/bid-frete-internacional/cotacoes?ids_workspaces=ws-bloqueado')
      .set({
        'x-id-usuario': 'user_test_01',
        'x-id-organizacao': 'org_test_01',
      })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('WORKSPACE_NAO_AUTORIZADO')
  })
})
