/**
 * DonutWidget — Donut chart reutilizando CardGraficoGlobal
 *
 * Aceita distribuição (Record<string, number>), calcula total e maior valor,
 * e delega renderização ao CardGraficoGlobal do design system.
 */

import React from 'react'
import { CardGraficoGlobal } from '@nucleo/card-global'
import type { WidgetDataValue } from '../../tipos.js'

export interface DonutWidgetProps {
  title: string
  data: Record<string, WidgetDataValue>
  fieldKey: string
}

const CORES = [
  'var(--accent)',
  '#34d399',
  '#f59e0b',
  '#f87171',
  '#60a5fa',
  '#a78bfa',
  '#fb923c',
]

function isDistribution(value: WidgetDataValue): value is Record<string, number> {
  return (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value !== null &&
    Object.values(value).every(v => typeof v === 'number')
  )
}

export function DonutWidget({ title, data, fieldKey }: DonutWidgetProps) {
  const raw = data[fieldKey]

  if (!isDistribution(raw)) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyText}>Dados insuficientes</span>
      </div>
    )
  }

  const entries = Object.entries(raw)
  const total = entries.reduce((acc, [, val]) => acc + val, 0)

  const legenda = entries.map(([label, valor], i) => ({
    label,
    valor,
    cor: CORES[i % CORES.length] as 'green' | 'yellow' | 'red',
  }))

  const maiorValor = entries.reduce(
    (max, [, val]) => (val > max ? val : max),
    0,
  )

  return (
    <CardGraficoGlobal
      titulo={title}
      total={total}
      valorPrincipal={maiorValor}
      legenda={legenda}
    />
  )
}

const styles = {
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '140px',
    color: 'var(--text-muted)',
  },
  emptyText: {
    fontSize: '13px',
  },
} as const
