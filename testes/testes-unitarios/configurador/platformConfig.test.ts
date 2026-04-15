/**
 * Testes unitários — rotas platform-config do configurador
 * Localização: testes/testes-unitarios/configurador/platformConfig.test.ts
 *
 * Valida:
 *  1. GET /api/admin/platform-config retorna config do tenant HQ
 *  2. GET /api/admin/platform-config retorna null quando usuário não existe
 *  3. GET /api/admin/platform-config retorna null quando tenant não existe
 *  4. GET /api/admin/platform-config inclui campos opcionais (segment, tipo_empresa)
 *  5. GET /api/admin/platform-config funciona mesmo se campos opcionais não existirem
 *  6. PUT /api/admin/platform-config atualiza dados com body válido
 *  7. PUT /api/admin/platform-config rejeita body inválido (VALIDATION_ERROR)
 *  8. PUT /api/admin/platform-config retorna NOT_FOUND quando usuário não existe
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

const mockUserFindFirst = vi.fn()
const mockTenantFindUnique = vi.fn()
const mockTenantUpdate = vi.fn()

const mockPrisma = {
  tenant: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: mockTenantFindUnique,
    update: mockTenantUpdate,
  },
  user: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    findFirst: mockUserFindFirst,
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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
  requireAuth: (_req: Request, _res: Response, next: NextFunction) => {
    ;(_req as MockReq).auth = {
      userId: 'user-admin',
      tenantId: 'tenant-hq',
      clerkUserId: 'clerk-admin',
      role: 'SUPER_ADMIN',
    }
    next()
  },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireGravityAdmin.js', () => ({
  requireGravityAdmin: (_req: Request, _res: Response, next: NextFunction) => next(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { users: { updateUserMetadata: vi.fn(), createUser: vi.fn() }, invitations: { createInvitation: vi.fn() } },
}))

vi.mock('../../../servicos-global/configurador/server/utils/playwright-parser.js', () => ({
  walkSuite: vi.fn().mockReturnValue([]),
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

const tenantCore = {
  id: 'tenant-hq',
  name: 'DMM-IE',
  slug: 'dmm-ie',
  cnpj: '12.345.678/0001-99',
  state: 'SP',
  city: 'São Paulo',
  created_at: new Date('2026-01-04'),
}

/* ── GET /platform-config ── */

describe('Admin Routes — GET /platform-config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna config do tenant HQ quando usuário e tenant existem', async () => {
    mockUserFindFirst.mockResolvedValue({ tenant_id: 'tenant-hq' })
    mockTenantFindUnique
      .mockResolvedValueOnce(tenantCore)
      .mockResolvedValueOnce({ segment: 'SaaS', tipo_empresa: 'Importador' })

    const handler = await getHandler('/platform-config')
    expect(handler).toBeDefined()

    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    const { config } = res.json.mock.calls[0][0]
    expect(config).not.toBeNull()
    expect(config.name).toBe('DMM-IE')
    expect(config.slug).toBe('dmm-ie')
    expect(config.cnpj).toBe('12.345.678/0001-99')
    expect(config.state).toBe('SP')
    expect(config.city).toBe('São Paulo')
  })

  it('inclui segment e tipo_empresa quando campos opcionais existem', async () => {
    mockUserFindFirst.mockResolvedValue({ tenant_id: 'tenant-hq' })
    mockTenantFindUnique
      .mockResolvedValueOnce(tenantCore)
      .mockResolvedValueOnce({ segment: 'Plataforma B2B', tipo_empresa: 'Trading' })

    const handler = await getHandler('/platform-config')
    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    const { config } = res.json.mock.calls[0][0]
    expect(config.segment).toBe('Plataforma B2B')
    expect(config.tipo_empresa).toBe('Trading')
  })

  it('retorna config sem extras quando campos opcionais ainda não foram migrados', async () => {
    mockUserFindFirst.mockResolvedValue({ tenant_id: 'tenant-hq' })
    mockTenantFindUnique
      .mockResolvedValueOnce(tenantCore)
      .mockRejectedValueOnce(new Error('column does not exist'))

    const handler = await getHandler('/platform-config')
    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    const { config } = res.json.mock.calls[0][0]
    expect(config).not.toBeNull()
    expect(config.name).toBe('DMM-IE')
    expect(config.segment).toBeUndefined()
  })

  it('retorna { config: null } quando usuário não existe no banco', async () => {
    mockUserFindFirst.mockResolvedValue(null)

    const handler = await getHandler('/platform-config')
    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledWith({ config: null })
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna { config: null } quando tenant não existe no banco', async () => {
    mockUserFindFirst.mockResolvedValue({ tenant_id: 'tenant-hq' })
    mockTenantFindUnique.mockResolvedValueOnce(null)

    const handler = await getHandler('/platform-config')
    const { req, res, next } = createMockReqRes()
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledWith({ config: null })
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna { config: null } quando clerkUserId está ausente no auth', async () => {
    const handler = await getHandler('/platform-config')
    const { req, res, next } = createMockReqRes()
    ;(req as MockReq).auth = { ...req.auth, clerkUserId: '' }
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledWith({ config: null })
    expect(mockUserFindFirst).not.toHaveBeenCalled()
  })
})

/* ── PUT /platform-config ── */

describe('Admin Routes — PUT /platform-config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza dados da plataforma com body válido', async () => {
    mockUserFindFirst.mockResolvedValue({ tenant_id: 'tenant-hq' })
    const updatedTenant = {
      ...tenantCore,
      name: 'DMM-IE Atualizado',
      segment: 'Cloud Infrastructure',
      tipo_empresa: 'Importador e Exportador',
    }
    mockTenantUpdate.mockResolvedValue(updatedTenant)

    const handler = await getHandler('/platform-config', 'put')
    expect(handler).toBeDefined()

    const { req, res, next } = createMockReqRes({
      body: {
        name: 'DMM-IE Atualizado',
        cnpj: '12.345.678/0001-99',
        state: 'SP',
        city: 'São Paulo',
        segment: 'Cloud Infrastructure',
        tipo_empresa: 'Importador e Exportador',
      },
    })
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    const { config } = res.json.mock.calls[0][0]
    expect(config.name).toBe('DMM-IE Atualizado')
    expect(config.segment).toBe('Cloud Infrastructure')
    expect(mockTenantUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'tenant-hq' },
        data: expect.objectContaining({ name: 'DMM-IE Atualizado' }),
      })
    )
  })

  it('aceita update parcial (apenas campos informados)', async () => {
    mockUserFindFirst.mockResolvedValue({ tenant_id: 'tenant-hq' })
    mockTenantUpdate.mockResolvedValue({ ...tenantCore, cnpj: '99.999.999/0001-00' })

    const handler = await getHandler('/platform-config', 'put')
    const { req, res, next } = createMockReqRes({ body: { cnpj: '99.999.999/0001-00' } })
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledOnce()
    expect(next).not.toHaveBeenCalled()
  })

  it('rejeita body com name vazio (Zod min 1)', async () => {
    const handler = await getHandler('/platform-config', 'put')
    const { req, res, next } = createMockReqRes({ body: { name: '' } })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(mockTenantUpdate).not.toHaveBeenCalled()
  })

  it('rejeita state com mais de 2 caracteres (Zod max 2)', async () => {
    const handler = await getHandler('/platform-config', 'put')
    const { req, res, next } = createMockReqRes({ body: { state: 'SAO' } })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
  })

  it('retorna NOT_FOUND quando usuário não existe no banco', async () => {
    mockUserFindFirst.mockResolvedValue(null)

    const handler = await getHandler('/platform-config', 'put')
    const { req, res, next } = createMockReqRes({ body: { name: 'Novo Nome' } })
    await handler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(mockTenantUpdate).not.toHaveBeenCalled()
  })
})
