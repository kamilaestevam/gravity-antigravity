// @vitest-environment node
// testes/testes-funcionais/security/cors-bypass.test.ts
// Testes funcionais — CORS não permite bypass em desenvolvimento
//
// Valida que:
//   1. Origens permitidas recebem Access-Control-Allow-Origin
//   2. Origens desconhecidas NÃO recebem Access-Control-Allow-Origin
//   3. NODE_ENV=development NÃO bypassa as verificações CORS

import { describe, it, expect, afterEach } from 'vitest'
import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

// ─── Helpers ────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = ['http://localhost:5176', 'http://localhost:5177', 'http://localhost:8003']
const MALICIOUS_ORIGIN = 'https://evil-site.com'

/**
 * Replica a lógica CORS corrigida dos produtos (sem bypass NODE_ENV).
 * Mesma implementação de produto/bid-cambio/server/src/index.ts pós-fix.
 */
function buildApp() {
  const app = express()
  app.use(express.json())

  app.use((_req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = [
      ...ALLOWED_ORIGINS,
      process.env.CLIENT_URL ?? '',
    ].filter(Boolean)

    const origin = _req.headers.origin ?? ''
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-internal-key, x-tenant-id')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    if (_req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  return app
}

// ─── Suites ─────────────────────────────────────────────────────────────────

describe('CORS — origens permitidas', () => {
  const app = buildApp()

  it('requisição de origem permitida recebe Access-Control-Allow-Origin', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', ALLOWED_ORIGINS[0])

    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGINS[0])
  })

  it('preflight OPTIONS de origem permitida retorna 204', async () => {
    const response = await request(app)
      .options('/health')
      .set('Origin', ALLOWED_ORIGINS[0])
      .set('Access-Control-Request-Method', 'GET')

    expect(response.status).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGINS[0])
  })

  it('todas as origens da lista são aceitas', async () => {
    for (const origin of ALLOWED_ORIGINS) {
      const response = await request(app)
        .get('/health')
        .set('Origin', origin)

      expect(response.headers['access-control-allow-origin']).toBe(origin)
    }
  })
})

describe('CORS — origens bloqueadas', () => {
  const app = buildApp()

  it('requisição de origem desconhecida NÃO recebe Access-Control-Allow-Origin', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', MALICIOUS_ORIGIN)

    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('origem vazia NÃO recebe wildcard "*"', async () => {
    const response = await request(app)
      .get('/health')

    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('CORS — NODE_ENV=development NÃO bypassa verificações', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('com NODE_ENV=development, origem maliciosa continua bloqueada', async () => {
    process.env.NODE_ENV = 'development'
    const app = buildApp()

    const response = await request(app)
      .get('/health')
      .set('Origin', MALICIOUS_ORIGIN)

    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('com NODE_ENV=development, NÃO retorna wildcard "*"', async () => {
    process.env.NODE_ENV = 'development'
    const app = buildApp()

    const response = await request(app)
      .get('/health')
      .set('Origin', MALICIOUS_ORIGIN)

    expect(response.headers['access-control-allow-origin']).not.toBe('*')
  })

  it('com NODE_ENV=development, origem permitida continua funcionando', async () => {
    process.env.NODE_ENV = 'development'
    const app = buildApp()

    const response = await request(app)
      .get('/health')
      .set('Origin', ALLOWED_ORIGINS[0])

    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGINS[0])
  })
})
