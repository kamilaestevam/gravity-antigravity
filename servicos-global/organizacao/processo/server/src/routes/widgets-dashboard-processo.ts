/**
 * dashboard.routes.ts — Endpoint de widgets para o serviço de Dashboard
 * POST /widgets — recebe métricas solicitadas e retorna valores agregados
 * Serve dois produtos no mesmo banco:
 *   - POST /api/v1/processos/dashboard/widgets
 *   - POST /api/v1/pedidos/dashboard/widgets
 * Chamado pelo servico de dashboard interno via x-internal-key
 */

import { Router } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'
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

        // ── Métricas de Processo ────────────────────────────────────────────────

        case 'total_ativos': {
          const count = await prisma.processoGravity.count({
            where: { status: { in: ['aberto', 'em_andamento'] } },
          })
          result.total_ativos = count
          break
        }
        case 'atraso_chegada': {
          const processos = await prisma.processoGravity.findMany({
            where: {
              data_chegada_real: { not: null },
              data_chegada_prevista: { not: null },
              created_at: { gte: periodStart },
            },
            select: { data_chegada_real: true, data_chegada_prevista: true },
          })
          const deltas = processos.map(
            p => (p.data_chegada_real!.getTime() - p.data_chegada_prevista!.getTime()) / 86400000
          )
          result.atraso_chegada =
            deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0
          break
        }
        case 'etapas_atrasadas': {
          const count = await prisma.processoEtapas.count({
            where: { status: 'pendente', data_realizada: { not: null } },
          })
          result.etapas_atrasadas = count
          break
        }
        case 'por_status': {
          const items = await prisma.processoGravity.groupBy({
            by: ['status'],
            _count: true,
            where: { created_at: { gte: periodStart } },
          })
          result.por_status = Object.fromEntries(items.map(i => [i.status, i._count]))
          break
        }
        case 'chegadas_7d': {
          const agora = new Date()
          const em7d = new Date(agora.getTime() + 7 * 86400000)
          const count = await prisma.processoGravity.count({
            where: { data_chegada_prevista: { gte: agora, lte: em7d } },
          })
          result.chegadas_7d = count
          break
        }
        case 'volume_mensal': {
          const dozeAtras = new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
          const items = await prisma.processoGravity.findMany({
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

        // ── Métricas de Pedido (mesmo banco) ───────────────────────────────────

        case 'total_abertos': {
          const count = await prisma.processoPedido.count({
            where: { status: 'pendente', created_at: { gte: periodStart } },
          })
          result.total_abertos = count
          break
        }
        case 'valor_fob_total': {
          const agg = await prisma.processoPedido.aggregate({
            _sum: { valor_fob: true },
            where: { created_at: { gte: periodStart } },
          })
          result.valor_fob_total = Number(agg._sum.valor_fob ?? 0)
          break
        }
        case 'pedido_por_status': {
          const items = await prisma.processoPedido.groupBy({
            by: ['status'],
            _count: true,
            where: { created_at: { gte: periodStart } },
          })
          result.pedido_por_status = Object.fromEntries(items.map(i => [i.status, i._count]))
          break
        }
        case 'pedido_volume_mensal': {
          const dozeAtras = new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
          const items = await prisma.processoPedido.findMany({
            where: { created_at: { gte: dozeAtras } },
            select: { created_at: true },
          })
          const byMonth: Record<string, number> = {}
          for (const item of items) {
            const month = item.created_at.toISOString().slice(0, 7)
            byMonth[month] = (byMonth[month] ?? 0) + 1
          }
          result.pedido_volume_mensal = Object.entries(byMonth).map(([month, value]) => ({ month, value }))
          break
        }
        case 'itens_ncm': {
          const items = await prisma.processoPedidoItens.groupBy({
            by: ['ncm'],
            _count: true,
            where: { ncm: { not: null } },
            orderBy: { _count: { ncm: 'desc' } },
            take: 10,
          })
          result.itens_ncm = Object.fromEntries(
            items.map(i => [i.ncm ?? 'N/A', i._count])
          )
          break
        }
        case 'valor_por_fornecedor': {
          const items = await prisma.processoPedido.groupBy({
            by: ['fornecedor_id'],
            _sum: { valor_fob: true },
            where: { created_at: { gte: periodStart } },
            orderBy: { _sum: { valor_fob: 'desc' } },
            take: 10,
          })
          result.valor_por_fornecedor = Object.fromEntries(
            items.map(i => [i.fornecedor_id ?? 'desconhecido', Number(i._sum.valor_fob ?? 0)])
          )
          break
        }
        default:
          break
      }
    }

    res.json(result)
  } catch (err) { next(err) }
})
