// server/middleware/requireGravityAdmin.ts
// Verifica se o usuário possui role de administrador Gravity (SUPER_ADMIN ou ADMIN)
// Lê de req.auth.role — carregado do banco pelo requireAuth. Sem chamada ao Clerk.
// Deve ser usado APÓS requireAuth.

import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/appError.js'

const GRAVITY_ROLES = new Set(['SUPER_ADMIN', 'ADMIN'])

export async function requireGravityAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth?.tipo_usuario) {
      throw new AppError('Autenticação necessária', 401, 'UNAUTHORIZED')
    }

    if (!GRAVITY_ROLES.has(req.auth.tipo_usuario)) {
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
