/**
 * numerario.ts — CRUD de numerários (adiantamentos ao despachante)
 * Módulo isolável — projetado para virar produto independente
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/AppError.js'
import { calcularValorBRL } from '../lib/currencyConverter.js'
import { recalcularTotais } from './lancamentos.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: (req.headers['x-company-id'] as string) || '',
  }
}

const DespesaSchema = z.object({
  descricao: z.string().min(1),
  moeda: z.enum(['BRL', 'USD', 'EUR', 'GBP', 'CHF', 'CNY', 'ARS', 'UYU']),
  taxa_cambio: z.number().positive(),
  valor: z.number().positive(),
  responsavel: z.string().optional(),
})

const NumerarioCreateSchema = z.object({
  descricao: z.string().min(1),
  is_principal: z.boolean().default(false),
  data: z.string().datetime(),
  despesas: z.array(DespesaSchema).default([]),
})

const NumerarioUpdateSchema = NumerarioCreateSchema.partial()

// GET /:processoId/numerario
router.get('/:processoId/numerario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    const numerarios = await prisma.financeiroNumerario.findMany({
      where: { financeiro_id: financeiro.id, tenant_id: tenantId },
      include: { despesas: true },
      orderBy: { created_at: 'asc' },
    })

    const total = numerarios.reduce((s, n) => s + Number(n.valor_total), 0)

    res.json({ data: numerarios, total })
  } catch (err) { next(err) }
})

// POST /:processoId/numerario
router.post('/:processoId/numerario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = NumerarioCreateSchema.parse(req.body)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    // RN: numerário principal é único por processo
    if (body.is_principal) {
      const existePrincipal = await prisma.financeiroNumerario.findFirst({
        where: { financeiro_id: financeiro.id, tenant_id: tenantId, is_principal: true },
      })
      if (existePrincipal) {
        throw new AppError(
          'Este processo ja possui um Numerario Principal. Crie um Numerario Complementar.',
          409,
          'NUMERARIO_PRINCIPAL_DUPLICADO'
        )
      }
    }

    const valor_total = body.despesas.reduce((sum, d) => {
      return sum + calcularValorBRL(d.valor, d.taxa_cambio)
    }, 0)

    const numerario = await prisma.$transaction(async (tx: PrismaClient) => {
      const created = await tx.financeiroNumerario.create({
        data: {
          tenant_id: tenantId,
          company_id: companyId || financeiro.company_id,
          financeiro_id: financeiro.id,
          descricao: body.descricao,
          is_principal: body.is_principal,
          data: new Date(body.data),
          valor_total,
          created_by: userId,
        },
      })

      for (const d of body.despesas) {
        const valor_brl = calcularValorBRL(d.valor, d.taxa_cambio)
        await tx.financeiroNumerarioDespesa.create({
          data: {
            tenant_id: tenantId,
            numerario_id: created.id,
            descricao: d.descricao,
            moeda: d.moeda,
            taxa_cambio: d.taxa_cambio,
            valor: d.valor,
            valor_brl,
            responsavel: d.responsavel ?? null,
          },
        })
      }

      return tx.financeiroNumerario.findFirst({
        where: { id: created.id },
        include: { despesas: true },
      })
    })

    await recalcularTotais(prisma, financeiro.id, tenantId)

    res.status(201).json({ data: numerario })
  } catch (err) { next(err) }
})

// PUT /:processoId/numerario/:id
router.put('/:processoId/numerario/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const body = NumerarioUpdateSchema.parse(req.body)

    const existing = await prisma.financeiroNumerario.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Numerario nao encontrado', 404, 'NOT_FOUND')

    const valor_total = body.despesas
      ? body.despesas.reduce((sum, d) => sum + calcularValorBRL(d.valor, d.taxa_cambio), 0)
      : Number(existing.valor_total)

    const numerario = await prisma.$transaction(async (tx: PrismaClient) => {
      await tx.financeiroNumerario.update({
        where: { id: req.params.id },
        data: {
          descricao: body.descricao ?? existing.descricao,
          data: body.data ? new Date(body.data) : existing.data,
          valor_total,
        },
      })

      if (body.despesas) {
        await tx.financeiroNumerarioDespesa.deleteMany({ where: { numerario_id: req.params.id } })

        for (const d of body.despesas) {
          const valor_brl = calcularValorBRL(d.valor, d.taxa_cambio)
          await tx.financeiroNumerarioDespesa.create({
            data: {
              tenant_id: tenantId,
              numerario_id: req.params.id,
              descricao: d.descricao,
              moeda: d.moeda,
              taxa_cambio: d.taxa_cambio,
              valor: d.valor,
              valor_brl,
              responsavel: d.responsavel ?? null,
            },
          })
        }
      }

      return tx.financeiroNumerario.findFirst({
        where: { id: req.params.id },
        include: { despesas: true },
      })
    })

    await recalcularTotais(prisma, existing.financeiro_id, tenantId)

    res.json({ data: numerario })
  } catch (err) { next(err) }
})

// DELETE /:processoId/numerario/:id
router.delete('/:processoId/numerario/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.financeiroNumerario.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Numerario nao encontrado', 404, 'NOT_FOUND')

    await prisma.$transaction(async (tx: PrismaClient) => {
      await tx.financeiroNumerarioDespesa.deleteMany({ where: { numerario_id: req.params.id } })
      await tx.financeiroNumerario.delete({ where: { id: req.params.id } })
    })

    await recalcularTotais(prisma, existing.financeiro_id, tenantId)

    res.status(204).send()
  } catch (err) { next(err) }
})

export { router as numerarioRouter }
