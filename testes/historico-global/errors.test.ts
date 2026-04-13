// testes/historico-global/errors.test.ts
// Testes unitários da classe AppError e do errorHandler.

import { describe, it, expect, vi } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { AppError, errorHandler } from '../../servicos-global/tenant/historico-global/server/lib/errors.js'

describe('AppError', () => {
  it('cria erro com statusCode e código corretos', () => {
    const err = new AppError('Não encontrado', 404, 'NOT_FOUND')
    expect(err.message).toBe('Não encontrado')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.isOperational).toBe(true)
    expect(err instanceof Error).toBe(true)
  })

  it('usa status 400 e BAD_REQUEST por padrão', () => {
    const err = new AppError('Inválido')
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('BAD_REQUEST')
  })

  it('notFound cria erro 404', () => {
    const err = AppError.notFound('Pedido')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toContain('Pedido')
  })

  it('unauthorized cria erro 401', () => {
    const err = AppError.unauthorized()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('unauthorized aceita mensagem customizada', () => {
    const err = AppError.unauthorized('tenant_id obrigatório')
    expect(err.message).toBe('tenant_id obrigatório')
  })

  it('forbidden cria erro 403', () => {
    const err = AppError.forbidden()
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
  })

  it('conflict cria erro 409', () => {
    const err = AppError.conflict('Regra duplicada')
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe('CONFLICT')
  })

  it('validation cria erro 422', () => {
    const err = AppError.validation('Campo inválido')
    expect(err.statusCode).toBe(422)
    expect(err.code).toBe('VALIDATION_ERROR')
  })
})

describe('errorHandler', () => {
  const mockRes = () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response
    return res
  }

  it('responde com statusCode e código do AppError operacional', () => {
    const err = AppError.notFound('Log')
    const res = mockRes()
    errorHandler(err, {} as unknown as Request, res, vi.fn() as unknown as NextFunction)
    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(404)
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Log não encontrado(a).' },
    })
  })

  it('responde 500 para erros não operacionais', () => {
    const err = new Error('Erro inesperado')
    const res = mockRes()
    errorHandler(err, {} as unknown as Request, res, vi.fn() as unknown as NextFunction)
    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(500)
    expect((res.json as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno. Tente novamente.' },
    })
  })
})
