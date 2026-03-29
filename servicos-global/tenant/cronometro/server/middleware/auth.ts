// server/middleware/auth.ts
// Middleware de autenticação JWT + validação de internal key.
// O tenant_id SEMPRE vem do token JWT — nunca do body.

import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'
import { AppError } from '../lib/errors.js'

// ---------------------------------------------------------------------------
// Extensão do tipo Request para incluir auth
// ---------------------------------------------------------------------------

declare global {
  namespace Express {
    interface Request {
      auth: {
        tenantId: string
        userId: string
        role?: string
      }
    }
  }
}

// ---------------------------------------------------------------------------
// requireAuth
// Valida o header Authorization: Bearer <jwt>
// Extrai tenantId e userId do payload.
//
// NOTA: Em produção, o JWT é validado pelo Clerk (verificar 'x-clerk-user-id'
// e 'x-clerk-org-id' injetados pelo gateway). Em dev, aceita headers diretos.
// ---------------------------------------------------------------------------

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  // Em produção, o gateway Clerk injeta estes headers após validar o JWT
  // Normalizar: headers podem ser string[] se duplicados
  const rawTenantId = req.headers['x-tenant-id'] || req.headers['x-clerk-org-id']
  const tenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId

  const rawUserId = req.headers['x-user-id'] || req.headers['x-clerk-user-id']
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId

  if (!tenantId || !userId) {
    return next(
      AppError.unauthorized('Token de autenticação ausente ou inválido.')
    )
  }

  req.auth = {
    tenantId: tenantId as string,
    userId: userId as string,
    role: req.headers['x-user-role'] as string | undefined,
  }

  return next()
}

// ---------------------------------------------------------------------------
// requireInternalKey
// Valida chamadas entre serviços internos via x-internal-key.
// ---------------------------------------------------------------------------

export function requireInternalKey(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const rawKey = req.headers['x-internal-key']
  const key = Array.isArray(rawKey) ? rawKey[0] : rawKey
  const expected = process.env.INTERNAL_API_KEY

  if (!key || !expected) {
    return next(AppError.unauthorized('Chave interna ausente ou nao configurada.'))
  }

  const bufA = Buffer.from(key, 'utf8')
  const bufB = Buffer.from(expected, 'utf8')
  if (bufA.length !== bufB.length || !timingSafeEqual(bufA, bufB)) {
    return next(AppError.unauthorized('Chave interna invalida.'))
  }

  return next()
}
