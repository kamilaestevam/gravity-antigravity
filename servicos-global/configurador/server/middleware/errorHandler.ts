// server/middleware/errorHandler.ts
// Handler global de erros — responde JSON consistente para AppError e erros genéricos

import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../lib/appError.js'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = res.getHeader('x-correlation-id') as string | undefined

  if (err instanceof AppError || (err instanceof Error && err.name === 'AppError')) {
    const appError = err as AppError
    res.status(appError.statusCode || 400).json({
      error: {
        code: appError.code || 'BAD_REQUEST',
        message: appError.message,
        correlationId,
      },
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Falha na validação dos dados',
        details: err.errors,
        correlationId,
      },
    })
    return
  }

  // Erro genérico inesperado
  console.error('[errorHandler] Erro não tratado:', err)
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
      correlationId,
    },
  })
}
