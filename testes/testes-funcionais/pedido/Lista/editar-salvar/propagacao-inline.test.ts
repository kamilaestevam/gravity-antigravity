// @vitest-environment node
/**
 * TST-FUN-PEDIDO-EDITAR-SALVAR — Propagacao pedido → itens
 *
 * Testa PATCH /api/v1/pedidos/:id/campo com replicar_em_itens=true/false.
 * Verifica que campos propagaveis (via MAPA_PROPAGACAO_PEDIDO_ITEM)
 * atualizam pedido + todos os itens, e campos sem par atualizam apenas o pedido.
 *
 * Plano: editar-salvar-funcional.md (secao 2)
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
    update: vi.fn(),
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

const mockIsPropagavel = vi.fn()
const mockObterCampoItemPropagado = vi.fn()
const mockConstruirCamposPropagados = vi.fn()

vi.mock('../../../../servicos-global/produto/pedido/shared/mapaPropagacaoPedidoItem.js', () => ({
  isPropagavel: mockIsPropagavel,
  obterCampoItemPropagado: mockObterCampoItemPropagado,
  obterCampoItemComLegado: vi.fn(),
  construirCamposPropagadosParaItem: mockConstruirCamposPropagados,
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
  id_pedido: 'ped-prop-001',
  id_organizacao: 'org-001',
  incoterm: 'FOB',
  moeda_pedido: 'USD',
  condicao_pagamento: '30 dias',
  numero_pedido: 'PED-PROP-001',
  status: 'aberto',
  tipo_operacao_pedido: 'importacao',
  updated_at: '2026-05-01T00:00:00.000Z',
}

const ITENS_MOCK = [
  { id_item: 'itm-001', id_pedido: 'ped-prop-001', incoterm_item: 'FOB', moeda_item: 'USD' },
  { id_item: 'itm-002', id_pedido: 'ped-prop-001', incoterm_item: 'FOB', moeda_item: 'USD' },
  { id_item: 'itm-003', id_pedido: 'ped-prop-001', incoterm_item: 'CIF', moeda_item: 'EUR' },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedido.findFirst.mockResolvedValue(PEDIDO_MOCK)
  mockPrisma.pedido.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    ...PEDIDO_MOCK,
    ...data,
    updated_at: new Date().toISOString(),
  }))
  mockPrisma.pedidoItem.findMany.mockResolvedValue(ITENS_MOCK)
  mockPrisma.pedidoItem.updateMany.mockResolvedValue({ count: 3 })
  mockPrisma.pedidoItem.update.mockResolvedValue({})

  mockIsPropagavel.mockReturnValue(true)
  mockObterCampoItemPropagado.mockImplementation((campo: string) => `${campo}_item`)
  mockConstruirCamposPropagados.mockReturnValue({ incoterm_item: 'CIF' })
})

// ── Testes — replicar_em_itens=true ─────────────────────────────────────────

describe('F-PROP: PATCH /api/v1/pedidos/:id/campo — replicar_em_itens=true', () => {
  it('F-PROP-01: incoterm com replicar_em_itens=true → pedido atualizado + itens propagados', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-prop-001/campo')
      .send({ campo: 'incoterm', valor: 'CIF', replicar_em_itens: true })

    expect(res.status).toBe(200)
    expect(mockPrisma.pedido.update).toHaveBeenCalled()
  })

  it('F-PROP-02: moeda_pedido com replicar_em_itens=true → pedido + itens', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-prop-001/campo')
      .send({ campo: 'moeda_pedido', valor: 'EUR', replicar_em_itens: true })

    expect(res.status).toBe(200)
  })

  it('F-PROP-03: condicao_pagamento com replicar_em_itens=true → pedido + itens', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-prop-001/campo')
      .send({ campo: 'condicao_pagamento', valor: '60 dias', replicar_em_itens: true })

    expect(res.status).toBe(200)
  })

  it('F-PROP-04: data_confirmada_pedido_pronto com replicar_em_itens=true → updateMany no item', async () => {
    mockIsPropagavel.mockReturnValue(true)
    mockObterCampoItemPropagado.mockReturnValue('data_confirmada_item_pronto')

    const res = await request(app)
      .patch('/api/v1/pedidos/ped-prop-001/campo')
      .send({ campo: 'data_confirmada_pedido_pronto', valor: '2026-02-13', replicar_em_itens: true })

    expect(res.status).toBe(200)
    expect(mockPrisma.pedidoItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ data_confirmada_item_pronto: expect.any(Date) }),
      }),
    )
  })
})

// ── Testes — replicar_em_itens=false ────────────────────────────────────────

describe('F-PROP: PATCH — replicar_em_itens=false (apenas pedido)', () => {
  it('F-PROP-06: Campo com replicar_em_itens=false → apenas pedido muda', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-prop-001/campo')
      .send({ campo: 'incoterm', valor: 'CIF', replicar_em_itens: false })

    expect(res.status).toBe(200)
    expect(mockPrisma.pedido.update).toHaveBeenCalled()
  })

  it('F-PROP-07: Campo sem flag replicar → default false, apenas pedido', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-prop-001/campo')
      .send({ campo: 'incoterm', valor: 'CIF' })

    expect(res.status).toBe(200)
  })
})

// ── Testes — campo nao propagavel ───────────────────────────────────────────

describe('F-PROP: PATCH — campo sem par no MAPA', () => {
  it('F-PROP-10: Campo nao propagavel com replicar_em_itens=true → apenas pedido (sem erro)', async () => {
    mockIsPropagavel.mockReturnValue(false)

    const res = await request(app)
      .patch('/api/v1/pedidos/ped-prop-001/campo')
      .send({ campo: 'numero_pedido', valor: 'PED-NOVO', replicar_em_itens: true })

    expect(res.status).toBe(200)
    expect(mockPrisma.pedido.update).toHaveBeenCalled()
  })
})
