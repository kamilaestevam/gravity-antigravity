/**
 * lpcoDocumento.ts — Upload e gestao de documentos anexados ao LPCO
 */

import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../services/lpcoStatusEngine.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as Record<string, unknown>).tenantId as string,
    userId: (req as Record<string, unknown>).userId as string,
    prisma: (req as Record<string, unknown>).prisma as PrismaClient,
  }
}

router.get('/:id_lpco/documentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const docs = await prisma.lpcoAnexos.findMany({
      where: { lpco_id: req.params.id_lpco, tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    })
    res.json({ data: docs })
  } catch (err) { next(err) }
})

router.post('/:id_lpco/documentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id_lpco, tenant_id: tenantId },
    })
    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')

    const { nome_arquivo, tipo_documento, mime_type, tamanho_bytes, storage_key } = req.body

    if (!nome_arquivo || !tipo_documento || !storage_key) {
      throw new AppError('nome_arquivo, tipo_documento e storage_key sao obrigatorios', 400, 'VALIDATION_ERROR')
    }

    const doc = await prisma.lpcoAnexos.create({
      data: {
        tenant_id: tenantId,
        company_id: lpco.company_id,
        product_id: 'lpco',
        user_id: userId,
        lpco_id: req.params.id_lpco,
        nome_arquivo,
        tipo_documento,
        mime_type: mime_type ?? 'application/octet-stream',
        tamanho_bytes: tamanho_bytes ?? 0,
        storage_key,
        uploaded_by: userId,
      },
    })

    res.status(201).json(doc)
  } catch (err) { next(err) }
})

router.delete('/:id_lpco/documentos/:id_documento', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const doc = await prisma.lpcoAnexos.findFirst({
      where: { id: req.params.id_documento, lpco_id: req.params.id_lpco, tenant_id: tenantId },
    })
    if (!doc) throw new AppError('Documento nao encontrado', 404, 'NOT_FOUND')

    await prisma.lpcoAnexos.delete({ where: { id: req.params.id_documento } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export { router as lpcoDocumentoRouter }
