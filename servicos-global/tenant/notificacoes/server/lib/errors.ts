export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message)
    // OBRIGATÓRIO: o error handler do configurador identifica AppErrors pelo nome.
    // Sem isso, err instanceof AppError falha cross-module e err.name fica 'Error',
    // fazendo TODAS as respostas de erro do notificacoes caírem no handler de 500.
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    Object.setPrototypeOf(this, AppError.prototype) // garante instanceof cross-realm/ESM
    Error.captureStackTrace(this, this.constructor)
  }
}
