// @vitest-environment node
/**
 * testes/testes-unitarios/servicos-tenant/tenant-server/auth.test.ts
 * Testes unitários do authMiddleware.
 *
 * Cobre:
 *   - Retorna 401 sem x-tenant-id
 *   - Injeta req.auth com tenantId e userId
 *   - userId padrão vazio quando x-user-id ausente
 *   - Chama next() quando autenticado
 */

import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { authMiddleware } from '../../../../servicos-global/tenant/middleware/auth.js'

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request
}

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res as unknown as Response
}

describe('authMiddleware', () => {
  it('retorna 401 quando x-tenant-id está ausente', () => {
    const req = makeReq({ 'x-user-id': 'user-1' })
    const res = makeRes()
    const next = vi.fn() as unknown as NextFunction

    authMiddleware(req, res, next)

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(401)
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'UNAUTHORIZED' }) })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('injeta req.auth corretamente quando ambos os headers presentes', () => {
    const req = makeReq({
      'x-tenant-id': 'tenant-abc',
      'x-user-id': 'user-xyz',
    })
    const res = makeRes()
    const next = vi.fn() as unknown as NextFunction

    authMiddleware(req, res, next)

    expect(req.auth).toEqual({ tenantId: 'tenant-abc', userId: 'user-xyz' })
    expect(next).toHaveBeenCalledOnce()
  })

  it('userId fica vazio quando x-user-id está ausente', () => {
    const req = makeReq({ 'x-tenant-id': 'tenant-123' })
    const res = makeRes()
    const next = vi.fn() as unknown as NextFunction

    authMiddleware(req, res, next)

    expect(req.auth).toEqual({ tenantId: 'tenant-123', userId: '' })
    expect(next).toHaveBeenCalledOnce()
  })

  it('não chama next() quando autenticação falha', () => {
    const req = makeReq()
    const res = makeRes()
    const next = vi.fn() as unknown as NextFunction

    authMiddleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
  })
})
