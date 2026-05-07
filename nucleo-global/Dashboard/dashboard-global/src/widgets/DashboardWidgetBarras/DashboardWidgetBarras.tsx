/**
 * DashboardWidgetBarras — Gráfico de barras com suporte a múltiplas séries
 *
 * v2 — 2026-04-03
 * - Aceita array de séries (multi-campo)
 * - Modo grouped (padrão) e stacked
 * - Suporte a eixo Y duplo (D3: unidades incompatíveis)
 * - Legenda sempre visível quando multi-série
 * - Tooltip customizado com formatação por unidade
 * - Paleta de cores fixa (SERIES_COLORS)
 */

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { FieldUnitType } from '../../tipos.js'
import { SERIES_COLORS, formatValueByUnit } from '../../utils/axisUtils.js'

export interface BarSeriesConfig {
  fieldKey: string
  label: string
  color: string
  data: Record<string, number> | Array<{ month: string; value: number }>
  yAxisId: 'left' | 'right'
  unit: FieldUnitType
}

export interface BarChartWidgetProps {
  series: BarSeriesConfig[]
  mode?: 'grouped' | 'stacked'
  dualAxis?: boolean
  leftUnit?: FieldUnitType
  rightUnit?: FieldUnitType
  horizontal?: boolean
}

const TOP_LIMIT = 10

// ── Tooltip customizado ───────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
  label?: string
  series: BarSeriesConfig[]
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

// ── Normalização de dados ─────────────────────────────────────────────────────

type NormalizedPoint = { name: string; [key: string]: number | string }

function buildChartData(series: BarSeriesConfig[]): NormalizedPoint[] {
  if (series.length === 0) return []

  const firstData = series[0].data

  // Formato de distribuição: Record<string, number>
  if (!Array.isArray(firstData)) {
    const allKeys = new Set<string>()
    for (const s of series) {
      if (!Array.isArray(s.data)) {
        Object.keys(s.data).forEach(k => allKeys.add(k))
      }
    }
    return [...allKeys]
      .map(name => {
        const point: NormalizedPoint = { name }
        for (const s of series) {
          if (!Array.isArray(s.data)) {
            point[s.fieldKey] = (s.data as Record<string, number>)[name] ?? 0
          }
        }
        return point
      })
      .sort((a, b) => {
        const sumA = series.reduce((acc, s) => acc + ((a[s.fieldKey] as number) ?? 0), 0)
        const sumB = series.reduce((acc, s) => acc + ((b[s.fieldKey] as number) ?? 0), 0)
        return sumB - sumA
      })
      .slice(0, TOP_LIMIT)
  }

  // Formato de série temporal: { month, value }[]
  const months = (firstData as Array<{ month: string; value: number }>).map(p => p.month)
  return months.map(month => {
    const point: NormalizedPoint = { name: month }
    for (const s of series) {
      if (Array.isArray(s.data)) {
        const found = (s.data as Array<{ month: string; value: number }>).find(p => p.month === month)
        point[s.fieldKey] = found?.value ?? 0
      }
    }
    return point
  })
}

// ── Configuração de eixo ──────────────────────────────────────────────────────

const axisStyle = {
  stroke: 'var(--text-muted)' as const,
  fontSize: 11,
  tick: { fill: 'var(--text-muted)' },
}

// ── Componente principal ──────────────────────────────────────────────────────

export function DashboardWidgetBarras({
  series,
  mode = 'grouped',
  dualAxis = false,
  leftUnit = 'number',
  rightUnit = 'number',
  horizontal = false,
}: BarChartWidgetProps) {
  if (series.length === 0) {
    return <div style={styles.empty}><span style={styles.emptyText}>Dados insuficientes</span></div>
  }

  const chartData = buildChartData(series)
  const isMulti = series.length > 1
  const stackId = mode === 'stacked' ? 'stack' : undefined

  const leftTickFormatter = (v: number) => formatValueByUnit(v, leftUnit)
  const rightTickFormatter = (v: number) => formatValueByUnit(v, rightUnit ?? leftUnit)

  const renderBars = () =>
    series.map((s, i) => {
      const color = s.color || SERIES_COLORS[i % SERIES_COLORS.length]
      return (
        <Bar
          key={s.fieldKey}
          dataKey={s.fieldKey}
          name={s.label}
          yAxisId={horizontal ? undefined : (dualAxis ? s.yAxisId : 'left')}
          fill={color}
          stackId={stackId}
          radius={mode === 'stacked' ? [0, 0, 0, 0] : (horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0])}
          maxBarSize={isMulti ? 24 : 40}
        >
          {/* Cores por célula apenas em modo mono-série */}
          {!isMulti && chartData.map((_entry, idx) => (
            <Cell key={`cell-${idx}`} fill={SERIES_COLORS[idx % SERIES_COLORS.length]} />
          ))}
        </Bar>
      )
    })

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 32)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 8, right: dualAxis ? 48 : 8 }}
        >
          <CartesianGrid stroke="var(--bg-elevated)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" {...axisStyle} tickFormatter={leftTickFormatter} />
          <YAxis type="category" dataKey="name" {...axisStyle} width={80} />
          {dualAxis && (
            <XAxis
              xAxisId="right"
              type="number"
              orientation="top"
              {...axisStyle}
              tickFormatter={rightTickFormatter}
            />
          )}
          <Tooltip content={<CustomTooltip series={series} />} />
          {isMulti && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)', paddingTop: '8px' }}
            />
          )}
          {renderBars()}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={120}>
      <BarChart
        data={chartData}
        margin={{ left: 0, right: dualAxis ? 48 : 8 }}
      >
        <CartesianGrid stroke="var(--bg-elevated)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" {...axisStyle} />
        <YAxis
          yAxisId="left"
          {...axisStyle}
          width={48}
          tickFormatter={leftTickFormatter}
        />
        {dualAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            {...axisStyle}
            width={48}
            tickFormatter={rightTickFormatter}
          />
        )}
        <Tooltip content={<CustomTooltip series={series} />} />
        {isMulti && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)', paddingTop: '8px' }}
          />
        )}
        {renderBars()}
      </BarChart>
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
