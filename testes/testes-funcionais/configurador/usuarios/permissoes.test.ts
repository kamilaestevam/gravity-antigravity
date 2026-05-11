// @vitest-environment node
// TST-FUN-CONFIG-PERM-001 — PUT /GET /api/v1/usuarios/:id_usuario/permissoes
// Cobre as defesas de autorização e validação documentadas em
// `skills/seguranca/permissoes/SKILL.md`:
//   • SUPER_ADMIN: escopo global; ADMIN/MASTER: escopo da própria organização
//   • Bypass Mand. 04 — alvo SAdmin/Admin/Master rejeita com 400
//   • Anti-escalada — ator não edita próprias permissões (EDICAO_PROPRIA_NAO_PERMITIDA)
//   • IDOR cross-org de workspace (WORKSPACE_FORA_DA_ORGANIZACAO)
//   • Mand. 06 — Zod valida formato `<slug>:<secao>:<acao>`, sem duplicatas
//   • Set PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS — produto fora rejeita 400
//   • Slug do body ≠ slug do produto → PERMISSION_SLUG_MISMATCH
//   • permissoes: [] → wipe atômico (200 + total_removidas correto)
//   • Idempotência — mesmo input produz mesmo estado final
//   • Audit — securityAudit.permissionChanged chamado quando há diff
//   • GET filtra por id_workspace
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockUsuarioFindFirst,
  mockProdutoFindUnique,
  mockWorkspaceFindFirst,
  mockUsuarioPermissaoFindMany,
  mockUsuarioPermissaoFindFirst,
  mockUsuarioPermissaoDeleteMany,
  mockUsuarioPermissaoCreateMany,
  mockTransaction,
  mockPermissionChanged,
} = vi.hoisted(() => ({
  mockUsuarioFindFirst:           vi.fn(),
  mockProdutoFindUnique:          vi.fn(),
  mockWorkspaceFindFirst:         vi.fn(),
  mockUsuarioPermissaoFindMany:   vi.fn(),
  mockUsuarioPermissaoFindFirst:  vi.fn(),
  mockUsuarioPermissaoDeleteMany: vi.fn(),
  mockUsuarioPermissaoCreateMany: vi.fn(),
  mockTransaction:                vi.fn(),
  mockPermissionChanged:          vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario:           { findFirst: mockUsuarioFindFirst, count: vi.fn(), update: vi.fn() },
    produtoGravity:    { findUnique: mockProdutoFindUnique },
    workspace:         { findFirst: mockWorkspaceFindFirst, findMany: vi.fn() },
    usuarioWorkspace:  { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    usuarioPermissao:  {
      findMany:   mockUsuarioPermissaoFindMany,
      findFirst:  mockUsuarioPermissaoFindFirst,
      deleteMany: mockUsuarioPermissaoDeleteMany,
      createMany: mockUsuarioPermissaoCreateMany,
    },
    $transaction:      mockTransaction,
  },
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

// requireAuth dinâmico — cada teste seta seu próprio `auth` antes de chamar
// `request(app)`. O middleware lê de globalThis.__testAuth.
vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = (globalThis as Record<string, unknown>)['__testAuth'] ?? {
      id_usuario:     'usr_default',
      id_organizacao: 'org_default',
      tipo_usuario:   'MASTER',
      clerkUserId:    'clerk_default',
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
    if (!ok) {
      const err = new Error('forbidden') as Error & { statusCode?: number; code?: string }
      err.statusCode = 403
      err.code = 'FORBIDDEN'
      return next(err)
    }
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
  const e = err as { statusCode?: number; code?: string; message?: string }
  res.status(e.statusCode ?? 500).json({ error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? 'Erro interno' } })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
type AuthShape = { id_usuario: string; id_organizacao: string; tipo_usuario: string; clerkUserId: string }
function setAuth(auth: AuthShape) {
  ;(globalThis as Record<string, unknown>)['__testAuth'] = auth
}

const ATOR_SUPER_ADMIN: AuthShape = { id_usuario: 'usr_sa', id_organizacao: 'org_gravity', tipo_usuario: 'SUPER_ADMIN', clerkUserId: 'clerk_sa' }
const ATOR_MASTER:      AuthShape = { id_usuario: 'usr_ma', id_organizacao: 'org_a',       tipo_usuario: 'MASTER',      clerkUserId: 'clerk_ma' }
const ATOR_PADRAO:      AuthShape = { id_usuario: 'usr_pa', id_organizacao: 'org_a',       tipo_usuario: 'PADRAO',      clerkUserId: 'clerk_pa' }

const CUID_USR_ALVO       = 'ckxuzzzzzzzzzzzzzzzzzzaa'
const CUID_USR_OUTRA_ORG  = 'ckxuzzzzzzzzzzzzzzzzzzbb'
const CUID_WS_OK          = 'ckxwzzzzzzzzzzzzzzzzzzcc'
const CUID_WS_OUTRA_ORG   = 'ckxwzzzzzzzzzzzzzzzzzzdd'
const CUID_PROD_PEDIDO    = 'ckxpzzzzzzzzzzzzzzzzzzee'
const CUID_PROD_OUTRO     = 'ckxpzzzzzzzzzzzzzzzzzzff'

function setupTransactionPassthrough() {
  // $transaction((tx) => fn(tx)) — executa fn com tx mocado
  mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      usuarioPermissao: {
        deleteMany: mockUsuarioPermissaoDeleteMany,
        createMany: mockUsuarioPermissaoCreateMany,
      },
    }),
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  setAuth(ATOR_MASTER)
  setupTransactionPassthrough()
  // Defaults benignos — testes individuais sobrescrevem
  mockUsuarioPermissaoDeleteMany.mockResolvedValue({ count: 0 })
  mockUsuarioPermissaoCreateMany.mockResolvedValue({ count: 0 })
})

// ─── PUT /:id_usuario/permissoes ─────────────────────────────────────────────

describe('PUT /api/v1/usuarios/:id_usuario/permissoes', () => {
  // 1) SUPER_ADMIN edita usuário em outra organização (escopo global)
  it('1. SAdmin atribui permissões para PADRAO de outra org → 200', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockUsuarioFindFirst.mockResolvedValueOnce({ id_usuario: CUID_USR_ALVO, id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
    mockWorkspaceFindFirst.mockResolvedValueOnce({ id_workspace: CUID_WS_OK })
    mockProdutoFindUnique
      .mockResolvedValueOnce({ slug_produto_gravity: 'pedido', status_produto_gravity: 'ATIVO' }) // route check
      .mockResolvedValueOnce({ id_produto_gravity: CUID_PROD_PEDIDO, slug_produto_gravity: 'pedido' }) // service check
    mockUsuarioPermissaoCreateMany.mockResolvedValueOnce({ count: 1 })

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:dashboard:ver'] })

    expect(res.status).toBe(200)
    expect(res.body.permissoes).toEqual(['pedido:dashboard:ver'])
  })

  // 2) MASTER edita usuário PADRAO da própria org
  it('2. Master atribui permissões para PADRAO da própria org → 200', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValueOnce({ id_usuario: CUID_USR_ALVO, id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
    mockWorkspaceFindFirst.mockResolvedValueOnce({ id_workspace: CUID_WS_OK })
    mockProdutoFindUnique
      .mockResolvedValueOnce({ slug_produto_gravity: 'pedido', status_produto_gravity: 'ATIVO' })
      .mockResolvedValueOnce({ id_produto_gravity: CUID_PROD_PEDIDO, slug_produto_gravity: 'pedido' })
    mockUsuarioPermissaoCreateMany.mockResolvedValueOnce({ count: 2 })

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({
        id_workspace: CUID_WS_OK,
        id_produto_gravity: CUID_PROD_PEDIDO,
        permissoes: ['pedido:lista:ver', 'pedido:lista:editar'],
      })

    expect(res.status).toBe(200)
    expect(res.body.total_inseridas).toBe(2)
  })

  // 3) MASTER tenta editar usuário de outra org (IDOR) → 404 (não vaza existência)
  it('3. Master tenta atribuir para PADRAO de outra org (IDOR) → 404', async () => {
    setAuth(ATOR_MASTER)
    // findFirst com filtro id_organizacao retorna null porque alvo é de outra org
    mockUsuarioFindFirst.mockResolvedValueOnce(null)

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_OUTRA_ORG}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:dashboard:ver'] })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  // 4) MASTER tenta atribuir para outro MASTER → 400 INVALID_OPERATION (Mand. 04)
  it('4. Master tenta atribuir para outro Master → 400 INVALID_OPERATION', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValueOnce({ id_usuario: CUID_USR_ALVO, id_organizacao: 'org_a', tipo_usuario: 'MASTER' })

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:dashboard:ver'] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_OPERATION')
    expect(res.body.error.message).toMatch(/MASTER/)
  })

  // 5) MASTER tenta atribuir para SUPER_ADMIN → 400 (Mand. 04)
  it('5. Master tenta atribuir para SAdmin → 400 INVALID_OPERATION', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValueOnce({ id_usuario: CUID_USR_ALVO, id_organizacao: 'org_a', tipo_usuario: 'SUPER_ADMIN' })

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:dashboard:ver'] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_OPERATION')
    expect(res.body.error.message).toMatch(/SUPER_ADMIN/)
  })

  // 6) Anti-escalada — Master tenta editar próprias permissões → 403
  it('6. Master tenta editar próprias permissões → 403 EDICAO_PROPRIA_NAO_PERMITIDA', async () => {
    setAuth(ATOR_MASTER)

    const res = await request(app)
      .put(`/api/v1/usuarios/${ATOR_MASTER.id_usuario}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:dashboard:ver'] })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('EDICAO_PROPRIA_NAO_PERMITIDA')
  })

  // 7) PADRAO tenta usar a rota → 403 (requireUserManagementRole)
  it('7. PADRAO tenta usar a rota → 403 FORBIDDEN', async () => {
    setAuth(ATOR_PADRAO)

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:dashboard:ver'] })

    expect(res.status).toBe(403)
  })

  // 8) Body com string mal formatada → 400 VALIDATION_ERROR (Mand. 06 Zod)
  it('8. Body com string mal formatada → 400 VALIDATION_ERROR', async () => {
    setAuth(ATOR_MASTER)

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:foo:ver'] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  // 9) Body com permissoes duplicadas → 400 VALIDATION_ERROR (Zod refine)
  it('9. Body com permissoes duplicadas → 400 VALIDATION_ERROR', async () => {
    setAuth(ATOR_MASTER)

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({
        id_workspace: CUID_WS_OK,
        id_produto_gravity: CUID_PROD_PEDIDO,
        permissoes: ['pedido:dashboard:ver', 'pedido:dashboard:ver'],
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.message).toMatch(/duplicad/i)
  })

  // 10) Slug fora do Set PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS → 400
  it('10. Produto fora do Set → 400 PRODUCT_PERMISSIONS_NOT_IMPLEMENTED', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValueOnce({ id_usuario: CUID_USR_ALVO, id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
    mockWorkspaceFindFirst.mockResolvedValueOnce({ id_workspace: CUID_WS_OK })
    // Produto existe mas slug='simula-custo' não está no Set
    mockProdutoFindUnique.mockResolvedValueOnce({ slug_produto_gravity: 'simula-custo', status_produto_gravity: 'ATIVO' })

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({
        id_workspace: CUID_WS_OK,
        id_produto_gravity: CUID_PROD_OUTRO,
        permissoes: ['simula-custo:dashboard:ver'],
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('PRODUCT_PERMISSIONS_NOT_IMPLEMENTED')
  })

  // 11) Workspace de outra org no body (IDOR) → 403 WORKSPACE_FORA_DA_ORGANIZACAO
  it('11. Workspace de outra org no body → 403 WORKSPACE_FORA_DA_ORGANIZACAO', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValueOnce({ id_usuario: CUID_USR_ALVO, id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
    // workspace.findFirst filtra por id_organizacao do alvo → não encontra
    mockWorkspaceFindFirst.mockResolvedValueOnce(null)

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({ id_workspace: CUID_WS_OUTRA_ORG, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:dashboard:ver'] })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('WORKSPACE_FORA_DA_ORGANIZACAO')
  })

  // 12) Slug das strings ≠ slug do produto → 400 PERMISSION_SLUG_MISMATCH
  it('12. Slug das strings ≠ slug do produto → 400 PERMISSION_SLUG_MISMATCH', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValueOnce({ id_usuario: CUID_USR_ALVO, id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
    mockWorkspaceFindFirst.mockResolvedValueOnce({ id_workspace: CUID_WS_OK })
    // Route lookup: produto = 'pedido' (no Set, passa)
    mockProdutoFindUnique
      .mockResolvedValueOnce({ slug_produto_gravity: 'pedido', status_produto_gravity: 'ATIVO' })
    // Service lookup: produto = 'pedido' mas string carrega 'simula-custo'
      .mockResolvedValueOnce({ id_produto_gravity: CUID_PROD_PEDIDO, slug_produto_gravity: 'pedido' })

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({
        id_workspace: CUID_WS_OK,
        id_produto_gravity: CUID_PROD_PEDIDO,
        permissoes: ['simula-custo:dashboard:ver'], // slug bate o regex mas não bate o produto
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('PERMISSION_SLUG_MISMATCH')
  })

  // 13) permissoes: [] limpa todas — wipe atômico → 200
  it('13. permissoes: [] (vazio) → 200 com total_inseridas=0 e total_removidas=N', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValueOnce({ id_usuario: CUID_USR_ALVO, id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
    mockWorkspaceFindFirst.mockResolvedValueOnce({ id_workspace: CUID_WS_OK })
    mockProdutoFindUnique
      .mockResolvedValueOnce({ slug_produto_gravity: 'pedido', status_produto_gravity: 'ATIVO' })
      .mockResolvedValueOnce({ id_produto_gravity: CUID_PROD_PEDIDO, slug_produto_gravity: 'pedido' })
    mockUsuarioPermissaoDeleteMany.mockResolvedValueOnce({ count: 3 })

    const res = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: [] })

    expect(res.status).toBe(200)
    expect(res.body.total_inseridas).toBe(0)
    expect(res.body.total_removidas).toBe(3)
    // createMany NÃO chamado quando lista vazia
    expect(mockUsuarioPermissaoCreateMany).not.toHaveBeenCalled()
  })

  // 14) Idempotência — mesmo input duas vezes seguidas produz mesmo estado
  it('14. Idempotente — mesma chamada 2x produz mesmo estado final', async () => {
    setAuth(ATOR_MASTER)
    const setup = () => {
      mockUsuarioFindFirst.mockResolvedValueOnce({ id_usuario: CUID_USR_ALVO, id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
      mockWorkspaceFindFirst.mockResolvedValueOnce({ id_workspace: CUID_WS_OK })
      mockProdutoFindUnique
        .mockResolvedValueOnce({ slug_produto_gravity: 'pedido', status_produto_gravity: 'ATIVO' })
        .mockResolvedValueOnce({ id_produto_gravity: CUID_PROD_PEDIDO, slug_produto_gravity: 'pedido' })
    }

    setup()
    mockUsuarioPermissaoCreateMany.mockResolvedValueOnce({ count: 1 })
    const res1 = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:dashboard:ver'] })

    setup()
    mockUsuarioPermissaoDeleteMany.mockResolvedValueOnce({ count: 1 })
    mockUsuarioPermissaoCreateMany.mockResolvedValueOnce({ count: 1 })
    const res2 = await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:dashboard:ver'] })

    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    expect(res2.body.permissoes).toEqual(res1.body.permissoes)
  })

  // 15) Audit chamado com payload correto após sucesso
  it('15. securityAudit.permissionChanged é chamado com payload correto', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValueOnce({ id_usuario: CUID_USR_ALVO, id_organizacao: 'org_a', tipo_usuario: 'PADRAO' })
    mockWorkspaceFindFirst.mockResolvedValueOnce({ id_workspace: CUID_WS_OK })
    mockProdutoFindUnique
      .mockResolvedValueOnce({ slug_produto_gravity: 'pedido', status_produto_gravity: 'ATIVO' })
      .mockResolvedValueOnce({ id_produto_gravity: CUID_PROD_PEDIDO, slug_produto_gravity: 'pedido' })
    mockUsuarioPermissaoCreateMany.mockResolvedValueOnce({ count: 1 })

    await request(app)
      .put(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes`)
      .send({ id_workspace: CUID_WS_OK, id_produto_gravity: CUID_PROD_PEDIDO, permissoes: ['pedido:dashboard:ver'] })

    // Pode ser chamado de forma fire-and-forget (sem await na rota)
    await new Promise(resolve => setImmediate(resolve))

    expect(mockPermissionChanged).toHaveBeenCalledTimes(1)
    const [orgId, atorId, payload] = mockPermissionChanged.mock.calls[0]
    expect(orgId).toBe('org_a')
    expect(atorId).toBe(ATOR_MASTER.id_usuario)
    expect(payload.targetUserId).toBe(CUID_USR_ALVO)
    expect(payload.permission).toMatch(/^pedido:/)
    expect(['GRANTED', 'REVOKED']).toContain(payload.action)
  })
})

// ─── GET /:id_usuario/permissoes ─────────────────────────────────────────────

describe('GET /api/v1/usuarios/:id_usuario/permissoes', () => {
  // 16) GET filtra por id_workspace quando query passada
  it('16. GET com ?id_workspace=X filtra apenas permissões desse workspace', async () => {
    setAuth(ATOR_MASTER)
    mockUsuarioFindFirst.mockResolvedValueOnce({ id_organizacao: 'org_a' })
    mockUsuarioPermissaoFindMany.mockResolvedValueOnce([
      {
        id_organizacao: 'org_a',
        id_workspace: CUID_WS_OK,
        id_usuario: CUID_USR_ALVO,
        id_produto_gravity: CUID_PROD_PEDIDO,
        permissao_usuario: 'pedido:dashboard:ver',
        permissao_usuario_concedido_por: 'clerk_ma',
        data_criacao_permissao_usuario: new Date(),
      },
    ])

    const res = await request(app)
      .get(`/api/v1/usuarios/${CUID_USR_ALVO}/permissoes?id_workspace=${CUID_WS_OK}`)

    expect(res.status).toBe(200)
    expect(res.body.permissoes).toHaveLength(1)
    expect(res.body.permissoes[0].id_workspace).toBe(CUID_WS_OK)

    // Confirma que o filtro id_workspace foi aplicado na query do Prisma
    const callArgs = mockUsuarioPermissaoFindMany.mock.calls[0][0]
    expect(callArgs.where.id_workspace).toBe(CUID_WS_OK)
  })
})
