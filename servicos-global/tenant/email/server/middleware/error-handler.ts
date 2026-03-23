// server/middleware/error-handler.ts
// Handler global de erros — registrado como último middleware no servidor.

import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors.js'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    })
    return
  }

  // Erro inesperado — não expor detalhes internos
  console.error(
    `[EMAIL_ERROR] correlation:${(req as Request & { correlationId?: string }).correlationId ?? 'n/a'}`,
    err.message
  )
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
    },
  })
}
