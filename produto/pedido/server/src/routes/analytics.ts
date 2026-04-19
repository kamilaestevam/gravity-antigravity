/**
 * analytics.ts — Endpoint de integração nativa Power BI / BI externo
 *
 * Rota base: /api/v1/analytics/pedido
 *
 * Endpoints:
 *   GET  /api/v1/analytics/pedido/metadata        — catálogo de campos (OData $metadata)
 *   GET  /api/v1/analytics/pedido/kpis            — KPIs agregados do período
 *   GET  /api/v1/analytics/pedido/trend           — série temporal (campo + granularidade)
 *   GET  /api/v1/analytics/pedido/distribution    — distribuição por status/campo categórico
 *   GET  /api/v1/analytics/pedido/items           — dados de itens agregados
 *   GET  /api/v1/analytics/pedido/raw             — dados brutos paginados (refresh Power BI)
 *
 * Formato de resposta: OData JSON v4 compatível (Power BI aceita nativamente)
 * Autenticação: Bearer <ANALYTICS_API_KEY> + x-tenant-id header
 *
 * Skill: skills/servicos/dashboard/SKILL.md
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { analyticsAuth } from '../middleware/analyticsAuth.js'
import { withTenant } from '@gravity/tenant-resolver'

export const analyticsRouter = Router()

// ── Todos os endpoints exigem autenticação analytics ─────────────────────────
analyticsRouter.use(analyticsAuth)

// ── Helpers ───────────────────────────────────────────────────────────────────

function periodToDateRange(period: string): { from: Date; to: Date } {
  const to = new Date()
  const from = new Date()
  switch (period) {
    case '7d':  from.setDate(to.getDate() - 7);    break
    case '30d': from.setDate(to.getDate() - 30);   break
    case '90d': from.setDate(to.getDate() - 90);   break
    case '6m':  from.setMonth(to.getMonth() - 6);  break
    case '12m': from.setFullYear(to.getFullYear() - 1); break
    case 'ytd': from.setMonth(0, 1); from.setHours(0, 0, 0, 0); break
    default:    from.setDate(to.getDate() - 30)
  }
  return { from, to }
}

// ── OData metadata ($metadata) ────────────────────────────────────────────────
// Descreve o schema para o Power BI configurar tipos corretamente
analyticsRouter.get('/metadata', (_req: Request, res: Response) => {
  res.json({
    '@odata.context': '/api/v1/analytics/pedido/$metadata',
    '@odata.version': '4.0',
    'EntitySets': [
      {
        name: 'Pedidos',
        entityType: 'Gravity.Pedido',
        properties: [
          { name: 'tenant_id',         type: 'Edm.String',   nullable: false },
          { name: 'id',                type: 'Edm.String',   nullable: false, key: true },
          { name: 'numero',            type: 'Edm.String',   nullable: false },
          { name: 'status',            type: 'Edm.String',   nullable: false },
          { name: 'valor_total',       type: 'Edm.Decimal',  precision: 18, scale: 2 },
          { name: 'cobertura_pendente',type: 'Edm.Decimal',  precision: 18, scale: 2 },
          { name: 'qtd_total',         type: 'Edm.Int32' },
          { name: 'criado_em',         type: 'Edm.DateTimeOffset' },
          { name: 'atualizado_em',     type: 'Edm.DateTimeOffset' },
          { name: 'prazo',             type: 'Edm.DateTimeOffset', nullable: true },
        ],
      },
      {
        name: 'ItensPedido',
        entityType: 'Gravity.ItemPedido',
        properties: [
          { name: 'tenant_id',         type: 'Edm.String',   nullable: false },
          { name: 'id',                type: 'Edm.String',   nullable: false, key: true },
          { name: 'pedido_id',         type: 'Edm.String',   nullable: false },
          { name: 'descricao_item',     type: 'Edm.String' },
          { name: 'qtd_inicial',       type: 'Edm.Decimal',  precision: 18, scale: 4 },
          { name: 'qtd_atual',         type: 'Edm.Decimal',  precision: 18, scale: 4 },
          { name: 'qtd_transferida',   type: 'Edm.Decimal',  precision: 18, scale: 4 },
          { name: 'valor_por_unidade_item', type: 'Edm.Decimal',  precision: 18, scale: 2 },
          { name: 'pronto',            type: 'Edm.Boolean' },
        ],
      },
    ],
  })
})

// ── KPIs agregados ─────────────────────────────────────────────────────────────
const KpisQuerySchema = z.object({
  period: z.string().default('30d'),
})

analyticsRouter.get('/kpis', async (req: Request, res: Response) => {
  const parse = KpisQuerySchema.safeParse(req.query)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { period } = parse.data
  const { from, to } = periodToDateRange(period)

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const [pedidosRaw, itensPedidoRaw] = await Promise.all([
        db.pedido.findMany({
          where: { criado_em: { gte: from, lte: to } },
          select: {
            id: true,
            status: true,
            valor_total: true,
            cobertura_pendente: true,
            qtd_total: true,
            prazo: true,
            criado_em: true,
          },
        }),
        db.itemPedido.findMany({
          where: { pedido: { criado_em: { gte: from, lte: to } } },
          select: {
            qtd_inicial: true,
            qtd_atual: true,
            qtd_transferida: true,
            valor_por_unidade_item: true,
            qtd_inicial_val: true,
            pronto: true,
          },
        }),
      ])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pedidos = pedidosRaw as any[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itensPedido = itensPedidoRaw as any[]

      const now = new Date()
      const total_pedidos        = pedidos.length
      const pedidos_abertos      = pedidos.filter((p) => p.status === 'ABERTO').length
      const pedidos_em_andamento = pedidos.filter((p) => p.status === 'EM_ANDAMENTO').length
      const pedidos_atrasados    = pedidos.filter((p) =>
        p.prazo && new Date(p.prazo) < now && !['CONCLUIDO', 'CANCELADO'].includes(p.status),
      ).length

      const valor_total        = pedidos.reduce((s: number, p) => s + Number(p.valor_total ?? 0), 0)
      const cobertura_pendente = pedidos.reduce((s: number, p) => s + Number(p.cobertura_pendente ?? 0), 0)
      const qtd_total          = pedidos.reduce((s: number, p) => s + Number(p.qtd_total ?? 0), 0)

      const itens_prontos          = itensPedido.filter((i) => i.pronto).length
      const qtd_inicial_total      = itensPedido.reduce((s: number, i) => s + Number(i.qtd_inicial ?? 0), 0)
      const qtd_atual_total        = itensPedido.reduce((s: number, i) => s + Number(i.qtd_atual ?? 0), 0)
      const qtd_transferida_total  = itensPedido.reduce((s: number, i) => s + Number(i.qtd_transferida ?? 0), 0)
      const valor_itens_total      = itensPedido.reduce(
        (s: number, i) => s + Number(i.valor_por_unidade_item ?? 0) * Number(i.qtd_inicial ?? 0), 0,
      )

      res.json({
        '@odata.context': '/api/v1/analytics/pedido/$metadata#KPIs',
        period,
        date_range: { from: from.toISOString(), to: to.toISOString() },
        value: {
          // Pedido
          total_pedidos,
          pedidos_abertos,
          pedidos_em_andamento,
          pedidos_atrasados,
          valor_total,
          cobertura_pendente,
          qtd_total,
          // Item
          itens_prontos,
          qtd_inicial_total,
          qtd_atual_total,
          qtd_transferida_total,
          valor_itens_total,
          // Derivadas
          taxa_atraso:           total_pedidos > 0 ? (pedidos_atrasados / total_pedidos) * 100 : null,
          ticket_medio:          total_pedidos > 0 ? valor_total / total_pedidos : null,
          taxa_conclusao_itens:  qtd_inicial_total > 0 ? (itens_prontos / qtd_inicial_total) * 100 : null,
          exposicao_financeira:  valor_total > 0 ? (cobertura_pendente / valor_total) * 100 : null,
          taxa_transferencia:    qtd_inicial_total > 0 ? (qtd_transferida_total / qtd_inicial_total) * 100 : null,
        },
      })
    })
  } catch (err) {
    console.error('[Analytics/kpis]', err)
    res.status(500).json({ error: 'Erro ao agregar KPIs' })
  }
})

// ── Série temporal ─────────────────────────────────────────────────────────────
const TrendQuerySchema = z.object({
  field:        z.enum(['valor_total', 'cobertura_pendente', 'valor_itens_total', 'total_pedidos']).default('valor_total'),
  period:       z.string().default('12m'),
  granularity:  z.enum(['day', 'week', 'month']).default('month'),
})

analyticsRouter.get('/trend', async (req: Request, res: Response) => {
  const parse = TrendQuerySchema.safeParse(req.query)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { period, granularity } = parse.data
  const { from, to } = periodToDateRange(period)

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const pedidosRaw = await db.pedido.findMany({
        where: { criado_em: { gte: from, lte: to } },
        select: {
          criado_em: true,
          valor_total: true,
          cobertura_pendente: true,
          status: true,
        },
        orderBy: { criado_em: 'asc' },
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pedidos = pedidosRaw as any[]

      // Agrupa por período
      const buckets: Record<string, { label: string; date: string; valor_total: number; cobertura_pendente: number; count: number }> = {}

      for (const p of pedidos) {
        const d = new Date(p.criado_em)
        let key: string
        let label: string

        if (granularity === 'month') {
          key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          label = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
        } else if (granularity === 'week') {
          const startOfWeek = new Date(d)
          startOfWeek.setDate(d.getDate() - d.getDay())
          key = startOfWeek.toISOString().slice(0, 10)
          label = `Sem ${key}`
        } else {
          key = d.toISOString().slice(0, 10)
          label = key
        }

        if (!buckets[key]) buckets[key] = { label, date: key, valor_total: 0, cobertura_pendente: 0, count: 0 }
        buckets[key].valor_total       += Number(p.valor_total ?? 0)
        buckets[key].cobertura_pendente += Number(p.cobertura_pendente ?? 0)
        buckets[key].count++
      }

      res.json({
        '@odata.context': '/api/v1/analytics/pedido/$metadata#Trend',
        period,
        granularity,
        'value@odata.count': Object.keys(buckets).length,
        value: Object.values(buckets),
      })
    })
  } catch (err) {
    console.error('[Analytics/trend]', err)
    res.status(500).json({ error: 'Erro ao calcular série temporal' })
  }
})

// ── Distribuição por status ────────────────────────────────────────────────────
const DistributionQuerySchema = z.object({
  period: z.string().default('30d'),
  field:  z.enum(['status']).default('status'),
})

analyticsRouter.get('/distribution', async (req: Request, res: Response) => {
  const parse = DistributionQuerySchema.safeParse(req.query)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { period } = parse.data
  const { from, to } = periodToDateRange(period)

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const pedidosRaw = await db.pedido.findMany({
        where: { criado_em: { gte: from, lte: to } },
        select: { status: true, valor_total: true },
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pedidos = pedidosRaw as any[]

      const groups: Record<string, { status: string; count: number; valor_total: number }> = {}
      for (const p of pedidos) {
        if (!groups[p.status]) groups[p.status] = { status: p.status, count: 0, valor_total: 0 }
        groups[p.status].count++
        groups[p.status].valor_total += Number(p.valor_total ?? 0)
      }

      res.json({
        '@odata.context': '/api/v1/analytics/pedido/$metadata#Distribution',
        period,
        'value@odata.count': Object.keys(groups).length,
        value: Object.values(groups),
      })
    })
  } catch (err) {
    console.error('[Analytics/distribution]', err)
    res.status(500).json({ error: 'Erro ao calcular distribuição' })
  }
})

// ── Dados de itens agregados ───────────────────────────────────────────────────
analyticsRouter.get('/items', async (req: Request, res: Response) => {
  const period = (req.query.period as string) ?? '30d'
  const { from, to } = periodToDateRange(period)

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const itens = await db.itemPedido.findMany({
        where: { pedido: { criado_em: { gte: from, lte: to } } },
        select: {
          id: true,
          pedido_id: true,
          descricao_item: true,
          qtd_inicial: true,
          qtd_atual: true,
          qtd_transferida: true,
          valor_por_unidade_item: true,
          pronto: true,
        },
        orderBy: { pedido_id: 'asc' },
      })

      res.json({
        '@odata.context': '/api/v1/analytics/pedido/$metadata#ItensPedido',
        period,
        'value@odata.count': itens.length,
        value: itens,
      })
    })
  } catch (err) {
    console.error('[Analytics/items]', err)
    res.status(500).json({ error: 'Erro ao buscar itens' })
  }
})

// ── Raw data paginado (Power BI refresh completo) ─────────────────────────────
const RawQuerySchema = z.object({
  period:   z.string().default('12m'),
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(10000).default(1000),
})

analyticsRouter.get('/raw', async (req: Request, res: Response) => {
  const parse = RawQuerySchema.safeParse(req.query)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { period, page, pageSize } = parse.data
  const { from, to } = periodToDateRange(period)

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const [total, pedidos] = await Promise.all([
        db.pedido.count({ where: { criado_em: { gte: from, lte: to } } }),
        db.pedido.findMany({
          where: { criado_em: { gte: from, lte: to } },
          select: {
            id: true,
            numero: true,
            status: true,
            valor_total: true,
            cobertura_pendente: true,
            qtd_total: true,
            criado_em: true,
            prazo: true,
            itens: {
              select: {
                id: true,
                descricao_item: true,
                qtd_inicial: true,
                qtd_atual: true,
                qtd_transferida: true,
                valor_por_unidade_item: true,
                pronto: true,
              },
            },
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { criado_em: 'desc' },
        }),
      ])

      const totalPages = Math.ceil(total / pageSize)
      const nextLink = page < totalPages
        ? `/api/v1/analytics/pedido/raw?period=${period}&page=${page + 1}&pageSize=${pageSize}`
        : undefined

      res.json({
        '@odata.context':  '/api/v1/analytics/pedido/$metadata#Pedidos',
        '@odata.count':    total,
        '@odata.nextLink': nextLink,
        value: pedidos,
      })
    })
  } catch (err) {
    console.error('[Analytics/raw]', err)
    res.status(500).json({ error: 'Erro ao buscar dados raw' })
  }
})
