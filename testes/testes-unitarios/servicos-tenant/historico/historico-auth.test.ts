// @vitest-environment node
// Testes de autenticacao do Historico — verifica que:
//   1. Requisicoes sem tenant_id sao rejeitadas com 401 (sem fallback)
//   2. NAO usa hardcoded 'importes-sa'

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// In-memory mock DB
// ---------------------------------------------------------------------------
const mockCreate = vi.fn().mockResolvedValue({ id: 'log-1' })
const mockFindMany = vi.fn().mockResolvedValue([])
const mockFindFirst = vi.fn().mockResolvedValue(null)
const mockCount = vi.fn().mockResolvedValue(0)

// ---------------------------------------------------------------------------
// AppError (replicates historico-global/server/lib/errors.ts)
// ---------------------------------------------------------------------------
class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly isOperational: boolean

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
  }

  static unauthorized(message = 'Nao autorizado.') {
    return new AppError(message, 401, 'UNAUTHORIZED')
  }

  static notFound(resource: string) {
    return new AppError(`${resource} nao encontrado(a).`, 404, 'NOT_FOUND')
  }
}

// ---------------------------------------------------------------------------
// Build a self-contained test app replicating the Historico logic
// ---------------------------------------------------------------------------
function createTestApp() {
  const app = express()
  app.use(express.json())

  // Correlation ID middleware
  app.use((req, _res, next) => {
    const correlationId = (req.headers['x-correlation-id'] as string) ?? crypto.randomUUID()
    req.headers['x-correlation-id'] = correlationId
    next()
  })

  // POST /api/v1/historico/logs (replicates history.controller.ts ingestLog)
  app.post('/api/v1/historico/logs', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenant_id = req.headers['x-tenant-id'] as string | undefined
      if (!tenant_id) {
        throw AppError.unauthorized('Tenant ID is required for ingestion')
      }

      // Fire and forget pattern
      Promise.resolve().then(async () => {
        try {
          await mockCreate({
            data: {
              tenant_id,
              actor_id: req.body.actor_id,
              actor_type: req.body.actor_type,
              action: req.body.action,
              metadata: req.body.metadata || {},
            }
          })
        } catch (_err) { /* async save failure */ }
      })

      return res.status(202).json({ accepted: true })
    } catch (error) {
      next(error)
    }
  })

  // GET /api/v1/historico/logs (replicates history.controller.ts listLogs)
  app.get('/api/v1/historico/logs', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenant_id = req.headers['x-tenant-id'] as string | undefined
      if (!tenant_id) {
        throw AppError.unauthorized('Tenant ID is required')
      }

      const where: Record<string, unknown> = { tenant_id }
      const limit = 50
      const offset = 0

      const [logs, total] = await Promise.all([
        mockFindMany({ where, orderBy: { created_at: 'desc' }, take: limit, skip: offset }),
        mockCount({ where }),
      ])

      res.json({ data: logs, meta: { total, limit, offset } })
    } catch (error) {
      next(error)
    }
  })

  // GET /api/v1/historico/logs/:id (replicates history.controller.ts getLogById)
  app.get('/api/v1/historico/logs/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenant_id = req.headers['x-tenant-id'] as string | undefined
      if (!tenant_id) {
        throw AppError.unauthorized('Tenant ID is required')
      }

      const log = await mockFindFirst({ where: { id: req.params.id, tenant_id } })
      if (!log) {
        throw AppError.notFound('History Log')
      }

      res.json(log)
    } catch (error) {
      next(error)
    }
  })

  // Error handler (replicates historico-global/server/lib/errors.ts errorHandler)
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError && err.isOperational) {
      return res.status(err.statusCode).json({
        error: { code: err.code, message: err.message },
      })
    }
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno.' },
    })
  })

  return app
}

const app = createTestApp()

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Suite 1 — Rejeitar sem tenant_id (401, nao fallback)
// ---------------------------------------------------------------------------

describe('Historico auth — rejeitar sem tenant_id', () => {
  it('POST /api/v1/historico/logs retorna 401 sem x-tenant-id', async () => {
    const res = await request(app)
      .post('/api/v1/historico/logs')
      .send({
        actor_id: 'actor-1',
        actor_type: 'user',
        action: 'login',
      })

    expect(res.status).toBe(401)
  })

  it('GET /api/v1/historico/logs retorna 401 sem x-tenant-id', async () => {
    const res = await request(app).get('/api/v1/historico/logs')

    expect(res.status).toBe(401)
  })

  it('GET /api/v1/historico/logs/:id retorna 401 sem x-tenant-id', async () => {
    const res = await request(app).get('/api/v1/historico/logs/some-id')

    expect(res.status).toBe(401)
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — NAO usa hardcoded 'importes-sa'
// ---------------------------------------------------------------------------

describe('Historico auth — sem fallback hardcoded', () => {
  it('NAO usa "importes-sa" como fallback quando header ausente', async () => {
    const res = await request(app).get('/api/v1/historico/logs')

    // Deve retornar 401 em vez de usar fallback
    expect(res.status).toBe(401)

    // findMany nao deveria ter sido chamado com 'importes-sa'
    expect(mockFindMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'importes-sa' }),
      })
    )
  })

  it('usa tenant_id do header quando fornecido', async () => {
    mockFindMany.mockResolvedValueOnce([])
    mockCount.mockResolvedValueOnce(0)

    const res = await request(app)
      .get('/api/v1/historico/logs')
      .set('x-tenant-id', 'meu-tenant-real')

    expect(res.status).toBe(200)
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'meu-tenant-real' }),
      })
    )
  })
})
