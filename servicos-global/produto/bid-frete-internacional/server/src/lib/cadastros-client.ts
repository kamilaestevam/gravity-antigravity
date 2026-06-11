const FETCH_TIMEOUT_MS = 12_000

function getCadastrosUrl(): string {
  return process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8031'
}

function getInternalServiceKey(): string {
  const key = process.env.CHAVE_INTERNA_SERVICO?.trim()
  if (key) return key
  // Sidecar no site-usegravity: mesma chave que o proxy do Configurador injeta nas requisições.
  if (process.env.BID_FRETE_SIDECAR === '1') {
    return process.env.VITE_CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026'
  }
  if (process.env.NODE_ENV !== 'production') {
    return process.env.VITE_CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026'
  }
  throw new Error('CHAVE_INTERNA_SERVICO ausente — BID não pode chamar Cadastros')
}

export async function fetchCadastrosJson<T>(
  path: string,
  query?: Record<string, string | undefined>,
  options?: { idOrganizacao?: string },
): Promise<T> {
  const params = new URLSearchParams()
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') params.set(k, v)
    }
  }
  const qs = params.toString()
  const url = `${getCadastrosUrl()}${path}${qs ? `?${qs}` : ''}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': getInternalServiceKey(),
    'x-correlation-id': crypto.randomUUID(),
  }
  if (options?.idOrganizacao) {
    headers['x-id-organizacao'] = options.idOrganizacao
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Cadastros ${res.status}: ${body.slice(0, 300)}`)
  }

  return res.json() as Promise<T>
}
