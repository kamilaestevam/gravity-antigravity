// server/lib/appError.ts
// Classe de erro centralizada usada em toda rota

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  /** Passos acionáveis para o operador (exibidos no modal de permissões). */
  public readonly details?: string[]

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: string[]) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}
