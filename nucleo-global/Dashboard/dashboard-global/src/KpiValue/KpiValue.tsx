/**
 * KpiValue — Display de valor único formatado para cards KPI
 *
 * Componente puro: formata e exibe um valor numérico de acordo com seu tipo.
 * Usa formatValueByUnit do utilitário de eixos para consistência de formatação.
 */

import React from 'react'
import type { FieldUnitType, WidgetDataValue } from '../tipos.js'
import { formatValueByUnit } from '../utils/axisUtils.js'

export interface KpiValueProps {
  data: Record<string, WidgetDataValue>
  fieldKey: string
  fieldType?: FieldUnitType
}

export function KpiValue({ data, fieldKey, fieldType = 'number' }: KpiValueProps) {
  const raw = data[fieldKey]
  const value: number | null =
    typeof raw === 'number' ? raw
    : typeof Object.values(data)[0] === 'number' ? Object.values(data)[0] as number
    : null

  if (value === null) {
    return <span style={styles.empty}>--</span>
  }

  return (
    <div style={styles.wrap}>
      <span style={styles.value}>{formatValueByUnit(value, fieldType)}</span>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex', alignItems: 'center', height: '100%',
    padding: '0.25rem 0', minWidth: 0, overflow: 'hidden',
  },
  value: {
    fontSize: 'clamp(1rem, 4cqw, 1.75rem)', fontWeight: 700,
    color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
    minWidth: 0, maxWidth: '100%', display: 'block',
  },
  empty: { fontSize: '1.5rem', color: 'var(--text-muted)' },
} as const
