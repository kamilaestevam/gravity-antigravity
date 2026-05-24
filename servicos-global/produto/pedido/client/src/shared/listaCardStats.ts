/**
 * listaCardStats.ts — Agregação client-side para cards da Lista (fallback + filtros locais)
 */

import type { Pedido, PedidoItem } from './types'
import {
  aggregateAlertasKpis,
  REGRAS_ALERTAS_DEFAULT,
  ALERTAS_BREAKDOWN_ZERO,
  type RegrasAlertasConfig,
  type AlertasBreakdown,
} from '../../../shared/pedidoAlertasAggregate'

export function safeNum(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'object' && v !== null && 'valor' in (v as object)) {
    return safeNum((v as { valor: unknown }).valor)
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function normDateSlice(v: unknown): string | null {
  if (v == null) return null
  const s = v instanceof Date ? v.toISOString() : String(v)
  return s === '' ? null : s.slice(0, 10)
}

const PARES_ATRASO: Array<[keyof Pedido, keyof Pedido]> = [
  ['data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto'],
  ['data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido'],
  ['data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido'],
  ['data_prevista_recebimento_rascunho_pedido', 'data_confirmada_recebimento_rascunho_pedido'],
  ['data_prevista_aprovacao_rascunho_pedido', 'data_confirmada_aprovacao_rascunho_pedido'],
  ['data_prevista_recebimento_rascunho_proforma', 'data_confirmada_recebimento_rascunho_proforma'],
  ['data_prevista_aprovacao_rascunho_proforma', 'data_confirmada_aprovacao_rascunho_proforma'],
  ['data_prevista_envio_original_proforma', 'data_confirmada_envio_original_proforma'],
  ['data_prevista_recebimento_original_proforma', 'data_confirmada_recebimento_original_proforma'],
  ['data_prevista_recebimento_rascunho_invoice', 'data_confirmada_recebimento_rascunho_invoice'],
  ['data_prevista_aprovacao_rascunho_invoice', 'data_confirmada_aprovacao_rascunho_invoice'],
  ['data_prevista_envio_original_invoice', 'data_confirmada_envio_original_invoice'],
  ['data_prevista_recebimento_original_invoice', 'data_confirmada_recebimento_original_invoice'],
]

/** Pedidos concluídos/cancelados/rascunho não entram no card de atrasados */
export function isPedidoElegivelAtraso(status: string | undefined | null): boolean {
  const s = String(status ?? '')
  return s !== '' && s !== 'consolidado' && s !== 'cancelado' && s !== 'rascunho'
}

export function isPedidoAtrasado(p: Pedido, hoje: string): boolean {
  if (!isPedidoElegivelAtraso(p.status)) return false
  return PARES_ATRASO.some(([prevK, confK]) => {
    const prev = normDateSlice(p[prevK])
    const conf = normDateSlice(p[confK])
    return prev != null && prev < hoje && conf == null
  })
}

export function isEmAndamento(status: string | undefined | null): boolean {
  return status === 'transferencia' || status === 'em_andamento'
}

export function resolveQuantidadeInicialPedido(p: Pedido, itens: PedidoItem[]): number {
  const db = safeNum(p.quantidade_total_pedido)
  if (itens.length === 0) return db
  const somaItens = itens.reduce((s, i) => s + safeNum(i.quantidade_inicial_pedido), 0)
  if (Math.abs(db - somaItens) > 0.001) return somaItens
  return db
}

export function resolveSaldoPedido(p: Pedido, itens: PedidoItem[]): number {
  const inicial = resolveQuantidadeInicialPedido(p, itens)
  const pronta = itens.length > 0
    ? itens.reduce((s, i) => s + safeNum(i.quantidade_pronta_total_item_pedido), 0)
    : safeNum((p as Pedido & { quantidade_pronta_itens_pedido_total?: number }).quantidade_pronta_itens_pedido_total)
  const cancelada = itens.length > 0
    ? itens.reduce((s, i) => s + safeNum((i as PedidoItem & { quantidade_cancelada_pedido?: number }).quantidade_cancelada_pedido), 0)
    : safeNum((p as Pedido & { quantidade_cancelada_total_pedido?: number }).quantidade_cancelada_total_pedido)
  return Math.max(0, inicial - pronta - cancelada)
}

export interface CardComputedStats {
  total: number
  valorTotal: number
  qtdTotal: number
  qtdAtualTotal: number
  itensProntos: number
  coberturaPend: number
  pedidosAtrasados: number
  pedidosAbertos: number
  pedidosEmAndamento: number
  qtdTransferida: number
  qtdInicial: number
  valorItens: number
  nItens: number
  valorTotalBrl?: number
  alertasTotal: number
  alertasPedido: number
  alertasItem: number
  alertasBreakdown: AlertasBreakdown
}

export function computeCardStats(
  pedidos: Pedido[],
  itens: PedidoItem[],
  total: number,
  hoje: string,
  totalItensBanco?: number,
  taxasVenda?: Record<string, number>,
  regrasAlertas: RegrasAlertasConfig = REGRAS_ALERTAS_DEFAULT,
): CardComputedStats {
  const itensPorPedido = new Map<string, PedidoItem[]>()
  for (const i of itens) {
    const pid = i.id_pedido ?? ''
    if (!pid) continue
    const arr = itensPorPedido.get(pid) ?? []
    arr.push(i)
    itensPorPedido.set(pid, arr)
  }

  let valorTotal = 0
  let qtdTotal = 0
  let qtdAtualTotal = 0
  let valorTotalBrl = 0

  for (const p of pedidos) {
    const pid = p.id ?? ''
    const itensP = itensPorPedido.get(pid) ?? (p.itens ?? [])
    valorTotal += safeNum(p.valor_total_pedido)
    qtdTotal += resolveQuantidadeInicialPedido(p, itensP)
    qtdAtualTotal += resolveSaldoPedido(p, itensP)
    if (taxasVenda) {
      const moeda = p.moeda_pedido ?? 'USD'
      valorTotalBrl += safeNum(p.valor_total_pedido) * (taxasVenda[moeda] ?? taxasVenda['USD'] ?? 1)
    }
  }

  const itensProntos   = itens.reduce((acc, i) => acc + safeNum(i.quantidade_pronta_total_item_pedido), 0)
  const qtdTransferida = itens.reduce((acc, i) => acc + safeNum(i.quantidade_transferida_pedido), 0)
  const qtdInicial     = itens.reduce((acc, i) => acc + safeNum(i.quantidade_inicial_pedido), 0)
  const valorItens     = itens.reduce((acc, i) => acc + safeNum(i.valor_total_item), 0)

  const coberturaPend = pedidos
    .filter(p => (p.itens ?? []).some(i => i.cobertura_cambial === 'sem_cobertura'))
    .reduce((acc, p) => acc + safeNum(p.valor_total_pedido), 0)

  const itensByPedido = new Map<string, Record<string, unknown>[]>()
  for (const p of pedidos) {
    const pid = p.id ?? ''
    if (!pid) continue
    const itensP = (p.itens ?? itensPorPedido.get(pid) ?? []) as PedidoItem[]
    itensByPedido.set(pid, itensP as unknown as Record<string, unknown>[])
  }

  const pedidosParaAlertas = pedidos.map(p => ({
    ...(p as unknown as Record<string, unknown>),
    id_pedido: p.id,
    id: p.id,
  }))

  const alertas = aggregateAlertasKpis(pedidosParaAlertas, itensByPedido, regrasAlertas)

  return {
    total,
    valorTotal,
    qtdTotal,
    qtdAtualTotal,
    itensProntos,
    coberturaPend,
    pedidosAtrasados: pedidos.filter(p => isPedidoAtrasado(p, hoje)).length,
    pedidosAbertos: pedidos.filter(p => p.status === 'aberto').length,
    pedidosEmAndamento: pedidos.filter(p => isEmAndamento(p.status)).length,
    qtdTransferida,
    qtdInicial,
    valorItens,
    nItens: totalItensBanco != null && totalItensBanco > 0 ? totalItensBanco : itens.length,
    ...(taxasVenda ? { valorTotalBrl } : {}),
    alertasTotal: alertas.alertas_total,
    alertasPedido: alertas.alertas_pedido,
    alertasItem: alertas.alertas_item,
    alertasBreakdown: alertas.alertas_breakdown,
  }
}

export function kpisApiToCardStats(kpis: {
  total_pedidos: number
  total_itens: number
  valor_total: number
  valor_total_brl: number
  qtd_total: number
  qtd_atual_total: number
  itens_prontos: number
  cobertura_pendente: number
  pedidos_atrasados: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  qtd_transferida_total: number
  qtd_inicial_total: number
  valor_itens_total: number
  alertas_total: number
  alertas_pedido: number
  alertas_item: number
  alertas_breakdown?: AlertasBreakdown
}): CardComputedStats {
  return {
    total: kpis.total_pedidos,
    valorTotal: kpis.valor_total,
    qtdTotal: kpis.qtd_total,
    qtdAtualTotal: kpis.qtd_atual_total,
    itensProntos: kpis.itens_prontos,
    coberturaPend: kpis.cobertura_pendente,
    pedidosAtrasados: kpis.pedidos_atrasados,
    pedidosAbertos: kpis.pedidos_abertos,
    pedidosEmAndamento: kpis.pedidos_em_andamento,
    qtdTransferida: kpis.qtd_transferida_total,
    qtdInicial: kpis.qtd_inicial_total,
    valorItens: kpis.valor_itens_total,
    nItens: kpis.total_itens,
    valorTotalBrl: kpis.valor_total_brl,
    alertasTotal: kpis.alertas_total,
    alertasPedido: kpis.alertas_pedido,
    alertasItem: kpis.alertas_item,
    alertasBreakdown: kpis.alertas_breakdown ?? ALERTAS_BREAKDOWN_ZERO,
  }
}
