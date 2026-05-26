/**
 * AppError — erros operacionais com statusCode e código consistente.
 * Padrão copiado de `tenant/historico-global/server/lib/errors.ts`.
 */
import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '../../../generated/index.js'

export class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly detalhes?: unknown
  readonly isOperational = true

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', detalhes?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.detalhes = detalhes
    if (Error.captureStackTrace) Error.captureStackTrace(this, AppError)
  }

  static naoEncontrado(recurso: string): AppError {
    return new AppError(`${recurso} não encontrado(a).`, 404, 'NAO_ENCONTRADO')
  }

  static validacao(message: string, detalhes?: unknown): AppError {
    return new AppError(message, 422, 'VALIDACAO', detalhes)
  }

  static conflito(message: string): AppError {
    return new AppError(message, 409, 'CONFLITO')
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      erro: { codigo: 'VALIDACAO', mensagem: 'Dados inválidos', detalhes: err.errors },
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      erro: { codigo: err.code, mensagem: err.message, detalhes: err.detalhes },
    })
    return
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error('[cadastros] banco indisponível', err.message)
    res.status(503).json({
      erro: {
        codigo: 'BANCO_INDISPONIVEL',
        mensagem: 'Serviço Cadastros indisponível (banco de dados). Tente novamente em instantes.',
      },
    })
    return
  }

  /** Infra/schema — não confundir com P2002 (conflito) ou P2025 (not found) de negócio. */
  const CODIGOS_PRISMA_INFRA = new Set(['P1000', 'P1001', 'P1008', 'P1017', 'P2021'])
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    CODIGOS_PRISMA_INFRA.has(err.code)
  ) {
    console.error('[cadastros] erro prisma infra', err.code, err.message)
    res.status(503).json({
      erro: {
        codigo: 'BANCO_INDISPONIVEL',
        mensagem: 'Serviço Cadastros indisponível (banco de dados). Tente novamente em instantes.',
      },
    })
    return
  }

  console.error('[cadastros] erro inesperado', err)
  res.status(500).json({
    erro: { codigo: 'ERRO_INTERNO', mensagem: 'Ocorreu um erro interno. Tente novamente.' },
  })
}
