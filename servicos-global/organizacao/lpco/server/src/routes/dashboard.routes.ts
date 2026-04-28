/**
 * dashboard.routes.ts — Endpoint de widgets para o serviço de Dashboard
 * POST /widgets — recebe métricas solicitadas e retorna valores agregados
 * Protocolo: POST /api/v1/lpcos/dashboard/widgets
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
        case 'total_ativo': {
          const count = await prisma.lpco.count({
            where: { status: { notIn: ['cancelado', 'arquivado'] } },
          })
          result.total_ativo = count
          break
        }
        case 'vencendo_30d': {
          const agora = new Date()
          const em30d = new Date(agora.getTime() + 30 * 86400000)
          const count = await prisma.lpco.count({
            where: { data_vigencia_fim: { gte: agora, lte: em30d } },
          })
          result.vencendo_30d = count
          break
        }
        case 'exigencias_pendentes': {
          const count = await prisma.lpcoExigencia.count({
            where: { status: 'pendente' },
          })
          result.exigencias_pendentes = count
          break
        }
        case 'por_orgao': {
          const items = await prisma.lpco.groupBy({
            by: ['orgao_anuente'],
            _count: true,
            where: { orgao_anuente: { not: null } },
          })
          result.por_orgao = Object.fromEntries(
            items.map(i => [i.orgao_anuente ?? 'N/A', i._count])
          )
          break
        }
        case 'por_status': {
          const items = await prisma.lpco.groupBy({
            by: ['status'],
            _count: true,
            where: { created_at: { gte: periodStart } },
          })
          result.por_status = Object.fromEntries(items.map(i => [i.status, i._count]))
          break
        }
        case 'taxa_deferimento': {
          const total = await prisma.lpco.count({ where: { created_at: { gte: periodStart } } })
          const deferidos = await prisma.lpco.count({
            where: { created_at: { gte: periodStart }, status: 'deferido' },
          })
          result.taxa_deferimento = total > 0 ? Math.round((deferidos / total) * 100 * 100) / 100 : 0
          break
        }
        default:
          break
      }
    }

    res.json(result)
  } catch (err) { next(err) }
})
