// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — POST /:id_pedido/transferencias/:id_transferencia_pedido/reverter
 *
 * Cobre: F-TRV-01 a F-TRV-30
 * Estratégia: Supertest + Zod real + error handler do router + Prisma mockado via withOrganizacao
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  pedido: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  pedidoItem: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  pedidoTransferencia: {
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
}))

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

import { transferirRouter } from '../../../../../servicos-global/produto/pedido/server/src/routes/transferencias-pedido.js'

// ── App de teste ─────────────────────────────────────────────────────────────

let app: express.Express

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: 'org-001',
      idUsuario: 'usr-001',
    }
    ;(req as unknown as { auth: { nome_usuario: string } }).auth = { nome_usuario: 'Test User' }
    next()
  })
  app.use('/api/v1/pedidos/:id_pedido/transferencias', transferirRouter)
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const HISTORICO_TRANSFER = {
  id_pedido_transferencia: 'transf-001',
  id_organizacao: 'org-001',
  id_pedido_origem: 'ped-001',
  id_item_origem: 'itm-001',
  cenario_pedido_transferencia: 'split_novo_pedido',
  quantidade_pedido_transferencia: 30,
  destinos_pedido_transferencia: JSON.stringify([
    { tipo: 'novo', pedido_id: 'ped-novo-001', quantidade: 30 },
  ]),
  revertido_pedido_transferencia: false,
  criado_por_pedido_transferencia: 'usr-001',
}

const ITEM_ORIGEM = {
  id_item: 'itm-001',
  id_organizacao: 'org-001',
  id_pedido: 'ped-001',
  part_number_item: 'PN-001',
  quantidade_atual_item: 70,
  quantidade_inicial_item: 100,
  quantidade_transferida_item: 30,
  sequencia_item_pedido: 1,
}

const PEDIDO_DESTINO = {
  id_pedido: 'ped-novo-001',
  id_organizacao: 'org-001',
  itens_pedido: [
    {
      id_item: 'itm-dest-001',
      id_organizacao: 'org-001',
      part_number_item: 'PN-001',
      quantidade_atual_item: 30,
      quantidade_inicial_item: 30,
      quantidade_transferida_item: 0,
      sequencia_item_pedido: 1,
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedidoTransferencia.findFirst.mockResolvedValue(HISTORICO_TRANSFER)
  mockPrisma.pedidoTransferencia.update.mockResolvedValue({})
  mockPrisma.pedidoItem.findFirst.mockResolvedValue(ITEM_ORIGEM)
  mockPrisma.pedidoItem.update.mockResolvedValue({})
  mockPrisma.pedidoItem.delete.mockResolvedValue({})
  mockPrisma.pedidoItem.findMany.mockResolvedValue([])
  mockPrisma.pedido.findFirst.mockResolvedValue(PEDIDO_DESTINO)
  mockPrisma.pedido.update.mockResolvedValue({})
})

// ── Happy Path ────────────────────────────────────────────────────────────────

describe('POST /transferencias/:id/reverter — Happy Path', () => {
  it('F-TRV-01: Reverter transferência válida → 200, quantidade restaurada', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/transf-001/reverter')

    expect(res.status).toBe(200)
    expect(res.body.pedido_origem_id).toBe('ped-001')

    const itemUpdate = mockPrisma.pedidoItem.update.mock.calls.find(
      (c: unknown[]) => {
        const arg = c[0] as { where: { id_item: string } }
        return arg.where.id_item === 'itm-001'
      },
    )
    expect(itemUpdate).toBeDefined()
    const data = (itemUpdate![0] as { data: { quantidade_atual_item: number } }).data
    expect(data.quantidade_atual_item).toBe(100)
  })
})

// ── Erros de Negócio ──────────────────────────────────────────────────────────

describe('POST /transferencias/:id/reverter — Erros de Negócio', () => {
  it('F-TRV-02: Reverter já revertida → 409 CONFLICT', async () => {
    mockPrisma.pedidoTransferencia.findFirst.mockResolvedValue({
      ...HISTORICO_TRANSFER,
      revertido_pedido_transferencia: true,
    })

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/transf-001/reverter')

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })

  it('F-TRV-03: Reverter cenário irreversível (reducao_simples) → 422 NOT_REVERSIBLE', async () => {
    mockPrisma.pedidoTransferencia.findFirst.mockResolvedValue({
      ...HISTORICO_TRANSFER,
      cenario_pedido_transferencia: 'reducao_simples',
    })

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/transf-001/reverter')

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('NOT_REVERSIBLE')
  })

  it('F-TRV-04: Reverter cenário irreversível (transfer_intercompany) → 422 NOT_REVERSIBLE', async () => {
    mockPrisma.pedidoTransferencia.findFirst.mockResolvedValue({
      ...HISTORICO_TRANSFER,
      cenario_pedido_transferencia: 'transfer_intercompany',
    })

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/transf-001/reverter')

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('NOT_REVERSIBLE')
  })

  it('F-TRV-05: Transferência não encontrada → 404 NOT_FOUND', async () => {
    mockPrisma.pedidoTransferencia.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/transf-inexistente/reverter')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})

// ── Validação ─────────────────────────────────────────────────────────────────

describe('POST /transferencias/:id/reverter — Validação', () => {
  it('F-TRV-06: id_transferencia_pedido com espaços → 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/%20/reverter')

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

// ── Erro Interno ──────────────────────────────────────────────────────────────

describe('POST /transferencias/:id/reverter — Erro Interno', () => {
  it('F-TRV-30: Erro interno do banco retorna 500', async () => {
    mockPrisma.pedidoTransferencia.findFirst.mockRejectedValue(new Error('Connection refused'))

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/transf-001/reverter')

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
  })
})
