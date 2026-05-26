// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * Funcional — rota de transferência aceita id_pedido URL-encoded (barra no CUID legado).
 */

const mockPrisma = vi.hoisted(() => ({
  pedido: { findFirst: vi.fn(), findMany: vi.fn() },
  pedidoItem: { findMany: vi.fn() },
  pedidoTransferencia: { findMany: vi.fn() },
  statusPedido: { findFirst: vi.fn() },
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

import { transferirRouter } from '../../../../../servicos-global/produto/pedido/server/src/routes/transferencias-pedido.js'

const ID_COM_BARRA = 'pedi_id_1234567/26'

const PAYLOAD_PREVIEW = {
  cenario: 'reducao_simples',
  pedido_id: ID_COM_BARRA,
  item_id: 'itm-001',
  quantidade_origem: 10,
  destinos: [{ tipo: 'mesmo', quantidade: 10 }],
}

const PEDIDO_MOCK = {
  id_pedido: ID_COM_BARRA,
  id_organizacao: 'org-001',
  id_workspace: 'ws-001',
  numero_pedido: 'PED-LEGADO',
  tipo_operacao_pedido: 'importacao',
  incoterm_pedido: 'FOB',
  moeda_pedido: 'USD',
  itens_pedido: [
    {
      id_item: 'itm-001',
      id_organizacao: 'org-001',
      id_workspace: 'ws-001',
      id_pedido: ID_COM_BARRA,
      part_number_item: 'PN-001',
      descricao_item: 'Item A',
      ncm_item: '8471.30.19',
      unidade_comercializada_item: 'UN',
      moeda_item: 'USD',
      valor_por_unidade_item: 50,
      quantidade_atual_item: 100,
      quantidade_inicial_item: 100,
      quantidade_transferida_item: 0,
      sequencia_item_pedido: 1,
    },
  ],
}

let app: express.Express

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: 'org-001',
      idUsuario: 'usr-001',
    }
    next()
  })
  app.use('/api/v1/pedidos/:id_pedido/transferencias', transferirRouter)
})

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedido.findFirst.mockResolvedValue(PEDIDO_MOCK)
  mockPrisma.pedido.findMany.mockResolvedValue([])
  mockPrisma.pedidoTransferencia.findMany.mockResolvedValue([])
  mockPrisma.statusPedido.findFirst.mockResolvedValue({ id_pedido_status: 'st-1', nome_status_pedido: 'aberto' })
})

describe('POST /transferencias/preview — id_pedido com barra URL-encoded', () => {
  it('F-TPID-01: %2F no path resolve id_pedido com barra', async () => {
    const encoded = encodeURIComponent(ID_COM_BARRA)
    const res = await request(app)
      .post(`/api/v1/pedidos/${encoded}/transferencias/preview`)
      .send(PAYLOAD_PREVIEW)

    expect(res.status).toBe(200)
    expect(mockPrisma.pedido.findFirst).toHaveBeenCalled()
  })

  it('F-TPID-02: path sem encode quebra roteamento (404)', async () => {
    const res = await request(app)
      .post(`/api/v1/pedidos/${ID_COM_BARRA}/transferencias/preview`)
      .send(PAYLOAD_PREVIEW)

    expect(res.status).toBe(404)
  })
})
