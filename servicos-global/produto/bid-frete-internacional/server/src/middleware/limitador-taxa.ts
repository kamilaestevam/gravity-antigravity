/**
 * limitador-taxa.ts — Rate Limiting local do produto bid-frete-internacional
 * Cópia local para respeitar isolamento de produto (sem imports cross-boundary).
 */

import { Request, Response, NextFunction } from 'express'

interface RateLimiterOptions {
  windowMs?: number
  max?: number
  message?: string
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

  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key)
      }
    }
  }, 5 * 60_000)

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
  const tenantId = req.headers['x-id-organizacao'] || 'anonymous'
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  return `${tenantId}:${ip}`
}

export const rateLimitPresets = {
  public: () => createRateLimiter({ windowMs: 60_000, max: 30 }),
  auth: () => createRateLimiter({ windowMs: 60_000, max: 10, message: 'Too many login attempts. Please wait.' }),
  webhook: () => createRateLimiter({ windowMs: 60_000, max: 100 }),
  internal: () => createRateLimiter({ windowMs: 60_000, max: 200 }),
}
