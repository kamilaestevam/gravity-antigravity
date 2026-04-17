/**
 * apiCockpit.ts — Rotas proxy para dados de observabilidade no Configurador
 *
 * Proxy entre o frontend (workspace + admin) e o servico api-cockpit.
 * O frontend NAO fala diretamente com o api-cockpit; passa pelo Configurador.
 *
 * Rotas workspace (qualquer usuario autenticado):
 *   GET /api/v1/api-cockpit/services    — Health check dos servicos
 *   GET /api/v1/api-cockpit/logs        — Logs de requisicoes (filtrado por tenant)
 *   GET /api/v1/api-cockpit/stats       — KPIs (filtrado por tenant)
 *
 * Rotas admin (gravity_admin):
 *   GET /api/admin/api-cockpit/services  — Health check (todos)
 *   GET /api/admin/api-cockpit/logs      — Logs (todos os tenants)
 *   GET /api/admin/api-cockpit/stats     — KPIs (globais)
 *   GET /api/admin/api-cockpit/gabi-usage — Custos GABI IA agregados (todos os tenants)
 */

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { rateLimitPresets } from '../middleware/rateLimiter.js'

const API_COCKPIT_URL = process.env.API_COCKPIT_SERVICE_URL || 'http://localhost:8016'
const GABI_SERVICE_URL = process.env.GABI_SERVICE_URL || 'http://localhost:3001'
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || ''
const IS_DEV = process.env.NODE_ENV !== 'production'

export const apiCockpitRouter = Router()
export const apiCockpitAdminRouter = Router()

/**
 * Tipo genérico da resposta do api-cockpit proxy.
 * Em produção, err.message é mascarada para evitar vazar URLs internas,
 * timeouts ou stack traces. Em dev, o err.message real é mantido para
 * debugging.
 */
function maskError(err: unknown): string {
  if (IS_DEV && err instanceof Error) return err.message
  return 'Serviço de observabilidade temporariamente indisponível'
}

// ─── Helper: proxy para api-cockpit ─────────────────────────────────────

async function proxyToCockpit(path: string, query?: Record<string, string>): Promise<unknown> {
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

apiCockpitRouter.use(rateLimitPresets.internal(), requireAuth)

apiCockpitRouter.get('/services', async (_req, res) => {
  try {
    const data = await proxyToCockpit('/services')
    res.json(data)
  } catch (err) {
    res.json({ services: [], error: maskError(err) })
  }
})

apiCockpitRouter.get('/logs', async (req, res) => {
  try {
    const tenantId = req.auth?.tenantId || (req.headers['x-tenant-id'] as string) || ''
    const data = await proxyToCockpit('/logs', {
      tenant_id: tenantId,
      product_id: (req.query.product_id as string) || '',
      page: (req.query.page as string) || '1',
      limit: (req.query.limit as string) || '50',
    })
    res.json(data)
  } catch (err) {
    res.json({ logs: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 }, error: maskError(err) })
  }
})

apiCockpitRouter.get('/stats', async (_req, res) => {
  try {
    const data = await proxyToCockpit('/stats')
    res.json(data)
  } catch {
    res.json({ requisicoes_24h: 0, erros_24h: 0, latencia_media_ms: 0, uptime_24h: '100.0%' })
  }
})

// ─── Admin Routes (gravity_admin — todos os tenants) ────────────────────

apiCockpitAdminRouter.use(rateLimitPresets.admin(), requireAuth, requireGravityAdmin)

apiCockpitAdminRouter.get('/services', async (_req, res) => {
  try {
    const data = await proxyToCockpit('/services')
    res.json(data)
  } catch (err) {
    res.json({ services: [], error: maskError(err) })
  }
})

apiCockpitAdminRouter.get('/logs', async (req, res) => {
  try {
    const data = await proxyToCockpit('/logs', {
      tenant_id: (req.query.tenant_id as string) || '',
      product_id: (req.query.product_id as string) || '',
      page: (req.query.page as string) || '1',
      limit: (req.query.limit as string) || '50',
    })
    res.json(data)
  } catch (err) {
    res.json({ logs: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 }, error: maskError(err) })
  }
})

apiCockpitAdminRouter.get('/stats', async (_req, res) => {
  try {
    const data = await proxyToCockpit('/stats')
    res.json(data)
  } catch {
    res.json({ requisicoes_24h: 0, erros_24h: 0, latencia_media_ms: 0, uptime_24h: '100.0%' })
  }
})

// ─── GABI Usage — custos de IA agregados (admin global) ─────────────────

/**
 * GET /api/admin/api-cockpit/gabi-usage
 * Proxy para GET /api/v1/gabi/usage do serviço Gabi (tenant super-server).
 * Quando tenant_id não é informado, retorna uso global (sem filtro).
 */
apiCockpitAdminRouter.get('/gabi-usage', async (req, res) => {
  try {
    const month = (req.query.month as string) || ''
    const tenantId = (req.query.tenant_id as string) || ''
    const url = new URL(`${GABI_SERVICE_URL}/api/v1/gabi/usage`)
    if (month) url.searchParams.set('month', month)
    if (tenantId) url.searchParams.set('tenant_id', tenantId)

    const response = await fetch(url.toString(), {
      headers: {
        'x-internal-key': INTERNAL_SERVICE_KEY,
        'x-tenant-id': tenantId || '__admin_global__',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5_000),
    })

    if (!response.ok) throw new Error(`gabi usage ${response.status}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.json({
      month: '',
      total_calls: 0,
      total_tokens_input: 0,
      total_tokens_output: 0,
      total_cost_usd: 0,
      by_model: {},
      by_day: {},
      error: maskError(err),
    })
  }
})

/**
 * GET /api/admin/api-cockpit/gabi-usage/history
 * Proxy para GET /api/v1/gabi/usage/history — últimos 6 meses.
 */
apiCockpitAdminRouter.get('/gabi-usage/history', async (req, res) => {
  try {
    const tenantId = (req.query.tenant_id as string) || ''
    const url = new URL(`${GABI_SERVICE_URL}/api/v1/gabi/usage/history`)
    if (tenantId) url.searchParams.set('tenant_id', tenantId)

    const response = await fetch(url.toString(), {
      headers: {
        'x-internal-key': INTERNAL_SERVICE_KEY,
        'x-tenant-id': tenantId || '__admin_global__',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5_000),
    })

    if (!response.ok) throw new Error(`gabi history ${response.status}`)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.json({ history: {}, error: maskError(err) })
  }
})
