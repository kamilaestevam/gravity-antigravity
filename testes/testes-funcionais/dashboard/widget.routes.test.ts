// @vitest-environment node
/**
 * Testes funcionais — Dashboard / widget.routes
 * Cobre:
 *   POST /api/v1/dashboard/widgets/query
 *   POST /api/v1/dashboard/widgets
 *   PUT  /api/v1/dashboard/widgets/:id
 *   DELETE /api/v1/dashboard/widgets/:id
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

import { widgetRouter } from '../../../servicos-global/tenant/dashboard/server/routes/widget.routes.js'
import { queryEngine } from '../../../servicos-global/tenant/dashboard/server/lib/query-engine.js'
import { AppError } from '../../../servicos-global/tenant/dashboard/server/lib/errors.js'

// ---------------------------------------------------------------------------
// Tipos auxiliares
// ---------------------------------------------------------------------------

interface MockPrisma {
  dashboardConfig?: {
    findFirst: ReturnType<typeof vi.fn>
    findMany?: ReturnType<typeof vi.fn>
    create?: ReturnType<typeof vi.fn>
    update?: ReturnType<typeof vi.fn>
    delete?: ReturnType<typeof vi.fn>
    updateMany?: ReturnType<typeof vi.fn>
    count?: ReturnType<typeof vi.fn>
  }
  dashboardWidget?: {
    findFirst: ReturnType<typeof vi.fn>
    create?: ReturnType<typeof vi.fn>
    update?: ReturnType<typeof vi.fn>
    delete?: ReturnType<typeof vi.fn>
    deleteMany?: ReturnType<typeof vi.fn>
  }
}

// ---------------------------------------------------------------------------
// buildApp helper
// ---------------------------------------------------------------------------

function buildApp(prismaOverrides: MockPrisma = {}) {
  const app = express()
  app.use(express.json())

  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as Request & { auth: unknown }).auth = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      permissions: ['dashboard:read', 'dashboard:write'],
    }
    ;(req as Request & { prisma: unknown }).prisma = {
      dashboardConfig: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        count: vi.fn().mockResolvedValue(0),
        ...(prismaOverrides.dashboardConfig ?? {}),
      },
      dashboardWidget: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        ...(prismaOverrides.dashboardWidget ?? {}),
      },
    }
    next()
  })

  app.use('/api/v1/dashboard/widgets', widgetRouter)

  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message, code: err.code })
  })

  return app
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validQueryBody = {
  spec: {
    fields: ['bid-cambio.saving_total'],
    filters: { period: '30d' },
    operation: 'sum',
  },
}

const queryEngineResult = {
  data: { 'bid-cambio.saving_total': 150000 },
  chartType: 'KPI_CARD',
  partial: false,
  cached: false,
  computed_at: '2026-04-01T00:00:00Z',
}

const sampleDashboard = {
  id: 'cfg-001',
  user_id: 'user-1',
  tenant_id: 'tenant-1',
  name: 'Meu Dashboard',
}

const sampleWidget = {
  id: 'wgt-001',
  dashboard_id: 'cfg-001',
  widget_key: 'bid-cambio.saving_total',
  widget_type: 'CATALOG',
  chart_type: 'KPI_CARD',
  title: 'Saving Total',
  query_spec: validQueryBody.spec,
  position: { x: 0, y: 0, w: 4, h: 3 },
  dashboard: sampleDashboard,
}

const createWidgetBody = {
  dashboard_id: 'cfg-001',
  widget_key: 'bid-cambio.saving_total',
  widget_type: 'CATALOG',
  chart_type: 'KPI_CARD',
  title: 'Saving Total',
  query_spec: {
    fields: ['bid-cambio.saving_total'],
    filters: { period: '30d' },
    operation: 'sum',
  },
  position: { x: 0, y: 0, w: 4, h: 3 },
}

// ---------------------------------------------------------------------------
// POST /query
// ---------------------------------------------------------------------------

describe('POST /api/v1/dashboard/widgets/query — executar query', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna WidgetResult do queryEngine', async () => {
    vi.mocked(queryEngine.execute).mockResolvedValue(queryEngineResult as never)
    const app = buildApp()

    const res = await request(app)
      .post('/api/v1/dashboard/widgets/query')
      .send(validQueryBody)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data.chartType).toBe('KPI_CARD')
    expect(res.body.data.data['bid-cambio.saving_total']).toBe(150000)
  })

  it('400 — retorna 400 quando fields array está vazio', async () => {
    const app = buildApp()

    const res = await request(app)
      .post('/api/v1/dashboard/widgets/query')
      .send({ spec: { fields: [], filters: { period: '30d' }, operation: 'sum' } })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('400 — retorna 400 quando fields está ausente', async () => {
    const app = buildApp()

    const res = await request(app)
      .post('/api/v1/dashboard/widgets/query')
      .send({ spec: { filters: { period: '30d' }, operation: 'sum' } })

    expect(res.status).toBe(400)
  })

  it('passa tenantId, userId e spec corretamente ao queryEngine', async () => {
    vi.mocked(queryEngine.execute).mockResolvedValue(queryEngineResult as never)
    const app = buildApp()

    await request(app)
      .post('/api/v1/dashboard/widgets/query')
      .send(validQueryBody)

    expect(queryEngine.execute).toHaveBeenCalledOnce()
    const callArgs = vi.mocked(queryEngine.execute).mock.calls[0][0]
    expect(callArgs.tenantId).toBe('tenant-1')
    expect(callArgs.userId).toBe('user-1')
    expect(callArgs.spec.fields).toEqual(['bid-cambio.saving_total'])
    expect(callArgs.spec.operation).toBe('sum')
  })

  it('403 — retorna 403 quando queryEngine lança AppError 403', async () => {
    vi.mocked(queryEngine.execute).mockRejectedValue(
      new AppError('Acesso negado ao campo', 403, 'FORBIDDEN'),
    )
    const app = buildApp()

    const res = await request(app)
      .post('/api/v1/dashboard/widgets/query')
      .send(validQueryBody)

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/negado/i)
  })
})

// ---------------------------------------------------------------------------
// POST /
// ---------------------------------------------------------------------------

describe('POST /api/v1/dashboard/widgets — criar widget', () => {
  beforeEach(() => vi.clearAllMocks())

  it('201 — cria widget com corpo válido', async () => {
    const createdWidget = { ...sampleWidget }
    delete (createdWidget as Partial<typeof sampleWidget>).dashboard

    const app = buildApp({
      dashboardConfig: {
        findFirst: vi.fn().mockResolvedValue(sampleDashboard),
      },
      dashboardWidget: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(createdWidget),
      },
    })

    const res = await request(app)
      .post('/api/v1/dashboard/widgets')
      .send(createWidgetBody)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data.chart_type).toBe('KPI_CARD')
  })

  it('404 — retorna 404 quando dashboard não encontrado', async () => {
    const app = buildApp({
      dashboardConfig: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    })

    const res = await request(app)
      .post('/api/v1/dashboard/widgets')
      .send(createWidgetBody)

    expect(res.status).toBe(404)
  })

  it('400 — retorna 400 com chart_type inválido', async () => {
    const app = buildApp({
      dashboardConfig: {
        findFirst: vi.fn().mockResolvedValue(sampleDashboard),
      },
    })

    const res = await request(app)
      .post('/api/v1/dashboard/widgets')
      .send({ ...createWidgetBody, chart_type: 'RADAR' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('400 — retorna 400 quando campos obrigatórios ausentes', async () => {
    const app = buildApp()

    const res = await request(app)
      .post('/api/v1/dashboard/widgets')
      .send({ chart_type: 'KPI_CARD' })

    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// PUT /:id
// ---------------------------------------------------------------------------

describe('PUT /api/v1/dashboard/widgets/:id — atualizar widget', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 — atualiza posição do widget com sucesso', async () => {
    const newPosition = { x: 2, y: 1, w: 6, h: 4 }
    const updatedWidget = { ...sampleWidget, position: newPosition }
    delete (updatedWidget as Partial<typeof sampleWidget>).dashboard

    const app = buildApp({
      dashboardWidget: {
        findFirst: vi.fn().mockResolvedValue(sampleWidget),
        update: vi.fn().mockResolvedValue(updatedWidget),
      },
    })

    const res = await request(app)
      .put('/api/v1/dashboard/widgets/wgt-001')
      .send({ position: newPosition })

    expect(res.status).toBe(200)
    expect(res.body.data.position).toEqual(newPosition)
  })

  it('404 — retorna 404 quando widget não encontrado', async () => {
    const app = buildApp()

    const res = await request(app)
      .put('/api/v1/dashboard/widgets/wgt-inexistente')
      .send({ title: 'Novo Título' })

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

  it('403 — retorna 403 quando widget pertence a outro usuário', async () => {
    const widgetOutroUser = {
      ...sampleWidget,
      dashboard: { ...sampleDashboard, user_id: 'user-outro' },
    }

    const app = buildApp({
      dashboardWidget: {
        findFirst: vi.fn().mockResolvedValue(widgetOutroUser),
      },
    })

    const res = await request(app)
      .put('/api/v1/dashboard/widgets/wgt-001')
      .send({ title: 'Tentativa' })

    expect(res.status).toBe(403)
  })
})

// ---------------------------------------------------------------------------
// DELETE /:id
// ---------------------------------------------------------------------------

describe('DELETE /api/v1/dashboard/widgets/:id — deletar widget', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 — deleta widget com sucesso', async () => {
    const app = buildApp({
      dashboardWidget: {
        findFirst: vi.fn().mockResolvedValue(sampleWidget),
        delete: vi.fn().mockResolvedValue(sampleWidget),
      },
    })

    const res = await request(app).delete('/api/v1/dashboard/widgets/wgt-001')

    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/removido/i)
  })

  it('404 — retorna 404 quando widget não encontrado', async () => {
    const app = buildApp()

    const res = await request(app).delete('/api/v1/dashboard/widgets/wgt-inexistente')

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

  it('403 — retorna 403 quando widget pertence a outro usuário', async () => {
    const widgetOutroUser = {
      ...sampleWidget,
      dashboard: { ...sampleDashboard, user_id: 'user-outro' },
    }

    const app = buildApp({
      dashboardWidget: {
        findFirst: vi.fn().mockResolvedValue(widgetOutroUser),
      },
    })

    const res = await request(app).delete('/api/v1/dashboard/widgets/wgt-001')

    expect(res.status).toBe(403)
  })
})
