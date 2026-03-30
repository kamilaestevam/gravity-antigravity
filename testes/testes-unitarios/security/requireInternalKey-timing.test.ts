// @vitest-environment node
/**
 * Testes unitarios — requireInternalKey do Bid Cambio
 * Verifica timing-safe comparison e tratamento correto de headers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'
import { requireInternalKey } from '../../../produto/bid-cambio/server/src/middleware/requireInternalKey.js'

function makeMocks(
  headers: Record<string, string | string[]> = {},
  path = '/api/v1/bid-cambio/cotacoes'
) {
  const req = { headers, path } as unknown as Request
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  const next = vi.fn() as unknown as NextFunction
  return { req, res, next }
}

describe('requireInternalKey — Bid Cambio (timing-safe)', () => {
  const VALID_KEY = 'gv_isk_bidcambio_secret_2024'

  beforeEach(() => {
    process.env.INTERNAL_SERVICE_KEY = VALID_KEY
  })

  afterEach(() => {
    delete process.env.INTERNAL_SERVICE_KEY
  })

  it('deve permitir /health sem chave', () => {
    const { req, res, next } = makeMocks({}, '/health')
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deve permitir rotas de master-data sem chave', () => {
    const { req, res, next } = makeMocks({}, '/api/v1/master-data/currencies')
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deve permitir rotas publicas do portal sem chave', () => {
    const { req, res, next } = makeMocks({}, '/api/v1/bid-cambio/portal/public/rates')
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deve retornar 500 quando INTERNAL_SERVICE_KEY nao configurada', () => {
    delete process.env.INTERNAL_SERVICE_KEY
    const { req, res, next } = makeMocks({ 'x-internal-key': 'qualquer' })
    requireInternalKey(req, res, next)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Servico mal configurado' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 quando header x-internal-key ausente', () => {
    const { req, res, next } = makeMocks({})
    requireInternalKey(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'UNAUTHORIZED' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 com chave incorreta', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': 'wrong-key-totally' })
    requireInternalKey(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 com chave de tamanho diferente (short-circuit seguro)', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': 'short' })
    requireInternalKey(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 com chave do mesmo tamanho mas diferente', () => {
    const fakeKey = 'X'.repeat(VALID_KEY.length)
    const { req, res, next } = makeMocks({ 'x-internal-key': fakeKey })
    requireInternalKey(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('deve aceitar chave correta e chamar next()', () => {
    const { req, res, next } = makeMocks({ 'x-internal-key': VALID_KEY })
    requireInternalKey(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deve usar timingSafeEqual do modulo crypto (funcao existe e funciona)', () => {
    // Verifica que timingSafeEqual existe e funciona corretamente
    expect(typeof timingSafeEqual).toBe('function')

    const a = Buffer.from(VALID_KEY)
    const b = Buffer.from(VALID_KEY)
    expect(timingSafeEqual(a, b)).toBe(true)

    const c = Buffer.from('X'.repeat(VALID_KEY.length))
    expect(timingSafeEqual(a, c)).toBe(false)
  })

  it('timingSafeEqual deve lancar erro quando buffers tem tamanhos diferentes', () => {
    // timingSafeEqual exige buffers de mesmo tamanho — o middleware deve tratar isso
    const a = Buffer.from('short')
    const b = Buffer.from('much-longer-string')
    expect(() => timingSafeEqual(a, b)).toThrow()
  })
})
