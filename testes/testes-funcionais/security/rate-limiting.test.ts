// @vitest-environment node
/**
 * Testes funcionais — Rate Limiting em endpoints publicos
 * Verifica que endpoints publicos respeitam limites de rate.
 */

import { describe, it, expect, vi } from 'vitest'
import express from 'express'
import request from 'supertest'
import { createRateLimiter } from '../../../servicos-global/tenant/middleware/rateLimiter.js'

function buildApp(max: number) {
  const app = express()
  app.use(express.json())

  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/api/public', createRateLimiter({ windowMs: 60_000, max }))
  app.get('/api/public/data', (_req, res) => res.json({ data: 'ok' }))

  return app
}

describe('Rate Limiting — testes funcionais HTTP', () => {
  it('deve permitir requests dentro do limite', async () => {
    const app = buildApp(5)

    const res = await request(app).get('/api/public/data')

    expect(res.status).toBe(200)
    expect(res.headers['x-ratelimit-limit']).toBe('5')
    expect(res.headers['x-ratelimit-remaining']).toBe('4')
    expect(res.headers['x-ratelimit-reset']).toBeDefined()
  })

  it('deve retornar 429 apos exceder o limite', async () => {
    const app = buildApp(3)

    // 3 requests ok
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get('/api/public/data')
      expect(res.status).toBe(200)
    }

    // 4o bloqueado
    const res = await request(app).get('/api/public/data')
    expect(res.status).toBe(429)
    expect(res.body.error).toBe('TOO_MANY_REQUESTS')
    expect(res.headers['retry-after']).toBeDefined()
  })

  it('deve incluir retryAfter no body do 429', async () => {
    const app = buildApp(1)

    await request(app).get('/api/public/data') // 1o ok
    const res = await request(app).get('/api/public/data') // 2o bloqueado

    expect(res.status).toBe(429)
    expect(res.body.retryAfter).toBeTypeOf('number')
    expect(res.body.retryAfter).toBeGreaterThan(0)
  })

  it('health check nao deve ser afetado pelo rate limiter', async () => {
    const app = buildApp(1)

    // Exaurir o rate limit
    await request(app).get('/api/public/data')
    const blocked = await request(app).get('/api/public/data')
    expect(blocked.status).toBe(429)

    // Health check ainda funciona
    const health = await request(app).get('/health')
    expect(health.status).toBe(200)
  })

  it('IPs diferentes devem ter cotas independentes', async () => {
    const app = buildApp(2)

    // Ambos passam (IPs diferentes via supertest = mesmo IP local, mas keys diferentes via header)
    // Para simular IPs diferentes, usamos keyGenerator no rateLimiter com x-tenant-id
    const appCustom = express()
    appCustom.use(express.json())
    appCustom.use('/api', createRateLimiter({
      max: 1,
      keyGenerator: (req) => req.headers['x-tenant-id'] as string || 'default',
    }))
    appCustom.get('/api/data', (_req, res) => res.json({ ok: true }))

    // Tenant A: 1 ok, 2 bloqueado
    const a1 = await request(appCustom).get('/api/data').set('x-tenant-id', 'A')
    expect(a1.status).toBe(200)
    const a2 = await request(appCustom).get('/api/data').set('x-tenant-id', 'A')
    expect(a2.status).toBe(429)

    // Tenant B: ainda tem cota
    const b1 = await request(appCustom).get('/api/data').set('x-tenant-id', 'B')
    expect(b1.status).toBe(200)
  })
})
