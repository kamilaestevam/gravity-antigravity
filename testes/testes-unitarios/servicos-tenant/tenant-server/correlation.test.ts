// @vitest-environment node
/**
 * testes/testes-unitarios/servicos-tenant/tenant-server/correlation.test.ts
 * Testes unitários do correlationMiddleware.
 *
 * Cobre:
 *   - Gera correlation ID quando header ausente
 *   - Propaga header x-correlation-id quando já presente
 *   - Chama next() em todos os casos
 */

import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { correlationMiddleware } from '../../../../servicos-global/tenant/middleware/correlation.js'

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request
}

function makeRes(): Response {
  return {} as Response
}

describe('correlationMiddleware', () => {
  it('atribui UUID gerado quando x-correlation-id está ausente', () => {
    const req = makeReq()
    const next = vi.fn() as unknown as NextFunction

    correlationMiddleware(req, makeRes(), next)

    expect(req.correlationId).toBeDefined()
    expect(typeof req.correlationId).toBe('string')
    expect(req.correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })

  it('reutiliza o x-correlation-id quando presente nos headers', () => {
    const existingId = 'aaaabbbb-cccc-dddd-eeee-ffffaaaabbbb'
    const req = makeReq({ 'x-correlation-id': existingId })
    const next = vi.fn() as unknown as NextFunction

    correlationMiddleware(req, makeRes(), next)

    expect(req.correlationId).toBe(existingId)
  })

  it('chama next() exatamente uma vez', () => {
    const req = makeReq()
    const next = vi.fn() as unknown as NextFunction

    correlationMiddleware(req, makeRes(), next)

    expect(next).toHaveBeenCalledOnce()
    expect(next).toHaveBeenCalledWith()
  })

  it('dois requests independentes geram IDs únicos', () => {
    const req1 = makeReq()
    const req2 = makeReq()
    const next = vi.fn() as unknown as NextFunction

    correlationMiddleware(req1, makeRes(), next)
    correlationMiddleware(req2, makeRes(), next)

    expect(req1.correlationId).not.toBe(req2.correlationId)
  })
})
