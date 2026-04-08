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

import React, { useMemo, useState, useCallback, useEffect } from 'react'
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

import { useDashboardStore } from '../stores/dashboardStore'
import { DASHBOARD_CATALOG, CATALOG_BY_KEY } from '../shared/dashboardCatalog'
import { generateSuggestions } from '../shared/dashboardSuggestions'
import { BUILT_IN_DERIVED, computeDerived } from '../shared/derivedMetrics'
import { dashboardApi } from '../shared/api'
import type { DashboardKpis, DashboardTrendBucket } from '../shared/api'

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

  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [editingWidget,   setEditingWidget]   = useState<DashboardWidgetConfig | null>(null)
  const [editModalOpen,   setEditModalOpen]   = useState(false)

  const [kpisData,    setKpisData]    = useState<DashboardKpis | null>(null)
  const [trendData,   setTrendData]   = useState<DashboardTrendBucket[]>([])
  const [loadingData, setLoadingData] = useState(true)

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

  // Sugestões computadas para o SuggestionsPanel
  const suggestions = useMemo(
    () => generateSuggestions(widgets.map(w => w.id), allDerived, 12),
    [widgets, allDerived],
  )

  useEffect(() => {
    setLoadingData(true)
    Promise.all([
      dashboardApi.kpis(slicers.period),
      dashboardApi.trend('12m', 'month'),
    ])
      .then(([kpis, trend]) => {
        setKpisData(kpis)
        setTrendData(trend.value)
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
    const result = kpisData
      ? buildWidgetResult(widget, kpisData, trendData, allDerived)
      : { data: {}, chartType: widget.chart_type, partial: true, cached: false, computed_at: new Date().toISOString() }
    const chartType = widget.chart_type
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
      return (
        <WidgetContainer key={widget.id} widget={widget} result={result} loading={loadingData} error={null}
          editMode={editMode}
          onEdit={(w) => { setEditingWidget(w); setEditModalOpen(true) }}
          onRemove={removeWidget}
        >
          <KpiValue data={result.data} fieldKey={fieldKey} fieldType={fieldType} />
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
  }, [editMode, removeWidget, allDerived, kpisData, trendData, loadingData])

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

      <DashboardToolbar
        slicers={slicers}
        onPeriodChange={setPeriod}
        onStatusChange={setStatusFilter}
        activeFilters={activeFilters}
        onClearFilters={clearFilters}
        editMode={editMode}
        onEditModeChange={setEditMode}
        statusOptions={STATUS_OPTIONS}
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
          onAdd={addWidget}
          onClose={() => setSuggestionsOpen(false)}
        />
      )}
    </div>
  )
}

// (estilos de toolbar e painel movidos para @nucleo/dashboard)
