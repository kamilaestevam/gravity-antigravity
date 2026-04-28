// server/middleware/requireInternalKey.ts
// Valida x-internal-key em rotas internas (S2S)
// Deve ser aplicado em todas as rotas /api/v1/internal/*

import type { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'
import { AppError } from '../lib/appError.js'

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export function requireInternalKey(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const key = req.headers['x-internal-key'] as string | undefined
  const expected = process.env.INTERNAL_SERVICE_KEY
  if (!expected) {
    throw new AppError('INTERNAL_SERVICE_KEY não configurada', 500, 'CONFIG_ERROR')
  }
  if (!key || !safeCompare(key, expected)) {
    throw new AppError('Chave interna inválida ou ausente', 401, 'UNAUTHORIZED')
  }
  next()
}
