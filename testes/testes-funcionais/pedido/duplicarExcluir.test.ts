// @vitest-environment node
/**
 * duplicarExcluir.test.ts — Testes funcionais de duplicar/excluir pedidos
 *
 * Endpoints cobertos:
 *   POST /api/v1/pedidos/duplicar/preview    — retorna config e pedidos
 *   POST /api/v1/pedidos/duplicar/confirmar  — cria cópias com novos IDs
 *   POST /api/v1/pedidos/duplicar/itens      — clona itens
 *   POST /api/v1/pedidos/excluir/preview     — separa permitidos e bloqueados
 *   POST /api/v1/pedidos/excluir/confirmar   — remove definitivamente
 *   POST /api/v1/pedidos/excluir/itens       — remove itens e aplica regra sem-item
 *   Validação Zod                            — payloads inválidos retornam 400
 *   Cross-tenant                             — pedidos de outro tenant retornam 404
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'
import { duplicarExcluirRouter } from '../../../produto/pedido/server/src/routes/duplicarExcluir'

// ── Helpers ───────────────────────────────────────────────────────────────────

function criarPedidoMock(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    tenant_id: 'tenant-test',
    company_id: 'company-test',
    numero_pedido: `PO-${id}`,
    status: 'draft',
    tipo_operacao: 'importacao',
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    cobertura_cambial: 'sem_cobertura',
    data_emissao_pedido: '2026-01-01T00:00:00.000Z',
    data_prevista_pedido_pronto: null,
    valor_total_pedido: 1000,
    importacao_exportador_id: null,
    exportacao_importador_id: null,
    pedidos_origem: [],
    itens: [],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function criarItemMock(id: string, pedidoId: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    tenant_id: 'tenant-test',
    company_id: 'company-test',
    pedido_id: pedidoId,
    part_number: `PN-${id}`,
    ncm: '8471.30.12',
    descricao: 'Produto de teste',
    quantidade_inicial_item_pedido: 100,
    saldo_item_pedido: 100,
    quantidade_pronta_total: 0,
    quantidade_transferida_item: 0,
    quantidade_cancelada_item_pedido: 0,
    moeda_item: 'USD',
    valor_unitario: 10,
    valor_item: 1000,
    casas_decimais_quantidade: 2,
    casas_decimais_total_item: 2,
    unidade_comercializada_item: 'UN',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function criarApp(prismaMock: unknown, configOverrides: Record<string, unknown> = {}) {
  const app = express()
  app.use(express.json())

  // Simula tenant isolation middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).prisma = prismaMock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).tenantId = req.headers['x-tenant-id'] as string || 'tenant-test'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).companyId = req.headers['x-company-id'] as string || 'company-test'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).userId = req.headers['x-user-id'] as string || 'user-test'
    next()
  })

  app.use('/api/v1/pedidos', duplicarExcluirRouter)

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code, message: err.message } })
  })

  return app
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function criarPrismaMock(pedidos: ReturnType<typeof criarPedidoMock>[], configOverrides: Record<string, unknown> = {}) {
  const config = {
    tenant_id: 'tenant-test',
    duplicar_numero_auto: false,
    duplicar_copiar_datas: false,
    duplicar_status_inicial: 'copiar',
    excluir_status_permitidos: ['draft'],
    excluir_pedido_sem_item_permitido: false,
    ...configOverrides,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txMock: Record<string, any> = {
    pedido: {
      findMany: vi.fn().mockImplementation(({ where }: { where: { id?: { in?: string[] }; tenant_id?: string } }) => {
        const ids = where.id?.in ?? []
        const tId = where.tenant_id
        return pedidos.filter(p =>
          (ids.length === 0 || ids.includes(p.id)) && (!tId || p.tenant_id === tId),
        )
      }),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...data, id: `novo-${Date.now()}`, itens: [] }),
      ),
      count: vi.fn().mockResolvedValue(5),
      delete: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: pedidos.length }),
    },
    pedidoItem: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...data, id: `novo-item-${Date.now()}` }),
      ),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(0),
    },
    pedidoHistorico: {
      create: vi.fn().mockResolvedValue({}),
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prismaMock: Record<string, any> = {
    ...txMock,
    configuracaoPedido: {
      findFirst: vi.fn().mockResolvedValue(config),
    },
    $transaction: vi.fn().mockImplementation((fn: (tx: unknown) => Promise<unknown>) => fn(txMock)),
  }

  return { prismaMock, txMock }
}

// ── POST /duplicar/preview ────────────────────────────────────────────────────

describe('POST /duplicar/preview', () => {
  it('deve retornar 200 com config e pedidos', async () => {
    const pedido = criarPedidoMock('p1', { itens: [criarItemMock('i1', 'p1')] })
    const { prismaMock } = criarPrismaMock([pedido])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/duplicar/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['p1'] })

    expect(res.status).toBe(200)
    expect(res.body.config).toBeDefined()
    expect(res.body.config.numero_auto).toBe(false)
    expect(res.body.pedidos).toHaveLength(1)
    expect(res.body.pedidos[0].id).toBe('p1')
    expect(res.body.pedidos[0].total_itens).toBe(1)
  })

  it('deve retornar 400 se ids estiver vazio', async () => {
    const { prismaMock } = criarPrismaMock([])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/duplicar/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: [] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

// ── POST /duplicar/confirmar ──────────────────────────────────────────────────

describe('POST /duplicar/confirmar', () => {
  it('deve criar cópias e retornar 201 com DuplicarResultado', async () => {
    const pedido = criarPedidoMock('p1', { itens: [criarItemMock('i1', 'p1')] })
    const { prismaMock } = criarPrismaMock([pedido])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/duplicar/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['p1'], numeros: { p1: 'PO-COPY-001' } })

    expect(res.status).toBe(201)
    expect(res.body.criados).toHaveLength(1)
    expect(res.body.criados[0].original_id).toBe('p1')
    expect(res.body.criados[0].numero_pedido).toBe('PO-COPY-001')
    expect(res.body.erros).toHaveLength(0)
  })

  it('deve retornar 400 se ids estiver vazio', async () => {
    const { prismaMock } = criarPrismaMock([])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/duplicar/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: [] })

    expect(res.status).toBe(400)
  })

  it('cross-tenant: deve retornar 404 para pedido de outro tenant', async () => {
    const pedido = criarPedidoMock('p1', { tenant_id: 'outro-tenant', itens: [] })
    const { prismaMock } = criarPrismaMock([pedido])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/duplicar/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['p1'], numeros: { p1: 'PO-COPY-001' } })

    expect(res.status).toBe(404)
  })
})

// ── POST /excluir/preview ─────────────────────────────────────────────────────

describe('POST /excluir/preview', () => {
  it('deve separar pedidos permitidos e bloqueados', async () => {
    const p1 = criarPedidoMock('p1', { status: 'draft', itens: [criarItemMock('i1', 'p1')] })
    const p2 = criarPedidoMock('p2', { status: 'consolidado', itens: [] })
    const { prismaMock } = criarPrismaMock([p1, p2])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/excluir/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['p1', 'p2'] })

    expect(res.status).toBe(200)
    expect(res.body.permitidos).toHaveLength(1)
    expect(res.body.permitidos[0].id).toBe('p1')
    expect(res.body.bloqueados).toHaveLength(1)
    expect(res.body.bloqueados[0].id).toBe('p2')
    expect(res.body.bloqueados[0].motivo).toMatch(/consolidado/)
  })

  it('deve retornar 400 se ids estiver vazio', async () => {
    const { prismaMock } = criarPrismaMock([])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/excluir/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: [] })

    expect(res.status).toBe(400)
  })
})

// ── POST /excluir/confirmar ───────────────────────────────────────────────────

describe('POST /excluir/confirmar', () => {
  it('deve excluir pedido e itens e retornar ExcluirResultado', async () => {
    const pedido = criarPedidoMock('p1', {
      itens: [criarItemMock('i1', 'p1'), criarItemMock('i2', 'p1')],
    })
    const { prismaMock, txMock } = criarPrismaMock([pedido])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/excluir/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['p1'] })

    expect(res.status).toBe(200)
    expect(res.body.excluidos).toBe(1)
    expect(res.body.itens_excluidos).toBe(2)
    expect(txMock.pedidoItem.deleteMany).toHaveBeenCalled()
    expect(txMock.pedido.deleteMany).toHaveBeenCalled()
  })

  it('deve bloquear exclusão se status não é permitido', async () => {
    const pedido = criarPedidoMock('p1', { status: 'consolidado', itens: [] })
    const { prismaMock } = criarPrismaMock([pedido])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/excluir/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['p1'] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('STATUS_NAO_PERMITIDO')
  })

  it('deve retornar 400 se ids estiver vazio', async () => {
    const { prismaMock } = criarPrismaMock([])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/excluir/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: [] })

    expect(res.status).toBe(400)
  })
})

// ── POST /excluir/itens ───────────────────────────────────────────────────────

describe('POST /excluir/itens', () => {
  it('deve excluir itens e remover pedido se ficou sem itens (config false)', async () => {
    const pedido = criarPedidoMock('p1', { itens: [criarItemMock('i1', 'p1')] })
    const { prismaMock, txMock } = criarPrismaMock([pedido], {
      excluir_pedido_sem_item_permitido: false,
    })
    // findFirst usado em excluirItens para verificar que pedido pertence ao tenant
    prismaMock.pedido.findFirst.mockResolvedValue(pedido)
    txMock.pedidoItem.findMany.mockResolvedValue([criarItemMock('i1', 'p1')])
    txMock.pedidoItem.count.mockResolvedValue(0)
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/excluir/itens')
      .set('x-tenant-id', 'tenant-test')
      .send({ pedido_id: 'p1', item_ids: ['i1'] })

    expect(res.status).toBe(200)
    expect(res.body.itens_excluidos).toBe(1)
    expect(res.body.pedidos_excluidos_por_sem_item).toBe(1)
    expect(txMock.pedido.delete).toHaveBeenCalledWith({ where: { id: 'p1' } })
  })

  it('deve excluir itens e manter pedido se config excluir_pedido_sem_item_permitido = true', async () => {
    const pedido = criarPedidoMock('p1', { itens: [criarItemMock('i1', 'p1')] })
    const { prismaMock, txMock } = criarPrismaMock([pedido], {
      excluir_pedido_sem_item_permitido: true,
    })
    // findFirst usado em excluirItens para verificar que pedido pertence ao tenant
    prismaMock.pedido.findFirst.mockResolvedValue(pedido)
    txMock.pedidoItem.findMany.mockResolvedValue([criarItemMock('i1', 'p1')])
    txMock.pedidoItem.count.mockResolvedValue(0)
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/excluir/itens')
      .set('x-tenant-id', 'tenant-test')
      .send({ pedido_id: 'p1', item_ids: ['i1'] })

    expect(res.status).toBe(200)
    expect(res.body.pedidos_excluidos_por_sem_item).toBe(0)
    expect(txMock.pedido.delete).not.toHaveBeenCalled()
  })

  it('deve retornar 400 se payload inválido', async () => {
    const { prismaMock } = criarPrismaMock([])
    const app = criarApp(prismaMock)

    const res = await request(app)
      .post('/api/v1/pedidos/excluir/itens')
      .set('x-tenant-id', 'tenant-test')
      .send({ pedido_id: 'p1', item_ids: [] }) // item_ids mínimo 1

    expect(res.status).toBe(400)
  })
})
