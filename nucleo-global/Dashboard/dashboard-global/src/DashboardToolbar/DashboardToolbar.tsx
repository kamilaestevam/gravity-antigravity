/**
 * DashboardToolbar — Barra de controles do dashboard
 *
 * Componente puro: recebe todo o estado via props, sem efeitos colaterais.
 * - Seletor de período
 * - Chips de status (configuráveis via statusOptions)
 * - Exibição de filtros ativos com botão limpar
 * - Botões de sugestões e adicionar widget (visíveis em editMode)
 * - Toggle de modo edição
 * - Banner de modo edição ativo com orientação ao usuário
 */

import React, { useState, useRef, useEffect } from 'react'
import { Sliders, Check, Plus, Lightbulb, X, DotsSixVertical, CaretDown, CaretUp } from '@phosphor-icons/react'
import type { ActiveFilter, GlobalSlicers } from '../tipos.js'

// ── PeriodDropdown — substitui <select> nativo (Design System: nunca select nativo) ──

interface PeriodDropdownProps {
  value: string
  options: PeriodOption[]
  onChange: (value: string) => void
}

function PeriodDropdown({ value, options, onChange }: PeriodDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        style={dropdownStyles.trigger}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected?.label}
        {open
          ? <CaretUp size={12} weight="bold" />
          : <CaretDown size={12} weight="bold" />}
      </button>
      {open && (
        <div style={dropdownStyles.list} role="listbox">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              style={{
                ...dropdownStyles.option,
                ...(opt.value === value ? dropdownStyles.optionActive : {}),
              }}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const dropdownStyles = {
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    padding: '5px 10px',
    cursor: 'pointer',
    outline: 'none',
    whiteSpace: 'nowrap' as const,
  },
  list: {
    position: 'absolute' as const,
    top: 'calc(100% + 4px)',
    left: 0,
    zIndex: 200,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    minWidth: '160px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  option: {
    display: 'block',
    width: '100%',
    padding: '7px 12px',
    background: 'none',
    border: 'none',
    textAlign: 'left' as const,
    fontSize: '13px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  optionActive: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
} as const

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
  /**
   * Cores ativas por status — override da cor accent padrão (indigo).
   * Ex: { atrasados: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#ef4444' } }
   */
  statusActiveColors?: Record<string, { bg: string; border: string; text: string }>
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
  statusActiveColors = {},
  periodOptions = DEFAULT_PERIOD_OPTIONS,
  onAddWidget,
  onSuggestionsOpen,
  className,
}: DashboardToolbarProps) {
  const s = styles

  return (
    <div style={s.wrapper}>

      {/* ── Banner de modo edição ────────────────────────────────────────── */}
      {editMode && (
        <div style={s.editBanner}>
          <span style={s.editBannerLeft}>
            <DotsSixVertical size={14} weight="bold" />
            Dashboard em modo edição — arraste widgets para reorganizar, clique em ⋯ para remover
          </span>
        </div>
      )}

      {/* ── Toolbar principal ────────────────────────────────────────────── */}
      <div style={s.toolbar} className={className}>

        {/* ── Período ─────────────────────────────────────────────────────── */}
        <div style={s.slicerGroup}>
          <span style={s.slicerLabel}>Período</span>
          <PeriodDropdown
            value={slicers.period}
            options={periodOptions}
            onChange={onPeriodChange}
          />
        </div>

        {/* ── Status chips (tabs-pill) ─────────────────────────────────── */}
        {statusOptions.length > 0 && (
          <div style={s.slicerGroup}>
          <span style={s.slicerLabel}>Status</span>
          <div style={s.statusChips}>
            {statusOptions.map(opt => {
              const active = slicers.status.includes(opt)
              const customColors = active ? statusActiveColors[opt] : undefined
              const chipStyle: React.CSSProperties = {
                ...s.chip,
                ...(active
                  ? customColors
                    ? { background: 'var(--bg-base)', color: customColors.text, boxShadow: 'var(--shadow-sm)' }
                    : s.chipActive
                  : {}),
              }
              return (
                <button
                  key={opt}
                  type="button"
                  style={chipStyle}
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
              <button type="button" style={s.btnGhost} onClick={onSuggestionsOpen}>
                <Lightbulb size={14} weight="duotone" /> Sugestões
              </button>
            )}
            {onAddWidget && (
              <button type="button" style={s.btnGhost} onClick={onAddWidget}>
                <Plus size={14} /> Adicionar widget
              </button>
            )}
          </>
        )}

        {/* ── Toggle edição ────────────────────────────────────────────────── */}
        <button
          type="button"
          style={editMode ? s.btnPrimaryStrong : s.btnGhost}
          onClick={() => onEditModeChange(!editMode)}
          title={editMode ? undefined : 'Adicione, remova e reorganize widgets livremente'}
        >
          {editMode
            ? <><Check size={14} weight="bold" /> Concluir edição</>
            : <><Sliders size={14} /> Personalizar dashboard</>
          }
        </button>

      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
    marginBottom: '1.25rem',
  },
  editBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 14px',
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '0.75rem',
  },
  editBannerLeft: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--accent)',
    fontWeight: 500,
  },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  slicerGroup: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  slicerLabel: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 },
  // tabs-pill container (Design System § 9)
  statusChips: {
    display: 'flex',
    gap: '0.25rem',
    padding: '0.25rem',
    background: 'var(--bg-surface)',
    borderRadius: '9999px',
  },
  // tab-pill item (Design System § 9)
  chip: {
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: '0.375rem 1rem',
    borderRadius: '9999px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  // tab-pill.active
  chipActive: {
    background: 'var(--bg-base)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-sm)',
  },
  activeFilters: { display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' as const },
  filterTag: {
    fontSize: '11px', padding: '2px 8px', borderRadius: '9999px',
    background: 'rgba(129,140,248,0.15)', color: 'var(--accent)',
    border: '1px solid var(--border-accent)',
  },
  clearBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', padding: '2px 8px', borderRadius: '9999px',
    background: 'transparent', border: '1px solid var(--border-default)',
    color: 'var(--text-muted)', cursor: 'pointer',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', padding: '6px 14px', borderRadius: '9999px',
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    color: 'var(--text-primary)', cursor: 'pointer',
  },
  btnPrimaryStrong: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', padding: '6px 16px', borderRadius: '9999px',
    background: 'var(--accent)', border: '1px solid var(--accent)',
    color: '#fff', cursor: 'pointer', fontWeight: 600,
    boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
  },
} as const
