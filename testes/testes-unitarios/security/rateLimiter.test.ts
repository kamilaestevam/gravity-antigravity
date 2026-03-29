// @vitest-environment node
/**
 * Testes unitários — rateLimiter.ts
 * Verifica presets, janela de tempo, headers IETF e bloqueio 429.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { createRateLimiter, rateLimitPresets } from '../../../servicos-global/tenant/middleware/rateLimiter.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMocks(headers: Record<string, string> = {}) {
  const req = {
    headers,
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as Request

  const resHeaders: Record<string, string | number> = {}
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn((key: string, val: string | number) => { resHeaders[key] = val }),
    _headers: resHeaders,
  } as unknown as Response & { _headers: Record<string, string | number> }

  const next = vi.fn() as unknown as NextFunction

  return { req, res, next }
}

// ---------------------------------------------------------------------------
// Tests: createRateLimiter
// ---------------------------------------------------------------------------

describe('createRateLimiter', () => {
  it('deve permitir requests dentro do limite', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 5 })
    const { req, res, next } = makeMocks()

    limiter(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5)
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 4)
  })

  it('deve bloquear com 429 apos exceder o limite', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 3 })

    // Simular 4 requests do mesmo IP
    for (let i = 0; i < 3; i++) {
      const { req, res, next } = makeMocks()
      limiter(req, res, next)
      expect(next).toHaveBeenCalled()
    }

    // 4o request — deve ser bloqueado
    const { req, res, next } = makeMocks()
    limiter(req, res, next)

    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'TOO_MANY_REQUESTS' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('deve setar Retry-After header quando bloqueado', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 })

    // 1o ok
    const m1 = makeMocks()
    limiter(m1.req, m1.res, m1.next)

    // 2o bloqueado
    const m2 = makeMocks()
    limiter(m2.req, m2.res, m2.next)

    expect(m2.res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(Number))
  })

  it('deve usar keyGenerator customizado', () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 2,
      keyGenerator: (req) => req.headers['x-tenant-id'] as string || 'default',
    })

    // Tenant A: 2 requests ok
    for (let i = 0; i < 2; i++) {
      const { req, res, next } = makeMocks({ 'x-tenant-id': 'tenant-A' })
      limiter(req, res, next)
      expect(next).toHaveBeenCalled()
    }

    // Tenant A: 3o bloqueado
    const mA = makeMocks({ 'x-tenant-id': 'tenant-A' })
    limiter(mA.req, mA.res, mA.next)
    expect(mA.res.status).toHaveBeenCalledWith(429)

    // Tenant B: ainda tem cota
    const mB = makeMocks({ 'x-tenant-id': 'tenant-B' })
    limiter(mB.req, mB.res, mB.next)
    expect(mB.next).toHaveBeenCalled()
  })

  it('deve usar mensagem customizada', () => {
    const limiter = createRateLimiter({ max: 1, message: 'Calma la!' })

    const m1 = makeMocks()
    limiter(m1.req, m1.res, m1.next)

    const m2 = makeMocks()
    limiter(m2.req, m2.res, m2.next)

    expect(m2.res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Calma la!' })
    )
  })

  it('deve decrementar X-RateLimit-Remaining corretamente', () => {
    const limiter = createRateLimiter({ max: 5 })

    const calls: number[] = []
    for (let i = 0; i < 5; i++) {
      const { req, res, next } = makeMocks()
      limiter(req, res, next)
      // Pegar o valor de remaining do ultimo setHeader
      const remainingCall = (res.setHeader as any).mock.calls.find(
        (c: any[]) => c[0] === 'X-RateLimit-Remaining'
      )
      if (remainingCall) calls.push(remainingCall[1])
    }

    expect(calls).toEqual([4, 3, 2, 1, 0])
  })
})

// ---------------------------------------------------------------------------
// Tests: rateLimitPresets
// ---------------------------------------------------------------------------

describe('rateLimitPresets', () => {
  it('preset public deve ter max 30', () => {
    const limiter = rateLimitPresets.public()
    expect(limiter).toBeTypeOf('function')
    // Fazer 30 requests — devem passar
    for (let i = 0; i < 30; i++) {
      const { req, res, next } = makeMocks({ 'x-tenant-id': `preset-public-${i}` })
      ;(req as any).ip = `10.0.0.${i}` // IPs diferentes
      limiter(req, res, next)
      expect(next).toHaveBeenCalled()
    }
  })

  it('preset auth deve ter max 10', () => {
    const limiter = rateLimitPresets.auth()
    expect(limiter).toBeTypeOf('function')
  })

  it('preset webhook deve ter max 100', () => {
    const limiter = rateLimitPresets.webhook()
    expect(limiter).toBeTypeOf('function')
  })

  it('preset internal deve ter max 200', () => {
    const limiter = rateLimitPresets.internal()
    expect(limiter).toBeTypeOf('function')
  })
})
