/**
 * DashboardToolbar — Barra de controles do dashboard
 *
 * Componente puro: recebe todo o estado via props, sem efeitos colaterais.
 * - Seletor de período (separado dos chips por divisor vertical)
 * - Chip "Todos" automático + chips de status configuráveis via statusOptions
 * - Contagens opcionais nos chips via statusCounts (ex: "Abertos (6)")
 * - Chips com count=0 aparecem desabilitados (opacity 0.5, não clicáveis)
 * - Exibição de filtros ativos com botão limpar
 * - Botões de sugestões e adicionar widget (visíveis em editMode)
 * - Toggle de modo edição: ghost no estado padrão, primário ao editar
 * - Banner de modo edição ativo com orientação ao usuário
 */

import React, { useState, useRef, useEffect } from 'react'
import { Check, Plus, X, DotsSixVertical, CaretDown, CaretUp, CalendarBlank } from '@phosphor-icons/react'
import { CalendarioPainelGlobal } from '@nucleo/campo-calendario-global'
import type { ActiveFilter, GlobalSlicers } from '../tipos.js'

// ── Helpers de período customizado ────────────────────────────────────────────

const MONTH_NAMES_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function formatCustomLabel(period: string): string {
  if (!period.startsWith('custom:')) return period
  const [, start, end] = period.split(':')
  if (!start || !end) return 'Período personalizado'
  const fmt = (d: string) => {
    const [y, m, day] = d.split('-')
    return `${parseInt(day)} ${MONTH_NAMES_SHORT[parseInt(m) - 1]} ${y}`
  }
  return `${fmt(start)} – ${fmt(end)}`
}

function parseCustomPeriod(period: string): { start: string; end: string } | undefined {
  if (!period.startsWith('custom:')) return undefined
  const [, start, end] = period.split(':')
  return start && end ? { start, end } : undefined
}

// ── PeriodDropdown — substitui <select> nativo (Design System: nunca select nativo) ──

interface PeriodDropdownProps {
  value: string
  options: PeriodOption[]
  onChange: (value: string) => void
}

// PeriodDropdown excede 50 linhas por necessidade: gerencia dois modos mutuamente
// exclusivos (lista de opções e calendário inline) com estado compartilhado. Decompor
// quebraria o closure que une open/showCal/ref sem prop drilling desnecessário.
function PeriodDropdown({ value, options, onChange }: PeriodDropdownProps) {
  const [open, setOpen] = useState(false)
  const [showCal, setShowCal] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Suporte a período customizado: custom:YYYY-MM-DD:YYYY-MM-DD
  const isCustom = value.startsWith('custom:')
  const selectedLabel = isCustom
    ? formatCustomLabel(value)
    : (options.find(o => o.value === value) ?? options[0])?.label

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setShowCal(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleOptionClick(optValue: string) {
    if (optValue === 'custom') {
      setShowCal(true)   // abre o calendário sem fechar o dropdown
    } else {
      onChange(optValue)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        style={dropdownStyles.trigger}
        onClick={() => { setOpen(v => !v); setShowCal(false) }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {isCustom && <CalendarBlank size={12} weight="bold" />}
        {selectedLabel}
        {open
          ? <CaretUp size={12} weight="bold" />
          : <CaretDown size={12} weight="bold" />}
      </button>

      {/* Lista de opções */}
      {open && !showCal && (
        <div style={dropdownStyles.list} role="listbox">
          {options.map((opt, idx) => (
            <React.Fragment key={opt.value}>
              {/* Separador visual antes de "Período personalizado" */}
              {opt.value === 'custom' && (
                <div style={dropdownStyles.separator} role="separator" />
              )}
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value || (isCustom && opt.value === 'custom')}
                style={{
                  ...dropdownStyles.option,
                  ...((opt.value === value || (isCustom && opt.value === 'custom'))
                    ? dropdownStyles.optionActive
                    : {}),
                }}
                onClick={() => handleOptionClick(opt.value)}
              >
                {opt.value === 'custom' && <CalendarBlank size={12} />}
                {opt.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Calendário de período personalizado — painel inline sem trigger */}
      {open && showCal && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300 }}>
          <CalendarioPainelGlobal
            valor={(() => {
              const parsed = parseCustomPeriod(value)
              return parsed
                ? { inicio: new Date(parsed.start), fim: new Date(parsed.end) }
                : { inicio: null, fim: null }
            })()}
            aoMudarValor={(val: { inicio: Date | null; fim: Date | null }) => {
              if (val.inicio && val.fim) {
                const s = val.inicio.toISOString().slice(0, 10)
                const e = val.fim.toISOString().slice(0, 10)
                onChange(`custom:${s}:${e}`)
                setOpen(false)
                setShowCal(false)
              }
            }}
            onFechar={() => { setShowCal(false); setOpen(false) }}
          />
        </div>
      )}
    </div>
  )
}

const dropdownStyles = {
  // Design System § 3: btn-secondary — pill obrigatório, bg-surface + border bg-elevated
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-pill)',   // OBRIGATÓRIO — Design System: sempre pill
    color: 'var(--text-primary)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    padding: '0.375rem 0.875rem',
    cursor: 'pointer',
    outline: 'none',
    whiteSpace: 'nowrap' as const,
  },
  list: {
    position: 'absolute' as const,
    top: 'calc(100% + 6px)',
    left: 0,
    zIndex: 200,
    background: 'var(--bg-surface)',
    border: '1px solid var(--bg-elevated)',
    borderRadius: 'var(--radius-lg)',     // lista usa radius-lg, não pill
    boxShadow: 'var(--shadow-md)',
    minWidth: '168px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    padding: '7px 14px',
    background: 'none',
    border: 'none',
    textAlign: 'left' as const,
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  optionActive: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  separator: {
    height: '1px',
    background: 'var(--bg-elevated)',
    margin: '4px 0',
  },
} as const

export interface PeriodOption {
  value: string
  label: string
}

const DEFAULT_PERIOD_OPTIONS: PeriodOption[] = [
  { value: '7d',            label: 'Últimos 7 dias'       },
  { value: '30d',           label: 'Últimos 30 dias'      },
  { value: '90d',           label: 'Últimos 90 dias'      },
  { value: '12m',           label: 'Últimos 12 meses'     },
  { value: 'current_month', label: 'Mês atual'            },
  { value: 'current_year',  label: 'Ano atual'            },
  { value: 'custom',        label: 'Período personalizado'},
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
  /**
   * Contagens exibidas dentro de cada chip (ex: { abertos: 6, atrasados: 0 }).
   * - Quando fornecido, renderiza "(n)" ao lado do label.
   * - Chip com count=0 fica desabilitado (opacity 0.5, não clicável).
   * - Aceitar também a chave especial "todos" para o chip Todos.
   */
  statusCounts?: Record<string, number>
  /**
   * Modo compacto para Status: substitui os chips pill por um dropdown customizado.
   * Usar em viewports < 1200px via useWindowSize no componente pai.
   */
  compactStatus?: boolean
  /** Opções de período. Padrão: 7d / 30d / 90d / 12m / mês atual / ano atual. */
  periodOptions?: PeriodOption[]
  /** Mostra botão "Adicionar widget" no modo edição. */
  onAddWidget?: () => void
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
  statusCounts,
  compactStatus = false,
  periodOptions = DEFAULT_PERIOD_OPTIONS,
  onAddWidget,
  className,
}: DashboardToolbarProps) {
  const s = styles

  // "Todos" está ativo quando nenhum status específico está selecionado
  const isTodosActive = slicers.status.length === 0

  return (
    <div style={s.wrapper}>

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

        {/* ── Status chips ou dropdown compacto (T-09) ───────────────── */}
        {statusOptions.length > 0 && (
          <>
            {/* Divisor vertical entre Período e Status (T-01) */}
            <div style={s.divider} aria-hidden="true" />

            {compactStatus
              ? /* ── Modo compacto: dropdown customizado (viewports estreitos) ── */
                <div style={{ position: 'relative' }} data-testid="status-compact-dropdown">
                  <PeriodDropdown
                    value={slicers.status[0] ?? '__todos__'}
                    options={[
                      { value: '__todos__', label: 'Todos os status' },
                      ...statusOptions.map(opt => ({
                        value: opt,
                        label: `${statusLabels[opt] ?? opt.replace(/_/g, ' ')}${statusCounts?.[opt] !== undefined ? ` (${statusCounts[opt]})` : ''}`,
                      })),
                    ]}
                    onChange={(val) => onStatusChange(val === '__todos__' ? [] : [val])}
                  />
                </div>
              : /* ── Modo padrão: chips pill ───────────────────────────────────── */
                <div style={s.statusChips} data-testid="status-chips-container">
                  {/* Chip "Todos" — ativo quando nenhum filtro de status selecionado (T-03) */}
                  <button
                    type="button"
                    style={{
                      ...s.chip,
                      ...(isTodosActive ? s.chipActive : {}),
                    }}
                    onClick={() => onStatusChange([])}
                    data-testid="status-chip-todos"
                  >
                    Todos
                    {statusCounts !== undefined && (
                      <span style={s.chipCount}>
                        ({statusCounts['todos'] ?? Object.values(statusCounts).reduce((a, b) => a + b, 0)})
                      </span>
                    )}
                  </button>

                  {statusOptions.map(opt => {
                    const active = slicers.status.includes(opt)
                    const customColors = active ? statusActiveColors[opt] : undefined
                    const count = statusCounts?.[opt]
                    const isDisabled = statusCounts !== undefined && count === 0

                    const chipStyle: React.CSSProperties = {
                      ...s.chip,
                      ...(active
                        ? customColors
                          ? { background: 'var(--bg-base)', color: customColors.text, boxShadow: 'var(--shadow-sm)' }
                          : s.chipActive
                        : {}),
                      ...(isDisabled ? s.chipDisabled : {}),
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        style={chipStyle}
                        aria-disabled={isDisabled}
                        data-testid={`status-chip-${opt}`}
                        onClick={() => {
                          if (isDisabled) return
                          onStatusChange(
                            active
                              ? slicers.status.filter(x => x !== opt)
                              : [...slicers.status, opt],
                          )
                        }}
                      >
                        {statusLabels[opt] ?? opt.replace(/_/g, ' ')}
                        {statusCounts !== undefined && count !== undefined && (
                          <span style={s.chipCount}>({count})</span>
                        )}
                      </button>
                    )
                  })}
                </div>
            }
          </>
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

        {/* ── Cluster de ações — sempre visíveis ──────────────────────────── */}
        {onAddWidget && (
          <button
            type="button"
            style={s.btnSecondary}
            onClick={onAddWidget}
            data-testid="btn-adicionar-dashboard"
          >
            <Plus size={14} weight="bold" /> Adicionar Dashboard
          </button>
        )}

        {/* ── Toggle reorganizar: secondary → accent quando ativo ──────────── */}
        <button
          type="button"
          style={editMode ? s.btnPrimaryStrong : s.btnSecondary}
          onClick={() => onEditModeChange(!editMode)}
          data-testid="btn-reorganizar"
          title={editMode ? undefined : 'Arraste e reorganize os widgets'}
        >
          {editMode
            ? <><Check size={14} weight="bold" /> Concluir</>
            : <><DotsSixVertical size={14} weight="bold" /> Reorganizar</>
          }
        </button>

      </div>

      {/* ── Hint de modo reorganização ─────────────────────────────────── */}
      {editMode && (
        <div style={s.editHint}>
          <DotsSixVertical size={13} weight="bold" />
          Arraste os widgets para reorganizar. Clique em <strong>Concluir</strong> para salvar.
        </div>
      )}
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
  toolbar: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    flexWrap: 'wrap' as const,
  },
  slicerGroup: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  slicerLabel: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 },
  // Divisor vertical entre Período e Status (T-01)
  divider: {
    width: '1px',
    height: '20px',
    background: 'var(--border-default)',
    flexShrink: 0,
  },
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
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: '4px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
  },
  // tab-pill.active
  chipActive: {
    background: 'var(--bg-base)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-sm)',
  },
  // chip desabilitado quando count=0 (T-06)
  chipDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed' as const,
  },
  // contagem dentro do chip ex: "(6)" (T-05)
  chipCount: {
    fontSize: '11px',
    fontWeight: 400,
    color: 'inherit',
    opacity: 0.7,
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
  // btn-secondary — ação de criação e toggle inativo (Design System § 3)
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '0.8125rem', fontWeight: 500,
    padding: '0.375rem 0.875rem', borderRadius: 'var(--radius-pill)',
    background: 'var(--bg-surface)', border: '1px solid var(--bg-elevated)',
    color: 'var(--text-primary)', cursor: 'pointer',
  },
  btnPrimaryStrong: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', padding: '6px 16px', borderRadius: '9999px',
    background: 'var(--accent)', border: '1px solid var(--accent)',
    color: '#fff', cursor: 'pointer', fontWeight: 600,
    boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
  },
  editHint: {
    display: 'flex', alignItems: 'center', gap: '6px',
    marginTop: '8px',
    padding: '6px 12px',
    background: 'rgba(99,102,241,0.08)',
    border: '1px dashed rgba(99,102,241,0.35)',
    borderRadius: 'var(--radius-md)',
    fontSize: '12px',
    color: 'var(--accent)',
  },
} as const
