// @vitest-environment node
// testes/testes-funcionais/servicos-tenant/email.test.ts
// Testes funcionais das rotas do serviço de Email.
// Agente Email — Onda 3

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../../servicos-global/tenant/email/server/index.js'
// Mock dependencies that would otherwise cause real requests or DB connection issues
import { prisma } from '../../../servicos-global/tenant/email/server/lib/prisma.js'

// Mocks das dependências externas
vi.mock('../../../servicos-global/tenant/email/server/lib/prisma.js', () => ({
  prisma: {
    emailLog: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    template: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb({ prisma: { emailLog: { create: vi.fn() } } })),
  },
}))

vi.mock('../../../servicos-global/tenant/email/server/services/resend.js', () => ({
  sendEmailViaResend: vi.fn().mockResolvedValue('resend-id-123'),
}))

process.env.INTERNAL_API_KEY = 'test-internal-api-key'

const authHeaders = {
  'x-tenant-id': 'tenant-test-email',
  'x-user-id': 'user-test-email',
  'x-internal-key': 'test-internal-api-key',
}

describe('Testes Funcionais — Serviço de Email', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /health', () => {
    it('retorna status 200', async () => {
      vi.mocked(prisma.emailLog.count).mockResolvedValue(1)
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
    })
  })

  describe('Autenticação e Zod de Rotas Protegidas', () => {
    it('retorna 401 sem header x-tenant-id nas rotas de email', async () => {
      const res = await request(app).get('/api/v1/email/templates')
      expect(res.status).toBe(401)
    })

    it('POST /api/v1/email/enviar retorna 422 sem payload válido', async () => {
      const res = await request(app)
        .post('/api/v1/email/enviar')
        .set(authHeaders)
        .send({})
      expect(res.status).toBe(422)
    })
  })

  describe('Fluxo de Templates GET', () => {
    it('GET /api/v1/email/templates retorna lista', async () => {
      vi.mocked(prisma.template.findMany).mockResolvedValue([
        { id: 'tpl-1', tenant_id: 't1', nome: 'Oi', slug: 'oi', assunto: 'Oi', corpo_html: '<p>Oi</p>', ativo: true } as any
      ])

      const res = await request(app)
        .get('/api/v1/email/templates')
        .set(authHeaders)
      
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
    })
  })

  describe('Fluxo de Templates', () => {
    it('POST /api/v1/email/templates cria um template com sucesso', async () => {
      vi.mocked(prisma.template.create).mockResolvedValue({
        id: 'tpl-1',
        nome: 'Welcome',
        slug: 'welcome',
        assunto: 'Welcome to our platform',
        corpo_html: '<p>Hi</p>',
      } as any)

      const res = await request(app)
        .post('/api/v1/email/templates')
        .set(authHeaders)
        .send({
          nome: 'Welcome',
          slug: 'welcome',
          assunto: 'Welcome to our platform',
          corpo_html: '<p>Hi</p>',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.nome).toBe('Welcome')
    })
  })
})
