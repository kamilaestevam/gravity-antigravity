/**
 * dashboard.routes.ts — Endpoint de widgets para o serviço de Dashboard
 * POST /widgets — recebe métricas solicitadas e retorna valores agregados
 * Protocolo: POST /api/v1/nf-importacao/dashboard/widgets
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
        case 'total_fob': {
          const agg = await prisma.nfImportacao.aggregate({
            _sum: { total_fob: true },
            where: { created_at: { gte: periodStart } },
          })
          result.total_fob = Number(agg._sum.total_fob ?? 0)
          break
        }
        case 'total_cif': {
          const agg = await prisma.nfImportacao.aggregate({
            _sum: { total_cif: true },
            where: { created_at: { gte: periodStart } },
          })
          result.total_cif = Number(agg._sum.total_cif ?? 0)
          break
        }
        case 'total_tributos': {
          const agg = await prisma.nfImportacao.aggregate({
            _sum: { total_tributos: true },
            where: { created_at: { gte: periodStart } },
          })
          result.total_tributos = Number(agg._sum.total_tributos ?? 0)
          break
        }
        case 'nfs_por_status': {
          const items = await prisma.nfImportacao.groupBy({
            by: ['status'],
            _count: true,
            where: { created_at: { gte: periodStart } },
          })
          result.nfs_por_status = Object.fromEntries(items.map(i => [i.status, i._count]))
          break
        }
        case 'tributos_breakdown': {
          const agg = await prisma.nfImportacao.aggregate({
            _sum: {
              total_ii: true,
              total_ipi: true,
              total_pis: true,
              total_cofins: true,
              total_icms: true,
            },
            where: { created_at: { gte: periodStart } },
          })
          result.tributos_breakdown = {
            II:     Number(agg._sum.total_ii ?? 0),
            IPI:    Number(agg._sum.total_ipi ?? 0),
            PIS:    Number(agg._sum.total_pis ?? 0),
            COFINS: Number(agg._sum.total_cofins ?? 0),
            ICMS:   Number(agg._sum.total_icms ?? 0),
          }
          break
        }
        case 'volume_mensal': {
          const dozeAtras = new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
          const items = await prisma.nfImportacao.findMany({
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
