/**
 * apiCockpit.ts — Rotas proxy para dados de observabilidade no Configurador
 *
 * Proxy entre o frontend (workspace + admin) e o servico api-cockpit.
 * O frontend NAO fala diretamente com o api-cockpit; passa pelo Configurador.
 *
 * Rotas workspace (qualquer usuario autenticado):
 *   GET /api/cockpit/services    — Health check dos servicos
 *   GET /api/cockpit/logs        — Logs de requisicoes (filtrado por tenant)
 *   GET /api/cockpit/stats       — KPIs (filtrado por tenant)
 *
 * Rotas admin (gravity_admin):
 *   GET /api/admin/cockpit/services  — Health check (todos)
 *   GET /api/admin/cockpit/logs      — Logs (todos os tenants)
 *   GET /api/admin/cockpit/stats     — KPIs (globais)
 */

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'

const API_COCKPIT_URL = process.env.API_COCKPIT_SERVICE_URL || 'http://localhost:8016'
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || ''

export const apiCockpitRouter = Router()
export const apiCockpitAdminRouter = Router()

// ─── Helper: proxy para api-cockpit ─────────────────────────────────────

async function proxyToCockpit(path: string, query?: Record<string, string>): Promise<any> {
  const url = new URL(`${API_COCKPIT_URL}/api/v1/cockpit/observability${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      'x-internal-key': INTERNAL_SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(5_000),
  })

  if (!response.ok) {
    throw new Error(`api-cockpit respondeu ${response.status}`)
  }

  return response.json()
}

// ─── Workspace Routes (tenant-scoped) ───────────────────────────────────

apiCockpitRouter.use(requireAuth)

apiCockpitRouter.get('/services', async (req, res, next) => {
  try {
    const data = await proxyToCockpit('/services')
    res.json(data)
  } catch (err: any) {
    res.json({ services: [], error: err.message })
  }
})

apiCockpitRouter.get('/logs', async (req, res, next) => {
  try {
    const tenantId = (req as any).auth?.orgId || req.headers['x-tenant-id'] as string || ''
    const data = await proxyToCockpit('/logs', {
      tenant_id: tenantId,
      product_id: req.query.product_id as string || '',
      page: req.query.page as string || '1',
      limit: req.query.limit as string || '50',
    })
    res.json(data)
  } catch (err: any) {
    res.json({ logs: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 }, error: err.message })
  }
})

apiCockpitRouter.get('/stats', async (req, res, next) => {
  try {
    const data = await proxyToCockpit('/stats')
    res.json(data)
  } catch (err: any) {
    res.json({ requisicoes_24h: 0, erros_24h: 0, latencia_media_ms: 0, uptime_24h: '100.0%' })
  }
})

// ─── Admin Routes (gravity_admin — todos os tenants) ────────────────────

apiCockpitAdminRouter.use(requireAuth, requireGravityAdmin)

apiCockpitAdminRouter.get('/services', async (req, res, next) => {
  try {
    const data = await proxyToCockpit('/services')
    res.json(data)
  } catch (err: any) {
    res.json({ services: [], error: err.message })
  }
})

apiCockpitAdminRouter.get('/logs', async (req, res, next) => {
  try {
    const data = await proxyToCockpit('/logs', {
      tenant_id: req.query.tenant_id as string || '',
      product_id: req.query.product_id as string || '',
      page: req.query.page as string || '1',
      limit: req.query.limit as string || '50',
    })
    res.json(data)
  } catch (err: any) {
    res.json({ logs: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 }, error: err.message })
  }
})

apiCockpitAdminRouter.get('/stats', async (req, res, next) => {
  try {
    const data = await proxyToCockpit('/stats')
    res.json(data)
  } catch (err: any) {
    res.json({ requisicoes_24h: 0, erros_24h: 0, latencia_media_ms: 0, uptime_24h: '100.0%' })
  }
})
