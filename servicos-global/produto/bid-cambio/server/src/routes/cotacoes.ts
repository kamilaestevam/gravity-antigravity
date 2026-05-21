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
  moeda_cotacao_bid_cambio: z.enum(['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'BRL']),
  valor_cotacao_bid_cambio: z.number().positive(),
  tipo_operacao_cotacao_bid_cambio: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  modalidade_cotacao_bid_cambio: z.enum(['PRONTO', 'FUTURO']).default('PRONTO'),
  liquidacao_cotacao_bid_cambio: z.enum(['D0', 'D1', 'D2']).default('D2'),
  referencia_processo_cotacao_bid_cambio: z.string().optional(),
  numero_pedido_cotacao_bid_cambio: z.string().optional(),
  exportador_cotacao_bid_cambio: z.string().optional(),
  data_expiracao_cotacao_bid_cambio: z.string().optional(),
})

// --- POST /api/v1/bid-cambio/cotacoes ---
cotacoesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = criarCotacaoSchema.parse(req.body)
    const prisma = req.prisma!
    const userId = req.headers['x-id-usuario'] as string

    const cotacao = await (prisma as any).bidCambioCotacao.create({
      data: {
        ...input,
        id_usuario: userId,
        status_cotacao_bid_cambio: 'RASCUNHO',
        data_expiracao_cotacao_bid_cambio: input.data_expiracao_cotacao_bid_cambio ? new Date(input.data_expiracao_cotacao_bid_cambio) : null,
      },
    })

    historicoIntegration.registrar(req.tenantId!, userId, {
      acao: 'CRIAR_COTACAO_CAMBIO',
      entidade: 'BidCambioCotacao',
      entidade_id: cotacao.id_cotacao_bid_cambio,
      detalhes: { moeda: input.moeda_cotacao_bid_cambio, valor: input.valor_cotacao_bid_cambio },
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
    if (status) where.status_cotacao_bid_cambio = status

    const [cotacoes, total] = await Promise.all([
      (prisma as any).bidCambioCotacao.findMany({
        where,
        orderBy: { data_criacao_cotacao_bid_cambio: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          bid_requests: { select: { id_disparo_cotacao_bid_cambio: true, status_disparo_cotacao_bid_cambio: true, corretora: { select: { nome_fantasia_corretora_bid_cambio: true } } } },
          _count: { select: { bid_responses: true } },
        },
      }),
      (prisma as any).bidCambioCotacao.count({ where }),
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
    const cotacao = await (req.prisma as any).bidCambioCotacao.findFirst({
      where: { id_cotacao_bid_cambio: req.params.id },
      include: {
        bid_requests: { include: { corretora: true } },
        bid_responses: { include: { corretora: true }, orderBy: { taxa_oferecida_resposta_cotacao_bid_cambio: 'asc' } },
      },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    res.json(cotacao)
  } catch (err) { next(err) }
})

// --- PATCH /api/v1/bid-cambio/cotacoes/:id ---
const atualizarCotacaoSchema = z.object({
  moeda_cotacao_bid_cambio: z.enum(['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'BRL']).optional(),
  valor_cotacao_bid_cambio: z.number().positive().optional(),
  tipo_operacao_cotacao_bid_cambio: z.enum(['IMPORTACAO', 'EXPORTACAO']).optional(),
  modalidade_cotacao_bid_cambio: z.enum(['PRONTO', 'FUTURO']).optional(),
  liquidacao_cotacao_bid_cambio: z.enum(['D0', 'D1', 'D2']).optional(),
  referencia_processo_cotacao_bid_cambio: z.string().optional(),
  numero_pedido_cotacao_bid_cambio: z.string().optional(),
  exportador_cotacao_bid_cambio: z.string().optional(),
  data_expiracao_cotacao_bid_cambio: z.string().optional(),
})

cotacoesRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = atualizarCotacaoSchema.parse(req.body)
    const cotacao = await (req.prisma as any).bidCambioCotacao.findFirst({
      where: { id_cotacao_bid_cambio: req.params.id },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (cotacao.status_cotacao_bid_cambio !== 'RASCUNHO') {
      throw new AppError('So cotacoes em RASCUNHO podem ser editadas', 400, 'INVALID_STATUS')
    }

    const updated = await (req.prisma as any).bidCambioCotacao.update({
      where: { id_cotacao_bid_cambio: req.params.id },
      data: input,
    })
    res.json(updated)
  } catch (err) { next(err) }
})

// --- DELETE /api/v1/bid-cambio/cotacoes/:id ---
cotacoesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cotacao = await (req.prisma as any).bidCambioCotacao.findFirst({
      where: { id_cotacao_bid_cambio: req.params.id },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (cotacao.status_cotacao_bid_cambio !== 'RASCUNHO') {
      throw new AppError('So cotacoes em RASCUNHO podem ser deletadas', 400, 'INVALID_STATUS')
    }

    await (req.prisma as any).bidCambioCotacao.delete({ where: { id_cotacao_bid_cambio: req.params.id } })
    res.json({ deleted: true })
  } catch (err) { next(err) }
})
