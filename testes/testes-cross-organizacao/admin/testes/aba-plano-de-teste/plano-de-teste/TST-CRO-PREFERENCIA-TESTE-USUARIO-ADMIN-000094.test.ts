// @vitest-environment node
// TST-CRO-PREFERENCIA-TESTE-USUARIO-ADMIN-000094 — isolamento de favoritos por usuário/organização
//
// A tabela `teste_favorito_usuario` vive no banco do Configurador (schema public) e é escopada
// por `id_usuario` — não há schema-per-organização aqui. A fronteira de segurança relevante é:
// um admin NUNCA enxerga nem remove o favorito de outro usuário (mesmo que de outra organização).
//
// Cobre:
//   • Usuário B (org diferente) só lê os próprios favoritos (findMany por id_usuario)
//   • Usuário B NÃO remove favorito do usuário A (deleteMany por id_usuario → count 0 → 404)
//   • POST do usuário B grava com o id_usuario de B (nunca o de A)
//
/// <reference types="vitest/globals" />

import { vi, describe, it, expect, beforeEach } from 'vitest'

type FavoritoRow = {
  id_teste_favorito_usuario: string
  id_usuario: string
  produto_teste_favorito_usuario: string
  ambiente_teste_favorito_usuario: string
  tipos_teste_favorito_usuario: string[]
  planos_ids_teste_favorito_usuario: string[]
  planos_resumo_teste_favorito_usuario: unknown
  data_criacao_teste_favorito_usuario: Date
}

const { banco, mockFindMany, mockCreate, mockDeleteMany } = vi.hoisted(() => {
  const banco: { rows: Array<Record<string, unknown>> } = { rows: [] }
  return {
    banco,
    mockFindMany: vi.fn((args: { where?: { id_usuario?: string } }) =>
      Promise.resolve(banco.rows.filter(r => r.id_usuario === args.where?.id_usuario)),
    ),
    mockCreate: vi.fn((args: { data: Record<string, unknown>; select?: unknown }) => {
      const row = { id_teste_favorito_usuario: `fav_${banco.rows.length + 1}`, ...args.data }
      banco.rows.push(row)
      return Promise.resolve(row)
    }),
    mockDeleteMany: vi.fn((args: { where: { id_teste_favorito_usuario: string; id_usuario: string } }) => {
      const antes = banco.rows.length
      banco.rows = banco.rows.filter(
        r => !(r.id_teste_favorito_usuario === args.where.id_teste_favorito_usuario && r.id_usuario === args.where.id_usuario),
      )
      return Promise.resolve({ count: antes - banco.rows.length })
    }),
  }
})

vi.mock('../../../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    testeFavoritoUsuario: { findMany: mockFindMany, create: mockCreate, deleteMany: mockDeleteMany },
    organizacao: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), create: vi.fn(), count: vi.fn() },
    workspace:   { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    usuario:     { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    testeAgendamento: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('../../../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = (globalThis as Record<string, unknown>)['__testAuth']
    next()
  },
}))

vi.mock('../../../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { invitations: { createInvitation: vi.fn() } },
}))
vi.mock('../../../../../../servicos-global/configurador/server/lib/billing/index.js', () => ({ getBillingProvider: vi.fn() }))
vi.mock('../../../../../../servicos-global/configurador/server/services/organizacao-service.js', () => ({ proximoSubdominioDisponivel: vi.fn(), slugifySubdominio: vi.fn() }))
vi.mock('../../../../../../servicos-global/configurador/server/services/deploy-log-service.js', () => ({ deployLogService: { append: vi.fn(), list: vi.fn() } }))
vi.mock('../../../../../../servicos-global/configurador/server/utils/playwright-parser.js', () => ({ walkSuite: vi.fn() }))
vi.mock('../../../../../../servicos-global/configurador/server/lib/gemini-test-analyzer.js', () => ({ analyzeTestFailure: vi.fn(), getMetrics: vi.fn() }))
vi.mock('../../../../../../servicos-global/configurador/server/lib/agente-plano-teste.js', () => ({ generateTestPlan: vi.fn(), expandTestPlan: vi.fn() }))
vi.mock('../../../../../../servicos-global/configurador/server/lib/gerador-specs.js', () => ({ generateAndSaveSpec: vi.fn() }))
vi.mock('../../../../../../servicos-global/configurador/server/lib/extrator-testids.js', () => ({ generateTestidMapping: vi.fn() }))
vi.mock('../../../../../../servicos-global/servicos-plataforma/historico-global/server/services/audit.service.js', () => ({ AuditService: { log: vi.fn().mockResolvedValue(undefined) } }))
vi.mock('../../../../../../servicos-global/servicos-plataforma/historico-global/server/middleware/audit.js', () => ({ auditMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next() }))
vi.mock('../../../../../../servicos-global/servicos-plataforma/generated/index.js', () => ({ AcaoExecutadaPor: { USUARIO: 'USUARIO', SISTEMA: 'SISTEMA' } }))
vi.mock('../../../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({ securityAudit: { roleChanged: vi.fn().mockResolvedValue(undefined), permissionChanged: vi.fn().mockResolvedValue(undefined) } }))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { adminRouter } from '../../../../../../servicos-global/configurador/server/routes/admin.js'
import { AppError } from '../../../../../../servicos-global/configurador/server/lib/appError.js'

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

type AuthShape = { id_usuario: string; id_organizacao: string; tipo_usuario: string; nome_usuario: string; clerkUserId: string }
function setAuth(auth: AuthShape) { (globalThis as Record<string, unknown>)['__testAuth'] = auth }

// Dois admins Gravity de organizações diferentes
const USUARIO_A: AuthShape = { id_usuario: 'usr_A', id_organizacao: 'org_alpha', tipo_usuario: 'SUPER_ADMIN', nome_usuario: 'Admin A', clerkUserId: 'clerk_A' }
const USUARIO_B: AuthShape = { id_usuario: 'usr_B', id_organizacao: 'org_beta',  tipo_usuario: 'SUPER_ADMIN', nome_usuario: 'Admin B', clerkUserId: 'clerk_B' }

const PAYLOAD = {
  produto_teste_favorito_usuario: 'pedido',
  ambiente_teste_favorito_usuario: 'Producao',
  tipos_teste_favorito_usuario: ['EMT'],
  planos_ids_teste_favorito_usuario: ['TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045'],
}

beforeEach(() => {
  vi.clearAllMocks()
  banco.rows = []
})

describe('TST-CRO-PREFERENCIA-TESTE-USUARIO-ADMIN-000094 — isolamento por usuário/organização', () => {
  it('1. usuário B não enxerga os favoritos do usuário A', async () => {
    setAuth(USUARIO_A)
    await request(app).post('/api/v1/admin/testes-favoritos').send(PAYLOAD)

    setAuth(USUARIO_B)
    const res = await request(app).get('/api/v1/admin/testes-favoritos')

    expect(res.status).toBe(200)
    expect(res.body.favoritos).toEqual([])
  })

  it('2. usuário A continua enxergando o próprio favorito', async () => {
    setAuth(USUARIO_A)
    await request(app).post('/api/v1/admin/testes-favoritos').send(PAYLOAD)

    const res = await request(app).get('/api/v1/admin/testes-favoritos')
    expect(res.status).toBe(200)
    expect(res.body.favoritos).toHaveLength(1)
    expect(res.body.favoritos[0].id_usuario).toBe('usr_A')
  })

  it('3. usuário B NÃO remove o favorito do usuário A (ownership) → 404', async () => {
    setAuth(USUARIO_A)
    const criado = await request(app).post('/api/v1/admin/testes-favoritos').send(PAYLOAD)
    const idDeA = criado.body.favorito.id_teste_favorito_usuario

    setAuth(USUARIO_B)
    const del = await request(app).delete(`/api/v1/admin/testes-favoritos/${idDeA}`)
    expect(del.status).toBe(404)

    // Favorito de A continua intacto
    setAuth(USUARIO_A)
    const res = await request(app).get('/api/v1/admin/testes-favoritos')
    expect(res.body.favoritos).toHaveLength(1)
  })

  it('4. POST do usuário B grava com o id_usuario de B', async () => {
    setAuth(USUARIO_B)
    await request(app).post('/api/v1/admin/testes-favoritos').send(PAYLOAD)

    const createData = mockCreate.mock.calls[0][0].data
    expect(createData.id_usuario).toBe('usr_B')
  })
})
