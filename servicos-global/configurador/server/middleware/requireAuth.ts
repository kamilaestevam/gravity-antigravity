// server/middleware/requireAuth.ts
// Valida JWT do Clerk em rotas protegidas
// Injeta req.auth com { userId, tenantId } após validação

import type { Request, Response, NextFunction } from 'express'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'

declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string
        tenantId: string
        clerkUserId: string
      }
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    // ─── DEMO_MODE bypass: permite acesso sem Clerk em desenvolvimento local ───
    if (process.env.DEMO_MODE === 'true' && !authHeader?.startsWith('Bearer ')) {
      const { prisma } = await import('../lib/prisma.js')
      // Busca o primeiro usuário admin disponível no banco
      const demoUser = await prisma.user.findFirst({
        where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
        select: { id: true, tenant_id: true, clerk_user_id: true },
      })
      if (demoUser) {
        console.log('[requireAuth] DEMO_MODE: bypass de auth ativado para', req.path)
        req.auth = {
          userId: demoUser.id,
          tenantId: demoUser.tenant_id,
          clerkUserId: demoUser.clerk_user_id ?? 'demo-user',
        }
        return next()
      }
    }

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Token de autenticação ausente', 401, 'UNAUTHORIZED')
    }

    const token = authHeader.slice(7)

    let verified: { sub: string } | null = null
    try {
      verified = await clerkClient.verifyToken(token)
    } catch {
      throw new AppError('Token inválido ou expirado', 401, 'UNAUTHORIZED')
    }

    if (!verified?.sub) {
      throw new AppError('Token inválido', 401, 'UNAUTHORIZED')
    }

    // Busca tenant vinculado ao clerk_user_id
    const { prisma } = await import('../lib/prisma.js')
    const user = await prisma.user.findFirst({
      where: { clerk_user_id: verified.sub },
      select: { id: true, tenant_id: true },
    })

    if (!user) {
      throw new AppError('Usuário não encontrado no sistema', 401, 'UNAUTHORIZED')
    }

    req.auth = {
      userId: user.id,
      tenantId: user.tenant_id,
      clerkUserId: verified.sub,
    }

    next()
  } catch (err) {
    next(err)
  }
}
