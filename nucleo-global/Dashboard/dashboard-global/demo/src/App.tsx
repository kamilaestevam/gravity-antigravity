import React, { useState } from 'react'
import type { Layouts } from 'react-grid-layout'
import {
  DashboardGrid,
  WidgetContainer,
  KpiWidget,
  LineChartWidget,
  BarChartWidget,
  DonutWidget,
} from '@nucleo/dashboard'
import type { DashboardWidgetConfig, WidgetResult } from '@nucleo/dashboard'

// ── Dados mock ────────────────────────────────────────────────────────────────

const MONTHS = ['2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
                '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']

function makeSeries(values: number[]) {
  return MONTHS.map((month, i) => ({ month, value: values[i] }))
}

const kpiResult: WidgetResult = {
  data: { total_pedidos: 1842, receita_total: 4750000, ticket_medio: 2578 },
  chartType: 'KPI_CARD',
  partial: false,
  cached: false,
  computed_at: new Date().toISOString(),
}

const lineSeriesPedidos = [
  {
    fieldKey: 'total_pedidos',
    label: 'Pedidos',
    color: 'var(--accent)',
    yAxisId: 'left' as const,
    unit: 'number' as const,
    data: makeSeries([98, 115, 134, 109, 143, 167, 188, 172, 201, 219, 243, 267]),
  },
]

const lineSeriesDualAxis = [
  {
    fieldKey: 'receita',
    label: 'Receita (R$)',
    color: 'var(--accent)',
    yAxisId: 'left' as const,
    unit: 'currency' as const,
    data: makeSeries([310000, 380000, 420000, 355000, 467000, 520000, 590000, 548000, 623000, 701000, 780000, 845000]),
  },
  {
    fieldKey: 'pedidos',
    label: 'Pedidos',
    color: '#34d399',
    yAxisId: 'right' as const,
    unit: 'number' as const,
    data: makeSeries([98, 115, 134, 109, 143, 167, 188, 172, 201, 219, 243, 267]),
  },
]

const barSeries = [
  {
    fieldKey: 'aprovados',
    label: 'Aprovados',
    color: '#34d399',
    yAxisId: 'left' as const,
    unit: 'number' as const,
    data: makeSeries([78, 95, 110, 88, 121, 145, 162, 148, 177, 193, 215, 238]),
  },
  {
    fieldKey: 'cancelados',
    label: 'Cancelados',
    color: '#f87171',
    yAxisId: 'left' as const,
    unit: 'number' as const,
    data: makeSeries([12, 14, 18, 15, 17, 19, 22, 20, 21, 24, 25, 27]),
  },
]

const donutData = {
  series: [
    { name: 'Aprovado',   value: 68 },
    { name: 'Em análise', value: 18 },
    { name: 'Cancelado',  value: 9  },
    { name: 'Rascunho',   value: 5  },
  ],
}

// ── Configuração inicial dos widgets ─────────────────────────────────────────

const INITIAL_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'kpi-1', title: 'Total de Pedidos',    chart_type: 'KPI_CARD', query_spec: { fields: [], filters: { period: '30d' } }, position: { x: 0, y: 0, w: 3, h: 1 } },
  { id: 'kpi-2', title: 'Receita Total',        chart_type: 'KPI_CARD', query_spec: { fields: [], filters: { period: '30d' } }, position: { x: 3, y: 0, w: 3, h: 1 } },
  { id: 'kpi-3', title: 'Ticket Médio',         chart_type: 'KPI_CARD', query_spec: { fields: [], filters: { period: '30d' } }, position: { x: 6, y: 0, w: 3, h: 1 } },
  { id: 'line-1', title: 'Pedidos por Mês',     chart_type: 'LINE',     query_spec: { fields: [], filters: { period: '12m' } }, position: { x: 0, y: 1, w: 6, h: 3 } },
  { id: 'line-2', title: 'Receita vs Pedidos',  chart_type: 'LINE',     query_spec: { fields: [], filters: { period: '12m' } }, position: { x: 6, y: 1, w: 6, h: 3 } },
  { id: 'bar-1',  title: 'Status de Pedidos',   chart_type: 'BAR',      query_spec: { fields: [], filters: { period: '12m' } }, position: { x: 0, y: 4, w: 8, h: 3 } },
  { id: 'donut-1', title: 'Distribuição Status', chart_type: 'DONUT',   query_spec: { fields: [], filters: { period: '30d' } }, position: { x: 8, y: 4, w: 4, h: 3 } },
]

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [theme,    setTheme]    = useState<'dark' | 'light'>('dark')
  const [editMode, setEditMode] = useState(false)
  const [widgets,  setWidgets]  = useState(INITIAL_WIDGETS)

  function handleLayoutChange(layouts: Layouts) {
    const lgLayout = layouts.lg ?? []
    setWidgets(prev => prev.map(w => {
      const l = lgLayout.find(l => l.i === w.id)
      if (!l) return w
      return { ...w, position: { x: l.x, y: l.y, w: l.w, h: l.h } }
    }))
  }

  function renderWidget(widget: DashboardWidgetConfig) {
    let children: React.ReactNode = null

    switch (widget.id) {
      case 'kpi-1':
        children = <KpiWidget title={widget.title} data={kpiResult.data} fieldKey="total_pedidos" fieldType="number" />
        break
      case 'kpi-2':
        children = <KpiWidget title={widget.title} data={kpiResult.data} fieldKey="receita_total" fieldType="currency" />
        break
      case 'kpi-3':
        children = <KpiWidget title={widget.title} data={kpiResult.data} fieldKey="ticket_medio" fieldType="currency" />
        break
      case 'line-1':
        children = <LineChartWidget series={lineSeriesPedidos} showArea />
        break
      case 'line-2':
        children = <LineChartWidget series={lineSeriesDualAxis} dualAxis leftUnit="currency" rightUnit="number" />
        break
      case 'bar-1':
        children = <BarChartWidget series={barSeries} mode="grouped" leftUnit="number" />
        break
      case 'donut-1':
        children = <DonutWidget data={donutData.series} />
        break
      default:
        children = null
    }

    return (
      <WidgetContainer
        key={widget.id}
        widget={widget}
        result={kpiResult}
        editMode={editMode}
      >
        {children}
      </WidgetContainer>
    )
  }

  return (
    <div data-theme={theme}>
      <header className="demo-header">
        <h1>dashboard-global</h1>
        <span>@nucleo/dashboard — Demo interativo</span>
        <div className="demo-controls">
          <button
            className={`demo-btn${editMode ? ' demo-btn--active' : ''}`}
            onClick={() => setEditMode(v => !v)}
          >
            {editMode ? 'Edição ativa' : 'Modo edição'}
          </button>
          <button
            className="demo-btn"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          </button>
        </div>
      </header>

      <div className="demo-content">
        <DashboardGrid
          widgets={widgets}
          renderWidget={renderWidget}
          editMode={editMode}
          onLayoutChange={handleLayoutChange}
        />
      </div>
    </div>
  )
}
