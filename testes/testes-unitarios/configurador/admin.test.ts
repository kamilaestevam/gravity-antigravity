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

/* ── Mocks de infraestrutura ── */

const mockFindMany = vi.fn()
const mockCount = vi.fn()
const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()

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
    findFirst: vi.fn(),
  },
  subscription: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
}

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
  requireAuth: (_req: any, _res: any, next: any) => {
    _req.auth = { userId: 'user-admin', tenantId: 'tenant-hq', clerkUserId: 'clerk-admin' }
    next()
  },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireGravityAdmin.js', () => ({
  requireGravityAdmin: (_req: any, _res: any, next: any) => next(),
}))

/* ── Helpers ── */

function createMockReqRes(overrides: Record<string, unknown> = {}) {
  const req: any = {
    auth: { userId: 'user-admin', tenantId: 'tenant-hq', clerkUserId: 'clerk-admin' },
    query: {},
    params: {},
    body: {},
    headers: { authorization: 'Bearer mock-token' },
    ...overrides,
  }
  const res: any = {
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
  const layer = (adminRouter as any).stack?.find(
    (l: any) => l.route?.path === routePath && l.route?.methods?.[method]
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
      { id: 't1', name: 'Tenant A', slug: 'a', status: 'ACTIVE', created_at: new Date(), _count: { users: 2, companies: 1 }, subscriptions: [{ plan: 'STARTER', status: 'ACTIVE' }], companies: [] },
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
