/**
 * utils/extractApiError.ts
 * Extrai mensagem de erro legível de respostas HTTP da API Gravity.
 *
 * O backend retorna erros no formato:
 *   { error: { code, message, correlationId } }
 *
 * Para erros de validação Zod:
 *   { error: { code: "VALIDATION_ERROR", message, details } }
 */

/**
 * Extrai a mensagem de erro de uma Response que não deu res.ok.
 * Retorna a mensagem real do backend ou o fallback fornecido.
 */
export async function extractApiError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    return body?.error?.message ?? body?.message ?? fallback
  } catch {
    return fallback
  }
}

/**
 * Extrai mensagem de um erro capturado em catch.
 * Útil para try/catch onde o erro pode ser Error, string ou desconhecido.
 */
export function extractCatchError(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return fallback
}
