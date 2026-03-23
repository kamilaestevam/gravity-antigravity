// server/middleware/error-handler.ts
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

  // Erro inesperado
  console.error(
    `[GABI_ERROR] correlation:${(req as Request & { correlationId?: string }).correlationId ?? 'n/a'}`,
    err.message,
    err.stack
  )
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
    },
  })
}
