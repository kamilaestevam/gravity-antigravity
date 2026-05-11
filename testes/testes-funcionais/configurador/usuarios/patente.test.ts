// @vitest-environment node
// TST-FUN-CONFIG-PAT-001 — PATCH /api/v1/usuarios/:id_usuario/patente
// Cobre as regras de autorização (skill `permissoes`):
//   • SUPER_ADMIN edita qualquer um, qualquer valor (escopo global)
//   • ADMIN não promove a SUPER_ADMIN; não edita SUPER_ADMIN
//   • MASTER edita apenas usuários da própria org, exceto outros MASTERs;
//     pode promover PADRAO/FORNECEDOR a MASTER
//   • Anti-escalada: ator nunca edita o próprio tipo
//   • Anti-bricking: rebaixar último MASTER da organização → 409
//   • IDOR cross-organização → 404 (não vaza existência)
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockUsuarioFindFirst,
  mockUsuarioCount,
  mockUsuarioUpdate,
  mockTransaction,
  mockRoleChanged,
} = vi.hoisted(() => ({
  mockUsuarioFindFirst: vi.fn(),
  mockUsuarioCount:     vi.fn(),
  mockUsuarioUpdate:    vi.fn(),
  mockTransaction:      vi.fn(),
  mockRoleChanged:      vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario: {
      findFirst: mockUsuarioFindFirst,
      count:     mockUsuarioCount,
      update:    mockUsuarioUpdate,
    },
    workspace:        { findMany: vi.fn() },
    usuarioWorkspace: { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    $transaction:     mockTransaction,
  },
}))

vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { invitations: { createInvitation: vi.fn() } },
}))

vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: {
    roleChanged:       mockRoleChanged,
    permissionChanged: vi.fn().mockResolvedValue(undefined),
  },
}))

// requireAuth dinâmico — cada teste seta seu próprio `auth` antes de chamar
// `request(app)`. O middleware lê de globalThis.__testAuth.
vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = (globalThis as Record<string, unknown>)['__testAuth'] ?? {
      id_usuario:     'usr_default',
      id_organizacao: 'org_default',
      tipo_usuario:   'MASTER',
    }
    next()
  },
}))

// requireUserManagementRole inline (SAdmin/Admin/Master)
vi.mock('../../../../servicos-global/configurador/server/middleware/requireUserManagementRole.js', () => ({
  requireUserManagementRole: (req: Record<string, unknown>, _res: unknown, next: (err?: Error) => void) => {
    const auth = req['auth'] as { tipo_usuario?: string } | undefined
    const ok = auth?.tipo_usuario === 'SUPER_ADMIN'
      || auth?.tipo_usuario === 'ADMIN'
      || auth?.tipo_usuario === 'MASTER'
    if (!ok) return next(new Error('forbidden') as Error)
    next()
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireMasterRole.js', () => ({
  requireMasterRole: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { usersRouter } from '../../../../servicos-global/configurador/server/routes/usuario.js'
import { AppError } from '../../../../servicos-global/configurador/server/lib/appError.js'

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

// ─── Helpers ─────────────────────────────────────────────────────────────────
type AuthShape = { id_usuario: string; id_organizacao: string; tipo_usuario: string }
function setAuth(auth: AuthShape) {
  ;(globalThis as Record<string, unknown>)['__testAuth'] = auth
}

const ATOR_SUPER_ADMIN: AuthShape = { id_usuario: 'usr_sa', id_organizacao: 'org_gravity', tipo_usuario: 'SUPER_ADMIN' }
const ATOR_ADMIN:       AuthShape = { id_usuario: 'usr_ad', id_organizacao: 'org_gravity', tipo_usuario: 'ADMIN' }
const ATOR_MASTER:      AuthShape = { id_usuario: 'usr_ma', id_organizacao: 'org_a',       tipo_usuario: 'MASTER' }
const ATOR_PADRAO:      AuthShape = { id_usuario: 'usr_pa', id_organizacao: 'org_a',       tipo_usuario: 'PADRAO' }

function setupTransactionPassthrough() {
  // $transaction(fn, opts) → executa fn(tx) onde tx.usuario tem count/update
  mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      usuario: {
        count:  mockUsuarioCount,
        update: mockUsuarioUpdate,
      },
    }),
  )
}

// ─── TST-FUN-CONFIG-PAT-001..006 — Caminho Feliz ────────────────────────────
describe('TST-FUN-CONFIG-PAT-001..006 — PATCH /:id/patente — Caminho Feliz', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupTransactionPassthrough()
  })

  it('SUPER_ADMIN promove PADRAO a MASTER em outra org', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_outra', tipo_usuario: 'PADRAO' })
    mockUsuarioCount.mockResolvedValue(99) // anti-bricking não se aplica (não rebaixa MASTER)
    mockUsuarioUpdate.mockResolvedValue({ id_usuario: 'tgt', email_usuario: 'a@b.com', tipo_usuario: 'MASTER' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'MASTER' })

    expect(res.status).toBe(200)
    expect(res.body.usuario.tipo_usuario).toBe('MASTER')
    expect(mockRoleChanged).toHaveBeenCalled()
  })

  it('MASTER promove PADRAO da própria org a MASTER (não bloqueado)', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
    mockUsuarioCount.mockResolvedValue(99)
    mockUsuarioUpdate.mockResolvedValue({ id_usuario: 'tgt', email_usuario: 'a@b.com', tipo_usuario: 'MASTER' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'MASTER' })

    expect(res.status).toBe(200)
  })

  it('MASTER rebaixa MASTER cliente quando há outros Masters → permitido', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
    mockUsuarioCount.mockResolvedValue(2)
    mockUsuarioUpdate.mockResolvedValue({ id_usuario: 'tgt', email_usuario: 'a@b.com', tipo_usuario: 'PADRAO' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'PADRAO' })

    expect(res.status).toBe(200)
  })

  it('SUPER_ADMIN promove a SUPER_ADMIN — permitido', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_b', tipo_usuario: 'ADMIN' })
    mockUsuarioCount.mockResolvedValue(99)
    mockUsuarioUpdate.mockResolvedValue({ id_usuario: 'tgt', email_usuario: 'a@b.com', tipo_usuario: 'SUPER_ADMIN' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'SUPER_ADMIN' })

    expect(res.status).toBe(200)
  })

  it('Auditoria: roleChanged é chamado com oldRole/newRole corretos', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_b', tipo_usuario: 'PADRAO' })
    mockUsuarioCount.mockResolvedValue(99)
    mockUsuarioUpdate.mockResolvedValue({ id_usuario: 'tgt', email_usuario: 'a@b.com', tipo_usuario: 'FORNECEDOR' })

    await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'FORNECEDOR' })

    expect(mockRoleChanged).toHaveBeenCalledWith(
      'org_gravity',
      'usr_sa',
      expect.objectContaining({
        targetUserId: 'tgt',
        oldRole: 'PADRAO',
        newRole: 'FORNECEDOR',
      }),
    )
  })

  it('Update usa isolationLevel Serializable (anti-bricking sem race condition)', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_b', tipo_usuario: 'PADRAO' })
    mockUsuarioCount.mockResolvedValue(99)
    mockUsuarioUpdate.mockResolvedValue({ id_usuario: 'tgt', email_usuario: 'a@b.com', tipo_usuario: 'MASTER' })

    await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'MASTER' })

    expect(mockTransaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: 'Serializable' }),
    )
  })
})

// ─── TST-FUN-CONFIG-PAT-007..014 — Anti-escalada e Whitelist ────────────────
describe('TST-FUN-CONFIG-PAT-007..014 — PATCH /:id/patente — Bloqueios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupTransactionPassthrough()
  })

  it('Ator tenta editar a si mesmo → 403 FORBIDDEN_SELF_EDIT', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: ATOR_SUPER_ADMIN.id_usuario, id_organizacao: 'org_gravity', tipo_usuario: 'SUPER_ADMIN' })

    const res = await request(app).patch(`/api/v1/usuarios/${ATOR_SUPER_ADMIN.id_usuario}/patente`).send({ tipo_usuario: 'PADRAO' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN_SELF_EDIT')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('ADMIN tenta editar SUPER_ADMIN → 403 FORBIDDEN_ADMIN_VS_SUPER_ADMIN', async () => {
    setAuth(ATOR_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_gravity', tipo_usuario: 'SUPER_ADMIN' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'ADMIN' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN_ADMIN_VS_SUPER_ADMIN')
  })

  it('ADMIN tenta promover a SUPER_ADMIN → 403 FORBIDDEN_PROMOTE_GRAVITY_TIER (regra ε)', async () => {
    // Após regra ε (2026-05-11), o guard `FORBIDDEN_PROMOTE_GRAVITY_TIER` é
    // aplicado ANTES dos blocks de ator específicos — captura esta tentativa
    // antes do antigo `FORBIDDEN_ADMIN_PROMOTE_SUPER_ADMIN`.
    setAuth(ATOR_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_b', tipo_usuario: 'PADRAO' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'SUPER_ADMIN' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN_PROMOTE_GRAVITY_TIER')
  })

  it('MASTER tenta editar outro MASTER → 403 FORBIDDEN_MASTER_VS_MASTER', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_a', tipo_usuario: 'MASTER' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'PADRAO' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN_MASTER_VS_MASTER')
  })

  it('MASTER tenta editar SUPER_ADMIN → 403 FORBIDDEN_MASTER_VS_GRAVITY', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_a', tipo_usuario: 'SUPER_ADMIN' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'PADRAO' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN_MASTER_VS_GRAVITY')
  })

  it('MASTER tenta atribuir SUPER_ADMIN → 403 FORBIDDEN_PROMOTE_GRAVITY_TIER (regra ε)', async () => {
    // Após regra ε (2026-05-11), o guard `FORBIDDEN_PROMOTE_GRAVITY_TIER` é
    // aplicado ANTES dos blocks de ator específicos — captura esta tentativa
    // antes do antigo `FORBIDDEN_MASTER_INVALID_TARGET_TYPE`.
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'SUPER_ADMIN' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN_PROMOTE_GRAVITY_TIER')
  })

  it('PADRAO bloqueado pelo middleware (não passa de requireUserManagementRole)', async () => {
    setAuth(ATOR_PADRAO)
    // O mock do middleware acima retorna erro genérico para PADRAO

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'MASTER' })

    expect(res.status).toBe(500) // erro genérico do mock — em produção é 403 do middleware real
  })

  it('Cross-org: MASTER tenta editar usuário de outra org → 404 NOT_FOUND (não vaza)', async () => {
    setAuth(ATOR_MASTER)
    // findFirst com id_organizacao=org_a → não acha (alvo é org_b)
    mockUsuarioFindFirst.mockResolvedValue(null)

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'PADRAO' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})

// ─── TST-FUN-CONFIG-PAT-015 — Anti-bricking ──────────────────────────────────
describe('TST-FUN-CONFIG-PAT-015 — Anti-bricking último Master', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupTransactionPassthrough()
  })

  it('Rebaixar último MASTER da org → 409 CONFLICT_LAST_MASTER', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_b', tipo_usuario: 'MASTER' })
    mockUsuarioCount.mockResolvedValue(1) // só ele

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'PADRAO' })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('CONFLICT_LAST_MASTER')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('Rebaixar MASTER quando há outros 2 Masters → permitido', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_b', tipo_usuario: 'MASTER' })
    mockUsuarioCount.mockResolvedValue(3)
    mockUsuarioUpdate.mockResolvedValue({ id_usuario: 'tgt', email_usuario: 'a@b.com', tipo_usuario: 'PADRAO' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'PADRAO' })

    expect(res.status).toBe(200)
  })
})

// ─── TST-FUN-CONFIG-PAT-016 — Regra ε (SAdmin/Admin só via seed) ────────────
describe('TST-FUN-CONFIG-PAT-016 — Regra ε: SUPER_ADMIN/ADMIN não atribuíveis via API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupTransactionPassthrough()
  })

  it('SAdmin tenta promover PADRAO → SUPER_ADMIN → 403 FORBIDDEN_PROMOTE_GRAVITY_TIER', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'SUPER_ADMIN' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN_PROMOTE_GRAVITY_TIER')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('SAdmin tenta promover PADRAO → ADMIN → 403 FORBIDDEN_PROMOTE_GRAVITY_TIER', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'ADMIN' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN_PROMOTE_GRAVITY_TIER')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('SAdmin promove PADRAO → MASTER → 200 OK (caminho feliz preservado)', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValue({ id_usuario: 'tgt', id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
    mockUsuarioUpdate.mockResolvedValue({ id_usuario: 'tgt', email_usuario: 'a@b.com', tipo_usuario: 'MASTER', acesso_workspaces_futuros: false })

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'MASTER' })

    expect(res.status).toBe(200)
    expect(res.body.usuario.tipo_usuario).toBe('MASTER')
  })

  it('Zod rejeita tipo inválido → 400 VALIDATION_ERROR', async () => {
    setAuth(ATOR_SUPER_ADMIN)

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({ tipo_usuario: 'INVALIDO' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('Body vazio → 400 VALIDATION_ERROR', async () => {
    setAuth(ATOR_SUPER_ADMIN)

    const res = await request(app).patch('/api/v1/usuarios/tgt/patente').send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })
})
