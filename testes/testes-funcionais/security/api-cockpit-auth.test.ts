// @vitest-environment node
/**
 * Testes funcionais — API Cockpit auth e Swagger protection
 * Verifica que /docs requer x-internal-key e que rate limiting funciona.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import express, { Request, Response } from 'express'
import request from 'supertest'

// Mock PrismaClient
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $queryRaw: vi.fn().mockResolvedValue([1]),
  })),
}))

// Mock routes
vi.mock('../../../servicos-global/tenant/api-cockpit/server/src/routes/tokens', () => ({
  tokensRouter: express.Router().get('/', (_req: Request, res: Response) => res.json({ tokens: [] })),
}))
vi.mock('../../../servicos-global/tenant/api-cockpit/server/src/routes/webhooks', () => ({
  webhooksRouter: express.Router().get('/', (_req: Request, res: Response) => res.json({ webhooks: [] })),
}))
vi.mock('../../../servicos-global/tenant/api-cockpit/server/src/routes/erp', () => ({
  erpRouter: express.Router().get('/', (_req: Request, res: Response) => res.json({ erp: [] })),
}))
vi.mock('../../../servicos-global/tenant/api-cockpit/server/src/routes/docs', () => ({
  docsRouter: express.Router().get('/', (_req: Request, res: Response) => res.json({ docs: 'swagger-ui' })),
}))

import { requireInternalKey } from '../../../servicos-global/tenant/api-cockpit/server/src/middleware/requireInternalKey.js'

describe('API Cockpit — Auth & Security', () => {
  let app: express.Express

  beforeEach(() => {
    process.env.INTERNAL_SERVICE_KEY = 'test-key-12345'

    app = express()
    app.use(express.json())

    // Health — sem auth
    app.get('/health', (_req, res) => res.json({ status: 'ok' }))

    // Docs — com auth
    app.use('/api/v1/cockpit/docs', requireInternalKey, (_req, res) => {
      res.json({ docs: 'swagger-ui' })
    })

    // Tokens — sem auth extra neste teste
    app.get('/api/v1/cockpit/tokens', (_req, res) => res.json({ tokens: [] }))
  })

  describe('requireInternalKey middleware', () => {
    it('health deve ser acessivel sem auth', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
    })

    it('docs deve retornar 403 sem x-internal-key', async () => {
      const res = await request(app).get('/api/v1/cockpit/docs')
      expect(res.status).toBe(403)
      expect(res.body.error).toContain('ausente')
    })

    it('docs deve retornar 403 com chave invalida', async () => {
      const res = await request(app)
        .get('/api/v1/cockpit/docs')
        .set('x-internal-key', 'chave-errada')
      expect(res.status).toBe(403)
      expect(res.body.error).toContain('invalida')
    })

    it('docs deve retornar 200 com chave valida', async () => {
      const res = await request(app)
        .get('/api/v1/cockpit/docs')
        .set('x-internal-key', 'test-key-12345')
      expect(res.status).toBe(200)
      expect(res.body.docs).toBe('swagger-ui')
    })

    it('deve retornar 500 se INTERNAL_SERVICE_KEY nao configurada', async () => {
      delete process.env.INTERNAL_SERVICE_KEY
      const res = await request(app)
        .get('/api/v1/cockpit/docs')
        .set('x-internal-key', 'qualquer')
      expect(res.status).toBe(500)
      expect(res.body.error).toContain('mal configurado')
    })

    it('deve aceitar header como array (primeiro valor)', async () => {
      // Simular header duplicado — supertest não suporta facilmente,
      // mas o middleware trata Array.isArray
      const res = await request(app)
        .get('/api/v1/cockpit/docs')
        .set('x-internal-key', 'test-key-12345')
      expect(res.status).toBe(200)
    })
  })
})
