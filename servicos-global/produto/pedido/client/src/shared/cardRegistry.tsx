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
  CurrencyCircleDollar,
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
  ChartBar, TrendUp, TrendDown, Percent, Target, Lightning, Star,
  Heart, Fire, Trophy, Medal, Crown, Diamond,
} from '@phosphor-icons/react'
import type { TFunction } from 'i18next'
import type { Pedido, PedidoItem, CardUsuario } from './types'
import { fmtMoeda, fmtQuantidade } from './types'
import type { CardComputedStats } from './listaCardStats'
import { computeCardStats, isEmAndamento } from './listaCardStats'
import type { AlertasBreakdown } from '../../../shared/pedidoAlertasAggregate'
import { decodeMetricaCard } from './cardMetricaCatalog'
import { CARDS_CATALOGO } from './columnCatalog'

export type { CardComputedStats }
export { computeCardStats }

// ─── Mapa de ícones para cards personalizados ────────────────────────────────

export const ICONE_CUSTOM_MAP: Record<string, React.ReactNode> = {
  Package:          <Package          size={16} weight="duotone" />,
  CurrencyDollar:   <CurrencyDollar   size={16} weight="duotone" />,
  Scales:           <Scales           size={16} weight="duotone" />,
  Warning:          <Warning          size={16} weight="duotone" />,
  CheckCircle:      <CheckCircle      size={16} weight="duotone" />,
  Coins:            <Coins            size={16} weight="duotone" />,
  ClipboardText:    <ClipboardText    size={16} weight="duotone" />,
  ArrowRight:       <ArrowRight       size={16} weight="duotone" />,
  Gauge:            <Gauge            size={16} weight="duotone" />,
  ArrowsLeftRight:  <ArrowsLeftRight  size={16} weight="duotone" />,
  StackSimple:      <StackSimple      size={16} weight="duotone" />,
  Money:            <Money            size={16} weight="duotone" />,
  ChartBar:         <ChartBar         size={16} weight="duotone" />,
  TrendUp:          <TrendUp          size={16} weight="duotone" />,
  TrendDown:        <TrendDown        size={16} weight="duotone" />,
  Percent:          <Percent          size={16} weight="duotone" />,
  Target:           <Target           size={16} weight="duotone" />,
  Lightning:        <Lightning        size={16} weight="duotone" />,
  Star:             <Star             size={16} weight="duotone" />,
  Heart:            <Heart            size={16} weight="duotone" />,
  Fire:             <Fire             size={16} weight="duotone" />,
  Trophy:           <Trophy           size={16} weight="duotone" />,
  Medal:            <Medal            size={16} weight="duotone" />,
  Crown:            <Crown            size={16} weight="duotone" />,
  Diamond:          <Diamond          size={16} weight="duotone" />,
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CardVariante = 'padrao' | 'sucesso' | 'aviso' | 'perigo' | 'primario'

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
  subtexto: (t: TFunction, stats: CardComputedStats) => string
  /** Conteúdo JSX do tooltip hover */
  tooltip: (t: TFunction, pedidos: Pedido[], stats: CardComputedStats) => React.ReactNode
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

const BREAKDOWN_PEDIDO: (keyof AlertasBreakdown)[] = [
  'part_number_duplicado_resumo',
  'numero_pedido_duplicado',
  'divergencia_campos',
  'valor_total_divergente',
  'quantidade_total_divergente',
  'quantidade_pronta_divergente',
  'peso_liquido_divergente',
  'peso_bruto_divergente',
  'cubagem_divergente',
]

const BREAKDOWN_ITEM: (keyof AlertasBreakdown)[] = ['part_number_duplicado_item']

const BREAKDOWN_TOTAL: (keyof AlertasBreakdown)[] = [...BREAKDOWN_PEDIDO, ...BREAKDOWN_ITEM]

function tooltipBreakdownAlertas(
  t: TFunction,
  breakdown: AlertasBreakdown,
  keys: (keyof AlertasBreakdown)[],
) {
  const ativos = keys.filter(k => breakdown[k] > 0)
  if (ativos.length === 0) {
    return row(t('pedido.cards.alertas.breakdown.vazio'), '—')
  }
  return <>{ativos.map(k => row(t(`pedido.cards.alertas.breakdown.${k}`), breakdown[k]))}</>
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const CARD_REGISTRY: Record<string, CardRegistryEntry> = {

  // ── Pedido ────────────────────────────────────────────────────────────────

  total_pedidos: {
    icone:    ic(Package, 'var(--ws-accent, #818cf8)'),
    getValue: s => s.total,
    format:   v => v,
    subtexto: (t, s) => t('pedido.cards.total_pedidos.subtexto', { count: s.nItens }),
    tooltip:  (t, pedidos) => <>
      {row(t('pedido.cards.total_pedidos.row.abertos'),      pedidos.filter(p => p.status === 'aberto').length)}
      {row(t('pedido.cards.total_pedidos.row.em_andamento'), pedidos.filter(p => isEmAndamento(p.status)).length)}
      {row(t('pedido.cards.total_pedidos.row.concluidos'),   pedidos.filter(p => p.status === 'consolidado').length)}
    </>,
  },

  valor_total: {
    icone:    ic(CurrencyDollar, '#34d399'),
    variante: 'sucesso',
    getValue: s => s.valorTotal,
    format:   v => fmtMoeda(v),
    subtexto: (t) => t('pedido.cards.valor_total.subtexto'),
    tooltip:  (t, pedidos, s) => <>
      {row(t('pedido.cards.valor_total.row.moeda'),            'USD')}
      {row(t('pedido.cards.valor_total.row.media_por_pedido'), fmtMoeda(pedidos.length ? s.valorTotal / pedidos.length : 0))}
    </>,
  },

  valor_total_brl: {
    icone:    ic(CurrencyCircleDollar, '#34d399'),
    variante: 'sucesso',
    getValue: s => s.valorTotalBrl ?? 0,
    format:   v => fmtMoeda(v),
    subtexto: (t) => t('pedido.lista.card.total_brl_subtexto'),
    tooltip:  (t, _, s) => row(t('pedido.lista.card.total_brl_titulo'), fmtMoeda(s.valorTotalBrl ?? 0)),
  },

  qtd_total: {
    icone:    ic(Scales, '#fbbf24'),
    variante: 'aviso',
    getValue: s => s.qtdTotal,
    format:   v => fmtQuantidade(v),
    subtexto: (t, s) => t('pedido.cards.qtd_total.subtexto', { saldo: fmtQuantidade(s.qtdAtualTotal) }),
    tooltip:  (t, _, s) => <>
      {row(t('pedido.cards.qtd_total.row.pronto'),     fmtQuantidade(s.itensProntos))}
      {row(t('pedido.cards.qtd_total.row.saldo_vivo'), fmtQuantidade(s.qtdAtualTotal))}
    </>,
  },

  pedidos_atrasados: {
    icone:    ic(Warning, '#f87171'),
    variante: 'perigo',
    getValue: s => s.pedidosAtrasados,
    format:   v => v,
    subtexto: (t) => t('pedido.cards.pedidos_atrasados.subtexto'),
    tooltip:  (t, _, s) => row(t('pedido.cards.pedidos_atrasados.row.atrasados'), s.pedidosAtrasados),
  },

  pedidos_abertos: {
    icone:    ic(ClipboardText, '#60a5fa'),
    getValue: s => s.pedidosAbertos,
    format:   v => v,
    subtexto: (t) => t('pedido.cards.pedidos_abertos.subtexto'),
    tooltip:  (t, _, s) => row(t('pedido.cards.pedidos_abertos.row.abertos'), s.pedidosAbertos),
  },

  pedidos_em_andamento: {
    icone:    ic(ArrowRight, '#a78bfa'),
    getValue: s => s.pedidosEmAndamento,
    format:   v => v,
    subtexto: (t) => t('pedido.cards.pedidos_em_andamento.subtexto'),
    tooltip:  (t, _, s) => row(t('pedido.cards.pedidos_em_andamento.row.em_andamento'), s.pedidosEmAndamento),
  },

  cobertura_pendente: {
    icone:    ic(Coins, '#fb923c'),
    variante: 'perigo',
    getValue: s => s.coberturaPend,
    format:   v => fmtMoeda(v),
    subtexto: (t) => t('pedido.cards.cobertura_pendente.subtexto'),
    tooltip:  (t, pedidos) => row(
      t('pedido.cards.cobertura_pendente.row.aguardando_cobertura'),
      pedidos.filter(p => (p.itens ?? []).some(i => i.cobertura_cambial === 'sem_cobertura')).length,
    ),
  },

  // ── Item ──────────────────────────────────────────────────────────────────

  itens_prontos: {
    icone:    ic(CheckCircle, '#34d399'),
    variante: 'sucesso',
    getValue: s => s.itensProntos,
    format:   v => fmtQuantidade(v),
    subtexto: (t) => t('pedido.cards.itens_prontos.subtexto'),
    tooltip:  (t, _, s) => row(t('pedido.cards.itens_prontos.row.prontos'), fmtQuantidade(s.itensProntos)),
  },

  qtd_atual_total: {
    icone:    ic(Gauge, '#38bdf8'),
    getValue: s => s.qtdAtualTotal,
    format:   v => fmtQuantidade(v),
    subtexto: (t) => t('pedido.cards.qtd_atual_total.subtexto'),
    tooltip:  (t, _, s) => <>
      {row(t('pedido.cards.qtd_atual_total.row.saldo_atual'),  fmtQuantidade(s.qtdAtualTotal))}
      {row(t('pedido.cards.qtd_atual_total.row.qtd_inicial'),  fmtQuantidade(s.qtdInicial))}
      {row(t('pedido.cards.qtd_atual_total.row.transferido'),  fmtQuantidade(s.qtdTransferida))}
    </>,
  },

  qtd_transferida_total: {
    icone:    ic(ArrowsLeftRight, '#a3e635'),
    getValue: s => s.qtdTransferida,
    format:   v => fmtQuantidade(v),
    subtexto: (t) => t('pedido.cards.qtd_transferida_total.subtexto'),
    tooltip:  (t, _, s) => <>
      {row(t('pedido.cards.qtd_transferida_total.row.transferido'), fmtQuantidade(s.qtdTransferida))}
      {row(t('pedido.cards.qtd_transferida_total.row.percentual'),  s.qtdInicial > 0 ? `${((s.qtdTransferida / s.qtdInicial) * 100).toFixed(1)}%` : '—')}
    </>,
  },

  qtd_inicial_total: {
    icone:    ic(StackSimple, '#94a3b8'),
    getValue: s => s.qtdInicial,
    format:   v => fmtQuantidade(v),
    subtexto: (t) => t('pedido.cards.qtd_inicial_total.subtexto'),
    tooltip:  (t, _, s) => <>
      {row(t('pedido.cards.qtd_inicial_total.row.qtd_inicial'), fmtQuantidade(s.qtdInicial))}
      {row(t('pedido.cards.qtd_inicial_total.row.saldo_vivo'),  fmtQuantidade(s.qtdAtualTotal))}
    </>,
  },

  valor_itens_total: {
    icone:    ic(Money, '#f59e0b'),
    variante: 'aviso',
    getValue: s => s.valorItens,
    format:   v => fmtMoeda(v),
    subtexto: (t) => t('pedido.cards.valor_itens_total.subtexto'),
    tooltip:  (t, _pedidos, s) => <>
      {row(t('pedido.cards.valor_itens_total.row.total_itens'),    fmtMoeda(s.valorItens))}
      {row(t('pedido.cards.valor_itens_total.row.media_por_item'), fmtMoeda(s.nItens > 0 ? s.valorItens / s.nItens : 0))}
    </>,
  },

  alertas_total: {
    icone:    ic(Warning, '#f59e0b'),
    variante: 'aviso',
    getValue: s => s.alertasTotal,
    format:   v => v,
    subtexto: (t, s) => t('pedido.cards.alertas_total.subtexto', {
      pedido: s.alertasPedido,
      item: s.alertasItem,
    }),
    tooltip:  (t, _, s) => tooltipBreakdownAlertas(t, s.alertasBreakdown, BREAKDOWN_TOTAL),
  },

  alertas_pedido: {
    icone:    ic(Warning, '#f59e0b'),
    variante: 'aviso',
    getValue: s => s.alertasPedido,
    format:   v => v,
    subtexto: (t) => t('pedido.cards.alertas_pedido.subtexto'),
    tooltip:  (t, _, s) => tooltipBreakdownAlertas(t, s.alertasBreakdown, BREAKDOWN_PEDIDO),
  },

  alertas_item: {
    icone:    ic(Warning, '#fbbf24'),
    variante: 'aviso',
    getValue: s => s.alertasItem,
    format:   v => v,
    subtexto: (t) => t('pedido.cards.alertas_item.subtexto'),
    tooltip:  (t, _, s) => tooltipBreakdownAlertas(t, s.alertasBreakdown, BREAKDOWN_ITEM),
  },
}

// ─── Cards customizados (gerados dinamicamente) ──────────────────────────────

import type { CardUsuario } from './types'
import { parsearFormula, type FormulaAST } from './formulaEngine'
import { formulaParaChave } from './formulaUtils'

const STATS_KEY_MAP: Record<string, keyof CardComputedStats> = {
  quantidade_total_pedido: 'qtdTotal',
  quantidade_atual_pedido: 'qtdAtualTotal',
  quantidade_pronta_total_item_pedido: 'itensProntos',
  quantidade_transferida_pedido: 'qtdTransferida',
  quantidade_inicial_pedido: 'qtdInicial',
  valor_total_pedido: 'valorTotal',
  valor_total_item: 'valorItens',
  total_pedidos: 'total',
  saldo_itens_do_pedido: 'qtdAtualTotal',
}

function avaliarFormulaCustom(expressao: string, stats: CardComputedStats): number {
  const chaveFormula = formulaParaChave(expressao)
  try {
    const ast = parsearFormula(chaveFormula)
    if (!ast) return 0
    return evalNode(ast, stats)
  } catch {
    return 0
  }
}

function evalNode(node: FormulaAST, stats: CardComputedStats): number {
  switch (node.tipo) {
    case 'numero': return node.valor
    case 'campo': {
      const statsKey = STATS_KEY_MAP[node.chave]
      if (statsKey) return Number(stats[statsKey]) || 0
      return 0
    }
    case 'binop': {
      const esq = evalNode(node.esq, stats)
      const dir = evalNode(node.dir, stats)
      switch (node.op) {
        case '+': return esq + dir
        case '-': return esq - dir
        case '*': return esq * dir
        case '/': return dir !== 0 ? esq / dir : 0
        default: return 0
      }
    }
    case 'soma_itens': return 0
    case 'se': {
      const cond = evalNode(node.condicao, stats)
      return cond !== 0 ? evalNode(node.verdadeiro, stats) : evalNode(node.falso, stats)
    }
    case 'condicao': {
      const esq = evalNode(node.esq, stats)
      const dir = evalNode(node.dir, stats)
      switch (node.op) {
        case '>':  return esq > dir ? 1 : 0
        case '<':  return esq < dir ? 1 : 0
        case '>=': return esq >= dir ? 1 : 0
        case '<=': return esq <= dir ? 1 : 0
        case '==': return esq === dir ? 1 : 0
        case '!=': return esq !== dir ? 1 : 0
        default: return 0
      }
    }
    default: return 0
  }
}

export function buildCustomCardEntry(card: CardUsuario): CardRegistryEntry {
  const metricaId = decodeMetricaCard(card.formula_expressao)
  const base = metricaId ? CARD_REGISTRY[metricaId] : undefined

  if (base && metricaId) {
    const def = CARDS_CATALOGO.find(c => c.id === metricaId)
    return {
      icone: ICONE_CUSTOM_MAP[card.icone] ?? base.icone,
      variante: base.variante,
      getValue: base.getValue,
      format: base.format,
      subtexto: (t) => {
        if (!def) return card.nome
        return `${t(def.labelKey)} · ${def.origem} · ${def.tipoAgg}`
      },
      tooltip: base.tooltip,
    }
  }

  return {
    icone: ICONE_CUSTOM_MAP[card.icone] ?? <Package size={16} weight="duotone" />,
    getValue: (stats) => avaliarFormulaCustom(card.formula_expressao, stats),
    format: (v) => fmtQuantidade(v),
    subtexto: () => card.nome,
    tooltip: (t, _, stats) => row(t('pedido.cards.custom.row.valor'), fmtQuantidade(avaliarFormulaCustom(card.formula_expressao, stats))),
  }
}

