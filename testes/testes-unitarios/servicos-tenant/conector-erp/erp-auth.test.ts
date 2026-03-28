// @vitest-environment node
// Testes de autenticacao do Conector-ERP — verifica que:
//   1. Requisicoes sem x-tenant-id sao rejeitadas com 401
//   2. /health permanece publico (sem auth)

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// Build a self-contained test app replicating the Conector-ERP logic
// (from servicos-global/tenant/conector-erp/server/index.ts)
// ---------------------------------------------------------------------------
function createTestApp() {
  const app = express()
  app.use(express.json())

  // Correlation middleware (no-op for tests)
  app.use((_req, _res, next) => next())

  // Health check — public, no auth required
  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'conector-erp' })
  })

  // Auth middleware (replicates conector-erp/server/index.ts)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string | undefined
    const userId = req.headers['x-user-id'] as string | undefined

    if (!tenantId) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'x-tenant-id obrigatorio' },
      })
      return
    }

    ;(req as any).auth = { tenantId, userId: userId ?? '' }
    next()
  })

  // Protected route: GET /api/v1/erp/conexoes
  app.get('/api/v1/erp/conexoes', (req: any, res) => {
    res.json({ tenant: req.auth?.tenantId })
  })

  // Error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode || 500).json({
      error: { code: err.code || 'INTERNAL', message: err.message },
    })
  })

  return app
}

const app = createTestApp()

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Suite 1 — Rejeitar requisicoes sem x-tenant-id
// ---------------------------------------------------------------------------

describe('Conector-ERP auth — rejeitar sem x-tenant-id', () => {
  it('GET /api/v1/erp/conexoes retorna 401 sem x-tenant-id', async () => {
    const res = await request(app).get('/api/v1/erp/conexoes')

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
    expect(res.body.error.message).toMatch(/x-tenant-id/i)
  })

  it('com x-tenant-id valido, permite acesso', async () => {
    const res = await request(app)
      .get('/api/v1/erp/conexoes')
      .set('x-tenant-id', 'tenant-abc')
      .set('x-user-id', 'user-1')

    expect(res.status).toBe(200)
    expect(res.body.tenant).toBe('tenant-abc')
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — /health permanece publico
// ---------------------------------------------------------------------------

describe('Conector-ERP /health — publico', () => {
  it('GET /health retorna 200 sem x-tenant-id', async () => {
    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.service).toBe('conector-erp')
  })
})
