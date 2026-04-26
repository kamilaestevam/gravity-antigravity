// server/middleware/auth.ts
// Valida x-internal-key e extrai tenant_id obrigatório de toda requisição protegida.
// Nenhum email pode ser enviado sem tenant_id validado.

import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors.js'

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const internalKey = req.headers['x-internal-key']
  if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
    return next(new AppError('Chave interna inválida ou ausente', 401, 'UNAUTHORIZED'))
  }

  const tenantId = req.headers['x-tenant-id'] as string | undefined
  if (!tenantId) {
    return next(new AppError('tenant_id obrigatório — header x-tenant-id ausente', 400, 'MISSING_TENANT_ID'))
  }

  const userId = (req.headers['x-user-id'] as string | undefined) ?? 'system'

  req.auth = { tenantId, userId }
  next()
}
