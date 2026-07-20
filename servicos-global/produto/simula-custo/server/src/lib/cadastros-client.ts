/**
 * cadastros-client.ts — Client REST do serviço Cadastros (Estimativa Custo).
 * NCM é catálogo global com fonte única no Cadastros (NcmSync) — leitura ao vivo,
 * SEM cache local (cadastros-snapshot-policy). Gabarito: BID Frete.
 */
const FETCH_TIMEOUT_MS = 12_000

function obterUrlCadastros(): string {
  return process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8031'
}

function obterChaveInterna(): string {
  const chave = process.env.CHAVE_INTERNA_SERVICO?.trim()
  if (chave) return chave
  if (process.env.NODE_ENV !== 'production') {
    return process.env.VITE_CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026'
  }
  throw new Error('CHAVE_INTERNA_SERVICO ausente — Estimativa Custo não pode chamar Cadastros')
}

export async function buscarJsonCadastros<T>(
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
  const url = `${obterUrlCadastros()}${path}${qs ? `?${qs}` : ''}`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': obterChaveInterna(),
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
