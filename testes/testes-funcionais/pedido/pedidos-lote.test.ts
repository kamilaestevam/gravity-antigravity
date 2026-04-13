// @vitest-environment node
/**
 * Testes funcionais — Operações em lote (pedidos-lote)
 *
 * Endpoint base: /api/v1/pedidos/lote
 *
 * Cobre:
 *   POST /lote/status/preview    Preview de mudança de status
 *   POST /lote/status/confirmar  Executar mudança de status
 *   POST /lote/cancelar/preview  Preview de cancelamento
 *   POST /lote/cancelar/confirmar Executar cancelamento
 *   POST /lote/exportar          Exportar pedidos
 *
 *   Validação Zod (ids vazio, acima do limite, status_novo inválido)
 *   Transições de status válidas e inválidas
 *   Tenant isolation
 *   Preview → Confirmar pattern (idempotência parcial)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'
import { pedidosLoteRouter } from '../../../servicos-global/tenant/processos-core/src/routes/pedidos-lote'

// ── Tipos locais ──────────────────────────────────────────────────────────────

interface HttpError extends Error {
  statusCode?: number
}

type AppRequest = Request & {
  prisma: unknown
}

// ── Setup ─────────────────────────────────────────────────────────────────────

function criarApp(prismaMock: unknown) {
  const app = express()
  app.use(express.json())

  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as AppRequest).prisma = prismaMock
    if (!req.headers['x-tenant-id']) req.headers['x-tenant-id'] = 'tenant-test'
    if (!req.headers['x-company-id']) req.headers['x-company-id'] = 'company-test'
    next()
  })

  app.use('/api/v1/pedidos/lote', pedidosLoteRouter)

  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message } })
  })

  return app
}

// ── Mocks base ────────────────────────────────────────────────────────────────

function mkPedido(overrides = {}) {
  return {
    id: 'pedi-001',
    tenant_id: 'tenant-test',
    company_id: 'company-test',
    numero_pedido: 'PO-2026/001',
    status: 'aberto',
    tipo_operacao: 'importacao',
    itens: [],
    ...overrides,
  }
}

function criarPrismaMock() {
  return {
    pedido: {
      findMany: vi.fn().mockResolvedValue([mkPedido()]),
      findFirst: vi.fn().mockResolvedValue(mkPedido()),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      pedido: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    })),
  }
}

// ── STATUS PREVIEW ────────────────────────────────────────────────────────────

describe('POST /lote/status/preview', () => {
  it('deve retornar afetados e bloqueados separadamente', async () => {
    const prisma = criarPrismaMock()
    // pedido-001 pode ir para 'cancelado' (aberto → cancelado: válido)
    // pedido-002 não existe
    prisma.pedido.findMany.mockResolvedValue([mkPedido({ id: 'pedi-001', status: 'aberto' })])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/status/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001', 'pedi-nao-existe'], status_novo: 'cancelado' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('total', 2)
    expect(res.body).toHaveProperty('afetados')
    expect(res.body).toHaveProperty('bloqueados')

    // pedi-001 está em afetados (transição válida)
    const afetado = (res.body.afetados as Array<{ id: string }>).find(a => a.id === 'pedi-001')
    expect(afetado).toBeDefined()

    // pedi-nao-existe está em bloqueados
    const bloqueado = (res.body.bloqueados as Array<{ id: string; motivo: string }>).find(b => b.id === 'pedi-nao-existe')
    expect(bloqueado).toBeDefined()
    expect(bloqueado?.motivo).toMatch(/nao encontrado/i)
  })

  it('deve bloquear transicao invalida (consolidado → aberto)', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([mkPedido({ status: 'consolidado' })])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/status/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'], status_novo: 'aberto' })

    expect(res.status).toBe(200)
    expect(res.body.afetados).toHaveLength(0)
    expect(res.body.bloqueados).toHaveLength(1)
    expect(res.body.bloqueados[0].motivo).toMatch(/nao permitida/i)
  })

  it('deve aceitar transicao valida draft → aberto', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([mkPedido({ status: 'draft' })])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/status/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'], status_novo: 'aberto' })

    expect(res.status).toBe(200)
    expect(res.body.afetados).toHaveLength(1)
    expect(res.body.bloqueados).toHaveLength(0)
  })

  it('deve retornar 400 para ids array vazio', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/status/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: [], status_novo: 'cancelado' })

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 para mais de 500 ids', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)
    const muitosIds = Array.from({ length: 501 }, (_, i) => `id-${i}`)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/status/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: muitosIds, status_novo: 'cancelado' })

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 quando status_novo ausente', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/status/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'] }) // sem status_novo

    expect(res.status).toBe(400)
  })

  it('deve filtrar pedidos pelo tenant_id', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .post('/api/v1/pedidos/lote/status/preview')
      .set('x-tenant-id', 'tenant-ISOLADO')
      .send({ ids: ['pedi-001'], status_novo: 'cancelado' })

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'tenant-ISOLADO' }),
      })
    )
  })
})

// ── STATUS CONFIRMAR ──────────────────────────────────────────────────────────

describe('POST /lote/status/confirmar', () => {
  it('deve atualizar status dos pedidos validos em transacao', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([mkPedido({ status: 'aberto' })])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/status/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'], status_novo: 'cancelado' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('sucesso')
    expect(res.body.sucesso).toBe(1)
    expect(prisma.$transaction).toHaveBeenCalledOnce()
  })

  it('deve pular pedidos com transicao invalida sem abortar', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([
      mkPedido({ id: 'pedi-001', status: 'aberto' }),         // válido para cancelado
      mkPedido({ id: 'pedi-002', status: 'consolidado' }),    // inválido para aberto
    ])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/status/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001', 'pedi-002'], status_novo: 'cancelado' })

    expect(res.status).toBe(200)
    expect(res.body.sucesso).toBe(1)        // apenas pedi-001
    expect(res.body.erros).toHaveLength(1)  // pedi-002 com erro
  })

  it('deve retornar sucesso=0 quando todos os pedidos nao encontrados', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([]) // nenhum encontrado
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/status/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-nao-existe'], status_novo: 'cancelado' })

    expect(res.status).toBe(200)
    expect(res.body.sucesso).toBe(0)
    // não chama $transaction se não há válidos
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})

// ── CANCELAR PREVIEW ──────────────────────────────────────────────────────────

describe('POST /lote/cancelar/preview', () => {
  it('deve retornar afetados e bloqueados para cancelamento', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([
      mkPedido({ status: 'aberto', itens: [] }),
    ])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/cancelar/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'] })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('afetados')
    expect(res.body).toHaveProperty('bloqueados')
    expect(res.body.afetados).toHaveLength(1)
  })

  it('deve bloquear cancelamento de pedido ja cancelado', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([
      mkPedido({ status: 'cancelado', itens: [] }),
    ])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/cancelar/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'] })

    expect(res.status).toBe(200)
    expect(res.body.bloqueados).toHaveLength(1)
    expect(res.body.bloqueados[0].motivo).toMatch(/ja esta cancelado/i)
  })

  it('deve bloquear cancelamento de pedido consolidado', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([
      mkPedido({ status: 'consolidado', itens: [] }),
    ])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/cancelar/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'] })

    expect(res.status).toBe(200)
    expect(res.body.bloqueados).toHaveLength(1)
    expect(res.body.bloqueados[0].motivo).toMatch(/consolidado/i)
  })

  it('deve bloquear cancelamento de pedido com itens transferidos', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([
      mkPedido({
        status: 'aberto',
        itens: [{ quantidade_transferida_item: 500 }], // tem transferência
      }),
    ])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/cancelar/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'] })

    expect(res.status).toBe(200)
    expect(res.body.bloqueados).toHaveLength(1)
    expect(res.body.bloqueados[0].motivo).toMatch(/transferida/i)
  })

  it('deve retornar 400 para ids vazio', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/cancelar/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: [] })

    expect(res.status).toBe(400)
  })
})

// ── CANCELAR CONFIRMAR ────────────────────────────────────────────────────────

describe('POST /lote/cancelar/confirmar', () => {
  it('deve cancelar pedidos validos', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([
      mkPedido({ status: 'aberto', itens: [] }),
    ])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/cancelar/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'] })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('cancelados')
    expect(res.body.cancelados).toBe(1)
  })

  it('deve usar transacao para garantir atomicidade', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([
      mkPedido({ status: 'aberto', itens: [] }),
    ])
    const app = criarApp(prisma)

    await request(app)
      .post('/api/v1/pedidos/lote/cancelar/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'] })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
  })
})

// ── EXPORTAR ──────────────────────────────────────────────────────────────────

describe('POST /lote/exportar', () => {
  it('deve retornar dados de exportacao para formato json', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([
      mkPedido(),
      mkPedido({ id: 'pedi-002', numero_pedido: 'PO-2026/002' }),
    ])
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/exportar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001', 'pedi-002'], formato: 'json' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
  })

  it('deve aceitar formato csv', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/exportar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'], formato: 'csv' })

    expect(res.status).toBe(200)
  })

  it('deve aceitar formato xlsx', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/exportar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'], formato: 'xlsx' })

    expect(res.status).toBe(200)
  })

  it('deve retornar 400 para formato invalido', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/exportar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: ['pedi-001'], formato: 'pdf' }) // não suportado

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 para mais de 5000 ids', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)
    const muitosIds = Array.from({ length: 5001 }, (_, i) => `id-${i}`)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/exportar')
      .set('x-tenant-id', 'tenant-test')
      .send({ ids: muitosIds, formato: 'csv' })

    expect(res.status).toBe(400)
  })

  it('deve filtrar pedidos pelo tenant_id', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .post('/api/v1/pedidos/lote/exportar')
      .set('x-tenant-id', 'tenant-ISOLADO')
      .send({ ids: ['pedi-001'], formato: 'json' })

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'tenant-ISOLADO' }),
      })
    )
  })

  it('deve aceitar colunas opcionais para filtrar campos exportados', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/lote/exportar')
      .set('x-tenant-id', 'tenant-test')
      .send({
        ids: ['pedi-001'],
        formato: 'json',
        colunas: ['numero_pedido', 'nome_exportador', 'valor_total_pedido'],
      })

    expect(res.status).toBe(200)
  })
})
