// server/middleware/requireAuth.ts
// Valida JWT do Clerk em rotas protegidas
// Injeta req.auth com { userId, tenantId } após validação

import type { Request, Response, NextFunction } from 'express'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'
import { prisma } from '../lib/prisma.js'

const USER_CACHE_TTL = 60_000 // 1 minuto
const userCache = new Map<string, { userId: string; tenantId: string; expiry: number }>()

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

    // Busca tenant vinculado ao clerk_user_id (com cache em memória)
    const cacheKey = `user:${verified.sub}`
    const cached = userCache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      req.auth = { userId: cached.userId, tenantId: cached.tenantId, clerkUserId: verified.sub }
      next()
      return
    }

    const user = await prisma.user.findFirst({
      where: { clerk_user_id: verified.sub },
      select: { id: true, tenant_id: true },
    })

    if (!user) {
      throw new AppError('Usuário não encontrado no sistema', 401, 'UNAUTHORIZED')
    }

    userCache.set(cacheKey, {
      userId: user.id,
      tenantId: user.tenant_id,
      expiry: Date.now() + USER_CACHE_TTL,
    })

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
