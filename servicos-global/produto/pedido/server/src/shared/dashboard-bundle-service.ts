/**
 * Serviço compartilhado — KPIs + bundle do Dashboard Pedido (cache + SQL P1).
 */

import type { Request } from 'express'
import type { AggregatedKpis } from './dashboard-kpis-aggregate.js'
import {
  carregarPedidosTendencia,
  escopoHashFromRequest,
  montarBucketsTendencia,
  resolverFiltrosDashboard,
} from './dashboard-agregacao-loader.js'
import {
  chaveCacheDashboardBundle,
  chaveCacheDashboardKpis,
  getCachedDashboardBundle,
  getCachedDashboardKpis,
  setCachedDashboardBundle,
  setCachedDashboardKpis,
  type DashboardBundlePayload,
} from './dashboard-cache-pedido.js'
import { calcularKpisDashboardSql, carregarTendenciaMensalSql } from './dashboard-sql-agregacao.js'
import { resolverPeriodoAnterior } from './pedido-periodo-filtro.js'

function sufixoCachePeriodo(fromParam?: string, toParam?: string): string {
  if (fromParam && toParam) return `r:${fromParam}:${toParam}`
  return 'atual'
}

function idOrganizacaoFromReq(req: Request): string {
  const ctx = req as Request & { organizacao?: { idOrganizacao?: string } }
  return ctx.organizacao?.idOrganizacao ?? ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbLike = any

export async function calcularKpisDashboardCached(
  db: DbLike,
  req: Request,
  period: string,
  fromParam?: string,
  toParam?: string,
): Promise<AggregatedKpis> {
  const idOrganizacao = idOrganizacaoFromReq(req)
  const escopoHash = escopoHashFromRequest(req)
  const sufixo = sufixoCachePeriodo(fromParam, toParam)
  const cacheKey = chaveCacheDashboardKpis(idOrganizacao, escopoHash, period, sufixo)

  const cached = await getCachedDashboardKpis(cacheKey)
  if (cached) return cached

  const { wherePedido, whereItemPedido } = resolverFiltrosDashboard(req, period, fromParam, toParam)
  const kpis = await calcularKpisDashboardSql(db, wherePedido, whereItemPedido, period)
  await setCachedDashboardKpis(cacheKey, kpis)
  return kpis
}

async function carregarTrendBuckets(
  db: DbLike,
  req: Request,
  trendPeriod: string,
  trendGranularity: string,
): Promise<DashboardBundlePayload['trend']['value']> {
  const { wherePedido } = resolverFiltrosDashboard(req, trendPeriod)
  if (trendGranularity === 'month') {
    try {
      return await carregarTendenciaMensalSql(db, wherePedido)
    } catch (err) {
      console.warn('[Dashboard/trend-sql] fallback findMany', err)
    }
  }
  const pedidos = await carregarPedidosTendencia(db, req, trendPeriod)
  return montarBucketsTendencia(pedidos, trendPeriod, trendGranularity)
}

export async function calcularDashboardBundle(
  db: DbLike,
  req: Request,
  period: string,
  fromParam?: string,
  toParam?: string,
  trendPeriod = '12m',
  trendGranularity = 'month',
): Promise<DashboardBundlePayload> {
  const idOrganizacao = idOrganizacaoFromReq(req)
  const escopoHash = escopoHashFromRequest(req)
  const bundleKey = chaveCacheDashboardBundle(
    idOrganizacao,
    escopoHash,
    `${period}:${sufixoCachePeriodo(fromParam, toParam)}:${trendPeriod}`,
  )

  const cachedBundle = await getCachedDashboardBundle(bundleKey)
  if (cachedBundle) return cachedBundle

  const [kpis, trendBuckets] = await Promise.all([
    calcularKpisDashboardCached(db, req, period, fromParam, toParam),
    carregarTrendBuckets(db, req, trendPeriod, trendGranularity),
  ])

  let prev_kpis: AggregatedKpis | null = null
  const prevRange = resolverPeriodoAnterior(period)
  if (prevRange && period !== 'tudo' && !fromParam) {
    prev_kpis = await calcularKpisDashboardCached(
      db,
      req,
      period,
      prevRange.from.toISOString(),
      prevRange.to.toISOString(),
    )
  }

  const payload: DashboardBundlePayload = {
    period,
    kpis,
    prev_kpis,
    trend: {
      period: trendPeriod,
      granularity: trendGranularity,
      value: trendBuckets,
    },
    cached: false,
    computed_at: new Date().toISOString(),
  }

  await setCachedDashboardBundle(bundleKey, payload)
  return payload
}
