/**
 * apiCockpit.ts — Rotas proxy para dados de observabilidade no Configurador
 *
 * Proxy entre o frontend (workspace + admin) e o servico api-cockpit.
 * O frontend NAO fala diretamente com o api-cockpit; passa pelo Configurador.
 *
 * Rotas workspace (qualquer usuario autenticado — montadas em /api/v1/api-cockpit):
 *   GET /api/v1/api-cockpit/servicos    — Health check dos servicos
 *   GET /api/v1/api-cockpit/logs        — Logs de requisicoes (filtrado por organizacao)
 *   GET /api/v1/api-cockpit/stats       — KPIs (filtrado por organizacao)
 *
 * Rotas admin (gravity_admin — montadas em /api/v1/api-cockpit/admin):
 *   GET /api/v1/api-cockpit/admin/servicos          — Health check (todos)
 *   GET /api/v1/api-cockpit/admin/logs              — Logs (todas as organizacoes)
 *   GET /api/v1/api-cockpit/admin/estatisticas      — KPIs (globais)
 *   GET /api/v1/api-cockpit/admin/uso-gabi          — Custos GABI IA agregados
 *   GET /api/v1/api-cockpit/admin/uso-gabi/historico — Historico de uso GABI (6 meses)
 *
 * NOMENCLATURA DDD (REGRA 3/4):
 *   - Query params: id_organizacao, id_produto_gravity, pagina, limite
 *   - id_organizacao SEMPRE extraido do JWT (sem fallback de header — Mandamento 08)
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
 * Em producao, err.message e mascarada para evitar vazar URLs internas,
 * timeouts ou stack traces. Em dev, o err.message real e mantido.
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

// ─── Fallback shapes (alinhadas com payload DDD do backend) ─────────────

const STATS_FALLBACK = {
  quantidade_requisicoes_log_consumo: 0,
  quantidade_erros_log_consumo:       0,
  latencia_media_log_consumo:         0,
  percentual_uptime_log_consumo:      100,
  por_id_produto_gravity:             {},
  por_faixa_codigo_resposta_http:     { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
}

const LOGS_FALLBACK = {
  logs: [] as unknown[],
  paginacao: { pagina: 1, limite: 50, total: 0, paginas: 0 },
}

// ─── Workspace Routes (organizacao-scoped) ──────────────────────────────

apiCockpitRouter.use(rateLimitPresets.internal(), requireAuth)

apiCockpitRouter.get('/servicos', async (_req, res) => {
  try {
    const data = await proxyToCockpit('/servicos')
    res.json(data)
  } catch (err) {
    res.json({ servicos: [], error: maskError(err) })
  }
})

apiCockpitRouter.get('/logs', async (req, res) => {
  try {
    // Mandamento 08 — sem fallback de header. id_organizacao SOMENTE do JWT.
    const idOrganizacao = req.auth?.id_organizacao
    if (!idOrganizacao) {
      return res.status(401).json({ error: 'JWT sem id_organizacao' })
    }
    const data = await proxyToCockpit('/logs', {
      id_organizacao:     idOrganizacao,
      id_produto_gravity: (req.query.id_produto_gravity as string) || '',
      pagina:             (req.query.pagina as string) || '1',
      limite:             (req.query.limite as string) || '50',
    })
    res.json(data)
  } catch (err) {
    res.json({ ...LOGS_FALLBACK, error: maskError(err) })
  }
})

apiCockpitRouter.get('/stats', async (_req, res) => {
  try {
    const data = await proxyToCockpit('/stats')
    res.json(data)
  } catch {
    res.json(STATS_FALLBACK)
  }
})

// ─── Admin Routes (gravity_admin — todas as organizacoes) ───────────────

apiCockpitAdminRouter.use(rateLimitPresets.admin(), requireAuth, requireGravityAdmin)

apiCockpitAdminRouter.get('/servicos', async (_req, res) => {
  try {
    const data = await proxyToCockpit('/servicos')
    res.json(data)
  } catch (err) {
    res.json({ servicos: [], error: maskError(err) })
  }
})

apiCockpitAdminRouter.get('/logs', async (req, res) => {
  try {
    const data = await proxyToCockpit('/logs', {
      id_organizacao:     (req.query.id_organizacao as string) || '',
      id_produto_gravity: (req.query.id_produto_gravity as string) || '',
      pagina:             (req.query.pagina as string) || '1',
      limite:             (req.query.limite as string) || '50',
    })
    res.json(data)
  } catch (err) {
    res.json({ ...LOGS_FALLBACK, error: maskError(err) })
  }
})

apiCockpitAdminRouter.get('/estatisticas', async (_req, res) => {
  try {
    const data = await proxyToCockpit('/stats')
    res.json(data)
  } catch {
    res.json(STATS_FALLBACK)
  }
})

// ─── GABI Usage — custos de IA agregados (admin global) ─────────────────

/**
 * GET /api/v1/api-cockpit/admin/uso-gabi
 * Proxy para GET /api/v1/gabi/uso do servico Gabi.
 * Quando id_organizacao nao e informado, retorna uso global (sem filtro).
 */
apiCockpitAdminRouter.get('/uso-gabi', async (req, res) => {
  try {
    const month = (req.query.month as string) || ''
    const id_organizacao = (req.query.id_organizacao as string) || ''
    const url = new URL(`${GABI_SERVICE_URL}/api/v1/gabi/uso`)
    if (month) url.searchParams.set('month', month)
    if (id_organizacao) url.searchParams.set('id_organizacao', id_organizacao)

    const response = await fetch(url.toString(), {
      headers: {
        'x-internal-key':  INTERNAL_SERVICE_KEY,
        'x-id-organizacao': id_organizacao || '__admin_global__',
        'Content-Type':    'application/json',
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
 * GET /api/v1/api-cockpit/admin/uso-gabi/historico
 * Proxy para GET /api/v1/gabi/uso/historico — ultimos 6 meses.
 */
apiCockpitAdminRouter.get('/uso-gabi/historico', async (req, res) => {
  try {
    const id_organizacao = (req.query.id_organizacao as string) || ''
    const url = new URL(`${GABI_SERVICE_URL}/api/v1/gabi/uso/historico`)
    if (id_organizacao) url.searchParams.set('id_organizacao', id_organizacao)

    const response = await fetch(url.toString(), {
      headers: {
        'x-internal-key':  INTERNAL_SERVICE_KEY,
        'x-id-organizacao': id_organizacao || '__admin_global__',
        'Content-Type':    'application/json',
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
