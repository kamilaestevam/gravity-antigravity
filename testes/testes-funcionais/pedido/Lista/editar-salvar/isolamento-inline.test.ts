// @vitest-environment node
/**
 * TST-FUN-PEDIDO-EDITAR-SALVAR — Isolamento de organizacao
 *
 * Testa que PATCH em pedido de outra organizacao retorna 404 ou erro,
 * nunca 403. Nenhum dado da org B eh retornado ou modificado.
 * O filtro id_organizacao do withOrganizacao garante isolamento.
 *
 * Plano: editar-salvar-funcional.md (secao 6)
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
    // Org A faz a requisicao
    (req as unknown as { organizacao: { idOrganizacao: string } }).organizacao = { idOrganizacao: 'org-A' }
    next()
  })
  app.use('/api/v1/pedidos', pedidosRouter)
  app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.statusCode ?? 500
    res.status(status).json({ error: { code: 'ERROR', message: err.message } })
  })
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const PEDIDO_ORG_A = {
  id_pedido: 'ped-iso-001',
  id_organizacao: 'org-A',
  numero_pedido: 'PED-ORG-A',
  status: 'aberto',
  tipo_operacao_pedido: 'importacao',
  moeda_pedido: 'USD',
}

beforeEach(() => {
  vi.clearAllMocks()
  // findFirst filtra por id_organizacao — pedido de org-B retorna null para org-A
  mockPrisma.pedido.findFirst.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
    if (where.id_pedido === 'ped-iso-001' && where.id_organizacao === 'org-A') return PEDIDO_ORG_A
    return null
  })
  mockPrisma.pedido.update.mockResolvedValue(PEDIDO_ORG_A)
  mockPrisma.pedidoItem.findMany.mockResolvedValue([])
  mockPrisma.pedidoItem.updateMany.mockResolvedValue({ count: 0 })
})

// ── Testes — Isolamento cross-tenant ────────────────────────────────────────

describe('F-ISO: Isolamento de organizacao — cross-tenant', () => {
  it('F-ISO-01: PATCH pedido da propria org → 200', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-iso-001/campo')
      .send({ campo: 'numero_pedido', valor: 'PED-ORG-A-NOVO' })

    expect(res.status).toBe(200)
  })

  it('F-ISO-02: PATCH pedido de outra org → 404 ou erro (findFirst retorna null)', async () => {
    const res = await request(app)
      .patch('/api/v1/pedidos/ped-org-B-001/campo')
      .send({ campo: 'numero_pedido', valor: 'TENTATIVA' })

    expect([404, 500]).toContain(res.status)
  })

  it('F-ISO-03: Nenhum update chamado ao tentar editar pedido de outra org', async () => {
    await request(app)
      .patch('/api/v1/pedidos/ped-org-B-001/campo')
      .send({ campo: 'numero_pedido', valor: 'TENTATIVA' })

    expect(mockPrisma.pedido.update).not.toHaveBeenCalled()
  })

  it('F-ISO-04: findFirst SEMPRE recebe id_organizacao no where', async () => {
    await request(app)
      .patch('/api/v1/pedidos/ped-iso-001/campo')
      .send({ campo: 'numero_pedido', valor: 'X' })

    const whereClause = mockPrisma.pedido.findFirst.mock.calls[0]?.[0]?.where
    expect(whereClause).toBeDefined()
    expect(whereClause.id_organizacao).toBe('org-A')
  })
})
