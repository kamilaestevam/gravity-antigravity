/**
 * DashboardToolbar — Barra de controles do dashboard
 *
 * Componente puro: recebe todo o estado via props, sem efeitos colaterais.
 * - Seletor de período
 * - Chips de status (configuráveis via statusOptions)
 * - Exibição de filtros ativos com botão limpar
 * - Botões de sugestões e adicionar widget (visíveis em editMode)
 * - Toggle de modo edição
 */

import React from 'react'
import { PencilSimple, Check, Plus, Lightbulb, X } from '@phosphor-icons/react'
import type { ActiveFilter, GlobalSlicers } from '../tipos.js'

export interface PeriodOption {
  value: string
  label: string
}

const DEFAULT_PERIOD_OPTIONS: PeriodOption[] = [
  { value: '7d',            label: 'Últimos 7 dias'  },
  { value: '30d',           label: 'Últimos 30 dias' },
  { value: '90d',           label: 'Últimos 90 dias' },
  { value: '12m',           label: 'Últimos 12 meses'},
  { value: 'current_month', label: 'Mês atual'       },
  { value: 'current_year',  label: 'Ano atual'       },
]

export interface DashboardToolbarProps {
  slicers: GlobalSlicers
  onPeriodChange: (period: string) => void
  onStatusChange: (status: string[]) => void
  activeFilters: ActiveFilter[]
  onClearFilters: () => void
  editMode: boolean
  onEditModeChange: (v: boolean) => void
  /** Opções de status renderizadas como chips. Se vazio, seção de status é omitida. */
  statusOptions?: string[]
  /** Labels customizadas para cada status (ex: { abertos: 'Abertos' }). */
  statusLabels?: Record<string, string>
  /** Opções de período. Padrão: 7d / 30d / 90d / 12m / mês atual / ano atual. */
  periodOptions?: PeriodOption[]
  /** Mostra botão "Adicionar widget" no modo edição. */
  onAddWidget?: () => void
  /** Mostra botão "Sugestões" no modo edição. */
  onSuggestionsOpen?: () => void
  className?: string
}

export function DashboardToolbar({
  slicers,
  onPeriodChange,
  onStatusChange,
  activeFilters,
  onClearFilters,
  editMode,
  onEditModeChange,
  statusOptions = [],
  statusLabels = {},
  periodOptions = DEFAULT_PERIOD_OPTIONS,
  onAddWidget,
  onSuggestionsOpen,
  className,
}: DashboardToolbarProps) {
  const s = styles

  return (
    <div style={s.toolbar} className={className}>

      {/* ── Período ─────────────────────────────────────────────────────── */}
      <div style={s.slicerGroup}>
        <span style={s.slicerLabel}>Período</span>
        <select
          value={slicers.period}
          onChange={e => onPeriodChange(e.target.value)}
          style={s.select}
        >
          {periodOptions.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* ── Status chips ────────────────────────────────────────────────── */}
      {statusOptions.length > 0 && (
        <div style={s.slicerGroup}>
          <span style={s.slicerLabel}>Status</span>
          <div style={s.statusChips}>
            {statusOptions.map(opt => {
              const active = slicers.status.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  style={{ ...s.chip, ...(active ? s.chipActive : {}) }}
                  onClick={() =>
                    onStatusChange(
                      active
                        ? slicers.status.filter(x => x !== opt)
                        : [...slicers.status, opt],
                    )
                  }
                >
                  {statusLabels[opt] ?? opt.replace(/_/g, ' ')}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Filtros ativos ───────────────────────────────────────────────── */}
      {activeFilters.length > 0 && (
        <div style={s.activeFilters}>
          <span style={s.slicerLabel}>Filtros ativos:</span>
          {activeFilters.map(f => (
            <span key={`${f.field}-${f.sourceWidgetId}`} style={s.filterTag}>
              {f.label}
            </span>
          ))}
          <button type="button" style={s.clearBtn} onClick={onClearFilters}>
            <X size={12} /> Limpar
          </button>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* ── Ações do modo edição ─────────────────────────────────────────── */}
      {editMode && (
        <>
          {onSuggestionsOpen && (
            <button type="button" style={s.btnSecondary} onClick={onSuggestionsOpen}>
              <Lightbulb size={14} weight="duotone" /> Sugestões
            </button>
          )}
          {onAddWidget && (
            <button type="button" style={s.btnSecondary} onClick={onAddWidget}>
              <Plus size={14} /> Adicionar widget
            </button>
          )}
        </>
      )}

      {/* ── Toggle edição ────────────────────────────────────────────────── */}
      <button
        type="button"
        style={editMode ? s.btnPrimary : s.btnSecondary}
        onClick={() => onEditModeChange(!editMode)}
      >
        {editMode
          ? <><Check size={14} /> Concluir edição</>
          : <><PencilSimple size={14} /> Editar dashboard</>
        }
      </button>

    </div>
  )
}

const styles = {
  toolbar: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    marginBottom: '1.25rem', flexWrap: 'wrap' as const,
  },
  slicerGroup: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  slicerLabel: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 },
  select: {
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
    fontSize: '13px', padding: '5px 10px', cursor: 'pointer', outline: 'none',
  },
  statusChips: { display: 'flex', gap: '0.375rem' },
  chip: {
    fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '999px',
    border: '1px solid var(--border-default)', background: 'transparent',
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  chipActive: {
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    color: 'var(--accent)',
  },
  activeFilters: { display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' as const },
  filterTag: {
    fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
    background: 'rgba(129,140,248,0.15)', color: 'var(--accent)',
    border: '1px solid var(--border-accent)',
  },
  clearBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
    background: 'transparent', border: '1px solid var(--border-default)',
    color: 'var(--text-muted)', cursor: 'pointer',
  },
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', padding: '6px 14px', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    color: 'var(--text-primary)', cursor: 'pointer',
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', padding: '6px 14px', borderRadius: 'var(--radius-md)',
    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
    color: 'var(--accent)', cursor: 'pointer', fontWeight: 600,
  },
} as const
