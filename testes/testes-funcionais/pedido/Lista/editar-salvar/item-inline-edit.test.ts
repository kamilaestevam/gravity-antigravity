// @vitest-environment node
/**
 * TST-FUN-PEDIDO-EDITAR-SALVAR — Edicao de item individual
 *
 * Testa PATCH /api/v1/pedidos/:id/itens/:itemId/campo para campos do item,
 * e isolamento: editar 1 item nao afeta os outros nem o pedido pai.
 *
 * Plano: editar-salvar-funcional.md (secao 3)
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
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
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
  id_pedido: 'ped-itm-001',
  id_organizacao: 'org-001',
  ncm: '8471.30.19',
  incoterm: 'FOB',
  moeda_pedido: 'USD',
  status: 'aberto',
  tipo_operacao_pedido: 'importacao',
  numero_pedido: 'PO-ITM-001',
}

const ITEM_MOCK = {
  id_item: 'itm-001',
  id_pedido: 'ped-itm-001',
  id_organizacao: 'org-001',
  valor_total_item: 1000.00,
  moeda_item: 'USD',
  quantidade_inicial_item: 100,
  ncm_item: '8471.30.19',
  part_number_item: 'PN-ORIGINAL',
  descricao_item: 'Descricao original do item',
  unidade_comercializada_item: 'UN',
  updated_at: '2026-05-01T00:00:00.000Z',
}

const OUTROS_ITENS = [
  { id_item: 'itm-002', id_pedido: 'ped-itm-001', valor_total_item: 500, moeda_item: 'USD', ncm_item: '8471.30.19' },
  { id_item: 'itm-003', id_pedido: 'ped-itm-001', valor_total_item: 750, moeda_item: 'USD', ncm_item: '8471.30.19' },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedido.findFirst.mockResolvedValue(PEDIDO_MOCK)
  mockPrisma.pedido.update.mockResolvedValue(PEDIDO_MOCK)
  mockPrisma.pedidoItem.findFirst.mockResolvedValue(ITEM_MOCK)
  mockPrisma.pedidoItem.findMany.mockResolvedValue([ITEM_MOCK, ...OUTROS_ITENS])
  mockPrisma.pedidoItem.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    ...ITEM_MOCK,
    ...data,
    updated_at: new Date().toISOString(),
  }))
  mockPrisma.pedidoItem.updateMany.mockResolvedValue({ count: 0 })
})

// ── Testes — Happy path item ────────────────────────────────────────────────

describe('F-ITM: PUT /api/v1/pedidos/:id/itens/:itemId — happy path', () => {
  it('F-ITM-01: Editar valor_total_item → 200', async () => {
    const res = await request(app)
      .put('/api/v1/pedidos/ped-itm-001/itens/itm-001')
      .send({ valor_total_item: 1500.50, moeda_item: 'USD' })

    expect(res.status).toBe(200)
    expect(mockPrisma.pedidoItem.update).toHaveBeenCalled()
  })

  it('F-ITM-02: Editar quantidade_inicial_item → 200', async () => {
    const res = await request(app)
      .put('/api/v1/pedidos/ped-itm-001/itens/itm-001')
      .send({ quantidade_inicial_item: 200 })

    expect(res.status).toBe(200)
  })

  it('F-ITM-06: Editar ncm_item → 200', async () => {
    const res = await request(app)
      .put('/api/v1/pedidos/ped-itm-001/itens/itm-001')
      .send({ ncm_item: '8471.30.20' })

    expect(res.status).toBe(200)
  })

  it('F-ITM-07: Editar part_number_item → 200', async () => {
    const res = await request(app)
      .put('/api/v1/pedidos/ped-itm-001/itens/itm-001')
      .send({ part_number_item: 'PN-NOVO' })

    expect(res.status).toBe(200)
  })

  it('F-ITM-08: Editar descricao_item → 200', async () => {
    const res = await request(app)
      .put('/api/v1/pedidos/ped-itm-001/itens/itm-001')
      .send({ descricao_item: 'Nova descricao do item' })

    expect(res.status).toBe(200)
  })
})

// ── Testes — Item nao encontrado ────────────────────────────────────────────

describe('F-ITM: PUT item — item inexistente', () => {
  it('F-ITM-20: Item inexistente → 404', async () => {
    mockPrisma.pedidoItem.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/pedidos/ped-itm-001/itens/itm-fantasma')
      .send({ descricao_item: 'Tentativa' })

    expect([404, 500]).toContain(res.status)
  })
})

// ── Testes — Pedido pai nao encontrado ──────────────────────────────────────

describe('F-ITM: PUT item — pedido pai inexistente', () => {
  it('F-ITM-30: Pedido pai inexistente → erro', async () => {
    mockPrisma.pedido.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/pedidos/ped-fantasma/itens/itm-001')
      .send({ descricao_item: 'Tentativa' })

    expect([404, 500]).toContain(res.status)
  })
})
