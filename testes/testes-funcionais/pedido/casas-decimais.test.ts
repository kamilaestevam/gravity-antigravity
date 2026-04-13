// @vitest-environment node
/**
 * Testes funcionais — Casas Decimais (casas-decimais)
 *
 * Endpoint base: /api/v1/pedidos/configuracoes/casas-decimais
 *
 * Cobre:
 *   GET /casas-decimais          Retorna config atual (ou defaults se não existir)
 *   PUT /casas-decimais          Salvar config + retornar auditoria
 *   PUT /casas-decimais confirmar:true  Salva + dispara job
 *   Validação Zod: campo fora do range → 400
 *   Tenant isolation: tenant-A não acessa dados do tenant-B
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { type Request, type Response, type NextFunction } from 'express'
import { casasDecimaisRouter } from '../../../produto/pedido/server/src/routes/casasDecimais.js'

// ── Setup ─────────────────────────────────────────────────────────────────────

function criarApp(prismaMock: unknown, opts: { semTenantId?: boolean } = {}) {
  const app = express()
  app.use(express.json())

  app.use((req, _res, next) => {
    ;(req as any).prisma = prismaMock
    if (!opts.semTenantId) req.headers['x-tenant-id'] = req.headers['x-tenant-id'] || 'tenant-A'
    next()
  })

  app.use('/api/v1/pedidos/configuracoes', casasDecimaisRouter)

  app.use((err: { statusCode?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message } })
  })

  return app
}

const PAYLOAD_VALIDO = {
  valor_total_pedido:              2,
  quantidade_total_inicial_pedido: 2,
  quantidade_pronta_pedido_total:  2,
  saldo_itens_do_pedido:           2,
  quantidade_transferida_total:    2,
  quantidade_cancelada_total_pedido: 2,
  peso_liquido_total_pedido:       3,
  peso_bruto_total_pedido:         3,
  cubagem_total_pedido:            3,
}

// ── GET /casas-decimais ───────────────────────────────────────────────────────

describe('GET /api/v1/pedidos/configuracoes/casas-decimais', () => {
  it('retorna config existente do tenant', async () => {
    const registro = { id: 'cfg-001', tenant_id: 'tenant-A', ...PAYLOAD_VALIDO }
    const prismaMock = {
      pedidoCasasDecimaisConfig: {
        findUnique: vi.fn().mockResolvedValue(registro),
      },
    }

    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')

    expect(res.status).toBe(200)
    expect(res.body.data.valor_total_pedido).toBe(2)
    expect(prismaMock.pedidoCasasDecimaisConfig.findUnique).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-A' },
    })
  })

  it('retorna defaults quando config não existe', async () => {
    const prismaMock = {
      pedidoCasasDecimaisConfig: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    }

    const app = criarApp(prismaMock)
    const res = await request(app)
      .get('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')

    expect(res.status).toBe(200)
    // Defaults: valor=2, peso=3, cubagem=3
    expect(res.body.data.peso_liquido_total_pedido).toBe(3)
    expect(res.body.data.valor_total_pedido).toBe(2)
  })

  it('retorna 400 sem x-tenant-id', async () => {
    const app = criarApp({}, { semTenantId: true })
    const res = await request(app)
      .get('/api/v1/pedidos/configuracoes/casas-decimais')

    expect(res.status).toBe(400)
  })
})

// ── PUT /casas-decimais ───────────────────────────────────────────────────────

describe('PUT /api/v1/pedidos/configuracoes/casas-decimais', () => {
  it('salva config e retorna auditoria', async () => {
    const registro = { id: 'cfg-001', tenant_id: 'tenant-A', ...PAYLOAD_VALIDO }
    const prismaMock = {
      pedidoCasasDecimaisConfig: {
        upsert: vi.fn().mockResolvedValue(registro),
      },
      pedido: {
        count: vi.fn().mockResolvedValue(42),
      },
      pedidoItem: {
        count: vi.fn().mockResolvedValue(150),
      },
    }

    const app = criarApp(prismaMock)
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send(PAYLOAD_VALIDO)

    expect(res.status).toBe(200)
    expect(res.body.auditoria.total_pedidos).toBe(42)
    expect(res.body.auditoria.total_itens).toBe(150)
    expect(res.body.auditoria.migracao_iniciada).toBe(false)
  })

  it('dispara migração quando confirmar=true', async () => {
    const registro = { id: 'cfg-001', tenant_id: 'tenant-A', ...PAYLOAD_VALIDO }
    const prismaMock = {
      pedidoCasasDecimaisConfig: {
        upsert: vi.fn().mockResolvedValue(registro),
      },
      pedido: {
        count:   vi.fn().mockResolvedValue(5),
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      pedidoItem: {
        count: vi.fn().mockResolvedValue(10),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    }

    const app = criarApp(prismaMock)
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send({ ...PAYLOAD_VALIDO, confirmar: true })

    expect(res.status).toBe(200)
    expect(res.body.auditoria.migracao_iniciada).toBe(true)
  })

  it('retorna 400 para campo com valor fora do range', async () => {
    const app = criarApp({})
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send({ ...PAYLOAD_VALIDO, valor_total_pedido: 10 }) // max é 6

    expect(res.status).toBe(400)
  })

  it('retorna 400 para campo com valor negativo', async () => {
    const app = criarApp({})
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send({ ...PAYLOAD_VALIDO, peso_liquido_total_pedido: -1 })

    expect(res.status).toBe(400)
  })

  it('retorna 400 para campo ausente no payload', async () => {
    const app = criarApp({})
    const { valor_total_pedido: _removed, ...payloadParcial } = PAYLOAD_VALIDO
    const res = await request(app)
      .put('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
      .send(payloadParcial)

    expect(res.status).toBe(400)
  })
})

// ── Tenant isolation ──────────────────────────────────────────────────────────

describe('Tenant isolation', () => {
  it('tenant-B não acessa config do tenant-A', async () => {
    const prismaMock = {
      pedidoCasasDecimaisConfig: {
        // Retorna null para tenant-B (sem dados)
        findUnique: vi.fn().mockImplementation(({ where }: { where: { tenant_id: string } }) => {
          if (where.tenant_id === 'tenant-A') return Promise.resolve({ id: 'cfg-001', ...PAYLOAD_VALIDO })
          return Promise.resolve(null)
        }),
      },
    }

    const app = express()
    app.use(express.json())
    app.use((req, _res, next) => {
      ;(req as any).prisma = prismaMock
      next()
    })
    app.use('/api/v1/pedidos/configuracoes', casasDecimaisRouter)
    app.use((err: { statusCode?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.statusCode || 500).json({ error: { message: err.message } })
    })

    // tenant-A tem config
    const resA = await request(app)
      .get('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-A')
    expect(resA.status).toBe(200)
    expect(resA.body.data.id).toBe('cfg-001')

    // tenant-B recebe defaults (sem dados próprios)
    const resB = await request(app)
      .get('/api/v1/pedidos/configuracoes/casas-decimais')
      .set('x-tenant-id', 'tenant-B')
    expect(resB.status).toBe(200)
    expect(resB.body.data.id).toBeUndefined() // defaults não têm id
  })
})
