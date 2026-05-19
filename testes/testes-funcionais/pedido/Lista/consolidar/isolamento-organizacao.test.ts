// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — Isolamento de Organização (Cross-Org) — Consolidar
 *
 * Cobre: F-ISO-01 a F-ISO-05
 * Estratégia: Verifica que TODA query do consolidarRouter inclui id_organizacao no WHERE.
 * Org-B tenta consolidar pedidos da Org-A → 404, nunca 403 (não vaza existência).
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  pedido: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
}))

let orgInjetada = 'org-A'

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: (_req: unknown, cb: (db: unknown) => Promise<unknown>) =>
    cb(mockPrisma),
}))

vi.mock('../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js', () => ({
  auditLog: vi.fn(),
}))

vi.mock('../../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js', () => ({
  recalcularAgregadosPedido: vi.fn().mockResolvedValue({}),
}))

vi.mock('../../../../../servicos-global/produto/pedido/server/src/services/statusPedidoLookup.js', () => ({
  resolverIdStatusPedidoOpcional: vi.fn().mockResolvedValue('st-consolidado-001'),
}))

// ── Import da rota real ─────────────────────────────────────────────────────

import { consolidarRouter } from '../../../../../servicos-global/produto/pedido/server/src/routes/consolidacoes-pedido.js'

// ── App de teste ─────────────────────────────────────────────────────────────

let app: express.Express

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as unknown as { organizacao: { idOrganizacao: string } }).organizacao = { idOrganizacao: orgInjetada }
    next()
  })
  app.use('/api/v1/pedidos/consolidacoes', consolidarRouter)
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const PEDIDO_ORG_A_1 = {
  id_pedido: 'ped-orgA-001',
  id_organizacao: 'org-A',
  id_workspace: 'ws-A',
  numero_pedido: 'PED-A-001',
  tipo_operacao_pedido: 'importacao',
  status_pedido: 'aberto',
  incoterm_pedido: 'FOB',
  moeda_pedido: 'USD',
  valor_total_pedido: 5000,
  detalhes_operacionais_pedido: {},
  id_importacao_exportador_pedido: null,
  id_exportacao_importador_pedido: null,
  itens_pedido: [
    {
      id_item: 'itm-A-001',
      id_pedido: 'ped-orgA-001',
      part_number_item: 'PN-001',
      descricao_item: 'Item A1',
      ncm_item: '8471.30.19',
      quantidade_atual_item: 100,
      quantidade_inicial_item: 100,
      quantidade_pronta_item: 0,
      sequencia_item_pedido: 1,
      data_criacao_item: '2026-05-01T00:00:00.000Z',
      data_atualizacao_item: '2026-05-01T00:00:00.000Z',
    },
  ],
}

const PEDIDO_ORG_A_2 = {
  ...PEDIDO_ORG_A_1,
  id_pedido: 'ped-orgA-002',
  numero_pedido: 'PED-A-002',
  valor_total_pedido: 3000,
  itens_pedido: [
    {
      id_item: 'itm-A-002',
      id_pedido: 'ped-orgA-002',
      part_number_item: 'PN-002',
      descricao_item: 'Item A2',
      ncm_item: '8471.30.20',
      quantidade_atual_item: 50,
      quantidade_inicial_item: 50,
      quantidade_pronta_item: 0,
      sequencia_item_pedido: 1,
      data_criacao_item: '2026-05-01T00:00:00.000Z',
      data_atualizacao_item: '2026-05-01T00:00:00.000Z',
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  orgInjetada = 'org-A'

  mockPrisma.pedido.findMany.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
    if (where.id_organizacao === 'org-A') return [PEDIDO_ORG_A_1, PEDIDO_ORG_A_2]
    return []
  })
  mockPrisma.pedido.findFirst.mockResolvedValue(null)
  mockPrisma.pedido.count.mockResolvedValue(10)
  mockPrisma.pedido.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    ...data,
    id_pedido: data.id_pedido ?? 'ped-novo',
    itens_pedido: (data.itens_pedido as { create: unknown[] })?.create ?? [],
  }))
  mockPrisma.pedido.updateMany.mockResolvedValue({ count: 2 })
})

// ── Testes — Isolamento cross-tenant ────────────────────────────────────────

describe('F-ISO: Isolamento de organização — Consolidar', () => {
  it('F-ISO-01: Preview — WHERE inclui id_organizacao do req.organizacao', async () => {
    await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-orgA-001', 'ped-orgA-002'] })

    const whereClause = mockPrisma.pedido.findMany.mock.calls[0]?.[0]?.where
    expect(whereClause).toBeDefined()
    expect(whereClause.id_organizacao).toBe('org-A')
  })

  it('F-ISO-02: Confirmar — WHERE inclui id_organizacao do req.organizacao', async () => {
    await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send({
        ids: ['ped-orgA-001', 'ped-orgA-002'],
        numero_pedido: 'PO-CONS-2026/001',
        campos_escolhidos: {},
        fundir_itens_mesmo_part_number: false,
      })

    const whereClause = mockPrisma.pedido.findMany.mock.calls[0]?.[0]?.where
    expect(whereClause).toBeDefined()
    expect(whereClause.id_organizacao).toBe('org-A')
  })

  it('F-ISO-03: Preview de pedidos da org-A com token da org-B → 404', async () => {
    orgInjetada = 'org-B'

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/preview')
      .send({ ids: ['ped-orgA-001', 'ped-orgA-002'] })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('F-ISO-04: Confirmar pedidos da org-A com token da org-B → 404', async () => {
    orgInjetada = 'org-B'

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send({
        ids: ['ped-orgA-001', 'ped-orgA-002'],
        numero_pedido: 'PO-CONS-2026/001',
        campos_escolhidos: {},
        fundir_itens_mesmo_part_number: false,
      })

    expect(res.status).toBe(404)
  })

  it('F-ISO-05: Soft delete do confirmar só marca pedidos da mesma org', async () => {
    await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send({
        ids: ['ped-orgA-001', 'ped-orgA-002'],
        numero_pedido: 'PO-CONS-2026/001',
        campos_escolhidos: {},
        fundir_itens_mesmo_part_number: false,
      })

    const updateCall = mockPrisma.pedido.updateMany.mock.calls[0]?.[0]
    expect(updateCall?.where?.id_organizacao).toBe('org-A')
  })
})
