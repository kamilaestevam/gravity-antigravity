/**
 * DashboardPedido.tsx — View Dashboard do produto Pedido
 *
 * v2 — 2026-04-03
 * - mockResult produz series[] para LINE/AREA/BAR multi-campo
 * - mockResult produz slices[] para DISTRIBUTION
 * - renderWidget usa contratos novos (LineSeriesConfig[], BarSeriesConfig[])
 * - Hack status_dist removido — widget usa DISTRIBUTION real
 * - WidgetEditModal exibe FieldQuerySpec[] com operação por campo
 */

import React, { useMemo, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShellStore } from '@shell'
import {
  DashboardGrid,
  WidgetContainer,
  LineChartWidget,
  BarChartWidget,
  DistributionWidget,
  DashboardToolbar,
  WidgetEditModal,
  SuggestionsPanel,
  KpiValue,
} from '@nucleo/dashboard'
import { QueryBuilder } from '@nucleo/query-builder-global'
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
} from '@nucleo/dashboard'
import { resolveAxisAssignment, SERIES_COLORS, formatValueByUnit } from '@nucleo/dashboard'
import {
  Package, ClipboardText, Scales, CurrencyDollar,
  Warning, UserCircleMinus, CheckCircle,
  ListNumbers, ArrowsLeftRight, Tag,
  CaretLeft, CaretRight, Sparkle, RocketLaunch,
} from '@phosphor-icons/react'
import './DashboardPedido.css'

import { useDashboardStore } from '../stores/dashboardStore'
import { useTrackBehavior } from '../hooks/useTrackBehavior'
import { DASHBOARD_CATALOG, CATALOG_BY_KEY } from '../shared/dashboardCatalog'
import { generateSuggestions } from '../shared/dashboardSuggestions'
import { BUILT_IN_DERIVED, computeDerived } from '../shared/derivedMetrics'
import { dashboardApi } from '../shared/api'
import type { DashboardKpis, DashboardTrendBucket, GabiInsightItem } from '../shared/api'

// ── Dados reais — converte resposta da API em WidgetResult ────────────────────

function buildWidgetResult(
  widget: DashboardWidgetConfig,
  kpis: DashboardKpis,
  trend: DashboardTrendBucket[],
  allDerived: DerivedMetric[],
): WidgetResult {
  const now = new Date().toISOString()
  const fields = widget.query_spec.fields
  const chartType = widget.chart_type

  // ── DISTRIBUTION ──────────────────────────────────────────────────────────
  if (chartType === 'DISTRIBUTION') {
    const slices: WidgetDistributionSlice[] = fields.map(fqs => {
      const catalog = CATALOG_BY_KEY[fqs.key]
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
        const cat = CATALOG_BY_KEY[fqs.key]
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

// ── (KpiValue, WidgetEditModal e SuggestionsPanel migrados para @nucleo/dashboard) ──

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

function buildClientInsights(kpis: DashboardKpis, prev?: DashboardKpis | null): GabiInsightItem[] {
  const items: GabiInsightItem[] = []

  // ── ALERTAS (warn) — sempre primeiro ─────────────────────────────────────────

  if (kpis.pedidos_atrasados > 0) {
    const taxa = kpis.total_pedidos > 0 ? (kpis.pedidos_atrasados / kpis.total_pedidos) * 100 : 0
    items.push({
      id: 'atrasados',
      variante: 'warn',
      tag: 'Atenção · Pedidos Atrasados',
      texto: `${kpis.pedidos_atrasados} pedido${kpis.pedidos_atrasados > 1 ? 's' : ''} com prazo vencido. Ação imediata recomendada.`,
      stat: { label: 'Taxa de atraso', valor: fmtPct(taxa) },
      textoLink: 'Ver atrasados',
      rota: '/pedidos/lista?status=atrasado',
    })
  }

  if (kpis.pedidos_sem_exportador > 0) {
    items.push({
      id: 'sem_exportador',
      variante: 'warn',
      tag: 'Atenção · Sem Exportador',
      texto: `${kpis.pedidos_sem_exportador} pedido${kpis.pedidos_sem_exportador > 1 ? 's' : ''} sem exportador vinculado — bloqueio de faturamento em risco.`,
      stat: { label: 'Sem exportador', valor: fmtNum(kpis.pedidos_sem_exportador) },
      textoLink: 'Corrigir agora',
      rota: '/pedidos/lista?exportador=nenhum',
    })
  }

  if (kpis.pedidos_cancelados > 0 && kpis.total_pedidos > 0) {
    const pct = (kpis.pedidos_cancelados / kpis.total_pedidos) * 100
    items.push({
      id: 'cancelados',
      variante: pct > 10 ? 'warn' : 'default',
      tag: pct > 10 ? 'Atenção · Cancelamentos' : 'Alerta · Cancelamentos',
      texto: `${kpis.pedidos_cancelados} pedido${kpis.pedidos_cancelados > 1 ? 's' : ''} cancelado${kpis.pedidos_cancelados > 1 ? 's' : ''} no período — ${fmtPct(pct)} do total.`,
      stat: { label: 'Total no período', valor: fmtNum(kpis.total_pedidos) },
      textoLink: 'Ver cancelados',
      rota: '/pedidos/lista?status=cancelado',
    })
  }

  if (kpis.pedidos_draft > 0) {
    items.push({
      id: 'draft',
      variante: 'warn',
      tag: 'Atenção · Rascunhos',
      texto: `${kpis.pedidos_draft} pedido${kpis.pedidos_draft > 1 ? 's' : ''} em rascunho ainda não foram enviados para operação.`,
      stat: { label: 'Em rascunho', valor: fmtNum(kpis.pedidos_draft) },
      textoLink: 'Ver rascunhos',
      rota: '/pedidos/lista?status=draft',
    })
  }

  // ── OPERACIONAL ───────────────────────────────────────────────────────────────

  if (kpis.pedidos_abertos > 0) {
    items.push({
      id: 'abertos',
      variante: 'default',
      tag: 'Operacional · Em Aberto',
      texto: `${kpis.pedidos_abertos} pedido${kpis.pedidos_abertos > 1 ? 's' : ''} em aberto prontos para iniciar transferência.`,
      stat: kpis.qtd_transferida_total > 0
        ? { label: 'Qtd. já transferida', valor: fmtNum(kpis.qtd_transferida_total) }
        : { label: 'Pedidos abertos', valor: fmtNum(kpis.pedidos_abertos) },
      textoLink: 'Ver pedidos',
      rota: '/pedidos/lista?status=aberto',
    })
  }

  if (kpis.pedidos_em_andamento > 0) {
    const txTransf = kpis.qtd_inicial_total > 0
      ? (kpis.qtd_transferida_total / kpis.qtd_inicial_total) * 100 : 0
    items.push({
      id: 'transferencia',
      variante: 'default',
      tag: 'Operacional · Transferência',
      texto: `${kpis.pedidos_em_andamento} pedido${kpis.pedidos_em_andamento > 1 ? 's' : ''} em fase de transferência de quantidades.`,
      stat: { label: 'Taxa de transferência', valor: fmtPct(txTransf) },
      textoLink: 'Ver em andamento',
      rota: '/pedidos/lista?status=transferencia',
    })
  }

  if (kpis.itens_prontos > 0) {
    const pctPronta = kpis.qtd_inicial_total > 0
      ? (kpis.itens_prontos / kpis.qtd_inicial_total) * 100 : 0
    items.push({
      id: 'qtd_pronta',
      variante: 'default',
      tag: 'Operacional · Qtd. Pronta',
      texto: `${fmtNum(kpis.itens_prontos)} unidades prontas disponíveis para embarque — ${fmtPct(pctPronta)} do total.`,
      stat: { label: 'Saldo disponível', valor: fmtNum(kpis.qtd_atual_total) },
      textoLink: 'Ver prontos',
      rota: '/pedidos/lista?status=pronto',
    })
  }

  if (kpis.pedidos_consolidados > 0) {
    items.push({
      id: 'consolidados',
      variante: 'default',
      tag: 'Operacional · Consolidados',
      texto: `${kpis.pedidos_consolidados} pedido${kpis.pedidos_consolidados > 1 ? 's' : ''} consolidado${kpis.pedidos_consolidados > 1 ? 's' : ''} no período.`,
      stat: { label: 'Consolidados', valor: fmtNum(kpis.pedidos_consolidados) },
      textoLink: 'Ver consolidados',
      rota: '/pedidos/lista?status=consolidado',
    })
  }

  // ── FINANCEIRO ────────────────────────────────────────────────────────────────

  if (kpis.valor_total > 0) {
    items.push({
      id: 'financeiro',
      variante: 'default',
      tag: 'Financeiro · Carteira',
      texto: `Carteira do período totaliza ${fmtBRL(kpis.valor_total)} em pedidos.`,
      stat: kpis.ticket_medio > 0
        ? { label: 'Ticket médio', valor: fmtBRL(kpis.ticket_medio) }
        : { label: 'Total de pedidos', valor: fmtNum(kpis.total_pedidos) },
      textoLink: 'Ver tendências',
    })
  }

  if (kpis.valor_total_brl > 0 && Math.abs(kpis.valor_total_brl - kpis.valor_total) > 1) {
    items.push({
      id: 'cambio_brl',
      variante: 'default',
      tag: 'Financeiro · Exposição BRL',
      texto: `Exposição total convertida pela PTAX mais recente. Moedas: ${(kpis.moedas_sem_taxa as string[]).length > 0 ? 'algumas sem taxa disponível' : 'todas convertidas'}.`,
      stat: { label: 'Total em BRL', valor: fmtBRL(kpis.valor_total_brl) },
      textoLink: 'Ver exposição',
    })
  }

  if (kpis.valor_itens_total > 0) {
    items.push({
      id: 'valor_itens',
      variante: 'default',
      tag: 'Financeiro · Valor dos Itens',
      texto: `Valor total dos itens (FOB/CIF) no período selecionado.`,
      stat: { label: 'Valor itens', valor: fmtBRL(kpis.valor_itens_total) },
      textoLink: 'Ver itens',
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
        tag: `Tendência · Volume ${crescendo ? 'Crescente' : 'Queda'}`,
        texto: `Volume de pedidos ${crescendo ? 'cresceu' : 'caiu'} ${fmtPct(pct)} vs. período anterior.`,
        stat: { label: 'Período anterior', valor: fmtNum(prev.total_pedidos) },
        textoLink: 'Ver tendências',
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
        tag: `Financeiro · Valor ${crescendo ? 'Aumentou' : 'Reduziu'}`,
        texto: `Valor da carteira ${crescendo ? 'aumentou' : 'reduziu'} ${fmtPct(pct)} em relação ao período anterior.`,
        stat: { label: 'Variação', valor: `${crescendo ? '+' : ''}${fmtBRL(delta)}` },
        textoLink: 'Ver tendências',
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
      tag: 'Análise · Imp. vs Exp.',
      texto: `${pctImp}% das operações são importações e ${100 - pctImp}% exportações no período.`,
      stat: { label: 'Total de operações', valor: fmtNum(totalOps) },
      textoLink: 'Ver distribuição',
    })
  }

  // ── FALLBACK ──────────────────────────────────────────────────────────────────

  if (items.length === 0) {
    items.push({
      id: 'status_ok',
      variante: 'default',
      tag: 'Status · Tudo em dia',
      texto: 'Nenhuma pendência identificada. Operação normalizada no período selecionado.',
      stat: { label: 'Pedidos no período', valor: fmtNum(kpis.total_pedidos) },
      textoLink: 'Ver pedidos',
      rota: '/pedidos/lista',
    })
    items.push({
      id: 'dica_periodo',
      variante: 'default',
      tag: 'Dica · Gabi AI',
      texto: 'Use o filtro de período para explorar tendências históricas dos seus pedidos.',
      stat: { label: 'Período', valor: kpis.period ?? '30d' },
      textoLink: 'Explorar dados',
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

// ── Componente principal ──────────────────────────────────────────────────────

export default function DashboardPedido() {
  const {
    widgets, addWidget, removeWidget, updateWidget, updateLayout,
    slicers, setPeriod, setStatusFilter,
    activeFilters, clearFilters,
    editMode, setEditMode,
    queryBuilderOpen, setQueryBuilderOpen,
    userDerivedMetrics,
  } = useDashboardStore()

  const navigate = useNavigate()
  const { trackWidget, trackInsight } = useTrackBehavior()


  const { addNotification } = useShellStore()

  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [editingWidget,   setEditingWidget]   = useState<DashboardWidgetConfig | null>(null)
  const [editModalOpen,   setEditModalOpen]   = useState(false)

  const [kpisData,     setKpisData]     = useState<DashboardKpis | null>(null)
  const [prevKpisData, setPrevKpisData] = useState<DashboardKpis | null>(null)
  const [trendData,    setTrendData]    = useState<DashboardTrendBucket[]>([])
  const [insightsData, setInsightsData] = useState<GabiInsightItem[]>([])
  const [loadingData,  setLoadingData]  = useState(true)

  // Carrossel GABI — idêntico ao Hub
  const gabiCarouselRef = useRef<HTMLDivElement>(null)
  const [gabiPaused, setGabiPaused] = useState(false)

  const scrollGabi = useCallback((dir: 'left' | 'right') => {
    if (!gabiCarouselRef.current) return
    gabiCarouselRef.current.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' })
  }, [])

  // allDerived deve vir antes de suggestions (evita TDZ)
  const allDerived: DerivedMetric[] = useMemo(
    () => [...BUILT_IN_DERIVED, ...userDerivedMetrics],
    [userDerivedMetrics],
  )

  // Labels dos campos para o WidgetEditModal (produto-específico)
  const fieldLabels = useMemo(
    () => Object.fromEntries(DASHBOARD_CATALOG.map(f => [f.key, f.label])),
    [],
  )

  // Posição de inserção de novos widgets — sempre após o último widget existente
  const gridBottom = useMemo(
    () => widgets.reduce((max, w) => Math.max(max, w.position.y + w.position.h), 0),
    [widgets],
  )

  // Sugestões computadas para o SuggestionsPanel
  const suggestions = useMemo(
    () => generateSuggestions(
      widgets.map(w => w.id),
      allDerived,
      gridBottom,
      widgets.flatMap(w => w.query_spec.fields.map((f: { key: string }) => f.key)),
    ),
    [widgets, allDerived, gridBottom],
  )

  const handleAddWidgetFromSuggestions = useCallback((widgetConfig: DashboardWidgetConfig) => {
    addWidget(widgetConfig)
    try { addNotification({ type: 'success', message: `Widget "${widgetConfig.title}" adicionado ao dashboard.`, duration: 4000 }) } catch { /* ignorar */ }

    // Aguarda React renderizar o novo widget
    setTimeout(() => {
      // [data-widget-id] é o wrapper do grid item; o WidgetContainer é seu filho direto
      const wrapper = document.querySelector(`[data-widget-id="${widgetConfig.id}"]`)
      const card    = wrapper?.firstElementChild as HTMLElement | null

      // Scroll até o widget
      wrapper?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Inicia o ring após o scroll chegar (~700ms)
      setTimeout(() => {
        if (!wrapper) return
        wrapper.classList.add('wc-highlighted')
        setTimeout(() => wrapper.classList.remove('wc-highlighted'), 4500)
      }, 700)
    }, 300)
  }, [addWidget, addNotification])

  useEffect(() => {
    if (gabiPaused || loadingData) return
    const timer = setInterval(() => scrollGabi('right'), 5000)
    return () => clearInterval(timer)
  }, [gabiPaused, loadingData, scrollGabi])

  useEffect(() => {
    setLoadingData(true)
    const prevRange = getPrevDateRange(slicers.period)
    Promise.all([
      dashboardApi.kpis(slicers.period),
      dashboardApi.kpis(slicers.period, prevRange),
      dashboardApi.trend('12m', 'month'),
      // Insights isolados: falha não cancela KPIs nem gráficos
      dashboardApi.insights(slicers.period).catch(() => ({ period: '', role: '', insights: [] as GabiInsightItem[] })),
    ])
      .then(([kpis, prevKpis, trend, insightsRes]) => {
        setKpisData(kpis)
        setPrevKpisData(prevKpis)
        setTrendData(trend.value)
        setInsightsData(insightsRes.insights)
      })
      .catch(err => console.error('[Dashboard] Erro ao carregar dados:', err))
      .finally(() => setLoadingData(false))
  }, [slicers.period])

  const activeWidgets = useMemo(() =>
    widgets.map(w => ({
      ...w,
      query_spec: {
        ...w.query_spec,
        filters: w.query_spec.filters.period === '12m'
          ? w.query_spec.filters
          : { ...w.query_spec.filters, period: slicers.period },
      },
    })), [widgets, slicers.period],
  )

  const renderWidget = useCallback((widget: DashboardWidgetConfig) => {
    const chartType = widget.chart_type

    // ── GABI_INSIGHTS — grid responsivo de insights da Gabi AI ─────────────
    if (chartType === 'GABI_INSIGHTS') {
      const insights = insightsData.length > 0
        ? insightsData
        : kpisData
          ? buildClientInsights(kpisData, prevKpisData)
          : [] // kpisData ainda não carregou — skeleton cobre esse estado

      return (
        <div
          key={widget.id}
          className="dp-gabi-card"
          onMouseEnter={() => setGabiPaused(true)}
          onMouseLeave={() => setGabiPaused(false)}
        >
          <div className="dp-gabi-watermark" aria-hidden="true">
            <Sparkle size={120} weight="fill" />
          </div>
          <div className="dp-gabi-main">
            <div className="dp-gabi-top-row">
              <div className="dp-gabi-header">
                <div className="dp-gabi-avatar">
                  <Sparkle weight="fill" size={13} color="#fff" />
                </div>
                <span className="dp-gabi-label">Gabi AI · Insights</span>
              </div>
              <div className="dp-gabi-header-right">
                <button
                  className="dp-gabi-nav-btn"
                  type="button"
                  onClick={() => scrollGabi('left')}
                  aria-label="Insight anterior"
                >
                  <CaretLeft size={12} weight="bold" />
                </button>
                <button
                  className="dp-gabi-nav-btn"
                  type="button"
                  onClick={() => scrollGabi('right')}
                  aria-label="Próximo insight"
                >
                  <CaretRight size={12} weight="bold" />
                </button>
                <span className="dp-gabi-live-badge">
                  <span className="dp-gabi-live-dot" />
                  ao vivo
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

    // ── SECTION_LABEL — divisor de seção sem WidgetContainer ────────────────
    if (chartType === 'SECTION_LABEL') {
      return (
        <div key={widget.id} style={sectionLabelStyle}>
          <span style={sectionLabelTextStyle}>{widget.title}</span>
          <div style={sectionLabelLineStyle} />
        </div>
      )
    }

    const result = kpisData
      ? buildWidgetResult(widget, kpisData, trendData, allDerived)
      : { data: {}, chartType: widget.chart_type, partial: true, cached: false, computed_at: new Date().toISOString() }
    const fields = widget.query_spec.fields

    // ── DISTRIBUTION ────────────────────────────────────────────────────────
    if (chartType === 'DISTRIBUTION') {
      return (
        <WidgetContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}

        >
          <DistributionWidget slices={result.slices ?? []} />
        </WidgetContainer>
      )
    }

    // ── LINE / AREA ──────────────────────────────────────────────────────────
    if (chartType === 'LINE' || chartType === 'AREA') {
      const catalogFields = fields.map(fqs => CATALOG_BY_KEY[fqs.key]).filter(Boolean)
      const { assignments, dualAxis, leftUnit, rightUnit } = resolveAxisAssignment(catalogFields)

      const series: LineSeriesConfig[] = fields.map((fqs, i) => {
        const cat = CATALOG_BY_KEY[fqs.key]
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
        <WidgetContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}

        >
          <LineChartWidget
            series={series}
            dualAxis={dualAxis}
            leftUnit={leftUnit ?? 'number'}
            rightUnit={rightUnit ?? undefined}
            showArea={chartType === 'AREA'}
          />
        </WidgetContainer>
      )
    }

    // ── BAR / BAR_HORIZONTAL ─────────────────────────────────────────────────
    if (chartType === 'BAR' || chartType === 'BAR_HORIZONTAL') {
      const catalogFields = fields.map(fqs => CATALOG_BY_KEY[fqs.key]).filter(Boolean)
      const { assignments, dualAxis, leftUnit, rightUnit } = resolveAxisAssignment(catalogFields)

      const series: BarSeriesConfig[] = fields.map((fqs, i) => {
        const cat = CATALOG_BY_KEY[fqs.key]
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
        <WidgetContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}

        >
          <BarChartWidget
            series={series}
            dualAxis={dualAxis}
            leftUnit={leftUnit ?? 'number'}
            rightUnit={rightUnit ?? undefined}
            horizontal={chartType === 'BAR_HORIZONTAL'}
          />
        </WidgetContainer>
      )
    }

    // ── KPI_CARD ─────────────────────────────────────────────────────────────
    if (chartType === 'KPI_CARD') {
      const fieldKey = fields[0]?.key ?? 'value'
      const cat = CATALOG_BY_KEY[fieldKey]
      const dm = widget.config?.derivedMetricId
        ? allDerived.find(m => m.id === widget.config!.derivedMetricId)
        : undefined
      const fieldType: FieldUnitType = dm?.fieldType ?? (cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number')
      const visual   = WIDGET_VISUAL[widget.id] ?? {}
      const navRoute = WIDGET_NAV_ROUTE[widget.id]
      const currentVal = Number(kpisData?.[fieldKey] ?? 0)
      const prevVal    = Number(prevKpisData?.[fieldKey] ?? 0)
      const deltaInfo  = computeDelta(currentVal, prevVal)
      return (
        <WidgetContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
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
        >
          <KpiValue
            data={result.data}
            fieldKey={fieldKey}
            fieldType={fieldType}
            delta={deltaInfo.delta}
            deltaPercent={deltaInfo.percent}
            deltaDirection={deltaInfo.direction}
          />
        </WidgetContainer>
      )
    }

    // ── Fallback ─────────────────────────────────────────────────────────────
    const fieldKey = fields[0]?.key ?? 'value'
    return (
      <WidgetContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
        editMode={editMode}
        onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
        onRemove={removeWidget}

      >
        <KpiValue data={result.data} fieldKey={fieldKey} fieldType="number" />
      </WidgetContainer>
    )
  }, [editMode, removeWidget, allDerived, kpisData, prevKpisData, trendData, loadingData])

  function handleQueryBuilderSave(spec: WidgetQuerySpec, title: string, chartType: ChartType) {
    addWidget({
      id: `custom_${Date.now()}`,
      title,
      chart_type: chartType,
      query_spec: spec,
      position: { x: 0, y: 99, w: chartType === 'KPI_CARD' ? 3 : 6, h: chartType === 'KPI_CARD' ? 1 : 3 },
    })
    setQueryBuilderOpen(false)
  }

  const STATUS_OPTIONS = ['abertos', 'em_andamento', 'atrasados', 'concluidos']

  const STATUS_LABELS: Record<string, string> = {
    abertos:       'Abertos',
    em_andamento:  'Em Andamento',
    atrasados:     'Atrasados',
    concluidos:    'Concluídos',
  }

  const STATUS_ACTIVE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    atrasados: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#ef4444' },
    abertos:   { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', text: '#f59e0b' },
  }

  return (
    <div style={{ padding: '1.5rem' }}>

      {/* ── Onboarding banner — fixo, nunca some ───────────────────────── */}
      <div style={onboardingBannerStyle}>
        <div style={onboardingBannerContent}>
          <span style={onboardingBannerTitle}>Este dashboard é seu.</span>
          <span style={onboardingBannerText}>
            Adicione métricas, mova seções e crie seus próprios widgets.
          </span>
          <div style={onboardingBannerActions}>
            <button
              type="button"
              style={onboardingBtnAccent}
              onClick={() => setSuggestionsOpen(true)}
            >
              <RocketLaunch size={13} weight="fill" />
              Explorar sugestões
            </button>
            <button
              type="button"
              style={onboardingBtnGhost}
              onClick={() => { setEditMode(true); setQueryBuilderOpen(true) }}
            >
              Criar widget →
            </button>
          </div>
        </div>
      </div>

      <DashboardToolbar
        slicers={slicers}
        onPeriodChange={setPeriod}
        onStatusChange={setStatusFilter}
        activeFilters={activeFilters}
        onClearFilters={clearFilters}
        editMode={editMode}
        onEditModeChange={setEditMode}
        statusOptions={STATUS_OPTIONS}
        statusLabels={STATUS_LABELS}
        statusActiveColors={STATUS_ACTIVE_COLORS}
        onAddWidget={() => setQueryBuilderOpen(true)}
        onSuggestionsOpen={() => setSuggestionsOpen(true)}
      />

      <DashboardGrid
        widgets={activeWidgets}
        renderWidget={renderWidget}
        editMode={editMode}
        onLayoutChange={(layouts) => {
          if (!editMode) return
          const lg = (layouts as any).lg ?? []
          updateLayout(lg.map((item: any) => ({
            id: item.i,
            position: { x: item.x, y: item.y, w: item.w, h: item.h },
          })))
        }}
      />

      <QueryBuilder
        aberto={queryBuilderOpen}
        availableFields={DASHBOARD_CATALOG}
        onSave={handleQueryBuilderSave}
        onCancel={() => setQueryBuilderOpen(false)}
      />

      <WidgetEditModal
        widget={editingWidget}
        aberto={editModalOpen}
        onFechar={() => { setEditModalOpen(false); setEditingWidget(null) }}
        onSalvar={(patch) => { if (editingWidget) updateWidget(editingWidget.id, patch) }}
        fieldLabels={fieldLabels}
      />

      {suggestionsOpen && (
        <SuggestionsPanel
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
