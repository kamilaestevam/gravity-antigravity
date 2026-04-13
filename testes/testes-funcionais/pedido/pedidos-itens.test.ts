// @vitest-environment node
/**
 * Testes funcionais — Pedido / Gestão de Itens e Localizar
 *
 * Cobre rotas ausentes nos testes existentes:
 *   POST   /api/v1/pedidos/:id/itens           Adicionar item
 *   PUT    /api/v1/pedidos/:id/itens/:itemId   Atualizar item
 *   PATCH  /api/v1/pedidos/:id/itens/:itemId/cancelar  Cancelar quantidade
 *   PATCH  /api/v1/pedidos/:id/itens/:itemId/pronta    Atualizar quantidade pronta
 *   GET    /api/v1/pedidos/localizar           Contagem de matches find-in-page
 *   Cross-tenant: cada rota verifica que tenant_id é sempre filtrado
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { type Request, type Response, type NextFunction } from 'express'
import { pedidosRouter } from '../../../servicos-global/tenant/processos-core/src/routes/pedidos.js'

// ── Tipos locais ──────────────────────────────────────────────────────────────

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
  app.use('/api/v1/pedidos', pedidosRouter)
  app.use((err: { statusCode?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message, code: err.code } })
  })
  return app
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ITEM_MOCK = {
  id: 'pite_test_abc123',
  tenant_id: 'tenant-test',
  company_id: 'company-test',
  pedido_id: 'pedi_test_001',
  sequencia_item: 1,
  part_number: 'SKU-001',
  ncm: '8542.31.90',
  descricao_item: 'Componente eletrônico',
  quantidade_inicial_item_pedido: 100,
  saldo_item_pedido: 80,
  quantidade_pronta_total_item_pedido: 20,
  quantidade_transferida_item_pedido: 20,
  quantidade_cancelada_item_pedido: 0,
  casas_decimais_quantidade_item: 2,
  moeda_item: 'USD',
  valor_unitario_item: null,
  valor_total_itens: null,
  casas_decimais_valor_item: 2,
  cobertura_cambial: 'com_cobertura',
  peso_liquido_unitario_item: null,
  peso_bruto_unitario_item: null,
  cubagem_unitaria_item: null,
}

const PEDIDO_DRAFT_MOCK = {
  id: 'pedi_test_001',
  tenant_id: 'tenant-test',
  company_id: 'company-test',
  tipo_operacao: 'importacao',
  numero_pedido: 'PO-TEST-001',
  status: 'draft',
  itens: [ITEM_MOCK],
  detalhes_operacionais: null,
}

function criarPrismaMock() {
  return {
    pedido: {
      findFirst: vi.fn().mockResolvedValue(PEDIDO_DRAFT_MOCK),
      findMany: vi.fn().mockResolvedValue([PEDIDO_DRAFT_MOCK]),
      count: vi.fn().mockResolvedValue(1),
      create: vi.fn().mockResolvedValue(PEDIDO_DRAFT_MOCK),
      update: vi.fn().mockResolvedValue(PEDIDO_DRAFT_MOCK),
      delete: vi.fn().mockResolvedValue(PEDIDO_DRAFT_MOCK),
    },
    pedidoItem: {
      findFirst: vi.fn().mockResolvedValue(ITEM_MOCK),
      findMany: vi.fn().mockResolvedValue([ITEM_MOCK]),
      count: vi.fn().mockResolvedValue(1),
      create: vi.fn().mockResolvedValue(ITEM_MOCK),
      update: vi.fn().mockResolvedValue(ITEM_MOCK),
      delete: vi.fn().mockResolvedValue(ITEM_MOCK),
    },
    pedidoColuna: {
      count: vi.fn().mockResolvedValue(0),
    },
    $queryRaw: vi.fn().mockResolvedValue([{ count: 0 }]),
    $transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      if (typeof fn === 'function') {
        return fn({
          pedido: {
            findFirst: vi.fn().mockResolvedValue(PEDIDO_DRAFT_MOCK),
            create: vi.fn().mockResolvedValue(PEDIDO_DRAFT_MOCK),
            update: vi.fn().mockResolvedValue(PEDIDO_DRAFT_MOCK),
          },
          pedidoItem: {
            findFirst: vi.fn().mockResolvedValue(ITEM_MOCK),
            create: vi.fn().mockResolvedValue(ITEM_MOCK),
            update: vi.fn().mockResolvedValue(ITEM_MOCK),
            count: vi.fn().mockResolvedValue(1),
          },
        })
      }
      return fn
    }),
  }
}

// ── POST /:id/itens — Adicionar item ──────────────────────────────────────────

describe('POST /api/v1/pedidos/:id/itens', () => {
  it('deve adicionar item a pedido Draft', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/pedi_test_001/itens')
      .set('x-tenant-id', 'tenant-test')
      .send({
        part_number: 'SKU-NOVO',
        ncm: '8471.30.12',
        descricao_item: 'Novo componente',
        quantidade_inicial_item_pedido: 50,
        moeda_item: 'USD',
      })

    expect(res.status).toBe(201)
  })

  it('deve rejeitar item com quantidade negativa', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/pedi_test_001/itens')
      .set('x-tenant-id', 'tenant-test')
      .send({
        part_number: 'SKU-BAD',
        quantidade_inicial_item_pedido: -10,
      })

    expect(res.status).toBe(400)
  })

  it('deve rejeitar adicionar item a pedido nao encontrado', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue(null)
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/inexistente/itens')
      .set('x-tenant-id', 'tenant-test')
      .send({
        part_number: 'SKU-X',
        quantidade_inicial_item_pedido: 1,
      })

    expect(res.status).toBe(404)
  })

  it('deve rejeitar item em pedido Cancelado', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue({ ...PEDIDO_DRAFT_MOCK, status: 'cancelado' })
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos/pedi_test_001/itens')
      .set('x-tenant-id', 'tenant-test')
      .send({
        part_number: 'SKU-X',
        quantidade_inicial_item_pedido: 1,
      })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toContain('Draft ou Aberto')
  })

  it('tenant isolation: usa tenant_id do header, nao do body', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .post('/api/v1/pedidos/pedi_test_001/itens')
      .set('x-tenant-id', 'tenant-ABC')
      .send({ part_number: 'SKU-X', quantidade_inicial_item_pedido: 1 })

    expect(prisma.pedido.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'tenant-ABC' }),
      })
    )
  })
})

// ── PUT /:id/itens/:itemId — Atualizar item ───────────────────────────────────

describe('PUT /api/v1/pedidos/:id/itens/:itemId', () => {
  it('deve atualizar campos do item', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .put('/api/v1/pedidos/pedi_test_001/itens/pite_test_abc123')
      .set('x-tenant-id', 'tenant-test')
      .send({
        descricao_item: 'Descricao atualizada',
        valor_unitario_item: 12.50,
      })

    expect(res.status).toBe(200)
  })

  it('deve retornar 404 para item inexistente', async () => {
    const prisma = criarPrismaMock()
    prisma.pedidoItem.findFirst.mockResolvedValue(null)
    const app = criarApp(prisma)

    const res = await request(app)
      .put('/api/v1/pedidos/pedi_test_001/itens/inexistente')
      .set('x-tenant-id', 'tenant-test')
      .send({ descricao_item: 'Teste' })

    expect(res.status).toBe(404)
  })

  it('tenant isolation: busca item com tenant_id correto', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .put('/api/v1/pedidos/pedi_test_001/itens/pite_test_abc123')
      .set('x-tenant-id', 'tenant-XYZ')
      .send({ descricao_item: 'Teste' })

    expect(prisma.pedidoItem.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'tenant-XYZ' }),
      })
    )
  })
})

// ── PATCH /:id/itens/:itemId/cancelar — Cancelar quantidade ──────────────────

describe('PATCH /api/v1/pedidos/:id/itens/:itemId/cancelar', () => {
  it('deve cancelar quantidade valida', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_test_001/itens/pite_test_abc123/cancelar')
      .set('x-tenant-id', 'tenant-test')
      .send({ quantidade: 10 })

    expect(res.status).toBe(200)
  })

  it('deve rejeitar quantidade zero ou negativa', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_test_001/itens/pite_test_abc123/cancelar')
      .set('x-tenant-id', 'tenant-test')
      .send({ quantidade: 0 })

    expect(res.status).toBe(400)
  })

  it('deve rejeitar body sem quantidade', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_test_001/itens/pite_test_abc123/cancelar')
      .set('x-tenant-id', 'tenant-test')
      .send({})

    expect(res.status).toBe(400)
  })
})

// ── PATCH /:id/itens/:itemId/pronta — Atualizar quantidade pronta ─────────────

describe('PATCH /api/v1/pedidos/:id/itens/:itemId/pronta', () => {
  it('deve atualizar quantidade pronta', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_test_001/itens/pite_test_abc123/pronta')
      .set('x-tenant-id', 'tenant-test')
      .send({ quantidade_pronta_total_item_pedido: 50 })

    expect(res.status).toBe(200)
  })

  it('deve rejeitar quantidade negativa', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_test_001/itens/pite_test_abc123/pronta')
      .set('x-tenant-id', 'tenant-test')
      .send({ quantidade_pronta_total_item_pedido: -5 })

    expect(res.status).toBe(400)
  })

  it('deve retornar 404 para item de outro tenant', async () => {
    const prisma = criarPrismaMock()
    prisma.pedidoItem.findFirst.mockResolvedValue(null)
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_test_001/itens/pite_outro_tenant/pronta')
      .set('x-tenant-id', 'tenant-test')
      .send({ quantidade_pronta_total_item_pedido: 10 })

    expect(res.status).toBe(404)
  })
})

// ── GET /localizar — Contagem find-in-page ────────────────────────────────────

describe('GET /api/v1/pedidos/localizar', () => {
  it('deve retornar total de matches para termo valido', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.count.mockResolvedValue(3)
    prisma.pedidoItem.count.mockResolvedValue(2)
    prisma.$queryRaw.mockResolvedValue([{ count: 1 }])
    prisma.pedidoColuna.count.mockResolvedValue(0)
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/localizar?termo=PO-001')
      .set('x-tenant-id', 'tenant-test')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('total')
    expect(typeof res.body.total).toBe('number')
  })

  it('deve retornar 400 para termo vazio', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/localizar?termo=')
      .set('x-tenant-id', 'tenant-test')

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 sem parametro termo', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/localizar')
      .set('x-tenant-id', 'tenant-test')

    expect(res.status).toBe(400)
  })

  it('deve escapar caracteres especiais no ILIKE', async () => {
    const prisma = criarPrismaMock()
    prisma.$queryRaw.mockResolvedValue([{ count: 0 }])
    const app = criarApp(prisma)

    // Termo com % e _ não deve causar erro
    const res = await request(app)
      .get('/api/v1/pedidos/localizar?termo=PO%25_001')
      .set('x-tenant-id', 'tenant-test')

    expect(res.status).toBe(200)
  })

  it('tenant isolation: usa tenant_id do header nos counts', async () => {
    const prisma = criarPrismaMock()
    prisma.$queryRaw.mockResolvedValue([{ count: 0 }])
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos/localizar?termo=test')
      .set('x-tenant-id', 'tenant-ISOLADO')

    expect(prisma.pedido.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'tenant-ISOLADO' }),
      })
    )
  })
})

// ── Tenant Isolation — Cross-tenant bloqueado ─────────────────────────────────

describe('Tenant Isolation — Cross-tenant', () => {
  it('GET /:id nao retorna pedido de outro tenant', async () => {
    const prisma = criarPrismaMock()
    // tenant_id do pedido é diferente do header
    prisma.pedido.findFirst.mockResolvedValue(null)
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/pedi_outro_tenant')
      .set('x-tenant-id', 'tenant-A')

    expect(res.status).toBe(404)
  })

  it('DELETE /:id nao deleta pedido de outro tenant', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue(null)
    const app = criarApp(prisma)

    const res = await request(app)
      .delete('/api/v1/pedidos/pedi_outro_tenant')
      .set('x-tenant-id', 'tenant-A')

    expect(res.status).toBe(404)
  })

  it('PUT /:id nao atualiza pedido de outro tenant', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue(null)
    const app = criarApp(prisma)

    const res = await request(app)
      .put('/api/v1/pedidos/pedi_outro_tenant')
      .set('x-tenant-id', 'tenant-A')
      .send({ numero_pedido: 'HACK' })

    expect(res.status).toBe(404)
  })

  it('PATCH /:id/status nao muda status de pedido de outro tenant', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue(null)
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_outro_tenant/status')
      .set('x-tenant-id', 'tenant-A')
      .send({ status: 'aberto' })

    expect(res.status).toBe(404)
  })

  it('GET / filtra pedidos pelo tenant_id correto', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos')
      .set('x-tenant-id', 'tenant-ESPECIFICO')

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'tenant-ESPECIFICO' }),
      })
    )
  })
})
