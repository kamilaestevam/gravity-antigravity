// @vitest-environment node
// TST-FUN-CONFIG-ATF-001..008 — /api/v1/admin/testes-favoritos
// Persistência por usuário das combinações salvas no modal "Rodar Testes".
// Substitui o localStorage — favoritos seguem o usuário entre dispositivos.
//
// Cobre:
//   • GET → 200 + findMany escopado por id_usuario do autenticado
//   • POST válido → 201 + create recebe id_usuario + campos DDD
//   • POST duplicado (mesma combinação) → 409 FAVORITO_DUPLICADO
//   • POST acima do limite (20) → 409 FAVORITO_LIMITE
//   • POST sem tipos → 400 VALIDATION_ERROR
//   • DELETE existente → 200 + deleteMany escopado por id_usuario (ownership)
//   • DELETE inexistente → 404 NOT_FOUND
//   • PADRAO bloqueado por requireGravityAdmin → 403
//
/// <reference types="vitest/globals" />

import { vi, describe, it, expect, beforeEach } from 'vitest'

const {
  mockFavoritoFindMany,
  mockFavoritoCreate,
  mockFavoritoDeleteMany,
} = vi.hoisted(() => ({
  mockFavoritoFindMany:   vi.fn(),
  mockFavoritoCreate:     vi.fn(),
  mockFavoritoDeleteMany: vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    testeFavoritoUsuario: {
      findMany:   mockFavoritoFindMany,
      create:     mockFavoritoCreate,
      deleteMany: mockFavoritoDeleteMany,
    },
    organizacao: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), create: vi.fn(), count: vi.fn() },
    workspace:   { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    usuario:     { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    testeAgendamento: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = (globalThis as Record<string, unknown>)['__testAuth'] ?? {
      id_usuario:     'usr_default',
      id_organizacao: 'org_default',
      tipo_usuario:   'SUPER_ADMIN',
      nome_usuario:   'Default',
      clerkUserId:    'clerk_default',
    }
    next()
  },
}))

// Mocks de dependências laterais carregadas pelo admin.ts
vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { invitations: { createInvitation: vi.fn() } },
}))
vi.mock('../../../../servicos-global/configurador/server/lib/billing/index.js', () => ({
  getBillingProvider: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/services/organizacao-service.js', () => ({
  proximoSubdominioDisponivel: vi.fn(),
  slugifySubdominio: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/services/deploy-log-service.js', () => ({
  deployLogService: { append: vi.fn(), list: vi.fn() },
}))
vi.mock('../../../../servicos-global/configurador/server/utils/playwright-parser.js', () => ({
  walkSuite: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/lib/gemini-test-analyzer.js', () => ({
  analyzeTestFailure: vi.fn(),
  getMetrics: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/lib/agente-plano-teste.js', () => ({
  generateTestPlan: vi.fn(),
  expandTestPlan: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/lib/gerador-specs.js', () => ({
  generateAndSaveSpec: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/lib/extrator-testids.js', () => ({
  generateTestidMapping: vi.fn(),
}))
vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/services/audit.service.js', () => ({
  AuditService: { log: vi.fn().mockResolvedValue(undefined) },
}))
vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/middleware/audit.js', () => ({
  auditMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}))
vi.mock('../../../../servicos-global/servicos-plataforma/generated/index.js', () => ({
  AcaoExecutadaPor: { USUARIO: 'USUARIO', SISTEMA: 'SISTEMA' },
}))
vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: {
    roleChanged:       vi.fn().mockResolvedValue(undefined),
    permissionChanged: vi.fn().mockResolvedValue(undefined),
  },
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { adminRouter } from '../../../../servicos-global/configurador/server/routes/admin.js'
import { AppError } from '../../../../servicos-global/configurador/server/lib/appError.js'

const app = express()
app.use(express.json())
app.use('/api/v1/admin', adminRouter)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  const e = err as { statusCode?: number; code?: string; message?: string }
  res.status(e.statusCode ?? 500).json({ error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? 'Erro interno' } })
})

type AuthShape = {
  id_usuario: string
  id_organizacao: string
  tipo_usuario: string
  nome_usuario: string
  clerkUserId: string
}
function setAuth(auth: AuthShape) {
  ;(globalThis as Record<string, unknown>)['__testAuth'] = auth
}

const ATOR_SUPER_ADMIN: AuthShape = {
  id_usuario:     'usr_sa',
  id_organizacao: 'org_gravity',
  tipo_usuario:   'SUPER_ADMIN',
  nome_usuario:   'Super Admin',
  clerkUserId:    'clerk_sa',
}
const ATOR_PADRAO: AuthShape = {
  id_usuario:     'usr_pa',
  id_organizacao: 'org_cliente',
  tipo_usuario:   'PADRAO',
  nome_usuario:   'Usuario Padrao',
  clerkUserId:    'clerk_pa',
}

const PAYLOAD_VALIDO = {
  produto_teste_favorito_usuario: 'pedido',
  ambiente_teste_favorito_usuario: 'Producao',
  tipos_teste_favorito_usuario: ['EMT'],
  planos_ids_teste_favorito_usuario: ['TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045'],
  planos_resumo_teste_favorito_usuario: [
    { id: 'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045', titulo: 'Editar e salvar', descricao: 'lista/editar-salvar', tipo: 'EMT' },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  setAuth(ATOR_SUPER_ADMIN)
  mockFavoritoFindMany.mockResolvedValue([])
})

describe('TST-FUN-CONFIG-ATF — /api/v1/admin/testes-favoritos', () => {
  it('1. GET → 200 + findMany escopado por id_usuario', async () => {
    mockFavoritoFindMany.mockResolvedValue([
      {
        id_teste_favorito_usuario: 'cfav1',
        produto_teste_favorito_usuario: 'pedido',
        ambiente_teste_favorito_usuario: 'Producao',
        tipos_teste_favorito_usuario: ['EMT'],
        planos_ids_teste_favorito_usuario: ['TST-EMT-PEDIDO-000045'],
        planos_resumo_teste_favorito_usuario: null,
        data_criacao_teste_favorito_usuario: new Date('2026-06-11T17:00:00Z'),
      },
    ])

    const res = await request(app).get('/api/v1/admin/testes-favoritos')

    expect(res.status).toBe(200)
    expect(res.body.favoritos).toHaveLength(1)
    expect(mockFavoritoFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id_usuario: 'usr_sa' } }),
    )
  })

  it('2. POST válido → 201 + create recebe id_usuario + campos DDD', async () => {
    mockFavoritoCreate.mockResolvedValue({ id_teste_favorito_usuario: 'cfavNew', ...PAYLOAD_VALIDO })

    const res = await request(app).post('/api/v1/admin/testes-favoritos').send(PAYLOAD_VALIDO)

    expect(res.status).toBe(201)
    expect(res.body.favorito.id_teste_favorito_usuario).toBe('cfavNew')
    const createData = mockFavoritoCreate.mock.calls[0][0].data
    expect(createData.id_usuario).toBe('usr_sa')
    expect(createData.produto_teste_favorito_usuario).toBe('pedido')
    expect(createData.tipos_teste_favorito_usuario).toEqual(['EMT'])
    expect(createData.planos_ids_teste_favorito_usuario).toEqual(['TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045'])
  })

  it('3. POST duplicado (mesma combinação) → 409 FAVORITO_DUPLICADO', async () => {
    mockFavoritoFindMany.mockResolvedValue([
      {
        produto_teste_favorito_usuario: 'pedido',
        ambiente_teste_favorito_usuario: 'Producao',
        tipos_teste_favorito_usuario: ['EMT'],
        planos_ids_teste_favorito_usuario: ['TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045'],
      },
    ])

    const res = await request(app).post('/api/v1/admin/testes-favoritos').send(PAYLOAD_VALIDO)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('FAVORITO_DUPLICADO')
    expect(mockFavoritoCreate).not.toHaveBeenCalled()
  })

  it('4. POST acima do limite (20) → 409 FAVORITO_LIMITE', async () => {
    const vinte = Array.from({ length: 20 }, (_, i) => ({
      produto_teste_favorito_usuario: 'admin',
      ambiente_teste_favorito_usuario: 'Local',
      tipos_teste_favorito_usuario: ['UNI'],
      planos_ids_teste_favorito_usuario: [`TST-UNI-ADMIN-${i}`],
    }))
    mockFavoritoFindMany.mockResolvedValue(vinte)

    const res = await request(app).post('/api/v1/admin/testes-favoritos').send(PAYLOAD_VALIDO)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('FAVORITO_LIMITE')
    expect(mockFavoritoCreate).not.toHaveBeenCalled()
  })

  it('5. POST sem tipos → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/admin/testes-favoritos')
      .send({ ...PAYLOAD_VALIDO, tipos_teste_favorito_usuario: [] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockFavoritoCreate).not.toHaveBeenCalled()
  })

  it('6. DELETE existente → 200 + deleteMany escopado por id_usuario', async () => {
    mockFavoritoDeleteMany.mockResolvedValue({ count: 1 })

    const res = await request(app).delete('/api/v1/admin/testes-favoritos/cfav1')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ deleted: true, id: 'cfav1' })
    expect(mockFavoritoDeleteMany).toHaveBeenCalledWith({
      where: { id_teste_favorito_usuario: 'cfav1', id_usuario: 'usr_sa' },
    })
  })

  it('7. DELETE inexistente (ou de outro usuário) → 404 NOT_FOUND', async () => {
    mockFavoritoDeleteMany.mockResolvedValue({ count: 0 })

    const res = await request(app).delete('/api/v1/admin/testes-favoritos/inexistente')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('8. PADRAO bloqueado por requireGravityAdmin → 403', async () => {
    setAuth(ATOR_PADRAO)

    const res = await request(app).get('/api/v1/admin/testes-favoritos')

    expect(res.status).toBe(403)
    expect(mockFavoritoFindMany).not.toHaveBeenCalled()
  })
})
