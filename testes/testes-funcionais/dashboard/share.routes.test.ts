// @vitest-environment node
/**
 * share.routes.test.ts — Testes funcionais das rotas de compartilhamento do Dashboard
 * Rota raiz: /api/v1/dashboard/share (via shareRouter montado em /share no dashboardRouter)
 *
 * Skill consultada: antigravity-testes, antigravity-agent-policy, antigravity-code-standards
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// Mock — sharingEngine
// A rota usa sharingEngine de '../lib/sharing-engine.js'.
// Mockamos o módulo antes de importar o router.
// ---------------------------------------------------------------------------

vi.mock('../../../servicos-global/tenant/dashboard/server/lib/sharing-engine.js', () => ({
  sharingEngine: {
    createShare: vi.fn(),
    revokeShare: vi.fn(),
    getSharedDashboard: vi.fn(),
    findByToken: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Mock — Prisma
// ---------------------------------------------------------------------------

const mockDashboardConfig = {
  findFirst: vi.fn(),
}

const mockDashboardShare = {
  findMany: vi.fn(),
  findFirst: vi.fn(),
  delete: vi.fn(),
}

const mockPrisma = {
  dashboardConfig: mockDashboardConfig,
  dashboardShare: mockDashboardShare,
}

// ---------------------------------------------------------------------------
// App de teste
// ---------------------------------------------------------------------------

function buildTestApp() {
  const app = express()
  app.use(express.json())

  // Rota pública — não injeta auth (espelha o comportamento real)
  // O router share.routes.ts usa req.auth apenas fora da rota /public/:token

  // Middleware de auth: injeta req.auth e req.prisma para rotas autenticadas
  app.use((req: Request, _res: Response, next: NextFunction) => {
    // Rotas públicas não têm auth — o middleware de auth real não bloqueia /public/
    // Para simplificar o teste, sempre injetamos mas o router só usa em rotas protegidas
    req.auth = { tenantId: 'tenant-test', userId: 'user-test' }
    req.prisma = mockPrisma as never
    next()
  })

  const { shareRouter } = require('../../../servicos-global/tenant/dashboard/server/routes/share.routes.js')
  app.use('/api/v1/dashboard/share', shareRouter)

  // Error handler global
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.statusCode ?? 500
    res.status(status).json({ error: err.message, code: err.code ?? 'INTERNAL_ERROR' })
  })

  return app
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validShareBody = {
  dashboard_id: 'dash-1',
  channel: 'link',
  expires_in_hours: 48,
}

const storedDashboard = {
  id: 'dash-1',
  user_id: 'user-test',
  name: 'Dashboard Principal',
}

const storedShare = {
  id: 'share-1',
  user_id: 'user-test',
  dashboard_id: 'dash-1',
  share_token: 'abc-token-123',
  channel: 'link',
  expires_at: null,
  snapshot_data: { widgets: [] },
  created_at: new Date().toISOString(),
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe('Dashboard Share Routes', () => {
  let app: ReturnType<typeof buildTestApp>

  beforeEach(async () => {
    vi.clearAllMocks()
    app = buildTestApp()
  })

  // ---- GET /public/:token — rota pública (sem auth) ----------------------

  describe('GET /api/v1/dashboard/share/public/:token', () => {
    it('should return 200 with shared dashboard data — no auth needed', async () => {
      const { sharingEngine } = await import(
        '../../../servicos-global/tenant/dashboard/server/lib/sharing-engine.js'
      )

      ;(sharingEngine.findByToken as ReturnType<typeof vi.fn>).mockResolvedValue({
        share_token: 'valid-token',
        expires_at: null,
        snapshot_data: { widgets: [{ id: 'w1', type: 'kpi' }] },
        created_at: new Date().toISOString(),
      })

      const res = await request(app)
        .get('/api/v1/dashboard/share/public/valid-token')
        // Sem headers de autenticação — rota pública
        .expect(200)

      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('snapshot_data')
    })

    it('should return 404 for invalid or unknown token', async () => {
      const { sharingEngine } = await import(
        '../../../servicos-global/tenant/dashboard/server/lib/sharing-engine.js'
      )

      ;(sharingEngine.findByToken as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const res = await request(app)
        .get('/api/v1/dashboard/share/public/invalid-token')

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('code', 'NOT_FOUND')
    })

    it('should return 410 for expired share token', async () => {
      const { sharingEngine } = await import(
        '../../../servicos-global/tenant/dashboard/server/lib/sharing-engine.js'
      )

      const pastDate = new Date(Date.now() - 1000 * 60 * 60) // 1 hora atrás
      ;(sharingEngine.findByToken as ReturnType<typeof vi.fn>).mockResolvedValue({
        share_token: 'expired-token',
        expires_at: pastDate,
        snapshot_data: { widgets: [] },
        created_at: new Date().toISOString(),
      })

      const res = await request(app)
        .get('/api/v1/dashboard/share/public/expired-token')

      expect(res.status).toBe(410)
      expect(res.body).toHaveProperty('code', 'SHARE_EXPIRED')
    })
  })

  // ---- POST / — cria compartilhamento ------------------------------------

  describe('POST /api/v1/dashboard/share', () => {
    it('should create share and return token — channel link', async () => {
      const { sharingEngine } = await import(
        '../../../servicos-global/tenant/dashboard/server/lib/sharing-engine.js'
      )

      mockDashboardConfig.findFirst.mockResolvedValue(storedDashboard)
      ;(sharingEngine.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        shareToken: 'new-token-abc',
        shareUrl: 'http://localhost:3000/dashboard/share/new-token-abc',
        channel: 'link',
        expiresAt: null,
      })

      const res = await request(app)
        .post('/api/v1/dashboard/share')
        .set('x-tenant-id', 'tenant-test')
        .set('x-user-id', 'user-test')
        .send(validShareBody)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('data')
      expect(res.body.data).toHaveProperty('shareToken', 'new-token-abc')
    })

    it('should return 400 when channel is email but recipient_email is missing', async () => {
      mockDashboardConfig.findFirst.mockResolvedValue(storedDashboard)

      const res = await request(app)
        .post('/api/v1/dashboard/share')
        .set('x-tenant-id', 'tenant-test')
        .set('x-user-id', 'user-test')
        .send({
          dashboard_id: 'dash-1',
          channel: 'email',
          // recipient_email ausente
        })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('code', 'VALIDATION_ERROR')
    })

    it('should return 400 when expires_in_hours exceeds 720', async () => {
      const res = await request(app)
        .post('/api/v1/dashboard/share')
        .set('x-tenant-id', 'tenant-test')
        .set('x-user-id', 'user-test')
        .send({
          ...validShareBody,
          expires_in_hours: 721, // acima do limite máximo
        })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('code', 'VALIDATION_ERROR')
    })

    it('should return 404 when dashboard does not belong to user', async () => {
      mockDashboardConfig.findFirst.mockResolvedValue(null)

      const res = await request(app)
        .post('/api/v1/dashboard/share')
        .set('x-tenant-id', 'tenant-test')
        .set('x-user-id', 'user-test')
        .send(validShareBody)

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('code', 'NOT_FOUND')
    })
  })

  // ---- GET / — lista shares -----------------------------------------------

  describe('GET /api/v1/dashboard/share', () => {
    it("should list current user's shares and return 200", async () => {
      mockDashboardShare.findMany.mockResolvedValue([storedShare])

      const res = await request(app)
        .get('/api/v1/dashboard/share')
        .set('x-tenant-id', 'tenant-test')
        .set('x-user-id', 'user-test')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].id).toBe('share-1')

      // Garante que o prisma filtrou pelo user_id correto
      const callArgs = mockDashboardShare.findMany.mock.calls[0][0]
      expect(callArgs.where).toHaveProperty('user_id', 'user-test')
    })

    it('should return empty array when user has no shares', async () => {
      mockDashboardShare.findMany.mockResolvedValue([])

      const res = await request(app)
        .get('/api/v1/dashboard/share')
        .set('x-tenant-id', 'tenant-test')
        .set('x-user-id', 'user-test')

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(0)
    })
  })

  // ---- DELETE /:id — revoga share -----------------------------------------

  describe('DELETE /api/v1/dashboard/share/:id', () => {
    it('should revoke share and return 200 with success message', async () => {
      mockDashboardShare.findFirst.mockResolvedValue(storedShare)
      mockDashboardShare.delete.mockResolvedValue(storedShare)

      const res = await request(app)
        .delete('/api/v1/dashboard/share/share-1')
        .set('x-tenant-id', 'tenant-test')
        .set('x-user-id', 'user-test')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('message')
      expect(mockDashboardShare.delete).toHaveBeenCalledWith({ where: { id: 'share-1' } })
    })

    it('should return 404 if share belongs to another user', async () => {
      // Simula cenário em que findFirst retorna null (o filtro user_id garante isolamento)
      mockDashboardShare.findFirst.mockResolvedValue(null)

      const res = await request(app)
        .delete('/api/v1/dashboard/share/share-other-user')
        .set('x-tenant-id', 'tenant-test')
        .set('x-user-id', 'user-test')

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('code', 'NOT_FOUND')
      // Garante que delete NÃO foi chamado
      expect(mockDashboardShare.delete).not.toHaveBeenCalled()
    })
  })
})
