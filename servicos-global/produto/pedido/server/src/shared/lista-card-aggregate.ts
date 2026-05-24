/**
 * lista-card-aggregate.ts — Agregação pura para KPIs dos cards da Lista
 * Espelha computeCardStats do frontend (cardRegistry.tsx).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PedidoAgg = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ItemAgg = Record<string, any>

export function safeNum(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'object' && v !== null && 'valor' in (v as object)) {
    return safeNum((v as { valor: unknown }).valor)
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function normDateSlice(v: unknown): string | null {
  if (v == null) return null
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const s = String(v)
  return s === '' ? null : s.slice(0, 10)
}

const PARES_ATRASO: Array<[prev: string, conf: string]> = [
  ['data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto'],
  ['data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido'],
  ['data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido'],
  ['data_previsao_recebimento_rascunho_pedido', 'data_confirmacao_recebimento_rascunho_pedido'],
  ['data_previsao_aprovacao_rascunho_pedido', 'data_confirmacao_aprovacao_rascunho_pedido'],
  ['data_previsao_recebimento_rascunho_proforma_pedido', 'data_confirmacao_recebimento_rascunho_proforma_pedido'],
  ['data_previsao_aprovacao_rascunho_proforma_pedido', 'data_confirmacao_aprovacao_rascunho_proforma_pedido'],
  ['data_previsao_envio_original_proforma_pedido', 'data_confirmacao_envio_original_proforma_pedido'],
  ['data_previsao_recebimento_original_proforma_pedido', 'data_confirmacao_recebimento_original_proforma_pedido'],
  ['data_previsao_recebimento_rascunho_invoice_pedido', 'data_confirmacao_recebimento_rascunho_invoice_pedido'],
  ['data_previsao_aprovacao_rascunho_invoice_pedido', 'data_confirmacao_aprovacao_rascunho_invoice_pedido'],
  ['data_previsao_envio_original_invoice_pedido', 'data_confirmacao_envio_original_invoice_pedido'],
  ['data_previsao_recebimento_original_invoice_pedido', 'data_confirmacao_recebimento_original_invoice_pedido'],
]

/** Pedidos concluídos/cancelados/rascunho não entram no card de atrasados */
export function isPedidoElegivelAtraso(status: unknown): boolean {
  const s = String(status ?? '')
  return s !== '' && s !== 'consolidado' && s !== 'cancelado' && s !== 'rascunho'
}

export function isPedidoAtrasado(p: PedidoAgg, hoje: string): boolean {
  const status = p.status_pedido ?? p.status
  if (!isPedidoElegivelAtraso(status)) return false
  return PARES_ATRASO.some(([prevK, confK]) => {
    const prev = normDateSlice(p[prevK])
    const conf = normDateSlice(p[confK])
    return prev != null && prev < hoje && conf == null
  })
}

export function isEmAndamento(status: unknown): boolean {
  const s = String(status ?? '')
  return s === 'transferencia' || s === 'em_andamento'
}

/** Quantidade inicial confiável: soma itens quando diverge do campo do pedido */
export function resolveQuantidadeInicialPedido(
  p: PedidoAgg,
  itensDoPedido: ItemAgg[],
): number {
  const db = safeNum(p.quantidade_total_pedido)
  if (itensDoPedido.length === 0) return db
  const somaItens = itensDoPedido.reduce((s, i) => s + safeNum(i.quantidade_inicial_item), 0)
  if (Math.abs(db - somaItens) > 0.001) return somaItens
  return db
}

export function resolveSaldoPedido(p: PedidoAgg, itensDoPedido: ItemAgg[]): number {
  const inicial = resolveQuantidadeInicialPedido(p, itensDoPedido)
  const pronta = itensDoPedido.length > 0
    ? itensDoPedido.reduce((s, i) => s + safeNum(i.quantidade_pronta_item), 0)
    : safeNum(p.quantidade_pronta_itens_pedido_total)
  const cancelada = itensDoPedido.length > 0
    ? itensDoPedido.reduce((s, i) => s + safeNum(i.quantidade_cancelada_item), 0)
    : safeNum(p.quantidade_cancelada_total_pedido)
  return Math.max(0, inicial - pronta - cancelada)
}

export interface ListaCardKpisPayload {
  period: string
  total_pedidos: number
  total_itens: number
  valor_total: number
  valor_total_brl: number
  qtd_total: number
  qtd_atual_total: number
  itens_prontos: number
  qtd_transferida_total: number
  qtd_inicial_total: number
  valor_itens_total: number
  pedidos_atrasados: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  cobertura_pendente: number
  alertas_total: number
  alertas_pedido: number
  alertas_item: number
}

export function aggregateListaCardKpis(
  pedidos: PedidoAgg[],
  itens: ItemAgg[],
  taxasVenda: Record<string, number>,
  period: string,
  hoje: string,
): ListaCardKpisPayload {
  const itensPorPedido = new Map<string, ItemAgg[]>()
  for (const i of itens) {
    const pid = String(i.id_pedido ?? '')
    if (!pid) continue
    const arr = itensPorPedido.get(pid) ?? []
    arr.push(i)
    itensPorPedido.set(pid, arr)
  }

  const pedidosSemCobertura = new Set<string>()
  for (const i of itens) {
    if (i.cobertura_cambial_item === 'sem_cobertura') {
      pedidosSemCobertura.add(String(i.id_pedido))
    }
  }

  let valor_total = 0
  let qtd_total = 0
  let qtd_atual_total = 0
  let valor_total_brl = 0

  for (const p of pedidos) {
    const pid = String(p.id_pedido ?? p.id ?? '')
    const itensP = itensPorPedido.get(pid) ?? []
    valor_total += safeNum(p.valor_total_pedido)
    qtd_total += resolveQuantidadeInicialPedido(p, itensP)
    qtd_atual_total += resolveSaldoPedido(p, itensP)
    const moeda = String(p.moeda_pedido ?? 'USD')
    const taxa = taxasVenda[moeda] ?? taxasVenda['USD'] ?? 1
    valor_total_brl += safeNum(p.valor_total_pedido) * taxa
  }

  const itens_prontos = itens.reduce((s, i) => s + safeNum(i.quantidade_pronta_item), 0)
  const qtd_transferida_total = itens.reduce((s, i) => s + safeNum(i.quantidade_transferida_item), 0)
  const qtd_inicial_total = itens.reduce((s, i) => s + safeNum(i.quantidade_inicial_item), 0)
  const valor_itens_total = itens.reduce((s, i) => s + safeNum(i.valor_total_item), 0)

  const cobertura_pendente = pedidos
    .filter(p => pedidosSemCobertura.has(String(p.id_pedido ?? p.id ?? '')))
    .reduce((s, p) => s + safeNum(p.valor_total_pedido), 0)

  return {
    period,
    total_pedidos: pedidos.length,
    total_itens: itens.length,
    valor_total,
    valor_total_brl,
    qtd_total,
    qtd_atual_total,
    itens_prontos,
    qtd_transferida_total,
    qtd_inicial_total,
    valor_itens_total,
    pedidos_atrasados: pedidos.filter(p => isPedidoAtrasado(p, hoje)).length,
    pedidos_abertos: pedidos.filter(p => p.status_pedido === 'aberto' || p.status === 'aberto').length,
    pedidos_em_andamento: pedidos.filter(p =>
      isEmAndamento(p.status_pedido ?? p.status),
    ).length,
    cobertura_pendente,
    alertas_total: 0,
    alertas_pedido: 0,
    alertas_item: 0,
  }
}

export function cardPeriodToDateRange(period: string): { from: Date | null; to: Date } {
  const to = new Date()
  if (period === 'tudo') return { from: null, to }

  const from = new Date()
  switch (period) {
    case '7d':  from.setDate(to.getDate() - 7);  break
    case '6m':  from.setMonth(to.getMonth() - 6); break
    case '1a':  from.setFullYear(to.getFullYear() - 1); break
    case '30d':
    default:    from.setDate(to.getDate() - 30)
  }
  return { from, to }
}
