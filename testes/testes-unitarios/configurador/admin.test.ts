/**
 * Testes unitários — rotas admin do configurador
 * Localização: testes/testes-unitarios/configurador/admin.test.ts
 *
 * Valida:
 *  1. GET /api/admin/tenants retorna lista paginada
 *  2. GET /api/admin/tenants/:id retorna 404 para tenant inexistente
 *  3. PATCH /api/admin/tenants/:id valida schema Zod
 *  4. GET /api/admin/stats retorna contadores
 *  5. GET /api/admin/users retorna lista paginada
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'

interface RouterLayer {
  route?: {
    path?: string
    methods?: Record<string, boolean>
    stack?: { handle: (...args: unknown[]) => unknown }[]
  }
}

interface MockReq {
  auth: { userId: string; tenantId: string; clerkUserId: string; role: string }
  query: Record<string, string>
  params: Record<string, string>
  body: Record<string, unknown>
  headers: Record<string, string>
}

interface MockRes {
  json: ReturnType<typeof vi.fn>
  status: ReturnType<typeof vi.fn>
}

/* ── Mocks de infraestrutura ── */

const mockFindMany = vi.fn()
const mockCount = vi.fn()
const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()
const mockUserFindUnique = vi.fn()
const mockUserFindFirst = vi.fn()
const mockUserUpdate = vi.fn()
const mockUserCreate = vi.fn()
const mockClerkUpdateMetadata = vi.fn()
const mockClerkCreateInvitation = vi.fn()

const mockPrisma = {
  tenant: {
    findMany: mockFindMany,
    count: mockCount,
    findUnique: mockFindUnique,
    update: mockUpdate,
  },
  user: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    findFirst: mockUserFindFirst,
    findUnique: mockUserFindUnique,
    update: mockUserUpdate,
    create: mockUserCreate,
  },
  subscription: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
}

vi.mock('../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: {
    users: { updateUserMetadata: mockClerkUpdateMetadata },
    invitations: { createInvitation: mockClerkCreateInvitation },
  },
}))

vi.mock('../../../servicos-global/configurador/server/utils/playwright-parser.js', () => ({
  walkSuite: vi.fn().mockReturnValue([]),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: mockPrisma,
}))

vi.mock('../../../servicos-global/configurador/server/lib/appError.js', async () => {
  class AppError extends Error {
    public readonly statusCode: number
    public readonly code: string
    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
      super(message)
      this.name = 'AppError'
      this.statusCode = statusCode
      this.code = code
    }
  }
  return { AppError }
})

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (_req: Request, _res: Response, next: NextFunction) => {
    (_req as MockReq).auth = { userId: 'user-admin', tenantId: 'tenant-hq', clerkUserId: 'clerk-admin' }
    next()
  },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireGravityAdmin.js', () => ({
  requireGravityAdmin: (_req: Request, _res: Response, next: NextFunction) => next(),
}))

/* ── Helpers ── */

function createMockReqRes(overrides: Record<string, unknown> = {}) {
  const req: MockReq = {
    auth: { userId: 'user-admin', tenantId: 'tenant-hq', clerkUserId: 'clerk-admin', role: 'SUPER_ADMIN' },
    query: {},
    params: {},
    body: {},
    headers: { authorization: 'Bearer mock-token' },
    ...overrides,
  } as MockReq
  const res: MockRes = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
  }
  const next = vi.fn()
  return { req, res, next }
}

async function getHandler(routePath: string, method = 'get') {
  const { adminRouter } = await import(
    '../../../servicos-global/configurador/server/routes/admin.js'
  )
  const layer = (adminRouter as unknown as { stack: RouterLayer[] }).stack?.find(
    (l) => l.route?.path === routePath && l.route?.methods?.[method]
  )
  return layer?.route?.stack?.at(-1)?.handle
}

/* ── Testes ── */

describe('Admin Routes — GET /tenants', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna lista de tenants com paginação', async () => {
    const tenants = [
      { id: 't1', name: 'Tenant A', slug: 'a', status: 'ACTIVE', created_at: new Date(), _count: { users: 2, companies: 1 }, subscriptions: [{ status: 'ACTIVE' }], companies: [] },
    ]
    mockFindMany.mockResolvedValue(tenants)
    mockCount.mockResolvedValue(1)

    const handler = await getHandler('/tenants')
    expect(handler).toBeDefined()

    const { req, res, next } = createMockReqRes({ query: { page: '1', limit: '20' } })
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    const data = res.json.mock.calls[0][0]
    expect(data.tenants).toHaveLength(1)
    expect(data.pagination).toBeDefined()
    expect(data.pagination.total).toBe(1)
  })

  it('aplica filtro de busca quando search é fornecido', async () => {
    mockFindMany.mockResolvedValue([])
    mockCount.mockResolvedValue(0)

    const handler = await getHandler('/tenants')
    const { req, res, next } = createMockReqRes({ query: { search: 'dmm' } })
    await handler(req, res, next)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: 'dmm' }) }),
          ]),
        }),
      })
    )
  })
})

describe('Admin Routes — GET /tenants/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 404 via next(err) quando tenant não existe', async () => {
    mockFindUnique.mockResolvedValue(null)

    const handler = await getHandler('/tenants/:id')
    const { req, res, next } = createMockReqRes({ params: { id: 'nao-existe' } })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err).toBeDefined()
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
  })

  it('retorna tenant com detalhes quando existe', async () => {
    const tenant = {
      id: 't1', name: 'Tenant A', slug: 'a', status: 'ACTIVE',
      users: [{ id: 'u1', name: 'User', email: 'u@t.com', role: 'MASTER', created_at: new Date() }],
      companies: [], subscriptions: [], product_configs: [],
    }
    mockFindUnique.mockResolvedValue(tenant)

    const handler = await getHandler('/tenants/:id')
    const { req, res, next } = createMockReqRes({ params: { id: 't1' } })
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    expect(res.json.mock.calls[0][0].tenant.id).toBe('t1')
  })
})

describe('Admin Routes — PATCH /tenants/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejeita body inválido com VALIDATION_ERROR', async () => {
    const handler = await getHandler('/tenants/:id', 'patch')
    const { req, res, next } = createMockReqRes({
      params: { id: 't1' },
      body: { status: 'INVALID_STATUS' },
    })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 404 quando tenant não existe no PATCH', async () => {
    mockFindUnique.mockResolvedValue(null)

    const handler = await getHandler('/tenants/:id', 'patch')
    const { req, res, next } = createMockReqRes({
      params: { id: 'nao-existe' },
      body: { status: 'SUSPENDED' },
    })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(404)
  })

  it('atualiza status do tenant com sucesso', async () => {
    mockFindUnique.mockResolvedValue({ id: 't1', name: 'A', status: 'ACTIVE' })
    mockUpdate.mockResolvedValue({ id: 't1', name: 'A', status: 'SUSPENDED' })

    const handler = await getHandler('/tenants/:id', 'patch')
    const { req, res, next } = createMockReqRes({
      params: { id: 't1' },
      body: { status: 'SUSPENDED' },
    })
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
        data: expect.objectContaining({ status: 'SUSPENDED' }),
      })
    )
  })
})

describe('Admin Routes — GET /stats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna contadores da plataforma', async () => {
    mockCount
      .mockResolvedValueOnce(10) // totalTenants
      .mockResolvedValueOnce(8)  // activeTenants
      .mockResolvedValueOnce(1)  // suspendedTenants
    mockPrisma.user.count.mockResolvedValue(25)

    const handler = await getHandler('/stats')
    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    const { stats } = res.json.mock.calls[0][0]
    expect(stats.totalTenants).toBe(10)
    expect(stats.activeTenants).toBe(8)
    expect(stats.suspendedTenants).toBe(1)
    expect(stats.totalUsers).toBe(25)
  })
})

/* ── Segurança — brechas críticas corrigidas ── */

describe('Admin Routes — Segurança — PATCH /tenants/:id bloqueia tenant HQ', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejeita com FORBIDDEN quando admin tenta alterar o próprio tenant HQ', async () => {
    const handler = await getHandler('/tenants/:id', 'patch')
    const { req, res, next } = createMockReqRes({
      params: { id: 'tenant-hq' }, // mesmo que req.auth.tenantId do mock
      body: { status: 'SUSPENDED' },
    })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('permite alterar status de outro tenant (não-HQ)', async () => {
    mockFindUnique.mockResolvedValue({ id: 'outro-tenant', name: 'Outro', status: 'ACTIVE' })
    mockUpdate.mockResolvedValue({ id: 'outro-tenant', name: 'Outro', status: 'SUSPENDED' })

    const handler = await getHandler('/tenants/:id', 'patch')
    const { req, res, next } = createMockReqRes({
      params: { id: 'outro-tenant' },
      body: { status: 'SUSPENDED' },
    })
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    expect(mockUpdate).toHaveBeenCalled()
  })
})

describe('Admin Routes — Segurança — POST /users/:userId/promote isola por tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejeita com NOT_FOUND quando usuário-alvo pertence a outro tenant', async () => {
    mockUserFindUnique.mockResolvedValue({
      id: 'user-b',
      email: 'user@b.com',
      role: 'MASTER',
      clerk_user_id: 'clerk-b',
      tenant_id: 'tenant-B', // ≠ tenant-hq do req.auth
    })

    const handler = await getHandler('/users/:userId/promote', 'post')
    const { req, res, next } = createMockReqRes({
      params: { userId: 'user-b' },
      body: { role: 'ADMIN' },
    })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('promove usuário do mesmo tenant com sucesso', async () => {
    mockUserFindUnique.mockResolvedValue({
      id: 'user-a',
      email: 'user@a.com',
      role: 'MASTER',
      clerk_user_id: 'clerk-a',
      tenant_id: 'tenant-hq', // igual ao req.auth.tenantId
    })
    mockUserUpdate.mockResolvedValue({ id: 'user-a', email: 'user@a.com', role: 'ADMIN' })
    mockClerkUpdateMetadata.mockResolvedValue({})

    const handler = await getHandler('/users/:userId/promote', 'post')
    const { req, res, next } = createMockReqRes({
      params: { userId: 'user-a' },
      body: { role: 'ADMIN' },
    })
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: 'ADMIN' } })
    )
  })

  it('rejeita com FORBIDDEN quando req.auth.role não é SUPER_ADMIN', async () => {
    const handler = await getHandler('/users/:userId/promote', 'post')
    const { req, res, next } = createMockReqRes({
      params: { userId: 'user-a' },
      body: { role: 'ADMIN' },
    })
    // Sobrescreve role do mock
    ;(req as unknown as { auth: { role: string } }).auth.role = 'ADMIN'
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })
})

describe('Admin Routes — Segurança — POST /users/invite filtra por tenant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('busca duplicidade de email apenas no tenant do admin logado', async () => {
    mockUserFindFirst.mockResolvedValue(null)
    mockClerkCreateInvitation.mockResolvedValue({ id: 'invite-123' })
    mockUserCreate.mockResolvedValue({
      id: 'user-novo',
      email: 'novo@empresa.com',
      role: 'MASTER',
    })

    const handler = await getHandler('/users/invite', 'post')
    const { req, res, next } = createMockReqRes({
      body: { email: 'novo@empresa.com', name: 'Novo User', role: 'MASTER' },
    })
    await handler(req, res, next)

    expect(mockUserFindFirst).toHaveBeenCalledWith({
      where: { email: 'novo@empresa.com', tenant_id: 'tenant-hq' },
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('permite email duplicado em tenant diferente (não é CONFLICT)', async () => {
    // Usuário existe em outro tenant — findFirst com filtro tenant_id retorna null
    mockUserFindFirst.mockResolvedValue(null)
    mockClerkCreateInvitation.mockResolvedValue({ id: 'invite-456' })
    mockUserCreate.mockResolvedValue({
      id: 'user-novo',
      email: 'user@existe-em-outro.com',
      role: 'STANDARD',
    })

    const handler = await getHandler('/users/invite', 'post')
    const { req, res, next } = createMockReqRes({
      body: { email: 'user@existe-em-outro.com', name: 'Novo', role: 'STANDARD' },
    })
    await handler(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(mockUserCreate).toHaveBeenCalled()
  })

  it('rejeita com CONFLICT quando email já existe no mesmo tenant', async () => {
    mockUserFindFirst.mockResolvedValue({ id: 'existente', email: 'dup@hq.com' })

    const handler = await getHandler('/users/invite', 'post')
    const { req, res, next } = createMockReqRes({
      body: { email: 'dup@hq.com', name: 'Dup', role: 'STANDARD' },
    })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe('CONFLICT')
    expect(mockUserCreate).not.toHaveBeenCalled()
  })

  it('bloqueia ADMIN de criar SUPER_ADMIN', async () => {
    const handler = await getHandler('/users/invite', 'post')
    const { req, res, next } = createMockReqRes({
      body: { email: 'novo@hq.com', name: 'Novo', role: 'SUPER_ADMIN' },
    })
    ;(req as unknown as { auth: { role: string } }).auth.role = 'ADMIN'
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
    expect(mockUserCreate).not.toHaveBeenCalled()
  })
})

/* ── POST /run-tests com Zod ── */

describe('Admin Routes — POST /run-tests validação Zod', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejeita body com modulos não-array (VALIDATION_ERROR)', async () => {
    const handler = await getHandler('/run-tests', 'post')
    const { req, res, next } = createMockReqRes({ body: { modulos: 'nao-array' } })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
  })

  it('rejeita body com planos contendo strings acima de 100 caracteres', async () => {
    const handler = await getHandler('/run-tests', 'post')
    const { req, res, next } = createMockReqRes({
      body: { planos: ['x'.repeat(101)] },
    })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
  })
})
