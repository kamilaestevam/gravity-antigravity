/**
 * dashboard-simula-custo.ts — KPIs, recentes e widgets do Dashboard.
 * Routes: /api/v1/simula-custo/dashboard/{kpis,recentes,ncms-recentes,widgets}
 * Usa req.prisma (tenantIsolationMiddleware) — id_organizacao já filtrado.
 */
import { Router, Response, NextFunction } from 'express'
import { AppError } from '../lib/erros.js'
import type { TenantRequest } from '../middleware/isolamento-tenant.js'
import { WidgetsDashboardSimulaCustoSchema } from '../shared/dashboard-queries-zod-simula-custo.js'
import {
  obterKpisCache, gravarKpisCache,
  obterRecentesCache, gravarRecentesCache,
  type KpisDashboardSimulaCusto,
  type SimulaCustoRecente,
} from '../lib/cache-dashboard-simula-custo.js'

export const dashboardSimulaCustoRouter = Router()

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
dashboardSimulaCustoRouter.get('/kpis', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma, tenantId } = exigirTenant(req)

    const cache = obterKpisCache(tenantId)
    if (cache) return res.json({ fonte: 'cache', kpis: cache })

    const [total, emCriacao, criadas, arquivadas, aggCusto, aggTributos] = await Promise.all([
      prisma.simulaCusto.count(),
      prisma.simulaCusto.count({ where: { status_simula_custo: 'EM_CRIACAO' } }),
      prisma.simulaCusto.count({ where: { status_simula_custo: 'CRIADA' } }),
      prisma.simulaCusto.count({ where: { status_simula_custo: 'ARQUIVADA' } }),
      prisma.simulaCusto.aggregate({
        _avg: { custo_nacionalizado_brl_simula_custo: true },
        _max: { custo_nacionalizado_brl_simula_custo: true },
        _min: { custo_nacionalizado_brl_simula_custo: true },
      }),
      prisma.simulaCusto.aggregate({ _sum: { total_tributos_simula_custo: true } }),
    ])

    const kpis: KpisDashboardSimulaCusto = {
      total_simulas: total,
      em_criacao: emCriacao,
      criadas,
      arquivadas,
      custo_nacionalizado_medio_brl: aggCusto._avg.custo_nacionalizado_brl_simula_custo
        ? Number(aggCusto._avg.custo_nacionalizado_brl_simula_custo) : null,
      custo_nacionalizado_maior_brl: aggCusto._max.custo_nacionalizado_brl_simula_custo
        ? Number(aggCusto._max.custo_nacionalizado_brl_simula_custo) : null,
      custo_nacionalizado_menor_brl: aggCusto._min.custo_nacionalizado_brl_simula_custo
        ? Number(aggCusto._min.custo_nacionalizado_brl_simula_custo) : null,
      total_tributos_acumulado_brl: aggTributos._sum.total_tributos_simula_custo
        ? Number(aggTributos._sum.total_tributos_simula_custo) : null,
    }

    gravarKpisCache(tenantId, kpis)
    res.json({ fonte: 'db', kpis })
  } catch (err) { next(err) }
})

// ─── GET /dashboard/recentes ────────────────────────────────────────────────────
dashboardSimulaCustoRouter.get('/recentes', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma, tenantId } = exigirTenant(req)

    const cache = obterRecentesCache(tenantId)
    if (cache) return res.json({ fonte: 'cache', recentes: cache })

    const linhas = await prisma.simulaCusto.findMany({
      orderBy: { data_criacao_simula_custo: 'desc' },
      take: 10,
      select: {
        id_simula_custo: true,
        numero_simula_custo: true,
        ncm_simula_custo: true,
        status_simula_custo: true,
        valor_produto_simula_custo: true,
        moeda_produto_simula_custo: true,
        custo_nacionalizado_brl_simula_custo: true,
        data_criacao_simula_custo: true,
      },
    })

    const recentes: SimulaCustoRecente[] = linhas.map((e) => ({
      id_simula_custo: e.id_simula_custo,
      numero_simula_custo: e.numero_simula_custo,
      ncm_simula_custo: e.ncm_simula_custo,
      status_simula_custo: e.status_simula_custo,
      valor_produto_simula_custo: e.valor_produto_simula_custo
        ? Number(e.valor_produto_simula_custo) : null,
      moeda_produto_simula_custo: e.moeda_produto_simula_custo,
      custo_nacionalizado_brl_simula_custo: e.custo_nacionalizado_brl_simula_custo
        ? Number(e.custo_nacionalizado_brl_simula_custo) : null,
      data_criacao_simula_custo: e.data_criacao_simula_custo.toISOString(),
    }))

    gravarRecentesCache(tenantId, recentes)
    res.json({ fonte: 'db', recentes })
  } catch (err) { next(err) }
})

const LIMITE_NCMS_RECENTES = 30

// ─── GET /dashboard/ncms-recentes ───────────────────────────────────────────────
/** NCMs distintos das simulas mais recentes da organização (até 30). */
dashboardSimulaCustoRouter.get('/ncms-recentes', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma } = exigirTenant(req)

    const linhas = await prisma.simulaCusto.findMany({
      orderBy: { data_criacao_simula_custo: 'desc' },
      take: 250,
      select: {
        ncm_simula_custo: true,
        descricao_ncm_simula_custo: true,
      },
    })

    const visto = new Set<string>()
    const ncms: Array<{ codigo: string; descricao?: string }> = []
    for (const linha of linhas) {
      const codigo = String(linha.ncm_simula_custo ?? '').replace(/\D/g, '').slice(0, 8)
      if (codigo.length !== 8 || visto.has(codigo)) continue
      visto.add(codigo)
      const descricao = linha.descricao_ncm_simula_custo?.trim()
      ncms.push(descricao ? { codigo, descricao } : { codigo })
      if (ncms.length >= LIMITE_NCMS_RECENTES) break
    }

    res.json({ ncms })
  } catch (err) { next(err) }
})

// ─── POST /dashboard/widgets ────────────────────────────────────────────────────
dashboardSimulaCustoRouter.post('/widgets', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { prisma } = exigirTenant(req)
    const { metricas, filtros } = WidgetsDashboardSimulaCustoSchema.parse(req.body)
    const inicio = inicioPeriodo(filtros.periodo)
    const resultado: Record<string, unknown> = {}

    for (const metrica of metricas) {
      switch (metrica) {
        case 'custo_nacionalizado_medio': {
          const agg = await prisma.simulaCusto.aggregate({
            _avg: { custo_nacionalizado_brl_simula_custo: true },
            where: { status_simula_custo: 'CRIADA', data_criacao_simula_custo: { gte: inicio } },
          })
          resultado.custo_nacionalizado_medio = Number(agg._avg.custo_nacionalizado_brl_simula_custo ?? 0)
          break
        }
        case 'simulas_ativas': {
          resultado.simulas_ativas = await prisma.simulaCusto.count({
            where: { status_simula_custo: 'CRIADA' },
          })
          break
        }
        case 'total_tributos_medio': {
          const agg = await prisma.simulaCusto.aggregate({
            _avg: { total_tributos_simula_custo: true },
            where: { status_simula_custo: 'CRIADA', data_criacao_simula_custo: { gte: inicio } },
          })
          resultado.total_tributos_medio = Number(agg._avg.total_tributos_simula_custo ?? 0)
          break
        }
        case 'tributos_breakdown': {
          const agg = await prisma.simulaCusto.aggregate({
            _sum: {
              valor_ii_simula_custo: true,
              valor_ipi_simula_custo: true,
              valor_pis_simula_custo: true,
              valor_cofins_simula_custo: true,
              valor_icms_simula_custo: true,
            },
            where: {
              status_simula_custo: 'CRIADA',
              data_criacao_simula_custo: { gte: inicio },
            },
          })
          resultado.tributos_breakdown = {
            II: Number(agg._sum.valor_ii_simula_custo ?? 0),
            IPI: Number(agg._sum.valor_ipi_simula_custo ?? 0),
            PIS: Number(agg._sum.valor_pis_simula_custo ?? 0),
            COFINS: Number(agg._sum.valor_cofins_simula_custo ?? 0),
            ICMS: Number(agg._sum.valor_icms_simula_custo ?? 0),
          }
          break
        }
        case 'ptax_media': {
          const agg = await prisma.simulaCusto.aggregate({
            _avg: { ptax_utilizada_simula_custo: true },
            where: { status_simula_custo: 'CRIADA', data_criacao_simula_custo: { gte: inicio } },
          })
          resultado.ptax_media = Number(agg._avg.ptax_utilizada_simula_custo ?? 0)
          break
        }
        case 'volume_mensal': {
          const dozeAtras = new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
          const itens = await prisma.simulaCusto.findMany({
            where: { data_criacao_simula_custo: { gte: dozeAtras } },
            select: { data_criacao_simula_custo: true },
          })
          const porMes: Record<string, number> = {}
          for (const item of itens) {
            const mes = item.data_criacao_simula_custo.toISOString().slice(0, 7)
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
