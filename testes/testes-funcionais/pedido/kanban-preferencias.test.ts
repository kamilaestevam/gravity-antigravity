// @vitest-environment node
/**
 * Testes funcionais — Kanban Preferências (kanban-preferencias)
 *
 * Endpoint base: /api/v1/pedidos/kanban/preferencias
 *
 * Cobre:
 *   GET    /preferencias          Buscar preferências do usuário (retorna null se não existir)
 *   PUT    /preferencias          Salvar (upsert) preferências com validação Zod
 *   DELETE /preferencias          Restaurar padrão (remove registro)
 *
 *   Validação: limite por aba (pedido:10, quantidades:6, datas:8)
 *   Validação: payload inválido → 400
 *   Tenant isolation: tenant-A não acessa dados do tenant-B
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { kanbanPreferenciasRouter } from '../../../produto/pedido/server/src/routes/kanbanPreferencias.js'

// ── Setup ─────────────────────────────────────────────────────────────────────

function criarApp(prismaMock: unknown, opts: { semTenantId?: boolean; semUserId?: boolean } = {}) {
  const app = express()
  app.use(express.json())

  app.use((req, _res, next) => {
    ;(req as any).prisma = prismaMock
    if (!opts.semTenantId) req.headers['x-tenant-id'] = req.headers['x-tenant-id'] || 'tenant-A'
    if (!opts.semUserId)   req.headers['x-user-id']   = req.headers['x-user-id']   || 'user-001'
    next()
  })

  app.use('/api/v1/pedidos/kanban', kanbanPreferenciasRouter)

  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode || 500).json({ error: { message: err.message } })
  })

  return app
}

// ── Mocks base ────────────────────────────────────────────────────────────────

function mkPreferencias(overrides = {}) {
  return {
    id: 'kbp-001',
    tenant_id: 'tenant-A',
    user_id: 'user-001',
    preferencias: {
      abas: [
        {
          aba: 'pedido',
          campos: [
            { campo: 'numero_pedido', label: 'Número', visivel: true, ordem: 0 },
            { campo: 'exportador_nome', label: 'Exportador', visivel: true, ordem: 1 },
          ],
        },
        {
          aba: 'quantidades',
          campos: [
            { campo: 'quantidade_total_inicial_pedido', label: 'Qtd Inicial', visivel: true, ordem: 0 },
          ],
        },
        {
          aba: 'datas',
          campos: [
            { campo: 'data_abertura_pedido', label: 'Abertura', visivel: true, ordem: 0 },
          ],
        },
      ],
    },
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }
}

function criarPrismaMock() {
  const registro = mkPreferencias()

  return {
    kanbanPreferencias: {
      findFirst: vi.fn().mockResolvedValue(registro),
      upsert: vi.fn().mockResolvedValue(registro),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  }
}

// ── GET /kanban/preferencias ─────────────────────────────────────────────────

describe('GET /api/v1/pedidos/kanban/preferencias', () => {
  it('deve retornar preferencias do usuario quando existem', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .set('x-user-id', 'user-001')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('abas')
    expect(prisma.kanbanPreferencias.findFirst).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-A', user_id: 'user-001' },
    })
  })

  it('deve retornar data: null quando usuario nao tem preferencias', async () => {
    const prisma = criarPrismaMock()
    prisma.kanbanPreferencias.findFirst.mockResolvedValue(null)
    const app = criarApp(prisma)

    const res = await request(app)
      .get('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .set('x-user-id', 'user-001')

    expect(res.status).toBe(200)
    expect(res.body.data).toBeNull()
  })

  it('deve retornar 400 quando x-tenant-id esta ausente', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma, { semTenantId: true })

    const res = await request(app)
      .get('/api/v1/pedidos/kanban/preferencias')

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/tenant-id/i)
  })

  it('deve isolar por tenant — busca apenas do tenant correto', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .get('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-B')
      .set('x-user-id', 'user-999')

    expect(prisma.kanbanPreferencias.findFirst).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-B', user_id: 'user-999' },
    })
  })
})

// ── PUT /kanban/preferencias ──────────────────────────────────────────────────

describe('PUT /api/v1/pedidos/kanban/preferencias', () => {
  const payloadValido = {
    abas: [
      {
        aba: 'pedido',
        campos: [
          { campo: 'numero_pedido', label: 'Número', visivel: true, ordem: 0 },
        ],
      },
      {
        aba: 'quantidades',
        campos: [],
      },
      {
        aba: 'datas',
        campos: [],
      },
    ],
  }

  it('deve salvar (upsert) preferencias validas', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .set('x-user-id', 'user-001')
      .send(payloadValido)

    expect(res.status).toBe(200)
    expect(prisma.kanbanPreferencias.upsert).toHaveBeenCalledOnce()
    expect(prisma.kanbanPreferencias.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenant_id_user_id: { tenant_id: 'tenant-A', user_id: 'user-001' } },
      }),
    )
  })

  it('deve retornar 400 para payload sem abas', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .send({})

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 para aba com nome inválido', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .send({
        abas: [{ aba: 'invalida', campos: [] }],
      })

    expect(res.status).toBe(400)
  })

  it('deve rejeitar aba pedido com mais de 10 campos', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const camposDemais = Array.from({ length: 11 }, (_, i) => ({
      campo: `campo_${i}`,
      label: `Campo ${i}`,
      visivel: true,
      ordem: i,
    }))

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .send({
        abas: [{ aba: 'pedido', campos: camposDemais }],
      })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/limite/i)
  })

  it('deve rejeitar aba quantidades com mais de 6 campos', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const camposDemais = Array.from({ length: 7 }, (_, i) => ({
      campo: `quantidade_${i}`,
      label: `Qtd ${i}`,
      visivel: true,
      ordem: i,
    }))

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .send({
        abas: [{ aba: 'quantidades', campos: camposDemais }],
      })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/limite/i)
  })

  it('deve rejeitar aba datas com mais de 8 campos', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const camposDemais = Array.from({ length: 9 }, (_, i) => ({
      campo: `data_${i}`,
      label: `Data ${i}`,
      visivel: true,
      ordem: i,
    }))

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .send({
        abas: [{ aba: 'datas', campos: camposDemais }],
      })

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/limite/i)
  })

  it('deve aceitar aba pedido com exatamente 10 campos (no limite)', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const campos10 = Array.from({ length: 10 }, (_, i) => ({
      campo: `campo_${i}`,
      label: `Campo ${i}`,
      visivel: true,
      ordem: i,
    }))

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .send({
        abas: [{ aba: 'pedido', campos: campos10 }],
      })

    expect(res.status).toBe(200)
  })

  it('deve retornar 400 quando campo.visivel não é boolean', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .send({
        abas: [
          {
            aba: 'pedido',
            campos: [{ campo: 'numero_pedido', label: 'Número', visivel: 'sim', ordem: 0 }],
          },
        ],
      })

    expect(res.status).toBe(400)
  })

  it('deve retornar 400 sem x-tenant-id', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma, { semTenantId: true })

    const res = await request(app)
      .put('/api/v1/pedidos/kanban/preferencias')
      .send(payloadValido)

    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/tenant-id/i)
  })
})

// ── DELETE /kanban/preferencias ───────────────────────────────────────────────

describe('DELETE /api/v1/pedidos/kanban/preferencias', () => {
  it('deve restaurar padrão (deleteMany) e retornar restaurado: true', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    const res = await request(app)
      .delete('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .set('x-user-id', 'user-001')

    expect(res.status).toBe(200)
    expect(res.body.data.restaurado).toBe(true)
    expect(prisma.kanbanPreferencias.deleteMany).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-A', user_id: 'user-001' },
    })
  })

  it('deve deletar apenas do tenant correto (tenant isolation)', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma)

    await request(app)
      .delete('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-B')
      .set('x-user-id', 'user-999')

    expect(prisma.kanbanPreferencias.deleteMany).toHaveBeenCalledWith({
      where: { tenant_id: 'tenant-B', user_id: 'user-999' },
    })
    // Jamais com tenant-A
    expect(prisma.kanbanPreferencias.deleteMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenant_id: 'tenant-A' }) }),
    )
  })

  it('deve retornar 400 sem x-tenant-id', async () => {
    const prisma = criarPrismaMock()
    const app = criarApp(prisma, { semTenantId: true })

    const res = await request(app).delete('/api/v1/pedidos/kanban/preferencias')

    expect(res.status).toBe(400)
  })

  it('deve funcionar mesmo se nao havia registro (deleteMany count 0)', async () => {
    const prisma = criarPrismaMock()
    prisma.kanbanPreferencias.deleteMany.mockResolvedValue({ count: 0 })
    const app = criarApp(prisma)

    const res = await request(app)
      .delete('/api/v1/pedidos/kanban/preferencias')
      .set('x-tenant-id', 'tenant-A')
      .set('x-user-id', 'user-sem-prefs')

    expect(res.status).toBe(200)
    expect(res.body.data.restaurado).toBe(true)
  })
})
