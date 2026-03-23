// server/lib/errors.ts
// Classe centralizada de erros e handler global.
// Toda rota lança AppError — o handler aqui responde.

import { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// AppError
// ---------------------------------------------------------------------------

export class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly isOperational: boolean

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true

    // Mantém o stack trace correto no Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  static notFound(resource: string) {
    return new AppError(`${resource} não encontrado(a).`, 404, 'NOT_FOUND')
  }

  static unauthorized(message = 'Não autorizado.') {
    return new AppError(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Acesso negado.') {
    return new AppError(message, 403, 'FORBIDDEN')
  }

  static conflict(message: string) {
    return new AppError(message, 409, 'CONFLICT')
  }

  static validation(message: string) {
    return new AppError(message, 422, 'VALIDATION_ERROR')
  }
}

// ---------------------------------------------------------------------------
// errorHandler — handler global Express
// ---------------------------------------------------------------------------

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    })
  }

  // Erro inesperado — loga e retorna 500 genérico
  console.error('[CRONOMETRO] Erro inesperado:', err)

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocorreu um erro interno. Tente novamente.',
    },
  })
}
