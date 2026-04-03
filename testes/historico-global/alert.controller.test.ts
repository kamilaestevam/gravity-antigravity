// testes/historico-global/alert.controller.test.ts
// Testes de integração dos endpoints de alertas e regras.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// ── Mocks ─────────────────────────────────────────────────────────

const mockPrisma = {
  alertEvent: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  alertRule: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}

vi.mock('../../servicos-global/tenant/generated/index.js', () => ({
  PrismaClient: vi.fn().mockImplementation(function() { return mockPrisma }),
}))

vi.mock(
  '../../servicos-global/tenant/historico-global/server/lib/visibility.js',
  () => ({
    extractAuthUser: vi.fn().mockReturnValue({ id: 'user-1', role: 'MASTER', tenant_id: 'tenant-test' }),
  })
)

async function buildApp() {
  const { listAlerts, updateAlert, listRules, createRule, updateRule, deleteRule } = await import(
    '../../servicos-global/tenant/historico-global/server/controllers/alert.controller.js'
  )
  const { errorHandler } = await import(
    '../../servicos-global/tenant/historico-global/server/lib/errors.js'
  )

  const app = express()
  app.use(express.json())
  app.use((req: any, _res, next) => {
    req.headers['x-tenant-id'] = 'tenant-test'
    next()
  })

  app.get('/alerts', listAlerts)
  app.patch('/alerts/:id', updateAlert)
  app.get('/alert-rules', listRules)
  app.post('/alert-rules', createRule)
  app.put('/alert-rules/:id', updateRule)
  app.delete('/alert-rules/:id', deleteRule)
  app.use(errorHandler)

  return app
}

// ── Alertas ───────────────────────────────────────────────────────

describe('GET /alerts — listAlerts', () => {
  beforeEach(() => {
    mockPrisma.alertEvent.findMany.mockResolvedValue([
      {
        id: 'alert-1',
        tenant_id: 'tenant-test',
        rule_id: 'rule-1',
        actor_type: 'USER',
        actor_id: 'user-1',
        actor_name: 'João',
        module: 'pedido',
        action: 'DELETE',
        event_count: 15,
        window_seconds: 60,
        status: 'PENDING',
        created_at: new Date(),
        rule: { name: 'Ação em massa' },
      },
    ])
  })

  it('retorna lista de alertas', async () => {
    const app = await buildApp()
    const res = await request(app).get('/alerts')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data[0].id).toBe('alert-1')
  })

  it('retorna 401 sem tenant_id', async () => {
    const { listAlerts } = await import(
      '../../servicos-global/tenant/historico-global/server/controllers/alert.controller.js'
    )
    const { errorHandler } = await import(
      '../../servicos-global/tenant/historico-global/server/lib/errors.js'
    )
    const app = express()
    app.use(express.json())
    app.get('/alerts', listAlerts)
    app.use(errorHandler)
    const res = await request(app).get('/alerts')
    expect(res.status).toBe(401)
  })
})

describe('PATCH /alerts/:id — updateAlert', () => {
  it('atualiza status para REVIEWED', async () => {
    mockPrisma.alertEvent.findFirst.mockResolvedValue({ id: 'alert-1', tenant_id: 'tenant-test' })
    mockPrisma.alertEvent.update.mockResolvedValue({
      id: 'alert-1',
      status: 'REVIEWED',
      reviewed_at: new Date(),
    })

    const app = await buildApp()
    const res = await request(app)
      .patch('/alerts/alert-1')
      .send({ status: 'REVIEWED' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('REVIEWED')
  })

  it('retorna 404 para alerta inexistente', async () => {
    mockPrisma.alertEvent.findFirst.mockResolvedValue(null)
    const app = await buildApp()
    const res = await request(app)
      .patch('/alerts/inexistente')
      .send({ status: 'REVIEWED' })
    expect(res.status).toBe(404)
  })

  it('retorna 422 para status inválido', async () => {
    const app = await buildApp()
    const res = await request(app)
      .patch('/alerts/alert-1')
      .send({ status: 'PENDING' })
    expect(res.status).toBe(422)
  })
})

// ── Regras de alerta ──────────────────────────────────────────────

describe('GET /alert-rules — listRules', () => {
  it('retorna lista de regras', async () => {
    mockPrisma.alertRule.findMany.mockResolvedValue([
      { id: 'rule-1', name: 'Ação em massa', enabled: true, tenant_id: null },
    ])
    const app = await buildApp()
    const res = await request(app).get('/alert-rules')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })
})

describe('POST /alert-rules — createRule', () => {
  it('cria regra válida', async () => {
    const rule = { id: 'rule-novo', name: 'Nova regra', enabled: true, tenant_id: 'tenant-test' }
    mockPrisma.alertRule.create.mockResolvedValue(rule)

    const app = await buildApp()
    const res = await request(app)
      .post('/alert-rules')
      .send({ name: 'Nova regra', threshold_count: 10, threshold_window_seconds: 60 })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Nova regra')
  })

  it('retorna 422 para name vazio', async () => {
    const app = await buildApp()
    const res = await request(app).post('/alert-rules').send({ name: '' })
    expect(res.status).toBe(422)
  })
})

describe('PUT /alert-rules/:id — updateRule', () => {
  it('atualiza regra existente', async () => {
    mockPrisma.alertRule.findFirst.mockResolvedValue({ id: 'rule-1', tenant_id: 'tenant-test' })
    mockPrisma.alertRule.update.mockResolvedValue({ id: 'rule-1', name: 'Atualizada', enabled: false })

    const app = await buildApp()
    const res = await request(app)
      .put('/alert-rules/rule-1')
      .send({ name: 'Atualizada', enabled: false })
    expect(res.status).toBe(200)
    expect(res.body.enabled).toBe(false)
  })

  it('retorna 404 para regra inexistente', async () => {
    mockPrisma.alertRule.findFirst.mockResolvedValue(null)
    const app = await buildApp()
    const res = await request(app)
      .put('/alert-rules/inexistente')
      .send({ name: 'X' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /alert-rules/:id — deleteRule', () => {
  it('deleta regra existente e retorna 204', async () => {
    mockPrisma.alertRule.findFirst.mockResolvedValue({ id: 'rule-1', tenant_id: 'tenant-test' })
    mockPrisma.alertRule.delete.mockResolvedValue({})

    const app = await buildApp()
    const res = await request(app).delete('/alert-rules/rule-1')
    expect(res.status).toBe(204)
  })

  it('retorna 404 para regra inexistente', async () => {
    mockPrisma.alertRule.findFirst.mockResolvedValue(null)
    const app = await buildApp()
    const res = await request(app).delete('/alert-rules/inexistente')
    expect(res.status).toBe(404)
  })
})
