// @vitest-environment node
// TST-FUNC-CONF-USER-001 — POST /api/v1/usuarios/convidar
// Valida: convite cria usuário + vínculos atomicamente; Zod rejeita workspaces_alvo inválidos;
//         IDOR bloqueado em workspaces cross-organização; MASTER cria vínculos para todos os workspaces.
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockUsuarioFindFirst,
  mockUsuarioCreate,
  mockWorkspaceFindMany,
  mockUsuarioWorkspaceCreateMany,
  mockTransaction,
  mockInvitationCreate,
} = vi.hoisted(() => ({
  mockUsuarioFindFirst:           vi.fn(),
  mockUsuarioCreate:              vi.fn(),
  mockWorkspaceFindMany:          vi.fn(),
  mockUsuarioWorkspaceCreateMany: vi.fn(),
  mockTransaction:                vi.fn(),
  mockInvitationCreate:           vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario:          { findFirst: mockUsuarioFindFirst },
    workspace:        { findMany:  mockWorkspaceFindMany },
    usuarioWorkspace: { createMany: mockUsuarioWorkspaceCreateMany },
    $transaction:     mockTransaction,
  },
}))

vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: {
    invitations: { createInvitation: mockInvitationCreate },
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = {
      id_usuario:       'usr_invite_01',
      id_organizacao:   'org_invite_01',
      id_clerk_usuario: 'clerk_invite_01',
      tipo_usuario:     'MASTER',
      nome_usuario:     'Master Tester',
    }
    next()
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireMasterRole.js', () => ({
  requireMasterRole: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: {
    roleChanged: vi.fn().mockResolvedValue(undefined),
    permissionChanged: vi.fn().mockResolvedValue(undefined),
  },
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { usersRouter } from '../../../../servicos-global/configurador/server/routes/usuario.js'
import { AppError } from '../../../../servicos-global/configurador/server/lib/appError.js'

// ─── App de teste ─────────────────────────────────────────────────────────────
const app = express()
app.use(express.json())
app.use('/api/v1/usuarios', usersRouter)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
})

// ─── Fixtures ────────────────────────────────────────────────────────────────
// CUIDs válidos (formato: c + 24 alfanuméricos) — necessário para z.string().cuid()
const CUID_WS_A = 'cld8n2b0j0000mhog1234ws01'
const CUID_WS_B = 'cld8n2b0j0001mhog1234ws02'
const CUID_OUTRA_ORG = 'cld8n2b0j0999mhogother01'

const WORKSPACE_A = { id_workspace: CUID_WS_A }
const WORKSPACE_B = { id_workspace: CUID_WS_B }

const USUARIO_CRIADO = {
  id_usuario:               'usr_new_01',
  id_organizacao:           'org_invite_01',
  id_clerk_usuario:         'pending_inv_01',
  email_usuario:            'novo@empresa.com',
  nome_usuario:             'Novo Usuário',
  tipo_usuario:             'PADRAO',
  data_criacao_usuario:     new Date('2026-04-20T00:00:00Z'),
  data_atualizacao_usuario: new Date('2026-04-20T00:00:00Z'),
}

const INVITE_CLERK = { id: 'inv_clerk_01' }

// ─── Setup da transação ───────────────────────────────────────────────────────
function setupTransaction() {
  mockTransaction.mockImplementation(
    async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        usuario:          { create: mockUsuarioCreate },
        usuarioWorkspace: { createMany: mockUsuarioWorkspaceCreateMany },
      }),
  )
}

// ─── Testes ───────────────────────────────────────────────────────────────────
describe('TST-FUNC-CONF-USER-001 — POST /api/v1/usuarios/convidar — Caminho Feliz', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockInvitationCreate.mockResolvedValue(INVITE_CLERK)
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockUsuarioCreate.mockResolvedValue(USUARIO_CRIADO)
    mockUsuarioWorkspaceCreateMany.mockResolvedValue({ count: 2 })
  })

  it('retorna 201 ao convidar PADRAO com workspaces_alvo: "all"', async () => {
    mockWorkspaceFindMany.mockResolvedValue([WORKSPACE_A, WORKSPACE_B])

    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'novo@empresa.com',
        nome_usuario: 'Novo Usuário',
        tipo_usuario: 'PADRAO',
        workspaces_alvo: 'all',
      })

    expect(res.status).toBe(201)
    expect(res.body.usuario.email_usuario).toBe('novo@empresa.com')
    expect(res.body.usuario.tipo_usuario).toBe('PADRAO')
    expect(res.body.usuario.id_usuario).toBe('usr_new_01')
  })

  it('cria vínculos para todos os workspaces ATIVOS quando workspaces_alvo: "all"', async () => {
    mockWorkspaceFindMany.mockResolvedValue([WORKSPACE_A, WORKSPACE_B])

    await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'novo@empresa.com',
        nome_usuario: 'Novo Usuário',
        tipo_usuario: 'PADRAO',
        workspaces_alvo: 'all',
      })

    expect(mockUsuarioWorkspaceCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ id_workspace: CUID_WS_A, id_organizacao: 'org_invite_01', tipo_usuario_workspace: 'PADRAO', ativo_usuario_workspace: true }),
          expect.objectContaining({ id_workspace: CUID_WS_B, id_organizacao: 'org_invite_01', tipo_usuario_workspace: 'PADRAO', ativo_usuario_workspace: true }),
        ]),
        skipDuplicates: true,
      }),
    )
  })

  it('retorna 201 ao convidar PADRAO com array de workspaces específicos', async () => {
    mockWorkspaceFindMany.mockResolvedValue([WORKSPACE_A, WORKSPACE_B])

    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'novo@empresa.com',
        nome_usuario: 'Novo Usuário',
        tipo_usuario: 'PADRAO',
        workspaces_alvo: [CUID_WS_A, CUID_WS_B],
      })

    expect(res.status).toBe(201)
    expect(mockUsuarioWorkspaceCreateMany).toHaveBeenCalled()
  })

  it('workspace.findMany filtrado por id_organizacao do req.auth — isolamento', async () => {
    mockWorkspaceFindMany.mockResolvedValue([WORKSPACE_A])

    await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'novo@empresa.com',
        nome_usuario: 'Novo',
        tipo_usuario: 'PADRAO',
        workspaces_alvo: 'all',
      })

    expect(mockWorkspaceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: 'org_invite_01' }),
      }),
    )
  })

  it('retorna 201 ao convidar MASTER sem campo workspaces_alvo', async () => {
    mockWorkspaceFindMany.mockResolvedValue([WORKSPACE_A, WORKSPACE_B])

    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'master@empresa.com',
        nome_usuario: 'Novo Master',
        tipo_usuario: 'MASTER',
      })

    expect(res.status).toBe(201)
    expect(mockWorkspaceFindMany).toHaveBeenCalled()
  })

  it('MASTER: createMany inclui todos os workspaces com tipo_usuario_workspace MASTER', async () => {
    mockWorkspaceFindMany.mockResolvedValue([WORKSPACE_A, WORKSPACE_B])

    await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'master@empresa.com',
        nome_usuario: 'Novo Master',
        tipo_usuario: 'MASTER',
      })

    const callArgs = mockUsuarioWorkspaceCreateMany.mock.calls[0][0] as { data: { tipo_usuario_workspace: string }[] }
    expect(callArgs.data).toHaveLength(2)
    expect(callArgs.data.every((d) => d.tipo_usuario_workspace === 'MASTER')).toBe(true)
  })

  it('não chama createMany quando organização não tem workspaces ATIVOS', async () => {
    mockWorkspaceFindMany.mockResolvedValue([])

    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'novo@empresa.com',
        nome_usuario: 'Novo',
        tipo_usuario: 'MASTER',
      })

    expect(res.status).toBe(201)
    expect(mockUsuarioWorkspaceCreateMany).not.toHaveBeenCalled()
  })
})

describe('TST-FUNC-CONF-USER-001 — POST /api/v1/usuarios/convidar — Validação Zod', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockInvitationCreate.mockResolvedValue(INVITE_CLERK)
    mockUsuarioFindFirst.mockResolvedValue(null)
  })

  it('retorna 400 quando PADRAO enviado sem campo workspaces_alvo', async () => {
    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'novo@empresa.com',
        nome_usuario: 'Novo',
        tipo_usuario: 'PADRAO',
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('retorna 400 quando workspaces_alvo é array vazio []', async () => {
    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'novo@empresa.com',
        nome_usuario: 'Novo',
        tipo_usuario: 'PADRAO',
        workspaces_alvo: [],
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('retorna 400 quando FORNECEDOR enviado sem campo workspaces_alvo', async () => {
    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'fornecedor@empresa.com',
        nome_usuario: 'Fornecedor',
        tipo_usuario: 'FORNECEDOR',
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 quando email_usuario é inválido', async () => {
    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'nao-e-email',
        nome_usuario: 'Novo',
        tipo_usuario: 'PADRAO',
        workspaces_alvo: 'all',
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('TST-FUNC-CONF-USER-001 — POST /api/v1/usuarios/convidar — Segurança e Resiliência', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockInvitationCreate.mockResolvedValue(INVITE_CLERK)
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockUsuarioCreate.mockResolvedValue(USUARIO_CRIADO)
  })

  it('retorna 403 (IDOR) quando IDs de workspace não pertencem à organização autenticada', async () => {
    // findMany retorna 1 workspace em vez de 2 — divergência indica ID cross-organização
    mockWorkspaceFindMany.mockResolvedValue([WORKSPACE_A])

    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'novo@empresa.com',
        nome_usuario: 'Novo',
        tipo_usuario: 'PADRAO',
        workspaces_alvo: [CUID_WS_A, CUID_OUTRA_ORG],
      })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('retorna 409 quando usuário já pertence à organização', async () => {
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'usr_existing', email_usuario: 'novo@empresa.com' })

    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'novo@empresa.com',
        nome_usuario: 'Novo',
        tipo_usuario: 'PADRAO',
        workspaces_alvo: 'all',
      })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('retorna 500 quando $transaction lança exceção — erro propagado sem estado parcial', async () => {
    mockWorkspaceFindMany.mockResolvedValue([WORKSPACE_A])
    mockTransaction.mockRejectedValue(new Error('DB constraint violation'))

    const res = await request(app)
      .post('/api/v1/usuarios/convidar')
      .send({
        email_usuario: 'novo@empresa.com',
        nome_usuario: 'Novo',
        tipo_usuario: 'PADRAO',
        workspaces_alvo: 'all',
      })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
  })
})
