// @vitest-environment node
/**
 * POST /api/v1/pedidos/importacoes-smart-read/criar — conversão Smart Docs → Pedido
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

const ID_ORG = 'org-test-1'
const ID_WS = 'ws-gravity-1'
const ID_LEITURA = 'leitura-abc123'

const mockPrisma = vi.hoisted(() => ({
  statusPedido: {
    findFirst: vi.fn().mockResolvedValue({ id_pedido_status: 'status-rascunho' }),
  },
  pedido: {
    create: vi.fn(),
  },
}))

const mockObterLeitura = vi.hoisted(() => vi.fn())
const mockObterSnapshot = vi.hoisted(() => vi.fn().mockResolvedValue('snap-001'))
const mockBuscarSnapshots = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    snapshotsNcm: [{ codigo_ncm: '84713012', descricao_ncm: 'Notebook' }],
    snapshotsMoeda: [{ codigo_moeda: 'USD', nome_moeda: 'Dolar' }],
    snapshotsUnidade: [],
  }),
)
const mockRecalcular = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockAuditLog = vi.hoisted(() => vi.fn())

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: (_req: unknown, cb: (db: unknown) => Promise<unknown>) => cb(mockPrisma),
}))

vi.mock('../../../../servicos-global/produto/pedido/server/src/lib/cliente-leitura-smart-read-pedido.js', () => ({
  obterLeituraSmartReadS2s: mockObterLeitura,
  obterIdSnapshotSmartReadS2s: mockObterSnapshot,
}))

vi.mock('../../../../servicos-global/produto/pedido/server/src/lib/buscar-snapshots-cadastros-iniciais-pedido.js', () => ({
  buscarSnapshotsCadastrosIniciaisPedido: mockBuscarSnapshots,
}))

vi.mock('../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js', () => ({
  recalcularAgregadosPedido: mockRecalcular,
}))

vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js', () => ({
  auditLog: mockAuditLog,
}))

vi.mock('../../../../servicos-global/produto/pedido/server/src/permissoes.js', () => ({
  exigirPermissao: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}))

import { importacoesSmartReadPedidoRouter } from '../../../../servicos-global/produto/pedido/server/src/routes/importacoes-smart-read-pedido.js'

const LEITURA_COMPLETA = {
  status_leitura: 'COMPLETED',
  id_leitura: ID_LEITURA,
  arquivos: [
    {
      resultado_extracao: [
        {
          tipo_documento: 'INVOICE',
          dados: {
            document: { documentNumber: 'PO-9001', incoterm: 'FOB' },
            currency: { type: 'USD' },
            items: [{ partNumber: 'PN-001', quantity: 5, ncm: '84713012', unitPrice: 100 }],
          },
        },
      ],
    },
  ],
}

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req, _res, next) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string } }).organizacao = {
      idOrganizacao: ID_ORG,
    }
    next()
  })
  app.use('/api/v1/pedidos/importacoes-smart-read', importacoesSmartReadPedidoRouter)
  app.use((err: { statusCode?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { message: err.message ?? 'Erro' } })
  })
  return app
}

describe('POST /importacoes-smart-read/criar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockObterLeitura.mockResolvedValue(LEITURA_COMPLETA)
    mockPrisma.pedido.create.mockResolvedValue({
      id_pedido: 'pedi_id_0000001-26',
      numero_pedido: 'PO-9001',
    })
  })

  it('cria pedido com snapshots quando leitura concluida', async () => {
    const app = criarApp()
    const res = await request(app)
      .post('/api/v1/pedidos/importacoes-smart-read/criar')
      .set('x-id-workspace', ID_WS)
      .set('x-id-usuario', 'usr-1')
      .set('x-nome-usuario', 'Teste')
      .send({ id_leitura: ID_LEITURA })

    expect(res.status).toBe(201)
    expect(res.body.numero_pedido).toBe('PO-9001')
    expect(res.body.id_leitura).toBe(ID_LEITURA)
    expect(res.body.ids_itens).toHaveLength(1)
    expect(mockBuscarSnapshots).toHaveBeenCalledOnce()
    expect(mockPrisma.pedido.create).toHaveBeenCalledOnce()
    const createData = mockPrisma.pedido.create.mock.calls[0]?.[0]?.data
    expect(createData.codigo_moeda_pedido).toBeUndefined()
    expect(createData.moeda_pedido).toBe('USD')
    expect(createData.data_emissao_pedido).toBeDefined()
    expect(createData.casas_decimais_valor_pedido).toBe(2)
    expect(createData.valor_total_pedido).toBeUndefined()
    expect(createData.itens_pedido.create[0].ncm_item).toBe('84713012')
    expect(createData.itens_pedido.create[0].descricao_item).toBe('')
    expect(createData.itens_pedido.create[0].incoterm_item).toBe('FOB')
    expect(createData.snapshots_ncm_pedido).toBeDefined()
    expect(createData.snapshots_moeda_pedido).toBeDefined()
    expect(mockRecalcular).toHaveBeenCalledOnce()
    expect(mockAuditLog).toHaveBeenCalledOnce()
  })

  it('rejeita leitura incompleta', async () => {
    mockObterLeitura.mockResolvedValue({ ...LEITURA_COMPLETA, status_leitura: 'PROCESSING' })
    const app = criarApp()
    const res = await request(app)
      .post('/api/v1/pedidos/importacoes-smart-read/criar')
      .set('x-id-workspace', ID_WS)
      .send({ id_leitura: ID_LEITURA })

    expect(res.status).toBe(400)
    expect(mockPrisma.pedido.create).not.toHaveBeenCalled()
  })

  it('exige x-id-workspace valido', async () => {
    const app = criarApp()
    const res = await request(app)
      .post('/api/v1/pedidos/importacoes-smart-read/criar')
      .set('x-id-workspace', ID_ORG)
      .send({ id_leitura: ID_LEITURA })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('WORKSPACE_OBRIGATORIO')
  })
})
