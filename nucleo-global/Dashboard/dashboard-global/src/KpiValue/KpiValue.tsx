/**
 * KpiValue — Display de valor único formatado para cards KPI
 *
 * Componente puro: formata e exibe um valor numérico de acordo com seu tipo.
 * Usa formatValueByUnit do utilitário de eixos para consistência de formatação.
 */

import React from 'react'
import { ArrowUp, ArrowDown, Minus } from '@phosphor-icons/react'
import type { FieldUnitType, WidgetDataValue } from '../tipos.js'
import { formatValueByUnit } from '../utils/axisUtils.js'

export interface KpiValueProps {
  data: Record<string, WidgetDataValue>
  fieldKey: string
  fieldType?: FieldUnitType
  /** Delta absoluto em relação ao período anterior */
  delta?: number
  /** Delta percentual (0–100) */
  deltaPercent?: number
  /** Direção da variação */
  deltaDirection?: 'up' | 'down' | 'neutral'
}

export function KpiValue({
  data, fieldKey, fieldType = 'number',
  delta, deltaPercent, deltaDirection,
}: KpiValueProps) {
  const raw = data[fieldKey]
  const value: number | null =
    typeof raw === 'number' ? raw
    : typeof Object.values(data)[0] === 'number' ? Object.values(data)[0] as number
    : null

  if (value === null) {
    return <span style={styles.empty}>--</span>
  }

  const hasDelta = deltaDirection !== undefined && delta !== undefined

  return (
    <div style={styles.wrap}>
      <span style={styles.value}>{formatValueByUnit(value, fieldType)}</span>

      {hasDelta && (
        <span style={{ ...styles.badge, ...badgeVariant(deltaDirection!) }}>
          {deltaDirection === 'up'   && <ArrowUp   size={11} weight="bold" />}
          {deltaDirection === 'down' && <ArrowDown size={11} weight="bold" />}
          {deltaDirection === 'neutral' && <Minus size={11} weight="bold" />}
          {deltaPercent !== undefined
            ? `${Math.abs(deltaPercent).toFixed(1)}%`
            : formatValueByUnit(Math.abs(delta!), fieldType)
          }
        </span>
      )}
    </div>
  )
}

function badgeVariant(dir: 'up' | 'down' | 'neutral') {
  if (dir === 'up')   return { color: '#22c55e', background: 'rgba(34,197,94,0.12)',  border: '1px solid rgba(34,197,94,0.2)'  }
  if (dir === 'down') return { color: '#ef4444', background: 'rgba(239,68,68,0.12)',  border: '1px solid rgba(239,68,68,0.2)'  }
  return               { color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }
}

const styles = {
  wrap: {
    display: 'flex', alignItems: 'center', gap: '8px',
    minWidth: 0, overflow: 'hidden', flexWrap: 'wrap' as const,
  },
  value: {
    fontSize: 'clamp(1.5rem, 5cqw, 2.25rem)', fontWeight: 700,
    color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
    minWidth: 0, maxWidth: '100%', display: 'block',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '3px',
    fontSize: '11px', fontWeight: 600,
    borderRadius: '4px', padding: '2px 6px',
    whiteSpace: 'nowrap' as const, lineHeight: 1, marginBottom: '2px',
  },
  empty: { fontSize: '1.75rem', color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1 },
} as const
