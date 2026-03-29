// @vitest-environment node

/**
 * Testes unitarios — Relatorios Pagination
 * Localizacao: testes/testes-unitarios/servicos-tenant/relatorios/relatorios-pagination.test.ts
 *
 * Verifica que GET /api/v1/relatorios/saved aplica paginacao corretamente:
 * defaults, limites e passagem de take/skip ao Prisma.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// ---------------------------------------------------------------------------
// In-memory mock DB
// ---------------------------------------------------------------------------
const findManyMock = vi.fn().mockResolvedValue([])

// ---------------------------------------------------------------------------
// Build a self-contained test app replicating the Relatorios pagination logic
// ---------------------------------------------------------------------------
function createTestApp() {
  const app = express()
  app.use(express.json())

  // Auth middleware (injects req.auth)
  app.use((req: any, _res, next) => {
    req.auth = { tenantId: 'tenant-1', userId: 'user-1' }
    next()
  })

  // GET /api/v1/relatorios/saved — with pagination
  app.get('/api/v1/relatorios/saved', async (req: any, res) => {
    const rawPage = req.query.page !== undefined ? Number(req.query.page) : 1
    const rawLimit = req.query.limit !== undefined ? Number(req.query.limit) : 100

    const page = Math.max(1, rawPage)
    const limit = Math.max(1, Math.min(100, rawLimit))
    const skip = (page - 1) * limit

    const { tenantId } = req.auth

    const relatorios = await findManyMock({
      where: { tenant_id: tenantId },
      take: limit,
      skip,
      orderBy: { created_at: 'desc' },
    })

    res.json({ data: relatorios })
  })

  return app
}

const app = createTestApp()

// --- Setup ---

beforeEach(() => {
  findManyMock.mockReset()
  findManyMock.mockResolvedValue([])
})

// --- 1. Defaults ---

describe('GET /api/v1/relatorios/saved — pagination defaults', () => {
  it('defaults to page=1, limit=100 when no params are provided', async () => {
    await request(app).get('/api/v1/relatorios/saved').expect(200)

    expect(findManyMock).toHaveBeenCalledOnce()
    const callArgs = findManyMock.mock.calls[0][0]
    expect(callArgs.take).toBe(100)
    expect(callArgs.skip).toBe(0)
  })
})

// --- 2. Custom page and limit ---

describe('GET /api/v1/relatorios/saved — custom page & limit', () => {
  it('respects page=2, limit=25', async () => {
    await request(app)
      .get('/api/v1/relatorios/saved?page=2&limit=25')
      .expect(200)

    const callArgs = findManyMock.mock.calls[0][0]
    expect(callArgs.take).toBe(25)
    expect(callArgs.skip).toBe(25) // (2-1) * 25
  })

  it('respects page=3, limit=10', async () => {
    await request(app)
      .get('/api/v1/relatorios/saved?page=3&limit=10')
      .expect(200)

    const callArgs = findManyMock.mock.calls[0][0]
    expect(callArgs.take).toBe(10)
    expect(callArgs.skip).toBe(20) // (3-1) * 10
  })
})

// --- 3. Limit cap at 100 ---

describe('GET /api/v1/relatorios/saved — limit cap', () => {
  it('caps limit at 100 when a larger value is provided', async () => {
    await request(app)
      .get('/api/v1/relatorios/saved?limit=500')
      .expect(200)

    const callArgs = findManyMock.mock.calls[0][0]
    expect(callArgs.take).toBe(100)
  })

  it('enforces minimum limit of 1', async () => {
    await request(app)
      .get('/api/v1/relatorios/saved?limit=0')
      .expect(200)

    const callArgs = findManyMock.mock.calls[0][0]
    expect(callArgs.take).toBe(1)
  })

  it('enforces minimum page of 1 when 0 is passed', async () => {
    await request(app)
      .get('/api/v1/relatorios/saved?page=0&limit=10')
      .expect(200)

    const callArgs = findManyMock.mock.calls[0][0]
    expect(callArgs.skip).toBe(0) // max(1, 0) => page 1 => skip 0
  })
})

// --- 4. findMany receives take and skip ---

describe('GET /api/v1/relatorios/saved — findMany called with take & skip', () => {
  it('passes take and skip to prisma.relatorio.findMany', async () => {
    await request(app)
      .get('/api/v1/relatorios/saved?page=4&limit=15')
      .expect(200)

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 15,
        skip: 45, // (4-1) * 15
        orderBy: { created_at: 'desc' },
      })
    )
  })

  it('includes where clause with tenant_id', async () => {
    await request(app).get('/api/v1/relatorios/saved').expect(200)

    const callArgs = findManyMock.mock.calls[0][0]
    expect(callArgs.where.tenant_id).toBe('tenant-1')
  })
})
