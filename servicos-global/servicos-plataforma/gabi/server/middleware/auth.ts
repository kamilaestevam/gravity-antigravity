// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'node:crypto'
import { AppError } from '../lib/errors.js'

function validarChaveInterna(req: Request): boolean {
  const internalKey = req.headers['x-internal-key'] ?? req.headers['x-chave-interna-servico']
  const expectedKey = process.env.INTERNAL_API_KEY ?? process.env.CHAVE_INTERNA_SERVICO
  const expectedBuf = Buffer.from(expectedKey ?? '')
  const receivedBuf = Buffer.from(typeof internalKey === 'string' ? internalKey : '')
  return !!internalKey && !!expectedKey && expectedBuf.length === receivedBuf.length && timingSafeEqual(expectedBuf, receivedBuf)
}

export function s2sMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!validarChaveInterna(req)) {
    return next(new AppError('Chave interna inválida ou ausente', 401, 'UNAUTHORIZED'))
  }
  req.auth = { id_organizacao: '__admin_global__', id_usuario: 'system' }
  next()
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!validarChaveInterna(req)) {
    return next(new AppError('Chave interna inválida ou ausente', 401, 'UNAUTHORIZED'))
  }

  const tenantId = req.headers['x-id-organizacao'] as string | undefined
  if (!tenantId) {
    return next(new AppError('x-id-organizacao required', 401, 'MISSING_TENANT_ID'))
  }

  const userId = (req.headers['x-id-usuario'] as string | undefined) ?? 'system'

  req.auth = { id_organizacao: tenantId, id_usuario: userId }
  next()
}
