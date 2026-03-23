// @vitest-environment node
// Testes funcionais das rotas do serviço de Atividades (CRM).
// Agente Atividades — Onda 3

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../../servicos-global/tenant/atividades/server/index.js'
import { prisma } from '../../../servicos-global/tenant/atividades/server/lib/prisma.js'

vi.mock('../../../servicos-global/tenant/atividades/server/lib/prisma.js', () => ({
  prisma: {
    company: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    contact: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    activity: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

const authHeaders = {
  'x-tenant-id': 'tenant-test-crm',
  'x-user-id': 'user-test-crm',
}

describe('Testes Funcionais — Serviço de Atividades (CRM)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /health', () => {
    it('retorna status 200', async () => {
      vi.mocked(prisma.company.count).mockResolvedValue(1)
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
    })
  })

  describe('Empresas (Companies)', () => {
    it('GET /api/v1/crm/companies retorna lista paginada', async () => {
      vi.mocked(prisma.company.findMany).mockResolvedValue([
        { id: 'comp-1', tenant_id: 't-1', name: 'Empresa Teste', document: '123' } as any
      ])
      vi.mocked(prisma.company.count).mockResolvedValue(1)

      const res = await request(app).get('/api/v1/crm/companies').set(authHeaders)
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].name).toBe('Empresa Teste')
    })

    it('POST /api/v1/crm/companies falha sem nome', async () => {
      const res = await request(app)
        .post('/api/v1/crm/companies')
        .set(authHeaders)
        .send({ document: '123456789' })

      expect(res.status).toBe(422) // Zod validation
    })

    it('POST /api/v1/crm/companies cria com sucesso', async () => {
      vi.mocked(prisma.company.create).mockResolvedValue({
        id: 'comp-novo', tenant_id: 't-1', name: 'Nova Empresa'
      } as any)

      const res = await request(app)
        .post('/api/v1/crm/companies')
        .set(authHeaders)
        .send({ name: 'Nova Empresa' })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBe('comp-novo')
    })
  })

  describe('Contatos (Contacts)', () => {
    it('GET /api/v1/crm/contacts retorna com sucesso', async () => {
      vi.mocked(prisma.contact.findMany).mockResolvedValue([])
      vi.mocked(prisma.contact.count).mockResolvedValue(0)

      const res = await request(app).get('/api/v1/crm/contacts').set(authHeaders)
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual([])
    })
  })

  describe('Atividades (Activities)', () => {
    it('GET /api/v1/crm/activities retorna com sucesso', async () => {
      vi.mocked(prisma.activity.findMany).mockResolvedValue([])

      const res = await request(app).get('/api/v1/crm/activities').set(authHeaders)
      expect(res.status).toBe(200)
    })
  })
})

it('Functional tests for Atividades pending', () => { expect(true).toBe(true) })
