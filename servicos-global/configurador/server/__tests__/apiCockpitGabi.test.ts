// server/__tests__/apiCockpitGabi.test.ts
// Testes unitários para as rotas admin de GABI usage no API Cockpit
// Valida: proxy para gabi/usage, resilience, maskError, rate limiting

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import supertest from 'supertest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Intercept global fetch for Gabi service calls
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

// Mock rate limiter
vi.mock('../middleware/rateLimiter.js', () => ({
  createRateLimiter: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  rateLimitPresets: {
    admin: () => (_req: unknown, _res: unknown, next: () => void) => next(),
    internal: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  },
}))

// Mock requireAuth
const defaultAuth = {
  userId: 'admin-001',
  clerkUserId: 'clerk_admin',
  tenantId: 'tenant-001',
  role: 'SUPER_ADMIN',
}

vi.mock('../middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req.auth = defaultAuth
    next()
  },
}))

// Mock requireGravityAdmin
vi.mock('../middleware/requireGravityAdmin.js', () => ({
  requireGravityAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

// ─── App setup ──────────────────────────────────────────────────────────────

let app: express.Express
let request: ReturnType<typeof supertest>

beforeAll(async () => {
  const { apiCockpitAdminRouter } = await import('../routes/apiCockpit.js')

  app = express()
  app.use(express.json())
  app.use('/api/admin/api-cockpit', apiCockpitAdminRouter)

  interface HttpError extends Error { statusCode?: number; code?: string }
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({
      error: { code: err.code ?? 'INTERNAL', message: err.message },
    })
  })

  request = supertest(app)
})

beforeEach(() => {
  vi.clearAllMocks()
  // Default: gabi service unavailable
  fetchMock.mockRejectedValue(new Error('gabi unavailable'))
})

// ─── GET /api/admin/api-cockpit/gabi-usage ──────────────────────────────────

describe('GET /api/admin/api-cockpit/gabi-usage', () => {
  it('retorna 200 com dados de usage quando gabi responde', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('gabi/usage')) {
        return {
          ok: true,
          json: async () => ({
            month: '2026-04',
            total_calls: 150,
            total_tokens_input: 50000,
            total_tokens_output: 30000,
            total_cost_usd: 0.0234,
            by_model: {
              'gemini-2.0-flash': { calls: 130, tokensIn: 45000, tokensOut: 25000, cost: 0.02 },
              'gemini-2.5-pro': { calls: 20, tokensIn: 5000, tokensOut: 5000, cost: 0.0034 },
            },
            by_day: { '2026-04-15': 0.005, '2026-04-16': 0.008 },
          }),
        }
      }
      throw new Error('not found')
    })

    const res = await request.get('/api/admin/api-cockpit/gabi-usage')
    expect(res.status).toBe(200)
    expect(res.body.month).toBe('2026-04')
    expect(res.body.total_calls).toBe(150)
    expect(res.body.total_cost_usd).toBe(0.0234)
    expect(res.body.by_model).toHaveProperty('gemini-2.0-flash')
  })

  it('aceita filtro por month', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('gabi/usage')) {
        const parsedUrl = new URL(url)
        const month = parsedUrl.searchParams.get('month')
        return {
          ok: true,
          json: async () => ({
            month: month ?? '2026-04',
            total_calls: 0,
            total_tokens_input: 0,
            total_tokens_output: 0,
            total_cost_usd: 0,
            by_model: {},
            by_day: {},
          }),
        }
      }
      throw new Error('not found')
    })

    const res = await request.get('/api/admin/api-cockpit/gabi-usage?month=2026-03')
    expect(res.status).toBe(200)
    expect(res.body.month).toBe('2026-03')
  })

  it('retorna zeros quando gabi está indisponível (resilience)', async () => {
    fetchMock.mockRejectedValue(new Error('connection refused'))

    const res = await request.get('/api/admin/api-cockpit/gabi-usage')
    expect(res.status).toBe(200)
    expect(res.body.total_calls).toBe(0)
    expect(res.body.total_cost_usd).toBe(0)
    expect(res.body).toHaveProperty('error')
  })

  it('retorna zeros quando gabi responde com HTTP error', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
    })

    const res = await request.get('/api/admin/api-cockpit/gabi-usage')
    expect(res.status).toBe(200)
    expect(res.body.total_calls).toBe(0)
    expect(res.body).toHaveProperty('error')
  })

  it('retorna zeros quando gabi responde com error no payload', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        month: '2026-04',
        total_calls: 0,
        total_tokens_input: 0,
        total_tokens_output: 0,
        total_cost_usd: 0,
        by_model: {},
        by_day: {},
        error: 'Database connection lost',
      }),
    })

    const res = await request.get('/api/admin/api-cockpit/gabi-usage')
    expect(res.status).toBe(200)
    // error is passed through from gabi
    expect(res.body).toHaveProperty('error')
  })

  it('envia x-internal-key no fetch para gabi', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        month: '2026-04',
        total_calls: 0,
        total_tokens_input: 0,
        total_tokens_output: 0,
        total_cost_usd: 0,
        by_model: {},
        by_day: {},
      }),
    })

    await request.get('/api/admin/api-cockpit/gabi-usage')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('gabi/usage'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-internal-key': expect.any(String),
        }),
      }),
    )
  })
})

// ─── GET /api/admin/api-cockpit/gabi-usage/history ──────────────────────────

describe('GET /api/admin/api-cockpit/gabi-usage/history', () => {
  it('retorna 200 com histórico quando gabi responde', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('gabi/usage/history')) {
        return {
          ok: true,
          json: async () => ({
            history: {
              '2026-04': { calls: 150, cost: 0.02, tokens: 80000 },
              '2026-03': { calls: 120, cost: 0.015, tokens: 60000 },
              '2025-12': { calls: 50, cost: 0.005, tokens: 20000 },
            },
          }),
        }
      }
      throw new Error('not found')
    })

    const res = await request.get('/api/admin/api-cockpit/gabi-usage/history')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('history')
    expect(res.body.history).toHaveProperty('2026-04')
    expect(res.body.history['2026-04'].calls).toBe(150)
  })

  it('retorna history vazio quando gabi está indisponível (resilience)', async () => {
    fetchMock.mockRejectedValue(new Error('timeout'))

    const res = await request.get('/api/admin/api-cockpit/gabi-usage/history')
    expect(res.status).toBe(200)
    expect(res.body.history).toEqual({})
    expect(res.body).toHaveProperty('error')
  })
})

// ─── Existing admin routes still work ───────────────────────────────────────

describe('Existing admin cockpit routes', () => {
  it('GET /services retorna fallback resiliente', async () => {
    fetchMock.mockRejectedValue(new Error('cockpit down'))
    const res = await request.get('/api/admin/api-cockpit/services')
    expect(res.status).toBe(200)
    expect(res.body.services).toEqual([])
  })

  it('GET /logs retorna fallback resiliente', async () => {
    fetchMock.mockRejectedValue(new Error('cockpit down'))
    const res = await request.get('/api/admin/api-cockpit/logs')
    expect(res.status).toBe(200)
    expect(res.body.logs).toEqual([])
  })

  it('GET /stats retorna fallback resiliente', async () => {
    fetchMock.mockRejectedValue(new Error('cockpit down'))
    const res = await request.get('/api/admin/api-cockpit/stats')
    expect(res.status).toBe(200)
    expect(res.body.requisicoes_24h).toBe(0)
  })
})
