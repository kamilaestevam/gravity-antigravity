// @vitest-environment node
/**
 * Testes unitários — POST /api/v1/whatsapp/send
 *
 * Tipo de módulo: Rota Express (outbound WhatsApp via Meta Cloud API)
 * Cobertura: handler da rota /send, validação Zod, autenticação tenant
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ────────────────────────────────────────────────────────────────────

const { mockSendTextMessage } = vi.hoisted(() => ({
  mockSendTextMessage: vi.fn(),
}))

vi.mock('../../../servicos-global/servicos-plataforma/whatsapp/server/services/whatsapp.js', () => ({
  sendTextMessage: mockSendTextMessage,
  normalizePhoneForSend: vi.fn((p: string) => p),
}))

vi.mock('../../../servicos-global/servicos-plataforma/whatsapp/server/services/webhook.js', () => ({
  handleWebhookInbound: vi.fn(),
}))

vi.mock('../../../servicos-global/servicos-plataforma/whatsapp/server/services/sse.js', () => ({
  sseStreamHandlers: { addClient: vi.fn() },
}))

vi.mock('../../../servicos-global/servicos-plataforma/whatsapp/server/errorHandler.js', () => ({
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode: number, code: string) {
      super(message)
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

// ── Setup ────────────────────────────────────────────────────────────────────

import express from 'express'
import request from 'supertest'

let app: express.Express

beforeEach(async () => {
  vi.clearAllMocks()

  process.env.WHATSAPP_VERIFY_TOKEN = 'test-verify'

  const { whatsappRoutes } = await import(
    '../../../servicos-global/servicos-plataforma/whatsapp/server/routes.js'
  )

  app = express()
  app.use(express.json())
  app.use('/api/v1/whatsapp', whatsappRoutes)

  // Error handler para capturar Zod errors
  app.use((err: Error & { issues?: unknown[] }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if ('issues' in err) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message } })
      return
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } })
  })
})

afterEach(() => {
  delete process.env.WHATSAPP_VERIFY_TOKEN
})

// ── Testes ────────────────────────────────────────────────────────────────────

describe('POST /api/v1/whatsapp/send', () => {
  it('retorna 401 sem header x-id-organizacao', async () => {
    const res = await request(app)
      .post('/api/v1/whatsapp/send')
      .send({ phone_number: '5548999990000', text: 'Teste' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('retorna 400 com body inválido (sem phone_number)', async () => {
    const res = await request(app)
      .post('/api/v1/whatsapp/send')
      .set('x-id-organizacao', 'org-test')
      .send({ text: 'Teste' })

    expect(res.status).toBe(400)
  })

  it('retorna 400 com body inválido (text vazio)', async () => {
    const res = await request(app)
      .post('/api/v1/whatsapp/send')
      .set('x-id-organizacao', 'org-test')
      .send({ phone_number: '5548999990000', text: '' })

    expect(res.status).toBe(400)
  })

  it('chama sendTextMessage com tenant, phone e text corretos em request válida', async () => {
    mockSendTextMessage.mockResolvedValue({ messageId: 'wamid.abc123' })

    const res = await request(app)
      .post('/api/v1/whatsapp/send')
      .set('x-id-organizacao', 'org-test')
      .send({ phone_number: '5548999990000', text: 'Sync NCM concluído' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message.messageId).toBe('wamid.abc123')

    expect(mockSendTextMessage).toHaveBeenCalledWith('org-test', '5548999990000', 'Sync NCM concluído')
  })

  it('propaga erro de sendTextMessage como 500', async () => {
    mockSendTextMessage.mockRejectedValue(new Error('Meta API timeout'))

    const res = await request(app)
      .post('/api/v1/whatsapp/send')
      .set('x-id-organizacao', 'org-test')
      .send({ phone_number: '5548999990000', text: 'Teste' })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
  })

  it('aceita campos opcionais product_id e user_id sem erro', async () => {
    mockSendTextMessage.mockResolvedValue({ messageId: 'wamid.def456' })

    const res = await request(app)
      .post('/api/v1/whatsapp/send')
      .set('x-id-organizacao', 'org-test')
      .send({
        phone_number: '5548999990000',
        text: 'Teste com opcionais',
        product_id: 'prod-001',
        user_id: 'user-001',
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
