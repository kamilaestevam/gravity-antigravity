/**
 * cardRegistry.tsx — Fonte única de verdade para todos os KPI cards
 *
 * Para ADICIONAR um novo card:
 *   1. Adicione a entrada em CARDS_CATALOGO (columnCatalog.ts)
 *   2. Adicione a entrada em CARD_REGISTRY aqui
 *   3. Pronto — aparece automaticamente em ListaPedidos e Configurações
 *
 * ListaPedidos nunca mais precisa de if/else por card.
 */

import React from 'react'
import {
  Package,
  CurrencyDollar,
  Scales,
  Warning,
  ClipboardText,
  ArrowRight,
  Coins,
  CheckCircle,
  Gauge,
  ArrowsLeftRight,
  StackSimple,
  Money,
} from '@phosphor-icons/react'
import type { Pedido, PedidoItem } from './types'
import { fmtMoeda, fmtQuantidade } from './types'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CardVariante = 'padrao' | 'sucesso' | 'aviso' | 'perigo' | 'primario'

/** Estatísticas pré-calculadas passadas para cada entry do registry */
export interface CardComputedStats {
  /** Total de pedidos (número vindo do estado/servidor) */
  total: number
  /** Soma de valor_total_pedido */
  valorTotal: number
  /** Soma de quantidade_total_pedido */
  qtdTotal: number
  /** Soma de quantidade_atual_pedido (todos os itens) */
  qtdAtualTotal: number
  /** Soma de quantidade_pronta_total (todos os itens) */
  itensProntos: number
  /** Soma de valor_total_pedido dos pedidos sem cobertura cambial */
  coberturaPend: number
  /** Pedidos não concluídos/cancelados com data_prevista_pedido_pronto < hoje */
  pedidosAtrasados: number
  /** Pedidos com status === 'aberto' */
  pedidosAbertos: number
  /** Pedidos com status === 'transferencia' */
  pedidosEmAndamento: number
  /** Soma de quantidade_transferida_item (todos os itens) */
  qtdTransferida: number
  /** Soma de quantidade_inicial_pedido (todos os itens) */
  qtdInicial: number
  /** Soma de valor_total_item (todos os itens) */
  valorItens: number
  /** Número total de itens (todosItens.length) */
  nItens: number
}

export interface CardRegistryEntry {
  /** Ícone Phosphor */
  icone: React.ReactNode
  /** Variante de cor do CardBasicoGlobal */
  variante?: CardVariante
  /** Extrai o valor numérico bruto das stats */
  getValue: (stats: CardComputedStats) => number
  /** Formata o valor para exibição (string ou number) */
  format: (value: number) => string | number
  /** Subtexto abaixo do valor */
  subtexto: (stats: CardComputedStats) => string
  /** Conteúdo JSX do tooltip hover */
  tooltip: (pedidos: Pedido[], stats: CardComputedStats) => React.ReactNode
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ic(Component: React.ElementType, cor: string) {
  return <Component weight="duotone" size={16} style={{ color: cor }} />
}

function row(label: string, value: string | number) {
  return (
    <p key={label} className="cg-tooltip__row">
      <span>{label}</span>
      <strong>{value}</strong>
    </p>
  )
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const CARD_REGISTRY: Record<string, CardRegistryEntry> = {

  // ── Pedido ────────────────────────────────────────────────────────────────

  total_pedidos: {
    icone:    ic(Package, 'var(--ws-accent, #818cf8)'),
    getValue: s => s.total,
    format:   v => v,
    subtexto: s => `${s.nItens} itens no total`,
    tooltip:  (pedidos) => <>
      {row('Abertos',      pedidos.filter(p => p.status === 'aberto').length)}
      {row('Em andamento', pedidos.filter(p => p.status === 'transferencia').length)}
      {row('Concluídos',   pedidos.filter(p => p.status === 'consolidado').length)}
    </>,
  },

  valor_total: {
    icone:    ic(CurrencyDollar, '#34d399'),
    variante: 'sucesso',
    getValue: s => s.valorTotal,
    format:   v => fmtMoeda(v),
    subtexto: () => 'Soma de todos os pedidos',
    tooltip:  (pedidos, s) => <>
      {row('Moeda',          'USD')}
      {row('Média por pedido', fmtMoeda(pedidos.length ? s.valorTotal / pedidos.length : 0))}
    </>,
  },

  qtd_total: {
    icone:    ic(Scales, '#fbbf24'),
    variante: 'aviso',
    getValue: s => s.qtdTotal,
    format:   v => fmtQuantidade(v),
    subtexto: s => `${fmtQuantidade(s.qtdAtualTotal)} saldo atual`,
    tooltip:  (_, s) => <>
      {row('Pronto',       fmtQuantidade(s.itensProntos))}
      {row('Saldo vivo',   fmtQuantidade(s.qtdAtualTotal))}
    </>,
  },

  pedidos_atrasados: {
    icone:    ic(Warning, '#f87171'),
    variante: 'perigo',
    getValue: s => s.pedidosAtrasados,
    format:   v => v,
    subtexto: () => 'Pedidos com prazo vencido',
    tooltip:  (_, s) => row('Atrasados', s.pedidosAtrasados),
  },

  pedidos_abertos: {
    icone:    ic(ClipboardText, '#60a5fa'),
    getValue: s => s.pedidosAbertos,
    format:   v => v,
    subtexto: () => 'Pedidos com status aberto',
    tooltip:  (_, s) => row('Abertos', s.pedidosAbertos),
  },

  pedidos_em_andamento: {
    icone:    ic(ArrowRight, '#a78bfa'),
    getValue: s => s.pedidosEmAndamento,
    format:   v => v,
    subtexto: () => 'Em processo de transferência',
    tooltip:  (_, s) => row('Em andamento', s.pedidosEmAndamento),
  },

  cobertura_pendente: {
    icone:    ic(Coins, '#fb923c'),
    variante: 'perigo',
    getValue: s => s.coberturaPend,
    format:   v => fmtMoeda(v),
    subtexto: () => 'Sem cobertura cambial',
    tooltip:  (pedidos) => row(
      'Aguardando cobertura',
      pedidos.filter(p => (p.itens ?? []).some(i => i.cobertura_cambial === 'sem_cobertura')).length,
    ),
  },

  // ── Item ──────────────────────────────────────────────────────────────────

  itens_prontos: {
    icone:    ic(CheckCircle, '#34d399'),
    variante: 'sucesso',
    getValue: s => s.itensProntos,
    format:   v => fmtQuantidade(v),
    subtexto: () => 'Itens com produção concluída',
    tooltip:  (_, s) => row('Prontos', fmtQuantidade(s.itensProntos)),
  },

  qtd_atual_total: {
    icone:    ic(Gauge, '#38bdf8'),
    getValue: s => s.qtdAtualTotal,
    format:   v => fmtQuantidade(v),
    subtexto: () => 'Saldo disponível de todos os itens',
    tooltip:  (_, s) => <>
      {row('Saldo atual',    fmtQuantidade(s.qtdAtualTotal))}
      {row('Qtd inicial',    fmtQuantidade(s.qtdInicial))}
      {row('Transferido',    fmtQuantidade(s.qtdTransferida))}
    </>,
  },

  qtd_transferida_total: {
    icone:    ic(ArrowsLeftRight, '#a3e635'),
    getValue: s => s.qtdTransferida,
    format:   v => fmtQuantidade(v),
    subtexto: () => 'Já alocado em processos logísticos',
    tooltip:  (_, s) => <>
      {row('Transferido',  fmtQuantidade(s.qtdTransferida))}
      {row('% do total',   s.qtdInicial > 0 ? `${((s.qtdTransferida / s.qtdInicial) * 100).toFixed(1)}%` : '—')}
    </>,
  },

  qtd_inicial_total: {
    icone:    ic(StackSimple, '#94a3b8'),
    getValue: s => s.qtdInicial,
    format:   v => fmtQuantidade(v),
    subtexto: () => 'Soma das quantidades originais dos itens',
    tooltip:  (_, s) => <>
      {row('Qtd inicial',  fmtQuantidade(s.qtdInicial))}
      {row('Saldo vivo',   fmtQuantidade(s.qtdAtualTotal))}
    </>,
  },

  valor_itens_total: {
    icone:    ic(Money, '#f59e0b'),
    variante: 'aviso',
    getValue: s => s.valorItens,
    format:   v => fmtMoeda(v),
    subtexto: () => 'Soma do valor de todos os itens',
    tooltip:  (pedidos, s) => <>
      {row('Total itens',    fmtMoeda(s.valorItens))}
      {row('Média por item', fmtMoeda(s.nItens > 0 ? s.valorItens / s.nItens : 0))}
    </>,
  },
}

// ─── Função de cálculo central ────────────────────────────────────────────────

/**
 * Calcula todas as stats de uma vez — chamar dentro de useMemo em ListaPedidos.
 * Recebe `total` do estado (número do servidor, não pedidos.length).
 */
export function computeCardStats(
  pedidos: Pedido[],
  itens: PedidoItem[],
  total: number,
  hoje: string,
  totalItensBanco?: number,
): CardComputedStats {
  const valorTotal       = pedidos.reduce((acc, p) => acc + (Number(p.valor_total_pedido) || 0), 0)
  const qtdTotal         = pedidos.reduce((acc, p) => acc + (Number(p.quantidade_total_pedido) || 0), 0)
  const qtdAtualTotal    = itens.reduce((acc, i)   => acc + (Number(i.quantidade_atual_pedido) || 0), 0)
  const itensProntos     = itens.reduce((acc, i)   => acc + (Number(i.quantidade_pronta_total_item_pedido) || 0), 0)
  const qtdTransferida   = itens.reduce((acc, i)   => acc + (Number(i.quantidade_transferida_pedido) || 0), 0)
  const qtdInicial       = itens.reduce((acc, i)   => acc + (Number(i.quantidade_inicial_pedido) || 0), 0)
  const valorItens       = itens.reduce((acc, i)   => acc + (Number(i.valor_total_item) || 0), 0)
  const coberturaPend    = pedidos
    .filter(p => (p.itens ?? []).some(i => i.cobertura_cambial === 'sem_cobertura'))
    .reduce((acc, p) => acc + (Number(p.valor_total_pedido) || 0), 0)
  const pedidosAtrasados = pedidos.filter(p =>
    p.status !== 'consolidado' &&
    p.status !== 'cancelado' &&
    p.data_prevista_pedido_pronto != null &&
    p.data_prevista_pedido_pronto < hoje,
  ).length
  const pedidosAbertos      = pedidos.filter(p => p.status === 'aberto').length
  const pedidosEmAndamento  = pedidos.filter(p => p.status === 'transferencia').length

  return {
    total,
    valorTotal,
    qtdTotal,
    qtdAtualTotal,
    itensProntos,
    coberturaPend,
    pedidosAtrasados,
    pedidosAbertos,
    pedidosEmAndamento,
    qtdTransferida,
    qtdInicial,
    valorItens,
    nItens: totalItensBanco != null && totalItensBanco > 0 ? totalItensBanco : itens.length,
  }
}
