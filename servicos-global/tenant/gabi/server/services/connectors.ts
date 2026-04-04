// server/services/connectors.ts
// HTTP clients para os serviços de produto da plataforma Gravity
// Cada chamada encaminha tenant_id + user_id para garantir isolamento

const INTERNAL_KEY = process.env.INTERNAL_API_KEY || 'gravity-internal'
const TIMEOUT_MS = 10_000

// Portas dos serviços — espelham contracts.json
const SERVICE_URLS: Record<string, string> = {
  lpco:          process.env.LPCO_SERVICE_URL          || 'http://localhost:8027',
  'nf-importacao': process.env.NF_SERVICE_URL          || 'http://localhost:8028',
  pedido:        process.env.PEDIDO_SERVICE_URL        || 'http://localhost:8026',
  'simula-custo': process.env.SIMULACUSTO_SERVICE_URL  || 'http://localhost:8020',
}

export interface ConnectorCtx {
  tenantId: string
  userId: string
}

// ── Cliente HTTP base ─────────────────────────────────────────────────────────
async function call(
  service: string,
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: object,
  ctx?: ConnectorCtx,
  params?: Record<string, string | number | undefined>,
): Promise<any> {
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
    headers['x-tenant-id'] = ctx.tenantId
    headers['x-user-id']   = ctx.userId
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
  } catch (err: any) {
    clearTimeout(timer)
    if (err.name === 'AbortError') throw new Error(`Timeout ao chamar ${service}${path}`)
    throw err
  }
}

// ── LPCO ─────────────────────────────────────────────────────────────────────
export async function listLpcos(args: any, ctx: ConnectorCtx) {
  return call('lpco', '/api/v1/lpcos', 'GET', undefined, ctx, {
    status:        args.status,
    orgao_anuente: args.orgao_anuente,
    limit:         args.limit ?? 20,
  })
}

export async function getLpco(args: any, ctx: ConnectorCtx) {
  return call('lpco', `/api/v1/lpcos/${args.lpco_id}`, 'GET', undefined, ctx)
}

export async function createLpco(args: any, ctx: ConnectorCtx) {
  const { lpco_id: _ignore, ...body } = args
  return call('lpco', '/api/v1/lpcos', 'POST', body, ctx)
}

export async function updateLpco(args: any, ctx: ConnectorCtx) {
  const { lpco_id, ...body } = args
  return call('lpco', `/api/v1/lpcos/${lpco_id}`, 'PATCH', body, ctx)
}

// ── NF Importação ─────────────────────────────────────────────────────────────
export async function listNfs(args: any, ctx: ConnectorCtx) {
  return call('nf-importacao', '/api/v1/nf-importacao', 'GET', undefined, ctx, {
    status: args.status,
    limit:  args.limit ?? 20,
  })
}

export async function getNf(args: any, ctx: ConnectorCtx) {
  return call('nf-importacao', `/api/v1/nf-importacao/${args.nf_id}`, 'GET', undefined, ctx)
}

export async function createNf(args: any, ctx: ConnectorCtx) {
  return call('nf-importacao', '/api/v1/nf-importacao', 'POST', args, ctx)
}

// ── Pedido ────────────────────────────────────────────────────────────────────
export async function listPedidos(args: any, ctx: ConnectorCtx) {
  return call('pedido', '/api/v1/pedidos', 'GET', undefined, ctx, {
    status: args.status,
    limit:  args.limit ?? 20,
  })
}

export async function getPedido(args: any, ctx: ConnectorCtx) {
  return call('pedido', `/api/v1/pedidos/${args.pedido_id}`, 'GET', undefined, ctx)
}

// ── SimulaCusto ───────────────────────────────────────────────────────────────
export async function simulateCost(args: any, ctx: ConnectorCtx) {
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

  const safeData = (r: PromiseSettledResult<any>, label: string) =>
    r.status === 'fulfilled' ? r.value : { error: `${label} indisponivel` }

  const lpcoData   = safeData(lpcos, 'LPCO')
  const nfData     = safeData(nfs, 'NF')
  const pedidoData = safeData(pedidos, 'Pedido')

  // Agrupa LPCOs por status se disponível
  let lpcoResumo: Record<string, number> = {}
  if (Array.isArray(lpcoData?.data ?? lpcoData)) {
    const arr: any[] = lpcoData?.data ?? lpcoData
    arr.forEach((l: any) => {
      const s = l.status ?? 'desconhecido'
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
