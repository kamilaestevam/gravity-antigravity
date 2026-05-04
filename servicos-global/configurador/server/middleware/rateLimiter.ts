/**
 * rateLimiter.ts — Rate Limiter local para o Configurador
 * Copia inline do tenant/middleware/rateLimiter.ts
 * Necessario porque tsx/Node 24 nao resolve exports cross-package via ESM
 */

import type { Request, Response, NextFunction } from 'express'

interface RateLimiterOptions {
  windowMs?: number
  max?: number
  message?: string
  keyGenerator?: (req: Request) => string
  onBlocked?: (key: string, req: Request) => void
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
    onBlocked,
  } = options

  const store = new Map<string, RateLimiterEntry>()

  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetTime) store.delete(key)
    }
  }, 5 * 60_000)

  if (cleanupInterval.unref) cleanupInterval.unref()

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

    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count))
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000))

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000))
      if (onBlocked) {
        try { onBlocked(key, req) } catch { /* nao bloquear response */ }
      }
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
  const id_organizacao = req.headers['x-id-organizacao'] || 'anonymous'
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  return `${id_organizacao}:${ip}`
}

function defaultOnBlocked(key: string, req: Request): void {
  const endpoint = req.originalUrl || req.url || 'unknown'
  console.warn(`[RATE-LIMIT] Blocked: ${key} on ${endpoint}`)
}

export const rateLimitPresets = {
  public: () => createRateLimiter({ windowMs: 60_000, max: 30, onBlocked: defaultOnBlocked }),
  auth: () => createRateLimiter({ windowMs: 60_000, max: 10, message: 'Too many login attempts.', onBlocked: defaultOnBlocked }),
  webhook: () => createRateLimiter({ windowMs: 60_000, max: 100, onBlocked: defaultOnBlocked }),
  internal: () => createRateLimiter({ windowMs: 60_000, max: 200, onBlocked: defaultOnBlocked }),
  admin: () => createRateLimiter({ windowMs: 60_000, max: 60, message: 'Admin rate limit exceeded.', onBlocked: defaultOnBlocked }),
  read:  () => createRateLimiter({ windowMs: 60_000, max: 120, onBlocked: defaultOnBlocked }),
}
