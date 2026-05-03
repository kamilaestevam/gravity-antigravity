// @vitest-environment node
// TST-FUN-CONFIG-WSUP-001 — PUT /api/v1/usuarios/:id_usuario/workspaces
// Plano: testes/testes-funcionais/configurador/_planos/users-workspaces-put.plan.json
// Valida: substituição atômica, IDOR bloqueado, MASTER bloqueado,
//         id_organizacao em toda query, audit trail, rollback em falha de transação.
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockUsuarioFindFirst,
  mockWorkspacePrismaFindMany,
  mockUsuarioWorkspaceFindMany,
  mockUsuarioWorkspaceDeleteMany,
  mockUsuarioWorkspaceCreateMany,
  mockTransaction,
  mockPermissionChanged,
} = vi.hoisted(() => ({
  mockUsuarioFindFirst:           vi.fn(),
  mockWorkspacePrismaFindMany:    vi.fn(),
  mockUsuarioWorkspaceFindMany:   vi.fn(),
  mockUsuarioWorkspaceDeleteMany: vi.fn(),
  mockUsuarioWorkspaceCreateMany: vi.fn(),
  mockTransaction:                vi.fn(),
  mockPermissionChanged:          vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario:   { findFirst: mockUsuarioFindFirst },
    workspace: { findMany: mockWorkspacePrismaFindMany },
    usuarioWorkspace: {
      findMany:   mockUsuarioWorkspaceFindMany,
      deleteMany: mockUsuarioWorkspaceDeleteMany,
      createMany: mockUsuarioWorkspaceCreateMany,
    },
    $transaction: mockTransaction,
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = {
      id_usuario:       'usr_wsput_01',
      id_organizacao:   'org_wsput_01',
      id_clerk_usuario: 'clerk_wsput_01',
      tipo_usuario:     'MASTER',
    }
    next()
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireMasterRole.js', () => ({
  requireMasterRole: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { invitations: { createInvitation: vi.fn() } },
}))

vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: {
    roleChanged:       vi.fn().mockResolvedValue(undefined),
    permissionChanged: mockPermissionChanged,
  },
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
const CUID_WS_A = 'cld8n2b0j0000mhog1234ws01'
const CUID_WS_B = 'cld8n2b0j0001mhog1234ws02'
const USER_ID   = 'usr_wsput_target_01'

const USUARIO_PADRAO = { id_usuario: USER_ID, tipo_usuario: 'PADRAO' }
const USUARIO_MASTER = { id_usuario: USER_ID, tipo_usuario: 'MASTER' }
const WORKSPACE_A    = { id_workspace: CUID_WS_A }
const WORKSPACE_B    = { id_workspace: CUID_WS_B }

function setupTransaction() {
  mockTransaction.mockImplementation(
    async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        usuarioWorkspace: {
          deleteMany: mockUsuarioWorkspaceDeleteMany,
          createMany: mockUsuarioWorkspaceCreateMany,
        },
      }),
  )
}

// ─── TST-FUN-CONFIG-WSUP-001..006 — Happy Path ───────────────────────────────
describe('TST-FUN-CONFIG-WSUP-001..006 — PUT /api/v1/usuarios/:id_usuario/workspaces — Caminho Feliz', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockUsuarioFindFirst.mockResolvedValue(USUARIO_PADRAO)
    mockWorkspacePrismaFindMany.mockResolvedValue([WORKSPACE_A, WORKSPACE_B])
    mockUsuarioWorkspaceFindMany.mockResolvedValue([{ id_workspace: CUID_WS_A }])
    mockUsuarioWorkspaceDeleteMany.mockResolvedValue({ count: 1 })
    mockUsuarioWorkspaceCreateMany.mockResolvedValue({ count: 2 })
  })

  it('PADRAO + workspaces válidos → 200 { workspaces: [...] }', async () => {
    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(res.status).toBe(200)
    expect(res.body.workspaces).toEqual([CUID_WS_A, CUID_WS_B])
  })

  it('deleteMany chamado com id_organizacao e id_usuario do req.auth — isolamento garantido', async () => {
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(mockUsuarioWorkspaceDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: 'org_wsput_01', id_usuario: USER_ID }),
      }),
    )
  })

  it('createMany com id_organizacao, id_usuario, ativo_usuario_workspace: true, skipDuplicates', async () => {
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(mockUsuarioWorkspaceCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ id_organizacao: 'org_wsput_01', id_usuario: USER_ID, id_workspace: CUID_WS_A, ativo_usuario_workspace: true }),
          expect.objectContaining({ id_organizacao: 'org_wsput_01', id_usuario: USER_ID, id_workspace: CUID_WS_B, ativo_usuario_workspace: true }),
        ]),
        skipDuplicates: true,
      }),
    )
  })

  it('workspace adicionado → permissionChanged chamado com action: GRANTED', async () => {
    // antes: [CUID_WS_A], depois: [CUID_WS_A, CUID_WS_B] → CUID_WS_B adicionado → GRANTED
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(mockPermissionChanged).toHaveBeenCalledWith(
      'org_wsput_01',
      'usr_wsput_01',
      expect.objectContaining({
        targetUserId: USER_ID,
        permission:   'workspace_access',
        action:       'GRANTED',
      }),
    )
  })

  it('workspace removido (sem adição) → permissionChanged chamado com action: REVOKED', async () => {
    // antes: [CUID_WS_A, CUID_WS_B], depois: [CUID_WS_A] → CUID_WS_B removido → REVOKED
    mockUsuarioWorkspaceFindMany.mockResolvedValue([{ id_workspace: CUID_WS_A }, { id_workspace: CUID_WS_B }])
    mockWorkspacePrismaFindMany.mockResolvedValue([WORKSPACE_A])

    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(mockPermissionChanged).toHaveBeenCalledWith(
      'org_wsput_01',
      'usr_wsput_01',
      expect.objectContaining({
        targetUserId: USER_ID,
        permission:   'workspace_access',
        action:       'REVOKED',
      }),
    )
  })

  it('workspaces idênticos aos anteriores → permissionChanged NÃO chamado', async () => {
    // antes: [CUID_WS_A, CUID_WS_B], depois: [CUID_WS_A, CUID_WS_B] → sem diff
    mockUsuarioWorkspaceFindMany.mockResolvedValue([{ id_workspace: CUID_WS_A }, { id_workspace: CUID_WS_B }])
    mockWorkspacePrismaFindMany.mockResolvedValue([WORKSPACE_A, WORKSPACE_B])

    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(mockPermissionChanged).not.toHaveBeenCalled()
  })
})

// ─── TST-FUN-CONFIG-WSUP-007..011 — Validação Zod (REAL) ────────────────────
describe('TST-FUN-CONFIG-WSUP-007..011 — PUT /api/v1/usuarios/:id_usuario/workspaces — Validação Zod', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('workspaces: [] → 400 VALIDATION_ERROR (Zod min(1)), sem stack trace', async () => {
    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.stack).toBeUndefined()
  })

  it('campo workspaces ausente → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('workspace ID não-CUID (string comum) → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: ['not-a-cuid'] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('CUIDs duplicados no array → 400 VALIDATION_ERROR (refine deduplicação)', async () => {
    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_A] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('adversarial: <script>alert(1)</script> como workspace ID → 400 VALIDATION_ERROR sem stack trace', async () => {
    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: ['<script>alert(1)</script>'] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.stack).toBeUndefined()
  })
})

// ─── TST-FUN-CONFIG-WSUP-012..015 — Regras de Negócio ───────────────────────
describe('TST-FUN-CONFIG-WSUP-012..015 — PUT /api/v1/usuarios/:id_usuario/workspaces — Regras de Negócio', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
  })

  it('usuário MASTER → 400 INVALID_OPERATION (MASTER tem acesso total implícito)', async () => {
    mockUsuarioFindFirst.mockResolvedValue(USUARIO_MASTER)

    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_OPERATION')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('usuário não encontrado na organização → 404 NOT_FOUND (não vaza existência)', async () => {
    mockUsuarioFindFirst.mockResolvedValue(null)

    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('workspace IDs cross-organização (IDOR) → 403 FORBIDDEN — $transaction não chamada', async () => {
    // Envia 2 IDs mas findMany retorna apenas 1 → divergência detecta IDOR
    mockUsuarioFindFirst.mockResolvedValue(USUARIO_PADRAO)
    mockWorkspacePrismaFindMany.mockResolvedValue([WORKSPACE_A])

    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('Prisma $transaction falha → 500 INTERNAL_ERROR sem stack trace no body', async () => {
    mockUsuarioFindFirst.mockResolvedValue(USUARIO_PADRAO)
    mockWorkspacePrismaFindMany.mockResolvedValue([WORKSPACE_A])
    mockUsuarioWorkspaceFindMany.mockResolvedValue([])
    mockTransaction.mockRejectedValue(new Error('DB constraint violation'))

    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.body.error.stack).toBeUndefined()
  })
})

// ─── TST-FUN-CONFIG-WSUP-016..018 — Isolamento por organização ──────────────
describe('TST-FUN-CONFIG-WSUP-016..018 — WHERE id_organizacao em todas as queries Prisma', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockUsuarioFindFirst.mockResolvedValue(USUARIO_PADRAO)
    mockWorkspacePrismaFindMany.mockResolvedValue([WORKSPACE_A])
    mockUsuarioWorkspaceFindMany.mockResolvedValue([])
    mockUsuarioWorkspaceDeleteMany.mockResolvedValue({ count: 0 })
    mockUsuarioWorkspaceCreateMany.mockResolvedValue({ count: 1 })
  })

  it('usuario.findFirst WHERE inclui id_organizacao = req.auth.id_organizacao', async () => {
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(mockUsuarioFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: 'org_wsput_01' }),
      }),
    )
  })

  it('workspace.findMany WHERE inclui id_organizacao (prevenção IDOR)', async () => {
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(mockWorkspacePrismaFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: 'org_wsput_01' }),
      }),
    )
  })

  it('usuarioWorkspace.findMany (antesIds/diff) WHERE inclui id_organizacao', async () => {
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(mockUsuarioWorkspaceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: 'org_wsput_01' }),
      }),
    )
  })
})
