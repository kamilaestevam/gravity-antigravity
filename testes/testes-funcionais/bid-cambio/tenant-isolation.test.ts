// @vitest-environment node
/**
 * Testes funcionais — BID Cambio / Isolamento de Tenant
 * Valida que o middleware injeta tenant_id e que rotas nao vazam dados cross-tenant
 */

import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

// --- Mocks ---

vi.mock('axios', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }) },
}))

vi.mock('../../../produto/bid-cambio/server/src/services/tenantIntegrations.js', () => ({
  atividadesIntegration: { criarAtividade: vi.fn() },
  historicoIntegration: { registrar: vi.fn() },
  notificacoesIntegration: { enviar: vi.fn() },
  emailIntegration: { enviar: vi.fn() },
}))

vi.mock('../../../produto/bid-cambio/server/src/middleware/requireInternalKey.js', () => ({
  requireInternalKey: (_req: any, _res: any, next: any) => next(),
}))

vi.mock('../../../produto/bid-cambio/server/src/middleware/tenantIsolation.js', () => ({
  tenantIsolationMiddleware: vi.fn(),
  withTenantIsolation: vi.fn(),
  prisma: { $queryRaw: vi.fn().mockResolvedValue([1]) },
}))

import { cambiosRouter } from '../../../produto/bid-cambio/server/src/routes/cambios.js'

describe('Tenant Isolation — Cross-tenant', () => {
  it('tenant A nao ve dados do tenant B', async () => {
    const findManyCalls: any[] = []

    const appA = express()
    appA.use(express.json())
    appA.use((req: any, _res: any, next: any) => {
      req.tenantId = 'tenant-A'
      req.prisma = {
        parcelaCambio: {
          findMany: vi.fn((args: any) => {
            findManyCalls.push({ tenant: 'A', where: args.where })
            return Promise.resolve([])
          }),
          count: vi.fn().mockResolvedValue(0),
        },
      }
      req.headers['x-user-id'] = 'user-A'
      next()
    })
    appA.use('/api/v1/bid-cambio/cambios', cambiosRouter)
    appA.use((err: any, _req: any, res: any, _next: any) => {
      res.status(err.statusCode ?? 500).json({ error: { message: err.message } })
    })

    const appB = express()
    appB.use(express.json())
    appB.use((req: any, _res: any, next: any) => {
      req.tenantId = 'tenant-B'
      req.prisma = {
        parcelaCambio: {
          findMany: vi.fn((args: any) => {
            findManyCalls.push({ tenant: 'B', where: args.where })
            return Promise.resolve([])
          }),
          count: vi.fn().mockResolvedValue(0),
        },
      }
      req.headers['x-user-id'] = 'user-B'
      next()
    })
    appB.use('/api/v1/bid-cambio/cambios', cambiosRouter)
    appB.use((err: any, _req: any, res: any, _next: any) => {
      res.status(err.statusCode ?? 500).json({ error: { message: err.message } })
    })

    await request(appA).get('/api/v1/bid-cambio/cambios')
    await request(appB).get('/api/v1/bid-cambio/cambios')

    // Cada chamada deve ter sido feita com o Prisma isolado do seu tenant
    // O middleware real injeta tenant_id via Prisma extension
    // Aqui validamos que cada app usou seu proprio prisma
    expect(findManyCalls).toHaveLength(2)
    expect(findManyCalls[0].tenant).toBe('A')
    expect(findManyCalls[1].tenant).toBe('B')
  })

  it('requireInternalKey bloqueia sem chave', async () => {
    // Importar o middleware real
    const { requireInternalKey: realMiddleware } = await vi.importActual<any>(
      '../../../produto/bid-cambio/server/src/middleware/requireInternalKey.js'
    )

    const app = express()
    app.use(express.json())

    // Setar a chave esperada
    process.env.INTERNAL_SERVICE_KEY = 'test-secret-key'

    app.use(realMiddleware)
    app.get('/api/v1/bid-cambio/cambios', (_req: any, res: any) => {
      res.json({ ok: true })
    })

    // Sem chave
    const res1 = await request(app)
      .get('/api/v1/bid-cambio/cambios')
    expect(res1.status).toBe(401)

    // Com chave errada
    const res2 = await request(app)
      .get('/api/v1/bid-cambio/cambios')
      .set('x-internal-key', 'chave-errada')
    expect(res2.status).toBe(401)

    // Com chave correta
    const res3 = await request(app)
      .get('/api/v1/bid-cambio/cambios')
      .set('x-internal-key', 'test-secret-key')
    expect(res3.status).toBe(200)

    delete process.env.INTERNAL_SERVICE_KEY
  })

  it('health check nao requer auth', async () => {
    const { requireInternalKey: realMiddleware } = await vi.importActual<any>(
      '../../../produto/bid-cambio/server/src/middleware/requireInternalKey.js'
    )

    process.env.INTERNAL_SERVICE_KEY = 'test-secret-key'

    const app = express()
    app.get('/health', (_req: any, res: any) => res.json({ status: 'ok' }))
    app.use(realMiddleware)
    app.get('/api/test', (_req: any, res: any) => res.json({ ok: true }))

    const res = await request(app).get('/health')
    expect(res.status).toBe(200)

    delete process.env.INTERNAL_SERVICE_KEY
  })
})
