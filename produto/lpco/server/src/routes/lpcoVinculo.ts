/**
 * lpcoVinculo.ts — Vinculos de LPCO a DUIMP/DU-E + controle de saldo Flex
 */

import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../services/lpcoStatusEngine.js'
import { validarVinculo, calcularSaldo } from '../services/lpcoSaldoEngine.js'
import { gerarId, PREFIXOS } from '../lib/idGenerator.js'
import { LpcoVinculoCreateSchema } from '../validators/lpco.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as Record<string, unknown>).tenantId as string,
    userId: (req as Record<string, unknown>).userId as string,
    prisma: (req as Record<string, unknown>).prisma as PrismaClient,
  }
}

router.get('/:id/vinculos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const vinculos = await prisma.lpcoVinculo.findMany({
      where: { lpco_id: req.params.id, tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    })
    res.json({ data: vinculos })
  } catch (err) { next(err) }
})

router.post('/:id/vinculos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = LpcoVinculoCreateSchema.parse(req.body)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')

    await validarVinculo(prisma, req.params.id, tenantId, lpco.company_id, body.quantidade_vinculada ?? null)

    const count = await prisma.lpcoVinculo.count({ where: { tenant_id: tenantId } })
    const vinculo = await prisma.$transaction(async (tx) => {
      const created = await tx.lpcoVinculo.create({
        data: {
          id: gerarId(PREFIXOS.VINCULO, count + 1),
          tenant_id: tenantId,
          company_id: lpco.company_id,
          product_id: 'lpco',
          user_id: userId,
          lpco_id: req.params.id,
          processo_id: body.processo_id,
          tipo_documento: body.tipo_documento,
          numero_documento: body.numero_documento,
          quantidade_vinculada: body.quantidade_vinculada,
          unidade_medida: body.unidade_medida,
          created_by: userId,
          status: 'ativo',
        },
      })

      await tx.lpcoHistorico.create({
        data: {
          tenant_id: tenantId,
          company_id: lpco.company_id,
          product_id: 'lpco',
          user_id: userId,
          lpco_id: req.params.id,
          evento: 'vinculo_criado',
          descricao: `Vinculo criado com ${body.tipo_documento} ${body.numero_documento ?? body.processo_id}`,
          dados_extras: { vinculo_id: created.id, processo_id: body.processo_id },
        },
      })

      return created
    })

    res.status(201).json(vinculo)
  } catch (err) { next(err) }
})

router.delete('/:id/vinculos/:vincId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)

    const vinculo = await prisma.lpcoVinculo.findFirst({
      where: { id: req.params.vincId, lpco_id: req.params.id, tenant_id: tenantId },
    })
    if (!vinculo) throw new AppError('Vinculo nao encontrado', 404, 'NOT_FOUND')
    if (vinculo.status === 'cancelado') throw new AppError('Vinculo ja cancelado', 422, 'ALREADY_CANCELLED')

    await prisma.$transaction(async (tx) => {
      await tx.lpcoVinculo.update({
        where: { id: req.params.vincId },
        data: { status: 'cancelado' },
      })

      await tx.lpcoHistorico.create({
        data: {
          tenant_id: tenantId,
          company_id: vinculo.company_id,
          product_id: 'lpco',
          user_id: userId,
          lpco_id: req.params.id,
          evento: 'vinculo_cancelado',
          descricao: `Vinculo ${req.params.vincId} cancelado`,
          dados_extras: { vinculo_id: req.params.vincId },
        },
      })
    })

    res.status(204).send()
  } catch (err) { next(err) }
})

router.get('/:id/saldo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')

    if (lpco.tipo_lpco !== 'FLEX') {
      res.json({ disponivel: null, deferida: null, vinculada: null, tipo: lpco.tipo_lpco })
      return
    }

    const saldo = await calcularSaldo(prisma, req.params.id, tenantId, lpco.company_id)
    res.json(saldo)
  } catch (err) { next(err) }
})

export { router as lpcoVinculoRouter }
