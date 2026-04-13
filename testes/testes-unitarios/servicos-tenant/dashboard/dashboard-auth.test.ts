// @vitest-environment node
// Testes de autenticacao do Dashboard — verifica que:
//   1. Requisicoes sem x-tenant-id sao rejeitadas com 401
//   2. Rotas usam req.auth.tenantId (nao query params)
//   3. /kpis retorna dados para o tenant autenticado

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// In-memory mock DB
// ---------------------------------------------------------------------------
const mockFindMany = vi.fn().mockResolvedValue([])
const mockFindFirst = vi.fn().mockResolvedValue(null)
const mockGetCachedKpis = vi.fn().mockReturnValue(null)
const mockSetCachedKpis = vi.fn()

// ---------------------------------------------------------------------------
// Build a self-contained test app that replicates the Dashboard logic
// ---------------------------------------------------------------------------
function createTestApp() {
  const app = express()
  app.use(express.json())

  // Auth middleware (same as servicos-global/tenant/dashboard/server/index.ts)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string | undefined
    const userId = req.headers['x-user-id'] as string | undefined

    if (!tenantId) {
      return res.status(401).json({
        status: 'error',
        message: 'x-tenant-id header is required',
      })
    }

    req.auth = { tenantId, userId: userId ?? '' }
    next()
  })

  // GET /api/v1/dashboard/kpis (replicates routes.ts logic)
  app.get('/api/v1/dashboard/kpis', async (req: Request, res: Response) => {
    const tenant_id = req.auth.tenantId
    const product_id = req.query.product_id as string | undefined

    // Try cache first
    const cached = mockGetCachedKpis(tenant_id, product_id)
    if (cached) {
      return res.json({ source: 'cache', data: cached })
    }

    const whereClause: Record<string, unknown> = { tenant_id }
    if (product_id) whereClause.product_id = product_id

    const snapshots = await mockFindMany({ where: whereClause, orderBy: { snapshot_date: 'desc' } })

    const kpisMap = new Map<string, { name: string; value: number; unit: string; date: unknown }>()
    for (const snap of snapshots) {
      if (!kpisMap.has(snap.metric_name)) {
        kpisMap.set(snap.metric_name, {
          name: snap.metric_name,
          value: snap.value,
          unit: snap.unit,
          date: snap.snapshot_date,
        })
      }
    }

    const latestKpis = Array.from(kpisMap.values())
    mockSetCachedKpis(tenant_id, product_id, latestKpis)

    res.json({ source: 'db', data: latestKpis })
  })

  // GET /api/v1/dashboard/config
  app.get('/api/v1/dashboard/config', async (req: Request, res: Response) => {
    const tenant_id = req.auth.tenantId

    const config = await mockFindFirst({ where: { tenant_id } })
    if (!config) {
      return res.json({ tenant_id, widgets_layout: { default: true }, refresh_rate: 300000 })
    }
    res.json(config)
  })

  return app
}

const app = createTestApp()

beforeEach(() => {
  vi.clearAllMocks()
  mockGetCachedKpis.mockReturnValue(null)
})

// ---------------------------------------------------------------------------
// Suite 1 — Rejeitar requisicoes sem x-tenant-id
// ---------------------------------------------------------------------------

describe('Dashboard auth — rejeitar sem x-tenant-id', () => {
  it('GET /api/v1/dashboard/kpis retorna 401 sem x-tenant-id', async () => {
    const res = await request(app).get('/api/v1/dashboard/kpis')
    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/x-tenant-id/i)
  })

  it('GET /api/v1/dashboard/config retorna 401 sem x-tenant-id', async () => {
    const res = await request(app).get('/api/v1/dashboard/config')
    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/x-tenant-id/i)
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — Rotas usam req.auth.tenantId, nao query params
// ---------------------------------------------------------------------------

describe('Dashboard auth — usa req.auth.tenantId', () => {
  it('GET /kpis ignora tenant_id da query e usa header', async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        metric_name: 'revenue',
        value: 1000,
        unit: 'BRL',
        snapshot_date: new Date(),
      },
    ])

    const res = await request(app)
      .get('/api/v1/dashboard/kpis?tenant_id=invasor-tenant')
      .set('x-tenant-id', 'tenant-correto')
      .set('x-user-id', 'user-1')

    expect(res.status).toBe(200)
    // Prisma deve ter sido chamado com tenant_id do header, nao da query
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'tenant-correto' }),
      })
    )
    // A query param tenant_id nao deve ter sido usada
    expect(mockFindMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'invasor-tenant' }),
      })
    )
  })
})

// ---------------------------------------------------------------------------
// Suite 3 — /kpis retorna dados para tenant autenticado
// ---------------------------------------------------------------------------

describe('Dashboard /kpis — retorna dados', () => {
  it('retorna KPIs do tenant autenticado com source "db"', async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        metric_name: 'revenue',
        value: 5000,
        unit: 'BRL',
        snapshot_date: new Date('2026-01-01'),
      },
      {
        metric_name: 'users',
        value: 42,
        unit: 'count',
        snapshot_date: new Date('2026-01-01'),
      },
    ])

    const res = await request(app)
      .get('/api/v1/dashboard/kpis')
      .set('x-tenant-id', 'tenant-abc')
      .set('x-user-id', 'user-1')

    expect(res.status).toBe(200)
    expect(res.body.source).toBe('db')
    expect(res.body.data).toHaveLength(2)
    expect(res.body.data[0]).toMatchObject({ name: 'revenue', value: 5000 })
    expect(res.body.data[1]).toMatchObject({ name: 'users', value: 42 })
  })
})
