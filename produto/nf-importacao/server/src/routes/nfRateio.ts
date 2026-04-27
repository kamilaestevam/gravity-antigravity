/**
 * nfRateio.ts — Rotas de rateio (preview, aplicar, override manual)
 * Todas as queries filtram por tenant_id + company_id (zero-trust)
 * Usa rateioEngine para calculos
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../services/nfStatusEngine.js'
import { previewRateio, aplicarRateio, overrideManual } from '../services/rateioEngine.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: req.headers['x-company-id'] as string || '',
  }
}

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const OverrideManualSchema = z.object({
  valor_rateado: z.number().min(0),
})

// ── Helpers ─────────────────────────────────────────────────────────────────

async function validateNfAccess(prisma: PrismaClient, nfId: string, tenantId: string, companyId: string) {
  const where: Record<string, unknown> = { id: nfId, tenant_id: tenantId }
  if (companyId) where.company_id = companyId

  const nf = await prisma.nFImportacao.findFirst({ where, select: { id: true } })
  if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
  return nf
}

// ── POST /:id/rateio/preview — Preview de rateio (sem persistir) ───────────

router.post('/:id/rateio/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    await validateNfAccess(prisma, req.params.id, tenantId, companyId)

    const preview = await previewRateio(prisma, req.params.id, tenantId)
    res.json(preview)
  } catch (err) { next(err) }
})

// ── POST /:id/rateio/aplicar — Aplicar rateio definitivo ───────────────────

router.post('/:id/rateio/aplicar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)

    await validateNfAccess(prisma, req.params.id, tenantId, companyId)

    const resultado = await aplicarRateio(prisma, req.params.id, tenantId, userId)
    res.json(resultado)
  } catch (err) { next(err) }
})

// ── PUT /:id/rateio/:rateioId — Override manual de um rateio ───────────────

router.put('/:id/rateio/:rateioId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = OverrideManualSchema.parse(req.body)

    await validateNfAccess(prisma, req.params.id, tenantId, companyId)

    // Validar que o rateio pertence a uma despesa desta NF
    const rateio = await prisma.nFImportacaoRateio.findFirst({
      where: { id: req.params.rateioId, tenant_id: tenantId },
      include: {
        nf_despesa: {
          select: { nf_importacao_id: true },
        },
      },
    })

    if (!rateio) {
      throw new AppError('Rateio nao encontrado', 404, 'NOT_FOUND')
    }

    const despesaNfId = (rateio as Record<string, unknown> & { nf_despesa: { nf_importacao_id: string } }).nf_despesa.nf_importacao_id
    if (despesaNfId !== req.params.id) {
      throw new AppError('Rateio nao encontrado', 404, 'NOT_FOUND')
    }

    const resultado = await overrideManual(prisma, req.params.rateioId, body.valor_rateado, tenantId, userId)
    res.json(resultado)
  } catch (err) { next(err) }
})

export { router as nfRateioRouter }
