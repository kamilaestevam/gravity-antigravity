/**
 * nfDocumento.ts — Upload e gestao de documentos anexados a NF Importacao
 * Todas as queries filtram por tenant_id + company_id (zero-trust)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../services/nfStatusEngine.js'
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

const DocumentoCreateSchema = z.object({
  nome_arquivo: z.string().min(1),
  tipo_documento: z.string().min(1),
  mime_type: z.string().optional(),
  tamanho_bytes: z.number().int().min(0).optional(),
  storage_key: z.string().min(1),
})

// ── GET /:id_nf/documentos — Listar documentos ─────────────────────────────

router.get('/:id_nf/documentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { id: req.params.id_nf, tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const nf = await prisma.nFImportacao.findFirst({ where, select: { id: true } })
    if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')

    const docs = await prisma.nFImportacaoAnexo.findMany({
      where: { nf_importacao_id: req.params.id_nf, tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    })

    res.json({ data: docs })
  } catch (err) { next(err) }
})

// ── POST /:id_nf/documentos — Upload documento ─────────────────────────────

router.post('/:id_nf/documentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = DocumentoCreateSchema.parse(req.body)

    const where: Record<string, unknown> = { id: req.params.id_nf, tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const nf = await prisma.nFImportacao.findFirst({ where })
    if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')

    const doc = await prisma.nFImportacaoAnexo.create({
      data: {
        tenant_id: tenantId,
        company_id: nf.company_id,
        product_id: 'nf-importacao',
        user_id: userId,
        nf_importacao_id: req.params.id_nf,
        nome_arquivo: body.nome_arquivo,
        tipo_documento: body.tipo_documento,
        mime_type: body.mime_type ?? 'application/octet-stream',
        tamanho_bytes: body.tamanho_bytes ?? 0,
        storage_key: body.storage_key,
        uploaded_by: userId,
      },
    })

    res.status(201).json(doc)
  } catch (err) { next(err) }
})

// ── DELETE /:id_nf/documentos/:id_documento — Remover documento ────────────

router.delete('/:id_nf/documentos/:id_documento', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { id: req.params.id_nf, tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const nf = await prisma.nFImportacao.findFirst({ where, select: { id: true } })
    if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')

    const doc = await prisma.nFImportacaoAnexo.findFirst({
      where: { id: req.params.id_documento, nf_importacao_id: req.params.id_nf, tenant_id: tenantId },
    })
    if (!doc) throw new AppError('Documento nao encontrado', 404, 'NOT_FOUND')

    await prisma.nFImportacaoAnexo.delete({ where: { id: req.params.id_documento } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export { router as nfDocumentoRouter }
