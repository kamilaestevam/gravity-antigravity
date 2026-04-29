// TST-FUNC-CONF-AUTH-001 — requireAuth middleware
// Cobre: cache hit (com nome), cache miss, fallback por email (único/múltiplo),
// token inválido e propagação de req.auth.
/// <reference types="vitest/globals" />
import type { Request, Response, NextFunction } from 'express'

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockVerifyToken,
  mockGetUser,
  mockFindFirst,
  mockFindMany,
  mockUpdate,
  mockAuditLog,
} = vi.hoisted(() => ({
  mockVerifyToken: vi.fn(),
  mockGetUser:     vi.fn(),
  mockFindFirst:   vi.fn(),
  mockFindMany:    vi.fn(),
  mockUpdate:      vi.fn(),
  mockAuditLog:    vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: {
    verifyToken:  mockVerifyToken,
    users: { getUser: mockGetUser },
  },
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario: {
      findFirst: mockFindFirst,
      findMany:  mockFindMany,
      update:    mockUpdate,
    },
  },
}))

vi.mock('../../../servicos-global/organizacao/historico-global/src/audit-client.js', () => ({
  auditLog: mockAuditLog,
}))

import { requireAuth } from '../../../servicos-global/configurador/server/middleware/requireAuth.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────
let clerkIdCounter = 0
function freshClerkId() { return `clerk_test_${++clerkIdCounter}` }

function makeReq(headers: Record<string, string> = {}): Request {
  return {
    headers,
    ip: '127.0.0.1',
    url: '/api/test',
    originalUrl: '/api/test',
    method: 'GET',
  } as unknown as Request
}

const mockRes = {} as Response

// ─── Testes ───────────────────────────────────────────────────────────────────
describe('requireAuth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Token inválido ────────────────────────────────────────────────────────
  it('retorna 401 quando Authorization header está ausente', async () => {
    const req  = makeReq()
    const next = vi.fn<[unknown?], void>()

    await requireAuth(req, mockRes, next as unknown as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('ausente'), statusCode: 401 })
    )
  })

  it('retorna 401 quando token é inválido/expirado', async () => {
    mockVerifyToken.mockRejectedValue(new Error('token invalid'))
    const req  = makeReq({ authorization: 'Bearer bad-token' })
    const next = vi.fn<[unknown?], void>()

    await requireAuth(req, mockRes, next as unknown as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    )
    expect(mockFindFirst).not.toHaveBeenCalled()
  })

  // ── Cache miss → banco ────────────────────────────────────────────────────
  it('popula req.auth com dados do banco em cache miss', async () => {
    const clerkId = freshClerkId()
    mockVerifyToken.mockResolvedValue({ sub: clerkId })
    mockFindFirst.mockResolvedValue({
      id: 'usr_dbmiss', tenant_id: 'ten_001', role: 'MASTER', name: 'João Banco',
    })

    const req  = makeReq({ authorization: 'Bearer fresh-token' })
    const next = vi.fn<[unknown?], void>()

    await requireAuth(req, mockRes, next as unknown as NextFunction)

    expect(next).toHaveBeenCalledWith()
    expect((req as Request & { auth: { name: string; role: string } }).auth).toMatchObject({
      userId:      'usr_dbmiss',
      tenantId:    'ten_001',
      role:        'MASTER',
      name:        'João Banco',
      clerkUserId: clerkId,
    })
  })

  // ── Cache hit → nome correto ──────────────────────────────────────────────
  it('retorna nome correto em cache hit (findFirst não é chamado novamente)', async () => {
    const clerkId = freshClerkId()
    mockVerifyToken.mockResolvedValue({ sub: clerkId })
    mockFindFirst.mockResolvedValue({
      id: 'usr_cached', tenant_id: 'ten_002', role: 'STANDARD', name: 'Ana Cached',
    })

    const req1 = makeReq({ authorization: 'Bearer cache-test-token' })
    const req2 = makeReq({ authorization: 'Bearer cache-test-token' })
    const next  = vi.fn<[unknown?], void>()

    // Primeira chamada — popula cache
    await requireAuth(req1, mockRes, next as unknown as NextFunction)
    expect(mockFindFirst).toHaveBeenCalledTimes(1)

    // Segunda chamada — cache hit
    await requireAuth(req2, mockRes, vi.fn() as unknown as NextFunction)
    expect(mockFindFirst).toHaveBeenCalledTimes(1)  // não chamou de novo

    const auth2 = (req2 as Request & { auth: { name: string } }).auth
    expect(auth2.name).toBe('Ana Cached')
  })

  it('name é string vazia quando banco retorna null para o campo name', async () => {
    const clerkId = freshClerkId()
    mockVerifyToken.mockResolvedValue({ sub: clerkId })
    mockFindFirst.mockResolvedValue({
      id: 'usr_noname', tenant_id: 'ten_003', role: 'STANDARD', name: null,
    })

    const req  = makeReq({ authorization: 'Bearer noname-token' })
    const next = vi.fn<[unknown?], void>()
    await requireAuth(req, mockRes, next as unknown as NextFunction)

    const auth = (req as Request & { auth: { name: string } }).auth
    expect(auth.name).toBe('')
  })

  // ── Fallback por email ────────────────────────────────────────────────────
  it('aceita fallback por email quando há exatamente um usuário com o email', async () => {
    const clerkId = freshClerkId()
    mockVerifyToken.mockResolvedValue({ sub: clerkId })
    mockFindFirst.mockResolvedValue(null)   // não encontrado por clerkId
    mockGetUser.mockResolvedValue({
      emailAddresses: [{ id: 'ea_001', emailAddress: 'novo@example.com' }],
      primaryEmailAddressId: 'ea_001',
    })
    mockFindMany.mockResolvedValue([
      { id: 'usr_email_fallback', tenant_id: 'ten_004', role: 'MASTER', name: 'Via Email' },
    ])
    mockUpdate.mockResolvedValue({})

    const req  = makeReq({ authorization: 'Bearer email-fallback-token' })
    const next = vi.fn<[unknown?], void>()
    await requireAuth(req, mockRes, next as unknown as NextFunction)

    expect(next).toHaveBeenCalledWith()
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'usr_email_fallback' } })
    )
    const auth = (req as Request & { auth: { userId: string } }).auth
    expect(auth.userId).toBe('usr_email_fallback')
  })

  it('rejeita fallback por email quando há múltiplos usuários com o mesmo email → 401', async () => {
    const clerkId = freshClerkId()
    mockVerifyToken.mockResolvedValue({ sub: clerkId })
    mockFindFirst.mockResolvedValue(null)
    mockGetUser.mockResolvedValue({
      emailAddresses: [{ id: 'ea_002', emailAddress: 'dup@example.com' }],
      primaryEmailAddressId: 'ea_002',
    })
    mockFindMany.mockResolvedValue([
      { id: 'usr_dup_1', tenant_id: 'ten_a', role: 'STANDARD', name: 'User A' },
      { id: 'usr_dup_2', tenant_id: 'ten_b', role: 'STANDARD', name: 'User B' },
    ])

    const req  = makeReq({ authorization: 'Bearer dup-email-token' })
    const next = vi.fn<[unknown?], void>()
    await requireAuth(req, mockRes, next as unknown as NextFunction)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
