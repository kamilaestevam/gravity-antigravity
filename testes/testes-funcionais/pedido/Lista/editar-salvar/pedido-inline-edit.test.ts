// @vitest-environment node
/**
 * TST-FUN-PEDIDO-EDITAR-SALVAR — Edicao inline do pedido pai
 *
 * Testa PATCH /api/v1/pedidos/:id/campo para campos alfanumericos, datas,
 * condicionais e rejeicao de campos calculados/saldo/somente_leitura.
 *
 * Plano: editar-salvar-funcional.md (secao 1)
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
  id_pedido: 'ped-001',
  id_organizacao: 'org-001',
  numero_pedido: 'PED-ORIGINAL',
  tipo_operacao_pedido: 'importacao',
  nome_fabricante: 'Fabricante Original',
  referencia_importador: 'REF-IMP-ORIGINAL',
  ncm: '8471.30.19',
  incoterm: 'FOB',
  condicao_pagamento: '30 dias',
  status: 'aberto',
  moeda_pedido: 'USD',
  data_emissao_pedido: '2026-05-01T00:00:00.000Z',
  updated_at: '2026-05-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedido.findFirst.mockResolvedValue(PEDIDO_MOCK)
  mockPrisma.pedido.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    ...PEDIDO_MOCK,
    ...data,
    updated_at: new Date().toISOString(),
  }))
  mockPrisma.pedidoItem.findMany.mockResolvedValue([])
  mockPrisma.pedidoItem.updateMany.mockResolvedValue({ count: 0 })
})

// ── Testes — Campos alfanumericos ────────────────────────────────────────────

describe('F-PED: PATCH /api/v1/pedidos/:id/campo — campos alfanumericos', () => {
  it('F-PED-01: Editar numero_pedido → 200, valor atualizado', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: 'numero_pedido', valor: 'PED-NOVO' })

    expect(res.status).toBe(200)
    expect(mockPrisma.pedido.update).toHaveBeenCalled()
  })

  it('F-PED-02: Editar nome_fabricante → 200', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: 'nome_fabricante', valor: 'Novo Fabricante' })

    expect(res.status).toBe(200)
  })

  it('F-PED-03: Editar incoterm → 200', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: 'incoterm', valor: 'CIF' })

    expect(res.status).toBe(200)
  })

  it('F-PED-04: Editar condicao_pagamento → 200', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: 'condicao_pagamento', valor: '60 dias' })

    expect(res.status).toBe(200)
  })

  it('F-PED-05: Editar referencia_importador → 200', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: 'referencia_importador', valor: 'REF-NOVA' })

    expect(res.status).toBe(200)
  })

  it('F-PED-08: Editar data_emissao_pedido → 200, formato ISO', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: 'data_emissao_pedido', valor: '2026-06-15T00:00:00.000Z' })

    expect(res.status).toBe(200)
  })
})

// ── Testes — Campos de data ──────────────────────────────────────────────────

describe('F-PED: PATCH — campos de data', () => {
  it('F-PED-15: data_prevista_pedido_pronto aceita ISO 8601 → 200', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: 'data_prevista_pedido_pronto', valor: '2026-07-01T00:00:00.000Z' })

    expect(res.status).toBe(200)
  })

  it('F-PED-16: data null → preenchida apos PATCH', async () => {
    mockPrisma.pedido.findFirst.mockResolvedValue({
      ...PEDIDO_MOCK,
      data_prevista_pedido_pronto: null,
    })

    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: 'data_prevista_pedido_pronto', valor: '2026-07-01' })

    expect(res.status).toBe(200)
  })
})

// ── Testes — Campos calculados/saldo rejeitados ─────────────────────────────

describe('F-PED: PATCH — campos calculados/saldo rejeitados', () => {
  it('F-PED-30: saldo_itens_do_pedido (nao editavel) → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: 'saldo_itens_do_pedido', valor: 999 })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toContain('nao pode ser editado')
  })

  it('F-PED-31: campo inventado → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: 'campo_que_nao_existe', valor: 'abc' })

    expect(res.status).toBe(400)
  })
})

// ── Testes — Validacao Zod do schema ────────────────────────────────────────

describe('F-PED: PATCH — Validacao Zod', () => {
  it('F-PED-40: body sem campo → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ valor: 'abc' })

    expect(res.status).toBe(400)
  })

  it('F-PED-41: campo vazio "" → 400 (z.string().min(1))', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({ campo: '', valor: 'abc' })

    expect(res.status).toBe(400)
  })

  it('F-PED-42: body vazio {} → 400', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-001/campo')
      .send({})

    expect(res.status).toBe(400)
  })

  it('F-PED-43: pedido inexistente → 404 ou erro', async () => {
    mockPrisma.pedido.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .patch('/api/v1/pedidos/ped-fantasma/campo')
      .send({ campo: 'numero_pedido', valor: 'X' })

    expect([404, 500]).toContain(res.status)
  })
})
