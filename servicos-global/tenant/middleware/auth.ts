// middleware/auth.ts
// Extrai tenant_id e user_id dos headers propagados pelo servidor de produto.
// O JWT foi validado pelo produto antes de chamar o servidor tenant.
// Versão compartilhada — usada pelo super-servidor.

import { Request, Response, NextFunction } from 'express'

const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? ''

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Rotas inter-serviço (admin, S2S) passam com x-internal-key — sem tenant_id
  const internalKey = req.headers['x-internal-key'] as string | undefined
  if (INTERNAL_KEY && internalKey === INTERNAL_KEY) {
    req.auth = { tenantId: '__internal__', userId: 'system' }
    return next()
  }

  const tenantId = req.headers['x-tenant-id'] as string | undefined
  const userId   = req.headers['x-user-id']   as string | undefined

  if (!tenantId) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'x-tenant-id obrigatório' },
    })
    return
  }

  req.auth = { tenantId, userId: userId ?? '' }
  next()
}
