/**
 * lpcoHistorico.ts — Timeline de eventos do LPCO (append-only, somente leitura)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../services/lpcoStatusEngine.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as Record<string, unknown>).tenantId as string,
    prisma: (req as Record<string, unknown>).prisma as PrismaClient,
  }
}

router.get('/:id/historico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
      select: { id: true },
    })
    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')

    const historico = await prisma.lpcoHistorico.findMany({
      where: { lpco_id: req.params.id, tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 100,
    })

    res.json({ data: historico })
  } catch (err) { next(err) }
})

export { router as lpcoHistoricoRouter }
