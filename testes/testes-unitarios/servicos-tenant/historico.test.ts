import { describe, it, expect, vi, beforeEach } from 'vitest'
import { historicoRouter } from '../../../servicos-global/tenant/historico/server/routes.js'
import { auditMiddleware, computeLogHash } from '../../../servicos-global/tenant/historico/server/middleware/audit.js'
import express from 'express'
import request from 'supertest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    logAlteracao: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      groupBy: vi.fn()
    }
  }
}))

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => prismaMock)
}))

describe('Histórico Service - Unit Tests', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    app = express()
    app.use(express.json())
    
    // Auth mock
    app.use((req, res, next) => {
      ;(req as any).auth = { tenantId: 'tenant-123', userId: 'user-123', userName: 'Test User' }
      next()
    })
    app.use('/api/v1/historico', historicoRouter)
  })

  describe('auditMiddleware', () => {
    it('deve usar o ator correto e registrar o log no banco', async () => {
      const mockRoute = express.Router()
      mockRoute.post(
        '/action',
        auditMiddleware('CRIACAO', 'empresa', 'Empresa'),
        (req, res) => { res.json({ id: 'emp-123', name: 'Nova Empresa' }) }
      )
      
      const testApp = express()
      testApp.use(express.json())
      testApp.use((req, res, next) => {
        ;(req as any).auth = { tenantId: 'tenant-1', userId: 'usr-1', userName: 'User 1' }
        next()
      })
      testApp.use('/test', mockRoute)

      await request(testApp).post('/test/action').send({ name: 'Nova Empresa' })
      
      // Espera setImmediate pra processar o log assincrono
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(prismaMock.logAlteracao.create).toHaveBeenCalled()
      const callArg = prismaMock.logAlteracao.create.mock.calls[0][0].data
      
      expect(callArg.action).toBe('CRIACAO')
      expect(callArg.actor_id).toBe('usr-1')
      expect(callArg.entity_id).toBe('emp-123')
      expect(callArg.integrity_hash).toBeDefined()
    })
  })

  describe('GET /api/v1/historico', () => {
    it('deve retornar logs paginados correctly', async () => {
      prismaMock.logAlteracao.findMany.mockResolvedValue([{ id: 'log-1' }])
      prismaMock.logAlteracao.count.mockResolvedValue(1)

      const response = await request(app).get('/api/v1/historico?tenant_id=tenant-123&limit=10')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.meta.total).toBe(1)
      expect(prismaMock.logAlteracao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenant_id: 'tenant-123' },
          take: 10
        })
      )
    })

    it('deve validar tenant_id obrigatório', async () => {
      // Remover middleware de auth para forçar erro de tenant_id fallback
      const appNoAuth = express()
      appNoAuth.use('/api/v1/historico', historicoRouter)
      
      const response = await request(appNoAuth).get('/api/v1/historico')
      expect(response.status).toBe(422) // Generic error mapped to 422 via internal catch or validation
    })
  })

  describe('computeLogHash', () => {
    it('deve gerar um hash sha256 consistente', () => {
      const log1 = {
        tenant_id: 't1', actor_id: 'u1', actor_type: 'user', action: 'CREATE', entity_id: 'e1', description: 'desc', diff: null, created_at: new Date('2024-01-01T00:00:00Z')
      }
      const hash1 = computeLogHash(log1)
      const hash2 = computeLogHash(log1)
      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64)
    })
  })
})
