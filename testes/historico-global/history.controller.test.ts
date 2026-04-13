// testes/historico-global/history.controller.test.ts
// Testes de integração dos endpoints de logs.
// Prisma e AuditService são mockados — sem banco real.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

// ── Mocks ─────────────────────────────────────────────────────────

vi.mock(
  '../../servicos-global/tenant/historico-global/server/services/audit.service.js',
  () => ({ AuditService: { log: vi.fn().mockResolvedValue(undefined) } })
)

vi.mock(
  '../../servicos-global/tenant/historico-global/server/lib/visibility.js',
  () => ({
    buildVisibilityFilter: vi.fn().mockReturnValue({ tenant_id: 'tenant-test' }),
    extractAuthUser: vi.fn().mockReturnValue({ id: 'user-1', role: 'MASTER', tenant_id: 'tenant-test' }),
  })
)

const mockPrisma = {
  historyLog: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
}

vi.mock(
  '../../servicos-global/tenant/historico-global/server/controllers/history.controller.js',
  async (importOriginal) => {
    // Re-exportamos os controllers originais, mas o Prisma já está mockado
    return importOriginal()
  }
)

vi.mock('../../servicos-global/tenant/generated/index.js', () => ({
  PrismaClient: vi.fn().mockImplementation(function() { return mockPrisma }),
  Prisma: {},
}))

// ── App de teste ──────────────────────────────────────────────────

async function buildApp() {
  const { ingestLog, listLogs, getLogById, exportLogs } = await import(
    '../../servicos-global/tenant/historico-global/server/controllers/history.controller.js'
  )
  const { errorHandler } = await import(
    '../../servicos-global/tenant/historico-global/server/lib/errors.js'
  )

  const app = express()
  app.use(express.json())

  // Injeta tenant_id em todos os requests de teste
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.headers['x-tenant-id'] = 'tenant-test'
    next()
  })

  app.post('/logs', ingestLog)
  app.get('/logs/export', exportLogs)
  app.get('/logs', listLogs)
  app.get('/logs/:id', getLogById)
  app.use(errorHandler)

  return app
}

// ── Testes ────────────────────────────────────────────────────────

describe('POST /logs — ingestLog', () => {
  it('aceita payload válido e retorna 202', async () => {
    const app = await buildApp()
    const res = await request(app).post('/logs').send({
      actor_type: 'USER',
      actor_id: 'user-1',
      actor_name: 'João',
      module: 'pedido',
      resource_type: 'Pedido',
      action: 'CREATE',
      action_detail: 'Criou pedido #1',
    })
    expect(res.status).toBe(202)
    expect(res.body.accepted).toBe(true)
  })

  it('retorna 422 para payload inválido', async () => {
    const app = await buildApp()
    const res = await request(app).post('/logs').send({
      actor_type: 'INVALIDO',
      actor_id: '',
    })
    expect(res.status).toBe(422)
  })

  it('retorna 401 sem tenant_id', async () => {
    const { ingestLog } = await import(
      '../../servicos-global/tenant/historico-global/server/controllers/history.controller.js'
    )
    const { errorHandler } = await import(
      '../../servicos-global/tenant/historico-global/server/lib/errors.js'
    )
    const app = express()
    app.use(express.json())
    app.post('/logs', ingestLog)
    app.use(errorHandler)

    const res = await request(app).post('/logs').send({
      actor_type: 'USER',
      actor_id: 'u1',
      actor_name: 'Test',
      module: 'mod',
      resource_type: 'res',
      action: 'ACT',
      action_detail: 'detail',
    })
    expect(res.status).toBe(401)
  })
})

describe('GET /logs — listLogs', () => {
  beforeEach(() => {
    mockPrisma.historyLog.findMany.mockResolvedValue([
      {
        id: 'log-1',
        created_at: new Date('2026-03-01T10:00:00Z'),
        tenant_id: 'tenant-test',
        actor_type: 'USER',
        actor_id: 'user-1',
        actor_name: 'João',
        module: 'pedido',
        resource_type: 'Pedido',
        action: 'CREATE',
        action_detail: 'Criou pedido',
        status: 'SUCCESS',
        integrity_hash: 'abc123',
      },
    ])
  })

  it('retorna lista de logs com meta', async () => {
    const app = await buildApp()
    const res = await request(app).get('/logs')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.meta).toBeDefined()
    expect(res.body.meta).toHaveProperty('hasMore')
  })

  it('retorna 422 para limit inválido', async () => {
    const app = await buildApp()
    const res = await request(app).get('/logs?limit=999')
    expect(res.status).toBe(422)
  })

  it('usa cursor para paginação', async () => {
    mockPrisma.historyLog.findMany.mockResolvedValue([])
    const app = await buildApp()
    const res = await request(app).get('/logs?cursor=2026-03-01T00:00:00.000Z')
    expect(res.status).toBe(200)
  })

  it('hasMore=false quando retorna exatamente limit', async () => {
    // Retorna 50 itens (igual ao limit padrão) → hasMore false
    mockPrisma.historyLog.findMany.mockResolvedValue(
      Array.from({ length: 50 }, (_, i) => ({
        id: `log-${i}`,
        created_at: new Date(),
        tenant_id: 'tenant-test',
        actor_type: 'USER',
        actor_id: 'u1',
        actor_name: 'Test',
        module: 'mod',
        resource_type: 'res',
        action: 'ACT',
        action_detail: 'detail',
        status: 'SUCCESS',
        integrity_hash: 'hash',
      }))
    )
    const app = await buildApp()
    const res = await request(app).get('/logs')
    expect(res.body.meta.hasMore).toBe(false)
  })

  it('hasMore=true quando retorna limit+1 itens', async () => {
    mockPrisma.historyLog.findMany.mockResolvedValue(
      Array.from({ length: 51 }, (_, i) => ({
        id: `log-${i}`,
        created_at: new Date(),
        tenant_id: 'tenant-test',
        actor_type: 'USER',
        actor_id: 'u1',
        actor_name: 'Test',
        module: 'mod',
        resource_type: 'res',
        action: 'ACT',
        action_detail: 'detail',
        status: 'SUCCESS',
        integrity_hash: 'hash',
      }))
    )
    const app = await buildApp()
    const res = await request(app).get('/logs')
    expect(res.body.meta.hasMore).toBe(true)
    expect(res.body.data).toHaveLength(50)
  })
})

describe('GET /logs/:id — getLogById', () => {
  it('retorna o log quando encontrado', async () => {
    const log = {
      id: 'log-abc',
      created_at: new Date(),
      tenant_id: 'tenant-test',
      actor_type: 'USER',
      actor_id: 'u1',
      actor_name: 'João',
      module: 'pedido',
      resource_type: 'Pedido',
      action: 'CREATE',
      action_detail: 'Detalhe',
      status: 'SUCCESS',
      integrity_hash: 'xyz',
    }
    mockPrisma.historyLog.findFirst.mockResolvedValue(log)

    const app = await buildApp()
    const res = await request(app).get('/logs/log-abc')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('log-abc')
  })

  it('retorna 404 quando log não existe', async () => {
    mockPrisma.historyLog.findFirst.mockResolvedValue(null)
    const app = await buildApp()
    const res = await request(app).get('/logs/inexistente')
    expect(res.status).toBe(404)
  })
})

describe('GET /logs/export — exportLogs', () => {
  it('retorna CSV para menos de 10k registros', async () => {
    mockPrisma.historyLog.count.mockResolvedValue(5)
    mockPrisma.historyLog.findMany.mockResolvedValue([
      {
        id: 'log-1',
        created_at: new Date('2026-01-01T00:00:00Z'),
        tenant_id: 'tenant-test',
        actor_type: 'USER',
        actor_id: 'user-1',
        actor_name: 'João',
        actor_ip: null,
        module: 'pedido',
        resource_type: 'Pedido',
        resource_id: null,
        action: 'CREATE',
        action_detail: 'Criou pedido',
        status: 'SUCCESS',
      },
    ])
    const app = await buildApp()
    const res = await request(app).get('/logs/export?format=csv')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/csv')
  })

  it('retorna JSON quando format=json', async () => {
    mockPrisma.historyLog.count.mockResolvedValue(2)
    mockPrisma.historyLog.findMany.mockResolvedValue([])
    const app = await buildApp()
    const res = await request(app).get('/logs/export?format=json')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('application/json')
  })

  it('retorna 202 para mais de 10k registros (background job)', async () => {
    mockPrisma.historyLog.count.mockResolvedValue(15_000)
    const app = await buildApp()
    const res = await request(app).get('/logs/export')
    expect(res.status).toBe(202)
    expect(res.body.count).toBe(15_000)
  })
})
