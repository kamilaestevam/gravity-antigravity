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

import React, { useMemo, useState, useCallback } from 'react'
import {
  DashboardGrid,
  WidgetContainer,
  LineChartWidget,
  BarChartWidget,
  DistributionWidget,
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
} from '@nucleo/dashboard'
import { resolveAxisAssignment, SERIES_COLORS, formatValueByUnit } from '@nucleo/dashboard'
import { PencilSimple, Check, Plus, Lightbulb, X,
  ChartLine, ChartBar, ChartBarHorizontal, ChartDonut, NumberSquareOne, Funnel, ChartPieSlice,
} from '@phosphor-icons/react'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'

import { useDashboardStore, DEFAULT_WIDGETS } from '../stores/dashboardStore'
import { DASHBOARD_CATALOG, CATALOG_BY_KEY } from '../shared/dashboardCatalog'
import { generateSuggestions } from '../shared/dashboardSuggestions'
import { BUILT_IN_DERIVED, getAllDerivedMetrics, computeDerived } from '../shared/derivedMetrics'
import type { DerivedMetric } from '../shared/derivedMetrics'

// ── Mock de dados ─────────────────────────────────────────────────────────────

const MONTHS = [
  '2025-05','2025-06','2025-07','2025-08','2025-09','2025-10',
  '2025-11','2025-12','2026-01','2026-02','2026-03','2026-04',
]

const BASE_DATA: Record<string, number> = {
  total_pedidos: 1247, pedidos_abertos: 312, pedidos_em_andamento: 483,
  pedidos_atrasados: 87, valor_total: 4820350.75, cobertura_pendente: 718420.50,
  valor_itens_total: 3945120.00, qtd_total: 28430, itens_prontos: 19820,
  qtd_atual_total: 24105, qtd_transferida_total: 16340, qtd_inicial_total: 30200,
}

function trendFor(fieldKey: string): Array<{ month: string; value: number }> {
  const base = BASE_DATA[fieldKey] ?? 100
  const variance = base * 0.3
  return MONTHS.map(month => ({
    month,
    value: Math.max(0, Math.round(base * 0.7 + Math.random() * variance)),
  }))
}

/**
 * Produz um WidgetResult para qualquer DashboardWidgetConfig.
 * Suporta: KPI_CARD, LINE, AREA, BAR, BAR_HORIZONTAL, DISTRIBUTION, DONUT, e derivadas.
 */
function mockResult(widget: DashboardWidgetConfig): WidgetResult {
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
        value: BASE_DATA[fqs.key] ?? 0,
        unit,
      }
    }).filter(s => s.value > 0)

    return { data: {}, slices, chartType: 'DISTRIBUTION', partial: false, cached: true, computed_at: now }
  }

  // ── LINE / AREA / BAR / BAR_HORIZONTAL — multi-série ─────────────────────
  if (['LINE', 'AREA', 'BAR', 'BAR_HORIZONTAL'].includes(chartType)) {
    const seriesData = fields.map(fqs => ({
      fieldKey: fqs.key,
      data: trendFor(fqs.key),
    }))

    // Normaliza em WidgetSeriesPoint[]
    const series: WidgetSeriesPoint[] = MONTHS.map(month => {
      const point: WidgetSeriesPoint = { month }
      for (const s of seriesData) {
        const found = s.data.find(p => p.month === month)
        point[s.fieldKey] = found?.value ?? 0
      }
      return point
    })

    // Determina tipos de unidade para dualAxis
    const unitTypes = [...new Set(
      fields.map(fqs => {
        const cat = CATALOG_BY_KEY[fqs.key]
        return (cat?.type === 'currency' ? 'currency' : 'number') as FieldUnitType
      }),
    )]
    const dualAxis = unitTypes.length > 1

    return { data: {}, series, chartType, partial: false, cached: true, computed_at: now, unitTypes, dualAxis }
  }

  // ── KPI_CARD com métrica derivada ─────────────────────────────────────────
  if (widget.config?.derivedMetricId) {
    const allDerived = [...BUILT_IN_DERIVED]
    const dm = allDerived.find(m => m.id === widget.config!.derivedMetricId)
    if (dm) {
      const value = computeDerived(dm, BASE_DATA)
      const fieldKey = fields[0]?.key ?? 'value'
      return { data: { [fieldKey]: value ?? 0 }, chartType: 'KPI_CARD', partial: false, cached: false, computed_at: now }
    }
  }

  // ── KPI_CARD / DONUT / GAUGE / outros — mono-campo ────────────────────────
  const fieldKey = fields[0]?.key ?? 'value'
  const value = BASE_DATA[fieldKey] ?? 0
  return { data: { [fieldKey]: value }, chartType, partial: false, cached: true, computed_at: now }
}

// ── KPI ───────────────────────────────────────────────────────────────────────

function KpiValue({ data, fieldKey, fieldType = 'number' }: {
  data: Record<string, unknown>
  fieldKey: string
  fieldType?: FieldUnitType
}) {
  const raw = data[fieldKey]
  const value = typeof raw === 'number' ? raw
    : typeof Object.values(data)[0] === 'number' ? Object.values(data)[0] as number : null

  if (value === null) return <span style={kpiStyles.empty}>--</span>
  return (
    <div style={kpiStyles.wrap}>
      <span style={kpiStyles.value}>{formatValueByUnit(value, fieldType)}</span>
    </div>
  )
}

const kpiStyles = {
  wrap:  { display: 'flex', alignItems: 'center', height: '100%', padding: '0.25rem 0', minWidth: 0, overflow: 'hidden' },
  value: { fontSize: 'clamp(1rem, 4cqw, 1.75rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, minWidth: 0, maxWidth: '100%', display: 'block' },
  empty: { fontSize: '1.5rem', color: 'var(--text-muted)' },
} as const

// ── Widget Edit Modal ─────────────────────────────────────────────────────────

const CHART_OPTIONS_META: { type: ChartType; label: string; cor: string; icone: React.ReactNode }[] = [
  { type: 'LINE',           label: 'Linha',       cor: '#818cf8', icone: <ChartLine          size={18} weight="duotone" /> },
  { type: 'AREA',           label: 'Área',        cor: '#6366f1', icone: <ChartLine          size={18} weight="fill"    /> },
  { type: 'BAR',            label: 'Barras',      cor: '#34d399', icone: <ChartBar           size={18} weight="duotone" /> },
  { type: 'BAR_HORIZONTAL', label: 'Barras H.',   cor: '#34d399', icone: <ChartBarHorizontal size={18} weight="duotone" /> },
  { type: 'DISTRIBUTION',   label: 'Distribuição',cor: '#f59e0b', icone: <ChartPieSlice      size={18} weight="duotone" /> },
  { type: 'DONUT',          label: 'Donut',       cor: '#f59e0b', icone: <ChartDonut         size={18} weight="duotone" /> },
  { type: 'KPI_CARD',       label: 'KPI',         cor: '#60a5fa', icone: <NumberSquareOne    size={18} weight="duotone" /> },
  { type: 'FUNNEL',         label: 'Funil',       cor: '#fb923c', icone: <Funnel             size={18} weight="duotone" /> },
]

const PERIOD_OPTS = [
  { value: '7d',            label: '7 dias'    },
  { value: '30d',           label: '30 dias'   },
  { value: '90d',           label: '90 dias'   },
  { value: '12m',           label: '12 meses'  },
  { value: 'current_month', label: 'Mês atual' },
  { value: 'current_year',  label: 'Ano atual' },
]

function WidgetEditModal({
  widget, aberto, onFechar, onSalvar,
}: {
  widget: DashboardWidgetConfig | null
  aberto: boolean
  onFechar: () => void
  onSalvar: (patch: Partial<DashboardWidgetConfig>) => void
}) {
  const [title,     setTitle]     = useState('')
  const [chartType, setChartType] = useState<ChartType>('LINE')
  const [period,    setPeriod]    = useState('30d')
  const [initial,   setInitial]   = useState({ title: '', chartType: 'LINE' as ChartType, period: '30d' })

  React.useEffect(() => {
    if (aberto && widget) {
      const init = {
        title:     widget.title,
        chartType: widget.chart_type,
        period:    widget.query_spec.filters.period ?? '30d',
      }
      setInitial(init)
      setTitle(init.title)
      setChartType(init.chartType)
      setPeriod(init.period)
    }
  }, [aberto, widget])

  const dirty = title !== initial.title || chartType !== initial.chartType || period !== initial.period

  function handleSalvar() {
    onSalvar({
      title,
      chart_type: chartType,
      query_spec: { ...widget!.query_spec, filters: { period } },
    })
    onFechar()
  }

  const currentChartMeta = CHART_OPTIONS_META.find(o => o.type === chartType)
  const s = editModalStyles

  const conteudo = (
    <div style={{ ...s.body, padding: '1.5rem' }}>

      <div style={s.field}>
        <label style={s.label}>Título</label>
        <input style={s.input} value={title} onChange={e => setTitle(e.target.value)} maxLength={80} autoFocus />
      </div>

      <div style={s.field}>
        <label style={s.label}>Tipo de gráfico</label>
        <div style={s.chartGrid}>
          {CHART_OPTIONS_META.map(o => (
            <button
              key={o.type}
              type="button"
              style={{ ...s.chartBtn, ...(chartType === o.type ? s.chartBtnAtivo : {}) }}
              onClick={() => setChartType(o.type)}
              title={o.label}
            >
              <span style={{ color: chartType === o.type ? o.cor : 'var(--text-muted)' }}>{o.icone}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={s.field}>
        <label style={s.label}>Período</label>
        <select style={s.select} value={period} onChange={e => setPeriod(e.target.value)}>
          {PERIOD_OPTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* Campos read-only com operação por campo */}
      <div style={s.infoBox}>
        <span style={s.infoKey}>Tipo</span>
        <span style={{ ...s.infoVal, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ color: currentChartMeta?.cor }}>{currentChartMeta?.icone}</span>
          {currentChartMeta?.label}
        </span>
        <span style={s.infoKey}>Campo(s)</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {widget?.query_spec.fields.map(fqs => {
            const cat = CATALOG_BY_KEY[fqs.key]
            return (
              <span key={fqs.key} style={s.infoVal}>
                {cat?.label ?? fqs.key}
                <span style={s.opBadge}>{fqs.operation}</span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={onFechar}
      aoSalvar={handleSalvar}
      icone={<ChartLine size={20} weight="duotone" />}
      titulo="Editar Widget"
      subtitulo={widget?.title}
      dirty={dirty}
      podesSalvar={true}
      tamanho="md"
      semAbas={true}
      abas={[{ id: 'main', rotulo: 'Geral', conteudo }]}
    />
  )
}

const editModalStyles = {
  body:  { display: 'flex', flexDirection: 'column' as const, gap: '1.125rem' },
  field: { display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' },
  label: { fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  input: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.875rem',
    padding: '0.5rem 0.75rem', outline: 'none', width: '100%', boxSizing: 'border-box' as const,
  },
  select: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.875rem',
    padding: '0.5rem 0.75rem', outline: 'none', width: '100%', cursor: 'pointer',
  },
  chartGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.375rem' },
  chartBtn: {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '0.2rem',
    padding: '0.4rem 0.6rem', minWidth: '56px', borderRadius: '8px',
    border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
    color: 'var(--text-muted)', fontSize: '0.625rem', fontWeight: 600, cursor: 'pointer',
  },
  chartBtnAtivo: { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.45)', color: 'var(--accent)' },
  infoBox: {
    display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.375rem 0.875rem',
    alignItems: 'start', background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
    border: '1px solid var(--border-default)', padding: '0.75rem 1rem',
  },
  infoKey: { fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const, paddingTop: '2px' },
  infoVal: { fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' },
  opBadge: {
    fontSize: '10px', fontWeight: 600, color: 'var(--accent)',
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    borderRadius: '4px', padding: '1px 5px',
  },
} as const

// ── Sugestões ─────────────────────────────────────────────────────────────────

function SuggestionsPanel({ onAdd, onClose, existingIds }: {
  onAdd: (widget: DashboardWidgetConfig) => void
  onClose: () => void
  existingIds: string[]
}) {
  const allDerived = getAllDerivedMetrics()
  const suggestions = useMemo(
    () => generateSuggestions(existingIds, allDerived, 12),
    [existingIds],
  )

  const confidenceColor = { high: '#34d399', medium: '#f59e0b', low: '#94a3b8' }

  return (
    <div style={panelStyles.overlay}>
      <div style={panelStyles.panel}>
        <div style={panelStyles.header}>
          <span style={panelStyles.headerTitle}><Lightbulb size={16} weight="duotone" /> Sugestões</span>
          <button style={panelStyles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <p style={panelStyles.hint}>Sugestões por cruzamento semântico das métricas do produto.</p>
        <div style={panelStyles.list}>
          {suggestions.map(s => (
            <div key={s.id} style={panelStyles.item}>
              <div style={panelStyles.itemLeft}>
                <span style={{ ...panelStyles.badge, color: confidenceColor[s.confidence] }}>
                  {s.confidence === 'high' ? '● Alta' : s.confidence === 'medium' ? '● Média' : '● Baixa'}
                </span>
                <strong style={panelStyles.itemTitle}>{s.title}</strong>
                <span style={panelStyles.itemDesc}>{s.description}</span>
                <span style={panelStyles.itemFields}>{s.fields.join(' + ')}</span>
              </div>
              <button style={panelStyles.addBtn} onClick={() => { onAdd(s.config); onClose() }}>
                <Plus size={13} /> Adicionar
              </button>
            </div>
          ))}
        </div>
        <div style={panelStyles.divider} />
        <p style={panelStyles.sectionTitle}>Métricas Derivadas</p>
        <div style={panelStyles.list}>
          {allDerived.map(dm => (
            <div key={dm.id} style={panelStyles.item}>
              <div style={panelStyles.itemLeft}>
                <strong style={panelStyles.itemTitle}>{dm.label}</strong>
                <span style={panelStyles.itemDesc}>{dm.description}</span>
                <span style={panelStyles.itemFields}>{dm.inputFields.join(' ÷ ')}</span>
              </div>
              <button style={panelStyles.addBtn} onClick={() => {
                const widget: DashboardWidgetConfig = {
                  id: `derived_${dm.id}_${Date.now()}`,
                  title: dm.label,
                  chart_type: 'KPI_CARD',
                  query_spec: {
                    fields: dm.inputFields.map(k => ({ key: k, operation: dm.operation })),
                    filters: { period: '30d' },
                  },
                  position: { x: 0, y: 12, w: 3, h: 1 },
                  config: { derivedMetricId: dm.id },
                }
                onAdd(widget)
                onClose()
              }}>
                <Plus size={13} /> Adicionar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function DashboardPedido() {
  const {
    widgets, addWidget, removeWidget, updateWidget,
    slicers, setPeriod, setStatusFilter,
    activeFilters, clearFilters,
    editMode, setEditMode,
    queryBuilderOpen, setQueryBuilderOpen,
    userDerivedMetrics,
  } = useDashboardStore()

  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [editingWidget,   setEditingWidget]   = useState<DashboardWidgetConfig | null>(null)
  const [editModalOpen,   setEditModalOpen]   = useState(false)

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

  const allDerived: DerivedMetric[] = useMemo(
    () => [...BUILT_IN_DERIVED, ...userDerivedMetrics],
    [userDerivedMetrics],
  )

  const renderWidget = useCallback((widget: DashboardWidgetConfig) => {
    const result = mockResult(widget)
    const chartType = widget.chart_type
    const fields = widget.query_spec.fields

    // ── DISTRIBUTION ────────────────────────────────────────────────────────
    if (chartType === 'DISTRIBUTION') {
      return (
        <WidgetContainer key={widget.id} widget={widget} result={result} loading={false} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={editMode ? removeWidget : undefined}
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
        <WidgetContainer key={widget.id} widget={widget} result={result} loading={false} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={editMode ? removeWidget : undefined}
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
        <WidgetContainer key={widget.id} widget={widget} result={result} loading={false} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={editMode ? removeWidget : undefined}
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
      return (
        <WidgetContainer key={widget.id} widget={widget} result={result} loading={false} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={editMode ? removeWidget : undefined}
        >
          <KpiValue data={result.data} fieldKey={fieldKey} fieldType={fieldType} />
        </WidgetContainer>
      )
    }

    // ── Fallback ─────────────────────────────────────────────────────────────
    const fieldKey = fields[0]?.key ?? 'value'
    return (
      <WidgetContainer key={widget.id} widget={widget} result={result} loading={false} error={null}
        editMode={editMode}
        onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
        onRemove={editMode ? removeWidget : undefined}
      >
        <KpiValue data={result.data} fieldKey={fieldKey} fieldType="number" />
      </WidgetContainer>
    )
  }, [editMode, removeWidget, allDerived])

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

  return (
    <div style={{ padding: '1.5rem' }}>

      <div style={styles.toolbar}>
        <div style={styles.slicerGroup}>
          <span style={styles.slicerLabel}>Período</span>
          <select value={slicers.period} onChange={e => setPeriod(e.target.value)} style={styles.select}>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="12m">Últimos 12 meses</option>
            <option value="current_month">Mês atual</option>
            <option value="current_year">Ano atual</option>
          </select>
        </div>

        <div style={styles.slicerGroup}>
          <span style={styles.slicerLabel}>Status</span>
          <div style={styles.statusChips}>
            {STATUS_OPTIONS.map(s => {
              const active = slicers.status.includes(s)
              return (
                <button
                  key={s}
                  style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}
                  onClick={() => setStatusFilter(active ? slicers.status.filter(x => x !== s) : [...slicers.status, s])}
                >
                  {s.replace('_', ' ')}
                </button>
              )
            })}
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div style={styles.activeFilters}>
            <span style={styles.slicerLabel}>Filtros ativos:</span>
            {activeFilters.map(f => (
              <span key={`${f.field}-${f.sourceWidgetId}`} style={styles.filterTag}>{f.label}</span>
            ))}
            <button style={styles.clearBtn} onClick={clearFilters}><X size={12} /> Limpar</button>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {editMode && (
          <>
            <button style={styles.btnSecondary} onClick={() => setSuggestionsOpen(true)}>
              <Lightbulb size={14} weight="duotone" /> Sugestões
            </button>
            <button style={styles.btnSecondary} onClick={() => setQueryBuilderOpen(true)}>
              <Plus size={14} /> Adicionar widget
            </button>
          </>
        )}

        <button
          style={editMode ? styles.btnPrimary : styles.btnSecondary}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode
            ? <><Check size={14} /> Concluir edição</>
            : <><PencilSimple size={14} /> Editar dashboard</>
          }
        </button>
      </div>

      <DashboardGrid widgets={activeWidgets} renderWidget={renderWidget} editMode={editMode} />

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
      />

      {suggestionsOpen && (
        <SuggestionsPanel
          existingIds={widgets.map(w => w.id)}
          onAdd={addWidget}
          onClose={() => setSuggestionsOpen(false)}
        />
      )}
    </div>
  )
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = {
  toolbar: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' as const },
  slicerGroup: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  slicerLabel: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 },
  select: {
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
    fontSize: '13px', padding: '5px 10px', cursor: 'pointer', outline: 'none',
  },
  statusChips: { display: 'flex', gap: '0.375rem' },
  chip: {
    fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '999px',
    border: '1px solid var(--border-default)', background: 'transparent',
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  chipActive: { background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', color: 'var(--accent)' },
  activeFilters: { display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' as const },
  filterTag: {
    fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
    background: 'rgba(129,140,248,0.15)', color: 'var(--accent)', border: '1px solid var(--border-accent)',
  },
  clearBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
    background: 'transparent', border: '1px solid var(--border-default)',
    color: 'var(--text-muted)', cursor: 'pointer',
  },
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', padding: '6px 14px', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    color: 'var(--text-primary)', cursor: 'pointer',
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', padding: '6px 14px', borderRadius: 'var(--radius-md)',
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    color: 'var(--accent)', cursor: 'pointer', fontWeight: 600,
  },
} as const

const panelStyles = {
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  panel: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)', padding: '1.5rem',
    width: '100%', maxWidth: '680px', maxHeight: '80vh', overflowY: 'auto' as const, boxShadow: 'var(--shadow-lg)',
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' },
  headerTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' },
  hint: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem', marginTop: 0 },
  list: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.75rem 1rem', background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', gap: '1rem',
  },
  itemLeft: { display: 'flex', flexDirection: 'column' as const, gap: '2px', minWidth: 0 },
  badge: { fontSize: '10px', fontWeight: 700 },
  itemTitle: { fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 },
  itemDesc: { fontSize: '12px', color: 'var(--text-secondary)' },
  itemFields: { fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' },
  addBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0,
    fontSize: '12px', padding: '5px 12px', borderRadius: 'var(--radius-md)',
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    color: 'var(--accent)', cursor: 'pointer', fontWeight: 500,
  },
  divider: { height: '1px', background: 'var(--border-default)', margin: '1rem 0' },
  sectionTitle: { fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', marginTop: 0 },
} as const
