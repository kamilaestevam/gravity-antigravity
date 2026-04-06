/**
 * TableWidget — Tabela de dados usando TabelaGlobal
 *
 * Aceita distribuição (Record<string, number>) ou array de objetos.
 * Gera colunas automaticamente a partir do primeiro item.
 * Limite de 10 linhas por padrão.
 */

import React from 'react'
import { TabelaGlobal } from '@nucleo/tabela-global'
import type { TabelaGlobalColuna } from '@nucleo/tabela-global'
import type { WidgetDataValue } from '../../tipos.js'

export interface TableWidgetProps {
  title: string
  data: Record<string, WidgetDataValue>
  fieldKey: string
  columns?: Array<{ key: string; label: string; tipo?: 'texto' | 'numero' }>
}

// Tipos internos para linhas geradas dinamicamente
type DistRow = { id: string; label: string; valor: number }
type GenericRow = { id: string } & Record<string, unknown>

function isDistribution(value: WidgetDataValue): value is Record<string, number> {
  return (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value !== null &&
    Object.values(value).every(v => typeof v === 'number')
  )
}

function isObjectArray(value: WidgetDataValue): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object'
}

const DEFAULT_PAGE_SIZE = 10

export function TableWidget({
  data,
  fieldKey,
  columns,
}: TableWidgetProps) {
  const raw = data[fieldKey]

  // Caso 1: distribuição Record<string, number>
  if (isDistribution(raw)) {
    const rows: DistRow[] = Object.entries(raw)
      .slice(0, DEFAULT_PAGE_SIZE)
      .map(([label, valor], i) => ({ id: String(i), label, valor }))

    const colunas: TabelaGlobalColuna<DistRow>[] = [
      { key: 'label', label: 'Categoria', tipo: 'texto' },
      { key: 'valor', label: 'Valor', tipo: 'numero' },
    ]

    return (
      <TabelaGlobal<DistRow>
        dados={rows}
        colunas={colunas}
        itensPorPagina={DEFAULT_PAGE_SIZE}
        mensagemVazio="Sem dados para exibir"
      />
    )
  }

  // Caso 2: array de objetos
  if (isObjectArray(raw)) {
    const limited = raw.slice(0, DEFAULT_PAGE_SIZE)

    // Adiciona id sintético se não houver
    const rows: GenericRow[] = limited.map((item, i) => ({
      id: String((item as Record<string, unknown>).id ?? i),
      ...item,
    }))

    // Gera colunas a partir das chaves do primeiro item,
    // sobrescrevendo com `columns` prop se fornecido
    const firstItem = rows[0]
    const autoKeys = firstItem
      ? Object.keys(firstItem).filter(k => k !== 'id')
      : []

    const colunas: TabelaGlobalColuna<GenericRow>[] = columns
      ? columns.map(c => ({
          key: c.key as keyof GenericRow & string,
          label: c.label,
          tipo: (c.tipo ?? 'texto') as 'texto' | 'numero' | 'periodo',
        }))
      : autoKeys.map(k => ({
          key: k as keyof GenericRow & string,
          label: k.charAt(0).toUpperCase() + k.slice(1),
          tipo: 'texto' as const,
        }))

    return (
      <TabelaGlobal<GenericRow>
        dados={rows}
        colunas={colunas}
        itensPorPagina={DEFAULT_PAGE_SIZE}
        mensagemVazio="Sem dados para exibir"
      />
    )
  }

  return (
    <div style={styles.empty}>
      <span style={styles.emptyText}>Dados insuficientes</span>
    </div>
  )
}

const styles = {
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
