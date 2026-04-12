// middleware/errorHandler.ts
// Handler global de erros — registrado como último middleware no servidor.
// Versão compartilhada — usada pelo super-servidor.

import { Request, Response, NextFunction } from 'express'
import { AppError } from './appError.js'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
    return
  }

  console.error(
    `[INTERNAL_ERROR] correlation:${(req as Request & { correlationId?: string }).correlationId ?? 'n/a'}`,
    err.message
  )
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
  })
}
