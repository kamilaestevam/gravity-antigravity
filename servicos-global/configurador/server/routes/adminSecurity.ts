// server/routes/adminSecurity.ts
// Rotas do painel de Seguranca — gravity_admin only
//
// GET  /api/admin/security/events    — eventos de seguranca (paginado, filtros)
// GET  /api/admin/security/stats     — contadores agregados
// GET  /api/admin/security/ratelimit — metricas de rate limiting ativas
// GET  /api/admin/security/health    — health check agregado de todos os servicos
// GET  /api/admin/security/secrets   — status de rotacao de secrets
// POST /api/admin/security/events    — registrar evento (uso interno por securityAuditLogger)

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { prisma } from '../lib/prisma.js'

export const adminSecurityRouter = Router()

// Cadeia obrigatoria: auth → gravity_admin check
adminSecurityRouter.use(requireAuth, requireGravityAdmin)

// ---------------------------------------------------------------------------
// GET /events — listar eventos de seguranca
// ---------------------------------------------------------------------------

const EventsQuerySchema = z.object({
  severity: z.enum(['CRITICAL', 'WARNING', 'INFO']).optional(),
  action: z.string().optional(),
  tenant_id: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
})

adminSecurityRouter.get('/events', async (req, res, next) => {
  try {
    const query = EventsQuerySchema.parse(req.query)

    const where: Record<string, unknown> = {}
    if (query.severity) where.severity = query.severity
    if (query.action) where.action = query.action
    if (query.tenant_id) where.tenant_id = query.tenant_id

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.securityEvent.count({ where }),
    ])

    res.json({
      events,
      pagination: { total, limit: query.limit, offset: query.offset },
    })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /stats — contadores agregados (ultimas 24h)
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/stats', async (_req, res, next) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [totalEvents, criticalCount, warningCount, blockedCount, recentEvents] = await Promise.all([
      prisma.securityEvent.count({ where: { created_at: { gte: since } } }),
      prisma.securityEvent.count({ where: { severity: 'CRITICAL', created_at: { gte: since } } }),
      prisma.securityEvent.count({ where: { severity: 'WARNING', created_at: { gte: since } } }),
      prisma.securityEvent.count({ where: { status: 'BLOCKED', created_at: { gte: since } } }),
      prisma.securityEvent.findMany({
        where: { created_at: { gte: since } },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: { id: true, action: true, severity: true, created_at: true },
      }),
    ])

    res.json({
      period: '24h',
      totalEvents,
      criticalCount,
      warningCount,
      blockedCount,
      recentEvents,
    })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /ratelimit — metricas de rate limiting
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/ratelimit', async (_req, res, next) => {
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000) // ultima hora

    const metrics = await prisma.rateLimitMetric.findMany({
      where: { created_at: { gte: since } },
      orderBy: { created_at: 'desc' },
      take: 100,
    })

    const blockedCount = metrics.filter(m => m.blocked).length

    res.json({ metrics, blockedCount, period: '1h' })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /health — health check agregado de todos os servicos
// ---------------------------------------------------------------------------

const SERVICES = [
  // Serviços de infraestrutura
  { name: 'configurador',  url: process.env.CONFIGURADOR_URL         || 'http://localhost:8005' },
  // Super-servidor tenant — agrega atividades, cronometro, email, gabi, dashboard,
  // relatorios, historico, notificacoes, agendamento, preferencias, whatsapp
  { name: 'tenant-server', url: process.env.TENANT_SERVER_URL        || 'http://localhost:3001' },
  // Serviços não-tenant (processo próprio)
  { name: 'api-cockpit',   url: process.env.API_COCKPIT_SERVICE_URL  || 'http://localhost:8016' },
  { name: 'conector-erp',  url: process.env.CONECTOR_ERP_SERVICE_URL || 'http://localhost:8017' },
  // Produtos
  { name: 'simula-custo',  url: process.env.SIMULA_CUSTO_SERVICE_URL || 'http://localhost:8020' },
  { name: 'processo',      url: process.env.PROCESSO_SERVICE_URL      || 'http://localhost:8026' },
  { name: 'bid-frete',     url: process.env.BID_FRETE_SERVICE_URL    || 'http://localhost:8023' },
]

async function checkHealth(service: { name: string; url: string }): Promise<{
  service: string
  status: 'OK' | 'DEGRADED' | 'DOWN'
  latency_ms: number
  error?: string
}> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${service.url}/health`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const latency = Date.now() - start
    if (response.ok) {
      return { service: service.name, status: latency > 2000 ? 'DEGRADED' : 'OK', latency_ms: latency }
    }
    return { service: service.name, status: 'DEGRADED', latency_ms: latency, error: `HTTP ${response.status}` }
  } catch (err: any) {
    return {
      service: service.name,
      status: 'DOWN',
      latency_ms: Date.now() - start,
      error: err.name === 'AbortError' ? 'Timeout (5s)' : err.message,
    }
  }
}

adminSecurityRouter.get('/health', async (_req, res, next) => {
  try {
    const results = await Promise.all(SERVICES.map(checkHealth))

    // Persistir snapshot no banco
    for (const result of results) {
      await prisma.serviceHealth.upsert({
        where: { service: result.service },
        create: {
          service: result.service,
          url: SERVICES.find(s => s.name === result.service)?.url || '',
          status: result.status,
          latency_ms: result.latency_ms,
          last_error: result.error || null,
          checked_at: new Date(),
        },
        update: {
          status: result.status,
          latency_ms: result.latency_ms,
          last_error: result.error || null,
          checked_at: new Date(),
        },
      })
    }

    const okCount = results.filter(r => r.status === 'OK').length
    const degradedCount = results.filter(r => r.status === 'DEGRADED').length
    const downCount = results.filter(r => r.status === 'DOWN').length

    res.json({
      overall: downCount > 0 ? 'DOWN' : degradedCount > 0 ? 'DEGRADED' : 'OK',
      services: results,
      summary: { ok: okCount, degraded: degradedCount, down: downCount, total: results.length },
    })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /secrets — status de rotacao de secrets
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/secrets', async (_req, res, _next) => {
  // Em producao, datas de rotacao viriam de um registro no banco ou de um KMS.
  // Por ora, usamos env vars como proxy: se existem, estao configuradas.
  const secrets = [
    {
      name: 'INTERNAL_SERVICE_KEY',
      configured: !!process.env.INTERNAL_SERVICE_KEY,
    },
    {
      name: 'CLERK_SECRET_KEY',
      configured: !!process.env.CLERK_SECRET_KEY,
    },
    {
      name: 'STRIPE_SECRET_KEY',
      configured: !!process.env.STRIPE_SECRET_KEY,
    },
    {
      name: 'ENCRYPTION_KEY',
      configured: !!process.env.ENCRYPTION_KEY,
    },
  ]

  res.json({ secrets })
})

// ---------------------------------------------------------------------------
// POST /events — registrar evento (chamado internamente pelo securityAuditLogger)
// ---------------------------------------------------------------------------

const CreateEventSchema = z.object({
  tenant_id: z.string().min(1),
  actor_id: z.string().min(1),
  actor_type: z.enum(['USER', 'SYSTEM', 'GABI_IA', 'ADMIN']),
  action: z.string().min(1),
  severity: z.enum(['CRITICAL', 'WARNING', 'INFO']),
  status: z.enum(['BLOCKED', 'ALLOWED', 'DETECTED']).default('DETECTED'),
  description: z.string().optional(),
  ip: z.string().optional(),
  endpoint: z.string().optional(),
  user_id: z.string().optional(),
  product_id: z.string().optional(),
  correlation_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

adminSecurityRouter.post('/events', async (req, res, next) => {
  try {
    const data = CreateEventSchema.parse(req.body)

    const event = await prisma.securityEvent.create({ data })

    res.status(201).json({ event })
  } catch (err) {
    next(err)
  }
})
