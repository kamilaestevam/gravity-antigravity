// @vitest-environment node
// TST-FUNC-CONF-ME-001 — GET /api/v1/me contract test
// Valida: shape DDD do payload, tipo_usuario presente, schema rejeita payload legado,
// 404 quando usuário ausente, organizacao null quando sem tenant.
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const { mockFindUnique, mockWsFindFirst, mockMemberFindFirst } = vi.hoisted(() => ({
  mockFindUnique:      vi.fn(),
  mockWsFindFirst:     vi.fn(),
  mockMemberFindFirst: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario:          { findUnique: mockFindUnique, update: vi.fn() },
    workspace:        { findFirst: mockWsFindFirst },
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
    req['auth'] = { userId: 'usr_test_01', tenantId: 'ten_test_01', role: 'MASTER' }
    next()
  },
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
  id:                   'usr_test_01',
  name:                 'Maria Teste',
  email:                'maria@teste.com.br',
  role:                 'MASTER',
  tenant_id:            'ten_test_01',
  preferred_company_id: null,
  tenant: {
    id:     'ten_test_01',
    name:   'Empresa Teste Ltda',
    slug:   'empresa-teste',
    status: 'ACTIVE',
  },
  memberships: [
    {
      role: 'MASTER',
      company: {
        id:     'ws_001',
        name:   'Workspace Alpha',
        status: 'ACTIVE',
        company_products: [{ product_key: 'pedido' }],
      },
    },
  ],
}

// ─── Testes ───────────────────────────────────────────────────────────────────
describe('GET /api/v1/me — Contrato DDD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindUnique.mockResolvedValue(USUARIO_MOCK)
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
    expect(usuario.id_organizacao_usuario).toBe('ten_test_01')

    expect(organizacao?.nome_organizacao).toBe('Empresa Teste Ltda')
    expect(organizacao?.subdominio_organizacao).toBe('empresa-teste')

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

    const res = await request(app).get('/api/v1/me')

    expect(res.status).toBe(200)
    expect(res.body.organizacao).toBeNull()

    const parsed = meResponseSchema.safeParse(res.body)
    expect(parsed.success).toBe(true)
  })

  it('workspaces é array vazio quando usuário não tem memberships ativas', async () => {
    mockFindUnique.mockResolvedValue({ ...USUARIO_MOCK, memberships: [] })

    const res = await request(app).get('/api/v1/me')

    expect(res.status).toBe(200)
    expect(res.body.workspaces).toEqual([])
  })
})
