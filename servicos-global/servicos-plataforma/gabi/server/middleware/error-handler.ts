// server/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
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

  // Erro de validacao Zod — retorna 400 com detalhes
  if (err instanceof ZodError) {
    const mensagens = err.issues.map((issue) => {
      const campo = issue.path.join('.')
      return campo ? `${campo}: ${issue.message}` : issue.message
    })
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: mensagens.join('; '),
        details: err.issues,
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
