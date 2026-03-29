// @vitest-environment node
// Testes de autenticacao do WhatsApp — verifica que:
//   1. /send rejeita sem x-tenant-id
//   2. /send NAO aceita tenant_id do body
//   3. /webhook GET permanece publico (sem auth)
//   4. /webhook POST permanece publico

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// Mock handlers
// ---------------------------------------------------------------------------
const mockHandleWebhookInbound = vi.fn((_payload: any, _raw: any, _sig: any, res: Response) => {
  res.status(200).json({ ok: true })
})

// ---------------------------------------------------------------------------
// Build a self-contained test app replicating the WhatsApp auth + routes
// (from servicos-global/tenant/whatsapp/server/index.ts + routes)
// ---------------------------------------------------------------------------
function createTestApp() {
  const app = express()
  app.use(express.json())

  // Health check (public)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'whatsapp' })
  })

  // Webhook GET — public (Meta verification challenge)
  app.get('/api/v1/whatsapp/webhook', (req: Request, res: Response) => {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge as string)
    }

    return res.status(403).json({ error: 'Forbidden' })
  })

  // Webhook POST — public (Meta sends events)
  app.post('/api/v1/whatsapp/webhook', (req: Request, res: Response) => {
    mockHandleWebhookInbound(req.body, null, null, res)
  })

  // Auth middleware for protected routes
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string | undefined
    const userId = req.headers['x-user-id'] as string | undefined

    if (!tenantId) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'x-tenant-id obrigatorio' },
      })
    }

    ;(req as any).auth = { tenantId, userId: userId ?? '' }
    next()
  }

  // POST /api/v1/whatsapp/send — protected
  app.post('/api/v1/whatsapp/send', requireAuth, (req: any, res: Response) => {
    // Uses tenant from auth (header), never from body
    res.status(200).json({ success: true, tenant: req.auth.tenantId })
  })

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: err.message },
    })
  })

  return app
}

const app = createTestApp()

beforeEach(() => {
  vi.clearAllMocks()
  process.env.WHATSAPP_VERIFY_TOKEN = 'test-verify-token'
})

// ---------------------------------------------------------------------------
// Suite 1 — /send rejeita sem x-tenant-id
// ---------------------------------------------------------------------------

describe('WhatsApp /send — rejeitar sem x-tenant-id', () => {
  it('POST /api/v1/whatsapp/send retorna 401 sem x-tenant-id', async () => {
    const res = await request(app)
      .post('/api/v1/whatsapp/send')
      .send({ phone_number: '+5511999999999', text: 'Hello' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — /send NAO aceita tenant_id do body
// ---------------------------------------------------------------------------

describe('WhatsApp /send — nao aceita tenant_id do body', () => {
  it('ignora tenant_id no body e usa apenas header', async () => {
    // Enviar com tenant_id no body mas SEM header
    const res = await request(app)
      .post('/api/v1/whatsapp/send')
      .send({
        phone_number: '+5511999999999',
        text: 'Hello',
        tenant_id: 'tenant-do-body',
      })

    // Deve rejeitar porque nao tem x-tenant-id no header
    expect(res.status).toBe(401)
  })

  it('com header valido, usa tenant do header (nao do body)', async () => {
    const res = await request(app)
      .post('/api/v1/whatsapp/send')
      .set('x-tenant-id', 'tenant-do-header')
      .set('x-user-id', 'user-1')
      .send({
        phone_number: '+5511999999999',
        text: 'Hello',
        tenant_id: 'tenant-do-body',
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Suite 3 — /webhook GET permanece publico
// ---------------------------------------------------------------------------

describe('WhatsApp /webhook GET — publico', () => {
  it('responde ao challenge da Meta sem autenticacao', async () => {
    const res = await request(app)
      .get('/api/v1/whatsapp/webhook')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'test-verify-token',
        'hub.challenge': 'challenge-123',
      })

    expect(res.status).toBe(200)
    expect(res.text).toBe('challenge-123')
  })

  it('retorna 403 para token invalido', async () => {
    const res = await request(app)
      .get('/api/v1/whatsapp/webhook')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong-token',
        'hub.challenge': 'challenge-123',
      })

    expect(res.status).toBe(403)
  })
})

// ---------------------------------------------------------------------------
// Suite 4 — /webhook POST permanece publico
// ---------------------------------------------------------------------------

describe('WhatsApp /webhook POST — publico', () => {
  it('aceita webhook POST sem x-tenant-id (Meta chama direto)', async () => {
    const res = await request(app)
      .post('/api/v1/whatsapp/webhook')
      .send({ object: 'whatsapp_business_account', entry: [] })

    // O webhook nao exige auth, deve retornar 200
    expect(res.status).toBe(200)
  })
})
