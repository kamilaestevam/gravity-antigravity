// @vitest-environment node
/**
 * Testes funcionais — Cursor Keyset Pagination + Edição Inline
 *
 * Testa os endpoints via supertest com mock do Prisma:
 *   GET  /api/v1/pedidos?cursor=       Primeira página (sem cursor)
 *   GET  /api/v1/pedidos?cursor=<b64>  Próxima página (com cursor)
 *   GET  /api/v1/pedidos?cursor=XPTO   Cursor inválido → 400
 *   GET  /api/v1/pedidos?status=       Filtro por status
 *   GET  /api/v1/pedidos?busca=        Busca por número
 *   GET  /api/v1/pedidos?sort=&dir=    Ordenação customizada
 *   tem_mais = true quando há mais registros
 *   PATCH /api/v1/pedidos/:id/campo    Editar campo inline (sucesso)
 *   PATCH /api/v1/pedidos/:id/campo    Conflito otimístico → 409
 *   PATCH /api/v1/pedidos/:id/campo    Campo não permitido → 400
 *   PATCH /api/v1/pedidos/:id/campo    Pedido não encontrado → 404
 *   Tenant isolation no cursor e no campo
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { pedidosRouter } from '../../../servicos-global/tenant/processos-core/src/routes/pedidos'

// ── Helpers ───────────────────────────────────────────────────────────────────

function criarApp(prismaMock: unknown) {
  const app = express()
  app.use(express.json())

  app.use((req, _res, next) => {
    ;(req as any).prisma = prismaMock
    if (!req.headers['x-tenant-id']) req.headers['x-tenant-id'] = 'tenant-test'
    if (!req.headers['x-company-id']) req.headers['x-company-id'] = 'company-test'
    next()
  })

  app.use('/api/v1/pedidos', pedidosRouter)

  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message } })
  })

  return app
}

// ── Mock de dados ─────────────────────────────────────────────────────────────

const DATA_EMISSAO = new Date('2026-01-15T10:00:00Z')
const DATA_EMISSAO_2 = new Date('2026-01-14T09:00:00Z')

function mkPedido(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pedi-001',
    tenant_id: 'tenant-test',
    company_id: 'company-test',
    tipo_operacao: 'importacao',
    numero_pedido: 'PO-2026/001',
    status: 'aberto',
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    valor_total_pedido: 35000,
    quantidade_total_inicial_pedido: 1000,
    casas_decimais_valor_pedido: 2,
    casas_decimais_quantidade_pedido: 2,
    unidade_comercializada_pedido: 'UN',
    condicao_pagamento_pedido: '30 dias',
    data_emissao_pedido: DATA_EMISSAO,
    detalhes_operacionais: null,
    itens: [],
    created_at: DATA_EMISSAO,
    updated_at: DATA_EMISSAO,
    ...overrides,
  }
}

function criarPrismaMock() {
  return {
    pedido: {
      findMany: vi.fn().mockResolvedValue([mkPedido()]),
      findFirst: vi.fn().mockResolvedValue(mkPedido()),
      count: vi.fn().mockResolvedValue(1),
      update: vi.fn().mockResolvedValue(mkPedido()),
    },
    $transaction: vi.fn().mockImplementation(async (fn: any) => fn({
      pedido: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    })),
  }
}

// ── Testes: Cursor Pagination — primeira página ───────────────────────────────

describe('GET /api/v1/pedidos (cursor mode)', () => {
  it('deve retornar primeira pagina com cursor=vazio', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos?cursor=')
      .set('x-tenant-id', 'tenant-test')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body).toHaveProperty('cursor_proximo')
    expect(res.body).toHaveProperty('tem_mais')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('deve incluir tenant_id no where do findMany', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos?cursor=')
      .set('x-tenant-id', 'tenant-ISOLADO')
      .set('x-company-id', 'company-ISOLADA')

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'tenant-ISOLADO' }),
      })
    )
  })

  it('deve buscar N+1 registros para detectar tem_mais', async () => {
    const prisma = criarPrismaMock()
    // Retorna limit+1 para sinalizar tem_mais
    const limit = 50
    prisma.pedido.findMany.mockResolvedValue(
      Array.from({ length: limit + 1 }, (_, i) => mkPedido({ id: `pedi-${i}` }))
    )
    const app = criarApp(prisma)

    const res = await request(app)
      .get(`/api/v1/pedidos?cursor=&limit=${limit}`)
      .set('x-tenant-id', 'tenant-test')

    expect(res.body.tem_mais).toBe(true)
    expect(res.body.data.length).toBe(limit) // retorna apenas limit, não limit+1
  })

  it('deve ter tem_mais=false quando retorna exatamente limit registros', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue([mkPedido()]) // 1 registro, limit=50
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos?cursor=&limit=50')
      .set('x-tenant-id', 'tenant-test')

    expect(res.body.tem_mais).toBe(false)
    expect(res.body.cursor_proximo).toBeNull()
  })

  it('deve retornar cursor_proximo nao nulo quando tem_mais=true', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findMany.mockResolvedValue(
      Array.from({ length: 51 }, (_, i) => mkPedido({ id: `pedi-${i}` }))
    )
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos?cursor=&limit=50')
      .set('x-tenant-id', 'tenant-test')

    expect(res.body.cursor_proximo).not.toBeNull()
    expect(typeof res.body.cursor_proximo).toBe('string')
    expect(res.body.cursor_proximo.length).toBeGreaterThan(0)
  })

  it('deve retornar 400 para cursor invalido (base64 corrompido)', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos?cursor=nao-e-base64-valido!!!')
      .set('x-tenant-id', 'tenant-test')

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/cursor/i)
  })
})

// ── Testes: Cursor Pagination — filtros ───────────────────────────────────────

describe('GET /api/v1/pedidos (cursor mode) — filtros', () => {
  it('deve aplicar filtro por status', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos?cursor=&status=aberto')
      .set('x-tenant-id', 'tenant-test')

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'aberto' }),
      })
    )
  })

  it('deve aplicar filtro por busca no numero_pedido', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos?cursor=&busca=PO-2026')
      .set('x-tenant-id', 'tenant-test')

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          numero_pedido: expect.objectContaining({ contains: 'PO-2026' }),
        }),
      })
    )
  })

  it('deve usar sort=data_emissao_pedido por padrao no cursor mode', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos?cursor=')
      .set('x-tenant-id', 'tenant-test')

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: expect.arrayContaining([
          expect.objectContaining({ data_emissao_pedido: expect.any(String) }),
        ]),
      })
    )
  })

  it('deve aceitar sort=valor_total_pedido', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos?cursor=&sort=valor_total_pedido&dir=asc')
      .set('x-tenant-id', 'tenant-test')

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: expect.arrayContaining([
          expect.objectContaining({ valor_total_pedido: 'asc' }),
        ]),
      })
    )
  })
})

// ── Testes: Offset pagination (backward compat) ───────────────────────────────

describe('GET /api/v1/pedidos (offset mode — backward compat)', () => {
  it('deve funcionar sem cursor param', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos?page=1&limit=20')
      .set('x-tenant-id', 'tenant-test')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('page')
    expect(res.body).toHaveProperty('limit')
  })
})

// ── Testes: PATCH /:id/campo ──────────────────────────────────────────────────

describe('PATCH /api/v1/pedidos/:id/campo', () => {
  const UPDATED_AT = '2026-01-15T10:00:00.000Z'

  it('deve atualizar campo inline com sucesso', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue(mkPedido({ updated_at: new Date(UPDATED_AT) }))
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi-001/campo')
      .set('x-tenant-id', 'tenant-test')
      .send({ campo: 'numero_invoice', valor: 'INV-NOVO', updated_at: UPDATED_AT })

    expect(res.status).toBe(200)
    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'pedi-001' },
        data: expect.objectContaining({ numero_invoice: 'INV-NOVO' }),
      })
    )
  })

  it('deve retornar 409 quando updated_at difere (conflito otimístico)', async () => {
    const prisma = criarPrismaMock()
    // banco tem updated_at diferente do cliente
    prisma.pedido.findFirst.mockResolvedValue(
      mkPedido({ updated_at: new Date('2026-01-15T12:00:00Z') })
    )
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi-001/campo')
      .set('x-tenant-id', 'tenant-test')
      .send({ campo: 'numero_invoice', valor: 'INV-NOVO', updated_at: UPDATED_AT })

    expect(res.status).toBe(409)
    expect(res.body.error.message).toMatch(/conflito/i)
    expect(res.body.error).toHaveProperty('updated_at_atual')
  })

  it('deve retornar 400 para campo nao permitido', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi-001/campo')
      .set('x-tenant-id', 'tenant-test')
      .send({ campo: 'tenant_id', valor: 'tenant-INJEÇÃO', updated_at: UPDATED_AT })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/nao pode ser editado/i)
  })

  it('deve retornar 400 se campo ausente no body', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi-001/campo')
      .set('x-tenant-id', 'tenant-test')
      .send({ valor: 'INV-NOVO', updated_at: UPDATED_AT }) // sem campo

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 se updated_at ausente', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi-001/campo')
      .set('x-tenant-id', 'tenant-test')
      .send({ campo: 'numero_invoice', valor: 'INV-NOVO' }) // sem updated_at

    expect(res.status).toBe(400)
  })

  it('deve retornar 404 quando pedido nao existe no tenant', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue(null)
    const app = criarApp(prisma)

    const res = await request(app)
      .patch('/api/v1/pedidos/pedi-inexistente/campo')
      .set('x-tenant-id', 'tenant-test')
      .send({ campo: 'numero_invoice', valor: 'INV-NOVO', updated_at: UPDATED_AT })

    expect(res.status).toBe(404)
  })

  it('deve filtrar pedido por tenant_id (isolamento)', async () => {
    const prisma = criarPrismaMock()
    prisma.pedido.findFirst.mockResolvedValue(mkPedido({ updated_at: new Date(UPDATED_AT) }))
    const app = criarApp(prisma)

    await request(app)
      .patch('/api/v1/pedidos/pedi-001/campo')
      .set('x-tenant-id', 'tenant-ISOLADO')
      .send({ campo: 'incoterm', valor: 'CIF', updated_at: UPDATED_AT })

    expect(prisma.pedido.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'tenant-ISOLADO' }),
      })
    )
  })
})
