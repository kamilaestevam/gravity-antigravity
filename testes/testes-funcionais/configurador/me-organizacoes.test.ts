// @vitest-environment node
// TST-FUNC-CONF-ME-ORG-001 — GET /api/v1/me/organizacoes + PUT /api/v1/me/organizacao-ativa
// Valida: listagem de orgs para SUPER_ADMIN, 403 para roles não-admin,
// troca de org ativa, 404 para org inexistente.
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const { mockFindUnique, mockFindMany, mockOrgFindUnique, mockUserUpdate } = vi.hoisted(() => ({
  mockFindUnique:    vi.fn(),
  mockFindMany:      vi.fn(),
  mockOrgFindUnique: vi.fn(),
  mockUserUpdate:    vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario:     { findUnique: mockFindUnique, update: mockUserUpdate },
    organizacao: { findMany: mockFindMany, findUnique: mockOrgFindUnique },
    workspace:   { findFirst: vi.fn() },
    usuarioWorkspace: { findFirst: vi.fn() },
  },
}))

let mockAuthData: Record<string, unknown> = {}

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (
    req:  Record<string, unknown>,
    _res: Record<string, unknown>,
    next: () => void,
  ) => {
    req['auth'] = mockAuthData
    next()
  },
  invalidarCacheRequireAuth: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireConfiguradorAccess.js', () => ({
  requireConfiguradorMutation: (
    _req: Record<string, unknown>,
    _res: Record<string, unknown>,
    next: () => void,
  ) => { next() },
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
import { meRouter, meOrganizacoesResponseSchema } from '../../../servicos-global/configurador/server/routes/me.js'
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

// ─── Fixtures ────────────────────────────────────────────────────────────────
const ORGS_MOCK = [
  { id_organizacao: 'org_001', nome_organizacao: 'Gravity Interno', subdominio_organizacao: 'gravity-interno', status_organizacao: 'ATIVO' },
  { id_organizacao: 'org_002', nome_organizacao: 'Cliente ABC',     subdominio_organizacao: 'cliente-abc',     status_organizacao: 'ATIVO' },
  { id_organizacao: 'org_003', nome_organizacao: 'Demo Corp',       subdominio_organizacao: 'demo-corp',       status_organizacao: 'INATIVO' },
]

const AUTH_SUPER_ADMIN = {
  id_usuario: 'usr_sa_01',
  id_organizacao: 'org_001',
  clerkUserId: 'clerk_sa_01',
  tipo_usuario: 'SUPER_ADMIN',
  nome_usuario: 'Admin Gravity',
}

const AUTH_PADRAO = {
  id_usuario: 'usr_std_01',
  id_organizacao: 'org_001',
  clerkUserId: 'clerk_std_01',
  tipo_usuario: 'PADRAO',
  nome_usuario: 'User Standard',
}

// ─── GET /api/v1/me/organizacoes ─────────────────────────────────────────────
describe('GET /api/v1/me/organizacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthData = AUTH_SUPER_ADMIN
    mockFindMany.mockResolvedValue(ORGS_MOCK)
  })

  it('retorna 200 com lista de organizações para SUPER_ADMIN', async () => {
    const res = await request(app).get('/api/v1/me/organizacoes')

    expect(res.status).toBe(200)
    expect(res.body.organizacoes).toHaveLength(3)
    expect(res.body.organizacoes[0].id_organizacao).toBe('org_001')
  })

  it('payload passa no meOrganizacoesResponseSchema', async () => {
    const res = await request(app).get('/api/v1/me/organizacoes')

    const parsed = meOrganizacoesResponseSchema.safeParse(res.body)
    expect(parsed.success,
      parsed.success ? '' : JSON.stringify((parsed as { error: unknown }).error)
    ).toBe(true)
  })

  it('retorna 200 para ADMIN', async () => {
    mockAuthData = { ...AUTH_SUPER_ADMIN, tipo_usuario: 'ADMIN' }

    const res = await request(app).get('/api/v1/me/organizacoes')
    expect(res.status).toBe(200)
  })

  it('retorna 403 para PADRAO', async () => {
    mockAuthData = AUTH_PADRAO

    const res = await request(app).get('/api/v1/me/organizacoes')
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
  })

  it('retorna 403 para MASTER', async () => {
    mockAuthData = { ...AUTH_PADRAO, tipo_usuario: 'MASTER' }

    const res = await request(app).get('/api/v1/me/organizacoes')
    expect(res.status).toBe(403)
  })

  it('retorna 403 para FORNECEDOR', async () => {
    mockAuthData = { ...AUTH_PADRAO, tipo_usuario: 'FORNECEDOR' }

    const res = await request(app).get('/api/v1/me/organizacoes')
    expect(res.status).toBe(403)
  })

  it('retorna array vazio quando não há organizações', async () => {
    mockFindMany.mockResolvedValue([])

    const res = await request(app).get('/api/v1/me/organizacoes')
    expect(res.status).toBe(200)
    expect(res.body.organizacoes).toEqual([])
  })
})

// ─── PUT /api/v1/me/organizacao-ativa ────────────────────────────────────────
describe('PUT /api/v1/me/organizacao-ativa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthData = AUTH_SUPER_ADMIN
    mockOrgFindUnique.mockResolvedValue(ORGS_MOCK[1])
    mockUserUpdate.mockResolvedValue({})
  })

  it('retorna 200 ao trocar organização com sucesso', async () => {
    const res = await request(app)
      .put('/api/v1/me/organizacao-ativa')
      .send({ id_organizacao: 'org_002' })

    expect(res.status).toBe(200)
    expect(res.body.id_organizacao).toBe('org_002')
    expect(res.body.nome_organizacao).toBe('Cliente ABC')
  })

  it('atualiza id_organizacao e limpa workspace preferido', async () => {
    await request(app)
      .put('/api/v1/me/organizacao-ativa')
      .send({ id_organizacao: 'org_002' })

    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id_usuario: 'usr_sa_01' },
      data: {
        id_organizacao: 'org_002',
        id_workspace_preferido_usuario: null,
      },
    })
  })

  it('retorna 403 para PADRAO', async () => {
    mockAuthData = AUTH_PADRAO

    const res = await request(app)
      .put('/api/v1/me/organizacao-ativa')
      .send({ id_organizacao: 'org_002' })

    expect(res.status).toBe(403)
  })

  it('retorna 404 para organização inexistente', async () => {
    mockOrgFindUnique.mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/me/organizacao-ativa')
      .send({ id_organizacao: 'org_inexistente' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('retorna 400 para body vazio', async () => {
    const res = await request(app)
      .put('/api/v1/me/organizacao-ativa')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 para id_organizacao vazio', async () => {
    const res = await request(app)
      .put('/api/v1/me/organizacao-ativa')
      .send({ id_organizacao: '' })

    expect(res.status).toBe(400)
  })

  it('retorna 200 para ADMIN', async () => {
    mockAuthData = { ...AUTH_SUPER_ADMIN, tipo_usuario: 'ADMIN' }

    const res = await request(app)
      .put('/api/v1/me/organizacao-ativa')
      .send({ id_organizacao: 'org_002' })

    expect(res.status).toBe(200)
  })
})
