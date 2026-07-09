// @vitest-environment node
/**
 * TST-FUN-PEDIDO-NOVO-DUPLICATA-000407 — Novo Pedido: número duplicado
 * GET /duplicatas-numero + POST / 409 DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import supertest from 'supertest'

const mockPrisma = vi.hoisted(() => ({
  pedido: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: (_req: unknown, cb: (db: unknown) => Promise<unknown>) =>
    cb(mockPrisma),
  obterWorkspacesHabilitadosDoUsuario: vi.fn(),
  obterWorkspaces: vi.fn(),
}))

vi.mock('../../../../../../../servicos-global/produto/processos-core/src/services/saldo-pedido.js', () => ({
  saldoPedido: vi.fn(),
  AppError: class AppError extends Error {
    statusCode: number
    constructor(statusCode: number, message: string) {
      super(message)
      this.statusCode = statusCode
    }
  },
}))

vi.mock('../../../../../../../servicos-global/produto/processos-core/src/services/formulaEngine.js', () => ({
  parsearFormula: vi.fn(),
  avaliarFormula: vi.fn(),
  buildContextoItem: vi.fn(),
  SALDO_FORMULA_PADRAO: '',
}))

vi.mock('../../../../../../../servicos-global/produto/pedido/shared/mapaPropagacaoPedidoItem.js', () => ({
  isPropagavel: vi.fn().mockReturnValue(false),
  obterCampoItemPropagado: vi.fn(),
  obterCampoItemComLegado: vi.fn(),
  construirCamposPropagadosParaItem: vi.fn().mockReturnValue({}),
  derivarNomesEmpresaParaItem: vi.fn().mockReturnValue({}),
}))

vi.mock('../../../../../../../servicos-global/produto/processos-core/src/services/cadastrosClient.js', () => ({
  buscarIdentidadesComexPorSuids: vi.fn().mockResolvedValue(new Map()),
  buscarMoedaPorCodigo: vi.fn().mockResolvedValue(null),
  buscarNcmPorCodigo: vi.fn().mockResolvedValue(null),
  buscarOpePorSuid: vi.fn().mockResolvedValue(null),
  buscarUnidadePorCodigo: vi.fn().mockResolvedValue(null),
}))

vi.mock('../../../../../../../servicos-global/produto/processos-core/src/services/validarUnidadesItem.js', () => ({
  validarUnidadesItem: vi.fn(),
}))

vi.mock('../../../../../../../servicos-global/produto/processos-core/src/services/validarIncotermPedidoItem.js', () => ({
  validarIncotermPedidoItem: vi.fn(),
}))

vi.mock('../../../../../../../servicos-global/produto/processos-core/src/services/pedidoSnapshots.js', () => ({
  montarSnapshotIdentidadeComex: vi.fn().mockReturnValue(null),
  montarSnapshotOpe: vi.fn().mockReturnValue(null),
  montarSnapshotNcm: vi.fn().mockReturnValue(null),
  montarSnapshotMoeda: vi.fn().mockReturnValue(null),
  montarSnapshotUnidade: vi.fn().mockReturnValue(null),
}))

vi.mock('../../../../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js', () => ({
  recalcularAgregadosPedido: vi.fn().mockResolvedValue({}),
  campoItemAfetaAgregado: vi.fn().mockReturnValue(false),
}))

import { pedidosRouter } from '../../../../../../../servicos-global/produto/processos-core/src/routes/pedidos.js'

let app: express.Express

const PEDIDO_EXISTENTE = {
  id_pedido: 'pedi_dup_001',
  numero_pedido: '123',
}

const payloadCriarImportacao = {
  tipo_operacao_pedido: 'importacao',
  numero_pedido: '123',
  suid_importador: 'emp-org-001',
  suid_exportador: 'forn-ext-001',
  data_emissao_pedido: '2026-07-03T00:00:00.000Z',
  itens: [],
}

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: 'org-001',
      idUsuario: 'user-001',
    }
    next()
  })
  app.use('/api/v1/pedidos', pedidosRouter)
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TST-FUN-PEDIDO-NOVO-DUPLICATA-000408', () => {
  it('GET /duplicatas-numero — retorna pedidos_existentes na organização', async () => {
    mockPrisma.pedido.findMany.mockResolvedValueOnce([PEDIDO_EXISTENTE])

    const res = await supertest(app)
      .get('/api/v1/pedidos/duplicatas-numero')
      .query({ numero_pedido: '123' })

    expect(res.status).toBe(200)
    expect(res.body.pedidos_existentes).toEqual([PEDIDO_EXISTENTE])
    expect(mockPrisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          numero_pedido: '123',
          data_exclusao_pedido: null,
        }),
      }),
    )
  })

  it('GET /duplicatas-numero — 400 sem numero_pedido', async () => {
    const res = await supertest(app).get('/api/v1/pedidos/duplicatas-numero')
    expect(res.status).toBe(400)
  })

  it('POST / — 409 DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED sem confirmar_numero_duplicado', async () => {
    mockPrisma.pedido.findMany.mockResolvedValueOnce([PEDIDO_EXISTENTE])

    const res = await supertest(app)
      .post('/api/v1/pedidos')
      .send(payloadCriarImportacao)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED')
    expect(res.body.error.pedidos_existentes).toEqual([PEDIDO_EXISTENTE])
    expect(mockPrisma.pedido.create).not.toHaveBeenCalled()
  })
})
