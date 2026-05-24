/**
 * dashboardData.ts — Dados para o dashboard interno do produto Pedido
 *
 * Rota base: /api/v1/pedidos/dashboard
 *
 * Endpoints:
 *   GET /api/v1/pedidos/dashboard/kpis          — KPIs agregados do período
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
import { isEmAndamento, isPedidoAtrasado, safeNum } from '../shared/lista-card-aggregate.js'

export const dashboardDataRouter = Router()

const CONFIGURADOR_URL = process.env.CONFIGURADOR_URL ?? 'http://localhost:8005'

/** Busca as taxas PTAX do configurador e retorna um mapa moeda → taxa de venda.
 *  Usa o boletim mais recente disponível. Falha silenciosa — retorna {} se offline. */
async function buscarTaxasVenda(): Promise<Record<string, number>> {
  try {
    const r = await fetch(`${CONFIGURADOR_URL}/api/v1/taxa-cambio`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!r.ok) return {}
    const json = await r.json() as { por_moeda?: Record<string, Array<{ venda: string | number }>> }
    const taxas: Record<string, number> = { BRL: 1 }
    for (const [moeda, boletins] of Object.entries(json.por_moeda ?? {})) {
      if (!boletins.length) continue
      // Último boletim do dia (Fechamento ou o mais recente)
      const ultimo = boletins[boletins.length - 1]
      if (ultimo?.venda) taxas[moeda] = Number(ultimo.venda)
    }
    return taxas
  } catch {
    return { BRL: 1 }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Funções puras de agregação — extraídas dos handlers para serem testáveis em
// isolamento (sem express, sem Prisma). Recebem dados crus já filtrados pelo
// período e devolvem o payload exato que o /kpis ou /distribuicao retornam.
// Mandamentos 03 + 06 + 09: schema drift aqui re-introduzido quebra os testes
// unitários em testes/testes-unitarios/pedido/dashboard/.
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PedidoRaw = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemRaw = Record<string, any>

export interface AggregatedKpis {
  period: string
  total_pedidos: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  pedidos_consolidados: number
  pedidos_cancelados: number
  pedidos_rascunho: number
  pedidos_atrasados: number
  pedidos_sem_exportador: number
  pedidos_importacao: number
  pedidos_exportacao: number
  valor_total: number
  valor_total_brl: number
  moedas_sem_taxa: string[]
  cobertura_pendente: number
  qtd_total: number
  ticket_medio: number
  itens_prontos: number
  qtd_inicial_total: number
  qtd_atual_total: number
  qtd_transferida_total: number
  valor_itens_total: number
  taxa_atraso: number
  taxa_conclusao_itens: number
  exposicao_financeira: number
  taxa_transferencia: number
  pedidos_sem_incoterm: number
  pedidos_sem_fabricante: number
  pedidos_sem_proforma: number
  pedidos_sem_invoice: number
  pedidos_sem_ref_imp: number
  moedas_distintas: number
  peso_bruto_total: number
  cubagem_total: number
  itens_sem_cobertura: number
  qtd_cancelada_total: number
}

/**
 * Agrega KPIs do dashboard a partir de listas cruas de pedidos e itens já
 * filtrados pelo período + soft-delete. Pure function — sem side-effects.
 */
export function aggregateKpis(
  pedidos: PedidoRaw[],
  itens: ItemRaw[],
  taxasVenda: Record<string, number>,
  period: string,
): AggregatedKpis {
  // Contagens por status
  const total_pedidos        = pedidos.length
  const pedidos_abertos      = pedidos.filter((p) => p.status_pedido === 'aberto').length
  const pedidos_em_andamento = pedidos.filter((p) => isEmAndamento(p.status_pedido)).length
  const pedidos_consolidados = pedidos.filter((p) => p.status_pedido === 'consolidado').length
  const pedidos_cancelados   = pedidos.filter((p) => p.status_pedido === 'cancelado').length
  const pedidos_rascunho     = pedidos.filter((p) => p.status_pedido === 'rascunho').length
  const pedidos_sem_exportador = pedidos.filter((p) => !p.id_importacao_exportador_pedido).length
  const pedidos_importacao   = pedidos.filter((p) => p.tipo_operacao_pedido === 'importacao').length
  const pedidos_exportacao   = pedidos.filter((p) => p.tipo_operacao_pedido === 'exportacao').length

  const hoje = new Date().toISOString().slice(0, 10)
  const pedidos_atrasados = pedidos.filter((p) => isPedidoAtrasado(p, hoje)).length

  // Completude documental
  const pedidos_sem_incoterm   = pedidos.filter((p) => !p.incoterm_pedido || p.incoterm_pedido.trim() === '').length
  const pedidos_sem_fabricante = pedidos.filter((p) => !p.id_fabricante_pedido).length
  const pedidos_sem_proforma   = pedidos.filter((p) => !p.numero_proforma_pedido || p.numero_proforma_pedido.trim() === '').length
  const pedidos_sem_invoice    = pedidos.filter((p) => !p.numero_invoice_pedido || p.numero_invoice_pedido.trim() === '').length
  const pedidos_sem_ref_imp    = pedidos.filter((p) => !p.referencia_importador_pedido || p.referencia_importador_pedido.trim() === '').length

  // Moedas distintas
  const moedas_set = new Set(pedidos.map((p) => p.moeda_pedido ?? 'USD'))
  const moedas_distintas = moedas_set.size

  // Logística
  const peso_bruto_total = pedidos.reduce((s, p) => s + Number(p.peso_bruto_total_pedido ?? 0), 0)
  const cubagem_total    = pedidos.reduce((s, p) => s + Number(p.cubagem_total_pedido ?? 0), 0)

  // Itens — cobertura cambial e cancelamentos
  const itens_sem_cobertura = itens.filter((i) => i.cobertura_cambial_item === 'sem_cobertura').length
  const qtd_cancelada_total = itens.reduce((s, i) => s + Number(i.quantidade_cancelada_item ?? 0), 0)

  // Financeiro
  const valor_total = pedidos.reduce((s, p) => s + Number(p.valor_total_pedido ?? 0), 0)
  const qtd_total   = pedidos.reduce((s, p) => s + Number(p.quantidade_total_pedido ?? 0), 0)

  const pedidosSemCobertura = new Set(
    itens.filter((i) => i.cobertura_cambial_item === 'sem_cobertura').map((i) => String(i.id_pedido)),
  )
  const cobertura_pendente = pedidos
    .filter((p) => pedidosSemCobertura.has(String(p.id_pedido)))
    .reduce((s, p) => s + safeNum(p.valor_total_pedido), 0)

  // Valor Total em BRL — converte cada pedido pela taxa PTAX de venda
  const moedas_sem_taxa: string[] = []
  let valor_total_brl = 0
  for (const p of pedidos) {
    const moeda = (p.moeda_pedido ?? 'USD') as string
    const valor = Number(p.valor_total_pedido ?? 0)
    const taxa  = taxasVenda[moeda]
    if (taxa != null) {
      valor_total_brl += valor * taxa
    } else {
      valor_total_brl += valor
      if (!moedas_sem_taxa.includes(moeda)) moedas_sem_taxa.push(moeda)
    }
  }

  // Itens
  const qtd_inicial_total     = itens.reduce((s, i) => s + Number(i.quantidade_inicial_item ?? 0), 0)
  const qtd_atual_total       = itens.reduce((s, i) => s + Number(i.quantidade_atual_item ?? 0), 0)
  const qtd_transferida_total = itens.reduce((s, i) => s + Number(i.quantidade_transferida_item ?? 0), 0)
  const itens_prontos         = itens.reduce((s, i) => s + Number(i.quantidade_pronta_item ?? 0), 0)
  const valor_itens_total     = itens.reduce((s, i) => s + Number(i.valor_total_item ?? 0), 0)

  return {
    period,
    total_pedidos,
    pedidos_abertos,
    pedidos_em_andamento,
    pedidos_consolidados,
    pedidos_cancelados,
    pedidos_rascunho,
    pedidos_atrasados,
    pedidos_sem_exportador,
    pedidos_importacao,
    pedidos_exportacao,
    valor_total,
    valor_total_brl,
    moedas_sem_taxa,
    cobertura_pendente,
    qtd_total,
    ticket_medio: total_pedidos > 0 ? valor_total / total_pedidos : 0,
    itens_prontos,
    qtd_inicial_total,
    qtd_atual_total,
    qtd_transferida_total,
    valor_itens_total,
    taxa_atraso:          total_pedidos > 0 ? (pedidos_atrasados / total_pedidos) * 100 : 0,
    taxa_conclusao_itens: qtd_inicial_total > 0 ? (itens_prontos / qtd_inicial_total) * 100 : 0,
    exposicao_financeira: 0,
    taxa_transferencia:   qtd_inicial_total > 0 ? (qtd_transferida_total / qtd_inicial_total) * 100 : 0,
    pedidos_sem_incoterm,
    pedidos_sem_fabricante,
    pedidos_sem_proforma,
    pedidos_sem_invoice,
    pedidos_sem_ref_imp,
    moedas_distintas,
    peso_bruto_total,
    cubagem_total,
    itens_sem_cobertura,
    qtd_cancelada_total,
  }
}

/** Agrega distribuição por status_pedido. Pure function. */
export function aggregateDistribution(pedidos: PedidoRaw[], period: string) {
  const groups: Record<string, { status: string; count: number; valor_total: number }> = {}
  for (const p of pedidos) {
    const k = p.status_pedido as string
    if (!groups[k]) groups[k] = { status: k, count: 0, valor_total: 0 }
    groups[k].count++
    groups[k].valor_total += Number(p.valor_total_pedido ?? 0)
  }
  return { period, value: Object.values(groups) }
}

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

function periodToDateRange(period: string): { from: Date; to: Date } {
  // Período personalizado: custom:YYYY-MM-DD:YYYY-MM-DD
  if (period.startsWith('custom:')) {
    const [, startStr, endStr] = period.split(':')
    if (startStr && endStr) {
      return { from: new Date(`${startStr}T00:00:00.000Z`), to: new Date(`${endStr}T23:59:59.999Z`) }
    }
  }
  const to = new Date()
  const from = new Date()
  switch (period) {
    case '7d':           from.setDate(to.getDate() - 7);              break
    case '30d':          from.setDate(to.getDate() - 30);             break
    case '90d':          from.setDate(to.getDate() - 90);             break
    case '6m':           from.setMonth(to.getMonth() - 6);            break
    case '12m':          from.setFullYear(to.getFullYear() - 1);      break
    case 'ytd':          from.setMonth(0, 1); from.setHours(0,0,0,0); break
    case 'current_month':from.setDate(1);     from.setHours(0,0,0,0); break
    case 'current_year': from.setMonth(0, 1); from.setHours(0,0,0,0); break
    default:             from.setDate(to.getDate() - 30)
  }
  return { from, to }
}

// ── KPIs agregados ─────────────────────────────────────────────────────────────
dashboardDataRouter.get('/kpis', async (req: Request, res: Response) => {
  const period = (req.query.period as string) ?? '30d'
  const fromParam = req.query.from as string | undefined
  const toParam   = req.query.to   as string | undefined
  const { from, to } = (fromParam && toParam)
    ? { from: new Date(fromParam), to: new Date(toParam) }
    : periodToDateRange(period)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const [pedidosRaw, itensRaw, taxasVenda] = await Promise.all([
        db.pedido.findMany({
          where: {
            data_emissao_pedido: { gte: from, lte: to },
            data_exclusao_pedido: null,
          },
          select: {
            id_pedido: true,
            status_pedido: true,
            valor_total_pedido: true,
            quantidade_total_pedido: true,
            moeda_pedido: true,
            id_importacao_exportador_pedido: true,
            tipo_operacao_pedido: true,
            incoterm_pedido: true,
            id_fabricante_pedido: true,
            numero_proforma_pedido: true,
            numero_invoice_pedido: true,
            referencia_importador_pedido: true,
            referencia_exportador_pedido: true,
            peso_bruto_total_pedido: true,
            cubagem_total_pedido: true,
            data_prevista_pedido_pronto: true,
            data_confirmada_pedido_pronto: true,
            data_prevista_inspecao_pedido: true,
            data_confirmada_inspecao_pedido: true,
            data_prevista_coleta_pedido: true,
            data_confirmada_coleta_pedido: true,
            data_previsao_recebimento_rascunho_pedido: true,
            data_confirmacao_recebimento_rascunho_pedido: true,
            data_previsao_aprovacao_rascunho_pedido: true,
            data_confirmacao_aprovacao_rascunho_pedido: true,
            data_previsao_recebimento_rascunho_proforma_pedido: true,
            data_confirmacao_recebimento_rascunho_proforma_pedido: true,
            data_previsao_aprovacao_rascunho_proforma_pedido: true,
            data_confirmacao_aprovacao_rascunho_proforma_pedido: true,
            data_previsao_envio_original_proforma_pedido: true,
            data_confirmacao_envio_original_proforma_pedido: true,
            data_previsao_recebimento_original_proforma_pedido: true,
            data_confirmacao_recebimento_original_proforma_pedido: true,
            data_previsao_recebimento_rascunho_invoice_pedido: true,
            data_confirmacao_recebimento_rascunho_invoice_pedido: true,
            data_previsao_aprovacao_rascunho_invoice_pedido: true,
            data_confirmacao_aprovacao_rascunho_invoice_pedido: true,
            data_previsao_envio_original_invoice_pedido: true,
            data_confirmacao_envio_original_invoice_pedido: true,
            data_previsao_recebimento_original_invoice_pedido: true,
            data_confirmacao_recebimento_original_invoice_pedido: true,
          },
        }),
        db.pedidoItem.findMany({
          where: {
            pedido_item: {
              data_emissao_pedido: { gte: from, lte: to },
              data_exclusao_pedido: null,
            },
          },
          select: {
            id_pedido: true,
            quantidade_inicial_item: true,
            quantidade_atual_item: true,
            quantidade_transferida_item: true,
            quantidade_pronta_item: true,
            valor_total_item: true,
            cobertura_cambial_item: true,
            quantidade_cancelada_item: true,
            peso_bruto_unitario_item: true,
            cubagem_unitaria_item: true,
          },
        }),
        buscarTaxasVenda(),
      ])
      res.json(aggregateKpis(pedidosRaw as PedidoRaw[], itensRaw as ItemRaw[], taxasVenda, period))
    })
  } catch (err) {
    console.error('[DashboardData/kpis]', err)
    res.status(500).json({ error: 'Erro ao agregar KPIs' })
  }
})

// ── Série temporal ────────────────────────────────────────────────────────────
dashboardDataRouter.get('/tendencia', async (req: Request, res: Response) => {
  const period      = (req.query.period as string)      ?? '12m'
  const granularity = (req.query.granularity as string) ?? 'month'
  const { from, to } = periodToDateRange(period)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const pedidos = await db.pedido.findMany({
        where: {
          data_emissao_pedido: { gte: from, lte: to },
          data_exclusao_pedido: null,
        },
        select: {
          data_emissao_pedido: true,
          valor_total_pedido: true,
        },
        orderBy: { data_emissao_pedido: 'asc' },
      })

      // Agrupa por período — retorna todos os campos usáveis pelo catálogo
      const buckets: Record<string, {
        month: string
        label: string
        total_pedidos: number
        valor_total: number
        cobertura_pendente: number
        valor_itens_total: number
      }> = {}

      for (const p of pedidos as any[]) {
        const d = new Date(p.data_emissao_pedido)
        let key: string
        let label: string

        if (granularity === 'month') {
          key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          label = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
        } else if (granularity === 'week') {
          const startOfWeek = new Date(d)
          startOfWeek.setDate(d.getDate() - d.getDay())
          key   = startOfWeek.toISOString().slice(0, 10)
          label = `Sem ${key}`
        } else {
          key   = d.toISOString().slice(0, 10)
          label = key
        }

        if (!buckets[key]) {
          buckets[key] = { month: key, label, total_pedidos: 0, valor_total: 0, cobertura_pendente: 0, valor_itens_total: 0 }
        }
        buckets[key].total_pedidos++
        buckets[key].valor_total += Number(p.valor_total_pedido ?? 0)
      }

      res.json({
        period,
        granularity,
        value: Object.values(buckets),
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
  const { from, to } = (fromParam && toParam)
    ? { from: new Date(fromParam), to: new Date(toParam) }
    : periodToDateRange(period)

  try {
    let kpis!: KpiSnapshot
    let behaviorScores: Awaited<ReturnType<typeof getUserBehaviorScores>>

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      const wherePeriodo = { data_emissao_pedido: { gte: from, lte: to }, data_exclusao_pedido: null }

      const [pedidosRaw2, itensRaw2, taxasVendaInsights] = await Promise.all([
        db.pedido.findMany({
          where: wherePeriodo,
          select: {
            id_pedido: true,
            status_pedido: true,
            valor_total_pedido: true,
            quantidade_total_pedido: true,
            moeda_pedido: true,
            id_importacao_exportador_pedido: true,
            tipo_operacao_pedido: true,
            incoterm_pedido: true,
            id_fabricante_pedido: true,
            numero_proforma_pedido: true,
            numero_invoice_pedido: true,
            referencia_importador_pedido: true,
            referencia_exportador_pedido: true,
            peso_bruto_total_pedido: true,
            cubagem_total_pedido: true,
            data_prevista_pedido_pronto: true,
            data_confirmada_pedido_pronto: true,
            data_prevista_inspecao_pedido: true,
            data_confirmada_inspecao_pedido: true,
            data_prevista_coleta_pedido: true,
            data_confirmada_coleta_pedido: true,
            data_previsao_recebimento_rascunho_pedido: true,
            data_confirmacao_recebimento_rascunho_pedido: true,
            data_previsao_aprovacao_rascunho_pedido: true,
            data_confirmacao_aprovacao_rascunho_pedido: true,
            data_previsao_recebimento_rascunho_proforma_pedido: true,
            data_confirmacao_recebimento_rascunho_proforma_pedido: true,
            data_previsao_aprovacao_rascunho_proforma_pedido: true,
            data_confirmacao_aprovacao_rascunho_proforma_pedido: true,
            data_previsao_envio_original_proforma_pedido: true,
            data_confirmacao_envio_original_proforma_pedido: true,
            data_previsao_recebimento_original_proforma_pedido: true,
            data_confirmacao_recebimento_original_proforma_pedido: true,
            data_previsao_recebimento_rascunho_invoice_pedido: true,
            data_confirmacao_recebimento_rascunho_invoice_pedido: true,
            data_previsao_aprovacao_rascunho_invoice_pedido: true,
            data_confirmacao_aprovacao_rascunho_invoice_pedido: true,
            data_previsao_envio_original_invoice_pedido: true,
            data_confirmacao_envio_original_invoice_pedido: true,
            data_previsao_recebimento_original_invoice_pedido: true,
            data_confirmacao_recebimento_original_invoice_pedido: true,
          },
        }),
        db.pedidoItem.findMany({
          where: { pedido_item: wherePeriodo },
          select: {
            id_pedido: true,
            quantidade_inicial_item: true,
            quantidade_atual_item: true,
            quantidade_transferida_item: true,
            quantidade_pronta_item: true,
            valor_total_item: true,
            cobertura_cambial_item: true,
            quantidade_cancelada_item: true,
            peso_bruto_unitario_item: true,
            cubagem_unitaria_item: true,
          },
        }),
        buscarTaxasVenda(),
      ])

      kpis = toKpiSnapshot(
        aggregateKpis(
          pedidosRaw2 as PedidoRaw[],
          itensRaw2 as ItemRaw[],
          taxasVendaInsights,
          period,
        ),
      )

      // ── 2. Fase 2: scores de comportamento do usuário ──────────────────────────
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
      itensNcm = await db.pedidoItem.findMany({
        where:  { pedido_item: { data_exclusao_pedido: null } },
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

      const pedidos = await db.pedido.findMany({
        where: {
          data_emissao_pedido: { gte: from, lte: to },
          data_exclusao_pedido: null,
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
