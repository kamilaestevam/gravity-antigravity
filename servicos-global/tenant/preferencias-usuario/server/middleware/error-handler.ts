import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message })
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ status: 'error', message: 'Dados inválidos', details: err.flatten() })
  }

  console.error('[preferencias-usuario] Erro não tratado:', err)
  return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' })
}
