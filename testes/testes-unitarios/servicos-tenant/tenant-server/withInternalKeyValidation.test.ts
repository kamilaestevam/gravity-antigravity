// @vitest-environment node
/**
 * testes/testes-unitarios/servicos-tenant/tenant-server/withInternalKeyValidation.test.ts
 * Testes unitários do withInternalKeyValidation e timingSafeEqual.
 *
 * Cobre:
 *   - 403 quando INTERNAL_API_KEY não está configurada
 *   - 403 quando header x-internal-key está ausente
 *   - 403 quando chave fornecida é inválida
 *   - next() quando chave é válida
 *   - timingSafeEqual: igualdade, diferença de conteúdo, diferença de tamanho
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import {
  withInternalKeyValidation,
  timingSafeEqual,
} from '../../../../servicos-global/tenant/middleware/withInternalKeyValidation.js'

const VALID_KEY = 'test-internal-key-abc123'

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

describe('withInternalKeyValidation', () => {
  beforeEach(() => {
    process.env.INTERNAL_API_KEY = VALID_KEY
  })

  afterEach(() => {
    delete process.env.INTERNAL_API_KEY
  })

  it('retorna 403 quando INTERNAL_API_KEY não está configurada', () => {
    delete process.env.INTERNAL_API_KEY
    const req = makeReq({ 'x-internal-key': VALID_KEY })
    const res = makeRes()
    const next = vi.fn() as unknown as NextFunction

    withInternalKeyValidation(req, res, next)

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 403 quando INTERNAL_API_KEY está em branco', () => {
    process.env.INTERNAL_API_KEY = '   '
    const req = makeReq({ 'x-internal-key': VALID_KEY })
    const res = makeRes()
    const next = vi.fn() as unknown as NextFunction

    withInternalKeyValidation(req, res, next)

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 403 quando header x-internal-key está ausente', () => {
    const req = makeReq()
    const res = makeRes()
    const next = vi.fn() as unknown as NextFunction

    withInternalKeyValidation(req, res, next)

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 403 quando chave fornecida é inválida', () => {
    const req = makeReq({ 'x-internal-key': 'chave-errada' })
    const res = makeRes()
    const next = vi.fn() as unknown as NextFunction

    withInternalKeyValidation(req, res, next)

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('chama next() quando chave é válida', () => {
    const req = makeReq({ 'x-internal-key': VALID_KEY })
    const res = makeRes()
    const next = vi.fn() as unknown as NextFunction

    withInternalKeyValidation(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(next).toHaveBeenCalledWith()
    expect((res.status as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
  })
})

describe('timingSafeEqual', () => {
  it('retorna true para strings idênticas', () => {
    expect(timingSafeEqual('abc123', 'abc123')).toBe(true)
  })

  it('retorna false para strings com mesmo tamanho mas conteúdo diferente', () => {
    expect(timingSafeEqual('abc123', 'xyz789')).toBe(false)
  })

  it('retorna false para strings com tamanho diferente', () => {
    expect(timingSafeEqual('abc', 'abcdef')).toBe(false)
    expect(timingSafeEqual('abcdef', 'abc')).toBe(false)
  })

  it('retorna false para string vazia vs não-vazia', () => {
    expect(timingSafeEqual('', 'abc')).toBe(false)
    expect(timingSafeEqual('abc', '')).toBe(false)
  })

  it('retorna true para strings vazias iguais', () => {
    expect(timingSafeEqual('', '')).toBe(true)
  })
})
