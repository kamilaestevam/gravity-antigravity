/**
 * Erro estruturado da API Gravity (Configurador).
 * Inclui code + details para mensagens acionáveis na UI.
 */

export class GravityApiError extends Error {
  readonly code: string
  readonly details: string[]

  constructor(message: string, code: string, details: string[] = []) {
    super(message)
    this.name = 'GravityApiError'
    this.code = code
    this.details = details
  }
}

export function isGravityApiError(err: unknown): err is GravityApiError {
  return err instanceof GravityApiError
}

export interface CorpoErroApiGravity {
  error?: {
    code?: string
    message?: string
    details?: string[]
  }
  message?: string
}

export function criarGravityApiErrorDeCorpo(
  body: CorpoErroApiGravity,
  fallbackMessage: string,
): GravityApiError {
  const code = body.error?.code ?? 'BAD_REQUEST'
  const message = body.error?.message ?? body.message ?? fallbackMessage
  const details = Array.isArray(body.error?.details) ? body.error.details : []
  return new GravityApiError(message, code, details)
}
