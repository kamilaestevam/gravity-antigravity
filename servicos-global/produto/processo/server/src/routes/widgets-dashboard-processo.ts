/**
 * widgets-dashboard-processo.ts — Métricas agregadas para Dashboard
 * POST /api/v1/processos/dashboard/widgets
 */
import { Router } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '../../../generated/index.js'
import type { Request, Response, NextFunction } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    prisma?: PrismaClient
  }
}

function getPeriodStart(period: string): Date {
  const now = new Date()
  const map: Record<string, Date> = {
    '7d': new Date(now.getTime() - 7 * 86400000),
    '30d': new Date(now.getTime() - 30 * 86400000),
    '90d': new Date(now.getTime() - 90 * 86400000),
    '12m': new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    'mtd': new Date(now.getFullYear(), now.getMonth(), 1),
    'ytd': new Date(now.getFullYear(), 0, 1),
  }
  return map[period] ?? map['30d']
}

const schema = z.object({
  metrics: z.array(z.string()),
  filters: z.object({ period: z.string().default('30d') }),
})

export const dashboardWidgetsRouter = Router()

dashboardWidgetsRouter.post('/widgets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { metrics, filters } = schema.parse(req.body)
    const prisma = req.prisma!
    const periodStart = getPeriodStart(filters.period)
    const result: Record<string, unknown> = {}

    for (const metric of metrics) {
      switch (metric) {
        case 'total_ativos': {
          const count = await prisma.processo.count({
            where: { data_criacao_processo: { gte: periodStart } },
          })
          result.total_ativos = count
          break
        }
        case 'por_status': {
          const items = await prisma.processo.groupBy({
            by: ['id_status_atual_processo'],
            _count: true,
            where: { data_criacao_processo: { gte: periodStart } },
          })
          result.por_status = Object.fromEntries(
            items.map(i => [i.id_status_atual_processo ?? 'sem_status', i._count]),
          )
          break
        }
        case 'volume_mensal': {
          const dozeAtras = new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
          const items = await prisma.processo.findMany({
            where: { data_criacao_processo: { gte: dozeAtras } },
            select: { data_criacao_processo: true },
          })
          const byMonth: Record<string, number> = {}
          for (const item of items) {
            const month = item.data_criacao_processo.toISOString().slice(0, 7)
            byMonth[month] = (byMonth[month] ?? 0) + 1
          }
          result.volume_mensal = Object.entries(byMonth).map(([month, value]) => ({ month, value }))
          break
        }
        case 'por_tipo_operacao': {
          const items = await prisma.processo.groupBy({
            by: ['tipo_operacao_processo'],
            _count: true,
            where: { data_criacao_processo: { gte: periodStart } },
          })
          result.por_tipo_operacao = Object.fromEntries(
            items.map(i => [i.tipo_operacao_processo, i._count]),
          )
          break
        }
        default:
          break
      }
    }

    res.json(result)
  } catch (err) {
    next(err)
  }
})
