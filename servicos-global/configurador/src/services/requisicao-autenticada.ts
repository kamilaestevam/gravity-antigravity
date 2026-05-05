/**
 * requisicao-autenticada.ts — Helper de fetch com Bearer Clerk
 *
 * Anexa Authorization: Bearer <clerk_token> e credentials: include em qualquer
 * chamada para o backend Configurador. Sem o Bearer, o middleware requireAuth
 * (server/middleware/requireAuth.ts) responde 401.
 *
 * Mandamento 01 — Clerk APENAS para autenticacao. Aqui usamos
 * window.Clerk.session.getToken() exclusivamente para extrair o JWT do
 * usuario autenticado. NUNCA ler patente/permissao do Clerk: a fonte da
 * verdade e o backend (`/api/v1/me`).
 */

interface ClerkWindow {
  Clerk?: {
    session?: {
      getToken: () => Promise<string | null>
    }
  }
}

/** Retorna o JWT da sessao Clerk corrente, ou null se nao houver sessao. */
export async function obterTokenClerk(): Promise<string | null> {
  try {
    const w = window as unknown as ClerkWindow
    return (await w.Clerk?.session?.getToken()) ?? null
  } catch {
    return null
  }
}

/**
 * fetch que injeta Authorization: Bearer <token Clerk> + credentials: include.
 *
 * Repassa Response cru — Mandamento 08: nao mascara 401/403/5xx. Cabe ao
 * call site decidir como tratar (parse Zod, exibir erro, etc.).
 */
export async function requisicaoAutenticada(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await obterTokenClerk()
  const headers: Record<string, string> = { ...((init.headers as Record<string, string>) ?? {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(input, { ...init, credentials: 'include', headers })
}
