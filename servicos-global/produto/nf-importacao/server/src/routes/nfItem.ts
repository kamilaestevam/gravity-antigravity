/**
 * nfItem.ts — CRUD de itens da NF Importacao
 * Todas as queries filtram por id_organizacao + company_id (zero-trust)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../services/nfStatusEngine.js'
import { gerarId, PREFIXOS } from '../lib/idGenerator.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: req.headers['x-id-workspace'] as string || '',
  }
}

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const NfItemCreateSchema = z.object({
  numero_item: z.number().int().min(1).optional(),
  ncm: z.string().min(8).max(10),
  descricao: z.string().min(1),
  cfop: z.string().optional(),
  quantidade: z.number().positive(),
  unidade_medida: z.string().default('UN'),
  peso_liquido: z.number().min(0).optional(),
  peso_bruto: z.number().min(0).optional(),
  valor_unitario: z.number().min(0).optional(),
  valor_fob: z.number().min(0).optional(),
  valor_frete_item: z.number().min(0).optional(),
  valor_seguro_item: z.number().min(0).optional(),
  valor_cif: z.number().min(0).optional(),
  aliquota_ii: z.number().min(0).optional(),
  valor_ii: z.number().min(0).optional(),
  aliquota_ipi: z.number().min(0).optional(),
  valor_ipi: z.number().min(0).optional(),
  aliquota_pis: z.number().min(0).optional(),
  valor_pis: z.number().min(0).optional(),
  aliquota_cofins: z.number().min(0).optional(),
  valor_cofins: z.number().min(0).optional(),
  aliquota_icms: z.number().min(0).optional(),
  valor_icms: z.number().min(0).optional(),
  cst_ipi: z.string().optional(),
  cst_pis: z.string().optional(),
  cst_cofins: z.string().optional(),
  cst_icms: z.string().optional(),
  ex_tipi: z.string().optional(),
  fabricante: z.string().optional(),
  pais_origem: z.string().optional(),
})

const NfItemUpdateSchema = NfItemCreateSchema.partial()

const EDITABLE_STATUSES = ['rascunho', 'em_composicao']

// ── Helpers ─────────────────────────────────────────────────────────────────

async function findNfEditable(prisma: PrismaClient, nfId: string, tenantId: string, companyId: string) {
  const where: Record<string, unknown> = { id: nfId, id_organizacao: tenantId }
  if (companyId) where.company_id = companyId

  const nf = await prisma.nFImportacao.findFirst({ where })
  if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
  if (!EDITABLE_STATUSES.includes(nf.status)) {
    throw new AppError(
      `Itens so podem ser modificados quando NF esta em rascunho ou em_composicao (atual: ${nf.status})`,
      422,
      'NOT_EDITABLE'
    )
  }
  return nf
}

// ── GET /:id/itens — Listar itens da NF ────────────────────────────────────

router.get('/:id/itens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { id: req.params.id, id_organizacao: tenantId }
    if (companyId) where.company_id = companyId

    const nf = await prisma.nFImportacao.findFirst({ where, select: { id: true } })
    if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')

    const itens = await prisma.nFImportacaoItens.findMany({
      where: { nf_importacao_id: req.params.id, id_organizacao: tenantId },
      orderBy: { numero_item: 'asc' },
    })

    res.json({ data: itens })
  } catch (err) { next(err) }
})

// ── POST /:id/itens — Adicionar item ───────────────────────────────────────

router.post('/:id/itens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = NfItemCreateSchema.parse(req.body)

    const nf = await findNfEditable(prisma, req.params.id, tenantId, companyId)

    // Auto-incrementar numero_item se nao fornecido
    let numeroItem = body.numero_item
    if (!numeroItem) {
      const lastItem = await prisma.nFImportacaoItens.findFirst({
        where: { nf_importacao_id: req.params.id, id_organizacao: tenantId },
        orderBy: { numero_item: 'desc' },
        select: { numero_item: true },
      })
      numeroItem = (lastItem?.numero_item ?? 0) + 1
    }

    const count = await prisma.nFImportacaoItens.count({ where: { id_organizacao: tenantId } })
    const item = await prisma.nFImportacaoItens.create({
      data: {
        id: gerarId(PREFIXOS.ITEM, count + 1),
        id_organizacao: tenantId,
        company_id: nf.company_id,
        product_id: 'nf-importacao',
        user_id: userId,
        nf_importacao_id: req.params.id,
        numero_item: numeroItem,
        ncm: body.ncm,
        descricao: body.descricao,
        cfop: body.cfop ?? null,
        quantidade: body.quantidade,
        unidade_medida: body.unidade_medida,
        peso_liquido: body.peso_liquido ?? null,
        peso_bruto: body.peso_bruto ?? null,
        valor_unitario: body.valor_unitario ?? null,
        valor_fob: body.valor_fob ?? null,
        valor_frete_item: body.valor_frete_item ?? null,
        valor_seguro_item: body.valor_seguro_item ?? null,
        valor_cif: body.valor_cif ?? null,
        aliquota_ii: body.aliquota_ii ?? null,
        valor_ii: body.valor_ii ?? null,
        aliquota_ipi: body.aliquota_ipi ?? null,
        valor_ipi: body.valor_ipi ?? null,
        aliquota_pis: body.aliquota_pis ?? null,
        valor_pis: body.valor_pis ?? null,
        aliquota_cofins: body.aliquota_cofins ?? null,
        valor_cofins: body.valor_cofins ?? null,
        aliquota_icms: body.aliquota_icms ?? null,
        valor_icms: body.valor_icms ?? null,
        cst_ipi: body.cst_ipi ?? null,
        cst_pis: body.cst_pis ?? null,
        cst_cofins: body.cst_cofins ?? null,
        cst_icms: body.cst_icms ?? null,
        ex_tipi: body.ex_tipi ?? null,
        fabricante: body.fabricante ?? null,
        pais_origem: body.pais_origem ?? null,
      },
    })

    res.status(201).json(item)
  } catch (err) { next(err) }
})

// ── PUT /:id/itens/:itemId — Atualizar item ────────────────────────────────

router.put('/:id/itens/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = NfItemUpdateSchema.parse(req.body)

    await findNfEditable(prisma, req.params.id, tenantId, companyId)

    const existing = await prisma.nFImportacaoItens.findFirst({
      where: { id: req.params.itemId, nf_importacao_id: req.params.id, id_organizacao: tenantId },
    })
    if (!existing) throw new AppError('Item nao encontrado', 404, 'NOT_FOUND')

    const item = await prisma.nFImportacaoItens.update({
      where: { id: req.params.itemId },
      data: { ...body, updated_by: userId },
    })

    res.json(item)
  } catch (err) { next(err) }
})

// ── DELETE /:id/itens/:itemId — Remover item ───────────────────────────────

router.delete('/:id/itens/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    await findNfEditable(prisma, req.params.id, tenantId, companyId)

    const existing = await prisma.nFImportacaoItens.findFirst({
      where: { id: req.params.itemId, nf_importacao_id: req.params.id, id_organizacao: tenantId },
    })
    if (!existing) throw new AppError('Item nao encontrado', 404, 'NOT_FOUND')

    await prisma.nFImportacaoItens.delete({ where: { id: req.params.itemId } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export { router as nfItemRouter }
