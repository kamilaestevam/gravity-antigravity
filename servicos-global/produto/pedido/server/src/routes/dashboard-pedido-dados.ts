/**
 * dashboardData.ts — Dados para o dashboard interno do produto Pedido
 *
 * Rota base: /api/v1/pedidos/dashboard
 *
 * Endpoints:
 *   GET /api/v1/pedidos/dashboard/kpis          — KPIs agregados do período (cache 5 min)
 *   GET /api/v1/pedidos/dashboard/bundle        — KPIs + prev + tendência (1 round-trip)
 *   GET /api/v1/pedidos/dashboard/tendencia     — série temporal (mensal)
 *   GET /api/v1/pedidos/dashboard/distribuicao  — distribuição por status
 *   GET /api/v1/pedidos/dashboard/status-ncm    — itens com NCM inválido
 *
 * Autenticação: x-internal-key + x-id-organizacao (via middleware global)
 *
 * Schema real (produto/pedido/server/prisma/schema.prisma):
 *   model Pedido     → db.pedido      → campos: status, valor_total_pedido,
 *                                               quantidade_total_pedido,
 *                                               data_emissao_pedido, deleted_at
 *   model PedidoItem → db.pedidoItem  → campos: quantidade_inicial_pedido,
 *                                               quantidade_atual_pedido,
 *                                               quantidade_transferida_pedido,
 *                                               quantidade_pronta_pedido,
 *                                               valor_total_item
 *
 * Status reais: 'rascunho' | 'aberto' | 'transferencia' | 'consolidado' | 'cancelado'
 *
 * Mapeamento para chaves do catálogo do dashboard:
 *   pedidos_abertos      ← status = 'aberto'
 *   pedidos_em_andamento ← status = 'transferencia'
 *   pedidos_atrasados    ← marcos previstos vencidos sem confirmação (pedidos ativos)
 *   cobertura_pendente   ← soma valor_total_pedido de pedidos com itens sem_cobertura
 */

import { Router, Request, Response } from 'express'
import { withOrganizacao } from '@gravity/resolver-organizacao'
import { generateInsights, normalizeRole, type KpiSnapshot } from '../services/gabiInsightsService.js'
import { getUserBehaviorScores } from '../services/behaviorTrackingService.js'
import { enhanceWithLlm } from '../services/gabiLlmInsightsService.js'
import { clausulaFiltroWorkspacePedido } from '../shared/workspace-filtro-pedido.js'
import { clausulaDataEmissaoPedido, resolverPeriodoPedido } from '../shared/pedido-periodo-filtro.js'
import {
  aggregateDistribution,
  type AggregatedKpis,
  type PedidoRaw,
} from '../shared/dashboard-kpis-aggregate.js'
import { calcularDashboardBundle, calcularKpisDashboardCached } from '../shared/dashboard-bundle-service.js'
import {
  carregarPedidosTendencia,
  montarBucketsTendencia,
  resolverFiltrosDashboard,
} from '../shared/dashboard-agregacao-loader.js'
import { carregarTendenciaMensalSql } from '../shared/dashboard-sql-agregacao.js'

export { aggregateDistribution, aggregateKpis, type AggregatedKpis } from '../shared/dashboard-kpis-aggregate.js'

export const dashboardDataRouter = Router()

// ─────────────────────────────────────────────────────────────────────────────
// Re-export + snapshot Gabi — ver dashboard-kpis-aggregate.ts para agregação pura
// ─────────────────────────────────────────────────────────────────────────────

/** Converte payload de aggregateKpis para KpiSnapshot (insights Gabi). */
export function toKpiSnapshot(agg: AggregatedKpis): KpiSnapshot {
  return {
    total_pedidos: agg.total_pedidos,
    pedidos_abertos: agg.pedidos_abertos,
    pedidos_em_andamento: agg.pedidos_em_andamento,
    pedidos_atrasados: agg.pedidos_atrasados,
    pedidos_sem_exportador: agg.pedidos_sem_exportador,
    pedidos_cancelados: agg.pedidos_cancelados,
    pedidos_consolidados: agg.pedidos_consolidados,
    pedidos_importacao: agg.pedidos_importacao,
    pedidos_exportacao: agg.pedidos_exportacao,
    qtd_saldo_total: agg.qtd_atual_total,
    qtd_pronta_total: agg.itens_prontos,
    qtd_transferida_total: agg.qtd_transferida_total,
    qtd_inicial_total: agg.qtd_inicial_total,
    valor_total: agg.valor_total,
    valor_total_brl: agg.valor_total_brl,
    valor_itens_total: agg.valor_itens_total,
    ticket_medio: agg.ticket_medio,
    taxa_atraso: agg.taxa_atraso,
    taxa_transferencia: agg.taxa_transferencia,
    pedidos_sem_incoterm: agg.pedidos_sem_incoterm,
    pedidos_sem_fabricante: agg.pedidos_sem_fabricante,
    pedidos_sem_proforma: agg.pedidos_sem_proforma,
    pedidos_sem_invoice: agg.pedidos_sem_invoice,
    pedidos_sem_ref_imp: agg.pedidos_sem_ref_imp,
    moedas_distintas: agg.moedas_distintas,
    peso_bruto_total: agg.peso_bruto_total,
    cubagem_total: agg.cubagem_total,
    itens_sem_cobertura: agg.itens_sem_cobertura,
    qtd_cancelada_total: agg.qtd_cancelada_total,
    pedidos_rascunho: agg.pedidos_rascunho,
  }
}

function periodToDateRange(period: string): { from: Date | null; to: Date } {
  const { from, to } = resolverPeriodoPedido(period)
  return { from, to }
}

// ── KPIs agregados ─────────────────────────────────────────────────────────────
dashboardDataRouter.get('/kpis', async (req: Request, res: Response) => {
  const period = (req.query.period as string) ?? '30d'
  const fromParam = req.query.from as string | undefined
  const toParam   = req.query.to   as string | undefined

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kpis = await calcularKpisDashboardCached(rawDb as any, req, period, fromParam, toParam)
      res.json(kpis)
    })
  } catch (err) {
    console.error('[DashboardData/kpis]', err)
    res.status(500).json({ error: 'Erro ao agregar KPIs' })
  }
})

// ── Bundle — KPIs + período anterior + tendência (1 round-trip) ───────────────
dashboardDataRouter.get('/bundle', async (req: Request, res: Response) => {
  const period = (req.query.period as string) ?? '30d'
  const fromParam = req.query.from as string | undefined
  const toParam   = req.query.to   as string | undefined
  const trendPeriod = (req.query.trend_period as string) ?? '12m'
  const trendGranularity = (req.query.granularity as string) ?? 'month'

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bundle = await calcularDashboardBundle(
        rawDb as any,
        req,
        period,
        fromParam,
        toParam,
        trendPeriod,
        trendGranularity,
      )
      res.json(bundle)
    })
  } catch (err) {
    console.error('[DashboardData/bundle]', err)
    res.status(500).json({ error: 'Erro ao montar bundle do dashboard' })
  }
})

// ── Série temporal ────────────────────────────────────────────────────────────
dashboardDataRouter.get('/tendencia', async (req: Request, res: Response) => {
  const period      = (req.query.period as string)      ?? '12m'
  const granularity = (req.query.granularity as string) ?? 'month'

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const { wherePedido } = resolverFiltrosDashboard(req, period)
      if (granularity === 'month') {
        try {
          const value = await carregarTendenciaMensalSql(db, wherePedido)
          res.json({ period, granularity, value })
          return
        } catch (sqlErr) {
          console.warn('[DashboardData/trend] fallback findMany', sqlErr)
        }
      }
      const pedidos = await carregarPedidosTendencia(db, req, period)
      res.json({
        period,
        granularity,
        value: montarBucketsTendencia(pedidos, period, granularity),
      })
    })
  } catch (err) {
    console.error('[DashboardData/trend]', err)
    res.status(500).json({ error: 'Erro ao calcular série temporal' })
  }
})

// ── Insights personalizados da Gabi ───────────────────────────────────────────
// GET /api/v1/pedidos/dashboard/insights
// Retorna insights ranqueados por role (Fase 1) + comportamento (Fase 2) + LLM (Fase 3)
dashboardDataRouter.get('/insights', async (req: Request, res: Response) => {
  const period   = (req.query.period   as string) ?? '30d'
  const rawRole  = (req.headers['x-user-role'] as string | undefined) ?? (req.query.role as string | undefined)
  const role     = normalizeRole(rawRole)
  const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
  const tenantId = ctx.idOrganizacao
  const userId   = ctx.idUsuario ?? 'anonymous'

  const fromParam = req.query.from as string | undefined
  const toParam   = req.query.to   as string | undefined

  try {
    let kpis!: KpiSnapshot
    let behaviorScores: Awaited<ReturnType<typeof getUserBehaviorScores>>

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const agg = await calcularKpisDashboardCached(db, req, period, fromParam, toParam)
      kpis = toKpiSnapshot(agg)

      behaviorScores = await getUserBehaviorScores(db, tenantId, userId)
    })

    // ── 3. Fase 1+2: gerar insights ranqueados ─────────────────────────────────
    let insights = generateInsights(kpis, role, behaviorScores!)

    // ── 4. Fase 3: enriquecer texto via LLM (com fallback automático) ──────────
    insights = await enhanceWithLlm(insights, kpis, tenantId, userId, role)

    res.json({ period, role, insights })
  } catch (err) {
    console.error('[DashboardData/insights]', err)
    res.status(500).json({ error: 'Erro ao gerar insights' })
  }
})

// ── Status NCM — itens com NCM inválido ───────────────────────────────────────
// GET /api/v1/pedidos/dashboard/status-ncm
// Consulta o serviço NCM tenant para saber quais NCMs usados nos itens são inválidos.
// Falha silenciosa: se o serviço NCM estiver offline, retorna sem_sync=true.
dashboardDataRouter.get('/status-ncm', async (req: Request, res: Response) => {
  const tenantId  = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao
  const TENANT_SVC = process.env.TENANT_SERVICE_URL ?? 'http://localhost:3001'
  const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? ''

  try {
    // 1. Buscar todos os NCMs distintos usados em itens ativos deste tenant
    let itensNcm: Array<{ ncm_item: string | null }> = []

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const filtroWorkspace = clausulaFiltroWorkspacePedido(req)
      itensNcm = await db.pedidoItem.findMany({
        where: { pedido_item: { data_exclusao_pedido: null, ...filtroWorkspace } },
        select: { ncm_item: true },
      }) as Array<{ ncm_item: string | null }>

    })

    const codigosUsados = [...new Set(
      itensNcm
        .map(i => (i.ncm_item ?? '').replace(/\D/g, ''))
        .filter((c) => c.length === 8)
    )]

    if (codigosUsados.length === 0) {
      return res.json({ invalidos: [], total_invalidos: 0, total_verificados: 0, sem_sync: false, ultima_sync: null })
    }

    // 2. Perguntar ao serviço NCM quais são inválidos (via S2S)
    const params = new URLSearchParams({
      codigos: codigosUsados.slice(0, 200).join(','),
      limite: '200',
    })

    const ncmRes = await fetch(
      `${TENANT_SVC}/api/v1/ncm/invalidos?${params}`,
      {
        headers: {
          'x-id-organizacao':   tenantId,
          'x-internal-key': INTERNAL_KEY,
        },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!ncmRes.ok) {
      return res.json({ invalidos: [], total_invalidos: 0, total_verificados: codigosUsados.length, sem_sync: true, ultima_sync: null })
    }

    const ncmData = await ncmRes.json() as {
      invalidos: string[]
      total_invalidos: number
      total_verificados: number
      ultima_sync: string | null
    }

    // 3. Contar itens com NCM inválido (não apenas NCMs únicos)
    const invalidSet = new Set(ncmData.invalidos)
    const itensInvalidos = itensNcm
      .filter(i => {
        const c = (i.ncm_item ?? '').replace(/\D/g, '')
        return c.length === 8 && invalidSet.has(c)
      }).length

    res.json({
      invalidos:         ncmData.invalidos,
      total_invalidos:   ncmData.total_invalidos,
      itens_invalidos:   itensInvalidos,
      total_verificados: codigosUsados.length,
      sem_sync:          !ncmData.ultima_sync,
      ultima_sync:       ncmData.ultima_sync,
    })
  } catch {
    // Serviço NCM offline — resposta silenciosa
    res.json({ invalidos: [], total_invalidos: 0, itens_invalidos: 0, total_verificados: 0, sem_sync: true, ultima_sync: null })
  }
})

// ── Distribuição por status ────────────────────────────────────────────────────
dashboardDataRouter.get('/distribuicao', async (req: Request, res: Response) => {
  const period = (req.query.period as string) ?? '30d'
  const { from, to } = periodToDateRange(period)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const filtroWorkspace = clausulaFiltroWorkspacePedido(req)

      const pedidos = await db.pedido.findMany({
        where: {
          data_exclusao_pedido: null,
          ...filtroWorkspace,
          ...clausulaDataEmissaoPedido(from, to),
        },
        select: { status_pedido: true, valor_total_pedido: true },
      })

      res.json(aggregateDistribution(pedidos as PedidoRaw[], period))
    })
  } catch (err) {
    console.error('[DashboardData/distribution]', err)
    res.status(500).json({ error: 'Erro ao calcular distribuição' })
  }
})
