// server/middleware/requireAuth.ts
// Valida JWT do Clerk em rotas protegidas
// Injeta req.auth com { id_usuario, id_organizacao } após validação

import type { Request, Response, NextFunction } from 'express'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'
import { prisma } from '../lib/prisma.js'
import { auditLog } from '../../../organizacao/historico-global/src/audit-client.js'

const USER_CACHE_TTL = 60_000 // 1 minuto
const USER_CACHE_MAX = 500 // limite máximo de entradas — evita memory leak
const userCache = new Map<string, { id_usuario: string; id_organizacao: string; tipo_usuario: string; nome_usuario: string; expiry: number }>()

declare global {
  namespace Express {
    interface Request {
      auth: {
        id_usuario: string
        id_organizacao: string
        clerkUserId: string
        tipo_usuario: string
        nome_usuario: string
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
      req.auth = { id_usuario: cached.id_usuario, id_organizacao: cached.id_organizacao, clerkUserId: verified.sub, tipo_usuario: cached.tipo_usuario, nome_usuario: cached.nome_usuario }
      next()
      return
    }

    let user = await prisma.usuario.findFirst({
      where: { clerk_user_id: verified.sub },
      select: { id_usuario: true, id_organizacao_usuario: true, tipo_usuario: true, nome_usuario: true },
    })

    // Fallback: clerk_user_id não encontrado no banco — tenta vincular pelo email.
    // Seguro: aceita apenas se houver exatamente um usuário com esse email no sistema
    // (sem ambiguidade → impossível cruzar tenant boundaries).
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(verified.sub)
        const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
          ?? clerkUser.emailAddresses[0]?.emailAddress

        if (primaryEmail) {
          const candidates = await prisma.usuario.findMany({
            where: { email_usuario: primaryEmail },
            select: { id_usuario: true, id_organizacao_usuario: true, tipo_usuario: true, nome_usuario: true },
          })
          if (candidates.length === 1) {
            const only = candidates[0]
            await prisma.usuario.update({
              where: { id_usuario: only.id_usuario },
              data: { clerk_user_id: verified.sub },
            })
            user = only
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
      id_usuario: user.id_usuario,
      id_organizacao: user.id_organizacao_usuario,
      tipo_usuario: user.tipo_usuario,
      nome_usuario: user.nome_usuario ?? '',
      expiry: Date.now() + USER_CACHE_TTL,
    })

    req.auth = {
      id_usuario: user.id_usuario,
      id_organizacao: user.id_organizacao_usuario,
      clerkUserId: verified.sub,
      tipo_usuario: user.tipo_usuario,
      nome_usuario: user.nome_usuario ?? '',
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
