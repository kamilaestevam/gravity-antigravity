/**
 * dashboard.routes.ts — Endpoint de widgets para o serviço de Dashboard
 * POST /widgets — recebe métricas solicitadas e retorna valores agregados
 * Protocolo: POST /api/v1/bid-frete/dashboard/widgets
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
        case 'saving_total': {
          const agg = await prisma.freteIntBidGanhoEstimado.aggregate({
            _sum: { saving_valor: true },
            where: { created_at: { gte: periodStart } },
          })
          result.saving_total = Number(agg._sum.saving_valor ?? 0)
          break
        }
        case 'valor_medio': {
          const agg = await prisma.freteIntBidPropostas.aggregate({
            _avg: { valor_total: true },
            where: { status: 'APROVADA', created_at: { gte: periodStart } },
          })
          result.valor_medio = Number(agg._avg.valor_total ?? 0)
          break
        }
        case 'cotacoes_status': {
          const items = await prisma.freteIntBidCotacoes.groupBy({
            by: ['status'],
            _count: true,
            where: { created_at: { gte: periodStart } },
          })
          result.cotacoes_status = Object.fromEntries(items.map(i => [i.status, i._count]))
          break
        }
        case 'saving_percentual': {
          const agg = await prisma.freteIntBidGanhoEstimado.aggregate({
            _avg: { saving_percentual: true },
            where: { created_at: { gte: periodStart } },
          })
          result.saving_percentual = Number(agg._avg.saving_percentual ?? 0)
          break
        }
        case 'transit_time': {
          const agg = await prisma.freteIntBidPropostas.aggregate({
            _avg: { transit_time_dias: true },
            where: {
              created_at: { gte: periodStart },
              transit_time_dias: { not: null },
            },
          })
          result.transit_time = Number(agg._avg.transit_time_dias ?? 0)
          break
        }
        case 'volume_mensal': {
          const dozeAtras = new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
          const items = await prisma.freteIntBidCotacoes.findMany({
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
