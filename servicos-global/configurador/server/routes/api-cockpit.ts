/**
 * api-cockpit.ts — Rotas proxy para dados de monitoramento da API no Configurador
 *
 * Proxy entre o frontend (workspace + admin) e o servico api-cockpit.
 * O frontend NAO fala diretamente com o api-cockpit; passa pelo Configurador.
 *
 * Rotas workspace (qualquer usuario autenticado — montadas em /api/v1/api-cockpit):
 *   GET /api/v1/api-cockpit/saude-servicos                    — Health check dos servicos
 *   GET /api/v1/api-cockpit/log-requisicao-api                       — Logs (filtrado por organizacao)
 *   GET /api/v1/api-cockpit/log-requisicao-api/estatisticas          — KPIs (filtrado por organizacao)
 *
 * Rotas admin (gravity_admin — montadas em /api/v1/api-cockpit/admin):
 *   GET /api/v1/api-cockpit/admin/saude-servicos              — Health check global
 *   GET /api/v1/api-cockpit/admin/log-requisicao-api                 — Logs globais
 *   GET /api/v1/api-cockpit/admin/log-requisicao-api/estatisticas    — KPIs globais
 *   GET /api/v1/api-cockpit/admin/uso-gabi                    — Custos GABI IA agregados
 *   GET /api/v1/api-cockpit/admin/uso-gabi/historico          — Historico de uso GABI
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
const CHAVE_INTERNA_SERVICO = process.env.CHAVE_INTERNA_SERVICO || ''
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
  const url = new URL(`${API_COCKPIT_URL}/api/v1/cockpit/monitoramento-api${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      'x-chave-interna-servico': CHAVE_INTERNA_SERVICO,
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
  quantidade_requisicoes_log_requisicao_api:        0,
  quantidade_erros_log_requisicao_api:              0,
  latencia_media_log_requisicao_api:                0,
  percentual_uptime_log_requisicao_api:             100,
  quantidade_produtos_distintos_log_requisicao_api: 0,
  por_id_produto_gravity:                    {},
  por_faixa_codigo_resposta_http:            { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
}

const LOGS_FALLBACK = {
  logs: [] as unknown[],
  paginacao: { pagina: 1, limite: 50, total: 0, paginas: 0 },
}

// ─── Workspace Routes (organizacao-scoped) ──────────────────────────────

apiCockpitRouter.use(rateLimitPresets.internal(), requireAuth)

apiCockpitRouter.get('/saude-servicos', async (_req, res) => {
  try {
    const data = await proxyToCockpit('/servicos')
    res.json(data)
  } catch (err) {
    res.json({ servicos: [], error: maskError(err) })
  }
})

apiCockpitRouter.get('/log-requisicao-api', async (req, res) => {
  try {
    // Mandamento 08 — sem fallback de header. id_organizacao SOMENTE do JWT.
    const idOrganizacao = req.auth?.id_organizacao
    if (!idOrganizacao) {
      return res.status(401).json({ error: 'JWT sem id_organizacao' })
    }
    const data = await proxyToCockpit('/logs', {
      id_organizacao:              idOrganizacao,
      id_produto_gravity:          (req.query.id_produto_gravity as string) || '',
      codigo_resposta_http_minimo: (req.query.codigo_resposta_http_minimo as string) || '',
      codigo_resposta_http_maximo: (req.query.codigo_resposta_http_maximo as string) || '',
      pagina:                      (req.query.pagina as string) || '1',
      limite:                      (req.query.limite as string) || '50',
    })
    res.json(data)
  } catch (err) {
    res.json({ ...LOGS_FALLBACK, error: maskError(err) })
  }
})

apiCockpitRouter.get('/log-requisicao-api/estatisticas', async (req, res) => {
  try {
    // Workspace: filtra por organizacao do usuario logado.
    const idOrganizacao = req.auth?.id_organizacao
    if (!idOrganizacao) {
      return res.status(401).json({ error: 'JWT sem id_organizacao' })
    }
    const params: Record<string, string> = { id_organizacao: idOrganizacao }
    if (typeof req.query.serie === 'string') params.serie = req.query.serie
    if (typeof req.query.dias  === 'string') params.dias  = req.query.dias
    const data = await proxyToCockpit('/estatisticas-log-requisicao-api', params)
    res.json(data)
  } catch {
    res.json(STATS_FALLBACK)
  }
})

// ─── Workspace: api-tokens (CRUD com isolamento por id_organizacao) ─────

/** Helper proxy para api-tokens (caminho diferente do monitoramento-api) */
async function proxyToTokens(
  metodo: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<{ status: number; data: unknown }> {
  const url = `${API_COCKPIT_URL}/api/v1/cockpit/api-tokens${path}`
  const init: RequestInit = {
    method: metodo,
    headers: {
      'x-chave-interna-servico': CHAVE_INTERNA_SERVICO,
      'Content-Type':   'application/json',
    },
    signal: AbortSignal.timeout(5_000),
  }
  if (body !== undefined) init.body = JSON.stringify(body)
  const response = await fetch(url, init)
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  return { status: response.status, data }
}

apiCockpitRouter.get('/api-tokens', async (req, res) => {
  try {
    const idOrganizacao = req.auth?.id_organizacao
    if (!idOrganizacao) {
      return res.status(401).json({ error: 'JWT sem id_organizacao' })
    }
    const url = new URL(`${API_COCKPIT_URL}/api/v1/cockpit/api-tokens/`)
    url.searchParams.set('id_organizacao', idOrganizacao)
    const response = await fetch(url.toString(), {
      headers: {
        'x-chave-interna-servico': CHAVE_INTERNA_SERVICO,
        'Content-Type':   'application/json',
      },
      signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) throw new Error(`api-tokens listar ${response.status}`)
    res.json(await response.json())
  } catch (err) {
    res.json({ tokens: [], error: maskError(err) })
  }
})

apiCockpitRouter.post('/api-tokens', async (req, res) => {
  try {
    const idOrganizacao = req.auth?.id_organizacao
    const idUsuario     = req.auth?.id_usuario
    if (!idOrganizacao) {
      return res.status(401).json({ error: 'JWT sem id_organizacao' })
    }
    const body = {
      ...(req.body || {}),
      id_organizacao: idOrganizacao,
      id_usuario:     idUsuario,
    }
    const { status, data } = await proxyToTokens('POST', '/', body)
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

apiCockpitRouter.delete('/api-tokens/:id_api_token', async (req, res) => {
  try {
    const idOrganizacao = req.auth?.id_organizacao
    if (!idOrganizacao) {
      return res.status(401).json({ error: 'JWT sem id_organizacao' })
    }
    const { status, data } = await proxyToTokens(
      'DELETE',
      `/${encodeURIComponent(req.params.id_api_token)}`,
      { id_organizacao: idOrganizacao },
    )
    if (status === 204) return res.status(204).send()
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

// ─── Workspace: webhooks (CRUD + disparar-evento-teste + historico) ────

async function proxyToWebhooks(
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  query?: Record<string, string>,
): Promise<{ status: number; data: unknown }> {
  const url = new URL(`${API_COCKPIT_URL}/api/v1/cockpit/webhooks${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v) url.searchParams.set(k, v)
    }
  }
  const init: RequestInit = {
    method: metodo,
    headers: {
      'x-chave-interna-servico': CHAVE_INTERNA_SERVICO,
      'Content-Type':   'application/json',
    },
    signal: AbortSignal.timeout(10_000),
  }
  if (body !== undefined) init.body = JSON.stringify(body)
  const response = await fetch(url.toString(), init)
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  return { status: response.status, data }
}

apiCockpitRouter.get('/webhooks', async (req, res) => {
  try {
    const idOrganizacao = req.auth?.id_organizacao
    if (!idOrganizacao) return res.status(401).json({ error: 'JWT sem id_organizacao' })
    const { status, data } = await proxyToWebhooks('GET', '/', undefined, { id_organizacao: idOrganizacao })
    res.status(status).json(data)
  } catch (err) {
    res.json({ webhooks: [], error: maskError(err) })
  }
})

apiCockpitRouter.post('/webhooks', async (req, res) => {
  try {
    const idOrganizacao = req.auth?.id_organizacao
    const idUsuario     = req.auth?.id_usuario
    if (!idOrganizacao) return res.status(401).json({ error: 'JWT sem id_organizacao' })
    const body = { ...(req.body || {}), id_organizacao: idOrganizacao, id_usuario: idUsuario }
    const { status, data } = await proxyToWebhooks('POST', '/', body)
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

apiCockpitRouter.put('/webhooks/:id_webhook_configuracao', async (req, res) => {
  try {
    const idOrganizacao = req.auth?.id_organizacao
    if (!idOrganizacao) return res.status(401).json({ error: 'JWT sem id_organizacao' })
    const body = { ...(req.body || {}), id_organizacao: idOrganizacao }
    const { status, data } = await proxyToWebhooks(
      'PUT',
      `/${encodeURIComponent(req.params.id_webhook_configuracao)}`,
      body,
    )
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

apiCockpitRouter.delete('/webhooks/:id_webhook_configuracao', async (req, res) => {
  try {
    const idOrganizacao = req.auth?.id_organizacao
    if (!idOrganizacao) return res.status(401).json({ error: 'JWT sem id_organizacao' })
    const { status, data } = await proxyToWebhooks(
      'DELETE',
      `/${encodeURIComponent(req.params.id_webhook_configuracao)}`,
      { id_organizacao: idOrganizacao },
    )
    if (status === 204) return res.status(204).send()
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

apiCockpitRouter.post('/webhooks/:id_webhook_configuracao/disparar-evento-teste', async (req, res) => {
  try {
    const idOrganizacao = req.auth?.id_organizacao
    if (!idOrganizacao) return res.status(401).json({ error: 'JWT sem id_organizacao' })
    const { status, data } = await proxyToWebhooks(
      'POST',
      `/${encodeURIComponent(req.params.id_webhook_configuracao)}/disparar-evento-teste`,
      { id_organizacao: idOrganizacao },
    )
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

apiCockpitRouter.get('/webhooks/:id_webhook_configuracao/historico', async (req, res) => {
  try {
    const idOrganizacao = req.auth?.id_organizacao
    if (!idOrganizacao) return res.status(401).json({ error: 'JWT sem id_organizacao' })
    const { status, data } = await proxyToWebhooks(
      'GET',
      `/${encodeURIComponent(req.params.id_webhook_configuracao)}/historico`,
      undefined,
      { id_organizacao: idOrganizacao },
    )
    res.status(status).json(data)
  } catch (err) {
    res.json({ historico: [], error: maskError(err) })
  }
})

// ─── Admin Routes (gravity_admin — todas as organizacoes) ───────────────

apiCockpitAdminRouter.use(rateLimitPresets.admin(), requireAuth, requireGravityAdmin)

apiCockpitAdminRouter.get('/saude-servicos', async (_req, res) => {
  try {
    const data = await proxyToCockpit('/servicos')
    res.json(data)
  } catch (err) {
    res.json({ servicos: [], error: maskError(err) })
  }
})

apiCockpitAdminRouter.get('/log-requisicao-api', async (req, res) => {
  try {
    const data = await proxyToCockpit('/logs', {
      id_organizacao:              (req.query.id_organizacao as string) || '',
      id_produto_gravity:          (req.query.id_produto_gravity as string) || '',
      codigo_resposta_http_minimo: (req.query.codigo_resposta_http_minimo as string) || '',
      codigo_resposta_http_maximo: (req.query.codigo_resposta_http_maximo as string) || '',
      pagina:                      (req.query.pagina as string) || '1',
      limite:                      (req.query.limite as string) || '50',
    })
    res.json(data)
  } catch (err) {
    res.json({ ...LOGS_FALLBACK, error: maskError(err) })
  }
})

apiCockpitAdminRouter.get('/log-requisicao-api/estatisticas', async (req, res) => {
  try {
    const params: Record<string, string> = {}
    if (typeof req.query.serie === 'string') params.serie = req.query.serie
    if (typeof req.query.dias  === 'string') params.dias  = req.query.dias
    const data = await proxyToCockpit('/estatisticas-log-requisicao-api', Object.keys(params).length ? params : undefined)
    res.json(data)
  } catch {
    res.json(STATS_FALLBACK)
  }
})

// ─── Admin: api-tokens (CRUD completo — qualquer organizacao via query/body) ───
//
// Paridade com workspace: admin pode listar/criar/excluir tokens de qualquer
// organizacao especificada via id_organizacao explicito (drill-down).

apiCockpitAdminRouter.get('/api-tokens', async (req, res) => {
  try {
    const idOrganizacao = (req.query.id_organizacao as string) || ''
    if (!idOrganizacao) {
      return res.status(400).json({ error: 'id_organizacao obrigatorio na query' })
    }
    const url = new URL(`${API_COCKPIT_URL}/api/v1/cockpit/api-tokens/`)
    url.searchParams.set('id_organizacao', idOrganizacao)
    const response = await fetch(url.toString(), {
      headers: {
        'x-chave-interna-servico': CHAVE_INTERNA_SERVICO,
        'Content-Type':   'application/json',
      },
      signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) throw new Error(`api-tokens admin listar ${response.status}`)
    res.json(await response.json())
  } catch (err) {
    res.json({ tokens: [], error: maskError(err) })
  }
})

apiCockpitAdminRouter.post('/api-tokens', async (req, res) => {
  try {
    const idOrganizacao = (req.body?.id_organizacao as string) || (req.query.id_organizacao as string) || ''
    if (!idOrganizacao) {
      return res.status(400).json({ error: 'id_organizacao obrigatorio no body ou query' })
    }
    const idUsuario = req.auth?.id_usuario  // admin que executou a acao
    const body = {
      ...(req.body || {}),
      id_organizacao: idOrganizacao,
      id_usuario:     idUsuario,
    }
    const { status, data } = await proxyToTokens('POST', '/', body)
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

apiCockpitAdminRouter.delete('/api-tokens/:id_api_token', async (req, res) => {
  try {
    const idOrganizacao = (req.body?.id_organizacao as string) || (req.query.id_organizacao as string) || ''
    if (!idOrganizacao) {
      return res.status(400).json({ error: 'id_organizacao obrigatorio no body ou query' })
    }
    const { status, data } = await proxyToTokens(
      'DELETE',
      `/${encodeURIComponent(req.params.id_api_token)}`,
      { id_organizacao: idOrganizacao },
    )
    if (status === 204) return res.status(204).send()
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

// ─── Admin: webhooks (CRUD completo + disparar-evento-teste + historico) ──
//
// Paridade com workspace. Backend webhooks.ts foi migrado para padrao S2S
// em 2026-05-06; em caso de fallback (status >= 400) o proxy responde 200
// com payload amigavel para nao quebrar a UI admin.

apiCockpitAdminRouter.get('/webhooks', async (req, res) => {
  try {
    const idOrganizacao = (req.query.id_organizacao as string) || ''
    if (!idOrganizacao) return res.status(400).json({ error: 'id_organizacao obrigatorio na query' })
    const { status, data } = await proxyToWebhooks('GET', '/', undefined, { id_organizacao: idOrganizacao })
    if (status >= 400) {
      return res.json({
        webhooks: [],
        error: `Backend de webhooks indisponivel ou nao migrado (status ${status})`,
      })
    }
    res.status(status).json(data)
  } catch (err) {
    res.json({ webhooks: [], error: maskError(err) })
  }
})

apiCockpitAdminRouter.post('/webhooks', async (req, res) => {
  try {
    const idOrganizacao = (req.body?.id_organizacao as string) || (req.query.id_organizacao as string) || ''
    if (!idOrganizacao) {
      return res.status(400).json({ error: 'id_organizacao obrigatorio no body ou query' })
    }
    const idUsuario = req.auth?.id_usuario
    const body = { ...(req.body || {}), id_organizacao: idOrganizacao, id_usuario: idUsuario }
    const { status, data } = await proxyToWebhooks('POST', '/', body)
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

apiCockpitAdminRouter.put('/webhooks/:id_webhook_configuracao', async (req, res) => {
  try {
    const idOrganizacao = (req.body?.id_organizacao as string) || (req.query.id_organizacao as string) || ''
    if (!idOrganizacao) {
      return res.status(400).json({ error: 'id_organizacao obrigatorio no body ou query' })
    }
    const body = { ...(req.body || {}), id_organizacao: idOrganizacao }
    const { status, data } = await proxyToWebhooks(
      'PUT',
      `/${encodeURIComponent(req.params.id_webhook_configuracao)}`,
      body,
    )
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

apiCockpitAdminRouter.delete('/webhooks/:id_webhook_configuracao', async (req, res) => {
  try {
    const idOrganizacao = (req.body?.id_organizacao as string) || (req.query.id_organizacao as string) || ''
    if (!idOrganizacao) {
      return res.status(400).json({ error: 'id_organizacao obrigatorio no body ou query' })
    }
    const { status, data } = await proxyToWebhooks(
      'DELETE',
      `/${encodeURIComponent(req.params.id_webhook_configuracao)}`,
      { id_organizacao: idOrganizacao },
    )
    if (status === 204) return res.status(204).send()
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

apiCockpitAdminRouter.post('/webhooks/:id_webhook_configuracao/disparar-evento-teste', async (req, res) => {
  try {
    const idOrganizacao = (req.body?.id_organizacao as string) || (req.query.id_organizacao as string) || ''
    if (!idOrganizacao) {
      return res.status(400).json({ error: 'id_organizacao obrigatorio no body ou query' })
    }
    const { status, data } = await proxyToWebhooks(
      'POST',
      `/${encodeURIComponent(req.params.id_webhook_configuracao)}/disparar-evento-teste`,
      { id_organizacao: idOrganizacao },
    )
    res.status(status).json(data)
  } catch (err) {
    res.status(500).json({ error: maskError(err) })
  }
})

apiCockpitAdminRouter.get('/webhooks/:id_webhook_configuracao/historico', async (req, res) => {
  try {
    const idOrganizacao = (req.query.id_organizacao as string) || ''
    if (!idOrganizacao) return res.status(400).json({ error: 'id_organizacao obrigatorio na query' })
    const { status, data } = await proxyToWebhooks(
      'GET',
      `/${encodeURIComponent(req.params.id_webhook_configuracao)}/historico`,
      undefined,
      { id_organizacao: idOrganizacao },
    )
    res.status(status).json(data)
  } catch (err) {
    res.json({ historico: [], error: maskError(err) })
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
        'x-chave-interna-servico':  CHAVE_INTERNA_SERVICO,
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
        'x-chave-interna-servico':  CHAVE_INTERNA_SERVICO,
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
