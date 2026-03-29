// @vitest-environment node
/**
 * Testes unitários — requireInternalKey do API Cockpit
 * Verifica timing-safe comparison e tratamento de headers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { requireInternalKey } from '../../../servicos-global/tenant/api-cockpit/server/src/middleware/requireInternalKey.js'

function makeMocks(headers: Record<string, string | string[]> = {}, path = '/api/v1/cockpit/tokens') {
  const req = { headers, path } as unknown as Request
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  const next = vi.fn() as unknown as NextFunction
  return { req, res, next }
}

describe('requireInternalKey — API Cockpit', () => {
  const VALID_KEY = 'gv_isk_abc123def456'

  beforeEach(() => {
    process.env.INTERNAL_SERVICE_KEY = VALID_KEY
  })

  afterEach(() => {
    delete process.env.INTERNAL_SERVICE_KEY
  })

  it('deve permitir /health sem auth', () => {
    const { req, res, next } = makeMocks({}, '/health')
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deve retornar 403 sem header x-internal-key', () => {
    const { req, res, next } = makeMocks({})
    requireInternalKey(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'FORBIDDEN' }))
  })

  it('deve retornar 403 com chave invalida', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': 'wrong-key' })
    requireInternalKey(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('deve retornar 403 com chave de tamanho diferente', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': 'short' })
    requireInternalKey(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('deve aceitar chave valida', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': VALID_KEY })
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deve aceitar header como array (primeiro valor)', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': [VALID_KEY, 'outro'] })
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('deve retornar 500 se env var nao configurada', () => {
    delete process.env.INTERNAL_SERVICE_KEY
    const { req, res, next } = makeMocks({ 'x-internal-key': 'qualquer' })
    requireInternalKey(req, res, next)
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('chave com mesmo tamanho mas diferente deve ser rejeitada', () => {
    const fakeKey = 'X'.repeat(VALID_KEY.length)
    const { req, res, next } = makeMocks({ 'x-internal-key': fakeKey })
    requireInternalKey(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
})
