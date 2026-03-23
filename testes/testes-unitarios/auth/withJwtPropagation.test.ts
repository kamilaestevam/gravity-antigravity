// @vitest-environment node
// testes/testes-unitarios/auth/withJwtPropagation.test.ts
// AGENTE AUTH FLOW — ONDA 4
// Testes unitários para o middleware withJwtPropagation

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import {
  withJwtPropagation,
  getForwardedAuthHeader,
} from '../../../servicos-global/tenant/middleware/withJwtPropagation.js'

// ---------------------------------------------------------------------------
// Helper: cria um JWT mock HS256 válido (base64url sem verificação real)
// ---------------------------------------------------------------------------

function makeMockJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = 'mockSignatureForTests'
  return `${header}.${body}.${sig}`
}

// ---------------------------------------------------------------------------
// Helper: cria mocks de Express req/res/next
// ---------------------------------------------------------------------------

function makeMocks() {
  const req = {
    headers: {},
    jwtPayload: undefined,
    forwardedAuthorization: undefined,
  } as unknown as Request

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    locals: {},
  } as unknown as Response

  const next = vi.fn() as unknown as NextFunction

  return { req, res, next }
}

// ---------------------------------------------------------------------------
// Tests: withJwtPropagation
// ---------------------------------------------------------------------------

describe('withJwtPropagation', () => {
  beforeEach(() => {
    process.env.CLERK_SECRET_KEY = 'test-clerk-secret'
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deve retornar 401 quando Authorization header está ausente', async () => {
    const { req, res, next } = makeMocks()

    await withJwtPropagation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 quando Authorization não começa com "Bearer "', async () => {
    const { req, res, next } = makeMocks()
    ;(req.headers as Record<string, string>)['authorization'] = 'Basic dXNlcjpwYXNz'

    await withJwtPropagation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 quando token é vazio após "Bearer "', async () => {
    const { req, res, next } = makeMocks()
    ;(req.headers as Record<string, string>)['authorization'] = 'Bearer '

    await withJwtPropagation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 quando JWT tem partes insuficientes (não é 3 partes)', async () => {
    const { req, res, next } = makeMocks()
    ;(req.headers as Record<string, string>)['authorization'] = 'Bearer nao-e-jwt'

    await withJwtPropagation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 quando JWT tem payload não-JSON válido', async () => {
    const { req, res, next } = makeMocks()
    // header.InvalidBase64.sig — payload não é JSON válido
    const badToken = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.%%%INVALIDO.sig`
    ;(req.headers as Record<string, string>)['authorization'] = `Bearer ${badToken}`

    await withJwtPropagation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('deve chamar next() com JWT válido e preencher jwtPayload', async () => {
    const { req, res, next } = makeMocks()

    const payload = { sub: 'user_123', tenant_id: 'tenant_abc', exp: Math.floor(Date.now() / 1000) + 3600 }
    const token = makeMockJwt(payload)
    ;(req.headers as Record<string, string>)['authorization'] = `Bearer ${token}`

    await withJwtPropagation(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.jwtPayload).toBeDefined()
    expect((req.jwtPayload as Record<string, unknown>)['sub']).toBe('user_123')
    expect(req.forwardedAuthorization).toBe(`Bearer ${token}`)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deve propagar x-forwarded-authorization para res.locals', async () => {
    const { req, res, next } = makeMocks()

    const token = makeMockJwt({ sub: 'user_456' })
    const authHeader = `Bearer ${token}`
    ;(req.headers as Record<string, string>)['authorization'] = authHeader

    await withJwtPropagation(req, res, next)

    expect(res.locals['x-forwarded-authorization']).toBe(authHeader)
    expect(next).toHaveBeenCalled()
  })

  it('deve preservar todos os campos do payload no jwtPayload', async () => {
    const { req, res, next } = makeMocks()

    const payload = {
      sub: 'user_789',
      tenant_id: 'tenant_xyz',
      roles: ['admin', 'user'],
      iat: Math.floor(Date.now() / 1000),
    }
    const token = makeMockJwt(payload)
    ;(req.headers as Record<string, string>)['authorization'] = `Bearer ${token}`

    await withJwtPropagation(req, res, next)

    expect(req.jwtPayload).toEqual(expect.objectContaining({
      sub: 'user_789',
      tenant_id: 'tenant_xyz',
    }))
  })
})

// ---------------------------------------------------------------------------
// Tests: getForwardedAuthHeader
// ---------------------------------------------------------------------------

describe('getForwardedAuthHeader', () => {
  it('deve retornar objeto vazio se forwardedAuthorization não definido', () => {
    const req = { forwardedAuthorization: undefined } as unknown as Request
    expect(getForwardedAuthHeader(req)).toEqual({})
  })

  it('deve retornar header x-forwarded-authorization quando definido', () => {
    const req = { forwardedAuthorization: 'Bearer mytoken' } as unknown as Request
    expect(getForwardedAuthHeader(req)).toEqual({
      'x-forwarded-authorization': 'Bearer mytoken',
    })
  })
})
