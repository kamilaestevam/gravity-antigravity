// middleware/auth.ts
// Extrai tenant_id e user_id dos headers propagados pelo servidor de produto.
// O JWT foi validado pelo produto antes de chamar o servidor tenant.
// Versão compartilhada — usada pelo super-servidor.

import { Request, Response, NextFunction } from 'express'

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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
