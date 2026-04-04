// @vitest-environment node
/**
 * Testes funcionais — Edição em Massa de Pedidos
 *
 * Endpoint base: /api/v1/pedidos/edicao-em-massa
 *
 * Cobre:
 *   POST /preview   — retorna multiplos_valores corretamente
 *   POST /confirmar — aplica alterações e retorna resultado
 *   POST /confirmar — rejeita campo bloqueado (campo calculado)
 *   POST /confirmar — rejeita pedidos de outro tenant (cross-tenant)
 *   Validação Zod — payload inválido
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'
import { edicaoEmMassaRouter } from '../../../produto/pedido/server/src/routes/edicaoEmMassa'

// ── Helpers ───────────────────────────────────────────────────────────────────

function criarPedidoMock(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    tenant_id: 'tenant-test',
    company_id: 'company-test',
    numero_pedido: `PO-${id}`,
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    data_emissao_pedido: '2026-04-01T00:00:00.000Z',
    valor_total_pedido: 1000,
    itens: [],
    ...overrides,
  }
}

function criarApp(prismaMock: unknown) {
  const app = express()
  app.use(express.json())

  // Middleware simulando tenant isolation
  app.use((req: Request, _res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).prisma = prismaMock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).tenantId = req.headers['x-tenant-id'] as string || 'tenant-test'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).userId = req.headers['x-user-id'] as string || 'user-test'
    next()
  })

  app.use('/api/v1/pedidos/edicao-em-massa', edicaoEmMassaRouter)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code, message: err.message } })
  })

  return app
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('POST /api/v1/pedidos/edicao-em-massa/preview', () => {

  it('retorna multiplos_valores corretamente quando pedidos têm valores distintos', async () => {
    const pedidos = [
      criarPedidoMock('p1', { incoterm: 'FOB' }),
      criarPedidoMock('p2', { incoterm: 'CIF' }),
    ]

    const prismaMock = {
      pedido: {
        findMany: vi.fn().mockResolvedValue(pedidos),
      },
    }

    const app = criarApp(prismaMock)

    const resp = await request(app)
      .post('/api/v1/pedidos/edicao-em-massa/preview')
      .set('x-tenant-id', 'tenant-test')
      .send({
        pedido_ids: ['p1', 'p2'],
        campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CFR' }],
        nivel: 'pedido',
      })

    expect(resp.status).toBe(200)
    expect(resp.body.pedidos_afetados).toBe(2)
    expect(resp.body.campos[0].multiplos_valores).toBe(true)
    expect(resp.body.campos[0].valores_distintos).toContain('FOB')
    expect(resp.body.campos[0].valores_distintos).toContain('CIF')
  })

  it('retorna multiplos_valores = false quando valores são iguais', async () => {
    const pedidos = [
      criarPedidoMock('p1', { incoterm: 'FOB' }),
      criarPedidoMock('p2', { incoterm: 'FOB' }),
    ]

    const prismaMock = {
      pedido: {
        findMany: vi.fn().mockResolvedValue(pedidos),
      },
    }

    const app = criarApp(prismaMock)

    const resp = await request(app)
      .post('/api/v1/pedidos/edicao-em-massa/preview')
      .send({
        pedido_ids: ['p1', 'p2'],
        campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CFR' }],
        nivel: 'pedido',
      })

    expect(resp.status).toBe(200)
    expect(resp.body.campos[0].multiplos_valores).toBe(false)
  })

  it('retorna 400 quando pedido_ids está vazio', async () => {
    const app = criarApp({})

    const resp = await request(app)
      .post('/api/v1/pedidos/edicao-em-massa/preview')
      .send({
        pedido_ids: [],
        campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'pedido',
      })

    expect(resp.status).toBe(400)
    expect(resp.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 quando campos está vazio', async () => {
    const app = criarApp({})

    const resp = await request(app)
      .post('/api/v1/pedidos/edicao-em-massa/preview')
      .send({
        pedido_ids: ['p1'],
        campos: [],
        nivel: 'pedido',
      })

    expect(resp.status).toBe(400)
    expect(resp.body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('POST /api/v1/pedidos/edicao-em-massa/confirmar', () => {

  it('aplica alterações e retorna resultado com pedidos_atualizados', async () => {
    const pedidos = [criarPedidoMock('p1'), criarPedidoMock('p2')]
    const txMock = {
      pedido: { update: vi.fn().mockResolvedValue({}) },
      pedidoItem: { update: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([]) },
      pedidoHistorico: { createMany: vi.fn().mockResolvedValue({}) },
    }
    const prismaMock = {
      pedido: { findMany: vi.fn().mockResolvedValue(pedidos) },
      $transaction: vi.fn().mockImplementation(async (fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock)),
    }

    const app = criarApp(prismaMock)

    const resp = await request(app)
      .post('/api/v1/pedidos/edicao-em-massa/confirmar')
      .set('x-tenant-id', 'tenant-test')
      .send({
        pedido_ids: ['p1', 'p2'],
        campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'pedido',
      })

    expect(resp.status).toBe(200)
    expect(resp.body.pedidos_atualizados).toBe(2)
    expect(resp.body.campos_alterados).toContain('incoterm')
    expect(resp.body.erros).toHaveLength(0)
  })

  it('rejeita campo bloqueado com 400 CAMPO_BLOQUEADO', async () => {
    const app = criarApp({})

    const resp = await request(app)
      .post('/api/v1/pedidos/edicao-em-massa/confirmar')
      .send({
        pedido_ids: ['p1'],
        campos: [{ campo: 'valor_total_pedido', tipo: 'numero', nivel: 'pedido', operacao: 'substituir', valor: 9999 }],
        nivel: 'pedido',
      })

    expect(resp.status).toBe(400)
    expect(resp.body.error.code).toBe('CAMPO_BLOQUEADO')
  })

  it('rejeita campo calculado de item com 400 CAMPO_BLOQUEADO', async () => {
    const app = criarApp({})

    const resp = await request(app)
      .post('/api/v1/pedidos/edicao-em-massa/confirmar')
      .send({
        pedido_ids: ['p1'],
        campos: [{ campo: 'quantidade_atual', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 999 }],
        nivel: 'item',
      })

    expect(resp.status).toBe(400)
    expect(resp.body.error.code).toBe('CAMPO_BLOQUEADO')
  })

  it('rejeita pedidos de outro tenant — retorna 404 NOT_FOUND (masking)', async () => {
    // findMany retorna vazio porque tenant_id do filtro não bate
    const prismaMock = {
      pedido: { findMany: vi.fn().mockResolvedValue([]) },
      $transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({})),
    }

    const app = criarApp(prismaMock)

    const resp = await request(app)
      .post('/api/v1/pedidos/edicao-em-massa/confirmar')
      .set('x-tenant-id', 'tenant-atacante')
      .send({
        pedido_ids: ['pedido-outro-tenant'],
        campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'pedido',
      })

    expect(resp.status).toBe(404)
    expect(resp.body.error.code).toBe('NOT_FOUND')
  })

  it('retorna 400 com body inválido (nivel fora do enum)', async () => {
    const app = criarApp({})

    const resp = await request(app)
      .post('/api/v1/pedidos/edicao-em-massa/confirmar')
      .send({
        pedido_ids: ['p1'],
        campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'invalido',
      })

    expect(resp.status).toBe(400)
    expect(resp.body.error.code).toBe('VALIDATION_ERROR')
  })
})
