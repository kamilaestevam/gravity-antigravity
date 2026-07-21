/**
 * Valor KPI do Dashboard BID Frete (simulador marketing) — USD e % como no produto real.
 */

import { ArrowDown, ArrowUp, Minus } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import type { FieldUnitType, WidgetDataValue } from '../../../Dashboard/dashboard-global/src/index'
import type { KpiValueProps } from '../../../Dashboard/dashboard-global/src/index'

const CAMPOS_MOEDA_USD = new Set([
  'saving_total',
  'valor_medio_ganho_bid_frete_internacional',
  'valor_aprovado_usd',
  'valor_andamento_usd',
])

function formatarValorKpiBidFreteSimulador(
  value: number,
  fieldKey: string,
  fieldType: FieldUnitType,
): string {
  if (fieldKey === 'ganho_percentual_ganho_bid_frete_internacional' || fieldType === 'percentage') {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
  }
  if (CAMPOS_MOEDA_USD.has(fieldKey) || fieldType === 'currency') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)
}

function badgeVariant(dir: 'up' | 'down' | 'neutral') {
  if (dir === 'up') return { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }
  if (dir === 'down') return { color: '#ef4444', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }
  return { color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column' as const,
    gap: '4px',
    minWidth: 0,
    overflow: 'hidden',
  },
  deltaWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap' as const,
  },
  deltaLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: 400,
    letterSpacing: '0.02em',
  },
  value: {
    fontSize: '48px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.03em',
    lineHeight: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    minWidth: 0,
    maxWidth: '100%',
    display: 'block',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '14px',
    fontWeight: 600,
    borderRadius: '4px',
    padding: '2px 6px',
    whiteSpace: 'nowrap' as const,
    lineHeight: 1,
    marginBottom: '2px',
  },
  empty: { fontSize: '1.75rem', color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1 },
} as const

export function ValorKpiSimuladorBidFrete({
  data,
  fieldKey,
  fieldType = 'number',
  delta,
  deltaPercent,
  deltaDirection,
}: KpiValueProps) {
  const { t } = useTranslation()
  const raw = data[fieldKey]
  const value: number | null =
    typeof raw === 'number'
      ? raw
      : typeof Object.values(data)[0] === 'number'
        ? (Object.values(data)[0] as number)
        : null

  if (value === null) {
    return <span style={styles.empty}>--</span>
  }

  const hasDelta = deltaDirection !== undefined && delta !== undefined

  return (
    <div style={styles.wrap}>
      <span className="db-kpi-value" style={styles.value}>
        {formatarValorKpiBidFreteSimulador(value, fieldKey, fieldType)}
      </span>
      {hasDelta ? (
        <div style={styles.deltaWrap}>
          <span style={{ ...styles.badge, ...badgeVariant(deltaDirection!) }}>
            {deltaDirection === 'up' && <ArrowUp size={14} weight="bold" />}
            {deltaDirection === 'down' && <ArrowDown size={14} weight="bold" />}
            {deltaDirection === 'neutral' && <Minus size={14} weight="bold" />}
            {deltaPercent !== undefined
              ? `${Math.abs(deltaPercent).toFixed(1)}%`
              : formatarValorKpiBidFreteSimulador(Math.abs(delta!), fieldKey, fieldType)}
          </span>
          <span style={styles.deltaLabel}>{t('nucleo.dashboard.kpi.vs_periodo_anterior')}</span>
        </div>
      ) : null}
    </div>
  )
}
