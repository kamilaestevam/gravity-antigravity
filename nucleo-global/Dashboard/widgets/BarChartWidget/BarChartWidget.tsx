/**
 * BarChartWidget — Gráfico de barras usando Recharts
 *
 * Suporta orientação vertical e horizontal.
 * Aceita dados de distribuição: Record<string, number>.
 * Limita automaticamente a top 10 entradas.
 */

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { WidgetDataValue } from '../../tipos.js'

export interface BarChartWidgetProps {
  title: string
  data: Record<string, WidgetDataValue>
  fieldKey: string
  horizontal?: boolean
  color?: string
}

const CHART_COLORS = [
  'var(--accent)',
  '#34d399',
  '#f59e0b',
  '#f87171',
  '#60a5fa',
  '#a78bfa',
  '#fb923c',
  '#2dd4bf',
  '#e879f9',
  '#86efac',
]

function isDistribution(value: WidgetDataValue): value is Record<string, number> {
  return (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value !== null &&
    Object.values(value).every(v => typeof v === 'number')
  )
}

const TOP_LIMIT = 10

const tooltipStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'var(--text-primary)',
}

const axisStyle = {
  stroke: 'var(--text-muted)' as const,
  fontSize: 11,
  tick: { fill: 'var(--text-muted)' },
}

export function BarChartWidget({
  data,
  fieldKey,
  horizontal = false,
  color,
}: BarChartWidgetProps) {
  const raw = data[fieldKey]

  if (!isDistribution(raw)) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyText}>Dados insuficientes</span>
      </div>
    )
  }

  const chartData = Object.entries(raw)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_LIMIT)

  const primaryColor = color ?? CHART_COLORS[0]

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 32)}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid stroke="var(--bg-elevated)" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" {...axisStyle} />
          <YAxis type="category" dataKey="name" {...axisStyle} width={80} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ left: 0, right: 8 }}>
        <CartesianGrid stroke="var(--bg-elevated)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" {...axisStyle} />
        <YAxis {...axisStyle} width={40} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value" fill={primaryColor} radius={[4, 4, 0, 0]}>
          {chartData.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const styles = {
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '180px',
    color: 'var(--text-muted)',
  },
  emptyText: {
    fontSize: '13px',
  },
} as const
