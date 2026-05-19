// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — POST /:id_pedido/transferencias/confirmar
 *
 * Cobre: F-TCF-01 a F-TCF-30
 * Estratégia: Supertest + Zod real + error handler do router + Prisma mockado via withOrganizacao
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockRecalcular } = vi.hoisted(() => ({
  mockRecalcular: vi.fn().mockResolvedValue({}),
}))

const mockPrisma = vi.hoisted(() => ({
  pedido: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  pedidoItem: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  pedidoTransferencia: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  statusPedido: {
    findFirst: vi.fn(),
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
  recalcularAgregadosPedido: mockRecalcular,
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
    req.params = { ...req.params, id_pedido: 'ped-001' }
    next()
  })
  app.use('/api/v1/pedidos/:id_pedido/transferencias', transferirRouter)
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const PEDIDO_ORIGEM = {
  id_pedido: 'ped-001',
  id_organizacao: 'org-001',
  id_workspace: 'ws-001',
  numero_pedido: 'PED-001',
  tipo_operacao_pedido: 'importacao',
  incoterm_pedido: 'FOB',
  moeda_pedido: 'USD',
  casas_decimais_valor_pedido: 2,
  casas_decimais_quantidade_pedido: 2,
  itens_pedido: [
    {
      id_item: 'itm-001',
      id_organizacao: 'org-001',
      id_workspace: 'ws-001',
      id_pedido: 'ped-001',
      part_number_item: 'PN-001',
      descricao_item: 'Item A',
      ncm_item: '8471.30.19',
      unidade_comercializada_item: 'UN',
      moeda_item: 'USD',
      valor_por_unidade_item: 50,
      quantidade_atual_item: 100,
      quantidade_inicial_item: 100,
      quantidade_transferida_item: 0,
      casas_decimais_quantidade_item: 2,
      casas_decimais_valor_item: 2,
      sequencia_item_pedido: 1,
    },
  ],
}

const PEDIDO_DESTINO = {
  id_pedido: 'ped-002',
  id_organizacao: 'org-001',
  id_workspace: 'ws-001',
  numero_pedido: 'PED-002',
  tipo_operacao_pedido: 'importacao',
  itens_pedido: [
    {
      id_item: 'itm-002',
      id_organizacao: 'org-001',
      id_workspace: 'ws-001',
      id_pedido: 'ped-002',
      part_number_item: 'PN-002',
      descricao_item: 'Item B',
      quantidade_atual_item: 50,
      quantidade_inicial_item: 50,
      quantidade_transferida_item: 0,
      sequencia_item_pedido: 1,
    },
  ],
}

const PAYLOAD_CONFIRMAR_SPLIT_NOVO = {
  cenario: 'split_novo_pedido',
  pedido_id: 'ped-001',
  item_id: 'itm-001',
  quantidade_origem: 30,
  destinos: [{ tipo: 'novo', quantidade: 30 }],
  numero_pedido_novo: 'PO-TRANS-001',
}

beforeEach(() => {
  vi.clearAllMocks()

  mockPrisma.pedido.findFirst.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
    if (where.id_pedido === 'ped-001') return PEDIDO_ORIGEM
    if (where.id_pedido === 'ped-002') return PEDIDO_DESTINO
    if (where.numero_pedido) return null
    return null
  })
  mockPrisma.pedido.findMany.mockResolvedValue([])
  mockPrisma.pedido.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    id_pedido: data.id_pedido ?? 'ped-novo-001',
    ...data,
  }))
  mockPrisma.pedido.update.mockResolvedValue({})
  mockPrisma.pedidoItem.create.mockResolvedValue({ id_item: 'itm-novo-001' })
  mockPrisma.pedidoItem.update.mockResolvedValue({})
  mockPrisma.pedidoItem.findMany.mockResolvedValue([
    { ...PEDIDO_ORIGEM.itens_pedido[0], quantidade_atual_item: 70 },
  ])
  mockPrisma.pedidoTransferencia.create.mockResolvedValue({})
  mockPrisma.statusPedido.findFirst.mockResolvedValue({ id_pedido_status: 'st-aberto-001' })
})

// ── Happy Path ────────────────────────────────────────────────────────────────

describe('POST /transferencias/confirmar — Happy Path', () => {
  it('F-TCF-01: Confirmar split_novo_pedido → 201, pedidos_criados preenchido', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send(PAYLOAD_CONFIRMAR_SPLIT_NOVO)

    expect(res.status).toBe(201)
    expect(res.body.pedido_origem_id).toBe('ped-001')
    expect(res.body.pedidos_criados.length).toBeGreaterThanOrEqual(1)
  })

  it('F-TCF-02: Confirmar split_pedido_existente → 201', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: 'ped-001',
        item_id: 'itm-001',
        quantidade_origem: 20,
        destinos: [{ tipo: 'existente', pedido_id: 'ped-002', quantidade: 20 }],
      })

    expect(res.status).toBe(201)
    expect(res.body.pedidos_destino_ids).toContain('ped-002')
  })

  it('F-TCF-03: Confirmar reducao_simples → 201, quantidade reduzida', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send({
        cenario: 'reducao_simples',
        pedido_id: 'ped-001',
        item_id: 'itm-001',
        quantidade_origem: 10,
        destinos: [],
      })

    expect(res.status).toBe(201)
    expect(mockPrisma.pedidoItem.update).toHaveBeenCalled()
  })

  it('F-TCF-04: Confirmar substituicao_pura → 201, part_number atualizado', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send({
        cenario: 'substituicao_pura',
        pedido_id: 'ped-001',
        item_id: 'itm-001',
        quantidade_origem: 100,
        destinos: [{ tipo: 'mesmo', quantidade: 100, part_number: 'PN-NEW' }],
      })

    expect(res.status).toBe(201)
    const updateCalls = mockPrisma.pedidoItem.update.mock.calls
    const partNumberUpdate = updateCalls.find(
      (c: unknown[]) => (c[0] as Record<string, unknown>)?.data && 'part_number_item' in ((c[0] as Record<string, unknown>).data as Record<string, unknown>),
    )
    expect(partNumberUpdate).toBeDefined()
  })

  it('F-TCF-05: Confirmar com todas quantidades zero → pedidos_encerrados preenchido', async () => {
    mockPrisma.pedidoItem.findMany.mockResolvedValue([
      { ...PEDIDO_ORIGEM.itens_pedido[0], quantidade_atual_item: 0 },
    ])

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send({
        cenario: 'reducao_simples',
        pedido_id: 'ped-001',
        item_id: 'itm-001',
        quantidade_origem: 100,
        destinos: [],
      })

    expect(res.status).toBe(201)
    expect(res.body.pedidos_encerrados).toContain('ped-001')
  })

  it('F-TCF-08: Tipo divergente com confirmar_tipos_divergentes=true → 201', async () => {
    const pedidoDestinoExp = { ...PEDIDO_DESTINO, tipo_operacao_pedido: 'exportacao' }
    mockPrisma.pedido.findFirst.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if (where.id_pedido === 'ped-001') return PEDIDO_ORIGEM
      if (where.id_pedido === 'ped-002') return pedidoDestinoExp
      if (where.numero_pedido) return null
      return null
    })
    mockPrisma.pedido.findMany.mockResolvedValue([pedidoDestinoExp])

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: 'ped-001',
        item_id: 'itm-001',
        quantidade_origem: 20,
        destinos: [{ tipo: 'existente', pedido_id: 'ped-002', quantidade: 20 }],
        confirmar_tipos_divergentes: true,
      })

    expect(res.status).toBe(201)
  })

  it('F-TCF-12: recalcularAgregadosPedido é chamado', async () => {
    await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send(PAYLOAD_CONFIRMAR_SPLIT_NOVO)

    expect(mockRecalcular).toHaveBeenCalled()
  })
})

// ── Validação Zod (400) ───────────────────────────────────────────────────────

describe('POST /transferencias/confirmar — Validação Zod', () => {
  it('F-TCF-10: Body vazio retorna 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

// ── Erros de Negócio ──────────────────────────────────────────────────────────

describe('POST /transferencias/confirmar — Erros de Negócio', () => {
  it('F-TCF-06: Número duplicado → 409 NUMERO_PEDIDO_DUPLICADO', async () => {
    mockPrisma.pedido.findFirst.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if (where.id_pedido === 'ped-001') return PEDIDO_ORIGEM
      if (where.numero_pedido === 'PO-TRANS-001') return { id_pedido: 'ped-existente' }
      return null
    })

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send(PAYLOAD_CONFIRMAR_SPLIT_NOVO)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('NUMERO_PEDIDO_DUPLICADO')
  })

  it('F-TCF-07: Tipo divergente sem flag → 422 TIPO_OPERACAO_DIVERGENTE', async () => {
    const pedidoDestinoExp = { ...PEDIDO_DESTINO, tipo_operacao_pedido: 'exportacao' }
    mockPrisma.pedido.findFirst.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if (where.id_pedido === 'ped-001') return PEDIDO_ORIGEM
      if (where.id_pedido === 'ped-002') return pedidoDestinoExp
      if (where.numero_pedido) return null
      return null
    })
    mockPrisma.pedido.findMany.mockResolvedValue([pedidoDestinoExp])

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send({
        cenario: 'split_pedido_existente',
        pedido_id: 'ped-001',
        item_id: 'itm-001',
        quantidade_origem: 20,
        destinos: [{ tipo: 'existente', pedido_id: 'ped-002', quantidade: 20 }],
      })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('TIPO_OPERACAO_DIVERGENTE')
  })

  it('F-TCF-09: Quantidade excede disponível → 422 INSUFFICIENT_QTY', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send({ ...PAYLOAD_CONFIRMAR_SPLIT_NOVO, quantidade_origem: 200 })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('INSUFFICIENT_QTY')
  })

  it('F-TCF-11: Pedido origem não encontrado → 404', async () => {
    mockPrisma.pedido.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send(PAYLOAD_CONFIRMAR_SPLIT_NOVO)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})

// ── Erro Interno ──────────────────────────────────────────────────────────────

describe('POST /transferencias/confirmar — Erro Interno', () => {
  it('F-TCF-30: Erro interno do banco retorna 500', async () => {
    mockPrisma.pedido.findFirst.mockRejectedValue(new Error('Connection refused'))

    const res = await request(app)
      .post('/api/v1/pedidos/ped-001/transferencias/confirmar')
      .send(PAYLOAD_CONFIRMAR_SPLIT_NOVO)

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
  })
})
