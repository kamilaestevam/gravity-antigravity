// server/middleware/requireInternalKey.ts
// Valida x-internal-key em rotas internas (S2S)
// Deve ser aplicado em todas as rotas /api/internal/*

import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/appError.js'

export function requireInternalKey(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const key = req.headers['x-internal-key']
  if (!process.env.INTERNAL_SERVICE_KEY) {
    throw new AppError('INTERNAL_SERVICE_KEY não configurada', 500, 'CONFIG_ERROR')
  }
  if (key !== process.env.INTERNAL_SERVICE_KEY) {
    throw new AppError('Chave interna inválida ou ausente', 401, 'UNAUTHORIZED')
  }
  next()
}
