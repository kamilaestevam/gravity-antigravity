// server/routes/adminSecurity.ts
// Rotas do painel de Seguranca — gravity_admin only + rota interna S2S
//
// Admin (/api/v1/admin/eventos-seguranca/*) — requireAuth + requireGravityAdmin:
//   GET  /visao-geral   — consolidado (stats + health + ratelimit + secrets) em 1 request
//   GET  /              — eventos de seguranca (paginado, filtros)
//   GET  /estatisticas  — contadores agregados
//   GET  /health        — health check agregado de todos os servicos
//   GET  /rate-limit    — metricas de rate limiting ativas
//   GET  /segredos      — status de rotacao de secrets
//
// Internal (/api/v1/internal/eventos-seguranca/*) — requireInternalKey:
//   POST /              — registrar evento (chamado pelo securityAuditLogger do historico-global)

import { Router, type Request } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { prisma } from '../lib/prisma.js'
import { Prisma } from '../../../../configurador/generated/index.js'
import { AuditService } from '../../../organizacao/historico-global/server/services/audit.service.js'

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
      prisma.servicos.upsert({
        where: { servico_servicos: result.service },
        create: {
          servico_servicos: result.service,
          url_servicos: SERVICES.find((s) => s.name === result.service)?.url || '',
          status_servicos: result.status,
          latencia_ms_servicos: result.latency_ms,
          ultimo_erro_servicos: result.error || null,
          data_verificacao_servicos: new Date(),
        },
        update: {
          status_servicos: result.status,
          latencia_ms_servicos: result.latency_ms,
          ultimo_erro_servicos: result.error || null,
          data_verificacao_servicos: new Date(),
        },
      }),
    ),
  ).catch((err: unknown) => {
    console.error('[adminSecurity] Falha ao persistir Servicos:', err instanceof Error ? err.message : err)
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

/** Queries agregadas de Seguranca (últimas 24h) em 1 round-trip usando groupBy. */
async function fetchStats() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [totalEvents, bySeverity, blockedCount, recentEvents] = await Promise.all([
    prisma.seguranca.count({ where: { data_criacao_seguranca: { gte: since } } }),
    prisma.seguranca.groupBy({
      by: ['severidade_seguranca'],
      where: { data_criacao_seguranca: { gte: since } },
      _count: { _all: true },
    }),
    prisma.seguranca.count({
      where: { status_seguranca: 'BLOCKED', data_criacao_seguranca: { gte: since } },
    }),
    prisma.seguranca.findMany({
      where: { data_criacao_seguranca: { gte: since } },
      orderBy: { data_criacao_seguranca: 'desc' },
      take: 5,
      select: {
        id_seguranca: true,
        acao_seguranca: true,
        severidade_seguranca: true,
        data_criacao_seguranca: true,
      },
    }),
  ])

  const criticalCount =
    bySeverity.find((g) => g.severidade_seguranca === 'CRITICAL')?._count._all ?? 0
  const warningCount =
    bySeverity.find((g) => g.severidade_seguranca === 'WARNING')?._count._all ?? 0

  // DTO: Seguranca rename → contrato legado da UI
  const recentEventsDto = recentEvents.map((e) => ({
    id: e.id_seguranca,
    action: e.acao_seguranca,
    severity: e.severidade_seguranca,
    created_at: e.data_criacao_seguranca,
  }))

  return {
    period: '24h' as const,
    totalEvents,
    criticalCount,
    warningCount,
    blockedCount,
    recentEvents: recentEventsDto,
  }
}

async function fetchRateLimitMetrics() {
  const since = new Date(Date.now() - 60 * 60 * 1000) // última hora
  const rows = await prisma.requisicoes.findMany({
    where: { data_criacao_requisicoes: { gte: since } },
    orderBy: { data_criacao_requisicoes: 'desc' },
    take: 100,
  })
  // DTO: Requisicoes rename → contrato legado da UI
  const metrics = rows.map((r) => ({
    id: r.id_requisicoes,
    key: r.chave_requisicoes,
    tenant_id: r.id_organizacao_requisicoes,
    ip: r.ip_requisicoes,
    endpoint: r.endpoint_requisicoes,
    count: r.contagem_requisicoes,
    limit_max: r.limite_maximo_requisicoes,
    blocked: r.bloqueado_requisicoes,
    window_start: r.inicio_janela_requisicoes,
    created_at: r.data_criacao_requisicoes,
  }))
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
      { name: 'ENCRYPTION_KEY',       configured: !!process.env.ENCRYPTION_KEY,       prefix: (process.env.ENCRYPTION_KEY ?? '').slice(0, 6) },
    ],
  }
}

function auditPanelAccess(req: Request, action: string): void {
  // Fire-and-forget: registra o acesso ao painel de segurança via AuditService
  AuditService.log({
    tenant_id: req.auth.id_organizacao,
    actor_type: 'USER',
    actor_id: req.auth.id_usuario,
    actor_name: req.auth.id_usuario,
    actor_ip: req.ip,
    module: 'admin',
    resource_type: 'SecurityPanel',
    action,
    action_detail: `Painel de segurança — ${action}`,
    status: 'SUCCESS',
  }).catch(() => { /* fire-and-forget */ })
}

// ---------------------------------------------------------------------------
// GET /visao-geral — dados consolidados (uma request em vez de 5)
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/visao-geral', async (req, res, next) => {
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
// GET / — listar eventos de seguranca
// ---------------------------------------------------------------------------

const EventsQuerySchema = z.object({
  severity: z.enum(['CRITICAL', 'WARNING', 'INFO']).optional(),
  action: z.string().max(100).optional(),
  tenant_id: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
})

adminSecurityRouter.get('/', async (req, res, next) => {
  try {
    const query = EventsQuerySchema.parse(req.query)

    const where: Record<string, unknown> = {}
    if (query.severity) where.severidade_seguranca = query.severity
    if (query.action) where.acao_seguranca = query.action
    if (query.tenant_id) where.id_organizacao_seguranca = query.tenant_id

    const [events, total] = await Promise.all([
      prisma.seguranca.findMany({
        where,
        orderBy: { data_criacao_seguranca: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.seguranca.count({ where }),
    ])

    // DTO: Seguranca rename → contrato legado da UI
    const eventsDto = events.map((e) => ({
      id: e.id_seguranca,
      tenant_id: e.id_organizacao_seguranca,
      actor_id: e.id_ator_seguranca,
      actor_type: e.tipo_ator_seguranca,
      action: e.acao_seguranca,
      severity: e.severidade_seguranca,
      status: e.status_seguranca,
      description: e.descricao_seguranca,
      ip: e.ip_seguranca,
      endpoint: e.endpoint_seguranca,
      user_id: e.id_usuario_seguranca,
      product_id: e.id_produto_seguranca,
      correlation_id: e.id_correlacao_seguranca,
      metadata: e.metadata_seguranca,
      created_at: e.data_criacao_seguranca,
    }))

    res.json({
      events: eventsDto,
      pagination: { total, limit: query.limit, offset: query.offset },
    })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /estatisticas — contadores agregados (ultimas 24h)
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/estatisticas', async (_req, res, next) => {
  try {
    const stats = await fetchStats()
    res.json(stats)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /rate-limit — metricas de rate limiting
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/rate-limit', async (_req, res, next) => {
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
// GET /segredos — status de rotacao de secrets
// ---------------------------------------------------------------------------

adminSecurityRouter.get('/segredos', (_req, res) => {
  res.json(fetchSecretsSnapshot())
})

// ---------------------------------------------------------------------------
// POST /events — REMOVIDA do router admin
//
// Esta rota era chamada pelo securityAuditLogger do historico-global para
// persistir eventos na tabela Seguranca. Mas o logger usa x-internal-key
// (não Bearer JWT) e caía em 401 aqui — resultado: a tabela ficava VAZIA e
// o painel /admin/seguranca mostrava "0 eventos" permanentemente, com
// compliance LGPD/SOC2 quebrado silenciosamente.
//
// Movida para `adminSecurityInternalRouter` abaixo, montada em
// /api/v1/internal/eventos-seguranca com requireInternalKey.
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

adminSecurityInternalRouter.post('/', requireInternalKey, async (req, res, next) => {
  try {
    const data = CreateEventSchema.parse(req.body)
    // Prisma espera `InputJsonValue` para `metadata`; o Zod gera `Record<string, unknown>`.
    // Cast explícito para satisfazer o tipo do Prisma sem perder validação do schema.
    // Mapeia campos legados do Zod para o schema Prisma renomeado
    const event = await prisma.seguranca.create({
      data: {
        id_organizacao_seguranca: data.tenant_id,
        id_ator_seguranca: data.actor_id,
        tipo_ator_seguranca: data.actor_type,
        acao_seguranca: data.action,
        severidade_seguranca: data.severity,
        status_seguranca: data.status,
        descricao_seguranca: data.description,
        ip_seguranca: data.ip,
        endpoint_seguranca: data.endpoint,
        id_usuario_seguranca: data.user_id,
        id_produto_seguranca: data.product_id,
        id_correlacao_seguranca: data.correlation_id,
        metadata_seguranca: data.metadata as Prisma.InputJsonValue | undefined,
      },
    })
    // DTO: Seguranca rename → contrato legado para o caller (securityAuditLogger)
    res.status(201).json({
      event: {
        id: event.id_seguranca,
        tenant_id: event.id_organizacao_seguranca,
        actor_id: event.id_ator_seguranca,
        actor_type: event.tipo_ator_seguranca,
        action: event.acao_seguranca,
        severity: event.severidade_seguranca,
        status: event.status_seguranca,
        description: event.descricao_seguranca,
        ip: event.ip_seguranca,
        endpoint: event.endpoint_seguranca,
        user_id: event.id_usuario_seguranca,
        product_id: event.id_produto_seguranca,
        correlation_id: event.id_correlacao_seguranca,
        metadata: event.metadata_seguranca,
        created_at: event.data_criacao_seguranca,
      },
    })
  } catch (err) {
    next(err)
  }
})
