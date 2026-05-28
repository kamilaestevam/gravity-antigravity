const FETCH_TIMEOUT_MS = 5_000

function getCadastrosUrl(): string {
  return process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8031'
}

function getInternalServiceKey(): string {
  const key = process.env.CHAVE_INTERNA_SERVICO
  if (!key?.trim()) {
    throw new Error('CHAVE_INTERNA_SERVICO ausente — BID não pode chamar Cadastros')
  }
  return key
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

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': getInternalServiceKey(),
      'x-correlation-id': crypto.randomUUID(),
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Cadastros ${res.status}: ${body.slice(0, 300)}`)
  }

  return res.json() as Promise<T>
}
