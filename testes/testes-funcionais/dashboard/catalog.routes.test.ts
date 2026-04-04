// @vitest-environment node
/**
 * Testes funcionais — Dashboard / catalog.routes
 * Cobre:
 *   GET /api/v1/dashboard/catalog/fields
 *   GET /api/v1/dashboard/catalog/widgets
 *   GET /api/v1/dashboard/catalog/suggest
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

vi.mock('../../../servicos-global/tenant/dashboard/server/lib/catalog.js', () => ({
  getCatalogForUser: vi.fn().mockReturnValue([
    {
      key: 'bid-cambio.saving_total',
      label: 'Saving Total',
      productId: 'bid-cambio',
      type: 'currency',
      permission: 'bid-cambio:read',
      chartTypes: ['KPI_CARD', 'LINE'],
    },
  ]),
  getCatalogByProduct: vi.fn().mockReturnValue([]),
  resolveCatalogField: vi.fn().mockReturnValue(undefined),
  DATA_CATALOG: [],
}))

vi.mock('../../../servicos-global/tenant/dashboard/server/lib/widget-registry.js', () => ({
  getWidgetsForUser: vi.fn().mockReturnValue([]),
}))

vi.mock('../../../servicos-global/tenant/dashboard/server/lib/chart-advisor.js', () => ({
  suggestChartTypes: vi.fn().mockReturnValue(['KPI_CARD', 'LINE']),
}))

import { catalogRouter } from '../../../servicos-global/tenant/dashboard/server/routes/catalog.routes.js'
import { getCatalogForUser, getCatalogByProduct } from '../../../servicos-global/tenant/dashboard/server/lib/catalog.js'
import { getWidgetsForUser } from '../../../servicos-global/tenant/dashboard/server/lib/widget-registry.js'
import { suggestChartTypes } from '../../../servicos-global/tenant/dashboard/server/lib/chart-advisor.js'

// ---------------------------------------------------------------------------
// buildApp helper
// ---------------------------------------------------------------------------

function buildApp(userPermissions = 'bid-cambio:read,bid-frete:read') {
  const app = express()
  app.use(express.json())

  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as Request & { auth: unknown }).auth = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      permissions: userPermissions.split(',').filter(Boolean),
    }
    // Catalog routes não usam req.prisma, mas inserimos para uniformidade
    ;(req as Request & { prisma: unknown }).prisma = {}
    next()
  })

  app.use('/api/v1/dashboard/catalog', catalogRouter)

  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message, code: err.code })
  })

  return app
}

// ---------------------------------------------------------------------------
// GET /fields
// ---------------------------------------------------------------------------

describe('GET /api/v1/dashboard/catalog/fields — campos do catálogo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna array de campos', async () => {
    const app = buildApp()

    const res = await request(app)
      .get('/api/v1/dashboard/catalog/fields')
      .set('x-user-permissions', 'bid-cambio:read,bid-frete:read')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].key).toBe('bid-cambio.saving_total')
  })

  it('chama getCatalogForUser com permissões parseadas do header', async () => {
    const app = buildApp()

    await request(app)
      .get('/api/v1/dashboard/catalog/fields')
      .set('x-user-permissions', 'bid-cambio:read,bid-frete:read')

    expect(getCatalogForUser).toHaveBeenCalledOnce()
    const callArgs = vi.mocked(getCatalogForUser).mock.calls[0]
    // callArgs: [tenantId, userId, permissions[]]
    expect(callArgs[0]).toBe('tenant-1')
    expect(callArgs[1]).toBe('user-1')
    expect(callArgs[2]).toEqual(['bid-cambio:read', 'bid-frete:read'])
  })

  it('200 — filtra por product_id quando query param fornecido', async () => {
    vi.mocked(getCatalogByProduct).mockReturnValue([
      {
        key: 'bid-cambio.saving_total',
        label: 'Saving Total',
        productId: 'bid-cambio',
        type: 'currency',
        permission: 'bid-cambio:read',
        chartTypes: ['KPI_CARD'],
      },
    ] as never)

    const app = buildApp()

    const res = await request(app)
      .get('/api/v1/dashboard/catalog/fields?product_id=bid-cambio')
      .set('x-user-permissions', 'bid-cambio:read')

    expect(res.status).toBe(200)
    expect(getCatalogByProduct).toHaveBeenCalledOnce()
    const callArgs = vi.mocked(getCatalogByProduct).mock.calls[0]
    expect(callArgs[1]).toBe('bid-cambio')
    // getCatalogForUser não deve ter sido chamado quando product_id está presente
    expect(getCatalogForUser).not.toHaveBeenCalled()
  })

  it('200 — retorna array vazio quando usuário sem permissões', async () => {
    vi.mocked(getCatalogForUser).mockReturnValue([] as never)

    const app = buildApp('')

    const res = await request(app)
      .get('/api/v1/dashboard/catalog/fields')
      .set('x-user-permissions', '')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// GET /widgets
// ---------------------------------------------------------------------------

describe('GET /api/v1/dashboard/catalog/widgets — widgets pré-construídos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna array de widgets disponíveis', async () => {
    vi.mocked(getWidgetsForUser).mockReturnValue([
      {
        id: 'saving-total-kpi',
        title: 'Saving Total',
        productId: 'bid-cambio',
        chartType: 'KPI_CARD',
      },
    ] as never)

    const app = buildApp()

    const res = await request(app)
      .get('/api/v1/dashboard/catalog/widgets')
      .set('x-user-permissions', 'bid-cambio:read')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].chartType).toBe('KPI_CARD')
  })

  it('200 — retorna array vazio quando nenhum widget disponível', async () => {
    vi.mocked(getWidgetsForUser).mockReturnValue([] as never)
    const app = buildApp()

    const res = await request(app)
      .get('/api/v1/dashboard/catalog/widgets')
      .set('x-user-permissions', 'bid-cambio:read')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
  })

  it('chama getWidgetsForUser com permissões e tenantId corretos', async () => {
    const app = buildApp()

    await request(app)
      .get('/api/v1/dashboard/catalog/widgets')
      .set('x-user-permissions', 'bid-cambio:read,bid-frete:read')

    expect(getWidgetsForUser).toHaveBeenCalledOnce()
    const callArgs = vi.mocked(getWidgetsForUser).mock.calls[0]
    expect(callArgs[0]).toBe('tenant-1')
    expect(callArgs[1]).toBe('user-1')
    expect(callArgs[2]).toEqual(['bid-cambio:read', 'bid-frete:read'])
  })
})

// ---------------------------------------------------------------------------
// GET /suggest
// ---------------------------------------------------------------------------

describe('GET /api/v1/dashboard/catalog/suggest — sugestão de tipos de gráfico', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna sugestões de chart types', async () => {
    const app = buildApp()
    const fieldsJson = JSON.stringify(['bid-cambio.saving_total'])

    const res = await request(app)
      .get(`/api/v1/dashboard/catalog/suggest?fields=${encodeURIComponent(fieldsJson)}&operation=sum`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data).toContain('KPI_CARD')
  })

  it('400 — retorna 400 quando query param fields está ausente', async () => {
    const app = buildApp()

    const res = await request(app)
      .get('/api/v1/dashboard/catalog/suggest?operation=sum')

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('400 — retorna 400 quando operation está ausente', async () => {
    const app = buildApp()
    const fieldsJson = JSON.stringify(['bid-cambio.saving_total'])

    const res = await request(app)
      .get(`/api/v1/dashboard/catalog/suggest?fields=${encodeURIComponent(fieldsJson)}`)

    expect(res.status).toBe(400)
  })

  it('400 — retorna 400 quando fields não é JSON válido', async () => {
    const app = buildApp()

    const res = await request(app)
      .get('/api/v1/dashboard/catalog/suggest?fields=invalid-json&operation=sum')

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/fields/i)
  })

  it('400 — retorna 400 quando fields é array vazio', async () => {
    const app = buildApp()
    const fieldsJson = JSON.stringify([])

    const res = await request(app)
      .get(`/api/v1/dashboard/catalog/suggest?fields=${encodeURIComponent(fieldsJson)}&operation=sum`)

    expect(res.status).toBe(400)
  })

  it('chama suggestChartTypes com os argumentos corretos', async () => {
    const app = buildApp()
    const fields = ['bid-cambio.saving_total', 'bid-frete.frete_total']
    const fieldsJson = JSON.stringify(fields)

    await request(app)
      .get(`/api/v1/dashboard/catalog/suggest?fields=${encodeURIComponent(fieldsJson)}&operation=avg`)

    expect(suggestChartTypes).toHaveBeenCalledOnce()
    const callArgs = vi.mocked(suggestChartTypes).mock.calls[0]
    expect(callArgs[0]).toEqual(fields)
    expect(callArgs[1]).toBe('avg')
  })
})
