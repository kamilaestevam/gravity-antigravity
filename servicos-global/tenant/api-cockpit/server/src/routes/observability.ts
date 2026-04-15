/**
 * observability.ts — Rotas de ingestao e consulta de metricas de API
 *
 * POST /ingest          Recebe batch de metricas dos produtos (S2S)
 * GET  /services        Lista servicos com status (health check)
 * GET  /logs            Lista logs de requisicoes (paginado)
 * GET  /stats           KPIs agregados (24h uptime, latencia media, etc.)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/requireInternalKey'

const router = Router()

// ─── In-Memory Store (TODO: migrar para Prisma ObservabilityEvent) ───────
//
// Status atual: store em memória, perdido em restart, MAX 10k registros.
// Dev/staging usam isto; produção precisa da migração.
//
// Roadmap da migração (requer Coordenador):
//   1. Adicionar `ObservabilityEvent` model ao fragment.prisma do api-cockpit
//      (não reusar LogConsumo — tem `token_id` required que não se aplica aqui)
//      Campos: tenant_id, product_id, user_id?, endpoint, method,
//              status_code, latency_ms, correlation_id?, timestamp, created_at
//      Índices: [tenant_id, timestamp DESC], [tenant_id, product_id, timestamp],
//               [tenant_id, status_code, timestamp]
//   2. Compose-tenant-schema.ts merge + prisma migrate dev
//   3. Reescrever POST /ingest → prisma.observabilityEvent.createMany
//   4. Reescrever GET /logs → prisma.observabilityEvent.findMany com filtros
//   5. Reescrever GET /stats → count + groupBy
//   6. Particionar por mês (similar ao HistoryLog) para compliance LGPD 5+ anos

interface ObservabilityEntry {
  tenant_id: string
  product_id: string
  user_id: string | null
  endpoint: string
  method: string
  status_code: number
  latency_ms: number
  correlation_id: string | null
  timestamp: string
  // Pré-computados no ingest pra evitar split('T') repetido no GET /logs
  _ts_ms: number
  _data: string
  _hora: string
}

/** Dado cru vindo do cliente (antes do pré-processamento). */
interface ObservabilityInput {
  tenant_id: string
  product_id: string
  user_id: string | null
  endpoint: string
  method: string
  status_code: number
  latency_ms: number
  correlation_id: string | null
  timestamp: string
}

interface ServiceHealth {
  name: string
  status: 'online' | 'degraded' | 'offline'
  latency: number
  version: string
  lastCheck: string
  type: 'core' | 'product' | 'gateway'
}

// Store em memoria — em producao usar Prisma (ObservabilityEvent) ou Redis TimeSeries
const observabilityStore: ObservabilityEntry[] = []
const MAX_STORE_SIZE = 10_000
const OVERFLOW_WARNING_THRESHOLD = Math.floor(MAX_STORE_SIZE * 0.9) // 90%
let overflowWarningEmitted = false

// Servicos conhecidos para health check
const KNOWN_SERVICES: Array<{ name: string; port: number; type: 'core' | 'product' | 'gateway' }> = [
  { name: 'configurador', port: 8003, type: 'core' },
  { name: 'api-cockpit', port: 8016, type: 'core' },
  { name: 'dashboard', port: 8010, type: 'core' },
  { name: 'simula-custo', port: 8020, type: 'product' },
  { name: 'bid-frete', port: 8023, type: 'product' },
  { name: 'bid-cambio', port: 8025, type: 'product' },
  { name: 'processo', port: 8026, type: 'product' },
  { name: 'pedido', port: 8026, type: 'product' },
  { name: 'lpco', port: 8027, type: 'product' },
  { name: 'nf-importacao', port: 8028, type: 'product' },
  { name: 'email', port: 8022, type: 'core' },
  { name: 'historico', port: 8014, type: 'core' },
  { name: 'notificacoes', port: 8013, type: 'core' },
  { name: 'gabi', port: 8015, type: 'core' },
]

// ─── Schemas ─────────────────────────────────────────────────────────────

const IngestSchema = z.object({
  entries: z.array(z.object({
    tenant_id: z.string(),
    product_id: z.string(),
    user_id: z.string().nullable(),
    endpoint: z.string(),
    method: z.string(),
    status_code: z.number().int(),
    latency_ms: z.number().int(),
    correlation_id: z.string().nullable(),
    timestamp: z.string(),
  })).min(1).max(500),
})

const LogsQuerySchema = z.object({
  tenant_id: z.string().optional(),
  product_id: z.string().optional(),
  status_min: z.coerce.number().int().optional(),
  status_max: z.coerce.number().int().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// ─── POST /ingest — Receber batch de metricas ───────────────────────────

/** Pré-computa campos derivados para evitar string.split() repetido em GET /logs. */
function enrichEntry(input: ObservabilityInput): ObservabilityEntry {
  const tIdx = input.timestamp.indexOf('T')
  const data = tIdx >= 0 ? input.timestamp.slice(0, tIdx) : input.timestamp
  const hora = tIdx >= 0 ? input.timestamp.slice(tIdx + 1, tIdx + 9) : ''
  return {
    ...input,
    _ts_ms: Date.parse(input.timestamp),
    _data: data,
    _hora: hora,
  }
}

router.post('/ingest', requireInternalKey, (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = IngestSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Payload invalido', issues: parsed.error.issues })
    }

    // Enriquece no ingest (1x por entry) em vez de no GET (N leituras depois)
    const enriched = parsed.data.entries.map(enrichEntry)
    observabilityStore.push(...enriched)

    // FIFO: remove os mais antigos se exceder limite.
    // Usa splice em vez de shift() em loop — O(1) vs O(n) por iteração.
    if (observabilityStore.length > MAX_STORE_SIZE) {
      observabilityStore.splice(0, observabilityStore.length - MAX_STORE_SIZE)
    }

    // Warning uma vez quando store se aproxima do limite — sinal pra migrar para Prisma
    if (observabilityStore.length >= OVERFLOW_WARNING_THRESHOLD && !overflowWarningEmitted) {
      overflowWarningEmitted = true
      console.warn(
        `[observability] Store em memória atingiu ${observabilityStore.length}/${MAX_STORE_SIZE} ` +
        `registros. Dados antigos começam a ser descartados. Migrar para Prisma ObservabilityEvent.`
      )
    }

    res.json({ ingested: parsed.data.entries.length, total: observabilityStore.length })
  } catch (err) {
    next(err)
  }
})

// ─── GET /services — Health check de todos os servicos ──────────────────

router.get('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services: ServiceHealth[] = []

    const checks = KNOWN_SERVICES.map(async (svc) => {
      const start = Date.now()
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3_000)

        const resp = await fetch(`http://localhost:${svc.port}/health`, {
          signal: controller.signal,
        })
        clearTimeout(timeout)

        const latency = Date.now() - start
        const data = await resp.json().catch(() => ({}))

        services.push({
          name: svc.name,
          status: resp.ok ? (latency > 1000 ? 'degraded' : 'online') : 'degraded',
          latency,
          version: (data as any).version || '1.0.0',
          lastCheck: new Date().toISOString(),
          type: svc.type,
        })
      } catch {
        services.push({
          name: svc.name,
          status: 'offline',
          latency: Date.now() - start,
          version: '-',
          lastCheck: new Date().toISOString(),
          type: svc.type,
        })
      }
    })

    await Promise.allSettled(checks)

    // Ordenar: online primeiro, depois degraded, depois offline
    const order = { online: 0, degraded: 1, offline: 2 }
    services.sort((a, b) => order[a.status] - order[b.status])

    res.json({ services })
  } catch (err) {
    next(err)
  }
})

// ─── GET /logs — Consultar logs de requisicoes ──────────────────────────

router.get('/logs', (req: Request, res: Response, next: NextFunction) => {
  try {
    const filtros = LogsQuerySchema.parse(req.query)

    // Filtro único — O(n) em vez de O(n×4) com 4 filters sequenciais
    const { tenant_id, product_id, status_min, status_max } = filtros
    const filtered = observabilityStore.filter((e) => {
      if (tenant_id && e.tenant_id !== tenant_id) return false
      if (product_id && e.product_id !== product_id) return false
      if (status_min !== undefined && e.status_code < status_min) return false
      if (status_max !== undefined && e.status_code > status_max) return false
      return true
    })

    // Ordena por timestamp desc usando _ts_ms pré-computado (sem parse a cada compare)
    filtered.sort((a, b) => b._ts_ms - a._ts_ms)

    const total = filtered.length
    const skip = (filtros.page - 1) * filtros.limit
    const logs = filtered.slice(skip, skip + filtros.limit).map((e) => ({
      id: `${e.timestamp}-${e.endpoint}-${e.method}`,
      timestamp: e.timestamp,
      data: e._data, // pré-computado no ingest
      hora: e._hora, // pré-computado no ingest
      method: e.method,
      path: e.endpoint,
      endpoint: e.endpoint,
      statusCode: e.status_code,
      status: e.status_code < 400 ? 'SUCESSO' : e.status_code < 500 ? 'ERRO_CLIENTE' : 'ERRO_SERVER',
      duracao: `${e.latency_ms}ms`,
      organizacao: e.tenant_id,
      produto: e.product_id,
      metodo: e.method,
    }))

    res.json({
      logs,
      pagination: { page: filtros.page, limit: filtros.limit, total, pages: Math.ceil(total / filtros.limit) },
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /stats — KPIs agregados ────────────────────────────────────────

router.get('/stats', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const h24 = Date.now() - 24 * 60 * 60 * 1000

    // Single pass — filter, count, sum, groupBy em 1 loop só (era 4 iterações antes)
    let totalRequests = 0
    let erros = 0
    let latencySum = 0
    const porProduto: Record<string, number> = {}
    const porStatus: Record<string, number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }

    for (const e of observabilityStore) {
      if (e._ts_ms < h24) continue
      totalRequests++
      latencySum += e.latency_ms
      if (e.status_code >= 500) erros++
      porProduto[e.product_id] = (porProduto[e.product_id] || 0) + 1
      const grupo = `${Math.floor(e.status_code / 100)}xx`
      if (grupo in porStatus) porStatus[grupo]++
    }

    const latenciaMedia = totalRequests > 0 ? Math.round(latencySum / totalRequests) : 0
    const uptime = totalRequests > 0 ? ((1 - erros / totalRequests) * 100).toFixed(1) : '100.0'

    res.json({
      requisicoes_24h: totalRequests,
      erros_24h: erros,
      latencia_media_ms: latenciaMedia,
      uptime_24h: `${uptime}%`,
      por_produto: porProduto,
      por_status: porStatus,
    })
  } catch (err) {
    next(err)
  }
})

export { router as observabilityRouter }
