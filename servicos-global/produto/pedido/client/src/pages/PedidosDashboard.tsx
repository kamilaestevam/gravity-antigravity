/**
 * DashboardPedido.tsx — View Dashboard do produto Pedido
 *
 * v2 — 2026-04-03
 * - mockResult produz series[] para LINE/AREA/BAR multi-campo
 * - mockResult produz slices[] para DISTRIBUTION
 * - renderWidget usa contratos novos (LineSeriesConfig[], BarSeriesConfig[])
 * - Hack status_dist removido — widget usa DISTRIBUTION real
 * - DashboardPainelEditarModal exibe FieldQuerySpec[] com operação por campo
 */

import React, { useMemo, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, horizontalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useShellStore } from '@gravity/shell'
import { usePermissoesPedido } from '../shared/permissoes/usePermissoesPedido'
import {
  DashboardGrid,
  DashboardPainelContainer,
  DashboardWidgetLinha,
  DashboardWidgetBarras,
  DashboardWidgetDistribuicao,
  DashboardBarraFerramentas,
  DashboardPainelEditarModal,
  DashboardPainelSugestoes,
  DashboardValorKPI,
  PeriodDropdown,
} from '@nucleo/dashboard'
import type { PeriodOption } from '@nucleo/dashboard'
import { DashboardConstrutorConsulta } from '@nucleo/query-builder-global'
import type {
  DashboardWidgetConfig,
  WidgetResult,
  WidgetSeriesPoint,
  WidgetDistributionSlice,
  WidgetQuerySpec,
  ChartType,
  FieldUnitType,
  LineSeriesConfig,
  BarSeriesConfig,
  DerivedMetric,
  EnrichedCatalogField,
} from '@nucleo/dashboard'
import { resolveAxisAssignment, SERIES_COLORS, formatValueByUnit } from '@nucleo/dashboard'
import {
  Package, ClipboardText, Scales, CurrencyDollar,
  Warning, UserCircleMinus, CheckCircle,
  ListNumbers, ArrowsLeftRight, Tag,
  CaretLeft, CaretRight, RocketLaunch,
  DotsThree, PencilSimple, Trash, X,
} from '@phosphor-icons/react'
import './PedidosDashboard.css'

import { useDashboardStore, translateWidgetTitle } from '../stores/dashboardStore'
import { useTrackBehavior } from '../hooks/useTrackBehavior'
import { buildDashboardCatalog, buildCatalogByKey } from '../shared/dashboardCatalog'
import { generateSuggestions } from '../shared/dashboardSuggestions'
import { BUILT_IN_DERIVED, computeDerived } from '../shared/derivedMetrics'
import { dashboardApi, paineisDashboardApi } from '../shared/api'
import type { DashboardKpis, DashboardTrendBucket, GabiInsightItem, DashboardPainel, DashboardDistributionGroup } from '../shared/api'
import { resolverIdsWorkspacesParaApi, useEscopoWorkspacesPedido } from '../shared/useEscopoWorkspacesPedido'
import {
  lerPeriodoCardsLista,
  mapearPeriodoDashboardParaLista,
  mapearPeriodoListaParaDashboard,
  PERIODO_CARDS_SYNC_EVENT,
  periodoDashboardEhSomenteDashboard,
  salvarPeriodoCardsLista,
} from '../shared/periodoPedidoSync'
import {
  DASHBOARD_TOP_KPI_WIDGET_IDS,
  useDashboardTopKpiStatus,
  type DashboardTopKpiWidgetId,
} from '../shared/useDashboardTopKpiStatus'
import { contagemPorStatusSlug, rotuloStatusSlug } from '../shared/dashboardStatusKpi'
import { periodoEhPadrao, rotuloPeriodoDashboard, widgetUsaPeriodoProprio } from '../shared/dashboardPeriodoUtil'
import '@nucleo/tabela-virtual-global/FiltrosColuna/FiltrosColuna.css'

// ── Dados reais — converte resposta da API em WidgetResult ────────────────────

function buildWidgetResult(
  widget: DashboardWidgetConfig,
  kpis: DashboardKpis,
  trend: DashboardTrendBucket[],
  allDerived: DerivedMetric[],
  catalogByKey: Record<string, EnrichedCatalogField>,
): WidgetResult {
  const now = new Date().toISOString()
  const fields = widget.query_spec.fields
  const chartType = widget.chart_type

  // ── DISTRIBUTION ──────────────────────────────────────────────────────────
  if (chartType === 'DISTRIBUTION') {
    const slices: WidgetDistributionSlice[] = fields.map(fqs => {
      const catalog = catalogByKey[fqs.key]
      const unit: FieldUnitType = catalog?.type === 'currency' ? 'currency'
        : catalog?.type === 'percentage' ? 'percentage' : 'number'
      return {
        key: fqs.key,
        label: catalog?.label ?? fqs.key,
        value: Number(kpis[fqs.key] ?? 0),
        unit,
      }
    }).filter(s => s.value > 0)

    return { data: {}, slices, chartType: 'DISTRIBUTION', partial: false, cached: false, computed_at: now }
  }

  // ── LINE / AREA / BAR / BAR_HORIZONTAL — multi-série ─────────────────────
  if (['LINE', 'AREA', 'BAR', 'BAR_HORIZONTAL'].includes(chartType)) {
    const series: WidgetSeriesPoint[] = trend.map(bucket => {
      const point: WidgetSeriesPoint = { month: bucket.month }
      for (const fqs of fields) {
        point[fqs.key] = Number(bucket[fqs.key] ?? 0)
      }
      return point
    })

    const unitTypes = [...new Set(
      fields.map(fqs => {
        const cat = catalogByKey[fqs.key]
        return (cat?.type === 'currency' ? 'currency' : 'number') as FieldUnitType
      }),
    )]
    const dualAxis = unitTypes.length > 1

    return { data: {}, series, chartType, partial: false, cached: false, computed_at: now, unitTypes, dualAxis }
  }

  // ── KPI_CARD com métrica derivada ─────────────────────────────────────────
  if (widget.config?.derivedMetricId) {
    const dm = allDerived.find(m => m.id === widget.config!.derivedMetricId)
    if (dm) {
      const value = computeDerived(dm, kpis as Record<string, number>)
      const fieldKey = fields[0]?.key ?? 'value'
      return { data: { [fieldKey]: value ?? 0 }, chartType: 'KPI_CARD', partial: false, cached: false, computed_at: now }
    }
  }

  // ── KPI_CARD / DONUT / outros — mono-campo ────────────────────────────────
  const fieldKey = fields[0]?.key ?? 'value'
  const value = Number(kpis[fieldKey] ?? 0)
  return { data: { [fieldKey]: value }, chartType, partial: false, cached: false, computed_at: now }
}

// ── (DashboardValorKPI, DashboardPainelEditarModal e DashboardPainelSugestoes migrados para @nucleo/dashboard) ──

// ── Período anterior para comparação de tendência ────────────────────────────

function getPrevDateRange(period: string): { from: string; to: string } {
  const now = new Date()
  const prevTo   = new Date(now)
  const prevFrom = new Date(now)

  switch (period) {
    case '7d':
      prevTo.setDate(now.getDate() - 7)
      prevFrom.setDate(now.getDate() - 14)
      break
    case '30d':
      prevTo.setDate(now.getDate() - 30)
      prevFrom.setDate(now.getDate() - 60)
      break
    case '90d':
      prevTo.setDate(now.getDate() - 90)
      prevFrom.setDate(now.getDate() - 180)
      break
    case '6m':
      prevTo.setMonth(now.getMonth() - 6)
      prevFrom.setMonth(now.getMonth() - 12)
      break
    case '12m':
    case 'current_year':
    case 'ytd':
      prevTo.setFullYear(now.getFullYear() - 1)
      prevFrom.setFullYear(now.getFullYear() - 2)
      break
    default:
      prevTo.setDate(now.getDate() - 30)
      prevFrom.setDate(now.getDate() - 60)
  }

  return { from: prevFrom.toISOString(), to: prevTo.toISOString() }
}

function computeDelta(current: number, prev: number): {
  delta: number
  percent: number
  direction: 'up' | 'down' | 'neutral'
} {
  const delta = current - prev
  const percent = prev === 0
    ? (current > 0 ? 100 : 0)
    : (delta / prev) * 100
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral'
  return { delta, percent, direction }
}

// ── Gerador de insights client-side com dados reais ───────────────────────────
// Espelha a lógica do gabiInsightsService.ts para uso como fallback

const fmtNum = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n))
const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`

function buildClientInsights(kpis: DashboardKpis, prev: DashboardKpis | null | undefined, t: TFunction): GabiInsightItem[] {
  const items: GabiInsightItem[] = []

  // ── ALERTAS (warn) — sempre primeiro ─────────────────────────────────────────

  if (kpis.pedidos_atrasados > 0) {
    const taxa = kpis.total_pedidos > 0 ? (kpis.pedidos_atrasados / kpis.total_pedidos) * 100 : 0
    items.push({
      id: 'atrasados',
      variante: 'warn',
      tag: t('pedido.dashboard.insight_atrasados_tag'),
      texto: t('pedido.dashboard.insight_atrasados_texto', { count: kpis.pedidos_atrasados }),
      stat: { label: t('pedido.dashboard.insight_atrasados_stat_label'), valor: fmtPct(taxa) },
      textoLink: t('pedido.dashboard.insight_atrasados_link'),
      rota: '/pedidos/lista?status=atrasado',
    })
  }

  if (kpis.pedidos_sem_exportador > 0) {
    items.push({
      id: 'sem_exportador',
      variante: 'warn',
      tag: t('pedido.dashboard.insight_sem_exportador_tag'),
      texto: t('pedido.dashboard.insight_sem_exportador_texto', { count: kpis.pedidos_sem_exportador }),
      stat: { label: t('pedido.dashboard.insight_sem_exportador_stat_label'), valor: fmtNum(kpis.pedidos_sem_exportador) },
      textoLink: t('pedido.dashboard.insight_sem_exportador_link'),
      rota: '/pedidos/lista?exportador=nenhum',
    })
  }

  if (kpis.pedidos_cancelados > 0 && kpis.total_pedidos > 0) {
    const pct = (kpis.pedidos_cancelados / kpis.total_pedidos) * 100
    items.push({
      id: 'cancelados',
      variante: pct > 10 ? 'warn' : 'default',
      tag: pct > 10
        ? t('pedido.dashboard.insight_cancelados_tag_atencao')
        : t('pedido.dashboard.insight_cancelados_tag_alerta'),
      texto: t('pedido.dashboard.insight_cancelados_texto', { count: kpis.pedidos_cancelados, pct: fmtPct(pct) }),
      stat: { label: t('pedido.dashboard.insight_cancelados_stat_label'), valor: fmtNum(kpis.total_pedidos) },
      textoLink: t('pedido.dashboard.insight_cancelados_link'),
      rota: '/pedidos/lista?status=cancelado',
    })
  }

  if (kpis.pedidos_rascunho > 0) {
    items.push({
      id: 'rascunho',
      variante: 'warn',
      tag: t('pedido.dashboard.insight_rascunho_tag'),
      texto: t('pedido.dashboard.insight_rascunho_texto', { count: kpis.pedidos_rascunho }),
      stat: { label: t('pedido.dashboard.insight_rascunho_stat_label'), valor: fmtNum(kpis.pedidos_rascunho) },
      textoLink: t('pedido.dashboard.insight_rascunho_link'),
      rota: '/pedidos/lista?status=rascunho',
    })
  }

  // ── OPERACIONAL ───────────────────────────────────────────────────────────────

  if (kpis.pedidos_abertos > 0) {
    items.push({
      id: 'abertos',
      variante: 'default',
      tag: t('pedido.dashboard.insight_abertos_tag'),
      texto: t('pedido.dashboard.insight_abertos_texto', { count: kpis.pedidos_abertos }),
      stat: kpis.qtd_transferida_total > 0
        ? { label: t('pedido.dashboard.insight_abertos_stat_label_transferida'), valor: fmtNum(kpis.qtd_transferida_total) }
        : { label: t('pedido.dashboard.insight_abertos_stat_label_abertos'), valor: fmtNum(kpis.pedidos_abertos) },
      textoLink: t('pedido.dashboard.insight_abertos_link'),
      rota: '/pedidos/lista?status=aberto',
    })
  }

  if (kpis.pedidos_em_andamento > 0) {
    const txTransf = kpis.qtd_inicial_total > 0
      ? (kpis.qtd_transferida_total / kpis.qtd_inicial_total) * 100 : 0
    items.push({
      id: 'transferencia',
      variante: 'default',
      tag: t('pedido.dashboard.insight_transferencia_tag'),
      texto: t('pedido.dashboard.insight_transferencia_texto', { count: kpis.pedidos_em_andamento }),
      stat: { label: t('pedido.dashboard.insight_transferencia_stat_label'), valor: fmtPct(txTransf) },
      textoLink: t('pedido.dashboard.insight_transferencia_link'),
      rota: '/pedidos/lista?status=transferencia',
    })
  }

  if (kpis.itens_prontos > 0) {
    const pctPronta = kpis.qtd_inicial_total > 0
      ? (kpis.itens_prontos / kpis.qtd_inicial_total) * 100 : 0
    items.push({
      id: 'qtd_pronta',
      variante: 'default',
      tag: t('pedido.dashboard.insight_qtd_pronta_tag'),
      texto: t('pedido.dashboard.insight_qtd_pronta_texto', { qtd: fmtNum(kpis.itens_prontos), pct: fmtPct(pctPronta) }),
      stat: { label: t('pedido.dashboard.insight_qtd_pronta_stat_label'), valor: fmtNum(kpis.qtd_atual_total) },
      textoLink: t('pedido.dashboard.insight_qtd_pronta_link'),
      rota: '/pedidos/lista?status=pronto',
    })
  }

  if (kpis.pedidos_consolidados > 0) {
    items.push({
      id: 'consolidados',
      variante: 'default',
      tag: t('pedido.dashboard.insight_consolidados_tag'),
      texto: t('pedido.dashboard.insight_consolidados_texto', { count: kpis.pedidos_consolidados }),
      stat: { label: t('pedido.dashboard.insight_consolidados_stat_label'), valor: fmtNum(kpis.pedidos_consolidados) },
      textoLink: t('pedido.dashboard.insight_consolidados_link'),
      rota: '/pedidos/lista?status=consolidado',
    })
  }

  // ── FINANCEIRO ────────────────────────────────────────────────────────────────

  if (kpis.valor_total > 0) {
    items.push({
      id: 'financeiro',
      variante: 'default',
      tag: t('pedido.dashboard.insight_financeiro_tag'),
      texto: t('pedido.dashboard.insight_financeiro_texto', { valor: fmtBRL(kpis.valor_total) }),
      stat: kpis.ticket_medio > 0
        ? { label: t('pedido.dashboard.insight_financeiro_stat_label_ticket'), valor: fmtBRL(kpis.ticket_medio) }
        : { label: t('pedido.dashboard.insight_financeiro_stat_label_total'), valor: fmtNum(kpis.total_pedidos) },
      textoLink: t('pedido.dashboard.insight_financeiro_link'),
    })
  }

  if (kpis.valor_total_brl > 0 && Math.abs(kpis.valor_total_brl - kpis.valor_total) > 1) {
    items.push({
      id: 'cambio_brl',
      variante: 'default',
      tag: t('pedido.dashboard.insight_cambio_brl_tag'),
      texto: t('pedido.dashboard.insight_cambio_brl_texto', {
        moedas: (kpis.moedas_sem_taxa as string[]).length > 0
          ? t('pedido.dashboard.insight_cambio_brl_moedas_parcial')
          : t('pedido.dashboard.insight_cambio_brl_moedas_todas'),
      }),
      stat: { label: t('pedido.dashboard.insight_cambio_brl_stat_label'), valor: fmtBRL(kpis.valor_total_brl) },
      textoLink: t('pedido.dashboard.insight_cambio_brl_link'),
    })
  }

  if (kpis.valor_itens_total > 0) {
    items.push({
      id: 'valor_itens',
      variante: 'default',
      tag: t('pedido.dashboard.insight_valor_itens_tag'),
      texto: t('pedido.dashboard.insight_valor_itens_texto'),
      stat: { label: t('pedido.dashboard.insight_valor_itens_stat_label'), valor: fmtBRL(kpis.valor_itens_total) },
      textoLink: t('pedido.dashboard.insight_valor_itens_link'),
    })
  }

  // ── COMPARATIVO COM PERÍODO ANTERIOR ─────────────────────────────────────────

  if (prev && prev.total_pedidos > 0 && kpis.total_pedidos > 0) {
    const delta = kpis.total_pedidos - prev.total_pedidos
    const pct = Math.abs((delta / prev.total_pedidos) * 100)
    if (Math.abs(delta) > 0) {
      const crescendo = delta > 0
      items.push({
        id: 'tendencia_volume',
        variante: 'default',
        tag: crescendo
          ? t('pedido.dashboard.insight_tendencia_volume_tag_crescente')
          : t('pedido.dashboard.insight_tendencia_volume_tag_queda'),
        texto: crescendo
          ? t('pedido.dashboard.insight_tendencia_volume_texto_crescente', { pct: fmtPct(pct) })
          : t('pedido.dashboard.insight_tendencia_volume_texto_queda', { pct: fmtPct(pct) }),
        stat: { label: t('pedido.dashboard.insight_tendencia_volume_stat_label'), valor: fmtNum(prev.total_pedidos) },
        textoLink: t('pedido.dashboard.insight_tendencia_volume_link'),
      })
    }
  }

  if (prev && prev.valor_total > 0 && kpis.valor_total > 0) {
    const delta = kpis.valor_total - prev.valor_total
    const pct = Math.abs((delta / prev.valor_total) * 100)
    if (pct >= 5) {
      const crescendo = delta > 0
      items.push({
        id: 'tendencia_valor',
        variante: crescendo ? 'default' : 'warn',
        tag: crescendo
          ? t('pedido.dashboard.insight_tendencia_valor_tag_aumentou')
          : t('pedido.dashboard.insight_tendencia_valor_tag_reduziu'),
        texto: crescendo
          ? t('pedido.dashboard.insight_tendencia_valor_texto_aumentou', { pct: fmtPct(pct) })
          : t('pedido.dashboard.insight_tendencia_valor_texto_reduziu', { pct: fmtPct(pct) }),
        stat: { label: t('pedido.dashboard.insight_tendencia_valor_stat_label'), valor: `${crescendo ? '+' : ''}${fmtBRL(delta)}` },
        textoLink: t('pedido.dashboard.insight_tendencia_valor_link'),
      })
    }
  }

  // ── DISTRIBUIÇÃO IMP/EXP ──────────────────────────────────────────────────────

  const totalOps = kpis.pedidos_importacao + kpis.pedidos_exportacao
  if (totalOps > 0) {
    const pctImp = Math.round((kpis.pedidos_importacao / totalOps) * 100)
    items.push({
      id: 'imp_exp',
      variante: 'default',
      tag: t('pedido.dashboard.insight_imp_exp_tag'),
      texto: t('pedido.dashboard.insight_imp_exp_texto', { pctImp, pctExp: 100 - pctImp }),
      stat: { label: t('pedido.dashboard.insight_imp_exp_stat_label'), valor: fmtNum(totalOps) },
      textoLink: t('pedido.dashboard.insight_imp_exp_link'),
    })
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────────

  if (items.length === 0) {
    items.push({
      id: 'status_ok',
      variante: 'default',
      tag: t('pedido.dashboard.insight_status_ok_tag'),
      texto: t('pedido.dashboard.insight_status_ok_texto'),
      stat: { label: t('pedido.dashboard.insight_status_ok_stat_label'), valor: fmtNum(kpis.total_pedidos) },
      textoLink: t('pedido.dashboard.insight_status_ok_link'),
      rota: '/pedidos/lista',
    })
    items.push({
      id: 'dica_periodo',
      variante: 'default',
      tag: t('pedido.dashboard.insight_dica_periodo_tag'),
      texto: t('pedido.dashboard.insight_dica_periodo_texto'),
      stat: { label: t('pedido.dashboard.insight_dica_periodo_stat_label'), valor: kpis.period ?? '30d' },
      textoLink: t('pedido.dashboard.insight_dica_periodo_link'),
    })
  }

  return items
}

// ── Configuração visual por widget ────────────────────────────────────────────

const AMBER  = '#f59e0b'
const DANGER = '#ef4444'
const GREEN  = '#22c55e'

const WIDGET_VISUAL: Record<string, { accentColor?: string; icone?: ReactNode }> = {
  kpi_total_pedidos:     { accentColor: AMBER,  icone: <Package          size={15} weight="duotone" /> },
  kpi_pedidos_abertos:   { accentColor: AMBER,  icone: <ClipboardText    size={15} weight="duotone" /> },
  kpi_saldo_total:       { accentColor: AMBER,  icone: <Scales           size={15} weight="duotone" /> },
  kpi_valor_total:       { accentColor: AMBER,  icone: <CurrencyDollar   size={15} weight="duotone" /> },
  kpi_pedidos_atrasados: { accentColor: DANGER, icone: <Warning          size={15} weight="duotone" /> },
  kpi_sem_exportador:    { accentColor: AMBER,  icone: <UserCircleMinus  size={15} weight="duotone" /> },
  kpi_qtd_pronta:        { accentColor: GREEN,  icone: <CheckCircle      size={15} weight="duotone" /> },
  kpi_qtd_inicial:       {                      icone: <ListNumbers       size={15} weight="duotone" /> },
  kpi_qtd_transferida:   {                      icone: <ArrowsLeftRight   size={15} weight="duotone" /> },
  kpi_valor_itens:       {                      icone: <Tag               size={15} weight="duotone" /> },
}

// Rota de drill-down por widget de alerta
const WIDGET_NAV_ROUTE: Record<string, string> = {
  kpi_pedidos_atrasados: '/pedidos/lista?status=atrasado',
  kpi_sem_exportador:    '/pedidos/lista?exportador=nenhum',
  kpi_qtd_pronta:        '/pedidos/lista?status=pronto',
}

// ── GABI Empty State — utilitários ───────────────────────────────────────────

const PERIOD_SEQUENCE = ['7d', '30d', '90d', '12m', 'current_year'] as const
type PeriodKey = typeof PERIOD_SEQUENCE[number]

const PERIOD_LABEL_KEY: Record<string, string> = {
  '7d':           'pedido.dashboard.periodo_7d',
  '30d':          'pedido.dashboard.periodo_30d',
  '90d':          'pedido.dashboard.periodo_90d',
  '12m':          'pedido.dashboard.periodo_12m',
  'current_year': 'pedido.dashboard.periodo_current_year',
}

function getPeriodLabel(t: TFunction, key: string): string {
  const i18nKey = PERIOD_LABEL_KEY[key]
  return i18nKey ? t(i18nKey) : key
}

function getNextPeriods(current: string): string[] {
  const idx = PERIOD_SEQUENCE.indexOf(current as PeriodKey)
  if (idx === -1) return ['30d', '12m']
  return Array.from(PERIOD_SEQUENCE.slice(idx + 1, idx + 3))
}

function buildEmptyText(chartType: string, fieldNames: string[], t: TFunction): string {
  const fieldStr = fieldNames.length === 0
    ? t('pedido.dashboard.empty_campo_padrao')
    : fieldNames.length === 1
      ? `"${fieldNames[0]}"`
      : fieldNames.slice(0, 2).map(f => `"${f}"`).join(t('pedido.dashboard.empty_campo_juntor'))

  switch (chartType) {
    case 'DISTRIBUTION':
      return t('pedido.dashboard.empty_distribution', { campos: fieldStr })
    case 'LINE':
    case 'AREA':
      return t('pedido.dashboard.empty_linha', { campos: fieldStr })
    case 'BAR':
    case 'BAR_HORIZONTAL':
      return t('pedido.dashboard.empty_barras', { campos: fieldStr })
    default:
      return t('pedido.dashboard.empty_padrao')
  }
}

/** Retorna true quando o resultado não contém dados visualizáveis.
 *  Métricas derivadas nunca são consideradas "vazias" (0 é resultado válido). */
function isResultEmpty(result: WidgetResult, isDerived: boolean): boolean {
  if (isDerived) return false
  const ct = result.chartType

  if (ct === 'DISTRIBUTION') {
    return !result.slices || result.slices.length === 0
  }

  if (['LINE', 'AREA', 'BAR', 'BAR_HORIZONTAL'].includes(ct)) {
    if (!result.series || result.series.length === 0) return true
    return result.series.every((pt: WidgetSeriesPoint) =>
      Object.entries(pt)
        .filter(([k]) => k !== 'month')
        .every(([, v]) => !v || Number(v) === 0),
    )
  }

  return false
}

// ── WidgetEmptyGabi — card exibido quando widget retorna dados zerados ─────────

interface WidgetEmptyGabiProps {
  widget: DashboardWidgetConfig
  fieldNames: string[]
  currentPeriod: string
  onExpandPeriod: (p: string) => void
  onEdit: () => void
  onRemove: () => void
}

function WidgetEmptyGabi({ widget, fieldNames, currentPeriod, onExpandPeriod, onEdit, onRemove }: WidgetEmptyGabiProps) {
  const { t } = useTranslation()
  const nextPeriods = getNextPeriods(currentPeriod)
  const emptyText   = buildEmptyText(widget.chart_type, fieldNames, t)

  return (
    <div style={gabiEmptyStyles.wrap} className="dp-gabi-empty-pulse">
      {/* Fundo decorativo */}
      <div style={gabiEmptyStyles.watermark} aria-hidden="true">
        <RocketLaunch size={80} weight="fill" />
      </div>

      <div style={gabiEmptyStyles.inner}>
        <div style={gabiEmptyStyles.avatarRow}>
          <div style={gabiEmptyStyles.avatar}>
            <RocketLaunch size={13} weight="fill" color="#fff" />
          </div>
          <span style={gabiEmptyStyles.tag}>{t('pedido.dashboard.empty_gabi_tag')}</span>
        </div>

        <p style={gabiEmptyStyles.text}>{emptyText}</p>

        <div style={gabiEmptyStyles.actions}>
          {nextPeriods.length > 0 ? (
            <div style={gabiEmptyStyles.periodGroup}>
              <span style={gabiEmptyStyles.actionLabel}>{t('pedido.dashboard.empty_ampliar_para')}</span>
              {nextPeriods.map(p => (
                <button key={p} type="button" style={gabiEmptyStyles.periodBtn} onClick={() => onExpandPeriod(p)}>
                  {getPeriodLabel(t, p)}
                </button>
              ))}
            </div>
          ) : (
            <div style={gabiEmptyStyles.periodGroup}>
              <span style={gabiEmptyStyles.actionLabel}>{t('pedido.dashboard.empty_periodo_maximo')}</span>
              <button type="button" style={gabiEmptyStyles.periodBtn} onClick={() => onExpandPeriod('30d')}>
                {t('pedido.dashboard.periodo_30d')}
              </button>
              <button type="button" style={gabiEmptyStyles.periodBtn} onClick={() => onExpandPeriod('12m')}>
                {t('pedido.dashboard.periodo_12m')}
              </button>
            </div>
          )}

          <div style={gabiEmptyStyles.rowActions}>
            <button type="button" style={gabiEmptyStyles.editBtn} onClick={onEdit}>
              {t('pedido.dashboard.empty_editar_campos')}
            </button>
            <button type="button" style={gabiEmptyStyles.removeBtn} onClick={onRemove}>
              {t('pedido.dashboard.empty_remover_widget')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const gabiEmptyStyles = {
  wrap: {
    position: 'relative' as const,
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  watermark: {
    position: 'absolute' as const,
    top: '50%',
    right: '-20px',
    transform: 'translateY(-50%) rotate(15deg)',
    color: 'rgba(255, 255, 255, 0.06)',
    pointerEvents: 'none' as const,
    zIndex: 0,
    lineHeight: 0,
  },
  inner: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.625rem',
    padding: '0.875rem 1rem',
  },
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  avatar: {
    width: '22px',
    height: '22px',
    borderRadius: '7px',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  tag: {
    fontSize: '0.6rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#a5f3fc',
  },
  text: {
    fontSize: '0.75rem',
    lineHeight: 1.55,
    color: 'rgba(255, 255, 255, 0.85)',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginTop: '0.125rem',
  },
  periodGroup: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '0.375rem',
  },
  actionLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: '0.05em',
  },
  periodBtn: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '999px',
    padding: '2px 10px',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
  },
  rowActions: {
    display: 'flex',
    gap: '1rem',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.75)',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
    textDecoration: 'underline',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#fca5a5',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
    textDecoration: 'underline',
  },

  // ── Seletor de Painéis ───────────────────────────────────────────────────
  painelBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    margin: '0.75rem 0 0.5rem',
    padding: '0 0.25rem',
    flexWrap: 'wrap' as const,
  },
  painelTab: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '6px',
    padding: '0.3rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
    transition: 'background 0.15s, color 0.15s',
  },
  painelTabAtivo: {
    background: 'rgba(139,92,246,0.18)',
    border: '1px solid rgba(139,92,246,0.5)',
    borderRadius: '6px',
    padding: '0.3rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#c4b5fd',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
  },
  painelAddBtn: {
    background: 'none',
    border: '1px dashed rgba(255,255,255,0.2)',
    borderRadius: '6px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.9rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.35)',
    cursor: 'pointer',
    lineHeight: 1,
    fontFamily: 'var(--font, inherit)',
  },
  painelNovoForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  painelNovoInput: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(139,92,246,0.5)',
    borderRadius: '6px',
    padding: '0.28rem 0.5rem',
    fontSize: '0.75rem',
    color: '#fff',
    outline: 'none',
    fontFamily: 'var(--font, inherit)',
    width: '140px',
  },
  painelNovoBtnOk: {
    background: 'rgba(139,92,246,0.7)',
    border: 'none',
    borderRadius: '6px',
    padding: '0.28rem 0.6rem',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
  },
  painelNovoBtnCancel: {
    background: 'none',
    border: 'none',
    padding: '0.28rem 0.4rem',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontFamily: 'var(--font, inherit)',
  },

  // ── Gerenciamento inline de painéis ─────────────────────────────────────
  painelTabWrap: {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
  },
  painelTabInner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
  },
  painelMenuBtn: {
    background: 'none',
    border: 'none',
    padding: '0 1px',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.4)',
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: 1,
    fontFamily: 'var(--font, inherit)',
    borderRadius: '3px',
  },
  painelMenuDropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 4px)',
    left: 0,
    background: '#1e1b2e',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    zIndex: 200,
    minWidth: '140px',
    overflow: 'hidden' as const,
    padding: '0.25rem 0',
  },
  painelMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '0.45rem 0.8rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontFamily: 'var(--font, inherit)',
  },
  painelMenuItemDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '0.45rem 0.8rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#fca5a5',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontFamily: 'var(--font, inherit)',
  },
  painelRenameInput: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(139,92,246,0.5)',
    borderRadius: '6px',
    padding: '0.28rem 0.5rem',
    fontSize: '0.75rem',
    color: '#fff',
    outline: 'none',
    fontFamily: 'var(--font, inherit)',
    width: '120px',
  },
} as const

const sty = gabiEmptyStyles

// ── SortableTabWrapper — wrapper dnd-kit para cada tab de painel ──────────────

function SortableTabWrapper({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        ...sty.painelTabWrap,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PedidosDashboard() {
  const { t } = useTranslation()
  const {
    widgets, addWidget, removeWidget, updateWidget, updateLayout,
    slicers, setPeriod, setStatusFilter,
    activeFilters, clearFilters,
    editMode, setEditMode: _setEditModeRaw,
    queryBuilderOpen, setQueryBuilderOpen,
    userDerivedMetrics,
    paineis, painelAtualId, setPaineis, setPainelAtual, salvarWidgetsPainelAtual,
  } = useDashboardStore()

  // Gating `pedido:dashboard:editar` (decisao dono + Líder + Coordenador 2026-05-13).
  // `podeEditar` é ESTRITO durante load — não permite entrar em editMode até
  // dados confirmados. Evita flash de affordance que dispararia 403 ao salvar.
  // Backend POST/PUT/DELETE widgets retornam 403 em caso real.
  const { podeEditar } = usePermissoesPedido()
  const podeEditarDashboard = podeEditar('dashboard')
  // Wrapper que bloqueia o setEditMode quando sem permissao.
  const setEditMode = (v: boolean) => {
    if (v && !podeEditarDashboard) return // ignora pedido de entrar em edicao
    _setEditModeRaw(v)
  }

  const navigate = useNavigate()
  const { trackWidget, trackInsight } = useTrackBehavior()
  const { mapa: topKpiStatusMapa } = useDashboardTopKpiStatus()

  const [distribuicaoGlobal, setDistribuicaoGlobal] = useState<DashboardDistributionGroup[]>([])
  const [kpisPorPeriodo, setKpisPorPeriodo] = useState<Record<string, DashboardKpis>>({})

  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)
  const idsWorkspacesEscopo = useEscopoWorkspacesPedido(s => s.idsWorkspacesEscopo)
  const escopoHidratado = useEscopoWorkspacesPedido(s => s.hidratado)
  const idsWorkspacesFiltro = useMemo(
    () => resolverIdsWorkspacesParaApi(idsWorkspacesEscopo, idWorkspaceAtivo ?? ''),
    [idsWorkspacesEscopo, idWorkspaceAtivo],
  )

  const periodOptions = useMemo(() => [
    { value: 'tudo',          label: t('pedido.config.cards.periodo_tudo', { defaultValue: 'Tudo' }) },
    { value: '7d',            label: t('nucleo.dashboard.periodo.ultimos_7_dias') },
    { value: '30d',           label: t('nucleo.dashboard.periodo.ultimos_30_dias') },
    { value: '6m',            label: t('pedido.config.cards.periodo_6m', { defaultValue: '6 meses' }) },
    { value: '1a',            label: t('pedido.config.cards.periodo_1a', { defaultValue: '1 ano' }) },
    { value: '90d',           label: t('nucleo.dashboard.periodo.ultimos_90_dias') },
    { value: '12m',           label: t('nucleo.dashboard.periodo.ultimos_12_meses') },
    { value: 'current_month', label: t('nucleo.dashboard.periodo.mes_atual') },
    { value: 'current_year',  label: t('nucleo.dashboard.periodo.ano_atual') },
    { value: 'custom',        label: t('nucleo.dashboard.periodo.personalizado') },
  ], [t])

  const statusConfig = useMemo((): Record<string, { label: string; cor: string }> => {
    try {
      const raw = localStorage.getItem('pedido:status_config')
      if (raw) return JSON.parse(raw) as Record<string, { label: string; cor: string }>
    } catch { /* fallback */ }
    return {}
  }, [])

  const handlePeriodChange = useCallback((period: string) => {
    setPeriod(period)
    if (!periodoDashboardEhSomenteDashboard(period)) {
      const lista = mapearPeriodoDashboardParaLista(period)
      if (lista) salvarPeriodoCardsLista(lista)
    }
  }, [setPeriod])

  const periodosWidgets = useMemo(() => {
    const set = new Set<string>([slicers.period])
    for (const w of widgets) {
      if (w.config?.periodLocked === true && w.query_spec.filters.period) {
        set.add(w.query_spec.filters.period)
      } else if (w.query_spec.filters.period === '12m') {
        set.add('12m')
      }
    }
    return [...set]
  }, [widgets, slicers.period])

  const resolverCustomRange = useCallback((period: string) => {
    if (!period.startsWith('custom:')) return undefined
    const [, s, e] = period.split(':')
    return s && e ? { from: `${s}T00:00:00.000Z`, to: `${e}T23:59:59.999Z` } : undefined
  }, [])

  const handleWidgetPeriodChange = useCallback((widgetId: string, period: string) => {
    const alvo = widgets.find(w => w.id === widgetId)
    if (!alvo) return
    updateWidget(widgetId, {
      query_spec: {
        ...alvo.query_spec,
        filters: { ...alvo.query_spec.filters, period },
      },
      config: { ...alvo.config, periodLocked: true },
    })
  }, [updateWidget, widgets])

  const handleClearWidgetPeriod = useCallback((widgetId: string) => {
    const alvo = widgets.find(w => w.id === widgetId)
    if (!alvo) return
    updateWidget(widgetId, {
      query_spec: {
        ...alvo.query_spec,
        filters: { ...alvo.query_spec.filters, period: slicers.period },
      },
      config: { ...alvo.config, periodLocked: false },
    })
  }, [updateWidget, widgets, slicers.period])

  const handleClearFiltersComPeriodo = useCallback(() => {
    clearFilters()
    handlePeriodChange('30d')
    for (const w of widgets) {
      if (w.config?.periodLocked) handleClearWidgetPeriod(w.id)
    }
  }, [clearFilters, handlePeriodChange, widgets, handleClearWidgetPeriod])

  useEffect(() => {
    const syncPeriodoComLista = () => {
      setPeriod(mapearPeriodoListaParaDashboard(lerPeriodoCardsLista()))
    }

    if (useDashboardStore.persist.hasHydrated()) {
      syncPeriodoComLista()
    } else {
      useDashboardStore.persist.onFinishHydration(syncPeriodoComLista)
    }

    window.addEventListener(PERIODO_CARDS_SYNC_EVENT, syncPeriodoComLista)
    return () => window.removeEventListener(PERIODO_CARDS_SYNC_EVENT, syncPeriodoComLista)
  }, [setPeriod])

  const { addNotification } = useShellStore()

  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [editingWidget,   setEditingWidget]   = useState<DashboardWidgetConfig | null>(null)
  const [editModalOpen,   setEditModalOpen]   = useState(false)

  const [kpisData,     setKpisData]     = useState<DashboardKpis | null>(null)
  const [prevKpisData, setPrevKpisData] = useState<DashboardKpis | null>(null)

  // T-10: compactStatus ativo em viewports < 1200px (Design System responsivo)
  const [compactStatus, setCompactStatus] = useState(() => window.innerWidth < 1200)
  useEffect(() => {
    function handleResize() { setCompactStatus(window.innerWidth < 1200) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [trendData,    setTrendData]    = useState<DashboardTrendBucket[]>([])
  const [insightsData, setInsightsData] = useState<GabiInsightItem[]>([])
  const [loadingData,  setLoadingData]  = useState(true)

  // NCM status — alerta de itens com NCM inválido (não bloqueante)
  const [ncmStatus, setNcmStatus] = useState<{
    total_invalidos: number
    itens_invalidos: number
    sem_sync: boolean
    ultima_sync: string | null
  } | null>(null)

  useEffect(() => {
    if (!escopoHidratado) return
    dashboardApi.ncmStatus(idsWorkspacesFiltro)
      .then(r => setNcmStatus(r))
      .catch(() => { /* silencioso — NCM offline não afeta o dashboard */ })
  }, [escopoHidratado, idsWorkspacesFiltro])
  const [novoNomePainel, setNovoNomePainel] = useState('')
  const [criandoPainel,  setCriandoPainel]  = useState(false)
  const [renamingId,     setRenamingId]     = useState<string | null>(null)
  const [renameValue,    setRenameValue]    = useState('')
  const [menuPainelId,   setMenuPainelId]   = useState<string | null>(null)
  const [deletingId,     setDeletingId]     = useState<string | null>(null)
  const renameInFlightRef = useRef<string | null>(null)

  const painelSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // Fecha menu ao clicar fora
  useEffect(() => {
    if (!menuPainelId) return
    const close = () => { setMenuPainelId(null); setDeletingId(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuPainelId])

  // Salva widgets do painel atual (localStorage) e troca para o novo
  const handleTrocarPainel = (novoId: string) => {
    if (novoId === painelAtualId) return
    if (painelAtualId) salvarWidgetsPainelAtual(painelAtualId, widgets)
    setPainelAtual(novoId)
  }

  // Renomeia painel — guarda contra double-call (onBlur + onSubmit)
  const handleRenomearPainel = (id: string, nome: string) => {
    if (renameInFlightRef.current === id) return  // segunda chamada ignorada
    renameInFlightRef.current = id
    setRenamingId(null)
    const trimmed = nome.trim()
    if (!trimmed) { renameInFlightRef.current = null; return }
    paineisDashboardApi.atualizar(id, { nome: trimmed })
      .then(() => {
        // lê estado fresco do store para evitar closure stale
        const fresh = useDashboardStore.getState().paineis
        setPaineis(fresh.map(p => p.id === id ? { ...p, nome: trimmed } : p))
      })
      .catch(() => {})
      .finally(() => { renameInFlightRef.current = null })
  }

  // Deleta painel via API (sem window.confirm — confirmação inline no menu)
  const handleDeletarPainel = (id: string) => {
    if (paineis.length <= 1) return
    paineisDashboardApi.deletar(id)
      .then(() => {
        const fresh = useDashboardStore.getState().paineis
        const atualizados = fresh.filter(p => p.id !== id)
        setPaineis(atualizados)
        if (painelAtualId === id) {
          const proximo = atualizados.find(p => p.is_visivel)
          if (proximo) setPainelAtual(proximo.id)
        }
      })
      .catch(() => {})
    setMenuPainelId(null)
    setDeletingId(null)
  }

  // Reordena painéis via drag (persiste na API)
  const handlePainelDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = paineis.findIndex(p => p.id === active.id)
    const newIndex = paineis.findIndex(p => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(paineis, oldIndex, newIndex)
    setPaineis(reordered)
    paineisDashboardApi.reordenar(reordered.map(p => p.id)).catch(() => {})
  }

  // Carrega painéis do usuário ao montar
  useEffect(() => {
    paineisDashboardApi.listar().then(({ data }) => setPaineis(data)).catch(() => {})
  }, [setPaineis])

  // Carrossel GABI — idêntico ao Hub
  const gabiCarouselRef = useRef<HTMLDivElement>(null)
  const [gabiPaused, setGabiPaused] = useState(false)

  const scrollGabi = useCallback((dir: 'left' | 'right') => {
    const el = gabiCarouselRef.current
    if (!el) return
    if (dir === 'right') {
      // Ao chegar no fim, volta ao início (loop)
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 340, behavior: 'smooth' })
      }
    } else {
      el.scrollBy({ left: -340, behavior: 'smooth' })
    }
  }, [])

  // allDerived deve vir antes de suggestions (evita TDZ)
  const allDerived: DerivedMetric[] = useMemo(
    () => [...BUILT_IN_DERIVED, ...userDerivedMetrics],
    [userDerivedMetrics],
  )

  // Catálogo traduzido (rebuild quando muda o idioma)
  const dashboardCatalog = useMemo(() => buildDashboardCatalog(t), [t])
  const catalogByKey = useMemo(() => buildCatalogByKey(t), [t])

  // Labels dos campos para o DashboardPainelEditarModal (produto-específico)
  const fieldLabels = useMemo(
    () => Object.fromEntries(dashboardCatalog.map(f => [f.key, f.label])),
    [dashboardCatalog],
  )

  // Posição de inserção de novos widgets — sempre após o último widget existente
  const gridBottom = useMemo(
    () => widgets.reduce((max, w) => Math.max(max, w.position.y + w.position.h), 0),
    [widgets],
  )

  // Sugestões computadas para o DashboardPainelSugestoes
  const suggestions = useMemo(
    () => generateSuggestions(
      widgets.map(w => w.id),
      allDerived,
      gridBottom,
      widgets.flatMap(w => w.query_spec.fields.map((f: { key: string }) => f.key)),
      dashboardCatalog,
    ),
    [widgets, allDerived, gridBottom, dashboardCatalog],
  )

  // Efeito visual reutilizável: scroll + outline pulse após adicionar qualquer widget
  const triggerWidgetAddedFX = useCallback((widgetId: string, title: string) => {
    try { addNotification({ type: 'success', message: t('pedido.dashboard.widget_adicionado', { titulo: title }), duration: 4000 }) } catch { /* ignorar */ }
    setTimeout(() => {
      const wrapper = document.querySelector(`[data-widget-id="${widgetId}"]`)
      wrapper?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        if (!wrapper) return
        wrapper.classList.add('wc-highlighted')
        setTimeout(() => wrapper.classList.remove('wc-highlighted'), 4500)
      }, 700)
    }, 300)
  }, [addNotification, t])

  const handleAddWidgetFromSuggestions = useCallback((widgetConfig: DashboardWidgetConfig) => {
    addWidget(widgetConfig)
    triggerWidgetAddedFX(widgetConfig.id, widgetConfig.title)
  }, [addWidget, triggerWidgetAddedFX])

  useEffect(() => {
    if (gabiPaused || loadingData) return
    const timer = setInterval(() => scrollGabi('right'), 5000)
    return () => clearInterval(timer)
  }, [gabiPaused, loadingData, scrollGabi])

  useEffect(() => {
    if (!escopoHidratado) return
    setLoadingData(true)
    const customRangeGlobal = resolverCustomRange(slicers.period)

    const extraPeriodos = periodosWidgets.filter(p => p !== slicers.period)

    Promise.all([
      dashboardApi.bundle(slicers.period, customRangeGlobal, idsWorkspacesFiltro, '12m', 'month'),
      dashboardApi.distribution(slicers.period, idsWorkspacesFiltro),
      Promise.all(
        extraPeriodos.map(async (period) => {
          const kpis = await dashboardApi.kpis(period, resolverCustomRange(period), idsWorkspacesFiltro)
          return [period, kpis] as const
        }),
      ),
    ])
      .then(([bundle, dist, extras]) => {
        setKpisData(bundle.kpis)
        setPrevKpisData(bundle.prev_kpis)
        setTrendData(bundle.trend.value)
        setDistribuicaoGlobal(dist.value)
        const mapa: Record<string, DashboardKpis> = { [slicers.period]: bundle.kpis }
        for (const [period, dados] of extras) mapa[period] = dados
        setKpisPorPeriodo(mapa)
      })
      .catch(err => console.error('[Dashboard] Erro ao carregar dados:', err))
      .finally(() => setLoadingData(false))
  }, [slicers.period, escopoHidratado, idsWorkspacesFiltro, periodosWidgets, resolverCustomRange])

  useEffect(() => {
    if (!escopoHidratado) return
    const customRangeGlobal = resolverCustomRange(slicers.period)
    dashboardApi.insights(slicers.period, customRangeGlobal, idsWorkspacesFiltro)
      .then(insightsRes => setInsightsData(insightsRes.insights))
      .catch(() => setInsightsData([]))
  }, [slicers.period, escopoHidratado, idsWorkspacesFiltro, resolverCustomRange])

  const activeWidgets = useMemo(() =>
    widgets.map(w => {
      const locked = w.config?.periodLocked === true
      const filters = locked
        ? w.query_spec.filters
        : w.query_spec.filters.period === '12m'
          ? w.query_spec.filters
          : { ...w.query_spec.filters, period: slicers.period }
      return {
        ...w,
        title: translateWidgetTitle(w, t),
        query_spec: { ...w.query_spec, filters },
      }
    }), [widgets, slicers.period, t],
  )

  const filtrosPeriodoAtivos = useMemo(() => {
    const chips: Array<{ id: string; label: string; onClear: () => void }> = []
    if (!periodoEhPadrao(slicers.period)) {
      chips.push({
        id: 'periodo-global',
        label: `${t('nucleo.dashboard.barra.periodo')}: ${rotuloPeriodoDashboard(slicers.period, periodOptions, t('nucleo.dashboard.periodo.personalizado'))}`,
        onClear: () => handlePeriodChange('30d'),
      })
    }
    for (const w of activeWidgets) {
      if (w.chart_type === 'SECTION_LABEL' || w.chart_type === 'GABI_INSIGHTS') continue
      const locked = w.config?.periodLocked === true
      const periodoWidget = w.query_spec.filters.period
      if (!widgetUsaPeriodoProprio(periodoWidget, slicers.period, locked)) continue
      chips.push({
        id: `periodo-${w.id}`,
        label: `${w.title}: ${rotuloPeriodoDashboard(periodoWidget, periodOptions, t('nucleo.dashboard.periodo.personalizado'))}`,
        onClear: () => handleClearWidgetPeriod(w.id),
      })
    }
    return chips
  }, [activeWidgets, slicers.period, periodOptions, t, handlePeriodChange, handleClearWidgetPeriod])

  const renderPeriodoControleWidget = useCallback((widget: DashboardWidgetConfig) => (
    <PeriodDropdown
      value={widget.query_spec.filters.period}
      options={periodOptions as PeriodOption[]}
      onChange={(p) => handleWidgetPeriodChange(widget.id, p)}
    />
  ), [periodOptions, handleWidgetPeriodChange])

  const renderWidget = useCallback((widget: DashboardWidgetConfig) => {
    const chartType = widget.chart_type
    const widgetPeriod = widget.query_spec.filters.period
    const kpisWidget = (kpisPorPeriodo[widgetPeriod] ?? kpisData) as DashboardKpis | null
    const locked = widget.config?.periodLocked === true
    const periodoProprio = widgetUsaPeriodoProprio(widgetPeriod, slicers.period, locked)
    const periodoRotuloWidget = periodoProprio
      ? rotuloPeriodoDashboard(widgetPeriod, periodOptions, t('nucleo.dashboard.periodo.personalizado'))
      : undefined
    const painelPeriodoProps = chartType === 'SECTION_LABEL' || chartType === 'GABI_INSIGHTS'
      ? {}
      : {
          periodoFiltroRotulo: periodoRotuloWidget,
          periodoControle: renderPeriodoControleWidget(widget),
          onLimparPeriodoWidget: periodoProprio ? () => handleClearWidgetPeriod(widget.id) : undefined,
        }

    // ── GABI_INSIGHTS — grid responsivo de insights da Gabi AI ─────────────
    if (chartType === 'GABI_INSIGHTS') {
      const insights = insightsData.length > 0
        ? insightsData
        : kpisData
          ? buildClientInsights(kpisData, prevKpisData, t)
          : [] // kpisData ainda não carregou — skeleton cobre esse estado

      return (
        <div
          key={widget.id}
          className="dp-gabi-card"
          onMouseEnter={() => setGabiPaused(true)}
          onMouseLeave={() => setGabiPaused(false)}
        >
          <div className="dp-gabi-watermark" aria-hidden="true">
            <RocketLaunch size={120} weight="fill" />
          </div>
          <div className="dp-gabi-main">
            <div className="dp-gabi-top-row">
              <div className="dp-gabi-header">
                <div className="dp-gabi-avatar">
                  <RocketLaunch weight="fill" size={13} color="#fff" />
                </div>
                <span className="dp-gabi-label">{t('pedido.dashboard.gabi_label')}</span>
              </div>
              <div className="dp-gabi-header-right">
                <button
                  className="dp-gabi-nav-btn"
                  type="button"
                  onClick={() => scrollGabi('left')}
                  aria-label={t('pedido.dashboard.gabi_insight_anterior')}
                >
                  <CaretLeft size={12} weight="bold" />
                </button>
                <button
                  className="dp-gabi-nav-btn"
                  type="button"
                  onClick={() => scrollGabi('right')}
                  aria-label={t('pedido.dashboard.gabi_proximo_insight')}
                >
                  <CaretRight size={12} weight="bold" />
                </button>
                <span className="dp-gabi-live-badge">
                  <span className="dp-gabi-live-dot" />
                  {t('pedido.dashboard.gabi_ao_vivo')}
                </span>
              </div>
            </div>

            <div className="dp-gabi-track" ref={gabiCarouselRef}>
              {loadingData
                ? [0, 1, 2, 3].map(i => (
                    <div key={i} className="dp-gabi-insight-card dp-gabi-insight-card--skeleton">
                      <div className="dp-gabi-skeleton-line dp-gabi-skeleton-line--short" />
                      <div className="dp-gabi-skeleton-line" />
                      <div className="dp-gabi-skeleton-line" />
                    </div>
                  ))
                : insights.map(ins => (
                    <div
                      key={ins.id}
                      className={`dp-gabi-insight-card${ins.variante === 'warn' ? ' dp-gabi-insight-card--warn' : ''}`}
                    >
                      <div className={`dp-gabi-insight-tag${ins.variante === 'warn' ? ' dp-gabi-insight-tag--warn' : ''}`}>
                        {ins.variante === 'warn'
                          ? <Warning size={10} weight="fill" />
                          : <RocketLaunch size={10} weight="fill" />}
                        {ins.tag}
                      </div>
                      <p className="dp-gabi-insight-text">{ins.texto}</p>
                      {(ins.stat || ins.textoLink) && (
                        <div className="dp-gabi-insight-bottom">
                          {ins.stat && (
                            <div className="dp-gabi-insight-stat">
                              <span className="dp-gabi-insight-stat-label">{ins.stat.label}</span>
                              <span className="dp-gabi-insight-stat-value">{ins.stat.valor}</span>
                            </div>
                          )}
                          {ins.textoLink && (
                            <button
                              className="dp-gabi-insight-link"
                              type="button"
                              onClick={() => {
                                trackInsight(ins.id)
                                if (ins.rota) window.location.href = ins.rota
                              }}
                            >
                              {ins.textoLink} <CaretRight size={10} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      )
    }

    // ── SECTION_LABEL — divisor de seção sem DashboardPainelContainer ────────────────
    if (chartType === 'SECTION_LABEL') {
      return (
        <div key={widget.id} style={sectionLabelStyle}>
          <span style={sectionLabelTextStyle}>{widget.title}</span>
          <div style={sectionLabelLineStyle} />
        </div>
      )
    }

    const result = kpisWidget
      ? buildWidgetResult(widget, kpisWidget, trendData, allDerived, catalogByKey)
      : { data: {}, chartType: widget.chart_type, partial: true, cached: false, computed_at: new Date().toISOString() }
    const fields = widget.query_spec.fields
    const isDerived = !!widget.config?.derivedMetricId

    // ── Estado vazio detectado pela GABI ─────────────────────────────────────
    if (!loadingData && kpisWidget && isResultEmpty(result, isDerived)) {
      return (
        <DashboardPainelContainer
          key={widget.id}
          widget={widget}
          result={result}
          loading={false}
          error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
          {...painelPeriodoProps}
        >
          <WidgetEmptyGabi
            widget={widget}
            fieldNames={fields.map((f: { key: string }) => fieldLabels[f.key] ?? f.key)}
            currentPeriod={slicers.period}
            onExpandPeriod={handlePeriodChange}
            onEdit={() => { setEditingWidget(widget); setEditModalOpen(true) }}
            onRemove={() => removeWidget(widget.id)}
          />
        </DashboardPainelContainer>
      )
    }

    // ── DISTRIBUTION ────────────────────────────────────────────────────────
    if (chartType === 'DISTRIBUTION') {
      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
          {...painelPeriodoProps}
        >
          <DashboardWidgetDistribuicao slices={result.slices ?? []} />
        </DashboardPainelContainer>
      )
    }

    // ── LINE / AREA ──────────────────────────────────────────────────────────
    if (chartType === 'LINE' || chartType === 'AREA') {
      const catalogFields = fields.map(fqs => catalogByKey[fqs.key]).filter(Boolean)
      const { assignments, dualAxis, leftUnit, rightUnit } = resolveAxisAssignment(catalogFields)

      const series: LineSeriesConfig[] = fields.map((fqs, i) => {
        const cat = catalogByKey[fqs.key]
        const unit: FieldUnitType = cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number'
        const seriesPoints = result.series ?? []
        return {
          fieldKey: fqs.key,
          label: cat?.label ?? fqs.key,
          color: SERIES_COLORS[i % SERIES_COLORS.length] as string,
          data: seriesPoints.map(pt => ({ month: pt.month as string, value: (pt[fqs.key] as number) ?? 0 })),
          yAxisId: assignments[fqs.key] ?? 'left',
          unit,
        }
      })

      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
          {...painelPeriodoProps}
        >
          <DashboardWidgetLinha
            series={series}
            dualAxis={dualAxis}
            leftUnit={leftUnit ?? 'number'}
            rightUnit={rightUnit ?? undefined}
            showArea={chartType === 'AREA'}
          />
        </DashboardPainelContainer>
      )
    }

    // ── BAR / BAR_HORIZONTAL ─────────────────────────────────────────────────
    if (chartType === 'BAR' || chartType === 'BAR_HORIZONTAL') {
      const catalogFields = fields.map(fqs => catalogByKey[fqs.key]).filter(Boolean)
      const { assignments, dualAxis, leftUnit, rightUnit } = resolveAxisAssignment(catalogFields)

      const series: BarSeriesConfig[] = fields.map((fqs, i) => {
        const cat = catalogByKey[fqs.key]
        const unit: FieldUnitType = cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number'
        const seriesPoints = result.series ?? []
        return {
          fieldKey: fqs.key,
          label: cat?.label ?? fqs.key,
          color: SERIES_COLORS[i % SERIES_COLORS.length] as string,
          data: seriesPoints.map(pt => ({ month: pt.month as string, value: (pt[fqs.key] as number) ?? 0 })),
          yAxisId: assignments[fqs.key] ?? 'left',
          unit,
        }
      })

      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
          {...painelPeriodoProps}
        >
          <DashboardWidgetBarras
            series={series}
            dualAxis={dualAxis}
            leftUnit={leftUnit ?? 'number'}
            rightUnit={rightUnit ?? undefined}
            horizontal={chartType === 'BAR_HORIZONTAL'}
          />
        </DashboardPainelContainer>
      )
    }

    // ── KPI_CARD ─────────────────────────────────────────────────────────────
    if (chartType === 'KPI_CARD') {
      const fieldKey = fields[0]?.key ?? 'value'
      const cat = catalogByKey[fieldKey]
      const dm = widget.config?.derivedMetricId
        ? allDerived.find(m => m.id === widget.config!.derivedMetricId)
        : undefined
      const fieldType: FieldUnitType = dm?.fieldType ?? (cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number')
      const visual   = WIDGET_VISUAL[widget.id] ?? {}
      const navRoute = WIDGET_NAV_ROUTE[widget.id]

      const isTopKpi = (DASHBOARD_TOP_KPI_WIDGET_IDS as readonly string[]).includes(widget.id)
      let widgetRender = widget
      let kpiData = result.data
      let kpiFieldKey = fieldKey
      let kpiFieldType: FieldUnitType = fieldType
      let currentVal = Number(kpisWidget?.[fieldKey] ?? 0)
      let prevVal    = Number(prevKpisData?.[fieldKey] ?? 0)

      if (isTopKpi && kpisWidget) {
        const statusSlug = topKpiStatusMapa[widget.id as DashboardTopKpiWidgetId]
        const count = contagemPorStatusSlug(statusSlug, kpisWidget, distribuicaoGlobal)
        const tituloStatus = rotuloStatusSlug(statusSlug, statusConfig, t)
        widgetRender = { ...widget, title: tituloStatus }
        kpiData = { [fieldKey]: count }
        kpiFieldKey = fieldKey
        kpiFieldType = 'number'
        currentVal = count
        prevVal = count
      }

      const deltaInfo  = computeDelta(currentVal, prevVal)
      return (
        <DashboardPainelContainer key={widget.id} widget={widgetRender} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
          accentColor={visual.accentColor}
          icone={visual.icone}
          clickable={!!navRoute}
          onClick={() => {
            trackWidget(widget.id)
            if (navRoute && !editMode) navigate(navRoute)
          }}
          {...painelPeriodoProps}
        >
          <DashboardValorKPI
            data={kpiData}
            fieldKey={kpiFieldKey}
            fieldType={kpiFieldType}
            delta={isTopKpi ? undefined : deltaInfo.delta}
            deltaPercent={isTopKpi ? undefined : deltaInfo.percent}
            deltaDirection={isTopKpi ? undefined : deltaInfo.direction}
          />
        </DashboardPainelContainer>
      )
    }

    // ── Fallback ─────────────────────────────────────────────────────────────
    const fieldKey = fields[0]?.key ?? 'value'
    return (
      <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
        editMode={editMode}
        onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
        onRemove={removeWidget}
        {...painelPeriodoProps}
      >
        <DashboardValorKPI data={result.data} fieldKey={fieldKey} fieldType="number" />
      </DashboardPainelContainer>
    )
  }, [editMode, removeWidget, allDerived, kpisData, kpisPorPeriodo, prevKpisData, trendData, loadingData, slicers, setPeriod, fieldLabels, catalogByKey, t, topKpiStatusMapa, statusConfig, distribuicaoGlobal, periodOptions, handleClearWidgetPeriod, renderPeriodoControleWidget, navigate, trackWidget, handlePeriodChange, insightsData])

  function handleQueryBuilderSave(spec: WidgetQuerySpec, title: string, chartType: ChartType) {
    const id = `custom_${Date.now()}`
    addWidget({
      id,
      title,
      chart_type: chartType,
      query_spec: spec,
      position: { x: 0, y: gridBottom, w: chartType === 'KPI_CARD' ? 3 : 6, h: chartType === 'KPI_CARD' ? 2 : 3 },
    })
    setQueryBuilderOpen(false)
    triggerWidgetAddedFX(id, title)
  }

  const STATUS_OPTIONS = ['abertos', 'em_andamento', 'atrasados', 'concluidos']

  // Lê cores e labels definidas pelo usuário em Configurações (pedido:status_config)
  function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  // Mapeamento: chave do filtro do dashboard → id do status no localStorage
  const STATUS_CONFIG_MAP: Record<string, string> = {
    abertos:      'aberto',
    em_andamento: 'em_andamento',
    atrasados:    'atrasados',   // calculado — sem entrada no config, usa fallback
    concluidos:   'consolidado',
  }

  const STATUS_LABELS: Record<string, string> = {
    abertos:      statusConfig['aberto']?.label       ?? t('pedido.dashboard.status_abertos'),
    em_andamento: statusConfig['em_andamento']?.label  ?? t('pedido.dashboard.status_em_andamento'),
    atrasados:    statusConfig['atrasados']?.label     ?? t('pedido.dashboard.status_atrasados'),
    concluidos:   statusConfig['consolidado']?.label   ?? t('pedido.dashboard.status_concluidos'),
  }

  const STATUS_ACTIVE_COLORS: Record<string, { bg: string; border: string; text: string }> = Object.fromEntries(
    STATUS_OPTIONS.map(opt => {
      const configId = STATUS_CONFIG_MAP[opt]
      const cor = statusConfig[configId]?.cor
      if (cor) return [opt, { bg: hexToRgba(cor, 0.15), border: cor, text: cor }]
      // Fallback para status sem config (ex: atrasados = calculado)
      return [opt, { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#ef4444' }]
    })
  )

  return (
    <div className="pedido-page-shell" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '1rem' }}>

      {/* ── Onboarding banner — fixo, nunca some ───────────────────────── */}
      <div style={onboardingBannerStyle}>
        <div style={onboardingBannerContent}>
          <span style={onboardingBannerTitle}>{t('pedido.dashboard.onboarding_titulo')}</span>
          <span style={onboardingBannerText}>
            {t('pedido.dashboard.onboarding_texto')}
          </span>
          <div style={onboardingBannerActions}>
            <button
              type="button"
              style={onboardingBtnAccent}
              onClick={() => setSuggestionsOpen(true)}
            >
              <RocketLaunch size={13} weight="fill" />
              {t('pedido.dashboard.onboarding_explorar_sugestoes')}
            </button>
            <button
              type="button"
              style={onboardingBtnGhost}
              onClick={() => { setEditMode(true); setQueryBuilderOpen(true) }}
            >
              {t('pedido.dashboard.onboarding_criar_dashboard')}
            </button>
          </div>
        </div>
      </div>


      {/* T-07/08: statusCounts do kpisData em memória | T-10: compactStatus responsivo */}
      <DashboardBarraFerramentas
        slicers={slicers}
        onPeriodChange={handlePeriodChange}
        periodOptions={periodOptions}
        onStatusChange={setStatusFilter}
        activeFilters={activeFilters}
        onClearFilters={handleClearFiltersComPeriodo}
        editMode={editMode}
        onEditModeChange={setEditMode}
        statusOptions={STATUS_OPTIONS}
        statusLabels={STATUS_LABELS}
        statusActiveColors={STATUS_ACTIVE_COLORS}
        statusCounts={kpisData ? {
          todos:        kpisData.total_pedidos,
          abertos:      kpisData.pedidos_abertos,
          em_andamento: kpisData.pedidos_em_andamento,
          atrasados:    kpisData.pedidos_atrasados,
          concluidos:   kpisData.pedidos_consolidados,
        } : undefined}
        compactStatus={compactStatus}
        onAddWidget={undefined}
        onSuggestionsOpen={() => setSuggestionsOpen(true)}
      />

      {filtrosPeriodoAtivos.length > 0 && (
        <div className="fc-chips-container" role="status" aria-label={t('pedido.dashboard.filtros_periodo_aria', { defaultValue: 'Filtros de período ativos' })}>
          {filtrosPeriodoAtivos.map(f => (
            <span key={f.id} className="fc-chip">
              <span className="fc-chip-body">
                <span className="fc-chip-valor">{f.label}</span>
              </span>
              <button type="button" className="fc-chip-remove" onClick={f.onClear} aria-label={t('pedido.dashboard.remover_filtro_periodo', { defaultValue: 'Remover filtro de período' })}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Seletor de Painéis */}
      {paineis.length > 0 && (
        <div style={sty.painelBar}>
          <DndContext sensors={painelSensors} collisionDetection={closestCenter} onDragEnd={handlePainelDragEnd}>
            <SortableContext
              items={paineis.filter(p => p.is_visivel).map(p => p.id)}
              strategy={horizontalListSortingStrategy}
            >
              {paineis.filter(p => p.is_visivel).map(p => (
                <SortableTabWrapper key={p.id} id={p.id}>
                  {/* Rename inline */}
                  {renamingId === p.id ? (
                    <form
                      style={sty.painelNovoForm}
                      onSubmit={(e) => { e.preventDefault(); handleRenomearPainel(p.id, renameValue) }}
                      // Impede que o dnd-kind capture eventos no input
                      onPointerDown={e => e.stopPropagation()}
                    >
                      <input
                        autoFocus
                        type="text"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => handleRenomearPainel(p.id, renameValue)}
                        onKeyDown={e => { if (e.key === 'Escape') { setRenamingId(null); renameInFlightRef.current = null } }}
                        style={sty.painelRenameInput}
                        maxLength={60}
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      style={p.id === painelAtualId ? sty.painelTabAtivo : sty.painelTab}
                      onClick={() => handleTrocarPainel(p.id)}
                      onDoubleClick={() => { renameInFlightRef.current = null; setRenamingId(p.id); setRenameValue(p.nome) }}
                      onPointerDown={e => e.stopPropagation()}  // clique não inicia drag
                    >
                      <span style={sty.painelTabInner}>
                        {p.nome}
                        <span
                          role="button"
                          aria-label={t('pedido.dashboard.painel_opcoes')}
                          style={sty.painelMenuBtn}
                          onPointerDown={e => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); setMenuPainelId(prev => prev === p.id ? null : p.id); setDeletingId(null) }}
                        >
                          <DotsThree size={14} weight="bold" />
                        </span>
                      </span>
                    </button>
                  )}

                  {/* Dropdown menu */}
                  {menuPainelId === p.id && (
                    <div style={sty.painelMenuDropdown} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
                      {deletingId === p.id ? (
                        /* Confirmação inline */
                        <div style={{ padding: '0.5rem 0.75rem' }}>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 0.5rem' }}>
                            {t('pedido.dashboard.painel_excluir_prefixo')}{' '}
                            <strong style={{ color: '#fff' }}>{p.nome}</strong>
                            {t('pedido.dashboard.painel_excluir_sufixo')}
                          </p>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button type="button" style={sty.painelNovoBtnOk} onClick={() => handleDeletarPainel(p.id)}>
                              {t('comum.confirmar')}
                            </button>
                            <button type="button" style={sty.painelNovoBtnCancel} onClick={() => setDeletingId(null)}>
                              {t('comum.cancelar')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            style={sty.painelMenuItem}
                            onClick={() => { renameInFlightRef.current = null; setRenamingId(p.id); setRenameValue(p.nome); setMenuPainelId(null) }}
                          >
                            <PencilSimple size={13} />
                            {t('pedido.dashboard.painel_renomear')}
                          </button>
                          <button
                            type="button"
                            style={paineis.length <= 1 ? { ...sty.painelMenuItemDanger, opacity: 0.35, cursor: 'default' } : sty.painelMenuItemDanger}
                            onClick={() => paineis.length > 1 && setDeletingId(p.id)}
                            disabled={paineis.length <= 1}
                            title={paineis.length <= 1 ? t('pedido.dashboard.painel_excluir_unico_bloqueado') : ''}
                          >
                            <Trash size={13} />
                            {t('pedido.dashboard.painel_excluir')}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </SortableTabWrapper>
              ))}
            </SortableContext>
          </DndContext>

          {/* Criar novo painel */}
          {criandoPainel ? (
            <form
              style={sty.painelNovoForm}
              onSubmit={(e) => {
                e.preventDefault()
                const nome = novoNomePainel.trim()
                if (!nome) return
                // Salva widgets do painel atual antes de trocar
                if (painelAtualId) salvarWidgetsPainelAtual(painelAtualId, widgets)
                paineisDashboardApi.criar(nome).then(({ data }) => {
                  // Inicializa explicitamente o novo painel como [] (distingue de "nunca salvo")
                  salvarWidgetsPainelAtual(data.id, [])
                  setPaineis([...paineis, data])
                  setPainelAtual(data.id)
                  setNovoNomePainel('')
                  setCriandoPainel(false)
                }).catch(() => {})
              }}
            >
              <input
                autoFocus
                type="text"
                placeholder={t('pedido.dashboard.painel_novo_placeholder')}
                value={novoNomePainel}
                onChange={(e) => setNovoNomePainel(e.target.value)}
                style={sty.painelNovoInput}
                maxLength={60}
              />
              <button type="submit" style={sty.painelNovoBtnOk}>{t('pedido.dashboard.painel_criar')}</button>
              <button type="button" style={sty.painelNovoBtnCancel} onClick={() => { setCriandoPainel(false); setNovoNomePainel('') }}>
                <X size={11} />
              </button>
            </form>
          ) : (
            <button type="button" style={sty.painelAddBtn} onClick={() => setCriandoPainel(true)} title={t('pedido.dashboard.painel_novo')}>
              +
            </button>
          )}

          {/* Chip NCM inline */}
          {ncmStatus && (ncmStatus.itens_invalidos > 0 || ncmStatus.sem_sync) && (
            <span
              title={ncmStatus.sem_sync
                ? t('pedido.dashboard.ncm_nao_sincronizada')
                : t('pedido.dashboard.ncm_itens_invalidos_tooltip', { count: ncmStatus.itens_invalidos })
              }
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: '999px',
                padding: '0.2rem 0.6rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#fbbf24',
                cursor: 'default',
                whiteSpace: 'nowrap',
              }}
            >
              <Warning size={11} weight="fill" />
              {ncmStatus.sem_sync
                ? t('pedido.dashboard.ncm_desatualizada')
                : t('pedido.dashboard.ncm_invalido_chip', { count: ncmStatus.itens_invalidos })}
            </span>
          )}
        </div>
      )}

      <DashboardGrid
        widgets={activeWidgets}
        renderWidget={renderWidget}
        editMode={editMode}
        onLayoutChange={(layouts) => {
          if (!editMode) return
          const lg = layouts.lg ?? []
          updateLayout(lg.map((item) => ({
            id: item.i,
            position: { x: item.x, y: item.y, w: item.w, h: item.h },
          })))
        }}
      />

      <DashboardConstrutorConsulta
        aberto={queryBuilderOpen}
        availableFields={dashboardCatalog}
        onSave={handleQueryBuilderSave}
        onCancel={() => setQueryBuilderOpen(false)}
      />

      <DashboardPainelEditarModal
        widget={editingWidget}
        aberto={editModalOpen}
        onFechar={() => { setEditModalOpen(false); setEditingWidget(null) }}
        onSalvar={(patch) => { if (editingWidget) updateWidget(editingWidget.id, patch) }}
        fieldLabels={fieldLabels}
      />

      {suggestionsOpen && (
        <DashboardPainelSugestoes
          suggestions={suggestions}
          derivedMetrics={allDerived}
          onAdd={handleAddWidgetFromSuggestions}
          onClose={() => setSuggestionsOpen(false)}
          onCreateCustom={() => { setEditMode(true); setQueryBuilderOpen(true) }}
        />
      )}
    </div>
  )
}

// ── Estilos onboarding banner ─────────────────────────────────────────────────

const onboardingBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '14px 20px',
  marginBottom: '1rem',
  background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
  border: '1px solid rgba(99,102,241,0.25)',
  borderRadius: 'var(--radius-lg)',
}

const onboardingBannerContent: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.5rem 1rem',
}

const onboardingBannerTitle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: 'var(--text-primary)',
}

const onboardingBannerText: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-secondary)',
}

const onboardingBannerActions: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
}

const onboardingBtnAccent: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.875rem',
  fontWeight: 600,
  padding: '6px 14px',
  borderRadius: '9999px',
  background: 'var(--accent)',
  border: '1px solid var(--accent)',
  color: '#fff',
  cursor: 'pointer',
  boxShadow: '0 0 14px rgba(99,102,241,0.45)',
}

const onboardingBtnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.875rem',
  fontWeight: 600,
  padding: '6px 14px',
  borderRadius: '9999px',
  background: 'transparent',
  border: '1px solid rgba(99,102,241,0.4)',
  color: 'var(--accent)',
  cursor: 'pointer',
}

// ── Estilos section label ─────────────────────────────────────────────────────

const sectionLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  height: '100%',
  padding: '0 4px',
}

const sectionLabelTextStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  whiteSpace: 'nowrap',
}

const sectionLabelLineStyle: React.CSSProperties = {
  flex: 1,
  height: '1px',
  background: 'var(--border-default)',
}
