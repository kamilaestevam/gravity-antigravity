/**
 * Testes unitários — middleware requireAuth
 * Localização: testes/testes-unitarios/configurador/requireAuth.test.ts
 *
 * Valida:
 *  1. Rejeita request sem Authorization header → 401
 *  2. Rejeita token inválido (Clerk throws) → 401
 *  3. Rejeita quando Clerk retorna sub vazio → 401
 *  4. Rejeita quando usuário não existe no DB → 401
 *  5. Injeta req.auth corretamente após validação
 *  6. DEMO_MODE bypassa Clerk e usa primeiro admin do DB
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ── Mocks ── */

const mockVerifyToken = vi.fn()
const mockFindFirst = vi.fn()

vi.mock('../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: {
    verifyToken: mockVerifyToken,
  },
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    user: {
      findFirst: mockFindFirst,
    },
  },
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

/* ── Helpers ── */

function createMockReqRes(authHeader?: string) {
  const req: any = {
    headers: authHeader ? { authorization: authHeader } : {},
    path: '/test',
  }
  const res: any = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
  }
  const next = vi.fn()
  return { req, res, next }
}

/* ── Testes ── */

describe('requireAuth middleware', () => {
  let requireAuth: (req: any, res: any, next: any) => Promise<void>

  beforeEach(async () => {
    vi.clearAllMocks()
    delete process.env.DEMO_MODE

    const mod = await import(
      '../../../servicos-global/configurador/server/middleware/requireAuth.js'
    )
    requireAuth = mod.requireAuth
  })

  it('rejeita request sem Authorization header', async () => {
    const { req, res, next } = createMockReqRes()
    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err).toBeDefined()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('rejeita token inválido quando Clerk throws', async () => {
    mockVerifyToken.mockRejectedValue(new Error('Invalid token'))

    const { req, res, next } = createMockReqRes('Bearer invalid-token')
    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(401)
  })

  it('rejeita quando Clerk retorna sub vazio', async () => {
    mockVerifyToken.mockResolvedValue({ sub: '' })

    const { req, res, next } = createMockReqRes('Bearer valid-but-empty-sub')
    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(401)
  })

  it('rejeita quando usuário não existe no DB', async () => {
    mockVerifyToken.mockResolvedValue({ sub: 'clerk-user-123' })
    mockFindFirst.mockResolvedValue(null)

    const { req, res, next } = createMockReqRes('Bearer valid-token')
    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err.statusCode).toBe(401)
    expect(err.message).toContain('não encontrado')
  })

  it('injeta req.auth corretamente após validação bem-sucedida', async () => {
    mockVerifyToken.mockResolvedValue({ sub: 'clerk-user-123' })
    mockFindFirst.mockResolvedValue({
      id: 'user-internal-id',
      tenant_id: 'tenant-abc',
    })

    const { req, res, next } = createMockReqRes('Bearer valid-token')
    await requireAuth(req, res, next)

    // next() deve ter sido chamado sem erro
    expect(next).toHaveBeenCalledOnce()
    expect(next.mock.calls[0][0]).toBeUndefined()

    // req.auth deve estar populado
    expect(req.auth).toBeDefined()
    expect(req.auth.userId).toBe('user-internal-id')
    expect(req.auth.tenantId).toBe('tenant-abc')
    expect(req.auth.clerkUserId).toBe('clerk-user-123')
  })

  it('DEMO_MODE bypassa Clerk e usa primeiro admin do DB', async () => {
    process.env.DEMO_MODE = 'true'

    mockFindFirst.mockResolvedValue({
      id: 'demo-admin',
      tenant_id: 'tenant-demo',
      clerk_user_id: 'clerk-demo',
    })

    const { req, res, next } = createMockReqRes() // sem Bearer
    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(next.mock.calls[0][0]).toBeUndefined()
    expect(req.auth.userId).toBe('demo-admin')
    expect(req.auth.tenantId).toBe('tenant-demo')

    // Clerk NÃO deve ter sido chamado
    expect(mockVerifyToken).not.toHaveBeenCalled()
  })

  it('DEMO_MODE não bypassa quando Bearer token está presente', async () => {
    process.env.DEMO_MODE = 'true'

    mockVerifyToken.mockResolvedValue({ sub: 'clerk-real' })
    mockFindFirst.mockResolvedValue({
      id: 'real-user',
      tenant_id: 'tenant-real',
    })

    const { req, res, next } = createMockReqRes('Bearer real-token')
    await requireAuth(req, res, next)

    // Deve usar Clerk mesmo em DEMO_MODE quando token está presente
    expect(mockVerifyToken).toHaveBeenCalledWith('real-token')
  })
})
