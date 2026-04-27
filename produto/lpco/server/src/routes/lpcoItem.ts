/**
 * lpcoItem.ts — CRUD de itens NCM do LPCO
 */

import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../services/lpcoStatusEngine.js'
import { gerarId, PREFIXOS } from '../lib/idGenerator.js'
import { LpcoItemCreateSchema, LpcoItemUpdateSchema } from '../validators/lpco.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as Record<string, unknown>).tenantId as string,
    userId: (req as Record<string, unknown>).userId as string,
    prisma: (req as Record<string, unknown>).prisma as PrismaClient,
  }
}

router.get('/:id/itens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const itens = await prisma.lpcoItens.findMany({
      where: { lpco_id: req.params.id, tenant_id: tenantId },
      orderBy: { created_at: 'asc' },
    })
    res.json({ data: itens })
  } catch (err) { next(err) }
})

router.post('/:id/itens', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = LpcoItemCreateSchema.parse(req.body)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    if (lpco.status !== 'rascunho') throw new AppError('Itens so podem ser adicionados em rascunho', 422, 'NOT_RASCUNHO')

    const count = await prisma.lpcoItens.count({ where: { tenant_id: tenantId } })
    const item = await prisma.lpcoItens.create({
      data: {
        id: gerarId(PREFIXOS.ITEM, count + 1),
        tenant_id: tenantId,
        company_id: lpco.company_id,
        product_id: 'lpco',
        user_id: userId,
        lpco_id: req.params.id,
        ...body,
        atributos: body.atributos ?? undefined,
      },
    })

    res.status(201).json(item)
  } catch (err) { next(err) }
})

router.put('/:id/itens/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = LpcoItemUpdateSchema.parse(req.body)

    const existing = await prisma.lpcoItens.findFirst({
      where: { id: req.params.itemId, lpco_id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Item nao encontrado', 404, 'NOT_FOUND')

    const lpco = await prisma.lpco.findFirst({ where: { id: req.params.id, tenant_id: tenantId } })
    if (lpco?.status !== 'rascunho') throw new AppError('Itens so podem ser editados em rascunho', 422, 'NOT_RASCUNHO')

    const item = await prisma.lpcoItens.update({
      where: { id: req.params.itemId },
      data: { ...body, atributos: body.atributos ?? undefined },
    })

    res.json(item)
  } catch (err) { next(err) }
})

router.delete('/:id/itens/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.lpcoItens.findFirst({
      where: { id: req.params.itemId, lpco_id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Item nao encontrado', 404, 'NOT_FOUND')

    const lpco = await prisma.lpco.findFirst({ where: { id: req.params.id, tenant_id: tenantId } })
    if (lpco?.status !== 'rascunho') throw new AppError('Itens so podem ser removidos em rascunho', 422, 'NOT_RASCUNHO')

    await prisma.lpcoItens.delete({ where: { id: req.params.itemId } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export { router as lpcoItemRouter }
