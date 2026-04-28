// TST-UNIT-GABI-AUTH-001 — gabi authMiddleware
// Cobre: x-user-name ausente → name = userId, presente → name = header,
// x-internal-key inválida → 401, x-id-organizacao ausente → 400.
/// <reference types="vitest/globals" />
import type { Request, Response, NextFunction } from 'express'

// ─── Mock do AppError (gabi usa sua própria implementação) ────────────────────
vi.mock('../../../servicos-global/tenant/gabi/server/lib/errors.js', () => ({
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode: number, code: string) {
      super(message)
      this.name = 'AppError'
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

import { authMiddleware } from '../../../servicos-global/tenant/gabi/server/middleware/auth.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────
type AuthRequest = Request & {
  auth?: { tenantId: string; userId: string; name: string }
}

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request
}

function getAuth(req: Request): Partial<{ tenantId: string; userId: string; name: string }> {
  return (req as AuthRequest).auth ?? {}
}

const mockRes = {} as Response

// ─── Testes ───────────────────────────────────────────────────────────────────
describe('gabi authMiddleware', () => {
  const VALID_KEY = 'test-internal-key'

  beforeEach(() => {
    process.env.INTERNAL_API_KEY = VALID_KEY
  })

  afterEach(() => {
    delete process.env.INTERNAL_API_KEY
  })

  // ── x-internal-key ────────────────────────────────────────────────────────
  it('rejeita com 401 quando x-internal-key está ausente', () => {
    const req  = makeReq({ 'x-id-organizacao': 'ten_001' })
    const next = vi.fn<Parameters<NextFunction>, void>()

    authMiddleware(req, mockRes, next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' })
    )
  })

  it('rejeita com 401 quando x-internal-key é inválida', () => {
    const req  = makeReq({ 'x-internal-key': 'chave-errada', 'x-id-organizacao': 'ten_001' })
    const next = vi.fn<Parameters<NextFunction>, void>()

    authMiddleware(req, mockRes, next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    )
  })

  // ── x-id-organizacao ───────────────────────────────────────────────────────────
  it('rejeita com 400 quando x-id-organizacao está ausente mesmo com chave válida', () => {
    const req  = makeReq({ 'x-internal-key': VALID_KEY })
    const next = vi.fn<Parameters<NextFunction>, void>()

    authMiddleware(req, mockRes, next as NextFunction)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: 'MISSING_TENANT_ID' })
    )
  })

  // ── x-user-name → req.auth.name ──────────────────────────────────────────
  it('define req.auth.name = userId quando x-user-name está ausente', () => {
    const req  = makeReq({
      'x-internal-key': VALID_KEY,
      'x-id-organizacao':    'ten_002',
      'x-id-usuario':      'usr_abc',
      // x-user-name ausente — deve usar userId como fallback
    })
    const next = vi.fn<Parameters<NextFunction>, void>()

    authMiddleware(req, mockRes, next as NextFunction)

    expect(next).toHaveBeenCalledWith()  // sem erro
    expect(getAuth(req).name).toBe('usr_abc')
  })

  it('define req.auth.name = header x-user-name quando presente', () => {
    const req  = makeReq({
      'x-internal-key': VALID_KEY,
      'x-id-organizacao':    'ten_003',
      'x-id-usuario':      'usr_xyz',
      'x-user-name':    'Carlos da Silva',
    })
    const next = vi.fn<Parameters<NextFunction>, void>()

    authMiddleware(req, mockRes, next as NextFunction)

    expect(next).toHaveBeenCalledWith()
    expect(getAuth(req).name).toBe('Carlos da Silva')
    expect(getAuth(req).userId).toBe('usr_xyz')
    expect(getAuth(req).tenantId).toBe('ten_003')
  })

  it('usa "system" como userId quando x-id-usuario está ausente', () => {
    const req  = makeReq({
      'x-internal-key': VALID_KEY,
      'x-id-organizacao':    'ten_004',
      // x-id-usuario ausente
    })
    const next = vi.fn<Parameters<NextFunction>, void>()

    authMiddleware(req, mockRes, next as NextFunction)

    expect(getAuth(req).userId).toBe('system')
    expect(getAuth(req).name).toBe('system')
  })
})
