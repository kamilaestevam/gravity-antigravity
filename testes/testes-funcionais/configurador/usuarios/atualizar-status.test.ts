// @vitest-environment node
// TST-FUN-CONFIG-UAS-001..010 — PATCH /api/v1/usuarios/:id/status
//
// Cobre a feature "Ativar/Inativar usuário" persistida em
// `Usuario.status_usuario` (enum StatusUsuario { ATIVO, INATIVO }).
//
// Decisão dono + Coordenador + Líder Técnico (2026-05-12):
//   - CONVIDADO continua DERIVADO em runtime (id_clerk_usuario.startsWith('pending_'))
//   - ATIVO/INATIVO são PERSISTIDOS no enum
//   - Validações:
//     1. CONVIDADO não pode ser inativado (use cancelarConvite)
//     2. Auto-protecao (ator !== alvo)
//     3. Anti-bricking: último MASTER ativo da org
//     4. MASTER intra-org, SAdmin/Admin cross-org
//     5. Clerk fora — Mand. 01 (Clerk só faz authn)
//
/// <reference types="vitest/globals" />

import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockUsuarioFindFirst,
  mockUsuarioUpdate,
  mockUsuarioCount,
  mockTransaction,
  mockSecurityAuditRoleChanged,
  mockInvalidarCache,
} = vi.hoisted(() => ({
  mockUsuarioFindFirst: vi.fn(),
  mockUsuarioUpdate:    vi.fn(),
  mockUsuarioCount:     vi.fn(),
  mockTransaction:      vi.fn(),
  mockSecurityAuditRoleChanged: vi.fn().mockResolvedValue(undefined),
  mockInvalidarCache:   vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario: {
      findFirst: mockUsuarioFindFirst,
      findMany:  vi.fn(),
      update:    mockUsuarioUpdate,
      count:     mockUsuarioCount,
    },
    organizacao:  { findUnique: vi.fn() },
    workspace:    { findMany: vi.fn() },
    usuarioWorkspace: { findMany: vi.fn(), updateMany: vi.fn(), createMany: vi.fn() },
    usuarioPermissao: { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    $transaction: mockTransaction,
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = (globalThis as Record<string, unknown>)['__testAuth'] ?? {
      id_usuario:     'usr_default',
      id_organizacao: 'org_default',
      tipo_usuario:   'MASTER',
      nome_usuario:   'Default',
      clerkUserId:    'clerk_default',
    }
    next()
  },
  invalidarCacheRequireAuth: mockInvalidarCache,
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireUserManagementRole.js', () => ({
  requireUserManagementRole: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    const auth = req['auth'] as { tipo_usuario: string } | undefined
    if (auth && (auth.tipo_usuario === 'MASTER' || auth.tipo_usuario === 'SUPER_ADMIN' || auth.tipo_usuario === 'ADMIN')) {
      next()
      return
    }
    // bloqueio 403
    next(Object.assign(new Error('FORBIDDEN'), { statusCode: 403, code: 'FORBIDDEN' }))
  },
}))

// outros middlewares laterais (mock minimalista)
vi.mock('../../../../servicos-global/configurador/server/middleware/requireMasterRole.js', () => ({
  requireMasterRole: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: {
    invitations: { revokeInvitation: vi.fn(), getInvitationList: vi.fn() },
    users: { getUser: vi.fn() },
  },
}))

vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: {
    roleChanged:       mockSecurityAuditRoleChanged,
    permissionChanged: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('../../../../servicos-global/configurador/server/services/permissao-usuario-servico.js', () => ({
  servicoPermissaoUsuario: { listarPermissoesUsuario: vi.fn() },
  permissaoStringSchema: { parse: vi.fn() },
  PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS: [],
  ehPermissaoAcessoUsuarioProdutoGravity: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/services/sincronizar-acesso-usuario-produtos-service.js', () => ({
  aoVincularUsuarioAoWorkspace: vi.fn(),
  aoDesvincularUsuarioDoWorkspace: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/services/convidar-usuario-service.js', () => ({
  convidarUsuarioService: { executar: vi.fn() },
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
  const e = err as { statusCode?: number; code?: string; message?: string }
  res.status(e.statusCode ?? 500).json({ error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? 'Erro interno' } })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
type AuthShape = {
  id_usuario:     string
  id_organizacao: string
  tipo_usuario:   string
  nome_usuario:   string
  clerkUserId:    string
}
function setAuth(auth: AuthShape) {
  ;(globalThis as Record<string, unknown>)['__testAuth'] = auth
}

const ATOR_MASTER:      AuthShape = { id_usuario: 'usr_master', id_organizacao: 'org_a', tipo_usuario: 'MASTER',      nome_usuario: 'Master', clerkUserId: 'clerk_master' }
const ATOR_SUPER_ADMIN: AuthShape = { id_usuario: 'usr_sa',     id_organizacao: 'org_gravity', tipo_usuario: 'SUPER_ADMIN', nome_usuario: 'Super', clerkUserId: 'clerk_sa' }
const ATOR_PADRAO:      AuthShape = { id_usuario: 'usr_pa',     id_organizacao: 'org_a', tipo_usuario: 'PADRAO',      nome_usuario: 'Padrao', clerkUserId: 'clerk_pa' }

const ID_USUARIO_ALVO = 'usr_alvo_001'

const ALVO_PADRAO_ATIVO = {
  id_usuario:        ID_USUARIO_ALVO,
  id_organizacao:    'org_a',
  tipo_usuario:      'PADRAO',
  status_usuario:    'ATIVO',
  id_clerk_usuario:  'user_clerk_001',
  nome_usuario:      'Alvo Padrao',
  email_usuario:     'alvo@example.com',
}

beforeEach(() => {
  vi.clearAllMocks()
  setAuth(ATOR_MASTER)
  mockUsuarioFindFirst.mockResolvedValue(ALVO_PADRAO_ATIVO)
  mockUsuarioCount.mockResolvedValue(5) // muitos masters por padrão — não trava
  mockTransaction.mockImplementation(async (cb: (tx: typeof prismaTx) => unknown) => cb(prismaTx))
  mockUsuarioUpdate.mockResolvedValue({
    id_usuario:     ID_USUARIO_ALVO,
    email_usuario:  'alvo@example.com',
    status_usuario: 'INATIVO',
  })
})

// Stub prismaTx (passado pra transaction callback)
const prismaTx = {
  usuario: {
    count:  mockUsuarioCount,
    update: mockUsuarioUpdate,
  },
}

// ─── TST-FUN-CONFIG-UAS — PATCH /usuarios/:id/status ─────────────────────────
describe('TST-FUN-CONFIG-UAS — PATCH /api/v1/usuarios/:id/status', () => {
  it('1. MASTER inativa PADRAO da mesma org → 200 + Prisma update + cache invalido', async () => {
    const res = await request(app)
      .patch(`/api/v1/usuarios/${ID_USUARIO_ALVO}/status`)
      .send({ status_usuario: 'INATIVO' })

    expect(res.status).toBe(200)
    expect(res.body.usuario.status_usuario).toBe('INATIVO')
    expect(mockUsuarioUpdate).toHaveBeenCalledTimes(1)
    expect(mockInvalidarCache).toHaveBeenCalledWith('user_clerk_001')
  })

  it('2. Auto-protecao — usuário tenta inativar a si mesmo → 403 AUTO_ALTERACAO_BLOQUEADA', async () => {
    setAuth({ ...ATOR_MASTER, id_usuario: ID_USUARIO_ALVO })
    const res = await request(app)
      .patch(`/api/v1/usuarios/${ID_USUARIO_ALVO}/status`)
      .send({ status_usuario: 'INATIVO' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('AUTO_ALTERACAO_BLOQUEADA')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('3. CONVIDADO não pode ser inativado → 409 USUARIO_CONVIDADO_NAO_PODE_INATIVAR', async () => {
    mockUsuarioFindFirst.mockResolvedValue({
      ...ALVO_PADRAO_ATIVO,
      id_clerk_usuario: 'pending_inv_xyz',
    })
    const res = await request(app)
      .patch(`/api/v1/usuarios/${ID_USUARIO_ALVO}/status`)
      .send({ status_usuario: 'INATIVO' })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('USUARIO_CONVIDADO_NAO_PODE_INATIVAR')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('4. Anti-bricking: último MASTER ativo da org → 409 ULTIMO_MASTER_ATIVO_ORGANIZACAO', async () => {
    mockUsuarioFindFirst.mockResolvedValue({
      ...ALVO_PADRAO_ATIVO,
      tipo_usuario: 'MASTER',
    })
    mockUsuarioCount.mockResolvedValue(1) // só ele é MASTER ativo
    const res = await request(app)
      .patch(`/api/v1/usuarios/${ID_USUARIO_ALVO}/status`)
      .send({ status_usuario: 'INATIVO' })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('ULTIMO_MASTER_ATIVO_ORGANIZACAO')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('5. PADRAO bloqueado por requireUserManagementRole → 403', async () => {
    setAuth(ATOR_PADRAO)
    const res = await request(app)
      .patch(`/api/v1/usuarios/${ID_USUARIO_ALVO}/status`)
      .send({ status_usuario: 'INATIVO' })

    expect(res.status).toBe(403)
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('6. SAdmin cross-org → 200', async () => {
    setAuth(ATOR_SUPER_ADMIN) // id_organizacao=org_gravity
    mockUsuarioFindFirst.mockResolvedValue({
      ...ALVO_PADRAO_ATIVO,
      id_organizacao: 'org_a', // org diferente
    })
    const res = await request(app)
      .patch(`/api/v1/usuarios/${ID_USUARIO_ALVO}/status`)
      .send({ status_usuario: 'INATIVO' })

    expect(res.status).toBe(200)
    expect(mockUsuarioUpdate).toHaveBeenCalled()
  })

  it('7. Body inválido (status_usuario ausente) → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .patch(`/api/v1/usuarios/${ID_USUARIO_ALVO}/status`)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('8. Body com CONVIDADO no enum → 400 VALIDATION_ERROR (só ATIVO/INATIVO)', async () => {
    const res = await request(app)
      .patch(`/api/v1/usuarios/${ID_USUARIO_ALVO}/status`)
      .send({ status_usuario: 'CONVIDADO' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('9. Idempotência: status já é o pedido → 200 sem update', async () => {
    mockUsuarioFindFirst.mockResolvedValue({
      ...ALVO_PADRAO_ATIVO,
      status_usuario: 'INATIVO', // já está INATIVO
    })
    const res = await request(app)
      .patch(`/api/v1/usuarios/${ID_USUARIO_ALVO}/status`)
      .send({ status_usuario: 'INATIVO' })

    expect(res.status).toBe(200)
    expect(mockUsuarioUpdate).not.toHaveBeenCalled()
  })

  it('10. Alvo não encontrado → 404 NOT_FOUND', async () => {
    mockUsuarioFindFirst.mockResolvedValue(null)
    const res = await request(app)
      .patch(`/api/v1/usuarios/${ID_USUARIO_ALVO}/status`)
      .send({ status_usuario: 'INATIVO' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})
