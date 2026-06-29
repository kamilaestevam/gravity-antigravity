// @vitest-environment node
// TST-FUNC-CONF-ME-001 — GET /api/v1/me contract test
// Valida: shape DDD do payload, tipo_usuario presente, schema rejeita payload legado,
// 404 quando usuário ausente, organizacao null quando sem tenant.
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const { mockFindUnique, mockWsFindMany, mockMemberFindFirst } = vi.hoisted(() => ({
  mockFindUnique:      vi.fn(),
  mockWsFindMany:      vi.fn(),
  mockMemberFindFirst: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario:          { findUnique: mockFindUnique, update: vi.fn() },
    workspace:        { findMany: mockWsFindMany, findFirst: vi.fn() },
    usuarioWorkspace: { findFirst: mockMemberFindFirst },
  },
}))

// Bypass auth — injeta req.auth diretamente para isolar o teste do middleware
vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (
    req:  Record<string, unknown>,
    _res: Record<string, unknown>,
    next: () => void,
  ) => {
    req['auth'] = { id_usuario: 'usr_test_01', id_organizacao: 'ten_test_01', tipo_usuario: 'MASTER' }
    next()
  },
}))

vi.mock('../../../servicos-global/servicos-plataforma/historico-global/server/services/audit.service.js', () => ({
  AuditService: { log: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock('@nucleo/montar-detalhe-acao-historico-log', () => ({
  compararEstadosHistoricoLog: vi.fn(),
  montarDetalheAcaoHistoricoLog: vi.fn().mockReturnValue(''),
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { meRouter, meResponseSchema } from '../../../servicos-global/configurador/server/routes/me.js'
import { AppError } from '../../../servicos-global/configurador/server/lib/appError.js'

// ─── App de teste ─────────────────────────────────────────────────────────────
const app = express()
app.use(express.json())
app.use('/api/v1/me', meRouter)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
})

// ─── Fixture ─────────────────────────────────────────────────────────────────
const USUARIO_MOCK = {
  id_usuario: 'usr_test_01',
  nome_usuario: 'Maria Teste',
  email_usuario: 'maria@teste.com.br',
  tipo_usuario: 'MASTER' as const,
  id_organizacao: 'ten_test_01',
  id_workspace_preferido_usuario: null,
  acesso_workspaces_futuros: false,
  tenant: {
    id_organizacao: 'ten_test_01',
    nome_organizacao: 'Empresa Teste Ltda',
    status_organizacao: 'ATIVO',
    hospeda_colaboradores_gravity: false,
  },
  memberships: [
    {
      tipo_usuario_workspace: 'MASTER' as const,
      company: {
        id_workspace: 'ws_001',
        nome_workspace: 'Workspace Alpha',
        status_workspace: 'ATIVO',
        company_products: [{ id_produto_gravity: 'pedido' }],
      },
    },
  ],
}

const WORKSPACES_ORG_MOCK = [
  {
    id_workspace: 'ws_001',
    nome_workspace: 'Workspace Alpha',
    status_workspace: 'ATIVO',
    company_products: [{ id_produto_gravity: 'pedido' }],
  },
]

// ─── Testes ───────────────────────────────────────────────────────────────────
describe('GET /api/v1/me — Contrato DDD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindUnique.mockResolvedValue(USUARIO_MOCK)
    mockWsFindMany.mockResolvedValue(WORKSPACES_ORG_MOCK)
  })

  it('retorna 200 com payload que passa no meResponseSchema', async () => {
    const res = await request(app).get('/api/v1/me')

    expect(res.status).toBe(200)
    const parsed = meResponseSchema.safeParse(res.body)
    expect(parsed.success,
      parsed.success ? '' : JSON.stringify((parsed as { error: unknown }).error)
    ).toBe(true)
  })

  it('usuario.tipo_usuario está presente (DDD) e user.role não existe (legado)', async () => {
    const res = await request(app).get('/api/v1/me')

    expect(res.body.usuario.tipo_usuario).toBe('MASTER')
    // Garantias anti-regressão: estrutura legada nunca deve aparecer
    expect(res.body.usuario.role).toBeUndefined()
    expect(res.body.user).toBeUndefined()
  })

  it('todos os campos obrigatórios do contrato DDD estão presentes', async () => {
    const res = await request(app).get('/api/v1/me')
    const { usuario, organizacao, workspaces } = res.body

    expect(usuario.id_usuario).toBe('usr_test_01')
    expect(usuario.nome_usuario).toBe('Maria Teste')
    expect(usuario.email_usuario).toBe('maria@teste.com.br')
    expect(usuario.tipo_usuario).toBe('MASTER')
    expect(usuario.id_organizacao).toBe('ten_test_01')

    expect(organizacao?.nome_organizacao).toBe('Empresa Teste Ltda')
    expect(organizacao?.subdominio_organizacao).toBeUndefined()

    expect(workspaces).toHaveLength(1)
    expect(workspaces[0].nome_workspace).toBe('Workspace Alpha')
    expect(workspaces[0].produtos).toContain('pedido')
  })

  it('meResponseSchema rejeita payload com estrutura legada (user.role)', () => {
    const payloadLegado = {
      user: { id: 'x', name: 'y', email: 'z@z.com', role: 'MASTER' },
    }
    const parsed = meResponseSchema.safeParse(payloadLegado)
    expect(parsed.success).toBe(false)
  })

  it('retorna 404 e error.code NOT_FOUND quando usuário não existe', async () => {
    mockFindUnique.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/me')

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('organizacao é null e schema aceita quando tenant não está vinculado', async () => {
    mockFindUnique.mockResolvedValue({ ...USUARIO_MOCK, tenant: null })
    mockWsFindMany.mockResolvedValue([])

    const res = await request(app).get('/api/v1/me')

    expect(res.status).toBe(200)
    expect(res.body.organizacao).toBeNull()

    const parsed = meResponseSchema.safeParse(res.body)
    expect(parsed.success).toBe(true)
  })

  it('workspaces é array vazio quando usuário não tem memberships ativas', async () => {
    mockFindUnique.mockResolvedValue({ ...USUARIO_MOCK, memberships: [] })
    mockWsFindMany.mockResolvedValue([])

    const res = await request(app).get('/api/v1/me')

    expect(res.status).toBe(200)
    expect(res.body.workspaces).toEqual([])
  })
})
