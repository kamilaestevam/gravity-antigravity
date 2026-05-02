// @vitest-environment node
// TST-FUN-CONFIG-WSUP-001 — PUT /api/v1/usuarios/:id/workspaces
// Plano: testes/testes-funcionais/configurador/_planos/users-workspaces-put.plan.json
// Valida: substituição atômica, IDOR bloqueado, MASTER bloqueado,
//         tenant_id em toda query, audit trail, rollback em falha de transação.
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockUsuarioFindFirst,
  mockEmpresaFindMany,
  mockWorkspaceFindMany,
  mockWorkspaceDeleteMany,
  mockWorkspaceCreateMany,
  mockTransaction,
  mockPermissionChanged,
} = vi.hoisted(() => ({
  mockUsuarioFindFirst:    vi.fn(),
  mockEmpresaFindMany:     vi.fn(),
  mockWorkspaceFindMany:   vi.fn(),
  mockWorkspaceDeleteMany: vi.fn(),
  mockWorkspaceCreateMany: vi.fn(),
  mockTransaction:         vi.fn(),
  mockPermissionChanged:   vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario: { findFirst: mockUsuarioFindFirst },
    empresa: { findMany: mockEmpresaFindMany },
    usuarioWorkspace: {
      findMany:   mockWorkspaceFindMany,
      deleteMany: mockWorkspaceDeleteMany,
      createMany: mockWorkspaceCreateMany,
    },
    $transaction: mockTransaction,
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = {
      userId:      'usr_wsput_01',
      tenantId:    'ten_wsput_01',
      clerkUserId: 'clerk_wsput_01',
      role:        'MASTER',
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

vi.mock('../../../../servicos-global/configurador/server/lib/syncRole.js', () => ({
  syncRoleToClerk: vi.fn().mockResolvedValue(undefined),
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

const USER_STANDARD = { id: USER_ID, role: 'STANDARD' }
const USER_MASTER   = { id: USER_ID, role: 'MASTER' }
const EMPRESA_A     = { id: CUID_WS_A }
const EMPRESA_B     = { id: CUID_WS_B }

function setupTransaction() {
  mockTransaction.mockImplementation(
    async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        usuarioWorkspace: {
          deleteMany: mockWorkspaceDeleteMany,
          createMany: mockWorkspaceCreateMany,
        },
      }),
  )
}

// ─── TST-FUN-CONFIG-WSUP-001..006 — Happy Path ───────────────────────────────
describe('TST-FUN-CONFIG-WSUP-001..006 — PUT /api/v1/usuarios/:id/workspaces — Caminho Feliz', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockUsuarioFindFirst.mockResolvedValue(USER_STANDARD)
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A, EMPRESA_B])
    mockWorkspaceFindMany.mockResolvedValue([{ company_id: CUID_WS_A }])
    mockWorkspaceDeleteMany.mockResolvedValue({ count: 1 })
    mockWorkspaceCreateMany.mockResolvedValue({ count: 2 })
  })

  it('STANDARD + workspaces válidos → 200 { workspaces: [...] }', async () => {
    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(res.status).toBe(200)
    expect(res.body.workspaces).toEqual([CUID_WS_A, CUID_WS_B])
  })

  it('deleteMany chamado com tenant_id e user_id do req.auth — isolamento garantido', async () => {
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(mockWorkspaceDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'ten_wsput_01', user_id: USER_ID }),
      }),
    )
  })

  it('createMany com tenant_id, user_id, is_active: true, skipDuplicates: true', async () => {
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(mockWorkspaceCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ tenant_id: 'ten_wsput_01', user_id: USER_ID, company_id: CUID_WS_A, is_active: true }),
          expect.objectContaining({ tenant_id: 'ten_wsput_01', user_id: USER_ID, company_id: CUID_WS_B, is_active: true }),
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
      'ten_wsput_01',
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
    mockWorkspaceFindMany.mockResolvedValue([{ company_id: CUID_WS_A }, { company_id: CUID_WS_B }])
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A])

    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(mockPermissionChanged).toHaveBeenCalledWith(
      'ten_wsput_01',
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
    mockWorkspaceFindMany.mockResolvedValue([{ company_id: CUID_WS_A }, { company_id: CUID_WS_B }])
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A, EMPRESA_B])

    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(mockPermissionChanged).not.toHaveBeenCalled()
  })
})

// ─── TST-FUN-CONFIG-WSUP-007..011 — Validação Zod (REAL) ────────────────────
describe('TST-FUN-CONFIG-WSUP-007..011 — PUT /api/v1/usuarios/:id/workspaces — Validação Zod', () => {

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
describe('TST-FUN-CONFIG-WSUP-012..015 — PUT /api/v1/usuarios/:id/workspaces — Regras de Negócio', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
  })

  it('usuário MASTER → 400 INVALID_OPERATION (MASTER tem acesso total implícito)', async () => {
    mockUsuarioFindFirst.mockResolvedValue(USER_MASTER)

    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_OPERATION')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('usuário não encontrado no tenant → 404 NOT_FOUND (não vaza existência)', async () => {
    mockUsuarioFindFirst.mockResolvedValue(null)

    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('workspace IDs cross-tenant (IDOR) → 403 FORBIDDEN — $transaction não chamada', async () => {
    // Envia 2 IDs mas findMany retorna apenas 1 → divergência detecta IDOR
    mockUsuarioFindFirst.mockResolvedValue(USER_STANDARD)
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A])

    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A, CUID_WS_B] })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('Prisma $transaction falha → 500 INTERNAL_ERROR sem stack trace no body', async () => {
    mockUsuarioFindFirst.mockResolvedValue(USER_STANDARD)
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A])
    mockWorkspaceFindMany.mockResolvedValue([])
    mockTransaction.mockRejectedValue(new Error('DB constraint violation'))

    const res = await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.body.error.stack).toBeUndefined()
  })
})

// ─── TST-FUN-CONFIG-WSUP-016..018 — Tenant Isolation ────────────────────────
describe('TST-FUN-CONFIG-WSUP-016..018 — WHERE tenant_id em todas as queries Prisma', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    setupTransaction()
    mockUsuarioFindFirst.mockResolvedValue(USER_STANDARD)
    mockEmpresaFindMany.mockResolvedValue([EMPRESA_A])
    mockWorkspaceFindMany.mockResolvedValue([])
    mockWorkspaceDeleteMany.mockResolvedValue({ count: 0 })
    mockWorkspaceCreateMany.mockResolvedValue({ count: 1 })
  })

  it('usuario.findFirst WHERE inclui tenant_id = req.auth.tenantId', async () => {
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(mockUsuarioFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'ten_wsput_01' }),
      }),
    )
  })

  it('empresa.findMany WHERE inclui tenant_id (prevenção IDOR) — não valida empresas de outro tenant', async () => {
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(mockEmpresaFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'ten_wsput_01' }),
      }),
    )
  })

  it('usuarioWorkspace.findMany (antesIds/diff) WHERE inclui tenant_id', async () => {
    await request(app)
      .put(`/api/v1/usuarios/${USER_ID}/workspaces`)
      .send({ workspaces: [CUID_WS_A] })

    expect(mockWorkspaceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant_id: 'ten_wsput_01' }),
      }),
    )
  })
})
