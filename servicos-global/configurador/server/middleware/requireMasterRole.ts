// server/middleware/requireMasterRole.ts
// Verifica se o usuário possui role MASTER no tenant
// Deve ser usado APÓS requireAuth

import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/appError.js'

export function requireMasterRole(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.auth?.role !== 'MASTER') {
    next(new AppError('Acesso restrito a usuários Master', 403, 'FORBIDDEN'))
    return
  }
  next()
}
