// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * Testes Funcionais — POST /consolidacoes/confirmar
 *
 * Cobre: F-CNF-01 a F-CNF-40
 * Estratégia: Supertest + Zod real + error handler do router + Prisma mockado via withOrganizacao
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
  pedidoItem: {
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

const { mockRecalcular } = vi.hoisted(() => ({
  mockRecalcular: vi.fn().mockResolvedValue({}),
}))

vi.mock('../../../../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js', () => ({
  recalcularAgregadosPedido: mockRecalcular,
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
    (req as unknown as { organizacao: { idOrganizacao: string } }).organizacao = { idOrganizacao: 'org-001' }
    next()
  })
  app.use('/api/v1/pedidos/consolidacoes', consolidarRouter)
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function criarPedidoMock(overrides: Record<string, unknown> = {}) {
  return {
    id_pedido: 'ped-001',
    id_organizacao: 'org-001',
    id_workspace: 'ws-001',
    numero_pedido: 'PED-001',
    tipo_operacao_pedido: 'importacao',
    status_pedido: 'aberto',
    incoterm_pedido: 'FOB',
    moeda_pedido: 'USD',
    condicao_pagamento_pedido: '30 dias',
    valor_total_pedido: 5000,
    detalhes_operacionais_pedido: {},
    id_importacao_exportador_pedido: null,
    id_exportacao_importador_pedido: null,
    itens_pedido: [
      {
        id_item: 'itm-001',
        id_pedido: 'ped-001',
        part_number_item: 'PN-001',
        descricao_item: 'Item A',
        ncm_item: '8471.30.19',
        unidade_comercializada_item: 'UN',
        moeda_item: 'USD',
        valor_por_unidade_item: 50,
        valor_total_item: 5000,
        quantidade_inicial_item: 100,
        quantidade_atual_item: 100,
        quantidade_pronta_item: 0,
        sequencia_item_pedido: 1,
        data_criacao_item: '2026-05-01T00:00:00.000Z',
        data_atualizacao_item: '2026-05-01T00:00:00.000Z',
      },
    ],
    ...overrides,
  }
}

const PEDIDO_1 = criarPedidoMock()
const PEDIDO_2 = criarPedidoMock({
  id_pedido: 'ped-002',
  numero_pedido: 'PED-002',
  valor_total_pedido: 3000,
  itens_pedido: [
    {
      id_item: 'itm-002',
      id_pedido: 'ped-002',
      part_number_item: 'PN-002',
      descricao_item: 'Item B',
      ncm_item: '8471.30.20',
      unidade_comercializada_item: 'UN',
      moeda_item: 'USD',
      valor_por_unidade_item: 30,
      valor_total_item: 3000,
      quantidade_inicial_item: 100,
      quantidade_atual_item: 100,
      quantidade_pronta_item: 0,
      sequencia_item_pedido: 1,
      data_criacao_item: '2026-05-01T00:00:00.000Z',
      data_atualizacao_item: '2026-05-01T00:00:00.000Z',
    },
  ],
})

const PAYLOAD_VALIDO = {
  ids: ['ped-001', 'ped-002'],
  numero_pedido: 'PO-CONS-2026/001',
  campos_escolhidos: { incoterm_pedido: 'FOB' },
  fundir_itens_mesmo_part_number: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.pedido.findMany.mockResolvedValue([PEDIDO_1, PEDIDO_2])
  mockPrisma.pedido.findFirst.mockResolvedValue(null)
  mockPrisma.pedido.count.mockResolvedValue(10)
  mockPrisma.pedido.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    ...data,
    id_pedido: data.id_pedido ?? 'ped-novo',
    itens_pedido: (data.itens_pedido as { create: unknown[] })?.create ?? [],
  }))
  mockPrisma.pedido.updateMany.mockResolvedValue({ count: 2 })
})

// ── Happy Path ────────────────────────────────────────────────────────────────

describe('POST /consolidacoes/confirmar — Happy Path', () => {
  it('F-CNF-01: Confirmar com 2 pedidos → 201', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    expect(res.status).toBe(201)
  })

  it('F-CNF-02: Novo pedido tem status consolidado', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    expect(res.status).toBe(201)
    expect(res.body.status_pedido).toBe('consolidado')
  })

  it('F-CNF-03: Novo pedido guarda ids_origem_consolidacao_pedido', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    expect(res.status).toBe(201)
    expect(res.body.ids_origem_consolidacao_pedido).toEqual(['ped-001', 'ped-002'])
  })

  it('F-CNF-04: Pedidos originais recebem soft delete', async () => {
    await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    expect(mockPrisma.pedido.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id_pedido: { in: ['ped-001', 'ped-002'] },
          id_organizacao: 'org-001',
        }),
        data: expect.objectContaining({
          status_pedido: 'consolidado',
        }),
      }),
    )
    const updateData = mockPrisma.pedido.updateMany.mock.calls[0][0].data
    expect(updateData.data_exclusao_pedido).toBeDefined()
  })

  it('F-CNF-05: Itens são copiados com sequência contígua 1..N', async () => {
    await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    const createCall = mockPrisma.pedido.create.mock.calls[0][0]
    const itensCreate = createCall.data.itens_pedido.create
    expect(itensCreate.length).toBeGreaterThanOrEqual(2)
    itensCreate.forEach((item: { sequencia_item_pedido: number }, i: number) => {
      expect(item.sequencia_item_pedido).toBe(i + 1)
    })
  })

  it('F-CNF-06: fundir_itens_mesmo_part_number=true soma quantidades', async () => {
    const pedido2MesmoPart = criarPedidoMock({
      id_pedido: 'ped-002',
      numero_pedido: 'PED-002',
      itens_pedido: [
        {
          id_item: 'itm-002',
          id_pedido: 'ped-002',
          part_number_item: 'PN-001',
          descricao_item: 'Item A duplicado',
          ncm_item: '8471.30.19',
          unidade_comercializada_item: 'UN',
          moeda_item: 'USD',
          valor_por_unidade_item: 50,
          valor_total_item: 3000,
          quantidade_inicial_item: 60,
          quantidade_atual_item: 60,
          quantidade_pronta_item: 10,
          sequencia_item_pedido: 1,
          data_criacao_item: '2026-05-01T00:00:00.000Z',
          data_atualizacao_item: '2026-05-01T00:00:00.000Z',
        },
      ],
    })
    mockPrisma.pedido.findMany.mockResolvedValue([PEDIDO_1, pedido2MesmoPart])

    await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send({ ...PAYLOAD_VALIDO, fundir_itens_mesmo_part_number: true })

    const createCall = mockPrisma.pedido.create.mock.calls[0][0]
    const itensCreate = createCall.data.itens_pedido.create
    expect(itensCreate).toHaveLength(1)
    expect(itensCreate[0].quantidade_inicial_item).toBe(160)
    expect(itensCreate[0].quantidade_atual_item).toBe(160)
  })

  it('F-CNF-07: fundir_itens_mesmo_part_number=false mantém itens separados', async () => {
    const pedido2MesmoPart = criarPedidoMock({
      id_pedido: 'ped-002',
      numero_pedido: 'PED-002',
      itens_pedido: [
        {
          id_item: 'itm-002',
          id_pedido: 'ped-002',
          part_number_item: 'PN-001',
          descricao_item: 'Item A duplicado',
          ncm_item: '8471.30.19',
          unidade_comercializada_item: 'UN',
          moeda_item: 'USD',
          valor_por_unidade_item: 50,
          valor_total_item: 3000,
          quantidade_inicial_item: 60,
          quantidade_atual_item: 60,
          quantidade_pronta_item: 10,
          sequencia_item_pedido: 1,
          data_criacao_item: '2026-05-01T00:00:00.000Z',
          data_atualizacao_item: '2026-05-01T00:00:00.000Z',
        },
      ],
    })
    mockPrisma.pedido.findMany.mockResolvedValue([PEDIDO_1, pedido2MesmoPart])

    await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send({ ...PAYLOAD_VALIDO, fundir_itens_mesmo_part_number: false })

    const createCall = mockPrisma.pedido.create.mock.calls[0][0]
    const itensCreate = createCall.data.itens_pedido.create
    expect(itensCreate).toHaveLength(2)
  })

  it('F-CNF-08: campos_escolhidos do usuário fazem override nos divergentes', async () => {
    await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send({
        ...PAYLOAD_VALIDO,
        campos_escolhidos: { incoterm_pedido: 'CIF', moeda_pedido: 'EUR' },
      })

    const createCall = mockPrisma.pedido.create.mock.calls[0][0]
    expect(createCall.data.incoterm_pedido).toBe('CIF')
    expect(createCall.data.moeda_pedido).toBe('EUR')
  })

  it('F-CNF-09: valor_total_pedido = soma dos originais', async () => {
    await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    const createCall = mockPrisma.pedido.create.mock.calls[0][0]
    expect(createCall.data.valor_total_pedido).toBe(8000)
  })

  it('F-CNF-10: recalcularAgregadosPedido é chamado após criação', async () => {
    await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    expect(mockRecalcular).toHaveBeenCalledWith(
      mockPrisma,
      expect.any(String),
      'org-001',
    )
  })
})

// ── Validação Zod (400) ───────────────────────────────────────────────────────

describe('POST /consolidacoes/confirmar — Validação Zod', () => {
  it('F-CNF-20: Body vazio retorna 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-CNF-21: ids com 1 só pedido retorna 400 (min 2)', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send({ ...PAYLOAD_VALIDO, ids: ['ped-001'] })

    expect(res.status).toBe(400)
  })

  it('F-CNF-22: numero_pedido vazio retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send({ ...PAYLOAD_VALIDO, numero_pedido: '' })

    expect(res.status).toBe(400)
  })

  it('F-CNF-23: Sem fundir_itens_mesmo_part_number retorna 400', async () => {
    const { fundir_itens_mesmo_part_number: _, ...semFlag } = PAYLOAD_VALIDO
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(semFlag)

    expect(res.status).toBe(400)
  })

  it('F-CNF-24: numero_pedido > 100 chars retorna 400', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send({ ...PAYLOAD_VALIDO, numero_pedido: 'A'.repeat(101) })

    expect(res.status).toBe(400)
  })
})

// ── Erros de Negócio ──────────────────────────────────────────────────────────

describe('POST /consolidacoes/confirmar — Erros de Negócio', () => {
  it('F-CNF-30: Pedidos não encontrados retorna 404', async () => {
    mockPrisma.pedido.findMany.mockResolvedValue([])

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('F-CNF-31: Tipos de operação mistos retorna 422', async () => {
    const pedidoExportacao = criarPedidoMock({
      id_pedido: 'ped-002',
      numero_pedido: 'PED-002',
      tipo_operacao_pedido: 'exportacao',
    })
    mockPrisma.pedido.findMany.mockResolvedValue([PEDIDO_1, pedidoExportacao])

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('TIPO_OPERACAO_MISTO')
  })

  it('F-CNF-32: Número de pedido já em uso retorna 409', async () => {
    mockPrisma.pedido.findFirst.mockResolvedValue({ id_pedido: 'ped-existente', numero_pedido: 'PO-CONS-2026/001' })

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })
})

// ── Erro Interno ──────────────────────────────────────────────────────────────

describe('POST /consolidacoes/confirmar — Erro Interno', () => {
  it('F-CNF-40: Erro interno do Prisma retorna 500 sem stack trace', async () => {
    mockPrisma.pedido.findMany.mockRejectedValue(new Error('Connection refused'))

    const res = await request(app)
      .post('/api/v1/pedidos/consolidacoes/confirmar')
      .send(PAYLOAD_VALIDO)

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.body).not.toHaveProperty('stack')
  })
})
