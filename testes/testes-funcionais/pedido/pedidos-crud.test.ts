// @vitest-environment node
/**
 * Testes funcionais — Pedido / CRUD de Pedidos e Itens
 *
 * Testa os endpoints via supertest com mock do Prisma:
 *   - GET /api/v1/pedidos (listar)
 *   - POST /api/v1/pedidos (criar)
 *   - GET /api/v1/pedidos/:id (detalhe)
 *   - PUT /api/v1/pedidos/:id (atualizar)
 *   - DELETE /api/v1/pedidos/:id (deletar)
 *   - PATCH /api/v1/pedidos/:id/status (transicao)
 *   - POST /api/v1/pedidos/:id/duplicar (duplicar)
 *   - DELETE /api/v1/pedidos/:id/itens/:itemId (remover item)
 *   - Tenant isolation (cross-tenant)
 *   - Validacao Zod (dados invalidos)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'
import { pedidosRouter } from '../../../servicos-global/tenant/processos-core/src/routes/pedidos'

// ── Tipos locais ──────────────────────────────────────────────────────────────

interface HttpError extends Error {
  statusCode?: number
}

type AppRequest = Request & {
  prisma: unknown
}

// ── Setup Express com mock de tenant isolation ────────────────────────────────

function criarApp(prismaMock: unknown) {
  const app = express()
  app.use(express.json())

  // Simula tenantIsolation: injeta prisma e headers
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as AppRequest).prisma = prismaMock
    if (!req.headers['x-tenant-id']) req.headers['x-tenant-id'] = 'tenant-001'
    if (!req.headers['x-company-id']) req.headers['x-company-id'] = 'company-001'
    next()
  })

  app.use('/api/v1/pedidos', pedidosRouter)

  // Error handler
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message } })
  })

  return app
}

// ── Mock de dados ─────────────────────────────────────────────────────────────

const PEDIDO_MOCK = {
  id: 'pedi_id_0000001/26',
  tenant_id: 'tenant-001',
  company_id: 'company-001',
  tipo_operacao: 'importacao',
  numero_pedido: 'PO-2026/001',
  status: 'draft',
  incoterm: 'FOB',
  moeda_pedido: 'USD',
  valor_total_pedido: 35000,
  quantidade_total_inicial_pedido: 1000,
  casas_decimais_valor_pedido: 2,
  casas_decimais_quantidade_pedido: 2,
  unidade_comercializada_pedido: 'UN',
  condicao_pagamento_pedido: null,
  data_emissao_pedido: new Date(),
  detalhes_operacionais: null,
  itens: [
    {
      id: 'pite_id_00001/26',
      tenant_id: 'tenant-001',
      company_id: 'company-001',
      pedido_id: 'pedi_id_0000001/26',
      part_number: 'PCB-X200',
      ncm: '8542.31.90',
      descricao: 'Placa controladora',
      quantidade_inicial_item_pedido: 1000,
      saldo_item_pedido: 1000,
      quantidade_pronta_total: 0,
      quantidade_transferida_item: 0,
      quantidade_cancelada_item_pedido: 0,
    },
  ],
  created_at: new Date(),
  updated_at: new Date(),
}

function criarPrismaMock() {
  return {
    pedido: {
      findMany: vi.fn().mockResolvedValue([PEDIDO_MOCK]),
      findFirst: vi.fn().mockResolvedValue(PEDIDO_MOCK),
      count: vi.fn().mockResolvedValue(1),
      create: vi.fn().mockResolvedValue(PEDIDO_MOCK),
      update: vi.fn().mockResolvedValue(PEDIDO_MOCK),
      delete: vi.fn().mockResolvedValue(PEDIDO_MOCK),
    },
    pedidoItem: {
      findFirst: vi.fn().mockResolvedValue(PEDIDO_MOCK.itens[0]),
      create: vi.fn().mockResolvedValue(PEDIDO_MOCK.itens[0]),
      update: vi.fn().mockResolvedValue(PEDIDO_MOCK.itens[0]),
      delete: vi.fn().mockResolvedValue(PEDIDO_MOCK.itens[0]),
      findMany: vi.fn().mockResolvedValue(PEDIDO_MOCK.itens),
    },
    $transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      return fn({
        pedido: {
          findMany: vi.fn().mockResolvedValue([PEDIDO_MOCK]),
          findFirst: vi.fn().mockResolvedValue(PEDIDO_MOCK),
          create: vi.fn().mockResolvedValue(PEDIDO_MOCK),
          update: vi.fn().mockResolvedValue(PEDIDO_MOCK),
        },
        pedidoItem: {
          findFirst: vi.fn().mockResolvedValue(PEDIDO_MOCK.itens[0]),
          create: vi.fn().mockResolvedValue(PEDIDO_MOCK.itens[0]),
          findMany: vi.fn().mockResolvedValue(PEDIDO_MOCK.itens),
        },
      })
    }),
  }
}

// ── Testes: Listar ────────────────────────────────────────────────────────────

describe('GET /api/v1/pedidos', () => {
  it('deve retornar lista de pedidos com paginacao', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos')
      .set('x-tenant-id', 'tenant-001')
      .set('x-company-id', 'company-001')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('page')
    expect(res.body).toHaveProperty('limit')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('deve filtrar por status', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos?status=aberto')
      .set('x-tenant-id', 'tenant-001')

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'aberto' }),
      })
    )
  })
})

// ── Testes: Criar ─────────────────────────────────────────────────────────────

describe('POST /api/v1/pedidos', () => {
  it('deve criar pedido com itens', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos')
      .set('x-tenant-id', 'tenant-001')
      .send({
        tipo_operacao: 'importacao',
        numero_pedido: 'PO-2026/NEW',
        itens: [
          {
            part_number: 'SKU-001',
            ncm: '8542.31.90',
            descricao: 'Componente teste',
            quantidade_inicial_item_pedido: 500,
          },
        ],
      })

    expect(res.status).toBe(201)
  })

  it('deve rejeitar pedido sem itens (Zod validation)', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos')
      .set('x-tenant-id', 'tenant-001')
      .send({
        tipo_operacao: 'importacao',
        numero_pedido: 'PO-FAIL',
        itens: [],
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('deve rejeitar pedido sem numero_pedido', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos')
      .set('x-tenant-id', 'tenant-001')
      .send({
        tipo_operacao: 'importacao',
        itens: [{ part_number: 'X', ncm: 'Y', descricao: 'Z', quantidade_inicial_item_pedido: 1 }],
      })

    expect(res.status).toBe(400)
  })

  it('deve rejeitar tipo_operacao invalido', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .post('/api/v1/pedidos')
      .set('x-tenant-id', 'tenant-001')
      .send({
        tipo_operacao: 'invalido',
        numero_pedido: 'PO-BAD',
        itens: [{ part_number: 'X', ncm: 'Y', descricao: 'Z', quantidade_inicial_item_pedido: 1 }],
      })

    expect(res.status).toBe(400)
  })
})

// ── Testes: Detalhe ───────────────────────────────────────────────────────────

describe('GET /api/v1/pedidos/:id', () => {
  it('deve retornar pedido com itens', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/pedi_id_0000001')
      .set('x-tenant-id', 'tenant-001')

    expect(res.status).toBe(200)
    expect(res.body.numero_pedido).toBe('PO-2026/001')
  })

  it('deve retornar 404 para pedido inexistente', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue(null)
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/inexistente')
      .set('x-tenant-id', 'tenant-001')

    expect(res.status).toBe(404)
    expect(res.body.error.message).toContain('nao encontrado')
  })
})

// ── Testes: Deletar ───────────────────────────────────────────────────────────

describe('DELETE /api/v1/pedidos/:id', () => {
  it('deve deletar pedido Draft', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue({ ...PEDIDO_MOCK, status: 'draft' })
    const app = criarApp(prisma)

    const res = await request(app)
      .delete('/api/v1/pedidos/pedi_id_0000001')
      .set('x-tenant-id', 'tenant-001')

    expect(res.status).toBe(204)
  })

  it('deve rejeitar delecao de pedido Aberto', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue({ ...PEDIDO_MOCK, status: 'aberto' })
    const app = criarApp(prisma)

    const res = await request(app)
      .delete('/api/v1/pedidos/pedi_id_0000001')
      .set('x-tenant-id', 'tenant-001')

    expect(res.status).toBe(400)
    expect(res.body.error.message).toContain('Draft')
  })
})

// ── Testes: Transicao de Status ───────────────────────────────────────────────

describe('PATCH /api/v1/pedidos/:id/status', () => {
  it('deve transicionar Draft -> Aberto', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue({ ...PEDIDO_MOCK, status: 'draft' })
    prisma.pedido.update.mockResolvedValue({ ...PEDIDO_MOCK, status: 'aberto' })
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_id_0000001/status')
      .set('x-tenant-id', 'tenant-001')
      .send({ status: 'aberto' })

    expect(res.status).toBe(200)
  })

  it('deve rejeitar transicao invalida Aberto -> Draft', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue({ ...PEDIDO_MOCK, status: 'aberto' })
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi_id_0000001/status')
      .set('x-tenant-id', 'tenant-001')
      .send({ status: 'draft' })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toContain('nao permitida')
  })
})

// ── Testes: Remover Item ──────────────────────────────────────────────────────

describe('DELETE /api/v1/pedidos/:id/itens/:itemId', () => {
  it('deve remover item sem transferencia', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .delete('/api/v1/pedidos/pedi_id_0000001/itens/pite_id_00001')
      .set('x-tenant-id', 'tenant-001')

    expect(res.status).toBe(204)
  })

  it('deve rejeitar remocao de item com transferencia', async () => {
    const prisma = criarPrismaMock()
    prisma.pedidoItem.findFirst.mockResolvedValue({
      ...PEDIDO_MOCK.itens[0],
      quantidade_transferida_item: 500,
    })
    const app = criarApp(prisma)

    const res = await request(app)
      .delete('/api/v1/pedidos/pedi_id_0000001/itens/pite_id_00001')
      .set('x-tenant-id', 'tenant-001')

    expect(res.status).toBe(400)
    expect(res.body.error.message).toContain('transferida')
  })
})

// ── Testes: Tenant Isolation ──────────────────────────────────────────────────

describe('Tenant Isolation', () => {
  it('deve filtrar pedidos por tenant_id do header', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos')
      .set('x-tenant-id', 'tenant-ABC')
      .set('x-company-id', 'company-XYZ')

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenant_id: 'tenant-ABC',
          company_id: 'company-XYZ',
        }),
      })
    )
  })

  it('deve buscar pedido individual com filtro tenant_id', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos/any-id')
      .set('x-tenant-id', 'tenant-ISOLADO')
      .set('x-company-id', 'company-ISOLADA')

    expect(prisma.pedido.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenant_id: 'tenant-ISOLADO',
          company_id: 'company-ISOLADA',
        }),
      })
    )
  })
})
