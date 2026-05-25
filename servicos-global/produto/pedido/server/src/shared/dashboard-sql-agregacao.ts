/**
 * Agregação SQL/Prisma do Dashboard Pedido (P1).
 * Métricas simples via aggregate/groupBy; atrasados via query enxuta + isPedidoAtrasado.
 */

import { Prisma } from '@prisma/client'
import { isEmAndamento, isPedidoAtrasado } from './lista-card-aggregate.js'
import type { AggregatedKpis } from './dashboard-kpis-aggregate.js'
import { buscarTaxasVendaCached } from './dashboard-agregacao-loader.js'
import type { DashboardTrendBucket } from './dashboard-cache-pedido.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbLike = any

const ATRASO_SELECT = {
  status_pedido: true,
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
} as const

function clausulaCampoStringVazio(campo: string): Record<string, unknown> {
  return { OR: [{ [campo]: null }, { [campo]: '' }] }
}

function safeDecimal(valor: unknown): number {
  if (valor == null) return 0
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

function contarStatus(
  grupos: Array<{ status_pedido: string; _count: { _all: number } }>,
  status: string,
): number {
  return grupos.find(g => g.status_pedido === status)?._count._all ?? 0
}

function contarTipo(
  grupos: Array<{ tipo_operacao_pedido: string; _count: { _all: number } }>,
  tipo: string,
): number {
  return grupos.find(g => g.tipo_operacao_pedido === tipo)?._count._all ?? 0
}

function montarFiltrosSqlPedido(wherePedido: Record<string, unknown>): Prisma.Sql[] {
  const partes: Prisma.Sql[] = [
    Prisma.sql`data_exclusao_pedido IS NULL`,
  ]

  const filtroData = wherePedido.data_emissao_pedido as { gte?: Date; lte?: Date } | undefined
  if (filtroData?.gte) partes.push(Prisma.sql`data_emissao_pedido >= ${filtroData.gte}`)
  if (filtroData?.lte) partes.push(Prisma.sql`data_emissao_pedido <= ${filtroData.lte}`)

  const ws = wherePedido.id_workspace
  if (typeof ws === 'string') {
    partes.push(Prisma.sql`id_workspace = ${ws}`)
  } else if (ws && typeof ws === 'object' && 'in' in ws) {
    const ids = (ws as { in: string[] }).in
    if (ids.length > 0) {
      partes.push(Prisma.sql`id_workspace IN (${Prisma.join(ids.map(id => Prisma.sql`${id}`))})`)
    }
  }

  return partes
}

export async function calcularKpisDashboardSql(
  db: DbLike,
  wherePedido: Record<string, unknown>,
  whereItemPedido: Record<string, unknown>,
  period: string,
): Promise<AggregatedKpis> {
  const hoje = new Date().toISOString().slice(0, 10)
  const whereAtraso = {
    ...wherePedido,
    status_pedido: { notIn: ['consolidado', 'cancelado', 'rascunho'] },
  }

  const [
    totals,
    byStatus,
    byTipo,
    byMoeda,
    semExportador,
    semIncoterm,
    semFabricante,
    semProforma,
    semInvoice,
    semRefImp,
    itensTotals,
    itensSemCoberturaCount,
    pedidosAtrasoCandidatos,
    itensSemCobertura,
    taxasVenda,
  ] = await Promise.all([
    db.pedido.aggregate({
      where: wherePedido,
      _count: { id_pedido: true },
      _sum: {
        valor_total_pedido: true,
        quantidade_total_pedido: true,
        peso_bruto_total_pedido: true,
        cubagem_total_pedido: true,
      },
    }),
    db.pedido.groupBy({
      by: ['status_pedido'],
      where: wherePedido,
      _count: { _all: true },
    }),
    db.pedido.groupBy({
      by: ['tipo_operacao_pedido'],
      where: wherePedido,
      _count: { _all: true },
    }),
    db.pedido.groupBy({
      by: ['moeda_pedido'],
      where: wherePedido,
      _sum: { valor_total_pedido: true },
    }),
    db.pedido.count({
      where: { ...wherePedido, id_importacao_exportador_pedido: null },
    }),
    db.pedido.count({
      where: { ...wherePedido, ...clausulaCampoStringVazio('incoterm_pedido') },
    }),
    db.pedido.count({
      where: { ...wherePedido, id_fabricante_pedido: null },
    }),
    db.pedido.count({
      where: { ...wherePedido, ...clausulaCampoStringVazio('numero_proforma_pedido') },
    }),
    db.pedido.count({
      where: { ...wherePedido, ...clausulaCampoStringVazio('numero_invoice_pedido') },
    }),
    db.pedido.count({
      where: { ...wherePedido, ...clausulaCampoStringVazio('referencia_importador_pedido') },
    }),
    db.pedidoItem.aggregate({
      where: { pedido_item: whereItemPedido },
      _sum: {
        quantidade_inicial_item: true,
        quantidade_atual_item: true,
        quantidade_transferida_item: true,
        quantidade_pronta_item: true,
        valor_total_item: true,
        quantidade_cancelada_item: true,
      },
    }),
    db.pedidoItem.count({
      where: {
        pedido_item: whereItemPedido,
        cobertura_cambial_item: 'sem_cobertura',
      },
    }),
    db.pedido.findMany({ where: whereAtraso, select: ATRASO_SELECT }),
    db.pedidoItem.findMany({
      where: {
        pedido_item: whereItemPedido,
        cobertura_cambial_item: 'sem_cobertura',
      },
      select: { id_pedido: true },
      distinct: ['id_pedido'],
    }),
    buscarTaxasVendaCached(),
  ])

  const idsSemCobertura = [...new Set(
    (itensSemCobertura as Array<{ id_pedido: string }>).map(i => i.id_pedido),
  )]

  let cobertura_pendente = 0
  if (idsSemCobertura.length > 0) {
    const cobAgg = await db.pedido.aggregate({
      where: { ...wherePedido, id_pedido: { in: idsSemCobertura } },
      _sum: { valor_total_pedido: true },
    })
    cobertura_pendente = safeDecimal(cobAgg._sum?.valor_total_pedido)
  }

  const total_pedidos = totals._count?.id_pedido ?? 0
  const valor_total = safeDecimal(totals._sum?.valor_total_pedido)
  const qtd_total = safeDecimal(totals._sum?.quantidade_total_pedido)
  const peso_bruto_total = safeDecimal(totals._sum?.peso_bruto_total_pedido)
  const cubagem_total = safeDecimal(totals._sum?.cubagem_total_pedido)

  const qtd_inicial_total = safeDecimal(itensTotals._sum?.quantidade_inicial_item)
  const qtd_atual_total = safeDecimal(itensTotals._sum?.quantidade_atual_item)
  const qtd_transferida_total = safeDecimal(itensTotals._sum?.quantidade_transferida_item)
  const itens_prontos = safeDecimal(itensTotals._sum?.quantidade_pronta_item)
  const valor_itens_total = safeDecimal(itensTotals._sum?.valor_total_item)
  const qtd_cancelada_total = safeDecimal(itensTotals._sum?.quantidade_cancelada_item)

  let pedidos_em_andamento = 0
  for (const g of byStatus as Array<{ status_pedido: string; _count: { _all: number } }>) {
    if (isEmAndamento(g.status_pedido)) pedidos_em_andamento += g._count._all
  }

  const pedidos_atrasados = (pedidosAtrasoCandidatos as Record<string, unknown>[])
    .filter(p => isPedidoAtrasado(p, hoje)).length

  const moedas_sem_taxa: string[] = []
  let valor_total_brl = 0
  const moedas_set = new Set<string>()
  for (const g of byMoeda as Array<{ moeda_pedido: string | null; _sum: { valor_total_pedido: unknown } }>) {
    const moeda = (g.moeda_pedido ?? 'USD') as string
    moedas_set.add(moeda)
    const valorMoeda = safeDecimal(g._sum?.valor_total_pedido)
    const taxa = taxasVenda[moeda]
    if (taxa != null) {
      valor_total_brl += valorMoeda * taxa
    } else {
      valor_total_brl += valorMoeda
      if (!moedas_sem_taxa.includes(moeda)) moedas_sem_taxa.push(moeda)
    }
  }

  return {
    period,
    total_pedidos,
    pedidos_abertos: contarStatus(byStatus, 'aberto'),
    pedidos_em_andamento,
    pedidos_consolidados: contarStatus(byStatus, 'consolidado'),
    pedidos_cancelados: contarStatus(byStatus, 'cancelado'),
    pedidos_rascunho: contarStatus(byStatus, 'rascunho'),
    pedidos_atrasados,
    pedidos_sem_exportador: semExportador,
    pedidos_importacao: contarTipo(byTipo, 'importacao'),
    pedidos_exportacao: contarTipo(byTipo, 'exportacao'),
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
    taxa_atraso: total_pedidos > 0 ? (pedidos_atrasados / total_pedidos) * 100 : 0,
    taxa_conclusao_itens: qtd_inicial_total > 0 ? (itens_prontos / qtd_inicial_total) * 100 : 0,
    exposicao_financeira: 0,
    taxa_transferencia: qtd_inicial_total > 0 ? (qtd_transferida_total / qtd_inicial_total) * 100 : 0,
    pedidos_sem_incoterm: semIncoterm,
    pedidos_sem_fabricante: semFabricante,
    pedidos_sem_proforma: semProforma,
    pedidos_sem_invoice: semInvoice,
    pedidos_sem_ref_imp: semRefImp,
    moedas_distintas: moedas_set.size,
    peso_bruto_total,
    cubagem_total,
    itens_sem_cobertura: itensSemCoberturaCount,
    qtd_cancelada_total,
  }
}

/** Tendência mensal agregada no Postgres (sem transferir N linhas). */
export async function carregarTendenciaMensalSql(
  db: DbLike,
  wherePedido: Record<string, unknown>,
): Promise<DashboardTrendBucket[]> {
  const filtros = montarFiltrosSqlPedido(wherePedido)
  filtros.push(Prisma.sql`data_emissao_pedido IS NOT NULL`)

  const rows = await db.$queryRaw<Array<{
    month_key: string
    total_pedidos: number | bigint
    valor_total: unknown
  }>>(Prisma.sql`
    SELECT
      to_char(date_trunc('month', data_emissao_pedido), 'YYYY-MM') AS month_key,
      COUNT(*)::int AS total_pedidos,
      COALESCE(SUM(valor_total_pedido), 0) AS valor_total
    FROM pedido
    WHERE ${Prisma.join(filtros, ' AND ')}
    GROUP BY 1
    ORDER BY 1 ASC
  `)

  return rows.map(r => {
    const [ano, mes] = r.month_key.split('-')
    const d = new Date(Number(ano), Number(mes) - 1, 1)
    return {
      month: r.month_key,
      label: d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
      total_pedidos: Number(r.total_pedidos),
      valor_total: safeDecimal(r.valor_total),
      cobertura_pendente: 0,
      valor_itens_total: 0,
    }
  })
}
