/**
 * lpcoExigencia.ts — Exigencias dos orgaos anuentes
 */

import { Router, Request, Response, NextFunction } from 'express'
import { AppError, transitarStatus } from '../services/lpcoStatusEngine.js'
import { gerarId, PREFIXOS } from '../lib/idGenerator.js'
import { LpcoExigenciaCreateSchema, LpcoExigenciaRespostaSchema } from '../validators/lpco.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as Record<string, unknown>).tenantId as string,
    userId: (req as Record<string, unknown>).userId as string,
    prisma: (req as Record<string, unknown>).prisma as PrismaClient,
  }
}

router.get('/:id/exigencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const exigencias = await prisma.lpcoExigencia.findMany({
      where: { lpco_id: req.params.id, tenant_id: tenantId },
      orderBy: { numero_exigencia: 'asc' },
    })
    res.json({ data: exigencias })
  } catch (err) { next(err) }
})

router.post('/:id/exigencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = LpcoExigenciaCreateSchema.parse(req.body)

    const lpco = await prisma.lpco.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!lpco) throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')

    const count = await prisma.lpcoExigencia.count({ where: { tenant_id: tenantId } })
    const exigencia = await prisma.lpcoExigencia.create({
      data: {
        id: gerarId(PREFIXOS.EXIGENCIA, count + 1),
        tenant_id: tenantId,
        company_id: lpco.company_id,
        product_id: 'lpco',
        user_id: userId,
        lpco_id: req.params.id,
        numero_exigencia: body.numero_exigencia,
        descricao_exigencia: body.descricao_exigencia,
        data_exigencia: new Date(body.data_exigencia),
        prazo_resposta: body.prazo_resposta ? new Date(body.prazo_resposta) : null,
        status: 'pendente',
      },
    })

    if (lpco.status === 'em_analise') {
      await transitarStatus({
        prisma,
        lpcoId: req.params.id,
        tenantId,
        companyId: lpco.company_id,
        statusNovo: 'em_exigencia',
        userId,
        descricao: `Exigencia #${body.numero_exigencia} recebida do orgao anuente`,
      })
    }

    res.status(201).json(exigencia)
  } catch (err) { next(err) }
})

router.post('/:id/exigencias/:exId/responder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const { resposta } = LpcoExigenciaRespostaSchema.parse(req.body)

    const exigencia = await prisma.lpcoExigencia.findFirst({
      where: { id: req.params.exId, lpco_id: req.params.id, tenant_id: tenantId },
    })
    if (!exigencia) throw new AppError('Exigencia nao encontrada', 404, 'NOT_FOUND')
    if (exigencia.status !== 'pendente') throw new AppError('Exigencia ja foi respondida', 422, 'ALREADY_RESPONDED')

    const updated = await prisma.lpcoExigencia.update({
      where: { id: req.params.exId },
      data: {
        resposta,
        data_resposta: new Date(),
        respondido_por: userId,
        status: 'respondida',
      },
    })

    const pendentes = await prisma.lpcoExigencia.count({
      where: { lpco_id: req.params.id, tenant_id: tenantId, status: 'pendente' },
    })

    const lpco = await prisma.lpco.findFirst({ where: { id: req.params.id, tenant_id: tenantId } })

    if (pendentes === 0 && lpco?.status === 'em_exigencia') {
      await transitarStatus({
        prisma,
        lpcoId: req.params.id,
        tenantId,
        companyId: lpco.company_id,
        statusNovo: 'resposta_exigencia',
        userId,
        descricao: 'Todas as exigencias respondidas',
      })
    }

    res.json(updated)
  } catch (err) { next(err) }
})

export { router as lpcoExigenciaRouter }
