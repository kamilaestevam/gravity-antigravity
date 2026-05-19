// server/services/connectors.ts
// HTTP clients para os serviços de produto da plataforma Gravity
// Cada chamada encaminha tenant_id + user_id para garantir isolamento

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || process.env.CHAVE_INTERNA_SERVICO || 'gravity-internal'
const TIMEOUT_MS = 10_000

// Portas dos serviços — espelham contracts.json
const SERVICE_URLS: Record<string, string> = {
  lpco:          process.env.LPCO_SERVICE_URL          || 'http://localhost:8027',
  'nf-importacao': process.env.NF_SERVICE_URL          || 'http://localhost:8028',
  pedido:        process.env.PEDIDO_SERVICE_URL        || 'http://localhost:8030',
  configurador:  process.env.CONFIGURADOR_SERVICE_URL  || 'http://localhost:8005',
  'simula-custo': process.env.SIMULACUSTO_SERVICE_URL  || 'http://localhost:8020',
}

export interface ConnectorCtx {
  tenantId: string
  userId: string
}

// Args genéricos vindos do LLM — propriedades arbitrárias com valores serializáveis
type ConnectorArgs = Record<string, unknown>
type GenericResult = Record<string, unknown> | unknown[]

// ── Cliente HTTP base ─────────────────────────────────────────────────────────
async function call(
  service: string,
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: object,
  ctx?: ConnectorCtx,
  params?: Record<string, string | number | undefined>,
): Promise<unknown> {
  const base = SERVICE_URLS[service]
  if (!base) throw new Error(`Serviço desconhecido: ${service}`)

  let url = `${base}${path}`

  // Query string para GET
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': INTERNAL_KEY,
  }
  if (ctx) {
    headers['x-id-organizacao'] = ctx.tenantId
    headers['x-id-usuario']   = ctx.userId
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`${method} ${path} → HTTP ${res.status}: ${text.slice(0, 200)}`)
    }

    return res.json()
  } catch (err: unknown) {
    clearTimeout(timer)
    if (err instanceof Error && err.name === 'AbortError') throw new Error(`Timeout ao chamar ${service}${path}`)
    throw err
  }
}

// ── LPCO ─────────────────────────────────────────────────────────────────────
export async function listLpcos(args: ConnectorArgs, ctx: ConnectorCtx) {
  return call('lpco', '/api/v1/lpcos', 'GET', undefined, ctx, {
    status:        args.status as string | undefined,
    orgao_anuente: args.orgao_anuente as string | undefined,
    limit:         (args.limit as number | undefined) ?? 20,
  })
}

export async function getLpco(args: ConnectorArgs, ctx: ConnectorCtx) {
  return call('lpco', `/api/v1/lpcos/${args.lpco_id}`, 'GET', undefined, ctx)
}

export async function createLpco(args: ConnectorArgs, ctx: ConnectorCtx) {
  const { lpco_id: _ignore, ...body } = args
  return call('lpco', '/api/v1/lpcos', 'POST', body, ctx)
}

export async function updateLpco(args: ConnectorArgs, ctx: ConnectorCtx) {
  const { lpco_id, ...body } = args
  return call('lpco', `/api/v1/lpcos/${lpco_id}`, 'PATCH', body, ctx)
}

// ── NF Importação ─────────────────────────────────────────────────────────────
export async function listNfs(args: ConnectorArgs, ctx: ConnectorCtx) {
  return call('nf-importacao', '/api/v1/nf-importacao', 'GET', undefined, ctx, {
    status: args.status as string | undefined,
    limit:  (args.limit as number | undefined) ?? 20,
  })
}

export async function getNf(args: ConnectorArgs, ctx: ConnectorCtx) {
  return call('nf-importacao', `/api/v1/nf-importacao/${args.nf_id}`, 'GET', undefined, ctx)
}

export async function createNf(args: ConnectorArgs, ctx: ConnectorCtx) {
  return call('nf-importacao', '/api/v1/nf-importacao', 'POST', args, ctx)
}

// ── Pedido ────────────────────────────────────────────────────────────────────
export async function listPedidos(args: ConnectorArgs, ctx: ConnectorCtx) {
  return call('pedido', '/api/v1/pedidos', 'GET', undefined, ctx, {
    status: args.status as string | undefined,
    limit:  (args.limit as number | undefined) ?? 20,
  })
}

export async function getPedido(args: ConnectorArgs, ctx: ConnectorCtx) {
  return call('pedido', `/api/v1/pedidos/${args.pedido_id}`, 'GET', undefined, ctx)
}

export async function createPedido(args: ConnectorArgs, ctx: ConnectorCtx) {
  return call('pedido', '/api/v1/pedidos', 'POST', args, ctx)
}

export async function updatePedido(args: ConnectorArgs, ctx: ConnectorCtx) {
  const { pedido_id, ...body } = args
  return call('pedido', `/api/v1/pedidos/${pedido_id}`, 'PUT', body, ctx)
}

export async function deletePedido(args: ConnectorArgs, ctx: ConnectorCtx) {
  return call('pedido', `/api/v1/pedidos/${args.pedido_id}`, 'DELETE', undefined, ctx)
}

// ── Configurador (Organização / Usuários) ─────────────────────────────────────
export async function getOrganizacao(ctx: ConnectorCtx) {
  return call('configurador', '/api/v1/organizacao', 'GET', undefined, ctx)
}

export async function listUsuarios(ctx: ConnectorCtx) {
  return call('configurador', '/api/v1/usuarios', 'GET', undefined, ctx)
}

// ── SimulaCusto ───────────────────────────────────────────────────────────────
export async function simulateCost(args: ConnectorArgs, ctx: ConnectorCtx) {
  return call('simula-custo', '/api/v1/simula-custo/simulate', 'POST', args, ctx)
}

// ── Resumo geral ──────────────────────────────────────────────────────────────
export async function getUserSummary(ctx: ConnectorCtx) {
  // Busca em paralelo para não bloquear
  const [lpcos, nfs, pedidos] = await Promise.allSettled([
    listLpcos({ limit: 100 }, ctx),
    listNfs({ limit: 100 }, ctx),
    listPedidos({ limit: 100 }, ctx),
  ])

  const safeData = (r: PromiseSettledResult<unknown>, label: string): GenericResult =>
    r.status === 'fulfilled' ? (r.value as GenericResult) : { error: `${label} indisponivel` }

  const lpcoData   = safeData(lpcos, 'LPCO') as Record<string, unknown> & { data?: unknown[]; total?: number; length?: number }
  const nfData     = safeData(nfs, 'NF') as Record<string, unknown> & { total?: number; length?: number }
  const pedidoData = safeData(pedidos, 'Pedido') as Record<string, unknown> & { total?: number; length?: number }

  // Agrupa LPCOs por status se disponível
  const lpcoResumo: Record<string, number> = {}
  const lpcoArrCandidate = lpcoData?.data ?? lpcoData
  if (Array.isArray(lpcoArrCandidate)) {
    const arr = lpcoArrCandidate as Array<Record<string, unknown>>
    arr.forEach((l) => {
      const s = (l.status as string | undefined) ?? 'desconhecido'
      lpcoResumo[s] = (lpcoResumo[s] ?? 0) + 1
    })
  }

  return {
    lpcos: {
      total: lpcoData?.total ?? lpcoData?.length ?? 0,
      por_status: lpcoResumo,
    },
    nfs: {
      total: nfData?.total ?? nfData?.length ?? 0,
    },
    pedidos: {
      total: pedidoData?.total ?? pedidoData?.length ?? 0,
    },
  }
}
