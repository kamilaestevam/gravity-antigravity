// middleware/appError.ts
// Classe centralizada de erros para todos os serviços tenant.
// Importada pelo errorHandler e pelas rotas de negócio.

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = 'BAD_REQUEST'
  ) {
    super(message)
    this.name = 'AppError'
  }
}
