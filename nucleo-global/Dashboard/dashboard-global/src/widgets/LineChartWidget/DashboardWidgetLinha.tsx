/**
 * DashboardWidgetLinha — Gráfico de linha/área com suporte a múltiplas séries
 *
 * v2 — 2026-04-03
 * - Aceita array de séries (multi-campo)
 * - Suporte a eixo Y duplo (D3: unidades incompatíveis)
 * - Legenda sempre visível
 * - Tooltip crosshair mostrando todos os valores no mesmo ponto
 * - Paleta de cores fixa (SERIES_COLORS)
 */

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { WidgetSeriesPoint, FieldUnitType } from '../../tipos.js'
import { SERIES_COLORS, formatValueByUnit } from '../../utils/axisUtils.js'

export interface LineSeriesConfig {
  fieldKey: string
  label: string
  color: string
  data: Array<{ month: string; value: number }>
  yAxisId: 'left' | 'right'
  unit: FieldUnitType
}

export interface LineChartWidgetProps {
  series: LineSeriesConfig[]
  dualAxis?: boolean
  leftUnit?: FieldUnitType
  rightUnit?: FieldUnitType
  showArea?: boolean
}

// ── Formatação de mês ─────────────────────────────────────────────────────────

const MONTH_ABBR: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

function formatMonth(month: string): string {
  const parts = month.split('-')
  const monthNum = parts[1] ?? month
  return MONTH_ABBR[monthNum] ?? month
}

// ── Tooltip customizado ───────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
  label?: string
  series: LineSeriesConfig[]
}

function CustomTooltip({ active, payload, label, series }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipStyles.box}>
      <p style={tooltipStyles.label}>{label}</p>
      {payload.map(entry => {
        const s = series.find(s => s.fieldKey === entry.dataKey)
        const formatted = s ? formatValueByUnit(entry.value, s.unit) : String(entry.value)
        return (
          <div key={entry.dataKey} style={tooltipStyles.row}>
            <span style={{ ...tooltipStyles.dot, background: entry.color }} />
            <span style={tooltipStyles.name}>{entry.name}</span>
            <span style={tooltipStyles.value}>{formatted}</span>
          </div>
        )
      })}
    </div>
  )
}

const tooltipStyles = {
  box: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    color: 'var(--text-primary)',
    minWidth: '160px',
  },
  label: { margin: '0 0 6px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '11px' },
  row: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 } as React.CSSProperties,
  name: { flex: 1, color: 'var(--text-secondary)' },
  value: { fontWeight: 600, color: 'var(--text-primary)' },
} as const

// ── Merge de séries em array para Recharts ────────────────────────────────────

function buildChartData(series: LineSeriesConfig[]): WidgetSeriesPoint[] {
  if (series.length === 0) return []

  // Usa os meses da primeira série como eixo X
  const baseMonths = series[0].data.map(p => p.month)

  return baseMonths.map(month => {
    const point: WidgetSeriesPoint = { month: formatMonth(month) }
    for (const s of series) {
      const found = s.data.find(p => p.month === month)
      point[s.fieldKey] = found?.value ?? 0
    }
    return point
  })
}

// ── Configuração de eixo Y ────────────────────────────────────────────────────

const axisProps = {
  stroke: 'var(--text-muted)' as const,
  fontSize: 11,
  tick: { fill: 'var(--text-muted)' },
}

// ── Componente principal ──────────────────────────────────────────────────────

export function DashboardWidgetLinha({
  series,
  dualAxis = false,
  leftUnit = 'number',
  rightUnit = 'number',
  showArea = false,
}: LineChartWidgetProps) {
  if (series.length === 0) {
    return <div style={styles.empty}><span style={styles.emptyText}>Dados insuficientes</span></div>
  }

  const chartData = buildChartData(series)

  const leftTickFormatter = (v: number) => formatValueByUnit(v, leftUnit)
  const rightTickFormatter = (v: number) => formatValueByUnit(v, rightUnit ?? leftUnit)

  const commonProps = {
    data: chartData,
    margin: { top: 4, right: dualAxis ? 48 : 8, left: 0, bottom: 0 },
  }

  const renderLines = () =>
    series.map((s, i) => {
      const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length]
      if (showArea) {
        return (
          <Area
            key={s.fieldKey}
            type="monotone"
            dataKey={s.fieldKey}
            name={s.label}
            yAxisId={dualAxis ? s.yAxisId : 'left'}
            stroke={color}
            fill={color}
            fillOpacity={0.12}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        )
      }
      return (
        <Line
          key={s.fieldKey}
          type="monotone"
          dataKey={s.fieldKey}
          name={s.label}
          yAxisId={dualAxis ? s.yAxisId : 'left'}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      )
    })

  const ChartComponent = showArea ? AreaChart : LineChart

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={120}>
      <ChartComponent {...commonProps}>
        <CartesianGrid stroke="var(--bg-elevated)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis
          yAxisId="left"
          {...axisProps}
          width={48}
          tickFormatter={leftTickFormatter}
        />
        {dualAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            {...axisProps}
            width={48}
            tickFormatter={rightTickFormatter}
          />
        )}
        <Tooltip content={<CustomTooltip series={series} />} />
        {series.length > 1 && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)', paddingTop: '8px' }}
          />
        )}
        {renderLines()}
      </ChartComponent>
    </ResponsiveContainer>
  )
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = {
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: '120px',
    color: 'var(--text-muted)',
  },
  emptyText: { fontSize: '13px' },
} as const
