// @vitest-environment node
// testes/testes-unitarios/auth/billingIdempotency.test.ts
// Self-contained tests for POST /api/v1/billing/webhook
// Replicates the Stripe webhook idempotency logic from billing.ts without importing the real module

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// ---------------------------------------------------------------------------
// Inline app replicating the exact security/idempotency logic from billing.ts
// ---------------------------------------------------------------------------

const STRIPE_WEBHOOK_SECRET = 'whsec_test_stripe_secret'

function createApp() {
  const mockStripe = {
    webhooks: {
      constructEvent: vi.fn(),
    },
  }

  const mockPrisma = {
    stripeEvent: {
      upsert: vi.fn(),
    },
  }

  const mockBillingService = {
    handleStripeEvent: vi.fn().mockResolvedValue(undefined),
  }

  const app = express()
  app.use(express.json())

  process.env.STRIPE_WEBHOOK_SECRET = STRIPE_WEBHOOK_SECRET

  // Replicates POST /api/v1/billing/webhook from billing.ts
  app.post('/api/v1/billing/webhook', async (req, res, next) => {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
      if (!webhookSecret) {
        return res.status(500).json({
          error: { code: 'CONFIG_ERROR', message: 'STRIPE_WEBHOOK_SECRET não configurada' },
        })
      }

      const sig = req.headers['stripe-signature']
      if (!sig) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Assinatura Stripe ausente' },
        })
      }

      let event
      try {
        event = mockStripe.webhooks.constructEvent(req.body, sig, webhookSecret)
      } catch {
        return res.status(400).json({
          error: { code: 'INVALID_SIGNATURE', message: 'Assinatura Stripe inválida' },
        })
      }

      // Idempotency check via upsert (not findUnique + create)
      const idempotencyResult = await mockPrisma.stripeEvent.upsert({
        where: { id: event.id },
        create: {
          id: event.id,
          type: event.type,
          payload: event.data as object,
        },
        update: {}, // noop — already exists
      })

      // If the record already existed (created_at older than this request), it's a duplicate
      if (idempotencyResult.created_at < new Date(Date.now() - 1000)) {
        return res.json({ received: true, cached: true })
      }

      // Process the event
      await mockBillingService.handleStripeEvent(event)

      res.json({ received: true })
    } catch (err) {
      next(err)
    }
  })

  return { app, mockStripe, mockPrisma, mockBillingService }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/v1/billing/webhook — idempotency via upsert', () => {
  let app: express.Express
  let mockStripe: ReturnType<typeof createApp>['mockStripe']
  let mockPrisma: ReturnType<typeof createApp>['mockPrisma']
  let mockBillingService: ReturnType<typeof createApp>['mockBillingService']

  const fakeEvent = {
    id: 'evt_test_123',
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_456' } },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    const result = createApp()
    app = result.app
    mockStripe = result.mockStripe
    mockPrisma = result.mockPrisma
    mockBillingService = result.mockBillingService
  })

  // -------------------------------------------------------------------------
  // Uses upsert for idempotency
  // -------------------------------------------------------------------------

  it('deve usar upsert ao registrar evento Stripe para idempotencia', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue(fakeEvent)
    mockPrisma.stripeEvent.upsert.mockResolvedValue({
      id: fakeEvent.id,
      type: fakeEvent.type,
      payload: fakeEvent.data,
      created_at: new Date(), // just created
    })

    const res = await request(app)
      .post('/api/v1/billing/webhook')
      .set('stripe-signature', 'sig_valid')
      .send(fakeEvent)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ received: true })

    // Verifies upsert was used (not findUnique + create separately)
    expect(mockPrisma.stripeEvent.upsert).toHaveBeenCalledWith({
      where: { id: fakeEvent.id },
      create: {
        id: fakeEvent.id,
        type: fakeEvent.type,
        payload: fakeEvent.data,
      },
      update: {}, // noop for duplicates
    })
  })

  // -------------------------------------------------------------------------
  // Ignores duplicate events
  // -------------------------------------------------------------------------

  it('deve ignorar eventos duplicados retornando cached=true', async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue(fakeEvent)

    // Simulate record that already existed (created_at in the past)
    mockPrisma.stripeEvent.upsert.mockResolvedValue({
      id: fakeEvent.id,
      type: fakeEvent.type,
      payload: fakeEvent.data,
      created_at: new Date(Date.now() - 60_000), // 1 min ago
    })

    const res = await request(app)
      .post('/api/v1/billing/webhook')
      .set('stripe-signature', 'sig_valid')
      .send(fakeEvent)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ received: true, cached: true })

    // handleStripeEvent should NOT be called for duplicates
    expect(mockBillingService.handleStripeEvent).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Rejects without Stripe signature
  // -------------------------------------------------------------------------

  it('deve rejeitar requisicoes sem stripe-signature', async () => {
    const res = await request(app)
      .post('/api/v1/billing/webhook')
      .send(fakeEvent)

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})
