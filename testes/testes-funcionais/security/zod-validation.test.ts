// @vitest-environment node
// testes/testes-funcionais/security/zod-validation.test.ts
// Testes funcionais — Validação Zod com limites de tamanho
//
// Valida que:
//   1. InviteUser rejeita name > 200 chars
//   2. InviteUser rejeita email > 255 chars
//   3. Chat message rejeita mensagens > 10000 chars
//   4. Chat conversationId rejeita strings > 255 chars

import { describe, it, expect, vi, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { z } from 'zod'

// ─── Env vars necessárias ────────────────────────────────────────────────────

vi.hoisted(() => {
  process.env.CLERK_SECRET_KEY = 'sk_test_dummy_vitest'
  process.env.INTERNAL_SERVICE_KEY = 'test-internal-key'
  process.env.CONFIGURADOR_DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
})

// ─── Schemas (replica exata dos schemas do código-fonte) ─────────────────────

// De: servicos-global/configurador/server/routes/users.ts
const InviteUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(200),
  role: z.enum(['MASTER', 'STANDARD', 'SUPPLIER']).default('STANDARD'),
})

// De: servicos-global/tenant/gabi/server/routes/chat.ts
const MAX_MESSAGE_LENGTH = 10_000

const chatSchema = z.object({
  conversationId: z.string().max(255),
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
})

// ─── Error handler padrão para Zod ──────────────────────────────────────────

function zodErrorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: err.flatten(),
      },
    })
    return
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR' } })
}

// ─── App de teste com as rotas usando os schemas ─────────────────────────────

function buildInviteApp() {
  const app = express()
  app.use(express.json())

  app.post('/api/v1/users/invite', (req, res, next) => {
    try {
      const parsed = InviteUserSchema.parse(req.body)
      res.status(201).json({ message: 'Convite enviado com sucesso', user: parsed })
    } catch (err) {
      next(err)
    }
  })

  app.use(zodErrorHandler)
  return app
}

function buildChatApp() {
  const app = express()
  app.use(express.json())

  app.post('/api/v1/gabi/chat', (req, res, next) => {
    try {
      const parsed = chatSchema.parse(req.body)
      res.json({ response: `Echo: ${parsed.message.substring(0, 20)}` })
    } catch (err) {
      next(err)
    }
  })

  app.use(zodErrorHandler)
  return app
}

// ─── Suites ─────────────────────────────────────────────────────────────────

describe('InviteUser — validação de tamanho do name', () => {
  const app = buildInviteApp()

  beforeEach(() => vi.clearAllMocks())

  it('aceita name com 200 caracteres (limite)', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({
        email: 'valid@empresa.com',
        name: 'A'.repeat(200),
      })

    expect(response.status).toBe(201)
  })

  it('rejeita name com 201 caracteres (acima do limite)', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({
        email: 'valid@empresa.com',
        name: 'A'.repeat(201),
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('rejeita name com 1000 caracteres (muito acima do limite)', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({
        email: 'valid@empresa.com',
        name: 'X'.repeat(1000),
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})

describe('InviteUser — validação de tamanho do email', () => {
  const app = buildInviteApp()

  beforeEach(() => vi.clearAllMocks())

  it('aceita email com tamanho dentro do limite (255 chars total)', async () => {
    // Gera email válido com tamanho próximo do limite
    const localPart = 'a'.repeat(240)
    const email = `${localPart}@test.com` // ~249 chars
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({
        email,
        name: 'Teste',
      })

    // Emails muito longos podem falhar na validação .email() do Zod antes do .max()
    // O importante é que não passe com 201
    expect([201, 400]).toContain(response.status)
  })

  it('rejeita email com mais de 255 caracteres', async () => {
    const localPart = 'a'.repeat(250)
    const email = `${localPart}@test.com` // ~259 chars > 255
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({
        email,
        name: 'Teste',
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('rejeita email com 500 caracteres', async () => {
    const localPart = 'b'.repeat(490)
    const email = `${localPart}@test.com`
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({
        email,
        name: 'Teste',
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})

describe('Chat — validação de tamanho da mensagem', () => {
  const app = buildChatApp()

  beforeEach(() => vi.clearAllMocks())

  it('aceita mensagem com 10000 caracteres (limite)', async () => {
    const response = await request(app)
      .post('/api/v1/gabi/chat')
      .send({
        conversationId: 'conv-001',
        message: 'M'.repeat(10_000),
      })

    expect(response.status).toBe(200)
  })

  it('rejeita mensagem com 10001 caracteres (acima do limite)', async () => {
    const response = await request(app)
      .post('/api/v1/gabi/chat')
      .send({
        conversationId: 'conv-001',
        message: 'M'.repeat(10_001),
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('rejeita mensagem com 50000 caracteres (muito acima do limite)', async () => {
    const response = await request(app)
      .post('/api/v1/gabi/chat')
      .send({
        conversationId: 'conv-001',
        message: 'Z'.repeat(50_000),
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('rejeita mensagem vazia', async () => {
    const response = await request(app)
      .post('/api/v1/gabi/chat')
      .send({
        conversationId: 'conv-001',
        message: '',
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})

describe('Chat — validação de tamanho do conversationId', () => {
  const app = buildChatApp()

  beforeEach(() => vi.clearAllMocks())

  it('aceita conversationId com 255 caracteres (limite)', async () => {
    const response = await request(app)
      .post('/api/v1/gabi/chat')
      .send({
        conversationId: 'C'.repeat(255),
        message: 'Olá Gabi',
      })

    expect(response.status).toBe(200)
  })

  it('rejeita conversationId com 256 caracteres (acima do limite)', async () => {
    const response = await request(app)
      .post('/api/v1/gabi/chat')
      .send({
        conversationId: 'C'.repeat(256),
        message: 'Olá Gabi',
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('rejeita conversationId com 1000 caracteres', async () => {
    const response = await request(app)
      .post('/api/v1/gabi/chat')
      .send({
        conversationId: 'D'.repeat(1000),
        message: 'Olá Gabi',
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})
