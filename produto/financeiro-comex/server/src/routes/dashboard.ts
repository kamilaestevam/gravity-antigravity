/**
 * dashboard.ts — KPIs consolidados do processo financeiro
 * GET /:processoId — retorna processo + KPIs + resumo de lançamentos
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

const CreateFinanceiroSchema = z.object({
  processo_id: z.string().min(1),
  company_id: z.string().min(1),
  tipo_operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']),
  referencia: z.string().optional(),
})

// GET /:processoId — Dashboard KPIs
router.get('/:processoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
      include: {
        _count: {
          select: {
            lancamentos: true,
            numerarios: true,
            rateios: true,
          },
        },
      },
    })

    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    res.json({ data: financeiro })
  } catch (err) { next(err) }
})

// POST / — Criar financeiro para um processo
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const body = CreateFinanceiroSchema.parse(req.body)

    const existing = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: body.processo_id, tenant_id: tenantId },
    })
    if (existing) throw new AppError('Processo financeiro ja existe', 409, 'DUPLICATE')

    const financeiro = await prisma.financeiroProcesso.create({
      data: {
        tenant_id: tenantId,
        company_id: body.company_id,
        processo_id: body.processo_id,
        tipo_operacao: body.tipo_operacao,
        referencia: body.referencia ?? null,
      },
    })

    res.status(201).json({ data: financeiro })
  } catch (err) { next(err) }
})

export { router as dashboardRouter }
