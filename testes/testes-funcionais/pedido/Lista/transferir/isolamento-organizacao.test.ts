// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — Isolamento de Organização (Cross-Org) — Transferir
 *
 * Cobre: F-TISO-01 a F-TISO-06
 * Estratégia: Verifica que TODA query do transferirRouter inclui id_organizacao no WHERE.
 * Org-B tenta transferir pedidos da Org-A → 404, nunca 403 (não vaza existência).
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  pedido: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  pedidoItem: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  pedidoTransferencia: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  statusPedido: {
    findFirst: vi.fn(),
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

// ── Import da rota real ─────────────────────────────────────────────────────

import { transferirRouter, transferirHistoricoRouter } from '../../../../../servicos-global/produto/pedido/server/src/routes/transferencias-pedido.js'

// ── App de teste ─────────────────────────────────────────────────────────────

let app: express.Express

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: orgInjetada,
      idUsuario: 'usr-001',
    }
    ;(req as unknown as { auth: { nome_usuario: string } }).auth = { nome_usuario: 'Test User' }
    next()
  })
  app.use('/api/v1/pedidos/:id_pedido/transferencias', transferirRouter)
  app.use('/api/v1/pedidos/:id_pedido/transferencias', transferirHistoricoRouter)
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const PEDIDO_ORG_A = {
  id_pedido: 'ped-orgA-001',
  id_organizacao: 'org-A',
  id_workspace: 'ws-A',
  numero_pedido: 'PED-A-001',
  tipo_operacao_pedido: 'importacao',
  moeda_pedido: 'USD',
  itens_pedido: [
    {
      id_item: 'itm-orgA-001',
      id_organizacao: 'org-A',
      id_workspace: 'ws-A',
      id_pedido: 'ped-orgA-001',
      part_number_item: 'PN-001',
      descricao_item: 'Item A',
      ncm_item: '8471.30.19',
      quantidade_atual_item: 100,
      quantidade_inicial_item: 100,
      quantidade_transferida_item: 0,
      sequencia_item_pedido: 1,
    },
  ],
}

const PAYLOAD_PREVIEW = {
  cenario: 'split_novo_pedido',
  pedido_id: 'ped-orgA-001',
  item_id: 'itm-orgA-001',
  quantidade_origem: 30,
  destinos: [{ tipo: 'novo', quantidade: 30 }],
}

const PAYLOAD_CONFIRMAR = {
  ...PAYLOAD_PREVIEW,
  numero_pedido_novo: 'PO-TRANS-001',
}

beforeEach(() => {
  vi.clearAllMocks()
  orgInjetada = 'org-A'

  mockPrisma.pedido.findFirst.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
    if (where.id_organizacao === 'org-A' && where.id_pedido === 'ped-orgA-001') return PEDIDO_ORG_A
    if (where.numero_pedido) return null
    return null
  })
  mockPrisma.pedido.findMany.mockResolvedValue([])
  mockPrisma.pedido.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    id_pedido: data.id_pedido ?? 'ped-novo',
    ...data,
  }))
  mockPrisma.pedido.update.mockResolvedValue({})
  mockPrisma.pedidoItem.create.mockResolvedValue({ id_item: 'itm-novo' })
  mockPrisma.pedidoItem.update.mockResolvedValue({})
  mockPrisma.pedidoItem.findMany.mockResolvedValue([
    { ...PEDIDO_ORG_A.itens_pedido[0], quantidade_atual_item: 70 },
  ])
  mockPrisma.pedidoTransferencia.create.mockResolvedValue({})
  mockPrisma.pedidoTransferencia.findFirst.mockResolvedValue(null)
  mockPrisma.pedidoTransferencia.findMany.mockResolvedValue([])
  mockPrisma.statusPedido.findFirst.mockResolvedValue({ id_pedido_status: 'st-aberto-001' })
})

// ── Testes — Isolamento cross-tenant ────────────────────────────────────────

describe('F-TISO: Isolamento de organização — Transferir', () => {
  it('F-TISO-01: Preview — WHERE inclui id_organizacao do req.organizacao', async () => {
    await request(app)
      .post('/api/v1/pedidos/ped-orgA-001/transferencias/preview')
      .send(PAYLOAD_PREVIEW)

    const whereClause = mockPrisma.pedido.findFirst.mock.calls[0]?.[0]?.where
    expect(whereClause).toBeDefined()
    expect(whereClause.id_organizacao).toBe('org-A')
  })

  it('F-TISO-02: Confirmar — WHERE inclui id_organizacao do req.organizacao', async () => {
    await request(app)
      .post('/api/v1/pedidos/ped-orgA-001/transferencias/confirmar')
      .send(PAYLOAD_CONFIRMAR)

    const whereClause = mockPrisma.pedido.findFirst.mock.calls[0]?.[0]?.where
    expect(whereClause).toBeDefined()
    expect(whereClause.id_organizacao).toBe('org-A')
  })

  it('F-TISO-03: Reverter — WHERE inclui id_organizacao do req.organizacao', async () => {
    mockPrisma.pedidoTransferencia.findFirst.mockResolvedValue({
      id_pedido_transferencia: 'transf-001',
      id_organizacao: 'org-A',
      id_pedido_origem: 'ped-orgA-001',
      id_item_origem: 'itm-orgA-001',
      cenario_pedido_transferencia: 'split_novo_pedido',
      quantidade_pedido_transferencia: 30,
      destinos_pedido_transferencia: JSON.stringify([{ tipo: 'novo', pedido_id: 'ped-novo', quantidade: 30 }]),
      revertido_pedido_transferencia: false,
    })
    mockPrisma.pedidoItem.findFirst.mockResolvedValue({
      ...PEDIDO_ORG_A.itens_pedido[0],
      quantidade_atual_item: 70,
      quantidade_transferida_item: 30,
    })

    await request(app)
      .post('/api/v1/pedidos/ped-orgA-001/transferencias/transf-001/reverter')

    const whereClause = mockPrisma.pedidoTransferencia.findFirst.mock.calls[0]?.[0]?.where
    expect(whereClause).toBeDefined()
    expect(whereClause.id_organizacao).toBe('org-A')
  })

  it('F-TISO-04: Histórico — WHERE inclui id_organizacao do req.organizacao', async () => {
    await request(app)
      .get('/api/v1/pedidos/ped-orgA-001/transferencias')

    const whereClause = mockPrisma.pedidoTransferencia.findMany.mock.calls[0]?.[0]?.where
    expect(whereClause).toBeDefined()
    expect(whereClause.id_organizacao).toBe('org-A')
  })

  it('F-TISO-05: Preview de pedido da org-A com token da org-B → 404', async () => {
    orgInjetada = 'org-B'

    const res = await request(app)
      .post('/api/v1/pedidos/ped-orgA-001/transferencias/preview')
      .send(PAYLOAD_PREVIEW)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('F-TISO-06: Confirmar de pedido da org-A com token da org-B → 404', async () => {
    orgInjetada = 'org-B'

    const res = await request(app)
      .post('/api/v1/pedidos/ped-orgA-001/transferencias/confirmar')
      .send(PAYLOAD_CONFIRMAR)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})
