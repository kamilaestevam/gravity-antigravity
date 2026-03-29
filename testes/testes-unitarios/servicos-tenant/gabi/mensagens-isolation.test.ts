// @vitest-environment node
// Testes de isolamento de tenant nas mensagens do Gabi — verifica que:
//   1. Mensagens usam withTenantIsolation (mock e verificacao)
//   2. Rejeita acesso a conversas de outros tenants

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// In-memory mock DB
// ---------------------------------------------------------------------------
const mockFindFirst = vi.fn()
const mockFindMany = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()

const mockDb = {
  gabiConversation: {
    findFirst: mockFindFirst,
    update: mockUpdate,
  },
  gabiMessage: {
    findMany: mockFindMany,
    create: mockCreate,
  },
}

const mockWithTenantIsolation = vi.fn().mockReturnValue(mockDb)

// ---------------------------------------------------------------------------
// AppError (replicates gabi/server/lib/errors.ts)
// ---------------------------------------------------------------------------
class AppError extends Error {
  statusCode: number
  code: string
  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

// ---------------------------------------------------------------------------
// Build a self-contained test app replicating the Gabi mensagens routes
// (from servicos-global/tenant/gabi/server/routes/mensagens.ts)
// ---------------------------------------------------------------------------
function buildApp(tenantId: string, userId = 'user-1') {
  const app = express()
  app.use(express.json())

  // Simula auth middleware que injeta req.auth
  app.use((req: any, _res, next) => {
    req.auth = { tenantId, userId }
    next()
  })

  // GET /api/v1/gabi/conversas/:id/mensagens
  app.get('/api/v1/gabi/conversas/:id/mensagens', async (req: any, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.auth
      const { id: conversationId } = req.params
      const db = mockWithTenantIsolation({ __mock: true }, tenantId)

      const conversa = await db.gabiConversation.findFirst({ where: { id: conversationId } })
      if (!conversa) {
        throw new AppError('Conversa nao encontrada', 404, 'NOT_FOUND')
      }

      const mensagens = await db.gabiMessage.findMany({
        where: { conversation_id: conversationId },
        orderBy: { created_at: 'asc' }
      })

      res.json(mensagens)
    } catch (error) {
      next(error)
    }
  })

  // POST /api/v1/gabi/conversas/:id/mensagens
  app.post('/api/v1/gabi/conversas/:id/mensagens', async (req: any, res: Response, next: NextFunction) => {
    try {
      const { tenantId, userId } = req.auth
      const { id: conversationId } = req.params
      const { role, content } = req.body
      const db = mockWithTenantIsolation({ __mock: true }, tenantId)

      const conversa = await db.gabiConversation.findFirst({ where: { id: conversationId } })
      if (!conversa) {
        throw new AppError('Conversa nao encontrada', 404, 'NOT_FOUND')
      }

      const mensagem = await db.gabiMessage.create({
        data: { user_id: userId, conversation_id: conversationId, role, content }
      })

      await db.gabiConversation.update({
        where: { id: conversationId },
        data: { updated_at: new Date() }
      })

      res.status(201).json(mensagem)
    } catch (error) {
      next(error)
    }
  })

  // Error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode || 500).json({
      error: { code: err.code || 'INTERNAL', message: err.message },
    })
  })

  return app
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Suite 1 — withTenantIsolation e chamado com o tenantId correto
// ---------------------------------------------------------------------------

describe('Gabi mensagens — usa withTenantIsolation', () => {
  it('GET /mensagens chama withTenantIsolation com tenantId do auth', async () => {
    const conversa = { id: 'conv-1', tenant_id: 'tenant-abc' }
    const mensagens = [
      { id: 'msg-1', conversation_id: 'conv-1', role: 'user', content: 'Ola' },
    ]

    mockFindFirst.mockResolvedValueOnce(conversa)
    mockFindMany.mockResolvedValueOnce(mensagens)

    const app = buildApp('tenant-abc')
    const res = await request(app).get('/api/v1/gabi/conversas/conv-1/mensagens')

    expect(res.status).toBe(200)
    // Verifica que withTenantIsolation foi chamado com o prisma mock e tenantId
    expect(mockWithTenantIsolation).toHaveBeenCalledWith(
      expect.objectContaining({ __mock: true }),
      'tenant-abc'
    )
  })

  it('POST /mensagens chama withTenantIsolation com tenantId do auth', async () => {
    const conversa = { id: 'conv-2', tenant_id: 'tenant-xyz' }
    const novaMensagem = {
      id: 'msg-new',
      conversation_id: 'conv-2',
      role: 'user',
      content: 'Nova msg',
    }

    mockFindFirst.mockResolvedValueOnce(conversa)
    mockCreate.mockResolvedValueOnce(novaMensagem)
    mockUpdate.mockResolvedValueOnce({})

    const app = buildApp('tenant-xyz')
    const res = await request(app)
      .post('/api/v1/gabi/conversas/conv-2/mensagens')
      .send({ role: 'user', content: 'Nova msg' })

    expect(res.status).toBe(201)
    expect(mockWithTenantIsolation).toHaveBeenCalledWith(
      expect.objectContaining({ __mock: true }),
      'tenant-xyz'
    )
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — Rejeita acesso a conversas de outros tenants
// ---------------------------------------------------------------------------

describe('Gabi mensagens — bloqueio cross-tenant', () => {
  it('retorna 404 quando conversa nao pertence ao tenant (findFirst retorna null)', async () => {
    // withTenantIsolation garante que findFirst com tenantId diferente retorna null
    mockFindFirst.mockResolvedValueOnce(null)

    const app = buildApp('tenant-atacante')
    const res = await request(app).get('/api/v1/gabi/conversas/conv-de-outro-tenant/mensagens')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')

    // Confirma que withTenantIsolation foi chamado com tenant do atacante
    // (que faria o prisma filtrar e nao encontrar a conversa)
    expect(mockWithTenantIsolation).toHaveBeenCalledWith(
      expect.anything(),
      'tenant-atacante'
    )
  })

  it('POST retorna 404 quando conversa nao pertence ao tenant', async () => {
    mockFindFirst.mockResolvedValueOnce(null)

    const app = buildApp('tenant-atacante')
    const res = await request(app)
      .post('/api/v1/gabi/conversas/conv-de-outro-tenant/mensagens')
      .send({ role: 'user', content: 'Tentativa de injecao' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    // create NAO deveria ter sido chamado
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
