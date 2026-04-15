// @vitest-environment node
/**
 * Testes funcionais — Saldo Formula (saldo-formula)
 *
 * Endpoint base: /api/v1/pedidos/configuracoes/saldo-formula
 *
 * Cobre:
 *   GET    /saldo-formula       Retorna config atual ou default (is_default: true)
 *   PUT    /saldo-formula       Valida parser + upsert
 *   PUT    /saldo-formula       Rejeita sintaxe inválida (400)
 *   PUT    /saldo-formula       Rejeita payload vazio (400)
 *   DELETE /saldo-formula       Apaga registro e retorna default
 *   Tenant isolation: GET/PUT/DELETE usam x-tenant-id
 *   Sem x-tenant-id → 400
 */

import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import express, { type Request, type Response, type NextFunction } from 'express'
import { saldoFormulaRouter } from '../../../produto/pedido/server/src/routes/saldoFormula.js'

// ── Setup ─────────────────────────────────────────────────────────────────────

function criarApp(prismaMock: unknown, opts: { semTenantId?: boolean } = {}) {
  const app = express()
  app.use(express.json())

  app.use((req, _res, next) => {
    ;(req as any).prisma = prismaMock
    if (!opts.semTenantId) req.headers['x-tenant-id'] = req.headers['x-tenant-id'] || 'tenant-A'
    next()
  })

  app.use('/api/v1/pedidos/configuracoes', saldoFormulaRouter)

  app.use((err: { statusCode?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message } })
  })

  return app
}

const FORMULA_DEFAULT = 'quantidade_total_inicial_pedido - quantidade_transferida_total - quantidade_cancelada_total_pedido'
const FORMULA_CUSTOM  = 'quantidade_total_inicial_pedido - quantidade_transferida_total'

// ── GET /saldo-formula ────────────────────────────────────────────────────────

describe('GET /api/v1/pedidos/configuracoes/saldo-formula', () => {
  it('retorna fórmula salva do tenant', async () => {
    const registro = {
      id: 'sf-001',
      tenant_id: 'tenant-A',
      formula_expressao: FORMULA_CUSTOM,
    }
    const prismaMock = {
      pedidoSaldoFormulaConfig: {
        findUnique: vi.fn().mockResolvedValue(registro),
      },
    }

    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-A')

    expect(res.status).toBe(200)
    expect(res.body.data.formula_expressao).toBe(FORMULA_CUSTOM)
    expect(res.body.data.is_default).toBe(false)
    expect(prismaMock.pedidoSaldoFormulaConfig.findUnique).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-A' },
    })
  })

  it('retorna default quando não há registro salvo', async () => {
    const prismaMock = {
      pedidoSaldoFormulaConfig: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    }

    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-A')

    expect(res.status).toBe(200)
    expect(res.body.data.formula_expressao).toBe(FORMULA_DEFAULT)
    expect(res.body.data.is_default).toBe(true)
  })

  it('retorna 400 sem x-tenant-id', async () => {
    const app = criarApp({}, { semTenantId: true })
    const res = await request(app)
      .get('/api/v1/pedidos/configuracoes/saldo-formula')

    expect(res.status).toBe(400)
  })

  it('tenant isolation: findUnique é chamado com o tenant exato do header', async () => {
    const findUnique = vi.fn().mockResolvedValue(null)
    const prismaMock = { pedidoSaldoFormulaConfig: { findUnique } }

    const app = criarApp(prismaMock)
    await request(app)
      .get('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-outro-workspace')

    expect(findUnique).toHaveBeenCalledWith({ where: { tenant_id: 'tenant-outro-workspace' } })
  })
})

// ── PUT /saldo-formula ────────────────────────────────────────────────────────

describe('PUT /api/v1/pedidos/configuracoes/saldo-formula', () => {
  it('salva fórmula válida via upsert', async () => {
    const upsertFn = vi.fn().mockResolvedValue({
      id: 'sf-001',
      tenant_id: 'tenant-A',
      formula_expressao: FORMULA_CUSTOM,
    })
    const prismaMock = {
      pedidoSaldoFormulaConfig: { upsert: upsertFn },
    }

    const app = criarApp(prismaMock)
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-A')
      .send({ formula_expressao: FORMULA_CUSTOM })

    expect(res.status).toBe(200)
    expect(res.body.data.formula_expressao).toBe(FORMULA_CUSTOM)
    expect(res.body.data.is_default).toBe(false)
    expect(upsertFn).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-A' },
      create: { tenant_id: 'tenant-A', formula_expressao: FORMULA_CUSTOM },
      update: { formula_expressao: FORMULA_CUSTOM },
    })
  })

  it('aceita fórmula com SE() e parênteses', async () => {
    const formula = 'SE(quantidade_total_inicial_pedido > 100, quantidade_total_inicial_pedido - quantidade_transferida_total, 0)'
    const prismaMock = {
      pedidoSaldoFormulaConfig: {
        upsert: vi.fn().mockResolvedValue({ id: 'sf-1', tenant_id: 'tenant-A', formula_expressao: formula }),
      },
    }
    const app = criarApp(prismaMock)
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-A')
      .send({ formula_expressao: formula })

    expect(res.status).toBe(200)
    expect(res.body.data.formula_expressao).toBe(formula)
  })

  it('rejeita fórmula com sintaxe inválida (operador duplo)', async () => {
    const upsertFn = vi.fn()
    const prismaMock = {
      pedidoSaldoFormulaConfig: { upsert: upsertFn },
    }

    const app = criarApp(prismaMock)
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-A')
      .send({ formula_expressao: 'a + + b' })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/Formula invalida/i)
    // Upsert NUNCA foi chamado — validação bloqueou
    expect(upsertFn).not.toHaveBeenCalled()
  })

  it('rejeita fórmula com caractere inválido', async () => {
    const upsertFn = vi.fn()
    const app = criarApp({ pedidoSaldoFormulaConfig: { upsert: upsertFn } })
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-A')
      .send({ formula_expressao: 'a @ b' })

    expect(res.status).toBe(400)
    expect(upsertFn).not.toHaveBeenCalled()
  })

  it('rejeita payload sem formula_expressao', async () => {
    const app = criarApp({ pedidoSaldoFormulaConfig: { upsert: vi.fn() } })
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-A')
      .send({})

    expect(res.status).toBe(400)
  })

  it('rejeita formula_expressao vazia (min 1 char)', async () => {
    const app = criarApp({ pedidoSaldoFormulaConfig: { upsert: vi.fn() } })
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-A')
      .send({ formula_expressao: '' })

    expect(res.status).toBe(400)
  })

  it('rejeita sem x-tenant-id', async () => {
    const app = criarApp({ pedidoSaldoFormulaConfig: { upsert: vi.fn() } }, { semTenantId: true })
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/saldo-formula')
      .send({ formula_expressao: FORMULA_CUSTOM })

    expect(res.status).toBe(400)
  })
})

// ── DELETE /saldo-formula ─────────────────────────────────────────────────────

describe('DELETE /api/v1/pedidos/configuracoes/saldo-formula', () => {
  it('apaga registro do tenant e retorna default', async () => {
    const deleteManyFn = vi.fn().mockResolvedValue({ count: 1 })
    const prismaMock = {
      pedidoSaldoFormulaConfig: { deleteMany: deleteManyFn },
    }

    const app = criarApp(prismaMock)
    const res = await request(app)
      .delete('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-A')

    expect(res.status).toBe(200)
    expect(res.body.data.formula_expressao).toBe(FORMULA_DEFAULT)
    expect(res.body.data.is_default).toBe(true)
    expect(deleteManyFn).toHaveBeenCalledWith({ where: { tenant_id: 'tenant-A' } })
  })

  it('DELETE é idempotente — funciona mesmo sem registro', async () => {
    const prismaMock = {
      pedidoSaldoFormulaConfig: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    }
    const app = criarApp(prismaMock)
    const res = await request(app)
      .delete('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-A')

    expect(res.status).toBe(200)
    expect(res.body.data.is_default).toBe(true)
  })

  it('rejeita sem x-tenant-id', async () => {
    const app = criarApp({ pedidoSaldoFormulaConfig: { deleteMany: vi.fn() } }, { semTenantId: true })
    const res = await request(app)
      .delete('/api/v1/pedidos/configuracoes/saldo-formula')

    expect(res.status).toBe(400)
  })

  it('tenant isolation: delete é chamado com o tenant exato', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 })
    const prismaMock = { pedidoSaldoFormulaConfig: { deleteMany } }

    const app = criarApp(prismaMock)
    await request(app)
      .delete('/api/v1/pedidos/configuracoes/saldo-formula')
      .set('x-tenant-id', 'tenant-outro-workspace')

    expect(deleteMany).toHaveBeenCalledWith({ where: { tenant_id: 'tenant-outro-workspace' } })
  })
})
