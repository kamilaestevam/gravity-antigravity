/**
 * dashboard.routes.ts — Endpoint de widgets para o serviço de Dashboard
 * POST /widgets — recebe métricas solicitadas e retorna valores agregados
 * Protocolo: POST /api/v1/bid-frete/dashboard/widgets
 * Chamado pelo servico de dashboard interno via x-internal-key
 */

import { Router } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '../../generated/client/index.js'
import type { Request, Response, NextFunction } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { id_organizacao: string; id_usuario: string }
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
          const agg = await prisma.bidFreteInternacionalGanho.aggregate({
            _sum: { ganho_vs_meta_ganho_bid_frete_internacional: true },
            where: { data_criacao_ganho_bid_frete_internacional: { gte: periodStart } },
          })
          result.saving_total = Number(agg._sum.ganho_vs_meta_ganho_bid_frete_internacional ?? 0)
          break
        }
        case 'valor_medio_ganho_bid_frete_internacional': {
          const agg = await prisma.bidFreteInternacionalProposta.aggregate({
            _avg: { valor_total_proposta_bid_frete_internacional: true },
            where: { status_proposta_bid_frete_internacional: 'APROVADA', data_criacao_proposta_bid_frete_internacional: { gte: periodStart } },
          })
          result.valor_medio_ganho_bid_frete_internacional = Number(agg._avg?.valor_total_proposta_bid_frete_internacional ?? 0)
          break
        }
        case 'cotacoes_status': {
          const items = await prisma.bidFreteInternacionalCotacao.groupBy({
            by: ['status_cotacao_bid_frete_internacional'],
            _count: true,
            where: { data_criacao_cotacao_bid_frete_internacional: { gte: periodStart } },
          })
          result.cotacoes_status = Object.fromEntries(items.map(i => [i.status_cotacao_bid_frete_internacional, i._count]))
          break
        }
        case 'ganho_percentual_ganho_bid_frete_internacional': {
          const agg = await prisma.bidFreteInternacionalGanho.aggregate({
            _avg: { ganho_percentual_ganho_bid_frete_internacional: true },
            where: { data_criacao_ganho_bid_frete_internacional: { gte: periodStart } },
          })
          result.ganho_percentual_ganho_bid_frete_internacional = Number(agg._avg?.ganho_percentual_ganho_bid_frete_internacional ?? 0)
          break
        }
        case 'transit_time': {
          const agg = await prisma.bidFreteInternacionalProposta.aggregate({
            _avg: { dias_transito_proposta_bid_frete_internacional: true },
            where: {
              data_criacao_proposta_bid_frete_internacional: { gte: periodStart },
            },
          })
          result.transit_time = Number(agg._avg?.dias_transito_proposta_bid_frete_internacional ?? 0)
          break
        }
        case 'volume_mensal': {
          const dozeAtras = new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
          const items = await prisma.bidFreteInternacionalCotacao.findMany({
            where: { data_criacao_cotacao_bid_frete_internacional: { gte: dozeAtras } },
            select: { data_criacao_cotacao_bid_frete_internacional: true },
          })
          const byMonth: Record<string, number> = {}
          for (const item of items) {
            const month = item.data_criacao_cotacao_bid_frete_internacional.toISOString().slice(0, 7)
            byMonth[month] = (byMonth[month] ?? 0) + 1
          }
          result.volume_mensal = Object.entries(byMonth).map(([month, value]) => ({ month, value }))
          break
        }
        case 'cotacoes_andamento': {
          const count = await prisma.bidFreteInternacionalCotacao.count({
            where: {
              status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO', 'FALTA_INFORMACAO'] },
              data_criacao_cotacao_bid_frete_internacional: { gte: periodStart }
            },
          })
          result.cotacoes_andamento = count
          break
        }
        case 'cotacoes_passadas': {
          const count = await prisma.bidFreteInternacionalCotacao.count({
            where: {
              status_cotacao_bid_frete_internacional: { in: ['APROVADA', 'REPROVADA', 'CANCELADA', 'EXPIRADA'] },
              data_criacao_cotacao_bid_frete_internacional: { gte: periodStart }
            },
          })
          result.cotacoes_passadas = count
          break
        }
        case 'valor_andamento_usd': {
          const agg = await prisma.bidFreteInternacionalProposta.aggregate({
            where: {
              cotacao: {
                status_cotacao_bid_frete_internacional: { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO'] },
                data_criacao_cotacao_bid_frete_internacional: { gte: periodStart }
              },
            },
            _sum: { valor_total_proposta_bid_frete_internacional: true },
          })
          result.valor_andamento_usd = Number(agg._sum?.valor_total_proposta_bid_frete_internacional ?? 0)
          break
        }
        case 'valor_aprovado_usd': {
          const agg = await prisma.bidFreteInternacionalProposta.aggregate({
            where: {
              status_proposta_bid_frete_internacional: 'APROVADA',
              data_criacao_proposta_bid_frete_internacional: { gte: periodStart }
            },
            _sum: { valor_total_proposta_bid_frete_internacional: true },
          })
          result.valor_aprovado_usd = Number(agg._sum?.valor_total_proposta_bid_frete_internacional ?? 0)
          break
        }
        default:
          break
      }
    }

    res.json(result)
  } catch (err) { next(err) }
})
