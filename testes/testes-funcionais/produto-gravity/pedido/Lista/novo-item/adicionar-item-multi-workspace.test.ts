// @vitest-environment node
/**
 * POST /api/v1/pedidos/:id/itens — escopo multi-workspace (hotfix pós PR #219)
 *
 * Cenário produção: header x-id-workspace = ws-1, pedido AAA em ws-7.
 * Deve criar item no workspace do pedido, não 404.
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

const WS_ATIVO_HEADER = 'ws-gravity-1'
const WS_PEDIDO_AAA = 'ws-gravity-7'
const ID_PEDIDO_AAA = 'pedi_6462221-26'

const mockPrisma = vi.hoisted(() => ({
  pedido: {
    findFirst: vi.fn(),
  },
  pedidoItem: {
    count: vi.fn(),
    create: vi.fn(),
  },
}))

const mockObterWorkspaces = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    workspacesHabilitados: ['ws-gravity-1', 'ws-gravity-7'],
  }),
)

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: (_req: unknown, cb: (db: unknown) => Promise<unknown>) =>
    cb(mockPrisma),
  obterWorkspacesHabilitadosDoUsuario: mockObterWorkspaces,
  obterWorkspaces: vi.fn(),
}))

vi.mock('../../../../../servicos-global/produto/processos-core/src/services/saldo-pedido.js', () => ({
  saldoPedido: vi.fn(),
  AppError: class AppError extends Error {
    statusCode: number
    constructor(statusCode: number, message: string) {
      super(message)
      this.statusCode = statusCode
    }
  },
}))

vi.mock('../../../../../servicos-global/produto/processos-core/src/services/formulaEngine.js', () => ({
  parsearFormula: vi.fn(),
  avaliarFormula: vi.fn(),
  buildContextoItem: vi.fn(),
  SALDO_FORMULA_PADRAO: '',
}))

vi.mock('../../../../../servicos-global/produto/pedido/shared/mapaPropagacaoPedidoItem.js', () => ({
  isPropagavel: vi.fn().mockReturnValue(false),
  obterCampoItemPropagado: vi.fn(),
  obterCampoItemComLegado: vi.fn(),
  construirCamposPropagadosParaItem: vi.fn().mockReturnValue({}),
  derivarNomesEmpresaParaItem: vi.fn().mockReturnValue({}),
}))

vi.mock('../../../../../servicos-global/produto/processos-core/src/services/cadastrosClient.js', () => ({
  buscarEmpresasPorSuids: vi.fn().mockResolvedValue([]),
  buscarMoedaPorCodigo: vi.fn().mockResolvedValue(null),
  buscarNcmPorCodigo: vi.fn().mockResolvedValue(null),
  buscarOpePorSuid: vi.fn().mockResolvedValue(null),
  buscarUnidadePorCodigo: vi.fn().mockResolvedValue(null),
}))

vi.mock('../../../../../servicos-global/produto/processos-core/src/services/validarUnidadesItem.js', () => ({
  validarUnidadesItem: vi.fn(),
}))

vi.mock('../../../../../servicos-global/produto/processos-core/src/services/validarIncotermPedidoItem.js', () => ({
  validarIncotermPedidoItem: vi.fn(),
}))

vi.mock('../../../../../servicos-global/produto/processos-core/src/services/pedidoSnapshots.js', () => ({
  montarSnapshotEmpresa: vi.fn().mockResolvedValue(null),
  montarSnapshotOpe: vi.fn().mockResolvedValue(null),
  montarSnapshotNcm: vi.fn().mockResolvedValue(null),
  montarSnapshotMoeda: vi.fn().mockResolvedValue(null),
  montarSnapshotUnidade: vi.fn().mockResolvedValue(null),
}))

vi.mock('../../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js', () => ({
  recalcularAgregadosPedido: vi.fn().mockResolvedValue({}),
  campoItemAfetaAgregado: vi.fn().mockReturnValue(false),
}))

import { pedidosRouter } from '../../../../../../servicos-global/produto/processos-core/src/routes/pedidos.js'

let app: express.Express

const PEDIDO_WS7 = {
  id_pedido: ID_PEDIDO_AAA,
  id_organizacao: 'org-001',
  id_workspace: WS_PEDIDO_AAA,
  status_pedido: 'rascunho',
  moeda_pedido: 'USD',
  casas_decimais_quantidade_pedido: 0,
  casas_decimais_valor_pedido: 2,
  data_exclusao_pedido: null,
  snapshots_empresa_pedido: [],
}

beforeAll(() => {
  process.env.CONFIGURATOR_URL = process.env.CONFIGURATOR_URL ?? 'http://config.test'
  process.env.CHAVE_INTERNA_SERVICO = process.env.CHAVE_INTERNA_SERVICO ?? 'test-chave-interna'

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
  app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { message: err.message } })
  })
})

beforeEach(() => {
  vi.clearAllMocks()
  mockObterWorkspaces.mockResolvedValue({
    workspacesHabilitados: [WS_ATIVO_HEADER, WS_PEDIDO_AAA],
  })
  mockPrisma.pedido.findFirst.mockResolvedValue(PEDIDO_WS7)
  mockPrisma.pedidoItem.count.mockResolvedValue(1)
  mockPrisma.pedidoItem.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
    Promise.resolve({
      ...data,
      id_item: 'pite-novo-001',
    }),
  )
})

describe('POST /pedidos/:id/itens — multi-workspace', () => {
  it('F-NI-01: header ws-1 + pedido em ws-7 → 201 e item no workspace do pedido', async () => {
    const res = await request(app)
      .post(`/api/v1/pedidos/${ID_PEDIDO_AAA}/itens`)
      .set('x-id-workspace', WS_ATIVO_HEADER)
      .send({ part_number_item: 'aaaa', ncm_item: '0000.00.00' })

    expect(res.status).toBe(201)
    expect(mockPrisma.pedido.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id_pedido: ID_PEDIDO_AAA,
          id_organizacao: 'org-001',
        }),
      }),
    )
    expect(mockPrisma.pedidoItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id_workspace: WS_PEDIDO_AAA,
          id_pedido: ID_PEDIDO_AAA,
        }),
      }),
    )
  })

  it('F-NI-02: pedido inexistente → 404', async () => {
    mockPrisma.pedido.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .post(`/api/v1/pedidos/pedi-inexistente/itens`)
      .set('x-id-workspace', WS_ATIVO_HEADER)
      .send({ part_number_item: 'x' })

    expect(res.status).toBe(404)
    expect(res.body.error.message).toMatch(/Pedido nao encontrado/i)
  })

  it('F-NI-03: workspace do pedido não autorizado → 403', async () => {
    mockObterWorkspaces.mockResolvedValue({
      workspacesHabilitados: [WS_ATIVO_HEADER],
    })

    const res = await request(app)
      .post(`/api/v1/pedidos/${ID_PEDIDO_AAA}/itens`)
      .set('x-id-workspace', WS_ATIVO_HEADER)
      .send({ part_number_item: 'aaaa' })

    expect(res.status).toBe(403)
  })
})
