// @vitest-environment node
/**
 * Testes funcionais — Dashboard / config.routes
 * Cobre CRUD de DashboardConfig:
 *   GET /api/v1/dashboard/configs
 *   POST /api/v1/dashboard/configs
 *   GET /api/v1/dashboard/configs/:id
 *   PUT /api/v1/dashboard/configs/:id
 *   DELETE /api/v1/dashboard/configs/:id
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { type Request, type Response, type NextFunction } from 'express'

// ---------------------------------------------------------------------------
// Mocks — devem vir antes do import do router
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

import { configRouter } from '../../../servicos-global/tenant/dashboard/server/routes/config.routes.js'

// ---------------------------------------------------------------------------
// Tipos auxiliares
// ---------------------------------------------------------------------------

interface MockDashboardConfig {
  dashboardConfig: {
    findMany: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
    updateMany: ReturnType<typeof vi.fn>
  }
  dashboardWidget: {
    deleteMany: ReturnType<typeof vi.fn>
  }
}

// ---------------------------------------------------------------------------
// buildApp helper
// ---------------------------------------------------------------------------

function buildApp(overrides: Partial<MockDashboardConfig> = {}) {
  const app = express()
  app.use(express.json())

  // Middleware que injeta auth + prisma mockado
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as Request & { auth: unknown }).auth = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      permissions: ['dashboard:read', 'dashboard:write'],
    }
    ;(req as Request & { prisma: unknown }).prisma = {
      dashboardConfig: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        ...(overrides.dashboardConfig ?? {}),
      },
      dashboardWidget: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        ...(overrides.dashboardWidget ?? {}),
      },
    }
    next()
  })

  app.use('/api/v1/dashboard/configs', configRouter)

  // Error handler
  app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message, code: (err as Error & { code?: string }).code })
  })

  return app
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleConfig = {
  id: 'cfg-001',
  tenant_id: 'tenant-1',
  user_id: 'user-1',
  name: 'Meu Dashboard',
  mode: 'GENERAL' as const,
  layout: {},
  filters: {},
  is_default: false,
  product_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  widgets: [],
}

// ---------------------------------------------------------------------------
// GET /
// ---------------------------------------------------------------------------

describe('GET /api/v1/dashboard/configs — listar configs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna lista de configs do usuário', async () => {
    const app = buildApp({
      dashboardConfig: {
        findMany: vi.fn().mockResolvedValue([sampleConfig]),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(1),
        updateMany: vi.fn(),
      },
    })

    const res = await request(app).get('/api/v1/dashboard/configs')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].id).toBe('cfg-001')
  })

  it('200 — retorna array vazio quando não há configs', async () => {
    const app = buildApp()

    const res = await request(app).get('/api/v1/dashboard/configs')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// POST /
// ---------------------------------------------------------------------------

describe('POST /api/v1/dashboard/configs — criar config', () => {
  beforeEach(() => vi.clearAllMocks())

  it('201 — cria config com corpo válido', async () => {
    const created = { ...sampleConfig, is_default: true }

    const app = buildApp({
      dashboardConfig: {
        findMany: vi.fn().mockResolvedValue([]), // existingCount = 0 → shouldBeDefault=true
        findFirst: vi.fn(),
        create: vi.fn().mockResolvedValue(created),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
        updateMany: vi.fn(),
      },
    })

    const res = await request(app)
      .post('/api/v1/dashboard/configs')
      .send({ name: 'Meu Dashboard', mode: 'GENERAL', layout: [] })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data.id).toBe('cfg-001')
  })

  it('400 — retorna erro ao enviar body sem campo obrigatório (mode faltando)', async () => {
    const app = buildApp()

    const res = await request(app)
      .post('/api/v1/dashboard/configs')
      .send({ name: 'Sem mode' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('400 — retorna erro ao enviar mode inválido', async () => {
    const app = buildApp()

    const res = await request(app)
      .post('/api/v1/dashboard/configs')
      .send({ name: 'Inválido', mode: 'INVALIDO' })

    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// GET /:id
// ---------------------------------------------------------------------------

describe('GET /api/v1/dashboard/configs/:id — buscar config por id', () => {
  beforeEach(() => vi.clearAllMocks())

  it('404 — retorna 404 quando config não encontrado', async () => {
    const app = buildApp()

    const res = await request(app).get('/api/v1/dashboard/configs/cfg-inexistente')

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

  it('200 — retorna config com widgets quando encontrado', async () => {
    const configWithWidgets = {
      ...sampleConfig,
      widgets: [
        {
          id: 'wgt-001',
          dashboard_id: 'cfg-001',
          widget_key: 'bid-cambio.saving_total',
          chart_type: 'KPI_CARD',
          title: 'Saving Total',
        },
      ],
    }

    const app = buildApp({
      dashboardConfig: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(configWithWidgets),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(1),
        updateMany: vi.fn(),
      },
    })

    const res = await request(app).get('/api/v1/dashboard/configs/cfg-001')

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('cfg-001')
    expect(res.body.data.widgets).toHaveLength(1)
    expect(res.body.data.widgets[0].chart_type).toBe('KPI_CARD')
  })
})

// ---------------------------------------------------------------------------
// PUT /:id
// ---------------------------------------------------------------------------

describe('PUT /api/v1/dashboard/configs/:id — atualizar config', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 — atualiza layout com sucesso', async () => {
    const updatedConfig = { ...sampleConfig, layout: { cols: 12 } }

    const app = buildApp({
      dashboardConfig: {
        findMany: vi.fn().mockResolvedValue([sampleConfig]),
        findFirst: vi.fn().mockResolvedValue(sampleConfig),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue(updatedConfig),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(1),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    })

    const res = await request(app)
      .put('/api/v1/dashboard/configs/cfg-001')
      .send({ layout: { cols: 12 } })

    expect(res.status).toBe(200)
    expect(res.body.data.layout).toEqual({ cols: 12 })
  })

  it('404 — retorna 404 quando config pertence a outro usuário (não encontrado)', async () => {
    // findFirst retorna null → config de outro user não é visível
    const app = buildApp()

    const res = await request(app)
      .put('/api/v1/dashboard/configs/cfg-outro-user')
      .send({ name: 'Novo Nome' })

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

  it('200 — quando is_default=true remove default dos demais configs', async () => {
    const app = buildApp({
      dashboardConfig: {
        findMany: vi.fn().mockResolvedValue([sampleConfig]),
        findFirst: vi.fn().mockResolvedValue(sampleConfig),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ ...sampleConfig, is_default: true }),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(1),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    })

    const res = await request(app)
      .put('/api/v1/dashboard/configs/cfg-001')
      .send({ is_default: true })

    expect(res.status).toBe(200)
    expect(res.body.data.is_default).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// DELETE /:id
// ---------------------------------------------------------------------------

describe('DELETE /api/v1/dashboard/configs/:id — deletar config', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 — deleta config com sucesso quando é o único', async () => {
    const onlyConfig = { ...sampleConfig, is_default: true }

    const app = buildApp({
      dashboardConfig: {
        findMany: vi.fn().mockResolvedValue([onlyConfig]), // allConfigs = [único]
        findFirst: vi.fn().mockResolvedValue(onlyConfig),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn().mockResolvedValue(onlyConfig),
        count: vi.fn().mockResolvedValue(1),
        updateMany: vi.fn(),
      },
    })

    const res = await request(app).delete('/api/v1/dashboard/configs/cfg-001')

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/deletado/i)
  })

  it('404 — retorna 404 quando config não encontrado', async () => {
    const app = buildApp()

    const res = await request(app).delete('/api/v1/dashboard/configs/cfg-inexistente')

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

  it('400 — não permite deletar config padrão quando há outros configs', async () => {
    const defaultConfig = { ...sampleConfig, is_default: true }
    const otherConfig = { ...sampleConfig, id: 'cfg-002', is_default: false }

    const app = buildApp({
      dashboardConfig: {
        findMany: vi.fn().mockResolvedValue([defaultConfig, otherConfig]),
        findFirst: vi.fn().mockResolvedValue(defaultConfig),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn().mockResolvedValue(2),
        updateMany: vi.fn(),
      },
    })

    const res = await request(app).delete('/api/v1/dashboard/configs/cfg-001')

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/padrão/i)
  })
})
