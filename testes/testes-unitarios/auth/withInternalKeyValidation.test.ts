// @vitest-environment node
// testes/testes-unitarios/auth/withInternalKeyValidation.test.ts
// AGENTE AUTH FLOW — ONDA 4
// Testes unitários para o middleware withInternalKeyValidation

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import {
  withInternalKeyValidation,
  timingSafeEqual,
} from '../../../servicos-global/tenant/middleware/withInternalKeyValidation.js'

// ---------------------------------------------------------------------------
// Helper: cria mocks de Express req/res/next
// ---------------------------------------------------------------------------

function makeMocks(headers: Record<string, string> = {}) {
  const req = {
    headers,
  } as unknown as Request

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response

  const next = vi.fn() as unknown as NextFunction

  return { req, res, next }
}

// ---------------------------------------------------------------------------
// Tests: withInternalKeyValidation
// ---------------------------------------------------------------------------

describe('withInternalKeyValidation', () => {
  const VALID_KEY = 'super-secret-internal-key-12345'

  beforeEach(() => {
    process.env.INTERNAL_API_KEY = VALID_KEY
  })

  afterEach(() => {
    delete process.env.INTERNAL_API_KEY
    vi.restoreAllMocks()
  })

  it('deve retornar 403 quando INTERNAL_API_KEY não está configurada', () => {
    delete process.env.INTERNAL_API_KEY
    const { req, res, next } = makeMocks({ 'x-internal-key': 'qualquer-chave' })

    withInternalKeyValidation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Forbidden' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 403 quando INTERNAL_API_KEY está vazia', () => {
    process.env.INTERNAL_API_KEY = ''
    const { req, res, next } = makeMocks({ 'x-internal-key': 'qualquer-chave' })

    withInternalKeyValidation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 403 quando header x-internal-key está ausente', () => {
    const { req, res, next } = makeMocks({})

    withInternalKeyValidation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Forbidden',
        message: expect.stringContaining('x-internal-key'),
      })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 403 quando a chave fornecida é inválida', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': 'chave-errada' })

    withInternalKeyValidation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Forbidden' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('deve chamar next() quando a chave interna é válida', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': VALID_KEY })

    withInternalKeyValidation(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deve aceitar x-internal-key como array e usar o primeiro valor', () => {
    const req = {
      headers: { 'x-internal-key': [VALID_KEY, 'outro-valor'] },
    } as unknown as Request

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response

    const next = vi.fn() as unknown as NextFunction

    withInternalKeyValidation(req, res, next)

    expect(next).toHaveBeenCalledOnce()
  })

  it('não deve chamar next() para chave com mesmo tamanho mas diferente', () => {
    // Mesma quantidade de chars, mas diferente — evita falso positivo de timing
    const fakeKey = 'X'.repeat(VALID_KEY.length)
    const { req, res, next } = makeMocks({ 'x-internal-key': fakeKey })

    withInternalKeyValidation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: timingSafeEqual
// ---------------------------------------------------------------------------

describe('timingSafeEqual', () => {
  it('deve retornar true para strings idênticas', () => {
    expect(timingSafeEqual('abc123', 'abc123')).toBe(true)
  })

  it('deve retornar false para strings diferentes', () => {
    expect(timingSafeEqual('abc123', 'xyz456')).toBe(false)
  })

  it('deve retornar false para strings de tamanhos diferentes', () => {
    expect(timingSafeEqual('short', 'longer-string')).toBe(false)
  })

  it('deve retornar false para string vazia vs não-vazia', () => {
    expect(timingSafeEqual('', 'abc')).toBe(false)
  })

  it('deve retornar true para strings vazias', () => {
    expect(timingSafeEqual('', '')).toBe(true)
  })
})
