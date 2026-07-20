/**
 * dashboard-estimativa-custo.ts — KPIs, recentes e widgets do Dashboard.
 * Routes: /api/v1/simula-custo/dashboard/{kpis,recentes,widgets}
 * Usa req.prisma (tenantIsolationMiddleware) — id_organizacao já filtrado.
 */
import { Router, Response, NextFunction } from 'express'
import { AppError } from '../lib/erros.js'
import type { TenantRequest } from '../middleware/isolamento-tenant.js'
import { WidgetsDashboardEstimativaCustoSchema } from '../shared/dashboard-queries-zod-estimativa-custo.js'
import {
  obterKpisCache, gravarKpisCache,
  obterRecentesCache, gravarRecentesCache,
  type KpisDashboardEstimativaCusto,
  type EstimativaCustoRecente,
} from '../lib/cache-dashboard-estimativa-custo.js'

export const dashboardEstimativaCustoRouter = Router()

function exigirTenant(req: TenantRequest) {
  if (!req.prisma || !req.tenantId) throw new AppError('x-id-organizacao obrigatório', 401, 'UNAUTHORIZED')
  return { prisma: req.prisma, tenantId: req.tenantId }
}

function inicioPeriodo(periodo: string): Date {
  const agora = new Date()
  const mapa: Record<string, Date> = {
    '7d':  new Date(agora.getTime() - 7 * 86400000),
    '30d': new Date(agora.getTime() - 30 * 86400000),
    '90d': new Date(agora.getTime() - 90 * 86400000),
    '12m': new Date(agora.getFullYear() - 1, agora.getMonth(), agora.getDate()),
    'mtd': new Date(agora.getFullYear(), agora.getMonth(), 1),
    'ytd': new Date(agora.getFullYear(), 0, 1),
  }
  return mapa[periodo] ?? mapa['30d']
}

// ─── GET /dashboard/kpis ────────────────────────────────────────────────────────
dashboardEstimativaCustoRouter.get('/kpis', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma, tenantId } = exigirTenant(req)

    const cache = obterKpisCache(tenantId)
    if (cache) return res.json({ fonte: 'cache', kpis: cache })

    const [total, emCriacao, criadas, arquivadas, aggCusto, aggTributos] = await Promise.all([
      prisma.estimativaCusto.count(),
      prisma.estimativaCusto.count({ where: { status_estimativa_custo: 'EM_CRIACAO' } }),
      prisma.estimativaCusto.count({ where: { status_estimativa_custo: 'CRIADA' } }),
      prisma.estimativaCusto.count({ where: { status_estimativa_custo: 'ARQUIVADA' } }),
      prisma.estimativaCusto.aggregate({
        _avg: { custo_nacionalizado_brl_estimativa_custo: true },
        _max: { custo_nacionalizado_brl_estimativa_custo: true },
        _min: { custo_nacionalizado_brl_estimativa_custo: true },
      }),
      prisma.estimativaCusto.aggregate({ _sum: { total_tributos_estimativa_custo: true } }),
    ])

    const kpis: KpisDashboardEstimativaCusto = {
      total_estimativas: total,
      em_criacao: emCriacao,
      criadas,
      arquivadas,
      custo_nacionalizado_medio_brl: aggCusto._avg.custo_nacionalizado_brl_estimativa_custo
        ? Number(aggCusto._avg.custo_nacionalizado_brl_estimativa_custo) : null,
      custo_nacionalizado_maior_brl: aggCusto._max.custo_nacionalizado_brl_estimativa_custo
        ? Number(aggCusto._max.custo_nacionalizado_brl_estimativa_custo) : null,
      custo_nacionalizado_menor_brl: aggCusto._min.custo_nacionalizado_brl_estimativa_custo
        ? Number(aggCusto._min.custo_nacionalizado_brl_estimativa_custo) : null,
      total_tributos_acumulado_brl: aggTributos._sum.total_tributos_estimativa_custo
        ? Number(aggTributos._sum.total_tributos_estimativa_custo) : null,
    }

    gravarKpisCache(tenantId, kpis)
    res.json({ fonte: 'db', kpis })
  } catch (err) { next(err) }
})

// ─── GET /dashboard/recentes ────────────────────────────────────────────────────
dashboardEstimativaCustoRouter.get('/recentes', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma, tenantId } = exigirTenant(req)

    const cache = obterRecentesCache(tenantId)
    if (cache) return res.json({ fonte: 'cache', recentes: cache })

    const linhas = await prisma.estimativaCusto.findMany({
      orderBy: { data_criacao_estimativa_custo: 'desc' },
      take: 10,
      select: {
        id_estimativa_custo: true,
        numero_estimativa_custo: true,
        ncm_estimativa_custo: true,
        status_estimativa_custo: true,
        valor_produto_estimativa_custo: true,
        moeda_produto_estimativa_custo: true,
        custo_nacionalizado_brl_estimativa_custo: true,
        data_criacao_estimativa_custo: true,
      },
    })

    const recentes: EstimativaCustoRecente[] = linhas.map((e) => ({
      id_estimativa_custo: e.id_estimativa_custo,
      numero_estimativa_custo: e.numero_estimativa_custo,
      ncm_estimativa_custo: e.ncm_estimativa_custo,
      status_estimativa_custo: e.status_estimativa_custo,
      valor_produto_estimativa_custo: e.valor_produto_estimativa_custo
        ? Number(e.valor_produto_estimativa_custo) : null,
      moeda_produto_estimativa_custo: e.moeda_produto_estimativa_custo,
      custo_nacionalizado_brl_estimativa_custo: e.custo_nacionalizado_brl_estimativa_custo
        ? Number(e.custo_nacionalizado_brl_estimativa_custo) : null,
      data_criacao_estimativa_custo: e.data_criacao_estimativa_custo.toISOString(),
    }))

    gravarRecentesCache(tenantId, recentes)
    res.json({ fonte: 'db', recentes })
  } catch (err) { next(err) }
})

// ─── POST /dashboard/widgets ────────────────────────────────────────────────────
dashboardEstimativaCustoRouter.post('/widgets', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma } = exigirTenant(req)
    const { metricas, filtros } = WidgetsDashboardEstimativaCustoSchema.parse(req.body)
    const inicio = inicioPeriodo(filtros.periodo)
    const resultado: Record<string, unknown> = {}

    for (const metrica of metricas) {
      switch (metrica) {
        case 'custo_nacionalizado_medio': {
          const agg = await prisma.estimativaCusto.aggregate({
            _avg: { custo_nacionalizado_brl_estimativa_custo: true },
            where: { status_estimativa_custo: 'CRIADA', data_criacao_estimativa_custo: { gte: inicio } },
          })
          resultado.custo_nacionalizado_medio = Number(agg._avg.custo_nacionalizado_brl_estimativa_custo ?? 0)
          break
        }
        case 'estimativas_ativas': {
          resultado.estimativas_ativas = await prisma.estimativaCusto.count({
            where: { status_estimativa_custo: 'CRIADA' },
          })
          break
        }
        case 'total_tributos_medio': {
          const agg = await prisma.estimativaCusto.aggregate({
            _avg: { total_tributos_estimativa_custo: true },
            where: { status_estimativa_custo: 'CRIADA', data_criacao_estimativa_custo: { gte: inicio } },
          })
          resultado.total_tributos_medio = Number(agg._avg.total_tributos_estimativa_custo ?? 0)
          break
        }
        case 'tributos_breakdown': {
          const itens = await prisma.tributoEstimativaCusto.groupBy({
            by: ['tipo_tributo_estimativa_custo'],
            _sum: { valor_tributo_estimativa_custo: true },
            where: {
              estimativa: {
                data_criacao_estimativa_custo: { gte: inicio },
                status_estimativa_custo: 'CRIADA',
              },
            },
          })
          resultado.tributos_breakdown = Object.fromEntries(
            itens.map(i => [i.tipo_tributo_estimativa_custo, Number(i._sum.valor_tributo_estimativa_custo ?? 0)])
          )
          break
        }
        case 'ptax_media': {
          const agg = await prisma.estimativaCusto.aggregate({
            _avg: { ptax_utilizada_estimativa_custo: true },
            where: { status_estimativa_custo: 'CRIADA', data_criacao_estimativa_custo: { gte: inicio } },
          })
          resultado.ptax_media = Number(agg._avg.ptax_utilizada_estimativa_custo ?? 0)
          break
        }
        case 'volume_mensal': {
          const dozeAtras = new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
          const itens = await prisma.estimativaCusto.findMany({
            where: { data_criacao_estimativa_custo: { gte: dozeAtras } },
            select: { data_criacao_estimativa_custo: true },
          })
          const porMes: Record<string, number> = {}
          for (const item of itens) {
            const mes = item.data_criacao_estimativa_custo.toISOString().slice(0, 7)
            porMes[mes] = (porMes[mes] ?? 0) + 1
          }
          resultado.volume_mensal = Object.entries(porMes).map(([mes, valor]) => ({ mes, valor }))
          break
        }
        default:
          break
      }
    }

    res.json(resultado)
  } catch (err) { next(err) }
})
