/**
 * DashboardSimuladorBidFrete — paridade visual com dashboard.tsx do produto
 * real BID Frete Internacional: DashboardGrid com painéis configuráveis,
 * drag-and-drop, GABI AI Insights e construtor de consultas.
 */

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  DashboardGrid,
  DashboardPainelContainer,
  DashboardWidgetLinha,
  DashboardWidgetBarras,
  DashboardWidgetDistribuicao,
  DashboardWidgetDonut,
  DashboardPainelEditarModal,
  DashboardPainelSugestoes,
  DashboardValorKPI,
  DashboardConstrutorConsulta,
  resolveAxisAssignment,
  SERIES_COLORS,
} from '../../../Dashboard/dashboard-global/src/index'
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
  GlobalSlicers,
  ActiveFilter,
} from '../../../Dashboard/dashboard-global/src/index'
import {
  ClipboardText,
  Scales,
  CurrencyDollar,
  Warning,
  CheckCircle,
  Tag,
  CaretLeft,
  CaretRight,
  RocketLaunch,
  Timer,
  TrendUp,
} from '@phosphor-icons/react'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import { FaixaPaineisDashboardSimuladorPedido } from '../pedido/faixa-paineis-dashboard-simulador-pedido'
import { BarraFerramentasDashboardSimuladorPedido } from '../pedido/barra-ferramentas-dashboard-simulador-pedido'
import {
  widgetEstaVisivel,
  ordenarWidgetsLista,
  reordenarWidgetsLista,
  reflowPosicoesWidgets,
  ordenarWidgetsPorPadrao,
  WIDGET_CONFIG_IS_VISIVEL,
  WIDGET_CONFIG_ORDEM_PAINEL,
} from '../pedido/util-widgets-dashboard-simulador-pedido'
import { WIDGETS_PADRAO_DASHBOARD_SIMULADOR_BID_FRETE } from './widgets-padrao-dashboard-simulador-bid-frete'
import {
  CATALOGO_DASHBOARD_SIMULADOR_BID_FRETE,
  CATALOGO_POR_CHAVE_SIMULADOR_BID_FRETE,
} from './catalogo-dashboard-simulador-bid-frete'
import {
  buildDashboardKpisBidFreteSimulador,
  buildTrendBucketsBidFreteSimulador,
  buildInsightsGabiBidFreteSimulador,
  buildStatusCountsBidFreteSimulador,
  buildPeriodOptionsBidFreteSimulador,
  gerarSugestoesDashboardBidFreteSimulador,
  computeDerivedBidFrete,
  BUILT_IN_DERIVED_BID_FRETE,
  STATUS_OPTIONS_BID_FRETE,
  STATUS_LABELS_BID_FRETE,
  STATUS_ACTIVE_COLORS_BID_FRETE,
  STATUS_SLICE_LABELS_BID_FRETE,
  type DashboardKpisBidFreteSimulador,
  type DashboardTrendBucketBidFreteSimulador,
  type GabiInsightItemBidFreteSimulador,
} from './dados-dashboard-simulador-bid-frete'
import './dashboard-simulador-bid-frete.css'

export interface DashboardSimuladorBidFreteProps {
  empresasSelecionadas: PerfilEmpresaSimulador[]
}

// ─── Conversão de KPIs/trend em WidgetResult (paridade dashboard.tsx real) ───

function buildWidgetResult(
  widget: DashboardWidgetConfig,
  kpis: DashboardKpisBidFreteSimulador,
  trend: DashboardTrendBucketBidFreteSimulador[],
  allDerived: DerivedMetric[],
  catalogByKey: Record<string, EnrichedCatalogField>,
): WidgetResult {
  const now = new Date().toISOString()
  const fields = widget.query_spec.fields
  const chartType = widget.chart_type

  if (chartType === 'DISTRIBUTION' || chartType === 'DONUT') {
    const primeiro = fields[0]
    if (primeiro && primeiro.key === 'cotacoes_status') {
      const slices: WidgetDistributionSlice[] = Object.entries(kpis.cotacoes_status)
        .map(([statusKey, val]) => ({
          key: statusKey,
          label: STATUS_SLICE_LABELS_BID_FRETE[statusKey] ?? statusKey,
          value: Number(val),
          unit: 'number' as FieldUnitType,
        }))
        .filter(s => s.value > 0)
      return { data: {}, slices, chartType, partial: false, cached: false, computed_at: now }
    }

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

    return { data: {}, slices, chartType, partial: false, cached: false, computed_at: now }
  }

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

  if (widget.config?.derivedMetricId) {
    const dm = allDerived.find(m => m.id === widget.config!.derivedMetricId)
    if (dm) {
      const value = computeDerivedBidFrete(dm, kpis as unknown as Record<string, number>)
      const fieldKey = fields[0]?.key ?? 'value'
      return { data: { [fieldKey]: value ?? 0 }, chartType: 'KPI_CARD', partial: false, cached: false, computed_at: now }
    }
  }

  const fieldKey = fields[0]?.key ?? 'value'
  const value = Number(kpis[fieldKey] ?? 0)
  return { data: { [fieldKey]: value }, chartType, partial: false, cached: false, computed_at: now }
}

function computeDelta(current: number, prev: number) {
  const delta = current - prev
  const percent = prev === 0 ? (current > 0 ? 100 : 0) : (delta / prev) * 100
  const direction = delta > 0 ? 'up' as const : delta < 0 ? 'down' as const : 'neutral' as const
  return { delta, percent, direction }
}

function isResultEmpty(result: WidgetResult, isDerived: boolean): boolean {
  if (isDerived) return false
  const ct = result.chartType

  if (ct === 'DISTRIBUTION' || ct === 'DONUT') {
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

// ─── Visual por widget (paridade WIDGET_VISUAL do dashboard.tsx real) ─────────

const AMBER = '#f59e0b'
const GREEN = '#10b981'
const BLUE = '#3b82f6'
const VIOLET = '#8b5cf6'

const WIDGET_VISUAL: Record<string, { accentColor?: string; icone?: ReactNode }> = {
  kpi_saving_total: { accentColor: GREEN, icone: <CurrencyDollar size={15} weight="duotone" /> },
  kpi_valor_medio: { accentColor: VIOLET, icone: <Tag size={15} weight="duotone" /> },
  kpi_transit_time: { accentColor: AMBER, icone: <Timer size={15} weight="duotone" /> },
  kpi_ganho_percentual: { accentColor: BLUE, icone: <TrendUp size={15} weight="duotone" /> },
  kpi_cotacoes_andamento: { accentColor: BLUE, icone: <ClipboardText size={15} weight="duotone" /> },
  kpi_cotacoes_passadas: { accentColor: GREEN, icone: <CheckCircle size={15} weight="duotone" /> },
  kpi_valor_aprovado: { accentColor: VIOLET, icone: <Scales size={15} weight="duotone" /> },
  gabi_insights: { accentColor: VIOLET, icone: <RocketLaunch size={15} weight="duotone" /> },
}

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

function cloneWidgetsPadrao(): DashboardWidgetConfig[] {
  return JSON.parse(JSON.stringify(WIDGETS_PADRAO_DASHBOARD_SIMULADOR_BID_FRETE)) as DashboardWidgetConfig[]
}

export function DashboardSimuladorBidFrete({ empresasSelecionadas }: DashboardSimuladorBidFreteProps) {
  const { t } = useTranslation()

  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(cloneWidgetsPadrao)
  const [widgetsByPainel, setWidgetsByPainel] = useState<Record<string, DashboardWidgetConfig[]>>({
    padrao: cloneWidgetsPadrao(),
    comercial: cloneWidgetsPadrao(),
    financeiro: cloneWidgetsPadrao(),
  })
  const [painelAtualId, setPainelAtualId] = useState('padrao')
  const [slicers, setSlicers] = useState<GlobalSlicers>({ period: '30d', status: [], dateRange: null })
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [widgetLayoutInteracao, setWidgetLayoutInteracao] = useState<{ widgetId: string; modo: 'moving' | 'resizing' } | null>(null)
  const [queryBuilderOpen, setQueryBuilderOpen] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [editingWidget, setEditingWidget] = useState<DashboardWidgetConfig | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const gabiCarouselRef = useRef<HTMLDivElement>(null)
  const [gabiPaused, setGabiPaused] = useState(false)

  const periodOptions = useMemo(() => buildPeriodOptionsBidFreteSimulador(t), [t])
  const catalogByKey = CATALOGO_POR_CHAVE_SIMULADOR_BID_FRETE
  const fieldLabels = useMemo(
    () => Object.fromEntries(CATALOGO_DASHBOARD_SIMULADOR_BID_FRETE.map(f => [f.key, f.label])),
    [],
  )

  const kpisData = useMemo(
    () => buildDashboardKpisBidFreteSimulador(empresasSelecionadas, slicers.period, slicers.status),
    [empresasSelecionadas, slicers.period, slicers.status],
  )

  const prevKpisData = useMemo(
    () => buildDashboardKpisBidFreteSimulador(empresasSelecionadas, '90d', slicers.status),
    [empresasSelecionadas, slicers.status],
  )

  const trendData = useMemo(
    () => buildTrendBucketsBidFreteSimulador(empresasSelecionadas),
    [empresasSelecionadas],
  )

  const insightsData = useMemo(
    () => buildInsightsGabiBidFreteSimulador(kpisData, prevKpisData),
    [kpisData, prevKpisData],
  )

  const statusCounts = useMemo(() => buildStatusCountsBidFreteSimulador(kpisData), [kpisData])

  const gridBottom = useMemo(
    () => widgets.reduce((max, w) => Math.max(max, w.position.y + w.position.h), 0),
    [widgets],
  )

  const suggestions = useMemo(
    () => gerarSugestoesDashboardBidFreteSimulador(widgets, BUILT_IN_DERIVED_BID_FRETE, gridBottom),
    [widgets, gridBottom],
  )

  const salvarWidgetsPainel = useCallback((painelId: string, lista: DashboardWidgetConfig[]) => {
    setWidgetsByPainel(prev => ({ ...prev, [painelId]: lista }))
  }, [])

  const handleTrocarPainel = useCallback((novoId: string) => {
    if (novoId === painelAtualId) return
    salvarWidgetsPainel(painelAtualId, widgets)
    const saved = widgetsByPainel[novoId]
    setWidgets(saved ?? cloneWidgetsPadrao())
    setPainelAtualId(novoId)
  }, [painelAtualId, widgets, widgetsByPainel, salvarWidgetsPainel])

  const addWidget = useCallback((widget: DashboardWidgetConfig) => {
    setWidgets(prev => [...prev, widget])
  }, [])

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId))
  }, [])

  const updateWidget = useCallback((widgetId: string, patch: Partial<DashboardWidgetConfig>) => {
    setWidgets(prev => prev.map(w => (w.id === widgetId ? { ...w, ...patch } : w)))
  }, [])

  const updateLayout = useCallback((updates: Array<{ id: string; position: DashboardWidgetConfig['position'] }>) => {
    setWidgets(prev => prev.map(w => {
      const upd = updates.find(u => u.id === w.id)
      if (!upd) return w
      const ordem = prev.findIndex(x => x.id === w.id)
      return {
        ...w,
        position: upd.position,
        config: { ...w.config, [WIDGET_CONFIG_ORDEM_PAINEL]: ordem },
      }
    }))
  }, [])

  const toggleWidgetVisibilidade = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== widgetId) return w
      const visivel = w.config?.[WIDGET_CONFIG_IS_VISIVEL] !== false
      return { ...w, config: { ...w.config, [WIDGET_CONFIG_IS_VISIVEL]: !visivel } }
    }))
  }, [])

  const reordenarWidgets = useCallback((fromId: string, toId: string) => {
    setWidgets(prev => reordenarWidgetsLista(prev, fromId, toId))
  }, [])

  const selecionarTodosWidgetsVisiveis = useCallback(() => {
    setWidgets(prev => prev.map(w => ({
      ...w,
      config: { ...w.config, [WIDGET_CONFIG_IS_VISIVEL]: true },
    })))
  }, [])

  const restaurarVisibilidadePadraoWidgets = useCallback(() => {
    setWidgets(prev => {
      const idsPadrao = WIDGETS_PADRAO_DASHBOARD_SIMULADOR_BID_FRETE.map(w => w.id)
      const sorted = ordenarWidgetsPorPadrao(prev, idsPadrao)
      const comVisibilidade = sorted.map((w, i) => ({
        ...w,
        config: { ...w.config, [WIDGET_CONFIG_IS_VISIVEL]: true, [WIDGET_CONFIG_ORDEM_PAINEL]: i },
      }))
      return reflowPosicoesWidgets(comVisibilidade)
    })
  }, [])

  const triggerWidgetAddedFX = useCallback((widgetId: string, title: string) => {
    setToastMsg(`Widget "${title}" adicionado`)
    setTimeout(() => setToastMsg(null), 4000)
    setTimeout(() => {
      const wrapper = document.querySelector(`[data-widget-id="${widgetId}"]`)
      wrapper?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        wrapper?.classList.add('wc-highlighted')
        setTimeout(() => wrapper?.classList.remove('wc-highlighted'), 4500)
      }, 700)
    }, 300)
  }, [])

  const scrollGabi = useCallback((dir: 'left' | 'right') => {
    const el = gabiCarouselRef.current
    if (!el) return
    if (dir === 'right') {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 340, behavior: 'smooth' })
      }
    } else {
      el.scrollBy({ left: -340, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    if (gabiPaused) return
    const timer = setInterval(() => scrollGabi('right'), 5000)
    return () => clearInterval(timer)
  }, [gabiPaused, scrollGabi])

  const activeWidgets = useMemo(() =>
    ordenarWidgetsLista(widgets)
      .filter(widgetEstaVisivel)
      .map(w => ({
        ...w,
        query_spec: {
          ...w.query_spec,
          filters: w.query_spec.filters.period === '12m'
            ? w.query_spec.filters
            : { ...w.query_spec.filters, period: slicers.period },
        },
      })),
  [widgets, slicers.period])

  const buildPainelWidgetProps = useCallback((widget: DashboardWidgetConfig) => {
    const layoutModo = widgetLayoutInteracao?.widgetId === widget.id
      ? widgetLayoutInteracao.modo
      : null

    return {
      habilitarMenuOpcoes: true,
      layoutModo,
      onEdit: (w: DashboardWidgetConfig) => {
        const stored = widgets.find(x => x.id === w.id) ?? w
        setEditingWidget(stored)
        setEditModalOpen(true)
      },
      onRemove: removeWidget,
      onMover: () => setWidgetLayoutInteracao({ widgetId: widget.id, modo: 'moving' }),
      onRedimensionar: () => setWidgetLayoutInteracao({ widgetId: widget.id, modo: 'resizing' }),
      onConcluirLayout: () => setWidgetLayoutInteracao(null),
    }
  }, [widgets, widgetLayoutInteracao, removeWidget])

  const renderWidget = useCallback((widget: DashboardWidgetConfig) => {
    const chartType = widget.chart_type
    const painelProps = buildPainelWidgetProps(widget)

    // ── GABI_INSIGHTS ────────────────────────────────────────────────────────
    if (chartType === 'GABI_INSIGHTS') {
      const gabiVisual = WIDGET_VISUAL.gabi_insights ?? {}
      const gabiResult: WidgetResult = {
        data: {},
        chartType: 'GABI_INSIGHTS',
        partial: false,
        cached: false,
        computed_at: new Date().toISOString(),
      }
      const controlesCarrossel = (
        <div className="dp-gabi-header-right db-no-drag">
          <button className="dp-gabi-nav-btn" type="button" onClick={() => scrollGabi('left')} aria-label="Insight anterior">
            <CaretLeft size={12} weight="bold" />
          </button>
          <button className="dp-gabi-nav-btn" type="button" onClick={() => scrollGabi('right')} aria-label="Próximo insight">
            <CaretRight size={12} weight="bold" />
          </button>
          <span className="dp-gabi-live-badge">
            <span className="dp-gabi-live-dot" />
            {t('bidfrete.dashboard.gabi_ao_vivo', { defaultValue: 'ao vivo' })}
          </span>
        </div>
      )

      return (
        <div key={widget.id} className="dp-gabi-painel-host">
          <DashboardPainelContainer
            widget={widget}
            result={gabiResult}
            loading={false}
            error={null}
            accentColor={gabiVisual.accentColor}
            icone={gabiVisual.icone}
            periodoControle={controlesCarrossel}
            {...painelProps}
          >
            <div
              className="dp-gabi-card dp-gabi-card--embedded"
              onMouseEnter={() => setGabiPaused(true)}
              onMouseLeave={() => setGabiPaused(false)}
            >
              <div className="dp-gabi-watermark" aria-hidden="true">
                <RocketLaunch size={120} weight="fill" />
              </div>
              <div className="dp-gabi-main">
                <div className="dp-gabi-track" ref={gabiCarouselRef}>
                  {insightsData.map((ins: GabiInsightItemBidFreteSimulador) => (
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
                            <button className="dp-gabi-insight-link" type="button">
                              {ins.textoLink} <CaretRight size={10} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DashboardPainelContainer>
        </div>
      )
    }

    // ── SECTION_LABEL ────────────────────────────────────────────────────────
    if (chartType === 'SECTION_LABEL') {
      return (
        <div key={widget.id} style={sectionLabelStyle}>
          <span style={sectionLabelTextStyle}>{widget.title}</span>
          <div style={sectionLabelLineStyle} />
        </div>
      )
    }

    const result = buildWidgetResult(widget, kpisData, trendData, BUILT_IN_DERIVED_BID_FRETE, catalogByKey)
    const fields = widget.query_spec.fields
    const isDerived = !!widget.config?.derivedMetricId

    if (isResultEmpty(result, isDerived)) {
      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={false} error={null} {...painelProps}>
          <div className="dp-gabi-empty-pulse" style={{ padding: '1rem', color: 'var(--gtv-muted)' }}>
            {t('bidfrete.dashboard.empty_padrao', { defaultValue: 'Sem dados para o período selecionado.' })}
          </div>
        </DashboardPainelContainer>
      )
    }

    if (chartType === 'DISTRIBUTION') {
      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={false} error={null} {...painelProps}>
          <DashboardWidgetDistribuicao slices={result.slices ?? []} />
        </DashboardPainelContainer>
      )
    }

    if (chartType === 'DONUT') {
      const fieldKey = fields[0]?.key ?? 'value'
      const donutData: Record<string, number> = {}
      for (const slice of result.slices ?? []) {
        donutData[slice.key] = slice.value
      }
      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={false} error={null} {...painelProps}>
          <DashboardWidgetDonut title={widget.title} data={donutData} fieldKey={fieldKey} />
        </DashboardPainelContainer>
      )
    }

    if (chartType === 'LINE' || chartType === 'AREA') {
      const catalogFields = fields.map(fqs => catalogByKey[fqs.key]).filter(Boolean)
      const { assignments, dualAxis, leftUnit, rightUnit } = resolveAxisAssignment(catalogFields)
      const series: LineSeriesConfig[] = fields.map((fqs, i) => {
        const cat = catalogByKey[fqs.key]
        const unit: FieldUnitType = cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number'
        return {
          fieldKey: fqs.key,
          label: cat?.label ?? fqs.key,
          color: SERIES_COLORS[i % SERIES_COLORS.length] as string,
          data: (result.series ?? []).map(pt => ({ month: pt.month as string, value: (pt[fqs.key] as number) ?? 0 })),
          yAxisId: assignments[fqs.key] ?? 'left',
          unit,
        }
      })
      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={false} error={null} {...painelProps}>
          <DashboardWidgetLinha series={series} dualAxis={dualAxis} leftUnit={leftUnit ?? 'number'} rightUnit={rightUnit ?? undefined} showArea={chartType === 'AREA'} />
        </DashboardPainelContainer>
      )
    }

    if (chartType === 'BAR' || chartType === 'BAR_HORIZONTAL') {
      const catalogFields = fields.map(fqs => catalogByKey[fqs.key]).filter(Boolean)
      const { assignments, dualAxis, leftUnit, rightUnit } = resolveAxisAssignment(catalogFields)
      const series: BarSeriesConfig[] = fields.map((fqs, i) => {
        const cat = catalogByKey[fqs.key]
        const unit: FieldUnitType = cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number'
        return {
          fieldKey: fqs.key,
          label: cat?.label ?? fqs.key,
          color: SERIES_COLORS[i % SERIES_COLORS.length] as string,
          data: (result.series ?? []).map(pt => ({ month: pt.month as string, value: (pt[fqs.key] as number) ?? 0 })),
          yAxisId: assignments[fqs.key] ?? 'left',
          unit,
        }
      })
      return (
        <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={false} error={null} {...painelProps}>
          <DashboardWidgetBarras series={series} dualAxis={dualAxis} leftUnit={leftUnit ?? 'number'} rightUnit={rightUnit ?? undefined} horizontal={chartType === 'BAR_HORIZONTAL'} />
        </DashboardPainelContainer>
      )
    }

    if (chartType === 'KPI_CARD') {
      const fieldKey = fields[0]?.key ?? 'value'
      const cat = catalogByKey[fieldKey]
      const dm = widget.config?.derivedMetricId
        ? BUILT_IN_DERIVED_BID_FRETE.find(m => m.id === widget.config!.derivedMetricId)
        : undefined
      const fieldType: FieldUnitType = dm?.fieldType ?? (cat?.type === 'currency' ? 'currency' : cat?.type === 'percentage' ? 'percentage' : 'number')
      const visual = WIDGET_VISUAL[widget.id] ?? {}
      const currentVal = Number(kpisData[fieldKey] ?? 0)
      const prevVal = Number(prevKpisData[fieldKey] ?? 0)
      const deltaInfo = computeDelta(currentVal, prevVal)

      return (
        <DashboardPainelContainer
          key={widget.id}
          widget={widget}
          result={result}
          loading={false}
          error={null}
          accentColor={visual.accentColor}
          icone={visual.icone}
          {...painelProps}
        >
          <DashboardValorKPI
            data={result.data}
            fieldKey={fieldKey}
            fieldType={fieldType}
            delta={deltaInfo.delta}
            deltaPercent={deltaInfo.percent}
            deltaDirection={deltaInfo.direction}
          />
        </DashboardPainelContainer>
      )
    }

    const fieldKey = fields[0]?.key ?? 'value'
    return (
      <DashboardPainelContainer key={widget.id} widget={widget} result={result} loading={false} error={null} {...painelProps}>
        <DashboardValorKPI data={result.data} fieldKey={fieldKey} fieldType="number" />
      </DashboardPainelContainer>
    )
  }, [
    buildPainelWidgetProps,
    kpisData,
    prevKpisData,
    trendData,
    insightsData,
    catalogByKey,
    scrollGabi,
    t,
  ])

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

  const handleAddWidgetFromSuggestions = useCallback((widgetConfig: DashboardWidgetConfig) => {
    addWidget(widgetConfig)
    triggerWidgetAddedFX(widgetConfig.id, widgetConfig.title)
  }, [addWidget, triggerWidgetAddedFX])

  const handleClearFilters = useCallback(() => {
    setActiveFilters([])
    setSlicers(s => ({ ...s, period: '30d', status: [] }))
  }, [])

  const getWidgetLabel = useCallback(
    (widget: DashboardWidgetConfig) => widget.title,
    [],
  )

  const temWidgets = widgets.length > 0
  const onboardingBarra = !temWidgets ? {
    onExplorarSugestoes: () => setSuggestionsOpen(true),
    onCriarDoZero: () => setQueryBuilderOpen(true),
  } : undefined

  return (
    <div className="pds-dashboard-simulador bfs-dashboard-simulador">
      <div className="pedido-page-shell pedido-dashboard" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '1rem' }}>
        <div className="lp-tabela-wrapper lp-tabela-wrapper--faixa-unificada pedido-dashboard-toolbar-wrapper">
          <div className="lp-tabela-chrome pedido-dashboard-chrome">
            <FaixaPaineisDashboardSimuladorPedido
              painelAtualId={painelAtualId}
              onTrocarPainel={handleTrocarPainel}
            />
            <BarraFerramentasDashboardSimuladorPedido
              onboarding={onboardingBarra}
              temWidgets={temWidgets}
              slicers={slicers}
              onPeriodChange={period => setSlicers(s => ({ ...s, period }))}
              periodOptions={periodOptions}
              onStatusChange={status => setSlicers(s => ({ ...s, status }))}
              activeFilters={activeFilters}
              onClearFilters={handleClearFilters}
              statusOptions={[...STATUS_OPTIONS_BID_FRETE]}
              statusLabels={STATUS_LABELS_BID_FRETE}
              statusActiveColors={STATUS_ACTIVE_COLORS_BID_FRETE}
              statusCounts={statusCounts}
              onAbrirSugestoes={() => setSuggestionsOpen(true)}
              onCriarWidgetZero={() => setQueryBuilderOpen(true)}
              widgetsSeletor={temWidgets ? {
                widgets,
                getWidgetLabel,
                onToggleVisibilidade: toggleWidgetVisibilidade,
                onReordenar: reordenarWidgets,
                onSelecionarTodos: selecionarTodosWidgetsVisiveis,
                onRestaurarPadrao: restaurarVisibilidadePadraoWidgets,
              } : undefined}
            />
          </div>
        </div>

        <DashboardGrid
          widgets={activeWidgets}
          renderWidget={renderWidget}
          layoutInteracao={widgetLayoutInteracao}
          onLayoutChange={(layouts) => {
            if (!widgetLayoutInteracao) return
            const lg = layouts.lg ?? []
            updateLayout(lg.map(item => ({
              id: item.i,
              position: { x: item.x, y: item.y, w: item.w, h: item.h },
            })))
          }}
        />

        <DashboardConstrutorConsulta
          aberto={queryBuilderOpen}
          availableFields={CATALOGO_DASHBOARD_SIMULADOR_BID_FRETE}
          periodOptions={periodOptions}
          periodoInicial={slicers.period}
          onSave={handleQueryBuilderSave}
          onCancel={() => setQueryBuilderOpen(false)}
        />

        <DashboardPainelEditarModal
          widget={editingWidget}
          aberto={editModalOpen}
          onFechar={() => { setEditModalOpen(false); setEditingWidget(null) }}
          onSalvar={patch => { if (editingWidget) updateWidget(editingWidget.id, patch) }}
          fieldLabels={fieldLabels}
          periodOptions={periodOptions}
        />

        {suggestionsOpen && (
          <DashboardPainelSugestoes
            suggestions={suggestions}
            derivedMetrics={BUILT_IN_DERIVED_BID_FRETE}
            onAdd={handleAddWidgetFromSuggestions}
            onClose={() => setSuggestionsOpen(false)}
            onCreateCustom={() => setQueryBuilderOpen(true)}
          />
        )}

        {toastMsg && (
          <div className="pds-dashboard-toast" role="status">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  )
}
