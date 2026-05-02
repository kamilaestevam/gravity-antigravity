// server/lib/errors.ts
// Classe AppError centralizada — padrão obrigatório do projeto Gravity.

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'BAD_REQUEST'
  ) {
    super(message)
    this.name = 'AppError'
  }
}
