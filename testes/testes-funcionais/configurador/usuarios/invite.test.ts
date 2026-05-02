// @vitest-environment node
// TST-FUNC-CONF-USER-001 — POST /api/v1/usuarios/invite
// Valida: convite cria usuário + vínculos atomicamente; Zod rejeita workspaces inválidos;
//         IDOR bloqueado em workspaces cross-tenant; MASTER cria vínculos para todas as empresas.
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockUsuarioFindFirst,
  mockUsuarioCreate,
  mockEmpresaFindMany,
  mockWorkspaceCreateMany,
  mockTransaction,
  mockInvitationCreate,
} = vi.hoisted(() => ({
  mockUsuarioFindFirst:    vi.fn(),
  mockUsuarioCreate:       vi.fn(),
  mockEmpresaFindMany:     vi.fn(),
  mockWorkspaceCreateMany: vi.fn(),
  mockTransaction:         vi.fn(),
  mockInvitationCreate:    vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario:          { findFirst: mockUsuarioFindFirst },
    empresa:          { findMany:  mockEmpresaFindMany  },
    usuarioWorkspace: { createMany: mockWorkspaceCreateMany },
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
      userId:      'usr_invite_01',
      tenantId:    'ten_invite_01',
      clerkUserId: 'clerk_invite_01',
      role:        'MASTER',
      name:        'Master Tester',
    }
    next()
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireMasterRole.js', () => ({
  requireMasterRole: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/syncRole.js', () => ({
  syncRoleToClerk: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: { roleChanged: vi.fn().mockResolvedValue(undefined) },
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { usersRouter } from '../../../../servicos-global/configurador/server/routes/users.js'
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
const CUID_EMPRESA_A = 'cld8n2b0j0000mhog1234emp1'
const CUID_EMPRESA_B = 'cld8n2b0j0001mhog1234emp2'
const CUID_OUTRO_TENANT = 'cld8n2b0j0999mhogother01'

const EMPRESA_A = { id: CUID_EMPRESA_A }
const EMPRESA_B = { id: CUID_EMPRESA_B }

const USUARIO_CRIADO = {
  id:            'usr_new_01',
  tenant_id:     'ten_invite_01',
  clerk_user_id: 'pending_inv_01',
  email:         'novo@empresa.com',
  name:          'Novo Usuário',
  role:          'STANDARD',
  created_at:    new Date('2026-04-20T00:00:00Z'),
}

const INVITE_CLERK = { id: 'inv_clerk_01' }

// ─── Setup da transação ───────────────────────────────────────────────────────
// Executa o callback recebido por $transaction com um tx mock fiel à estrutura real
function setupTransaction() {
  mockTransaction.mockImplementation(
    async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        usuario:          { create: mockUsuarioCreate },
        usuarioWorkspace: { createMany: mockWorkspaceCreateMany },
      })
  )
}

// ─── Testes ───────────────────────────────────────────────────────────────────
describe('TST-FUNC-CONF-USER-001 — POST /api/v1/usuarios/invite — Caminho Feliz', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockInvitationCreate.mockResolvedValue(INVITE_CLERK)
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockUsuarioCreate.mockResolvedValue(USUARIO_CRIADO)
    mockWorkspaceCreateMany.mockResolvedValue({ count: 2 })
  })

  it('retorna 201 ao convidar STANDARD com workspaces: "all"', async () => {
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A, EMPRESA_B])

    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo Usuário', role: 'STANDARD', workspaces: 'all' })

    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe('novo@empresa.com')
    expect(res.body.user.role).toBe('STANDARD')
  })

  it('cria vínculos para todas as empresas ativas quando workspaces: "all"', async () => {
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A, EMPRESA_B])

    await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo Usuário', role: 'STANDARD', workspaces: 'all' })

    expect(mockWorkspaceCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ company_id: CUID_EMPRESA_A, tenant_id: 'ten_invite_01', role: 'STANDARD', is_active: true }),
          expect.objectContaining({ company_id: CUID_EMPRESA_B, tenant_id: 'ten_invite_01', role: 'STANDARD', is_active: true }),
        ]),
        skipDuplicates: true,
      })
    )
  })

  it('retorna 201 ao convidar STANDARD com array de workspaces específicos', async () => {
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A, EMPRESA_B])

    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo Usuário', role: 'STANDARD', workspaces: [CUID_EMPRESA_A, CUID_EMPRESA_B] })

    expect(res.status).toBe(201)
    expect(mockWorkspaceCreateMany).toHaveBeenCalled()
  })

  it('empresa.findMany filtrado por tenant_id do req.auth — isolamento de tenant', async () => {
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A])

    await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo', role: 'STANDARD', workspaces: 'all' })

    expect(mockEmpresaFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'ten_invite_01' }),
      })
    )
  })

  it('retorna 201 ao convidar MASTER sem campo workspaces', async () => {
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A, EMPRESA_B])

    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'master@empresa.com', name: 'Novo Master', role: 'MASTER' })

    expect(res.status).toBe(201)
    expect(mockEmpresaFindMany).toHaveBeenCalled()
  })

  it('MASTER: createMany inclui todas as empresas ativas com role MASTER', async () => {
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A, EMPRESA_B])

    await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'master@empresa.com', name: 'Novo Master', role: 'MASTER' })

    const callArgs = mockWorkspaceCreateMany.mock.calls[0][0] as { data: { role: string }[] }
    expect(callArgs.data).toHaveLength(2)
    expect(callArgs.data.every((d) => d.role === 'MASTER')).toBe(true)
  })

  it('não chama createMany quando tenant não tem empresas ativas', async () => {
    mockEmpresaFindMany.mockResolvedValue([])

    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo', role: 'MASTER' })

    expect(res.status).toBe(201)
    expect(mockWorkspaceCreateMany).not.toHaveBeenCalled()
  })
})

describe('TST-FUNC-CONF-USER-001 — POST /api/v1/usuarios/invite — Validação Zod', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockInvitationCreate.mockResolvedValue(INVITE_CLERK)
    mockUsuarioFindFirst.mockResolvedValue(null)
  })

  it('retorna 400 quando STANDARD enviado sem campo workspaces', async () => {
    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo', role: 'STANDARD' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('retorna 400 quando workspaces é array vazio []', async () => {
    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo', role: 'STANDARD', workspaces: [] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('retorna 400 quando SUPPLIER enviado sem campo workspaces', async () => {
    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'supplier@empresa.com', name: 'Fornecedor', role: 'SUPPLIER' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 quando email é inválido', async () => {
    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'nao-e-email', name: 'Novo', role: 'STANDARD', workspaces: 'all' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('TST-FUNC-CONF-USER-001 — POST /api/v1/usuarios/invite — Segurança e Resiliência', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockInvitationCreate.mockResolvedValue(INVITE_CLERK)
    mockUsuarioFindFirst.mockResolvedValue(null)
    mockUsuarioCreate.mockResolvedValue(USUARIO_CRIADO)
  })

  it('retorna 403 (IDOR) quando workspace IDs não pertencem ao tenant autenticado', async () => {
    // findMany retorna 1 empresa em vez de 2 — divergência indica ID cross-tenant
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A])

    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo', role: 'STANDARD', workspaces: [CUID_EMPRESA_A, CUID_OUTRO_TENANT] })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('retorna 409 quando usuário já pertence ao tenant', async () => {
    mockUsuarioFindFirst.mockResolvedValue({ id: 'usr_existing', email: 'novo@empresa.com' })

    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo', role: 'STANDARD', workspaces: 'all' })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('retorna 500 quando $transaction lança exceção — erro propagado sem estado parcial', async () => {
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A])
    mockTransaction.mockRejectedValue(new Error('DB constraint violation'))

    const res = await request(app)
      .post('/api/v1/usuarios/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo', role: 'STANDARD', workspaces: 'all' })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
  })
})
