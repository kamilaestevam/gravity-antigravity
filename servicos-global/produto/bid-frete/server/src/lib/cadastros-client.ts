const FETCH_TIMEOUT_MS = 12_000

function getCadastrosUrl(): string {
  return process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8031'
}

function getInternalServiceKey(): string {
  const key = process.env.CHAVE_INTERNA_SERVICO?.trim()
  if (key) return key
  if (process.env.NODE_ENV !== 'production') {
    return process.env.VITE_CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026'
  }
  throw new Error('CHAVE_INTERNA_SERVICO ausente — BID não pode chamar Cadastros')
}

export async function fetchCadastrosJson<T>(
  path: string,
  query?: Record<string, string | undefined>,
): Promise<T> {
  const params = new URLSearchParams()
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') params.set(k, v)
    }
  }
  const qs = params.toString()
  const url = `${getCadastrosUrl()}${path}${qs ? `?${qs}` : ''}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': getInternalServiceKey(),
        'x-correlation-id': crypto.randomUUID(),
      },
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`Cadastros ${path} HTTP ${res.status}`)
    }
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}
