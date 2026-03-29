/**
 * rateLimiter.ts — Middleware de Rate Limiting
 * Implementacao in-memory sem dependencias externas.
 *
 * Uso:
 *   import { createRateLimiter } from '@tenant/middleware/rateLimiter'
 *   app.use('/api/v1/public', createRateLimiter({ windowMs: 60_000, max: 30 }))
 *
 * Em producao com multiplas instancias, substituir por Redis-backed rate limiter.
 */

import { Request, Response, NextFunction } from 'express'

interface RateLimiterOptions {
  /** Janela de tempo em milissegundos (default: 60s) */
  windowMs?: number
  /** Maximo de requests por janela (default: 100) */
  max?: number
  /** Mensagem de erro retornada (default: 'Too many requests') */
  message?: string
  /** Funcao para extrair a chave de identificacao (default: IP + x-tenant-id) */
  keyGenerator?: (req: Request) => string
}

interface RateLimiterEntry {
  count: number
  resetTime: number
}

export function createRateLimiter(options: RateLimiterOptions = {}) {
  const {
    windowMs = 60_000,
    max = 100,
    message = 'Too many requests. Please try again later.',
    keyGenerator = defaultKeyGenerator,
  } = options

  const store = new Map<string, RateLimiterEntry>()

  // Limpar entradas expiradas periodicamente (a cada 5 minutos)
  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key)
      }
    }
  }, 5 * 60_000)

  // Nao impedir o processo de encerrar
  if (cleanupInterval.unref) {
    cleanupInterval.unref()
  }

  return function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = keyGenerator(req)
    const now = Date.now()

    let entry = store.get(key)

    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + windowMs }
      store.set(key, entry)
    } else {
      entry.count++
    }

    // Headers informativos (padrao IETF draft)
    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count))
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000))

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000))
      return res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      })
    }

    next()
  }
}

function defaultKeyGenerator(req: Request): string {
  const tenantId = req.headers['x-tenant-id'] || 'anonymous'
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  return `${tenantId}:${ip}`
}

/**
 * Presets comuns de rate limiting
 */
export const rateLimitPresets = {
  /** Endpoints publicos: 30 req/min por IP */
  public: () => createRateLimiter({ windowMs: 60_000, max: 30 }),
  /** Login/auth: 10 req/min por IP (anti brute-force) */
  auth: () => createRateLimiter({ windowMs: 60_000, max: 10, message: 'Too many login attempts. Please wait.' }),
  /** Webhooks: 100 req/min por IP */
  webhook: () => createRateLimiter({ windowMs: 60_000, max: 100 }),
  /** API interna: 200 req/min por tenant */
  internal: () => createRateLimiter({ windowMs: 60_000, max: 200 }),
}
