// @vitest-environment node
/**
 * testes/testes-unitarios/servicos-tenant/tenant-server/appError.test.ts
 * Testes unitários da classe AppError e do errorHandler global.
 *
 * Cobre:
 *   - AppError: statusCode e code padrão
 *   - AppError: valores customizados
 *   - AppError: instanceof Error
 *   - errorHandler: formata AppError corretamente
 *   - errorHandler: trata Error genérico como 500
 */

import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../../../../servicos-global/tenant/middleware/appError.js'
import { errorHandler } from '../../../../servicos-global/tenant/middleware/errorHandler.js'

function makeReq(correlationId = 'corr-test-001'): Request {
  return { correlationId, headers: {} } as unknown as Request
}

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res as unknown as Response
}

const next = (() => {}) as NextFunction

describe('AppError', () => {
  it('usa statusCode 400 e code BAD_REQUEST por padrão', () => {
    const err = new AppError('algo errado')

    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('BAD_REQUEST')
    expect(err.message).toBe('algo errado')
  })

  it('aceita statusCode e code customizados', () => {
    const err = new AppError('não encontrado', 404, 'NOT_FOUND')

    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
  })

  it('é instanceof Error e instanceof AppError', () => {
    const err = new AppError('teste')

    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
    expect(err.name).toBe('AppError')
  })
})

describe('errorHandler', () => {
  it('formata AppError com statusCode e code corretos', () => {
    const err = new AppError('não encontrado', 404, 'NOT_FOUND')
    const res = makeRes()

    errorHandler(err, makeReq(), res, next)

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(404)
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'não encontrado',
        }),
      })
    )
  })

  it('retorna 500 para erros genéricos (Error comum)', () => {
    const err = new Error('falha inesperada')
    const res = makeRes()

    errorHandler(err, makeReq(), res, next)

    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(500)
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      })
    )
  })

  it('não expõe mensagem interna em erros genéricos', () => {
    const err = new Error('detalhes internos do banco')
    const res = makeRes()

    errorHandler(err, makeReq(), res, next)

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(jsonCall.error.message).not.toContain('detalhes internos')
  })
})
