// @vitest-environment node
/**
 * Testes funcionais — Cronometro auth middleware
 * Verifica fix de array headers e timingSafeEqual no requireInternalKey.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'

// Mock AppError
vi.mock('../../../servicos-global/tenant/cronometro/server/lib/errors.js', () => ({
  AppError: class AppError extends Error {
    statusCode: number
    static unauthorized(msg: string) { const e = new AppError(msg); e.statusCode = 401; return e }
    constructor(msg: string) { super(msg); this.statusCode = 500 }
  },
}))

import { requireAuth, requireInternalKey } from '../../../servicos-global/tenant/cronometro/server/middleware/auth.js'

function makeMocks(headers: Record<string, string | string[]> = {}) {
  const req = { headers } as unknown as Request
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  const next = vi.fn() as unknown as NextFunction
  return { req, res, next }
}

describe('Cronometro — requireAuth (fix array headers)', () => {
  it('deve extrair tenantId de x-tenant-id header', () => {
    const { req, res, next } = makeMocks({
      'x-tenant-id': 'tenant-123',
      'x-user-id': 'user-456',
    })

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect((req as any).auth.tenantId).toBe('tenant-123')
    expect((req as any).auth.userId).toBe('user-456')
  })

  it('deve usar x-clerk-org-id como fallback', () => {
    const { req, res, next } = makeMocks({
      'x-clerk-org-id': 'org-clerk',
      'x-clerk-user-id': 'user-clerk',
    })

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect((req as any).auth.tenantId).toBe('org-clerk')
  })

  it('deve lidar com header como array (fix #11)', () => {
    const { req, res, next } = makeMocks({
      'x-tenant-id': ['tenant-first', 'tenant-second'],
      'x-user-id': ['user-first', 'user-second'],
    })

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    // Deve usar o primeiro valor do array
    expect((req as any).auth.tenantId).toBe('tenant-first')
    expect((req as any).auth.userId).toBe('user-first')
  })

  it('deve rejeitar sem tenant_id', () => {
    const { req, res, next } = makeMocks({
      'x-user-id': 'user-1',
    })

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })

  it('deve rejeitar sem user_id', () => {
    const { req, res, next } = makeMocks({
      'x-tenant-id': 'tenant-1',
    })

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })
})

describe('Cronometro — requireInternalKey (fix timing-safe)', () => {
  const VALID_KEY = 'gravity-internal-key-123'

  beforeEach(() => {
    process.env.INTERNAL_API_KEY = VALID_KEY
  })

  afterEach(() => {
    delete process.env.INTERNAL_API_KEY
  })

  it('deve aceitar chave valida', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': VALID_KEY })
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    // next deve ser chamado sem argumentos (sem erro)
    expect((next as any).mock.calls[0]).toHaveLength(0)
  })

  it('deve rejeitar chave invalida', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': 'wrong-key' })
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })

  it('deve rejeitar sem header', () => {
    const { req, res, next } = makeMocks({})
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })

  it('deve rejeitar sem env var configurada', () => {
    delete process.env.INTERNAL_API_KEY
    const { req, res, next } = makeMocks({ 'x-internal-key': 'qualquer' })
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })

  it('deve lidar com header como array', () => {
    const { req, res, next } = makeMocks({
      'x-internal-key': [VALID_KEY, 'outro-valor'],
    })
    requireInternalKey(req, res, next)
    // Deve usar o primeiro valor e aceitar
    expect(next).toHaveBeenCalledOnce()
    expect((next as any).mock.calls[0]).toHaveLength(0)
  })
})
