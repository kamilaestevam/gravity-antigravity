/**
 * Funções puras de agregação do Dashboard Pedido — testáveis sem Express/Prisma.
 */

import { isEmAndamento, isPedidoAtrasado, safeNum } from './lista-card-aggregate.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PedidoRaw = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ItemRaw = Record<string, any>

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

export function aggregateKpis(
  pedidos: PedidoRaw[],
  itens: ItemRaw[],
  taxasVenda: Record<string, number>,
  period: string,
): AggregatedKpis {
  const hoje = new Date().toISOString().slice(0, 10)

  let pedidos_abertos = 0
  let pedidos_em_andamento = 0
  let pedidos_consolidados = 0
  let pedidos_cancelados = 0
  let pedidos_rascunho = 0
  let pedidos_atrasados = 0
  let pedidos_sem_exportador = 0
  let pedidos_importacao = 0
  let pedidos_exportacao = 0
  let pedidos_sem_incoterm = 0
  let pedidos_sem_fabricante = 0
  let pedidos_sem_proforma = 0
  let pedidos_sem_invoice = 0
  let pedidos_sem_ref_imp = 0
  let valor_total = 0
  let qtd_total = 0
  let valor_total_brl = 0
  let peso_bruto_total = 0
  let cubagem_total = 0
  const moedas_set = new Set<string>()
  const moedas_sem_taxa: string[] = []

  for (const p of pedidos) {
    const status = p.status_pedido as string
    if (status === 'aberto') pedidos_abertos++
    if (isEmAndamento(status)) pedidos_em_andamento++
    if (status === 'consolidado') pedidos_consolidados++
    if (status === 'cancelado') pedidos_cancelados++
    if (status === 'rascunho') pedidos_rascunho++
    if (isPedidoAtrasado(p, hoje)) pedidos_atrasados++
    if (!p.id_importacao_exportador_pedido) pedidos_sem_exportador++
    if (p.tipo_operacao_pedido === 'importacao') pedidos_importacao++
    if (p.tipo_operacao_pedido === 'exportacao') pedidos_exportacao++
    if (!p.incoterm_pedido || String(p.incoterm_pedido).trim() === '') pedidos_sem_incoterm++
    if (!p.id_fabricante_pedido) pedidos_sem_fabricante++
    if (!p.numero_proforma_pedido || String(p.numero_proforma_pedido).trim() === '') pedidos_sem_proforma++
    if (!p.numero_invoice_pedido || String(p.numero_invoice_pedido).trim() === '') pedidos_sem_invoice++
    if (!p.referencia_importador_pedido || String(p.referencia_importador_pedido).trim() === '') pedidos_sem_ref_imp++

    const moeda = (p.moeda_pedido ?? 'USD') as string
    moedas_set.add(moeda)
    const valorPedido = Number(p.valor_total_pedido ?? 0)
    valor_total += valorPedido
    qtd_total += Number(p.quantidade_total_pedido ?? 0)
    peso_bruto_total += Number(p.peso_bruto_total_pedido ?? 0)
    cubagem_total += Number(p.cubagem_total_pedido ?? 0)

    const taxa = taxasVenda[moeda]
    if (taxa != null) {
      valor_total_brl += valorPedido * taxa
    } else {
      valor_total_brl += valorPedido
      if (!moedas_sem_taxa.includes(moeda)) moedas_sem_taxa.push(moeda)
    }
  }

  const pedidosSemCobertura = new Set(
    itens.filter((i) => i.cobertura_cambial_item === 'sem_cobertura').map((i) => String(i.id_pedido)),
  )
  let cobertura_pendente = 0
  for (const p of pedidos) {
    if (pedidosSemCobertura.has(String(p.id_pedido))) {
      cobertura_pendente += safeNum(p.valor_total_pedido)
    }
  }

  const itens_sem_cobertura = itens.filter((i) => i.cobertura_cambial_item === 'sem_cobertura').length
  let qtd_inicial_total = 0
  let qtd_atual_total = 0
  let qtd_transferida_total = 0
  let itens_prontos = 0
  let valor_itens_total = 0
  let qtd_cancelada_total = 0
  for (const i of itens) {
    qtd_inicial_total += Number(i.quantidade_inicial_item ?? 0)
    qtd_atual_total += Number(i.quantidade_atual_item ?? 0)
    qtd_transferida_total += Number(i.quantidade_transferida_item ?? 0)
    itens_prontos += Number(i.quantidade_pronta_item ?? 0)
    valor_itens_total += Number(i.valor_total_item ?? 0)
    qtd_cancelada_total += Number(i.quantidade_cancelada_item ?? 0)
  }

  const total_pedidos = pedidos.length

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
    taxa_atraso: total_pedidos > 0 ? (pedidos_atrasados / total_pedidos) * 100 : 0,
    taxa_conclusao_itens: qtd_inicial_total > 0 ? (itens_prontos / qtd_inicial_total) * 100 : 0,
    exposicao_financeira: 0,
    taxa_transferencia: qtd_inicial_total > 0 ? (qtd_transferida_total / qtd_inicial_total) * 100 : 0,
    pedidos_sem_incoterm,
    pedidos_sem_fabricante,
    pedidos_sem_proforma,
    pedidos_sem_invoice,
    pedidos_sem_ref_imp,
    moedas_distintas: moedas_set.size,
    peso_bruto_total,
    cubagem_total,
    itens_sem_cobertura,
    qtd_cancelada_total,
  }
}

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
