// server/middleware/requireAuth.ts
// Valida JWT do Clerk em rotas protegidas
// Injeta req.auth com { userId, tenantId } após validação

import type { Request, Response, NextFunction } from 'express'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'
import { prisma } from '../lib/prisma.js'

const USER_CACHE_TTL = 60_000 // 1 minuto
const USER_CACHE_MAX = 500 // limite máximo de entradas — evita memory leak
const userCache = new Map<string, { userId: string; tenantId: string; role: string; expiry: number }>()

declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string
        tenantId: string
        clerkUserId: string
        role: string
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
      req.auth = { userId: cached.userId, tenantId: cached.tenantId, clerkUserId: verified.sub, role: cached.role }
      next()
      return
    }

    let user = await prisma.user.findFirst({
      where: { clerk_user_id: verified.sub },
      select: { id: true, tenant_id: true, role: true },
    })

    // Fallback: se não encontrou pelo clerk_user_id, tenta por email.
    // Isso acontece quando a conta foi criada no DB sem o clerk_user_id correto
    // (ex: seed manual, migração). Ao achar por email, auto-vincula o clerk_user_id.
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(verified.sub)
        const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
          ?? clerkUser.emailAddresses[0]?.emailAddress

        if (primaryEmail) {
          const byEmail = await prisma.user.findFirst({
            where: { email: primaryEmail },
            select: { id: true, tenant_id: true, role: true },
          })
          if (byEmail) {
            // Auto-vincula para que as próximas chamadas usem o caminho rápido
            await prisma.user.update({
              where: { id: byEmail.id },
              data: { clerk_user_id: verified.sub },
            })
            user = byEmail
            console.log(`[requireAuth] clerk_user_id auto-vinculado para ${primaryEmail} (${verified.sub})`)
          }
        }
      } catch {
        // Falha ao consultar Clerk — continua sem o fallback
      }
    }

    if (!user) {
      throw new AppError('Usuário não encontrado no sistema', 401, 'UNAUTHORIZED')
    }

    // Limpa entradas expiradas quando o cache atinge o limite
    if (userCache.size >= USER_CACHE_MAX) {
      const now = Date.now()
      for (const [key, val] of userCache) {
        if (val.expiry <= now) userCache.delete(key)
      }
      // Se ainda cheio após limpeza, remove as mais antigas (FIFO via Map insertion order)
      if (userCache.size >= USER_CACHE_MAX) {
        const first = userCache.keys().next().value
        if (first) userCache.delete(first)
      }
    }

    userCache.set(cacheKey, {
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      expiry: Date.now() + USER_CACHE_TTL,
    })

    req.auth = {
      userId: user.id,
      tenantId: user.tenant_id,
      clerkUserId: verified.sub,
      role: user.role,
    }

    next()
  } catch (err) {
    next(err)
  }
}
