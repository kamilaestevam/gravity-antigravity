// TST-CROSS-TENANT-NOTIF-001 — Isolamento de tenant no serviço notificacoes
//
// Valida que nenhum usuário consegue ler, modificar ou criar notificações
// fora do seu próprio tenant. Cobre os 3 vetores de ataque:
//   A) Leitura cross-tenant (GET /)
//   B) Modificação cross-tenant (PUT /:id/read, DELETE /:id)
//   C) Criação com tenant_id forçado (POST /, POST /send)
//   D) Bypass de autenticação (sem auth → 401, não dados vazados)

/// <reference types="vitest/globals" />
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

// ── Mocks centralizados ───────────────────────────────────────────────────────
const { mockFindMany, mockCount, mockCreate, mockCreateMany, mockUpdateMany, mockDeleteMany } =
  vi.hoisted(() => ({
    mockFindMany:   vi.fn().mockResolvedValue([]),
    mockCount:      vi.fn().mockResolvedValue(0),
    mockCreate:     vi.fn().mockResolvedValue({ id: 'notif-001' }),
    mockCreateMany: vi.fn().mockResolvedValue({ count: 1 }),
    mockUpdateMany: vi.fn().mockResolvedValue({ count: 1 }),
    mockDeleteMany: vi.fn().mockResolvedValue({ count: 1 }),
  }))

vi.mock(
  '../../../servicos-global/tenant/notificacoes/server/lib/prisma.js',
  () => ({
    prisma: {
      notification: {
        findMany:   mockFindMany,
        count:      mockCount,
        create:     mockCreate,
        createMany: mockCreateMany,
        updateMany: mockUpdateMany,
        deleteMany: mockDeleteMany,
      },
    },
  })
)

vi.mock(
  '../../../servicos-global/tenant/notificacoes/server/queue/pg-boss.js',
  () => ({ getBoss: () => ({ send: vi.fn().mockResolvedValue('job-id') }) })
)

import { apiRoutes }      from '../../../servicos-global/tenant/notificacoes/server/routes/api.js'
import { internalRoutes } from '../../../servicos-global/tenant/notificacoes/server/routes/internal.js'
import { errorHandler }   from '../../../servicos-global/tenant/notificacoes/server/middleware/error-handler.js'

// ── Tenants de teste ──────────────────────────────────────────────────────────
const TENANT_A = 'tenant-alpha-001'
const TENANT_B = 'tenant-beta-002'
const USER_A1  = 'user-alpha-001'
const USER_B1  = 'user-beta-001'
// ID de notificação que pertence ao Tenant B no "banco real"
const NOTIF_B1_ID = 'notif-tenant-b-0001'

// ── Builders de app ───────────────────────────────────────────────────────────
function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/notificacoes', apiRoutes)
  app.use(errorHandler)
  return app
}

// App isolado para rota internal — simula acesso direto sem passar por apiRoutes
// (em produção, o proxy valida x-internal-key e repassa ao serviço diretamente)
function buildInternalApp() {
  const app = express()
  app.use(express.json())
  app.use('/', internalRoutes)
  app.use(errorHandler)
  return app
}

// Headers de autenticação S2S para um tenant específico
function headersFor(tenantId: string, userId: string) {
  return {
    'x-internal-validated': '1',
    'x-tenant-id': tenantId,
    'x-user-id': userId,
  }
}

// ─────────────────────────────────────────────────────────────────────────────

describe('notificacoes — isolamento cross-tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.INTERNAL_API_KEY = 'test-internal-key'
  })

  // ══════════════════════════════════════════════════════════════════════════
  // A — Leitura cross-tenant
  // ══════════════════════════════════════════════════════════════════════════
  describe('A — Leitura: GET / nunca mistura dados de tenants diferentes', () => {
    it('Tenant A só consulta notificações do Tenant A — tenant_id nunca é Tenant B', async () => {
      mockFindMany.mockResolvedValueOnce([{ id: 'notif-a-001', tenant_id: TENANT_A }])
      mockCount.mockResolvedValueOnce(1)
      const app = buildApp()

      await request(app)
        .get('/api/v1/notificacoes')
        .set(headersFor(TENANT_A, USER_A1))

      // Garantia: prisma sempre filtrou pelo tenant correto
      const whereClause = mockFindMany.mock.calls[0][0].where as { tenant_id: string }
      expect(whereClause.tenant_id).toBe(TENANT_A)
      expect(whereClause.tenant_id).not.toBe(TENANT_B)
    })

    it('Tenant B recebe sua própria query independente — tenant_id nunca vaza entre requests', async () => {
      mockFindMany.mockResolvedValue([])
      mockCount.mockResolvedValue(0)
      const app = buildApp()

      await request(app)
        .get('/api/v1/notificacoes')
        .set(headersFor(TENANT_A, USER_A1))

      await request(app)
        .get('/api/v1/notificacoes')
        .set(headersFor(TENANT_B, USER_B1))

      // Cada request deve ter invocado findMany com seu próprio tenant_id
      expect(mockFindMany.mock.calls).toHaveLength(2)
      const whereA = mockFindMany.mock.calls[0][0].where as { tenant_id: string }
      const whereB = mockFindMany.mock.calls[1][0].where as { tenant_id: string }
      expect(whereA.tenant_id).toBe(TENANT_A)
      expect(whereB.tenant_id).toBe(TENANT_B)
    })

    it('request sem auth → 401, findMany NUNCA chamado', async () => {
      const app = buildApp()
      const res = await request(app).get('/api/v1/notificacoes')

      expect(res.status).toBe(401)
      expect(mockFindMany).not.toHaveBeenCalled()
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // B — Modificação cross-tenant
  // ══════════════════════════════════════════════════════════════════════════
  describe('B — Modificação: Tenant A não pode alterar notificações do Tenant B', () => {
    it('PUT /:id_notificacao/marcar-lida com ID do Tenant B → 404 (where filtra por tenant_A, count = 0)', async () => {
      // Simula que o ID existe, mas não pertence ao TENANT_A
      mockUpdateMany.mockResolvedValueOnce({ count: 0 })
      const app = buildApp()

      const res = await request(app)
        .put(`/api/v1/notificacoes/${NOTIF_B1_ID}/marcar-lida`)
        .set(headersFor(TENANT_A, USER_A1))

      expect(res.status).toBe(404)
      // Confirma que o where usou tenant_A — a query foi segura, só não encontrou nada
      const whereClause = mockUpdateMany.mock.calls[0][0].where as {
        id: string; tenant_id: string; user_id: string
      }
      expect(whereClause.id).toBe(NOTIF_B1_ID)
      expect(whereClause.tenant_id).toBe(TENANT_A)
      expect(whereClause.tenant_id).not.toBe(TENANT_B)
    })

    it('DELETE /:id com ID do Tenant B → 404 (where filtra por tenant_A, count = 0)', async () => {
      mockDeleteMany.mockResolvedValueOnce({ count: 0 })
      const app = buildApp()

      const res = await request(app)
        .delete(`/api/v1/notificacoes/${NOTIF_B1_ID}`)
        .set(headersFor(TENANT_A, USER_A1))

      expect(res.status).toBe(404)
      const whereClause = mockDeleteMany.mock.calls[0][0].where as {
        id: string; tenant_id: string; user_id: string
      }
      expect(whereClause.id).toBe(NOTIF_B1_ID)
      expect(whereClause.tenant_id).toBe(TENANT_A)
    })

    it('PUT read sem auth → 401, updateMany nunca chamado', async () => {
      const app = buildApp()
      const res = await request(app).put(`/api/v1/notificacoes/${NOTIF_B1_ID}/marcar-lida`)

      expect(res.status).toBe(401)
      expect(mockUpdateMany).not.toHaveBeenCalled()
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // C — Criação: tenant_id vem sempre da auth, nunca do body
  // ══════════════════════════════════════════════════════════════════════════
  describe('C — Criação: tenant_id sempre injetado da autenticação', () => {
    it('POST /: notificação criada com tenant_A mesmo que body não mencione tenant_id', async () => {
      const app = buildApp()

      await request(app)
        .post('/api/v1/notificacoes')
        .set(headersFor(TENANT_A, USER_A1))
        .set('Content-Type', 'application/json')
        .send({ type: 'aviso', message: 'Teste de isolamento de criação.' })

      const dataArg = mockCreate.mock.calls[0][0].data as { tenant_id: string; user_id: string }
      expect(dataArg.tenant_id).toBe(TENANT_A)
      expect(dataArg.user_id).toBe(USER_A1)
    })

    it('POST /enviar: notificações criadas com tenant_A, não com tenant_B', async () => {
      mockCreateMany.mockResolvedValueOnce({ count: 1 })
      const app = buildApp()

      await request(app)
        .post('/api/v1/notificacoes/enviar')
        .set(headersFor(TENANT_A, USER_A1))
        .set('Content-Type', 'application/json')
        .send({
          user_ids:    [USER_B1],
          message:     'Mensagem cross-tenant legítima (remetente A, destinatário B — usuários no mesmo workspace).',
          sender_name: 'Alice',
        })

      const dataArray = mockCreateMany.mock.calls[0][0].data as Array<{ tenant_id: string }>
      // Todas as notificações devem ter o tenant_id do REMETENTE (autenticado)
      for (const item of dataArray) {
        expect(item.tenant_id).toBe(TENANT_A)
      }
    })

    it('POST / sem auth → 401, create nunca chamado', async () => {
      const app = buildApp()
      const res = await request(app)
        .post('/api/v1/notificacoes')
        .set('Content-Type', 'application/json')
        .send({ type: 'aviso', message: 'Tentativa sem auth.' })

      expect(res.status).toBe(401)
      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // D — Rota interna: x-internal-key obrigatória
  // ══════════════════════════════════════════════════════════════════════════
  describe('D — Rota interna: acesso bloqueado sem x-internal-key válida', () => {
    const validInternalBody = {
      tenant_id: TENANT_A,
      user_ids:  [USER_A1],
      type:      'sistema',
      title:     'Alerta de sistema',
      message:   'Teste de segurança da rota interna.',
    }

    it('POST / sem x-internal-key → 403, createMany nunca chamado', async () => {
      const app = buildInternalApp()

      const res = await request(app)
        .post('/')
        .set('Content-Type', 'application/json')
        .send(validInternalBody)

      expect(res.status).toBe(403)
      expect(mockCreateMany).not.toHaveBeenCalled()
    })

    it('POST / com x-internal-key errada → 403', async () => {
      const app = buildInternalApp()

      const res = await request(app)
        .post('/')
        .set('Content-Type', 'application/json')
        .set('x-internal-key', 'chave-errada-intruso')
        .send(validInternalBody)

      expect(res.status).toBe(403)
      expect(mockCreateMany).not.toHaveBeenCalled()
    })

    it('POST / com chave válida → 201, tenant_id do body é honrado', async () => {
      mockCreateMany.mockResolvedValueOnce({ count: 1 })
      const app = buildInternalApp()

      const res = await request(app)
        .post('/')
        .set('Content-Type', 'application/json')
        .set('x-internal-key', 'test-internal-key')
        .send(validInternalBody)

      expect(res.status).toBe(201)
      const dataArray = mockCreateMany.mock.calls[0][0].data as Array<{ tenant_id: string }>
      expect(dataArray[0].tenant_id).toBe(TENANT_A)
    })

    it('POST / sem INTERNAL_API_KEY configurada → 403 fail-safe', async () => {
      const original = process.env.INTERNAL_API_KEY
      process.env.INTERNAL_API_KEY = ''
      const app = buildInternalApp()

      const res = await request(app)
        .post('/')
        .set('Content-Type', 'application/json')
        .set('x-internal-key', 'qualquer-chave')
        .send(validInternalBody)

      expect(res.status).toBe(403)
      expect(mockCreateMany).not.toHaveBeenCalled()
      process.env.INTERNAL_API_KEY = original
    })
  })
})
