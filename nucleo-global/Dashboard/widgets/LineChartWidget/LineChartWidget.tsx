/**
 * LineChartWidget — Gráfico de linha/área usando Recharts
 *
 * Aceita dados de série temporal no formato { month, value }[].
 * Suporta modo área (showArea) para preenchimento sob a linha.
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
  ResponsiveContainer,
} from 'recharts'
import type { WidgetDataValue } from '../../tipos.js'

export interface LineChartWidgetProps {
  title: string
  data: Record<string, WidgetDataValue>
  fieldKey: string
  color?: string
  showArea?: boolean
}

type TrendPoint = { month: string; value: number }

function isTrendArray(value: WidgetDataValue): value is TrendPoint[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof (value[0] as TrendPoint).month === 'string' &&
    typeof (value[0] as TrendPoint).value === 'number'
  )
}

const MONTH_ABBR: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

function formatMonth(month: string): string {
  // Suporta "2026-01" → "Jan"
  const parts = month.split('-')
  const monthNum = parts[1] ?? month
  return MONTH_ABBR[monthNum] ?? month
}

const tooltipStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'var(--text-primary)',
}

export function LineChartWidget({
  data,
  fieldKey,
  color,
  showArea = false,
}: LineChartWidgetProps) {
  const raw = data[fieldKey]

  if (!isTrendArray(raw)) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyText}>Dados insuficientes</span>
      </div>
    )
  }

  const chartData = raw.map(pt => ({
    month: formatMonth(pt.month),
    value: pt.value,
  }))

  const lineColor = color ?? 'var(--accent)'
  const axisProps = {
    stroke: 'var(--text-muted)' as const,
    fontSize: 11,
    tick: { fill: 'var(--text-muted)' },
  }

  if (showArea) {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="db-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--bg-elevated)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} width={40} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            fill="url(#db-area-gradient)"
            dot={false}
            activeDot={{ r: 4, fill: lineColor }}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData}>
        <CartesianGrid stroke="var(--bg-elevated)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} width={40} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: lineColor }}
        />
      </LineChart>
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
