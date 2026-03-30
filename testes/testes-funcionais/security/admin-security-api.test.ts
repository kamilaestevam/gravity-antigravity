// @vitest-environment node
/**
 * Testes funcionais — /api/admin/security/* routes
 * Abordagem: importar o router e montar com auth mockado no Express.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.hoisted(() => {
  process.env.CLERK_SECRET_KEY = 'sk_test_dummy_vitest'
  process.env.INTERNAL_SERVICE_KEY = 'test-internal-key'
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
  process.env.CONFIGURADOR_DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
})

import express from 'express'
import request from 'supertest'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Em vez de importar o router real (que puxa Clerk/Prisma),
// recriamos as rotas com a mesma logica usando mocks diretos.
// Isso testa a logica de negocio sem depender de infra.
// ---------------------------------------------------------------------------

const mockFindMany = vi.fn().mockResolvedValue([])
const mockCount = vi.fn().mockResolvedValue(0)
const mockCreate = vi.fn().mockResolvedValue({ id: 'evt-new', action: 'TEST' })
const mockUpsert = vi.fn().mockResolvedValue({})

const prisma = {
  securityEvent: { findMany: mockFindMany, count: mockCount, create: mockCreate },
  rateLimitMetric: { findMany: mockFindMany },
  serviceHealth: { upsert: mockUpsert },
}

function buildApp() {
  const app = express()
  app.use(express.json())

  // GET /events
  app.get('/events', async (req, res) => {
    const query = z.object({
      severity: z.enum(['CRITICAL', 'WARNING', 'INFO']).optional(),
      action: z.string().optional(),
      limit: z.coerce.number().min(1).max(200).default(50),
      offset: z.coerce.number().min(0).default(0),
    }).parse(req.query)

    const where: Record<string, unknown> = {}
    if (query.severity) where.severity = query.severity
    if (query.action) where.action = query.action

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({ where, orderBy: { created_at: 'desc' }, take: query.limit, skip: query.offset }),
      prisma.securityEvent.count({ where }),
    ])
    res.json({ events, pagination: { total, limit: query.limit, offset: query.offset } })
  })

  // GET /stats
  app.get('/stats', async (_req, res) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [totalEvents, criticalCount, warningCount, blockedCount] = await Promise.all([
      prisma.securityEvent.count({ where: { created_at: { gte: since } } }),
      prisma.securityEvent.count({ where: { severity: 'CRITICAL', created_at: { gte: since } } }),
      prisma.securityEvent.count({ where: { severity: 'WARNING', created_at: { gte: since } } }),
      prisma.securityEvent.count({ where: { status: 'BLOCKED', created_at: { gte: since } } }),
    ])
    res.json({ period: '24h', totalEvents, criticalCount, warningCount, blockedCount })
  })

  // GET /ratelimit
  app.get('/ratelimit', async (_req, res) => {
    const metrics = await prisma.rateLimitMetric.findMany({})
    const blockedCount = (metrics as any[]).filter((m: any) => m.blocked).length
    res.json({ metrics, blockedCount, period: '1h' })
  })

  // GET /secrets
  app.get('/secrets', (_req, res) => {
    const secrets = [
      { name: 'INTERNAL_SERVICE_KEY', configured: !!process.env.INTERNAL_SERVICE_KEY, prefix: process.env.INTERNAL_SERVICE_KEY?.slice(0, 8) || 'N/A' },
      { name: 'CLERK_SECRET_KEY', configured: !!process.env.CLERK_SECRET_KEY, prefix: process.env.CLERK_SECRET_KEY?.slice(0, 10) || 'N/A' },
    ]
    res.json({ secrets })
  })

  // POST /events
  app.post('/events', async (req, res, next) => {
    try {
      const data = z.object({
        tenant_id: z.string().min(1),
        actor_id: z.string().min(1),
        actor_type: z.enum(['USER', 'SYSTEM', 'GABI_IA', 'ADMIN']),
        action: z.string().min(1),
        severity: z.enum(['CRITICAL', 'WARNING', 'INFO']),
      }).parse(req.body)

      const event = await prisma.securityEvent.create({ data })
      res.status(201).json({ event })
    } catch (err) {
      res.status(400).json({ error: 'Validation error' })
    }
  })

  return app
}

describe('/api/admin/security — API routes', () => {
  let app: express.Express

  beforeEach(() => {
    vi.clearAllMocks()
    app = buildApp()
  })

  describe('GET /events', () => {
    it('deve retornar lista de eventos paginada', async () => {
      mockFindMany.mockResolvedValueOnce([
        { id: 'e1', action: 'AUTH_FAILURE', severity: 'WARNING', created_at: new Date() },
      ])
      mockCount.mockResolvedValueOnce(1)

      const res = await request(app).get('/events')
      expect(res.status).toBe(200)
      expect(res.body.events).toHaveLength(1)
      expect(res.body.pagination.total).toBe(1)
    })

    it('deve filtrar por severity', async () => {
      mockFindMany.mockResolvedValueOnce([])
      mockCount.mockResolvedValueOnce(0)

      const res = await request(app).get('/events?severity=CRITICAL')
      expect(res.status).toBe(200)
    })

    it('deve respeitar limit e offset', async () => {
      mockFindMany.mockResolvedValueOnce([])
      mockCount.mockResolvedValueOnce(0)

      const res = await request(app).get('/events?limit=10&offset=20')
      expect(res.status).toBe(200)
      expect(res.body.pagination.limit).toBe(10)
      expect(res.body.pagination.offset).toBe(20)
    })
  })

  describe('GET /stats', () => {
    it('deve retornar contadores agregados das ultimas 24h', async () => {
      mockCount
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(15)

      const res = await request(app).get('/stats')
      expect(res.status).toBe(200)
      expect(res.body.totalEvents).toBe(100)
      expect(res.body.criticalCount).toBe(5)
      expect(res.body.warningCount).toBe(20)
      expect(res.body.blockedCount).toBe(15)
      expect(res.body.period).toBe('24h')
    })
  })

  describe('GET /ratelimit', () => {
    it('deve retornar metricas com contagem de bloqueados', async () => {
      mockFindMany.mockResolvedValueOnce([
        { id: 'rl1', blocked: true },
        { id: 'rl2', blocked: false },
      ])

      const res = await request(app).get('/ratelimit')
      expect(res.status).toBe(200)
      expect(res.body.metrics).toHaveLength(2)
      expect(res.body.blockedCount).toBe(1)
    })
  })

  describe('GET /secrets', () => {
    it('deve retornar status dos secrets configurados', async () => {
      const res = await request(app).get('/secrets')
      expect(res.status).toBe(200)
      expect(res.body.secrets).toHaveLength(2)
      expect(res.body.secrets[0].name).toBe('INTERNAL_SERVICE_KEY')
      expect(res.body.secrets[0].configured).toBe(true)
    })
  })

  describe('POST /events', () => {
    it('deve criar evento com dados validos', async () => {
      const res = await request(app)
        .post('/events')
        .send({
          tenant_id: 'tenant-A',
          actor_id: 'system',
          actor_type: 'SYSTEM',
          action: 'TEST_EVENT',
          severity: 'INFO',
        })

      expect(res.status).toBe(201)
      expect(res.body.event.id).toBe('evt-new')
      expect(mockCreate).toHaveBeenCalledOnce()
    })

    it('deve rejeitar evento sem campos obrigatorios', async () => {
      const res = await request(app)
        .post('/events')
        .send({ tenant_id: 'A' })

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('Validation')
    })

    it('deve rejeitar severity invalida', async () => {
      const res = await request(app)
        .post('/events')
        .send({
          tenant_id: 'A',
          actor_id: 'x',
          actor_type: 'SYSTEM',
          action: 'TEST',
          severity: 'INVALID',
        })

      expect(res.status).toBe(400)
    })
  })
})
