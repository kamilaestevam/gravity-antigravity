// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * Funcional — POST /exclusoes/preview com blacklist opt-out.
 * ExcluirService real + Prisma mockado via withOrganizacao.
 */

const mockPrisma = vi.hoisted(() => ({
  configuracaoPedido: { findFirst: vi.fn() },
  pedido: { findMany: vi.fn() },
  pedidoTransferencia: { groupBy: vi.fn() },
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: (_req: unknown, cb: (db: unknown) => Promise<unknown>) =>
    cb(mockPrisma),
}))

vi.mock('../../../../../servicos-global/produto/pedido/server/src/permissoes.js', () => ({
  exigirPermissao: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}))

import { exclusoesPedidoRouter, AppError } from '../../../../../servicos-global/produto/pedido/server/src/routes/exclusoes-pedido.js'

const ORG_ID = 'org-func-excluir'

function buildTestApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string } }).organizacao = {
      idOrganizacao: ORG_ID,
    }
    next()
  })
  app.use('/api/v1/pedidos/exclusoes', exclusoesPedidoRouter)
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    }
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
  })
  return app
}

function pedido(id: string, status: string) {
  return {
    id_pedido: id,
    numero_pedido: `NUM-${id}`,
    status_pedido: status,
    itens_pedido: [{ id_item: `it-${id}` }],
  }
}

let app: express.Express

beforeAll(() => {
  app = buildTestApp()
})

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedidoTransferencia.groupBy.mockResolvedValue([])
})

describe('POST /exclusoes/preview — blacklist opt-out', () => {
  it('F-EXP-01: status custom pagamento_aprovado permitido com config []', async () => {
    mockPrisma.configuracaoPedido.findFirst.mockResolvedValue({
      excluir_status_permitidos: [],
      excluir_pedido_sem_item_permitido: true,
    })
    mockPrisma.pedido.findMany.mockResolvedValue([pedido('ped-custom', 'pagamento_aprovado')])

    const res = await request(app)
      .post('/api/v1/pedidos/exclusoes/preview')
      .send({ ids: ['ped-custom'] })

    expect(res.status).toBe(200)
    expect(res.body.permitidos).toHaveLength(1)
    expect(res.body.bloqueados).toHaveLength(0)
  })

  it('F-EXP-02: status na blacklist retorna bloqueados', async () => {
    mockPrisma.configuracaoPedido.findFirst.mockResolvedValue({
      excluir_status_permitidos: ['consolidado'],
      excluir_pedido_sem_item_permitido: true,
    })
    mockPrisma.pedido.findMany.mockResolvedValue([pedido('ped-bloq', 'consolidado')])

    const res = await request(app)
      .post('/api/v1/pedidos/exclusoes/preview')
      .send({ ids: ['ped-bloq'] })

    expect(res.status).toBe(200)
    expect(res.body.permitidos).toHaveLength(0)
    expect(res.body.bloqueados).toHaveLength(1)
    expect(res.body.bloqueados[0].status).toBe('consolidado')
  })

  it('F-EXP-03: ids vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/exclusoes/preview')
      .send({ ids: [] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})
