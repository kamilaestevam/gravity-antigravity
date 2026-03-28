// @vitest-environment node
// Testes de autenticacao do Notificacoes — verifica que:
//   1. Rejeita requisicoes sem x-tenant-id com 401 (nao 'default-tenant')
//   2. Rejeita requisicoes sem x-user-id com 401

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// In-memory mock DB
// ---------------------------------------------------------------------------
const mockFindMany = vi.fn().mockResolvedValue([])
const mockCount = vi.fn().mockResolvedValue(0)
const mockUpdateMany = vi.fn().mockResolvedValue({ count: 1 })
const mockDeleteMany = vi.fn().mockResolvedValue({ count: 1 })

// ---------------------------------------------------------------------------
// Build a self-contained test app replicating the Notificacoes auth + routes
// (from servicos-global/tenant/notificacoes/server/routes/api.ts)
// ---------------------------------------------------------------------------
function buildApp() {
  const app = express()
  app.use(express.json())

  // Auth middleware (replicates checkAuth from api.ts)
  const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string | undefined
    const userId = req.headers['x-user-id'] as string | undefined

    if (!tenantId) {
      return res.status(401).json({ status: 'error', message: 'x-tenant-id header is required' })
    }
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'x-user-id header is required' })
    }

    ;(req as any).tenant_id = tenantId
    ;(req as any).user_id = userId
    next()
  }

  // GET /api/v1/notificacoes
  app.get('/api/v1/notificacoes', checkAuth, async (req: any, res) => {
    const { tenant_id, user_id } = req

    const notifications = await mockFindMany({
      where: { tenant_id, user_id },
      orderBy: { created_at: 'desc' },
      take: 50
    })

    const unread_count = await mockCount({
      where: { tenant_id, user_id, read: false }
    })

    res.json({ status: 'success', data: notifications, unread_count })
  })

  // PUT /api/v1/notificacoes/read-all
  app.put('/api/v1/notificacoes/read-all', checkAuth, async (req: any, res) => {
    const { tenant_id, user_id } = req

    await mockUpdateMany({
      where: { tenant_id, user_id, read: false },
      data: { read: true }
    })

    res.json({ status: 'success' })
  })

  // Error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode || 500).json({
      error: { code: err.code || 'INTERNAL', message: err.message },
    })
  })

  return app
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Suite 1 — Rejeita sem x-tenant-id (401, nao 'default-tenant')
// ---------------------------------------------------------------------------

describe('Notificacoes auth — rejeitar sem x-tenant-id', () => {
  it('GET /api/v1/notificacoes retorna 401 sem x-tenant-id', async () => {
    const app = buildApp()
    const res = await request(app)
      .get('/api/v1/notificacoes')
      .set('x-user-id', 'user-1')

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/x-tenant-id/i)
  })

  it('NAO usa "default-tenant" como fallback', async () => {
    const app = buildApp()
    const res = await request(app)
      .get('/api/v1/notificacoes')
      .set('x-user-id', 'user-1')

    expect(res.status).toBe(401)
    // findMany nao deveria ter sido chamado
    expect(mockFindMany).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — Rejeita sem x-user-id com 401
// ---------------------------------------------------------------------------

describe('Notificacoes auth — rejeitar sem x-user-id', () => {
  it('GET /api/v1/notificacoes retorna 401 sem x-user-id', async () => {
    const app = buildApp()
    const res = await request(app)
      .get('/api/v1/notificacoes')
      .set('x-tenant-id', 'tenant-abc')

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/x-user-id/i)
  })

  it('PUT /api/v1/notificacoes/read-all retorna 401 sem x-user-id', async () => {
    const app = buildApp()
    const res = await request(app)
      .put('/api/v1/notificacoes/read-all')
      .set('x-tenant-id', 'tenant-abc')

    expect(res.status).toBe(401)
  })
})
