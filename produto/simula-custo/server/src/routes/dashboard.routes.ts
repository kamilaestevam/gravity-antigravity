/**
 * dashboard.routes.ts — Endpoint de widgets para o serviço de Dashboard
 * POST /widgets — recebe métricas solicitadas e retorna valores agregados
 * Protocolo: POST /api/v1/simula-custo/dashboard/widgets
 * Chamado pelo servico de dashboard interno via x-internal-key
 */

import { Router } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'
import type { Request, Response, NextFunction } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { tenantId: string; userId: string }
    prisma?: PrismaClient
  }
}

function getPeriodStart(period: string): Date {
  const now = new Date()
  const map: Record<string, Date> = {
    '7d':  new Date(now.getTime() - 7 * 86400000),
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
        case 'landed_cost_medio': {
          const agg = await prisma.simulaCustoEstimativa.aggregate({
            _avg: { landed_cost_brl: true },
            where: { status: 'CRIADA', created_at: { gte: periodStart } },
          })
          result.landed_cost_medio = Number(agg._avg.landed_cost_brl ?? 0)
          break
        }
        case 'estimativas_ativas': {
          const count = await prisma.simulaCustoEstimativa.count({
            where: { status: 'CRIADA' },
          })
          result.estimativas_ativas = count
          break
        }
        case 'total_tributos_medio': {
          const agg = await prisma.simulaCustoEstimativa.aggregate({
            _avg: { total_tributos: true },
            where: { status: 'CRIADA', created_at: { gte: periodStart } },
          })
          result.total_tributos_medio = Number(agg._avg.total_tributos ?? 0)
          break
        }
        case 'tributos_breakdown': {
          const items = await prisma.simulaCustoImpostos.groupBy({
            by: ['tipo'],
            _sum: { valor: true },
            where: {
              estimativa: {
                created_at: { gte: periodStart },
                status: 'CRIADA',
              },
            },
          })
          result.tributos_breakdown = Object.fromEntries(
            items.map(i => [i.tipo, Number(i._sum.valor ?? 0)])
          )
          break
        }
        case 'ptax_media': {
          const agg = await prisma.simulaCustoEstimativa.aggregate({
            _avg: { ptax_utilizada: true },
            where: { status: 'CRIADA', created_at: { gte: periodStart } },
          })
          result.ptax_media = Number(agg._avg.ptax_utilizada ?? 0)
          break
        }
        case 'volume_mensal': {
          const dozeAtras = new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
          const items = await prisma.simulaCustoEstimativa.findMany({
            where: { created_at: { gte: dozeAtras } },
            select: { created_at: true },
          })
          const byMonth: Record<string, number> = {}
          for (const item of items) {
            const month = item.created_at.toISOString().slice(0, 7)
            byMonth[month] = (byMonth[month] ?? 0) + 1
          }
          result.volume_mensal = Object.entries(byMonth).map(([month, value]) => ({ month, value }))
          break
        }
        default:
          break
      }
    }

    res.json(result)
  } catch (err) { next(err) }
})
