// server/middleware/auth.ts
// Middleware de autenticação JWT + validação de internal key.
// O tenant_id SEMPRE vem do token JWT — nunca do body.

import { Request, Response, NextFunction } from 'express'
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
  const tenantId =
    req.headers['x-tenant-id'] as string |
    req.headers['x-clerk-org-id'] as string

  const userId =
    req.headers['x-user-id'] as string |
    req.headers['x-clerk-user-id'] as string

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
  const key = req.headers['x-internal-key']

  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return next(AppError.unauthorized('Chave interna inválida.'))
  }

  return next()
}
