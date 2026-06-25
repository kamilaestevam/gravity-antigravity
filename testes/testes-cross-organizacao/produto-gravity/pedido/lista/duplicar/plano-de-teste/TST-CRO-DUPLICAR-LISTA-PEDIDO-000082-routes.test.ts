// @vitest-environment node
/**
 * TST-CRO-DUPLICAR-LISTA-PEDIDO-000082 — Cross-organização Duplicar (rotas HTTP)
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

const ORG_A = 'org-A'
const ORG_B = 'org-B'

const { mockPreview, mockConfirmar, mockDuplicarItens } = vi.hoisted(() => ({
  mockPreview: vi.fn(),
  mockConfirmar: vi.fn(),
  mockDuplicarItens: vi.fn(),
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: vi.fn(async (req: Request, cb: (db: unknown) => Promise<void>) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: ORG_B,
      idUsuario: 'usr-B',
    }
    ;(req as unknown as { auth: { nome_usuario: string } }).auth = { nome_usuario: 'User B' }
    await cb({})
  }),
}))

vi.mock('../../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js', () => ({
  DuplicarService: vi.fn().mockImplementation(() => ({
    preview: mockPreview,
    confirmar: mockConfirmar,
    duplicarItens: mockDuplicarItens,
  })),
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
      super(message)
      this.name = 'AppError'
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

vi.mock('../../../../../../servicos-global/produto/pedido/server/src/permissoes.js', () => ({
  exigirPermissao: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}))

import { duplicacoesPedidoRouter, AppError } from '../../../../../../../servicos-global/produto/pedido/server/src/routes/duplicacoes-pedido.js'

let app: express.Application

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
}

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use('/api/v1/pedidos/duplicacoes', duplicacoesPedidoRouter)
  app.use(errorHandler)
})

describe('TST-CRO-DUPLICAR-LISTA-PEDIDO-000082 — Rotas HTTP', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('CRO-DUP-07: POST preview com ids de outra org → 404', async () => {
    mockPreview.mockRejectedValue(new AppError('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND'))
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/preview')
      .send({ ids: [`ped-${ORG_A}`] })
    expect(res.status).toBe(404)
    expect(mockPreview).toHaveBeenCalledWith(expect.anything(), ORG_B, [`ped-${ORG_A}`])
  })

  it('CRO-DUP-08: POST confirmar com ids de outra org → 404', async () => {
    mockConfirmar.mockRejectedValue(new AppError('Um ou mais pedidos não encontrados', 404, 'NOT_FOUND'))
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: [`ped-${ORG_A}`] })
    expect(res.status).toBe(404)
    expect(mockConfirmar).toHaveBeenCalledWith(
      expect.anything(), ORG_B, undefined, 'usr-B', expect.any(String),
      expect.objectContaining({ ids: [`ped-${ORG_A}`] }),
    )
  })

  it('CRO-DUP-09: POST itens com pedido de outra org → 404', async () => {
    mockDuplicarItens.mockRejectedValue(new AppError('Pedido não encontrado', 404, 'NOT_FOUND'))
    const res = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: `ped-${ORG_A}`, item_ids: [`it-${ORG_A}`] })
    expect(res.status).toBe(404)
    expect(mockDuplicarItens).toHaveBeenCalledWith(
      expect.anything(), ORG_B, undefined,
      expect.objectContaining({ pedido_id: `ped-${ORG_A}` }),
    )
  })
})
