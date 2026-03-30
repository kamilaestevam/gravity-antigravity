// @vitest-environment node
/**
 * Testes unitarios — requireAuth do Configurador
 * Verifica que DEMO_MODE bypass foi removido e auth e sempre obrigatorio.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'

const { mockVerifyToken, mockFindFirst } = vi.hoisted(() => ({
  mockVerifyToken: vi.fn(),
  mockFindFirst: vi.fn(),
}))

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

import { requireAuth } from '../../../servicos-global/configurador/server/middleware/requireAuth.js'

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request
}

function makeRes(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
}

describe('requireAuth — sem bypass DEMO_MODE', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.DEMO_MODE
  })

  it('deve rejeitar requisicao sem header Authorization', async () => {
    const req = makeReq({})
    const res = makeRes()
    const next = vi.fn()

    await requireAuth(req, res, next)

    // next deve ser chamado com um erro (AppError)
    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err).toBeDefined()
    expect(err.statusCode).toBe(401)
    expect(err.message).toContain('Token de autenticação ausente')
  })

  it('deve rejeitar quando Authorization nao comeca com Bearer', async () => {
    const req = makeReq({ authorization: 'Basic abc123' })
    const res = makeRes()
    const next = vi.fn()

    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err).toBeDefined()
    expect(err.statusCode).toBe(401)
  })

  it('deve rejeitar quando DEMO_MODE=true mas nenhum token fornecido', async () => {
    process.env.DEMO_MODE = 'true'
    const req = makeReq({})
    const res = makeRes()
    const next = vi.fn()

    await requireAuth(req, res, next)

    // Mesmo com DEMO_MODE, deve rejeitar sem token
    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err).toBeDefined()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('deve rejeitar quando DEMO_MODE=true mas token invalido', async () => {
    process.env.DEMO_MODE = 'true'
    mockVerifyToken.mockRejectedValueOnce(new Error('Invalid token'))

    const req = makeReq({ authorization: 'Bearer invalid-token' })
    const res = makeRes()
    const next = vi.fn()

    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err).toBeDefined()
    expect(err.statusCode).toBe(401)
    expect(err.message).toContain('Token inválido ou expirado')
  })

  it('deve rejeitar quando token valido mas usuario nao encontrado no banco', async () => {
    mockVerifyToken.mockResolvedValueOnce({ sub: 'clerk_user_123' })
    mockFindFirst.mockResolvedValueOnce(null)

    const req = makeReq({ authorization: 'Bearer valid-token' })
    const res = makeRes()
    const next = vi.fn()

    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err).toBeDefined()
    expect(err.statusCode).toBe(401)
    expect(err.message).toContain('Usuário não encontrado')
  })

  it('deve injetar req.auth quando token valido e usuario encontrado', async () => {
    mockVerifyToken.mockResolvedValueOnce({ sub: 'clerk_user_123' })
    mockFindFirst.mockResolvedValueOnce({
      id: 'user-uuid-1',
      tenant_id: 'tenant-uuid-1',
    })

    const req = makeReq({ authorization: 'Bearer valid-token' })
    const res = makeRes()
    const next = vi.fn()

    await requireAuth(req, res, next)

    // next chamado sem erro (passagem bem-sucedida)
    expect(next).toHaveBeenCalledOnce()
    expect(next).toHaveBeenCalledWith()

    // req.auth deve estar populado
    expect(req.auth).toEqual({
      userId: 'user-uuid-1',
      tenantId: 'tenant-uuid-1',
      clerkUserId: 'clerk_user_123',
    })
  })

  it('deve rejeitar quando verifyToken retorna objeto sem sub', async () => {
    mockVerifyToken.mockResolvedValueOnce({})

    const req = makeReq({ authorization: 'Bearer token-without-sub' })
    const res = makeRes()
    const next = vi.fn()

    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const err = next.mock.calls[0][0]
    expect(err).toBeDefined()
    expect(err.statusCode).toBe(401)
    expect(err.message).toContain('Token inválido')
  })
})
