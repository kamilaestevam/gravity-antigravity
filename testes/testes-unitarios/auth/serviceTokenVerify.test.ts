// @vitest-environment node
// testes/testes-unitarios/auth/serviceTokenVerify.test.ts
// Testes unitarios para POST /api/internal/service-token/verify
// Valida que requireInternalKey protege o endpoint de verificacao

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    serviceToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { type Express } from 'express'

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const VALID_INTERNAL_KEY = 'test-internal-service-key'

async function buildTestApp(): Promise<Express> {
  process.env.INTERNAL_SERVICE_KEY = VALID_INTERNAL_KEY

  const { serviceTokenRouter } = await import(
    '../../../servicos-global/configurador/server/routes/serviceToken.js'
  )
  const { errorHandler } = await import(
    '../../../servicos-global/configurador/server/middleware/errorHandler.js'
  )

  const app = express()
  app.use(express.json())
  app.use('/api/internal', serviceTokenRouter)
  app.use(errorHandler)
  return app
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/internal/service-token/verify — requireInternalKey', () => {
  let app: Express

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env.INTERNAL_SERVICE_KEY = VALID_INTERNAL_KEY
    app = await buildTestApp()
  })

  // -------------------------------------------------------------------------
  // Rejeita sem chave interna
  // -------------------------------------------------------------------------

  it('deve rejeitar requisicoes sem x-internal-key', async () => {
    const res = await request(app)
      .post('/api/internal/service-token/verify')
      .send({ token: 'svc_sometoken' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('deve rejeitar requisicoes com x-internal-key invalida', async () => {
    const res = await request(app)
      .post('/api/internal/service-token/verify')
      .set('x-internal-key', 'wrong-key')
      .send({ token: 'svc_sometoken' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  // -------------------------------------------------------------------------
  // Aceita com chave interna valida
  // -------------------------------------------------------------------------

  it('deve aceitar requisicoes com x-internal-key valida e token existente', async () => {
    const { prisma } = await import(
      '../../../servicos-global/configurador/server/lib/prisma.js'
    )

    const mockToken = {
      token_hash: 'somehash',
      tenant_id: 'tenant-123',
      user_id: 'user-456',
      scope: 'SERVICE',
      revoked: false,
      expires_at: new Date(Date.now() + 3600_000), // 1h no futuro
    }

    vi.mocked(prisma.serviceToken.findUnique).mockResolvedValue(mockToken as any)

    const res = await request(app)
      .post('/api/internal/service-token/verify')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .send({ token: 'svc_validtoken' })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      valid: true,
      tenantId: 'tenant-123',
      userId: 'user-456',
      scope: 'SERVICE',
    })
  })

  it('deve retornar valid=false para token revogado', async () => {
    const { prisma } = await import(
      '../../../servicos-global/configurador/server/lib/prisma.js'
    )

    vi.mocked(prisma.serviceToken.findUnique).mockResolvedValue({
      token_hash: 'somehash',
      tenant_id: 'tenant-123',
      user_id: 'user-456',
      scope: 'SERVICE',
      revoked: true,
      expires_at: new Date(Date.now() + 3600_000),
    } as any)

    const res = await request(app)
      .post('/api/internal/service-token/verify')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .send({ token: 'svc_revokedtoken' })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      valid: false,
      reason: 'TOKEN_INVALID_OR_REVOKED',
    })
  })

  it('deve retornar valid=false para token expirado', async () => {
    const { prisma } = await import(
      '../../../servicos-global/configurador/server/lib/prisma.js'
    )

    vi.mocked(prisma.serviceToken.findUnique).mockResolvedValue({
      token_hash: 'somehash',
      tenant_id: 'tenant-123',
      user_id: 'user-456',
      scope: 'SERVICE',
      revoked: false,
      expires_at: new Date(Date.now() - 3600_000), // 1h no passado
    } as any)

    const res = await request(app)
      .post('/api/internal/service-token/verify')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .send({ token: 'svc_expiredtoken' })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      valid: false,
      reason: 'TOKEN_EXPIRED',
    })
  })
})
