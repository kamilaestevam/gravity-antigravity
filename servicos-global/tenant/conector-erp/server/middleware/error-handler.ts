// server/middleware/error-handler.ts
// Handler global de erros do Express.
// Deve ser registrado como o ÚLTIMO middleware.

import type { ErrorRequestHandler } from 'express'
import { AppError } from '../lib/app-error.js'

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const correlationId = req.correlationId ?? 'unknown'

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      ok: false,
      code: err.code,
      message: err.message,
      details: err.details,
      correlationId,
    })
    return
  }

  // Erro inesperado — logar sem expor dados sensíveis
  console.error('[CONECTOR_ERP] Erro não tratado:', {
    correlationId,
    name: (err as Error)?.name,
    message: (err as Error)?.message,
  })

  res.status(500).json({
    ok: false,
    code: 'INTERNAL_ERROR',
    message: 'Erro interno do servidor',
    correlationId,
  })
}
