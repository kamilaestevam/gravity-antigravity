/**
 * historico.ts — Audit trail imutável (append-only)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/AppError.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
  }
}

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  lancamento_id: z.string().optional(),
})

// GET /:processoId/historico
router.get('/:processoId/historico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const query = QuerySchema.parse(req.query)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    const where: Record<string, unknown> = {
      tenant_id: tenantId,
      financeiro_id: financeiro.id,
    }
    if (query.lancamento_id) where.lancamento_id = query.lancamento_id

    const [total, historico] = await Promise.all([
      prisma.financeiroHistorico.count({ where }),
      prisma.financeiroHistorico.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ])

    res.json({
      data: historico,
      meta: { total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) },
    })
  } catch (err) { next(err) }
})

// POST /:processoId/historico — Registrar entrada (uso interno)
router.post('/:processoId/historico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    const entry = await prisma.financeiroHistorico.create({
      data: {
        tenant_id: tenantId,
        financeiro_id: financeiro.id,
        lancamento_id: req.body.lancamento_id ?? null,
        acao: req.body.acao,
        descricao: req.body.descricao,
        dados_anteriores: req.body.dados_anteriores ?? null,
        dados_novos: req.body.dados_novos ?? null,
        user_id: req.body.user_id,
        user_nome: req.body.user_nome,
      },
    })

    res.status(201).json({ data: entry })
  } catch (err) { next(err) }
})

export { router as historicoRouter }
