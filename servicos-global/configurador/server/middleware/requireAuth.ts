// server/middleware/requireAuth.ts
// Valida JWT do Clerk em rotas protegidas
// Injeta req.auth com { userId, tenantId } após validação

import type { Request, Response, NextFunction } from 'express'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'
import { prisma } from '../lib/prisma.js'
import { auditLog } from '../../../tenant/historico-global/src/audit-client.js'

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
      logAuthFailure(req, 'Token de autenticação ausente')
      throw new AppError('Token de autenticação ausente', 401, 'UNAUTHORIZED')
    }

    const token = authHeader.slice(7)

    let verified: { sub: string } | null = null
    try {
      verified = await clerkClient.verifyToken(token)
    } catch {
      logAuthFailure(req, 'Token inválido ou expirado')
      throw new AppError('Token inválido ou expirado', 401, 'UNAUTHORIZED')
    }

    if (!verified?.sub) {
      logAuthFailure(req, 'Token sem subject')
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

    let user = await prisma.usuario.findFirst({
      where: { clerk_user_id: verified.sub },
      select: { id: true, tenant_id: true, role: true },
    })

    // Fallback: se não encontrou pelo clerk_user_id, tenta por email.
    // SEGURANÇA:
    //   1) Preferencial: filtra por tenant_id do publicMetadata do Clerk.
    //   2) Fallback seguro: se metadata não tiver tenantId, aceita match por email
    //      somente se houver EXATAMENTE UM usuário com esse email no DB inteiro
    //      (sem ambiguidade → impossível cruzar tenant boundaries).
    //      Isso resolve o caso bootstrap/pós-migração onde a metadata do Clerk
    //      ficou sem tenantId mas o usuário já existe no DB com role definido.
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(verified.sub)
        const tenantIdFromMeta = clerkUser.publicMetadata?.tenantId as string | undefined
        const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
          ?? clerkUser.emailAddresses[0]?.emailAddress

        if (primaryEmail) {
          if (tenantIdFromMeta) {
            // Caminho 1: metadata tem tenantId → match estrito
            const byEmail = await prisma.usuario.findFirst({
              where: { email: primaryEmail, tenant_id: tenantIdFromMeta },
              select: { id: true, tenant_id: true, role: true },
            })
            if (byEmail) {
              await prisma.usuario.update({
                where: { id: byEmail.id },
                data: { clerk_user_id: verified.sub },
              })
              user = byEmail
            }
          } else {
            // Caminho 2: metadata sem tenantId → aceita só se match único global
            const candidates = await prisma.usuario.findMany({
              where: { email: primaryEmail },
              select: { id: true, tenant_id: true, role: true },
            })
            if (candidates.length === 1) {
              const only = candidates[0]
              await prisma.usuario.update({
                where: { id: only.id },
                data: { clerk_user_id: verified.sub },
              })
              user = only
            }
          }
        }
      } catch {
        // Falha ao consultar Clerk — continua sem o fallback
      }
    }

    if (!user) {
      logAuthFailure(req, `Usuário não encontrado para clerk_user_id: ${verified.sub}`)
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

/**
 * Ponto Cego 2 — Registra falha de autenticação no histórico.
 * Fire-and-forget: nunca bloqueia o fluxo de erro.
 */
function logAuthFailure(req: Request, reason: string): void {
  setImmediate(() => {
    auditLog({
      tenant_id: (req.headers['x-tenant-id'] as string) ?? 'unknown',
      actor_type: 'USER',
      actor_id: 'anonymous',
      actor_name: 'anonymous',
      actor_ip: req.ip,
      module: 'auth',
      resource_type: 'Session',
      action: 'AUTH_FAILURE',
      action_detail: `Falha de autenticação: ${reason}`,
      status: 'FAILURE',
      error_message: reason,
      actor_metadata: {
        endpoint: req.originalUrl || req.url,
        method: req.method,
        user_agent: req.headers['user-agent'],
      },
    })
  })
}
