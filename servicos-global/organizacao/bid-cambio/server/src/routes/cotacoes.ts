/**
 * cotacoes.ts — Rotas de Cotacao de Cambio (Pilar 2 — Marketplace)
 * CRUD de cotacoes de cambio
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { historicoIntegration } from '../services/tenantIntegrations.js'

export const cotacoesRouter = Router()

const criarCotacaoSchema = z.object({
  moeda: z.enum(['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'BRL']),
  valor: z.number().positive(),
  tipo_operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modalidade: z.enum(['PRONTO', 'FUTURO']).default('PRONTO'),
  liquidacao: z.enum(['D0', 'D1', 'D2']).default('D2'),
  referencia_processo: z.string().optional(),
  numero_pedido: z.string().optional(),
  exportador: z.string().optional(),
  data_expiracao: z.string().optional(),
})

// --- POST /api/v1/bid-cambio/cotacoes ---
cotacoesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = criarCotacaoSchema.parse(req.body)
    const prisma = req.prisma!
    const userId = req.headers['x-user-id'] as string

    const cotacao = await (prisma as any).cotacaoCambio.create({
      data: {
        ...input,
        user_id: userId,
        status: 'RASCUNHO',
        data_expiracao: input.data_expiracao ? new Date(input.data_expiracao) : null,
      },
    })

    historicoIntegration.registrar(req.tenantId!, userId, {
      acao: 'CRIAR_COTACAO_CAMBIO',
      entidade: 'CotacaoCambio',
      entidade_id: cotacao.id,
      detalhes: { moeda: input.moeda, valor: input.valor },
    })

    res.status(201).json(cotacao)
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/cotacoes ---
cotacoesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const status = req.query.status as string | undefined

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const [cotacoes, total] = await Promise.all([
      (prisma as any).cotacaoCambio.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          bid_requests: { select: { id: true, status: true, corretora: { select: { nome_fantasia: true } } } },
          _count: { select: { bid_responses: true } },
        },
      }),
      (prisma as any).cotacaoCambio.count({ where }),
    ])

    res.json({
      data: cotacoes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/cotacoes/:id ---
cotacoesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cotacao = await (req.prisma as any).cotacaoCambio.findFirst({
      where: { id: req.params.id },
      include: {
        bid_requests: { include: { corretora: true } },
        bid_responses: { include: { corretora: true }, orderBy: { taxa_oferecida: 'asc' } },
      },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    res.json(cotacao)
  } catch (err) { next(err) }
})

// --- PATCH /api/v1/bid-cambio/cotacoes/:id ---
const atualizarCotacaoSchema = z.object({
  moeda: z.enum(['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'BRL']).optional(),
  valor: z.number().positive().optional(),
  tipo_operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']).optional(),
  modalidade: z.enum(['PRONTO', 'FUTURO']).optional(),
  liquidacao: z.enum(['D0', 'D1', 'D2']).optional(),
  referencia_processo: z.string().optional(),
  numero_pedido: z.string().optional(),
  exportador: z.string().optional(),
  data_expiracao: z.string().optional(),
})

cotacoesRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = atualizarCotacaoSchema.parse(req.body)
    const cotacao = await (req.prisma as any).cotacaoCambio.findFirst({
      where: { id: req.params.id },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (cotacao.status !== 'RASCUNHO') {
      throw new AppError('So cotacoes em RASCUNHO podem ser editadas', 400, 'INVALID_STATUS')
    }

    const updated = await (req.prisma as any).cotacaoCambio.update({
      where: { id: req.params.id },
      data: input,
    })
    res.json(updated)
  } catch (err) { next(err) }
})

// --- DELETE /api/v1/bid-cambio/cotacoes/:id ---
cotacoesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cotacao = await (req.prisma as any).cotacaoCambio.findFirst({
      where: { id: req.params.id },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (cotacao.status !== 'RASCUNHO') {
      throw new AppError('So cotacoes em RASCUNHO podem ser deletadas', 400, 'INVALID_STATUS')
    }

    await (req.prisma as any).cotacaoCambio.delete({ where: { id: req.params.id } })
    res.json({ deleted: true })
  } catch (err) { next(err) }
})
