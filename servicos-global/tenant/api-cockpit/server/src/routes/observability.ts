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

// ─── In-Memory Store (substituir por Prisma/Redis em producao) ───────────

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
}

interface ServiceHealth {
  name: string
  status: 'online' | 'degraded' | 'offline'
  latency: number
  version: string
  lastCheck: string
  type: 'core' | 'product' | 'gateway'
}

// Store em memoria — em producao usar Prisma (tabela LogConsumo) ou Redis TimeSeries
const observabilityStore: ObservabilityEntry[] = []
const MAX_STORE_SIZE = 10_000

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

router.post('/ingest', requireInternalKey, (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = IngestSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Payload invalido', issues: parsed.error.issues })
    }

    // Adicionar ao store (FIFO — remove os mais antigos se exceder limite)
    observabilityStore.push(...parsed.data.entries)
    while (observabilityStore.length > MAX_STORE_SIZE) {
      observabilityStore.shift()
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

    let filtered = [...observabilityStore]

    if (filtros.tenant_id) {
      filtered = filtered.filter(e => e.tenant_id === filtros.tenant_id)
    }
    if (filtros.product_id) {
      filtered = filtered.filter(e => e.product_id === filtros.product_id)
    }
    if (filtros.status_min) {
      filtered = filtered.filter(e => e.status_code >= filtros.status_min!)
    }
    if (filtros.status_max) {
      filtered = filtered.filter(e => e.status_code <= filtros.status_max!)
    }

    // Ordenar por timestamp desc (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const total = filtered.length
    const skip = (filtros.page - 1) * filtros.limit
    const logs = filtered.slice(skip, skip + filtros.limit).map(e => ({
      id: `${e.timestamp}-${e.endpoint}-${e.method}`,
      timestamp: e.timestamp,
      data: e.timestamp.split('T')[0],
      hora: e.timestamp.split('T')[1]?.slice(0, 8) || '',
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

router.get('/stats', (req: Request, res: Response, next: NextFunction) => {
  try {
    const agora = Date.now()
    const h24 = agora - 24 * 60 * 60 * 1000

    const ultimas24h = observabilityStore.filter(e => new Date(e.timestamp).getTime() >= h24)

    const totalRequests = ultimas24h.length
    const erros = ultimas24h.filter(e => e.status_code >= 500).length
    const latencias = ultimas24h.map(e => e.latency_ms)
    const latenciaMedia = latencias.length > 0
      ? Math.round(latencias.reduce((a, b) => a + b, 0) / latencias.length)
      : 0

    // Requests por produto
    const porProduto: Record<string, number> = {}
    for (const e of ultimas24h) {
      porProduto[e.product_id] = (porProduto[e.product_id] || 0) + 1
    }

    // Requests por status code group
    const porStatus: Record<string, number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }
    for (const e of ultimas24h) {
      const grupo = `${Math.floor(e.status_code / 100)}xx`
      if (grupo in porStatus) {
        porStatus[grupo]++
      }
    }

    const uptime = totalRequests > 0
      ? ((1 - erros / totalRequests) * 100).toFixed(1)
      : '100.0'

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
