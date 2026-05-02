/**
 * nfHistorico.ts — Timeline de eventos da NF Importacao (append-only, somente leitura)
 * Todas as queries filtram por id_organizacao + company_id (zero-trust)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../services/nfStatusEngine.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: req.headers['x-id-workspace'] as string || '',
  }
}

// ── GET /:id/historico — Listar historico (ordered by created_at desc) ──────

router.get('/:id/historico', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { id: req.params.id, id_organizacao: tenantId }
    if (companyId) where.company_id = companyId

    const nf = await prisma.nFImportacao.findFirst({
      where,
      select: { id: true },
    })
    if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')

    const historico = await prisma.nFImportacaoHistorico.findMany({
      where: { nf_importacao_id: req.params.id, id_organizacao: tenantId },
      orderBy: { created_at: 'desc' },
      take: 100,
    })

    res.json({ data: historico })
  } catch (err) { next(err) }
})

export { router as nfHistoricoRouter }
