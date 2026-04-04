/**
 * dashboard.routes.ts — Endpoint de widgets para o serviço de Dashboard
 * POST /widgets — recebe métricas solicitadas e retorna valores agregados
 * Protocolo: POST /api/v1/financeiro/dashboard/widgets
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
        case 'total_brl': {
          const agg = await prisma.financeiroProcesso.aggregate({
            _sum: { total_brl: true },
            where: { created_at: { gte: periodStart } },
          })
          result.total_brl = Number(agg._sum.total_brl ?? 0)
          break
        }
        case 'pendente': {
          const agg = await prisma.financeiroProcesso.aggregate({
            _sum: { pendente: true },
            where: { created_at: { gte: periodStart } },
          })
          result.pendente = Number(agg._sum.pendente ?? 0)
          break
        }
        case 'pagos': {
          const agg = await prisma.financeiroProcesso.aggregate({
            _sum: { pagos: true },
            where: { created_at: { gte: periodStart } },
          })
          result.pagos = Number(agg._sum.pagos ?? 0)
          break
        }
        case 'agendados': {
          const agg = await prisma.financeiroProcesso.aggregate({
            _sum: { agendados: true },
            where: { created_at: { gte: periodStart } },
          })
          result.agendados = Number(agg._sum.agendados ?? 0)
          break
        }
        case 'por_moeda': {
          const items = await prisma.financeiroLancamento.groupBy({
            by: ['moeda'],
            _sum: { valor_brl: true },
            where: { created_at: { gte: periodStart } },
          })
          result.por_moeda = Object.fromEntries(
            items.map(i => [i.moeda, Number(i._sum.valor_brl ?? 0)])
          )
          break
        }
        case 'vencimentos_proximos': {
          const agora = new Date()
          const em30d = new Date(agora.getTime() + 30 * 86400000)
          const count = await prisma.financeiroLancamento.count({
            where: {
              data_vencimento: { gte: agora, lte: em30d },
              status: 'PENDENTE',
            },
          })
          result.vencimentos_proximos = count
          break
        }
        default:
          break
      }
    }

    res.json(result)
  } catch (err) { next(err) }
})
