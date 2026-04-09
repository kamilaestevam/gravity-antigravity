/**
 * WidgetEditModal — Modal de edição de widget
 *
 * Componente puro: edita título, tipo de gráfico e período de um widget.
 * Recebe fieldLabels para exibir nomes legíveis dos campos (sem depender do catálogo do produto).
 * Usa ModalFormularioAbasGlobal do nucleo para consistência visual.
 */

import React, { useState, useEffect } from 'react'
import {
  ChartLine, ChartBar, ChartBarHorizontal, ChartDonut,
  NumberSquareOne, Funnel, ChartPieSlice,
} from '@phosphor-icons/react'
import type { DashboardWidgetConfig, ChartType } from '../tipos.js'

export interface ChartOptionMeta {
  type: ChartType
  label: string
  cor: string
  icone: React.ReactNode
}

const DEFAULT_CHART_OPTIONS: ChartOptionMeta[] = [
  { type: 'LINE',           label: 'Linha',        cor: '#818cf8', icone: <ChartLine          size={18} weight="duotone" /> },
  { type: 'AREA',           label: 'Área',         cor: '#6366f1', icone: <ChartLine          size={18} weight="fill"    /> },
  { type: 'BAR',            label: 'Barras',       cor: '#34d399', icone: <ChartBar           size={18} weight="duotone" /> },
  { type: 'BAR_HORIZONTAL', label: 'Barras H.',    cor: '#34d399', icone: <ChartBarHorizontal size={18} weight="duotone" /> },
  { type: 'DISTRIBUTION',   label: 'Distribuição', cor: '#f59e0b', icone: <ChartPieSlice      size={18} weight="duotone" /> },
  { type: 'DONUT',          label: 'Donut',        cor: '#f59e0b', icone: <ChartDonut         size={18} weight="duotone" /> },
  { type: 'KPI_CARD',       label: 'KPI',          cor: '#60a5fa', icone: <NumberSquareOne    size={18} weight="duotone" /> },
  { type: 'FUNNEL',         label: 'Funil',        cor: '#fb923c', icone: <Funnel             size={18} weight="duotone" /> },
]

export interface PeriodOptionEdit {
  value: string
  label: string
}

const DEFAULT_PERIOD_OPTS: PeriodOptionEdit[] = [
  { value: '7d',            label: '7 dias'    },
  { value: '30d',           label: '30 dias'   },
  { value: '90d',           label: '90 dias'   },
  { value: '12m',           label: '12 meses'  },
  { value: 'current_month', label: 'Mês atual' },
  { value: 'current_year',  label: 'Ano atual' },
]

export interface WidgetEditModalProps {
  widget: DashboardWidgetConfig | null
  aberto: boolean
  onFechar: () => void
  onSalvar: (patch: Partial<DashboardWidgetConfig>) => void
  /** Labels legíveis por chave de campo. Ex: { total_pedidos: 'Total de Pedidos' } */
  fieldLabels?: Record<string, string>
  /** Tipos de gráfico disponíveis para seleção. Padrão: todos os 8 tipos. */
  chartOptions?: ChartOptionMeta[]
  /** Opções de período disponíveis. */
  periodOptions?: PeriodOptionEdit[]
}

export function WidgetEditModal({
  widget,
  aberto,
  onFechar,
  onSalvar,
  fieldLabels = {},
  chartOptions = DEFAULT_CHART_OPTIONS,
  periodOptions = DEFAULT_PERIOD_OPTS,
}: WidgetEditModalProps) {
  const [title,     setTitle]     = useState('')
  const [chartType, setChartType] = useState<ChartType>('LINE')
  const [period,    setPeriod]    = useState('30d')
  const [initial,   setInitial]   = useState({ title: '', chartType: 'LINE' as ChartType, period: '30d' })

  useEffect(() => {
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

  if (!aberto || !widget) return null

  const dirty = title !== initial.title || chartType !== initial.chartType || period !== initial.period
  const currentChartMeta = chartOptions.find(o => o.type === chartType)

  function handleSalvar() {
    onSalvar({
      title,
      chart_type: chartType,
      query_spec: { ...widget!.query_spec, filters: { period } },
    })
    onFechar()
  }

  const s = modalStyles

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onFechar() }}>
      <div style={s.card} role="dialog" aria-modal="true" aria-label="Editar Widget">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={s.header}>
          <div style={s.headerInfo}>
            <ChartLine size={18} weight="duotone" style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div>
              <div style={s.headerTitle}>Editar Widget</div>
              <div style={s.headerSub}>{widget.title}</div>
            </div>
          </div>
          <button type="button" style={s.closeBtn} onClick={onFechar} aria-label="Fechar">✕</button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div style={s.body}>

          {/* Título */}
          <div style={s.field}>
            <label style={s.label}>Título</label>
            <input
              style={s.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={80}
              autoFocus
            />
          </div>

          {/* Tipo de gráfico */}
          <div style={s.field}>
            <label style={s.label}>Tipo de gráfico</label>
            <div style={s.chartGrid}>
              {chartOptions.map(o => (
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

          {/* Período */}
          <div style={s.field}>
            <label style={s.label}>Período</label>
            <select style={s.select} value={period} onChange={e => setPeriod(e.target.value)}>
              {periodOptions.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Info read-only: tipo atual + campos */}
          <div style={s.infoBox}>
            <span style={s.infoKey}>Tipo</span>
            <span style={{ ...s.infoVal, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ color: currentChartMeta?.cor }}>{currentChartMeta?.icone}</span>
              {currentChartMeta?.label}
            </span>
            <span style={s.infoKey}>Campo(s)</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {widget.query_spec.fields.map(fqs => (
                <span key={fqs.key} style={s.infoVal}>
                  {fieldLabels[fqs.key] ?? fqs.key}
                  <span style={s.opBadge}>{fqs.operation}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div style={s.footer}>
          <button type="button" style={s.btnCancel} onClick={onFechar}>Cancelar</button>
          <button
            type="button"
            style={{ ...s.btnSave, ...(dirty ? {} : s.btnSaveDisabled) }}
            onClick={handleSalvar}
            disabled={!dirty}
          >
            Salvar
          </button>
        </div>

      </div>
    </div>
  )
}

const modalStyles = {
  overlay: {
    position: 'fixed' as const, inset: 0,
    background: 'rgba(0,0,0,0.6)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  card: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px',
    boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column' as const,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-default)',
  },
  headerInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  headerTitle: { fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' },
  headerSub: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1,
    padding: '4px', borderRadius: '4px',
  },
  body: {
    padding: '1.25rem', display: 'flex',
    flexDirection: 'column' as const, gap: '1rem',
  },
  field: { display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' },
  label: {
    fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
  },
  input: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.875rem',
    padding: '0.5rem 0.75rem', outline: 'none', width: '100%',
    boxSizing: 'border-box' as const,
  },
  select: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.875rem',
    padding: '0.5rem 0.75rem', outline: 'none', width: '100%', cursor: 'pointer',
  },
  chartGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.375rem' },
  chartBtn: {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
    gap: '0.2rem', padding: '0.4rem 0.6rem', minWidth: '56px',
    borderRadius: '8px', border: '1px solid var(--border-default)',
    background: 'var(--bg-elevated)', color: 'var(--text-muted)',
    fontSize: '0.625rem', fontWeight: 600, cursor: 'pointer',
  },
  chartBtnAtivo: {
    background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.45)',
    color: 'var(--accent)',
  },
  infoBox: {
    display: 'grid', gridTemplateColumns: 'auto 1fr',
    gap: '0.375rem 0.875rem', alignItems: 'start',
    background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
    border: '1px solid var(--border-default)', padding: '0.75rem 1rem',
  },
  infoKey: {
    fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
    whiteSpace: 'nowrap' as const, paddingTop: '2px',
  },
  infoVal: {
    fontSize: '0.8125rem', color: 'var(--text-secondary)',
    fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px',
  },
  opBadge: {
    fontSize: '10px', fontWeight: 600, color: 'var(--accent)',
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    borderRadius: '4px', padding: '1px 5px',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
    padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border-default)',
  },
  btnCancel: {
    fontSize: '13px', padding: '6px 16px', borderRadius: 'var(--radius-md)',
    background: 'transparent', border: '1px solid var(--border-default)',
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  btnSave: {
    fontSize: '13px', padding: '6px 16px', borderRadius: 'var(--radius-md)',
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    color: 'var(--accent)', cursor: 'pointer', fontWeight: 600,
  },
  btnSaveDisabled: {
    opacity: 0.4, cursor: 'not-allowed',
  },
} as const
