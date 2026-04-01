// server/middleware/requireGravityAdmin.ts
// Verifica se o usuário possui role gravity_admin (publicMetadata.role no Clerk)
// Deve ser usado APÓS requireAuth

import type { Request, Response, NextFunction } from 'express'
import { isGravityAdmin } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'

export async function requireGravityAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth?.clerkUserId) {
      throw new AppError('Autenticação necessária', 401, 'UNAUTHORIZED')
    }

    const isAdmin = await isGravityAdmin(req.auth.clerkUserId)
    if (!isAdmin) {
      throw new AppError(
        'Acesso restrito a administradores Gravity',
        403,
        'FORBIDDEN'
      )
    }

    next()
  } catch (err) {
    next(err)
  }
}
