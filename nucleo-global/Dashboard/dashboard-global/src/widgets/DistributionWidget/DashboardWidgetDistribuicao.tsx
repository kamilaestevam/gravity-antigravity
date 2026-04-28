/**
 * DashboardWidgetDistribuicao — Gráfico donut para distribuição multi-campo
 *
 * Cada campo selecionado = uma fatia.
 * Todos os campos devem ter a mesma unidade (enforced pelo DashboardConstrutorConsulta).
 * Fatias com value === 0 são ocultadas.
 * Tooltip: label + valor absoluto + percentagem do total.
 */

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { WidgetDistributionSlice } from '../../tipos.js'
import { formatValueByUnit, SERIES_COLORS } from '../../utils/axisUtils.js'

export interface DistributionWidgetProps {
  slices: WidgetDistributionSlice[]
}

// ── Tooltip customizado ───────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: WidgetDistributionSlice & { percentage: number } }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div style={tooltipStyles.box}>
      <p style={tooltipStyles.label}>{item.label}</p>
      <p style={tooltipStyles.value}>{formatValueByUnit(item.value, item.unit)}</p>
      <p style={tooltipStyles.pct}>{item.percentage.toFixed(1)}% do total</p>
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
  },
  label: { margin: '0 0 4px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '11px' },
  value: { margin: '0 0 2px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' },
  pct: { margin: 0, color: 'var(--text-muted)', fontSize: '11px' },
} as const

// ── Componente principal ──────────────────────────────────────────────────────

export function DashboardWidgetDistribuicao({ slices }: DistributionWidgetProps) {
  // Ocultar fatias com valor zero
  const visibleSlices = slices.filter(s => s.value > 0)

  if (visibleSlices.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyText}>Sem dados para distribuir</span>
      </div>
    )
  }

  const total = visibleSlices.reduce((sum, s) => sum + s.value, 0)

  const chartData = visibleSlices.map((s, i) => ({
    ...s,
    percentage: total > 0 ? (s.value / total) * 100 : 0,
    fill: s.value > 0 ? SERIES_COLORS[i % SERIES_COLORS.length] : 'transparent',
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius="38%"
          outerRadius="62%"
          paddingAngle={2}
          dataKey="value"
          nameKey="label"
        >
          {chartData.map((entry, i) => (
            <Cell key={entry.key} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = {
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '180px',
    color: 'var(--text-muted)',
  },
  emptyText: { fontSize: '13px' },
} as const
