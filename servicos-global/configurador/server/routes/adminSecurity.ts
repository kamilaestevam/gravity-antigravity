// server/routes/adminSecurity.ts
// Rotas do painel de Seguranca — gravity_admin only + rota interna S2S
//
// Admin (/api/admin/security/*) — requireAuth + requireGravityAdmin:
//   GET  /overview   — consolidado (stats + health + ratelimit + secrets) em 1 request
//   GET  /events     — eventos de seguranca (paginado, filtros)
//   GET  /stats      — contadores agregados
//   GET  /health     — health check agregado de todos os servicos
//   GET  /ratelimit  — metricas de rate limiting ativas
//   GET  /secrets    — status de rotacao de secrets
//
// Internal (/api/internal/security/*) — requireInternalKey:
//   POST /events     — registrar evento (chamado pelo securityAuditLogger do historico-global)

import { Router, type Request } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { prisma } from '../lib/prisma.js'
import { Prisma } from '../../../../configurador/generated/index.js'
import { AuditService } from '../../../tenant/historico-global/server/services/audit.service.js'

export const adminSecurityRouter = Router()
export const adminSecurityInternalRouter = Router()

// Cadeia obrigatoria para rotas admin: auth → gravity_admin check
adminSecurityRouter.use(requireAuth, requireGravityAdmin)

// ─── Tipos & Helpers ────────────────────────────────────────────────────────

type ServiceStatus = 'OK' | 'DEGRADED' | 'DOWN'

interface ServiceHealthResult {
  service: string
  status: ServiceStatus
  latency_ms: number
  error?: string
}

interface HealthCacheEntry {
  data: {
    overall: ServiceStatus
    services: ServiceHealthResult[]
    summary: { ok: number; degraded: number; down: number; total: number }
  }
  expiresAt: number
}

/** Cache in-memory do health check (TTL 10s). Evita 7 fetches por tick de polling. */
const HEALTH_CACHE_TTL_MS = 10_000
let healthCache: HealthCacheEntry | null = null

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

async function checkHealth(service: { name: string; url: string }): Promise<ServiceHealthResult> {
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
  } catch (err: unknown) {
    const latency = Date.now() - start
    const name = err instanceof Error ? err.name : ''
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return {
      service: service.name,
      status: 'DOWN',
      latency_ms: latency,
      error: name === 'AbortError' ? 'Timeout (5s)' : message,
    }
  }
}

/**
 * Executa health check de todos os serviços, persiste snapshot no banco
 * e cacheia o resultado por HEALTH_CACHE_TTL_MS.
 */
async function fetchHealthSnapshot(): Promise<HealthCacheEntry['data']> {
  // Cache hit
  if (healthCache && Date.now() < healthCache.expiresAt) {
    return healthCache.data
  }

  const results = await Promise.all(SERVICES.map(checkHealth))

  // Persistir snapshot no banco (fire-and-forget — não bloqueia response se upsert falhar)
  Promise.all(
    results.map((result) =>
      prisma.serviceHealth.upsert({
        where: { service: result.service },
        create: {
          service: result.service,
          url: SERVICES.find((s) => s.name === result.service)?.url || '',
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
      }),
    ),
  ).catch((err: unknown) => {
    console.error('[adminSecurity] Falha ao persistir ServiceHealth:', err instanceof Error ? err.message : err)
  })

  const okCount = results.filter((r) => r.status === 'OK').length
  const degradedCount = results.filter((r) => r.status === 'DEGRADED').length
  const downCount = results.filter((r) => r.status === 'DOWN').length

  const data = {
    overall: (downCount > 0 ? 'DOWN' : degradedCount > 0 ? 'DEGRADED' : 'OK') as ServiceStatus,
    services: results,
    summary: { ok: okCount, degraded: degradedCount, down: downCount, total: results.length },
  }

  healthCache = { data, expiresAt: Date.now() + HEALTH_CACHE_TTL_MS }
  return data
}

/** Queries agregadas de SecurityEvent (últimas 24h) em 1 round-trip usando groupBy. */
async function fetchStats() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [totalEvents, bySeverity, blockedCount, recentEvents] = await Promise.all([
    prisma.securityEvent.count({ where: { created_at: { gte: since } } }),
    prisma.securityEvent.groupBy({
      by: ['severity'],
      where: { created_at: { gte: since } },
      _count: { _all: true },
    }),
    prisma.securityEvent.count({ where: { status: 'BLOCKED', created_at: { gte: since } } }),
    prisma.securityEvent.findMany({
      where: { created_at: { gte: since } },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: { id: true, action: true, severity: true, created_at: true },
    }),
  ])

  const criticalCount = bySeverity.find((g) => g.severity === 'CRITICAL')?._count._all ?? 0
  const warningCount = bySeverity.find((g) => g.severity === 'WARNING')?._count._all ?? 0

  return {
    period: '24h' as const,
    totalEvents,
    criticalCount,
    warningCount,
    blockedCount,
    recentEvents,
  }
}

async function fetchRateLimitMetrics() {
  const since = new Date(Date.now() - 60 * 60 * 1000) // última hora
  const metrics = await prisma.rateLimitMetric.findMany({
    where: { created_at: { gte: since } },
    orderBy: { created_at: 'desc' },
    take: 100,
  })
  const blockedCount = metrics.filter((m) => m.blocked).length
  return { metrics, blockedCount, period: '1h' as const }
}

function fetchSecretsSnapshot() {
  // Em produção, datas de rotação viriam de um registro no banco ou de um KMS.
  // Por ora, usamos env vars como proxy: se existem, estão configuradas.
  // TODO(Coordenador): criar model Secret com tracking de rotated_at/expires_at.
  return {
    secrets: [
      { name: 'INTERNAL_SERVICE_KEY', configured: !!process.env.INTERNAL_SERVICE_KEY, prefix: (process.env.INTERNAL_SERVICE_KEY ?? '').slice(0, 6) },
      { name: 'CLERK_SECRET_KEY',     configured: !!process.env.CLERK_SECRET_KEY,     prefix: (process.env.CLERK_SECRET_KEY ?? '').slice(0, 6) },
      { name: 'STRIPE_SECRET_KEY',    configured: !!process.env.STRIPE_SECRET_KEY,    prefix: (process.env.STRIPE_SECRET_KEY ?? '').slice(0, 6) },
      { name: 'ENCRYPTION_KEY',       configured: !!process.env.ENCRYPTION_KEY,       prefix: (process.env.ENCRYPTION_KEY ?? '').slice(0, 6) },
    ],
  }
}

function auditPanelAccess(req: Request, action: string): void {
  // Fire-and-forget: registra o acesso ao painel de segurança via AuditService
  AuditService.log({
    tenant_id: req.auth.tenantId,
    actor_type: 'USER',
    actor_id: req.auth.userId,
    actor_name: req.auth.userId,
    actor_ip: req.ip,
    module: 'admin',
    resource_type: 'SecurityPanel',
    action,
    action_detail: `Painel de segurança — ${action}`,
    status: 'SUCCESS',
  }).catch(() => { /* fire-and-forget */ })
}

// ---------------------------------------------------------------------------
// GET /overview — dados consolidados (uma request em vez de 5)
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/overview', async (req, res, next) => {
  try {
    const [stats, health, ratelimit] = await Promise.all([
      fetchStats(),
      fetchHealthSnapshot(),
      fetchRateLimitMetrics(),
    ])
    const secrets = fetchSecretsSnapshot()

    auditPanelAccess(req, 'SECURITY_PANEL_VIEWED')

    res.json({ stats, health, ratelimit, secrets })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /events — listar eventos de seguranca
// ---------------------------------------------------------------------------

const EventsQuerySchema = z.object({
  severity: z.enum(['CRITICAL', 'WARNING', 'INFO']).optional(),
  action: z.string().max(100).optional(),
  tenant_id: z.string().max(100).optional(),
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
    const stats = await fetchStats()
    res.json(stats)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /ratelimit — metricas de rate limiting
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/ratelimit', async (_req, res, next) => {
  try {
    res.json(await fetchRateLimitMetrics())
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /health — health check agregado (com cache TTL 10s)
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/health', async (_req, res, next) => {
  try {
    res.json(await fetchHealthSnapshot())
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /secrets — status de rotacao de secrets
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/secrets', (_req, res) => {
  res.json(fetchSecretsSnapshot())
})

// ---------------------------------------------------------------------------
// POST /events — REMOVIDA do router admin
//
// Esta rota era chamada pelo securityAuditLogger do historico-global para
// persistir eventos na tabela SecurityEvent. Mas o logger usa x-internal-key
// (não Bearer JWT) e caía em 401 aqui — resultado: a tabela ficava VAZIA e
// o painel /admin/seguranca mostrava "0 eventos" permanentemente, com
// compliance LGPD/SOC2 quebrado silenciosamente.
//
// Movida para `adminSecurityInternalRouter` abaixo, montada em
// /api/internal/security/events com requireInternalKey.
// ---------------------------------------------------------------------------

const CreateEventSchema = z.object({
  tenant_id: z.string().min(1),
  actor_id: z.string().min(1),
  actor_type: z.enum(['USER', 'SYSTEM', 'GABI_IA', 'ADMIN']),
  action: z.string().min(1).max(100),
  severity: z.enum(['CRITICAL', 'WARNING', 'INFO']),
  status: z.enum(['BLOCKED', 'ALLOWED', 'DETECTED']).default('DETECTED'),
  description: z.string().max(1000).optional(),
  ip: z.string().max(64).optional(),
  endpoint: z.string().max(500).optional(),
  user_id: z.string().optional(),
  product_id: z.string().optional(),
  correlation_id: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

adminSecurityInternalRouter.post('/events', requireInternalKey, async (req, res, next) => {
  try {
    const data = CreateEventSchema.parse(req.body)
    // Prisma espera `InputJsonValue` para `metadata`; o Zod gera `Record<string, unknown>`.
    // Cast explícito para satisfazer o tipo do Prisma sem perder validação do schema.
    const event = await prisma.securityEvent.create({
      data: {
        ...data,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    })
    res.status(201).json({ event })
  } catch (err) {
    next(err)
  }
})
