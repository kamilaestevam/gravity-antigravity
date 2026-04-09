/**
 * WidgetContainer — Wrapper universal para widgets do Dashboard BI
 *
 * Responsabilidades:
 * - Estado de loading (skeleton animado)
 * - Estado de erro (mensagem + botão retry)
 * - Estado de dados parciais (badge "Dados parciais")
 * - Drag handle no cabeçalho (classe db-drag-handle)
 * - Menu de opções (editar, remover, exportar)
 * - Badge "cached" sutil quando dados vêm do cache
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { DotsThreeVertical, PencilSimple, Trash, DownloadSimple, Warning, ArrowClockwise } from '@phosphor-icons/react'
import type { DashboardWidgetConfig, WidgetResult } from '../tipos.js'

export interface WidgetContainerProps {
  widget: DashboardWidgetConfig
  result?: WidgetResult | null
  loading?: boolean
  error?: string | null
  editMode?: boolean
  onEdit?: (widget: DashboardWidgetConfig) => void
  onRemove?: (widgetId: string) => void
  children: React.ReactNode
  /** Cor de destaque para borda superior (ex: '#f59e0b' para amber, '#ef4444' para perigo) */
  accentColor?: string
  /** Ícone Phosphor exibido ao lado do título */
  icone?: React.ReactNode
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WidgetSkeleton() {
  return (
    <div style={styles.skeleton}>
      <div style={{ ...styles.skeletonLine, width: '60%', height: '14px' }} />
      <div style={{ ...styles.skeletonLine, width: '100%', height: '80px', marginTop: '12px' }} />
      <div style={{ ...styles.skeletonLine, width: '80%', height: '12px', marginTop: '8px' }} />
    </div>
  )
}

// ─── Menu de opções ────────────────────────────────────────────────────────────

interface OptionsMenuProps {
  onEdit?: () => void
  onRemove?: () => void
}

function OptionsMenu({ onEdit, onRemove }: OptionsMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        style={styles.menuBtn}
        onClick={() => setOpen(v => !v)}
        aria-label="Opções do widget"
        title="Opções"
      >
        <DotsThreeVertical size={18} weight="bold" />
      </button>

      {open && (
        <div style={styles.menuDropdown} role="menu">
          {onEdit && (
            <button
              style={styles.menuItem}
              onClick={() => { onEdit(); setOpen(false) }}
              role="menuitem"
            >
              <PencilSimple size={14} />
              Editar
            </button>
          )}
          <button
            style={styles.menuItem}
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <DownloadSimple size={14} />
            Exportar dados
          </button>
          {onRemove && (
            <button
              style={{ ...styles.menuItem, color: 'var(--danger)' }}
              onClick={() => { onRemove(); setOpen(false) }}
              role="menuitem"
            >
              <Trash size={14} />
              Remover
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function WidgetContainer({
  widget,
  result,
  loading = false,
  error = null,
  editMode = false,
  onEdit,
  onRemove,
  children,
  accentColor,
  icone,
}: WidgetContainerProps) {
  const isPartial = result?.partial === true
  const isCached = result?.cached === true
  const [hovered, setHovered] = useState(false)

  const handleMouseEnter = useCallback(() => setHovered(true), [])
  const handleMouseLeave = useCallback(() => setHovered(false), [])

  const headerStyle: React.CSSProperties = {
    ...styles.header,
    cursor: editMode ? 'grab' : 'default',
  }

  const containerStyle: React.CSSProperties = {
    ...styles.container,
    ...(accentColor ? { borderTop: `2px solid ${accentColor}` } : {}),
    ...(hovered ? styles.containerHover : {}),
    transition: 'box-shadow 0.2s ease',
  }

  return (
    <div style={containerStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Cabeçalho com drag handle */}
      <div className={editMode ? 'db-drag-handle' : undefined} style={headerStyle}>
        <div style={styles.titleArea}>
          {icone && <span style={styles.iconeWrap}>{icone}</span>}
          <span style={styles.title}>{widget.title}</span>

          {/* Badges de estado */}
          {isPartial && (
            <span style={styles.badgePartial} title="Alguns dados não puderam ser carregados">
              <Warning size={11} weight="fill" />
              Dados parciais
            </span>
          )}
          {isCached && !isPartial && (
            <span style={styles.badgeCached} title="Dados do cache">
              Cache
            </span>
          )}
        </div>

        <OptionsMenu
          onEdit={onEdit ? () => onEdit(widget) : undefined}
          onRemove={onRemove ? () => onRemove(widget.id) : undefined}
        />
      </div>

      {/* Corpo */}
      <div style={styles.body}>
        {loading && <WidgetSkeleton />}

        {!loading && error && (
          <div style={styles.errorState}>
            <Warning size={24} color="var(--warning)" weight="duotone" />
            <p style={styles.errorText}>{error}</p>
            <button
              style={styles.retryBtn}
              onClick={() => window.location.reload()}
              aria-label="Tentar novamente"
            >
              <ArrowClockwise size={13} />
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && children}
      </div>

      {/* Animação de skeleton via style tag inline */}
      <style>{`
        @keyframes db-skeleton-pulse {
          0%, 100% { background-color: var(--bg-surface); }
          50%       { background-color: var(--bg-elevated); }
        }
        .db-skeleton-line {
          animation: db-skeleton-pulse 1.5s ease-in-out infinite;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  )
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const styles = {
  container: {
    background: 'var(--bg-base)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px 20px 16px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
    height: '100%',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
  },
  containerHover: {
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  },
  iconeWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--text-secondary)',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-2)',
    userSelect: 'none' as const,
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-default)',
    marginBottom: '16px',
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap' as const,
    minWidth: 0,
  },
  title: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badgePartial: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--warning)',
    background: 'rgba(245,158,11,0.12)',
    border: '1px solid rgba(245,158,11,0.25)',
    borderRadius: 'var(--radius-sm)',
    padding: '1px 6px',
    whiteSpace: 'nowrap' as const,
  },
  badgeCached: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: 500,
    color: 'var(--text-muted)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '1px 5px',
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '2px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    transition: 'var(--transition-fast)',
    flexShrink: 0,
  },
  menuDropdown: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: '4px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    minWidth: '150px',
    zIndex: 100,
    overflow: 'hidden',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    width: '100%',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-primary)',
    textAlign: 'left' as const,
    transition: 'var(--transition-fast)',
  },
  body: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
  skeleton: {
    padding: 'var(--space-2)',
  },
  skeletonLine: {
    borderRadius: 'var(--radius-sm)',
    animation: 'db-skeleton-pulse 1.5s ease-in-out infinite',
    background: 'var(--bg-surface)',
  } as React.CSSProperties,
  errorState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-6)',
    flex: 1,
    textAlign: 'center' as const,
  },
  errorText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
    maxWidth: '240px',
  },
  retryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
} as const
