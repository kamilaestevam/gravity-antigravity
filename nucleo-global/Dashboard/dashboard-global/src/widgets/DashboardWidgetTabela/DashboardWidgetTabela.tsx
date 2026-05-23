/**
 * DashboardWidgetTabela — Tabela de dados simples.
 * Aceita distribuição (Record<string, number>) ou array de objetos.
 * Gera colunas automaticamente a partir do primeiro item.
 * Limite de 10 linhas por padrão.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import type { WidgetDataValue } from '../../tipos.js'

export interface TableWidgetProps {
  title: string
  data: Record<string, WidgetDataValue>
  fieldKey: string
  columns?: Array<{ key: string; label: string; tipo?: 'texto' | 'numero' }>
}

type DistRow = { id: string; label: string; valor: number }
type GenericRow = { id: string } & Record<string, unknown>

function isDistribution(value: WidgetDataValue): value is Record<string, number> {
  return (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value !== null &&
    Object.values(value as Record<string, unknown>).every(v => typeof v === 'number')
  )
}

function isObjectArray(value: WidgetDataValue): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object'
}

const DEFAULT_PAGE_SIZE = 10

function SimpleTable({
  colunas,
  rows,
  mensagemVazio,
}: {
  colunas: Array<{ key: string; label: string }>
  rows: Array<Record<string, unknown>>
  mensagemVazio: string
}) {
  if (rows.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyText}>{mensagemVazio}</span>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            {colunas.map(col => (
              <th key={col.key} style={styles.th}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={String(row.id)}>
              {colunas.map(col => (
                <td key={col.key} style={styles.td}>
                  {row[col.key] != null ? String(row[col.key]) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DashboardWidgetTabela({ data, fieldKey, columns }: TableWidgetProps) {
  const { t } = useTranslation()
  const raw = data[fieldKey]

  if (isDistribution(raw)) {
    const rows: DistRow[] = Object.entries(raw)
      .slice(0, DEFAULT_PAGE_SIZE)
      .map(([label, valor], i) => ({ id: String(i), label, valor }))

    return (
      <SimpleTable
        colunas={[
          { key: 'label', label: t('nucleo.dashboard.widgets.tabela.categoria') },
          { key: 'valor', label: t('nucleo.dashboard.widgets.tabela.valor') },
        ]}
        rows={rows}
        mensagemVazio={t('nucleo.dashboard.widgets.tabela.sem_dados')}
      />
    )
  }

  if (isObjectArray(raw)) {
    const rows: GenericRow[] = raw
      .slice(0, DEFAULT_PAGE_SIZE)
      .map((item, i) => ({ id: String((item as Record<string, unknown>).id ?? i), ...item }))

    const firstItem = rows[0]
    const autoKeys = firstItem ? Object.keys(firstItem).filter(k => k !== 'id') : []

    const colunas = columns
      ? columns.map(c => ({ key: c.key, label: c.label }))
      : autoKeys.map(k => ({ key: k, label: k.charAt(0).toUpperCase() + k.slice(1) }))

    return (
      <SimpleTable
        colunas={colunas}
        rows={rows}
        mensagemVazio={t('nucleo.dashboard.widgets.tabela.sem_dados')}
      />
    )
  }

  return (
    <div style={styles.empty}>
      <span style={styles.emptyText}>{t('nucleo.dashboard.widgets.dados_insuficientes')}</span>
    </div>
  )
}

const styles = {
  wrapper: {
    overflowX: 'auto' as const,
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.8125rem',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  th: {
    padding: '0.5rem 0.75rem',
    textAlign: 'left' as const,
    fontWeight: 700,
    fontSize: '0.6875rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: 'var(--text-muted, #94a3b8)',
    borderBottom: '1px solid var(--ws-accent-border, rgba(129,140,248,0.12))',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '0.4375rem 0.75rem',
    color: 'var(--text-primary, #f1f5f9)',
    borderBottom: '1px solid var(--ws-accent-border, rgba(129,140,248,0.06))',
    whiteSpace: 'nowrap' as const,
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '120px',
    color: 'var(--text-muted)',
  },
  emptyText: {
    fontSize: '13px',
  },
} as const
