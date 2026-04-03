import React, { useMemo, useState } from 'react'
import {
  DashboardGrid,
  WidgetContainer,
  LineChartWidget,
} from '@nucleo/dashboard'
import { QueryBuilder } from '@nucleo/query-builder-global'
import type { DashboardWidgetConfig, WidgetResult, WidgetDataValue, WidgetQuerySpec, ChartType } from '@nucleo/dashboard'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PencilSimple, Check, Plus, Lightbulb, X, Trash } from '@phosphor-icons/react'

import { useDashboardStore } from '../stores/dashboardStore'
import { DASHBOARD_CATALOG } from '../shared/dashboardCatalog'
import { generateSuggestions } from '../shared/dashboardSuggestions'
import { BUILT_IN_DERIVED, getAllDerivedMetrics, computeDerived } from '../shared/derivedMetrics'
import type { DerivedMetric } from '../shared/derivedMetrics'

// ── Mock de dados ─────────────────────────────────────────────────────────────

const MONTHS = [
  '2025-05','2025-06','2025-07','2025-08','2025-09','2025-10',
  '2025-11','2025-12','2026-01','2026-02','2026-03','2026-04',
]

function trend(base: number, variance: number) {
  return MONTHS.map(month => ({ month, value: Math.round(base + Math.random() * variance) }))
}

const BASE_DATA: Record<string, number> = {
  total_pedidos: 1247, pedidos_abertos: 312, pedidos_em_andamento: 483,
  pedidos_atrasados: 87, valor_total: 4820350.75, cobertura_pendente: 718420.50,
  valor_itens_total: 3945120.00, qtd_total: 28430, itens_prontos: 19820,
  qtd_atual_total: 24105, qtd_transferida_total: 16340, qtd_inicial_total: 30200,
}

function mockResult(widget: DashboardWidgetConfig): WidgetResult {
  const now = new Date().toISOString()
  const field = widget.query_spec.fields[0]

  if (widget.chart_type === 'LINE') {
    const base = field === 'total_pedidos' ? 80 : field === 'cobertura_pendente' ? 55 : 382
    const variance = field === 'total_pedidos' ? 60 : field === 'cobertura_pendente' ? 30 : 120
    return { data: { [field]: trend(base, variance) }, chartType: 'LINE', partial: false, cached: true, computed_at: now }
  }

  if (widget.chart_type === 'DONUT') {
    return {
      data: { status_dist: { Abertos: 312, 'Em Andamento': 483, Atrasados: 87, Concluídos: 365 } },
      chartType: 'DONUT', partial: false, cached: true, computed_at: now,
    }
  }

  if (widget.config?.derivedMetricId) {
    const dm = getAllDerivedMetrics().find(m => m.id === widget.config!.derivedMetricId)
    if (dm) {
      const value = computeDerived(dm, BASE_DATA)
      return { data: { [field]: value ?? 0 }, chartType: 'KPI_CARD', partial: false, cached: false, computed_at: now }
    }
  }

  const value = BASE_DATA[field] ?? 0
  return { data: { [field]: value }, chartType: 'KPI_CARD', partial: false, cached: true, computed_at: now }
}

// ── Componentes inline ────────────────────────────────────────────────────────

const DONUT_COLORS = ['#818cf8','#34d399','#f59e0b','#f87171','#60a5fa','#a78bfa','#fb923c']
const tooltipStyle: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
  borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)',
}

function KpiValue({ data, fieldKey, fieldType = 'number' }: {
  data: Record<string, WidgetDataValue>
  fieldKey: string
  fieldType?: 'number' | 'currency' | 'percentage'
}) {
  const raw = data[fieldKey]
  const value = typeof raw === 'number' ? raw
    : typeof Object.values(data)[0] === 'number' ? Object.values(data)[0] as number : null

  if (value === null) return <span style={kpiStyles.empty}>--</span>

  let display: string
  if (fieldType === 'currency') {
    display = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  } else if (fieldType === 'percentage') {
    display = `${value.toFixed(1)}%`
  } else {
    display = new Intl.NumberFormat('pt-BR').format(value)
  }

  return (
    <div style={kpiStyles.wrap}>
      <span style={kpiStyles.value}>{display}</span>
    </div>
  )
}

function DonutValue({ data, fieldKey }: { data: Record<string, WidgetDataValue>; fieldKey: string }) {
  const raw = data[fieldKey]
  const isDistribution = raw !== null && typeof raw === 'object' && !Array.isArray(raw) &&
    Object.values(raw).every(v => typeof v === 'number')
  if (!isDistribution) return <span style={kpiStyles.empty}>Dados insuficientes</span>

  const chartData = Object.entries(raw as Record<string, number>).map(([name, value]) => ({ name, value }))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chartData} cx="50%" cy="45%" innerRadius="40%" outerRadius="65%" paddingAngle={2} dataKey="value">
          {chartData.map((_e, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Painel de sugestões ───────────────────────────────────────────────────────

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
          <span style={panelStyles.headerTitle}>
            <Lightbulb size={16} weight="duotone" /> Sugestões de Widgets
          </span>
          <button style={panelStyles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <p style={panelStyles.hint}>
          Sugestões geradas por cruzamento semântico das métricas do produto.
        </p>

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
        <p style={panelStyles.sectionTitle}>Métricas Derivadas Disponíveis</p>
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
                  query_spec: { fields: dm.inputFields, operation: dm.operation, filters: { period: '30d' } },
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
    widgets, addWidget, removeWidget,
    slicers, setPeriod, setStatusFilter,
    activeFilters, clearFilters,
    editMode, setEditMode,
    queryBuilderOpen, setQueryBuilderOpen,
    userDerivedMetrics,
  } = useDashboardStore()

  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  // Aplica período global a todos os widgets que usam o período do slicer
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

  function renderWidget(widget: DashboardWidgetConfig) {
    const result = mockResult(widget)
    const field = widget.query_spec.fields[0]
    const isCurrency = ['valor_total', 'cobertura_pendente', 'valor_itens_total'].includes(field)
    const dm = widget.config?.derivedMetricId
      ? allDerived.find(m => m.id === widget.config!.derivedMetricId)
      : undefined
    const fieldType = dm?.fieldType ?? (isCurrency ? 'currency' : 'number')

    return (
      <WidgetContainer
        key={widget.id}
        widget={widget}
        result={result}
        loading={false}
        error={null}
        editMode={editMode}
        onRemove={editMode ? removeWidget : undefined}
      >
        {widget.chart_type === 'KPI_CARD' && (
          <KpiValue data={result.data} fieldKey={field} fieldType={fieldType as 'number' | 'currency' | 'percentage'} />
        )}
        {widget.chart_type === 'LINE' && (
          <LineChartWidget title="" data={result.data} fieldKey={field} showArea />
        )}
        {widget.chart_type === 'DONUT' && (
          <DonutValue data={result.data} fieldKey="status_dist" />
        )}
      </WidgetContainer>
    )
  }

  function handleQueryBuilderSave(spec: WidgetQuerySpec, title: string, chartType: ChartType) {
    const newWidget: DashboardWidgetConfig = {
      id: `custom_${Date.now()}`,
      title,
      chart_type: chartType,
      query_spec: { fields: spec.fields, operation: spec.operation, filters: spec.filters },
      position: { x: 0, y: 99, w: chartType === 'KPI_CARD' ? 3 : 6, h: chartType === 'KPI_CARD' ? 1 : 3 },
    }
    addWidget(newWidget)
    setQueryBuilderOpen(false)
  }

  const STATUS_OPTIONS = ['abertos', 'em_andamento', 'atrasados', 'concluidos']

  return (
    <div style={{ padding: '1.5rem' }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div style={styles.toolbar}>

        {/* Slicer: período */}
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

        {/* Slicer: status */}
        <div style={styles.slicerGroup}>
          <span style={styles.slicerLabel}>Status</span>
          <div style={styles.statusChips}>
            {STATUS_OPTIONS.map(s => {
              const active = slicers.status.includes(s)
              return (
                <button
                  key={s}
                  style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}
                  onClick={() => {
                    const next = active ? slicers.status.filter(x => x !== s) : [...slicers.status, s]
                    setStatusFilter(next)
                  }}
                >
                  {s.replace('_', ' ')}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cross-filter ativo */}
        {activeFilters.length > 0 && (
          <div style={styles.activeFilters}>
            <span style={styles.slicerLabel}>Filtros ativos:</span>
            {activeFilters.map(f => (
              <span key={`${f.field}-${f.sourceWidgetId}`} style={styles.filterTag}>
                {f.label}
              </span>
            ))}
            <button style={styles.clearBtn} onClick={clearFilters}>
              <X size={12} /> Limpar
            </button>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Ações */}
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

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <DashboardGrid
        widgets={activeWidgets}
        renderWidget={renderWidget}
        editMode={editMode}
      />

      {/* ── QueryBuilder modal ─────────────────────────────────────────────── */}
      <QueryBuilder
        aberto={queryBuilderOpen}
        availableFields={DASHBOARD_CATALOG}
        onSave={handleQueryBuilderSave}
        onCancel={() => setQueryBuilderOpen(false)}
      />

      {/* ── Painel de sugestões ────────────────────────────────────────────── */}
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

const kpiStyles = {
  wrap:  { display: 'flex', alignItems: 'center', height: '100%', padding: '0.25rem 0' },
  value: { fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 },
  empty: { fontSize: '1.5rem', color: 'var(--text-muted)' },
} as const

const styles = {
  toolbar: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    marginBottom: '1.25rem', flexWrap: 'wrap' as const,
  },
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
  chipActive: {
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    color: 'var(--accent)',
  },
  activeFilters: { display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' as const },
  filterTag: {
    fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
    background: 'rgba(129,140,248,0.15)', color: 'var(--accent)',
    border: '1px solid var(--border-accent)',
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
  overlay: {
    position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  panel: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)', padding: '1.5rem',
    width: '100%', maxWidth: '680px', maxHeight: '80vh',
    overflowY: 'auto' as const, boxShadow: 'var(--shadow-lg)',
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
