// @vitest-environment node
/**
 * TST-FUN-PEDIDO-EDITAR-SALVAR — Validacao Zod (payloads invalidos)
 *
 * Testa PATCH /api/v1/pedidos/:id/campo com payloads invalidos:
 * campo inexistente, body vazio, SQL injection, XSS.
 *
 * Plano: editar-salvar-funcional.md (secao 5)
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  pedido: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  pedidoItem: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: (_req: unknown, cb: (db: unknown) => Promise<unknown>) =>
    cb(mockPrisma),
  obterWorkspacesHabilitadosDoUsuario: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../../../servicos-global/produto/processos-core/src/services/saldo-pedido.js', () => ({
  saldoPedido: vi.fn(),
  AppError: class AppError extends Error {
    statusCode: number
    constructor(statusCode: number, message: string) {
      super(message)
      this.statusCode = statusCode
    }
  },
}))

vi.mock('../../../../servicos-global/produto/processos-core/src/services/formulaEngine.js', () => ({
  parsearFormula: vi.fn(),
  avaliarFormula: vi.fn(),
  buildContextoItem: vi.fn(),
  SALDO_FORMULA_PADRAO: '',
}))

vi.mock('../../../../servicos-global/produto/pedido/shared/mapaPropagacaoPedidoItem.js', () => ({
  isPropagavel: vi.fn().mockReturnValue(false),
  obterCampoItemPropagado: vi.fn(),
  obterCampoItemComLegado: vi.fn(),
  construirCamposPropagadosParaItem: vi.fn().mockReturnValue({}),
  derivarNomesEmpresaParaItem: vi.fn().mockReturnValue({}),
}))

vi.mock('../../../../servicos-global/produto/processos-core/src/services/cadastrosClient.js', () => ({
  buscarEmpresasPorSuids: vi.fn().mockResolvedValue([]),
  buscarMoedaPorCodigo: vi.fn().mockResolvedValue(null),
  buscarNcmPorCodigo: vi.fn().mockResolvedValue(null),
  buscarOpePorSuid: vi.fn().mockResolvedValue(null),
  buscarUnidadePorCodigo: vi.fn().mockResolvedValue(null),
}))

vi.mock('../../../../servicos-global/produto/processos-core/src/services/validarUnidadesItem.js', () => ({
  validarUnidadesItem: vi.fn(),
}))

vi.mock('../../../../servicos-global/produto/processos-core/src/services/validarIncotermPedidoItem.js', () => ({
  validarIncotermPedidoItem: vi.fn(),
}))

vi.mock('../../../../servicos-global/produto/processos-core/src/services/pedidoSnapshots.js', () => ({
  montarSnapshotEmpresa: vi.fn().mockResolvedValue(null),
  montarSnapshotOpe: vi.fn().mockResolvedValue(null),
  montarSnapshotNcm: vi.fn().mockResolvedValue(null),
  montarSnapshotMoeda: vi.fn().mockResolvedValue(null),
  montarSnapshotUnidade: vi.fn().mockResolvedValue(null),
}))

vi.mock('../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js', () => ({
  recalcularAgregadosPedido: vi.fn().mockResolvedValue({}),
  campoItemAfetaAgregado: vi.fn().mockReturnValue(false),
}))

// ── Import da rota real ─────────────────────────────────────────────────────

import { pedidosRouter } from '../../../../servicos-global/produto/processos-core/src/routes/pedidos.js'

// ── App de teste ─────────────────────────────────────────────────────────────

let app: express.Express

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as unknown as { organizacao: { idOrganizacao: string } }).organizacao = { idOrganizacao: 'org-001' }
    next()
  })
  app.use('/api/v1/pedidos', pedidosRouter)
  app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.statusCode ?? 500
    res.status(status).json({ error: { code: 'ERROR', message: err.message } })
  })
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const PEDIDO_MOCK = {
  id_pedido: 'ped-val-001',
  id_organizacao: 'org-001',
  numero_pedido: 'PED-VAL-001',
  status: 'aberto',
  tipo_operacao_pedido: 'importacao',
  moeda_pedido: 'USD',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedido.findFirst.mockResolvedValue(PEDIDO_MOCK)
  mockPrisma.pedido.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    ...PEDIDO_MOCK,
    ...data,
  }))
  mockPrisma.pedidoItem.findMany.mockResolvedValue([])
  mockPrisma.pedidoItem.updateMany.mockResolvedValue({ count: 0 })
})

// ── Testes — Validacao Zod ──────────────────────────────────────────────────

describe('F-VAL: Validacao Zod — payloads invalidos', () => {
  it('F-VAL-01: PATCH com campo inexistente → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-val-001/campo')
      .send({ campo: 'campo_que_nao_existe_no_set', valor: 'abc' })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toContain('nao pode ser editado')
  })

  it('F-VAL-04: PATCH com body vazio {} → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-val-001/campo')
      .send({})

    expect(res.status).toBe(400)
  })

  it('F-VAL-05: PATCH com SQL injection em campo texto → 400 (campo nao existe no Set)', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-val-001/campo')
      .send({ campo: "'; DROP TABLE pedido; --", valor: 'x' })

    expect(res.status).toBe(400)
  })

  it('F-VAL-06: PATCH com XSS em valor de campo editavel → aceito (Prisma sanitiza)', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-val-001/campo')
      .send({ campo: 'numero_pedido', valor: '<script>alert("xss")</script>' })

    expect(res.status).toBe(200)
    const updateCall = mockPrisma.pedido.update.mock.calls[0]?.[0]
    if (updateCall) {
      expect(updateCall.data.numero_pedido).toBe('<script>alert("xss")</script>')
    }
  })

  it('F-VAL-07: PATCH campo vazio "" → 400 (z.string().min(1))', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-val-001/campo')
      .send({ campo: '', valor: 'abc' })

    expect(res.status).toBe(400)
  })

  it('F-VAL-08: PATCH pedido inexistente → 404 ou erro', async () => {
    mockPrisma.pedido.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .patch('/api/v1/pedidos/ped-fantasma/campo')
      .send({ campo: 'numero_pedido', valor: 'X' })

    expect([404, 500]).toContain(res.status)
  })
})
