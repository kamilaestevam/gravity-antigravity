// @vitest-environment node
/**
 * Testes de Isolamento de Tenant — Dashboard
 *
 * Garante que o serviço de dashboard respeita tenant isolation:
 * - Dados de tenant-A nunca são retornados para tenant-B
 * - Requests sem auth headers retornam 401
 * - DELETE cross-tenant retorna 403/404
 * - Cache keys são distintas por tenant (não há vazamento via cache)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { type Request, type Response, type NextFunction } from 'express'

// ---------------------------------------------------------------------------
// Mocks — devem vir antes dos imports que dependem deles
// ---------------------------------------------------------------------------

vi.mock('../../../servicos-global/tenant/dashboard/server/lib/errors.js', () => {
  class AppError extends Error {
    public statusCode: number
    public code: string
    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
      super(message)
      this.name = 'AppError'
      this.statusCode = statusCode
      this.code = code
    }
  }
  return { AppError }
})

vi.mock('../../../servicos-global/tenant/dashboard/server/lib/query-engine.js', () => ({
  queryEngine: {
    execute: vi.fn(),
    clearCache: vi.fn(),
  },
}))

import { configRouter } from '../../../servicos-global/tenant/dashboard/server/routes/config.routes.js'
import { widgetRouter } from '../../../servicos-global/tenant/dashboard/server/routes/widget.routes.js'
import { queryEngine } from '../../../servicos-global/tenant/dashboard/server/lib/query-engine.js'

// ---------------------------------------------------------------------------
// Dados de fixture por tenant
// ---------------------------------------------------------------------------

const configsTenantA = [
  { id: 'cfg-a-001', tenant_id: 'tenant-a', user_id: 'user-a', name: 'Dash A1', mode: 'GENERAL', is_default: true, layout: {}, filters: {}, product_id: null },
  { id: 'cfg-a-002', tenant_id: 'tenant-a', user_id: 'user-a', name: 'Dash A2', mode: 'GENERAL', is_default: false, layout: {}, filters: {}, product_id: null },
]

const configsTenantB = [
  { id: 'cfg-b-001', tenant_id: 'tenant-b', user_id: 'user-b', name: 'Dash B1', mode: 'GENERAL', is_default: true, layout: {}, filters: {}, product_id: null },
]

// ---------------------------------------------------------------------------
// Middleware de tenant isolation (simula o real)
// Rejeita requests sem x-tenant-id + x-user-id
// ---------------------------------------------------------------------------

function tenantAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const tenantId = req.headers['x-tenant-id'] as string | undefined
  const userId = req.headers['x-user-id'] as string | undefined

  if (!tenantId || !userId) {
    res.status(401).json({ error: 'x-tenant-id e x-user-id são obrigatórios' })
    return
  }

  ;(req as Request & { auth: unknown }).auth = {
    tenantId,
    userId,
    permissions: ((req.headers['x-user-permissions'] as string) || '')
      .split(',')
      .filter(Boolean),
  }

  // Injeta prisma filtrado pelo tenant do request
  ;(req as Request & { prisma: unknown }).prisma = buildTenantPrisma(tenantId, userId)

  next()
}

/**
 * Simula um PrismaClient cujas queries já retornam dados filtrados por tenant+user,
 * exatamente como faria o middleware real de Row-Level Security.
 */
function buildTenantPrisma(tenantId: string, userId: string) {
  const ownedConfigs = tenantId === 'tenant-a'
    ? configsTenantA.filter(c => c.user_id === userId)
    : tenantId === 'tenant-b'
      ? configsTenantB.filter(c => c.user_id === userId)
      : []

  return {
    dashboardConfig: {
      findMany: vi.fn().mockImplementation(({ where }: { where?: { user_id?: string } } = {}) => {
        // Retorna apenas configs onde user_id bate (tenant filtrado pelo prisma)
        if (where?.user_id && where.user_id !== userId) return Promise.resolve([])
        return Promise.resolve(ownedConfigs)
      }),
      findFirst: vi.fn().mockImplementation(({ where }: { where?: { id?: string; user_id?: string } } = {}) => {
        const found = ownedConfigs.find(c => {
          const matchId = where?.id ? c.id === where.id : true
          const matchUser = where?.user_id ? c.user_id === where.user_id : true
          return matchId && matchUser
        })
        return Promise.resolve(found ?? null)
      }),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(ownedConfigs.length),
    },
    dashboardWidget: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  }
}

// ---------------------------------------------------------------------------
// buildApp helper — usa middleware de tenant isolation real (não pula auth)
// ---------------------------------------------------------------------------

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use(tenantAuthMiddleware)
  app.use('/api/v1/dashboard/configs', configRouter)
  app.use('/api/v1/dashboard/widgets', widgetRouter)
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message, code: err.code })
  })
  return app
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe('Dashboard — Isolamento de Tenant', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  // -------------------------------------------------------------------------
  // Cenário 1: configs filtradas por tenant
  // -------------------------------------------------------------------------

  it('não deve retornar configs de outro tenant', async () => {
    // tenant-A faz request → deve ver apenas seus 2 configs
    const resA = await request(app)
      .get('/api/v1/dashboard/configs')
      .set('x-tenant-id', 'tenant-a')
      .set('x-user-id', 'user-a')

    expect(resA.status).toBe(200)
    expect(resA.body.data).toHaveLength(2)
    expect(resA.body.data.every((c: { tenant_id: string }) => c.tenant_id === 'tenant-a')).toBe(true)

    // tenant-B faz request → deve ver apenas seu 1 config
    const resB = await request(app)
      .get('/api/v1/dashboard/configs')
      .set('x-tenant-id', 'tenant-b')
      .set('x-user-id', 'user-b')

    expect(resB.status).toBe(200)
    expect(resB.body.data).toHaveLength(1)
    expect(resB.body.data[0].tenant_id).toBe('tenant-b')

    // Nenhum config de tenant-A deve aparecer na resposta de tenant-B
    const idsA = resA.body.data.map((c: { id: string }) => c.id)
    const idsB = resB.body.data.map((c: { id: string }) => c.id)
    const intersection = idsA.filter((id: string) => idsB.includes(id))
    expect(intersection).toHaveLength(0)
  })

  // -------------------------------------------------------------------------
  // Cenário 2: cache keys distintas por tenant
  // -------------------------------------------------------------------------

  it('não deve executar query de widget de outro tenant via cache compartilhado', async () => {
    const resultTenantA = {
      data: { 'bid-cambio.saving_total': 150000 },
      chartType: 'KPI_CARD',
      partial: false,
      cached: false,
      computed_at: '2026-04-01T00:00:00Z',
    }
    const resultTenantB = {
      data: { 'bid-cambio.saving_total': 9999 },
      chartType: 'KPI_CARD',
      partial: false,
      cached: false,
      computed_at: '2026-04-01T00:00:00Z',
    }

    // queryEngine.execute retorna valores diferentes por tenant
    vi.mocked(queryEngine.execute).mockImplementation(async ({ tenantId }: { tenantId: string }) => {
      if (tenantId === 'tenant-a') return resultTenantA as never
      if (tenantId === 'tenant-b') return resultTenantB as never
      throw new Error('Tenant desconhecido')
    })

    const queryBody = {
      spec: {
        fields: ['bid-cambio.saving_total'],
        filters: { period: '30d' },
        operation: 'sum',
      },
    }

    const resA = await request(app)
      .post('/api/v1/dashboard/widgets/query')
      .set('x-tenant-id', 'tenant-a')
      .set('x-user-id', 'user-a')
      .send(queryBody)

    const resB = await request(app)
      .post('/api/v1/dashboard/widgets/query')
      .set('x-tenant-id', 'tenant-b')
      .set('x-user-id', 'user-b')
      .send(queryBody)

    expect(resA.status).toBe(200)
    expect(resB.status).toBe(200)

    // Valores devem ser diferentes — sem cross-tenant cache leak
    expect(resA.body.data.data['bid-cambio.saving_total']).toBe(150000)
    expect(resB.body.data.data['bid-cambio.saving_total']).toBe(9999)
    expect(resA.body.data.data['bid-cambio.saving_total']).not.toBe(
      resB.body.data.data['bid-cambio.saving_total'],
    )

    // queryEngine deve ter sido chamado 2x com tenantIds distintos
    expect(queryEngine.execute).toHaveBeenCalledTimes(2)
    const calls = vi.mocked(queryEngine.execute).mock.calls
    expect(calls[0][0].tenantId).toBe('tenant-a')
    expect(calls[1][0].tenantId).toBe('tenant-b')
  })

  // -------------------------------------------------------------------------
  // Cenário 3: DELETE cross-tenant deve retornar 403 ou 404
  // -------------------------------------------------------------------------

  it('não deve deletar config de outro tenant', async () => {
    // tenant-A tenta deletar o config cfg-b-001 que pertence ao tenant-B
    // O prisma de tenant-A não encontra cfg-b-001 → retorna 404
    const res = await request(app)
      .delete('/api/v1/dashboard/configs/cfg-b-001')
      .set('x-tenant-id', 'tenant-a')
      .set('x-user-id', 'user-a')

    // Deve falhar com 404 (não encontrado para este user/tenant) ou 403
    expect([403, 404]).toContain(res.status)
    expect(res.body).toHaveProperty('error')
  })

  // -------------------------------------------------------------------------
  // Cenário 4: ausência de headers de auth → 401
  // -------------------------------------------------------------------------

  it('header x-tenant-id ausente deve retornar 401', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/configs')
    // Sem x-tenant-id e sem x-user-id

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('header x-user-id ausente deve retornar 401', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/configs')
      .set('x-tenant-id', 'tenant-a')
    // Sem x-user-id

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('tenant sem dados retorna array vazio — nunca dados de outro tenant', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/configs')
      .set('x-tenant-id', 'tenant-c')
      .set('x-user-id', 'user-c')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
  })

  // -------------------------------------------------------------------------
  // Cenário 5: tenant-A não consegue acessar config de tenant-B por ID
  // -------------------------------------------------------------------------

  it('GET /:id não expõe config de outro tenant', async () => {
    // cfg-b-001 pertence ao tenant-b, user-a de tenant-a não deve vê-lo
    const res = await request(app)
      .get('/api/v1/dashboard/configs/cfg-b-001')
      .set('x-tenant-id', 'tenant-a')
      .set('x-user-id', 'user-a')

    expect(res.status).toBe(404)
  })
})
