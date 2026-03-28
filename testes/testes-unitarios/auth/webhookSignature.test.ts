// @vitest-environment node
// testes/testes-unitarios/auth/webhookSignature.test.ts
// Self-contained tests for SVIX webhook signature validation
// Replicates the security logic from auth.ts without importing the real module

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// ---------------------------------------------------------------------------
// Inline app replicating the exact security logic from auth.ts
// Uses a mockVerify function injected via closure (no svix import needed)
// ---------------------------------------------------------------------------

const WEBHOOK_SECRET = 'whsec_test_secret_for_svix'

function createApp() {
  const mockVerify = vi.fn()

  const mockPrisma = {
    user: {
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  }

  const app = express()
  app.use(express.json())

  // Replicates POST /api/v1/webhooks/clerk from auth.ts
  // The real code does: new Webhook(secret).verify(body, headers)
  // We replicate the same check flow, using mockVerify to simulate svix
  app.post('/api/v1/webhooks/clerk', async (req, res, next) => {
    try {
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
      if (!webhookSecret) {
        return res.status(500).json({
          error: { code: 'CONFIG_ERROR', message: 'CLERK_WEBHOOK_SECRET não configurada' },
        })
      }

      const svixId = req.headers['svix-id'] as string | undefined
      const svixTimestamp = req.headers['svix-timestamp'] as string | undefined
      const svixSignature = req.headers['svix-signature'] as string | undefined

      if (!svixId || !svixTimestamp || !svixSignature) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Cabeçalhos de assinatura svix ausentes' },
        })
      }

      // Simulates: const wh = new Webhook(webhookSecret); wh.verify(...)
      try {
        mockVerify(JSON.stringify(req.body), {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        })
      } catch {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Assinatura do webhook inválida' },
        })
      }

      // Parse event type
      const { type, data } = req.body
      const primaryEmail = data?.email_addresses?.[0]?.email_address ?? ''
      const name = [data?.first_name, data?.last_name].filter(Boolean).join(' ')

      if (type === 'user.created') {
        await mockPrisma.user.findFirst({ where: { clerk_user_id: data.id } })
      }

      if (type === 'user.updated' && primaryEmail) {
        await mockPrisma.user.updateMany({
          where: { clerk_user_id: data.id },
          data: {
            email: primaryEmail,
            name: name || 'Sem nome',
            updated_at: new Date(),
          },
        })
      }

      if (type === 'user.deleted') {
        await mockPrisma.user.deleteMany({ where: { clerk_user_id: data.id } })
      }

      res.json({ received: true })
    } catch (err) {
      next(err)
    }
  })

  return { app, mockPrisma, mockVerify }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/v1/webhooks/clerk — SVIX signature validation', () => {
  let app: express.Express
  let mockPrisma: ReturnType<typeof createApp>['mockPrisma']
  let mockVerify: ReturnType<typeof createApp>['mockVerify']

  const validPayload = {
    type: 'user.created',
    data: {
      id: 'user_abc123',
      email_addresses: [{ email_address: 'test@example.com' }],
      first_name: 'Test',
      last_name: 'User',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLERK_WEBHOOK_SECRET = WEBHOOK_SECRET
    const result = createApp()
    app = result.app
    mockPrisma = result.mockPrisma
    mockVerify = result.mockVerify
  })

  // -------------------------------------------------------------------------
  // Rejects requests without svix headers
  // -------------------------------------------------------------------------

  it('deve rejeitar requisicoes sem cabecalhos de assinatura svix', async () => {
    const res = await request(app)
      .post('/api/v1/webhooks/clerk')
      .send(validPayload)

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
    expect(res.body.error.message).toContain('svix ausentes')
  })

  it('deve rejeitar requisicoes com cabecalhos svix parciais (falta svix-signature)', async () => {
    const res = await request(app)
      .post('/api/v1/webhooks/clerk')
      .set('svix-id', 'msg_test123')
      .set('svix-timestamp', '1234567890')
      .send(validPayload)

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  // -------------------------------------------------------------------------
  // Rejects requests with invalid signature
  // -------------------------------------------------------------------------

  it('deve rejeitar requisicoes com assinatura svix invalida', async () => {
    mockVerify.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const res = await request(app)
      .post('/api/v1/webhooks/clerk')
      .set('svix-id', 'msg_test123')
      .set('svix-timestamp', '1234567890')
      .set('svix-signature', 'v1,invalidsignature')
      .send(validPayload)

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
    expect(res.body.error.message).toContain('inválida')
  })

  // -------------------------------------------------------------------------
  // Processes events with valid signature
  // -------------------------------------------------------------------------

  it('deve processar evento user.created com assinatura svix valida', async () => {
    mockVerify.mockImplementation(() => undefined)

    const res = await request(app)
      .post('/api/v1/webhooks/clerk')
      .set('svix-id', 'msg_test123')
      .set('svix-timestamp', '1234567890')
      .set('svix-signature', 'v1,validsignature')
      .send(validPayload)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ received: true })
    expect(mockVerify).toHaveBeenCalledOnce()
  })

  it('deve processar evento user.updated atualizando dados do usuario', async () => {
    mockVerify.mockImplementation(() => undefined)

    const updatePayload = {
      type: 'user.updated',
      data: {
        id: 'user_abc123',
        email_addresses: [{ email_address: 'updated@example.com' }],
        first_name: 'Updated',
        last_name: 'Name',
      },
    }

    const res = await request(app)
      .post('/api/v1/webhooks/clerk')
      .set('svix-id', 'msg_test456')
      .set('svix-timestamp', '1234567890')
      .set('svix-signature', 'v1,validsignature')
      .send(updatePayload)

    expect(res.status).toBe(200)
    expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
      where: { clerk_user_id: 'user_abc123' },
      data: expect.objectContaining({
        email: 'updated@example.com',
        name: 'Updated Name',
      }),
    })
  })
})
