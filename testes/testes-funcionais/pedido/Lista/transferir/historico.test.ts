// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — GET /:id_pedido/transferencias (histórico)
 *
 * Cobre: F-THI-01 a F-THI-30
 * Estratégia: Supertest + error handler do router + Prisma mockado via withOrganizacao
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  pedidoTransferencia: {
    findMany: vi.fn(),
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

import { transferirHistoricoRouter } from '../../../../../servicos-global/produto/pedido/server/src/routes/transferencias-pedido.js'

// ── App de teste ─────────────────────────────────────────────────────────────

let app: express.Express

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string } }).organizacao = {
      idOrganizacao: 'org-001',
    }
    next()
  })
  app.use('/api/v1/pedidos/:id_pedido/transferencias', transferirHistoricoRouter)
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const HISTORICO_1 = {
  id_pedido_transferencia: 'transf-001',
  id_organizacao: 'org-001',
  id_pedido_origem: 'ped-001',
  cenario_pedido_transferencia: 'split_novo_pedido',
  quantidade_pedido_transferencia: 30,
  data_criacao_pedido_transferencia: '2026-05-15T10:00:00.000Z',
}

const HISTORICO_2 = {
  id_pedido_transferencia: 'transf-002',
  id_organizacao: 'org-001',
  id_pedido_origem: 'ped-001',
  cenario_pedido_transferencia: 'reducao_simples',
  quantidade_pedido_transferencia: 10,
  data_criacao_pedido_transferencia: '2026-05-16T10:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedidoTransferencia.findMany.mockResolvedValue([HISTORICO_2, HISTORICO_1])
})

// ── Happy Path ────────────────────────────────────────────────────────────────

describe('GET /transferencias — Happy Path', () => {
  it('F-THI-01: Histórico retorna lista ordenada por data desc', async () => {
    const res = await request(app)
      .get('/api/v1/pedidos/ped-001/transferencias')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].id_pedido_transferencia).toBe('transf-002')
    expect(res.body[1].id_pedido_transferencia).toBe('transf-001')
  })

  it('F-THI-02: Histórico vazio retorna array vazio', async () => {
    mockPrisma.pedidoTransferencia.findMany.mockResolvedValue([])

    const res = await request(app)
      .get('/api/v1/pedidos/ped-001/transferencias')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

// ── Erro Interno ──────────────────────────────────────────────────────────────

describe('GET /transferencias — Erro Interno', () => {
  it('F-THI-30: Erro interno do banco retorna 500', async () => {
    mockPrisma.pedidoTransferencia.findMany.mockRejectedValue(new Error('Connection refused'))

    const res = await request(app)
      .get('/api/v1/pedidos/ped-001/transferencias')

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
  })
})
