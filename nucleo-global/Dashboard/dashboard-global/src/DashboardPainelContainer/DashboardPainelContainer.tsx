/**
 * DashboardPainelContainer — Wrapper universal para widgets do Dashboard BI
 *
 * Responsabilidades:
 * - Estado de loading (skeleton com GravityLoader)
 * - Estado de erro (mensagem + botão retry)
 * - Estado de dados parciais (badge "Dados parciais")
 * - Menu ⋮ inline (editar, excluir, mover / redimensionar / concluir)
 * - Interação de layout por widget (moving / resizing)
 * - Badge "cached" sutil quando dados vêm do cache
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  DotsThreeVertical,
  PencilSimple,
  Trash,
  ArrowsOutCardinal,
  CornersOut,
  Check,
  DotsSixVertical,
  Warning,
  ArrowClockwise,
} from '@phosphor-icons/react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import type { DashboardWidgetConfig, WidgetResult } from '../tipos.js'
import type { WidgetLayoutModo } from '../DashboardGrid/widgetLayoutInteracao.js'

export type { WidgetLayoutModo } from '../DashboardGrid/widgetLayoutInteracao.js'

export interface WidgetContainerProps {
  widget: DashboardWidgetConfig
  result?: WidgetResult | null
  loading?: boolean
  error?: string | null
  onEdit?: (widget: DashboardWidgetConfig) => void
  onRemove?: (widgetId: string) => void
  children: React.ReactNode
  /** Cor de destaque para borda superior (ex: '#f59e0b' para amber, '#ef4444' para perigo) */
  accentColor?: string
  /** Ícone Phosphor exibido ao lado do título */
  icone?: React.ReactNode
  /** Callback ao clicar no container (usado para rastrear comportamento) */
  onClick?: () => void
  /** Indica que o card é clicável — aplica cursor pointer e chevron hint */
  clickable?: boolean
  /** Destaca o card com ring pulsante (widget recém-adicionado) */
  highlighted?: boolean
  /** Período próprio do widget — exibe chip de filtro ativo (padrão Lista) */
  periodoFiltroRotulo?: string
  /** Controle de calendário/período no cabeçalho (dropdown do pai) */
  periodoControle?: React.ReactNode
  onLimparPeriodoWidget?: () => void
  /** Exibe menu ⋮ e ações de layout no cabeçalho */
  habilitarMenuOpcoes?: boolean
  /** Modo ativo de interação de layout (mover ou redimensionar) */
  layoutModo?: WidgetLayoutModo
  onMover?: () => void
  onRedimensionar?: () => void
  onConcluirLayout?: () => void
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WidgetSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 100 }}>
      <GravityLoader tamanho="sm" />
    </div>
  )
}

// ─── Menu de opções (dropdown em portal — evita clip do react-grid-layout) ───

interface OptionsMenuProps {
  layoutModo?: WidgetLayoutModo
  onEdit?: () => void
  onRemove?: () => void
  onMover?: () => void
  onRedimensionar?: () => void
  onConcluirLayout?: () => void
}

const MENU_DROPDOWN_MIN_WIDTH = 170

function OptionsMenu({
  layoutModo,
  onEdit,
  onRemove,
  onMover,
  onRedimensionar,
  onConcluirLayout,
}: OptionsMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const emInteracaoLayout = layoutModo != null

  const atualizarMenuPos = useCallback(() => {
    if (!buttonRef.current) return
    const r = buttonRef.current.getBoundingClientRect()
    setMenuPos({
      top: r.bottom + 4,
      left: Math.max(8, r.right - MENU_DROPDOWN_MIN_WIDTH),
    })
  }, [])

  useEffect(() => {
    if (!open) {
      setMenuPos(null)
      return
    }
    atualizarMenuPos()
    window.addEventListener('resize', atualizarMenuPos)
    window.addEventListener('scroll', atualizarMenuPos, true)
    return () => {
      window.removeEventListener('resize', atualizarMenuPos)
      window.removeEventListener('scroll', atualizarMenuPos, true)
    }
  }, [open, atualizarMenuPos])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (menuRef.current?.contains(target)) return
      if (buttonRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const dropdown = open && menuPos
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            ...styles.menuDropdown,
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            right: 'auto',
            marginTop: 0,
          }}
          role="menu"
          data-dashboard-widget-menu-version="v2-mover-tamanho-portal"
        >
          <button
            type="button"
            style={{
              ...styles.menuItem,
              ...(onEdit ? {} : { opacity: 0.45, cursor: 'not-allowed' }),
            }}
            disabled={!onEdit}
            onClick={() => { if (onEdit) { onEdit(); setOpen(false) } }}
            role="menuitem"
            data-testid="dashboard-widget-menu-editar"
          >
            <PencilSimple size={14} />
            {t('nucleo.dashboard.painel.editar')}
          </button>
          <button
            type="button"
            style={{
              ...styles.menuItem,
              color: 'var(--danger)',
              ...(onRemove ? {} : { opacity: 0.45, cursor: 'not-allowed' }),
            }}
            disabled={!onRemove}
            onClick={() => { if (onRemove) { onRemove(); setOpen(false) } }}
            role="menuitem"
            data-testid="dashboard-widget-menu-excluir"
          >
            <Trash size={14} />
            {t('nucleo.dashboard.painel.excluir', { defaultValue: 'Excluir' })}
          </button>

          <div style={styles.menuSeparator} role="separator" />

          {emInteracaoLayout ? (
            <button
              type="button"
              style={{
                ...styles.menuItem,
                ...(onConcluirLayout ? {} : { opacity: 0.45, cursor: 'not-allowed' }),
              }}
              disabled={!onConcluirLayout}
              onClick={() => { if (onConcluirLayout) { onConcluirLayout(); setOpen(false) } }}
              role="menuitem"
              data-testid="dashboard-widget-menu-concluir"
            >
              <Check size={14} weight="bold" />
              {t('nucleo.dashboard.painel.concluir_layout', { defaultValue: 'Concluir' })}
            </button>
          ) : (
            <>
              <button
                type="button"
                style={{
                  ...styles.menuItem,
                  ...(onMover ? {} : { opacity: 0.45, cursor: 'not-allowed' }),
                }}
                disabled={!onMover}
                onClick={() => { if (onMover) { onMover(); setOpen(false) } }}
                role="menuitem"
                data-testid="dashboard-widget-menu-mover"
              >
                <ArrowsOutCardinal size={14} />
                {t('nucleo.dashboard.painel.mover', { defaultValue: 'Mover' })}
              </button>
              <button
                type="button"
                style={{
                  ...styles.menuItem,
                  ...(onRedimensionar ? {} : { opacity: 0.45, cursor: 'not-allowed' }),
                }}
                disabled={!onRedimensionar}
                onClick={() => { if (onRedimensionar) { onRedimensionar(); setOpen(false) } }}
                role="menuitem"
                data-testid="dashboard-widget-menu-mudar-tamanho"
              >
                <CornersOut size={14} />
                {t('nucleo.dashboard.painel.mudar_tamanho', { defaultValue: 'Mudar tamanho' })}
              </button>
            </>
          )}
        </div>,
        document.body,
      )
    : null

  return (
    <div className="db-no-drag" style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        type="button"
        style={styles.menuBtn}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        aria-label={t('nucleo.dashboard.painel.opcoes_widget_aria')}
        title={t('nucleo.dashboard.painel.opcoes')}
        data-testid="dashboard-widget-menu-btn"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <DotsThreeVertical size={18} weight="bold" />
      </button>
      {dropdown}
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function DashboardPainelContainer({
  widget,
  result,
  loading = false,
  error = null,
  onEdit,
  onRemove,
  children,
  accentColor,
  icone,
  onClick,
  clickable = false,
  highlighted = false,
  periodoFiltroRotulo,
  periodoControle,
  onLimparPeriodoWidget,
  habilitarMenuOpcoes = false,
  layoutModo,
  onMover,
  onRedimensionar,
  onConcluirLayout,
}: WidgetContainerProps) {
  const { t } = useTranslation()
  const isPartial = result?.partial === true
  const isCached = result?.cached === true
  const [hovered, setHovered] = useState(false)

  const emMovimento = layoutModo === 'moving'
  const emRedimensionamento = layoutModo === 'resizing'
  const emInteracaoLayout = layoutModo != null

  const handleMouseEnter = useCallback(() => setHovered(true), [])
  const handleMouseLeave = useCallback(() => setHovered(false), [])

  const isClickable = clickable && !emInteracaoLayout

  const dragHandleClass = emMovimento ? 'db-drag-handle' : undefined

  const headerStyle: React.CSSProperties = {
    ...styles.header,
    cursor: 'default',
  }

  const titleAreaStyle: React.CSSProperties = {
    ...styles.titleArea,
    minWidth: 0,
    ...(emMovimento ? { cursor: 'grab' } : {}),
  }

  const headerGridStyle: React.CSSProperties = {
    ...headerStyle,
    display: 'grid',
    gridTemplateColumns: habilitarMenuOpcoes ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)',
    alignItems: 'center',
  }

  const containerStyle: React.CSSProperties = {
    ...styles.container,
    ...(emInteracaoLayout ? styles.containerInteracaoLayout : {}),
    ...(hovered && isClickable ? styles.containerClickableHover : hovered ? styles.containerHover : {}),
    ...(isClickable ? { cursor: 'pointer' } : {}),
    ...(!emInteracaoLayout && accentColor ? { borderTop: `2px solid ${accentColor}` } : {}),
    ...(highlighted ? { animation: 'wc-highlight-ring 1.4s ease-in-out 3 forwards' } : {}),
    transition: 'box-shadow 0.2s ease',
    position: 'relative',
  }

  const mostrarLimparPeriodo = habilitarMenuOpcoes && !!onLimparPeriodoWidget

  return (
    <div
      className={dragHandleClass}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div style={headerGridStyle}>
        <div className={dragHandleClass} style={titleAreaStyle}>
          {emMovimento && (
            <span style={styles.dragHandleIcon} title={t('nucleo.dashboard.painel.arraste_reorganizar')}>
              <DotsSixVertical size={16} weight="bold" />
            </span>
          )}
          {icone && <span style={styles.iconeWrap}>{icone}</span>}
          <span style={styles.title}>{widget.title}</span>

          {isPartial && (
            <span style={styles.badgePartial} title={t('nucleo.dashboard.painel.dados_parciais_tooltip')}>
              <Warning size={11} weight="fill" />
              {t('nucleo.dashboard.painel.dados_parciais')}
            </span>
          )}
          {isCached && !isPartial && (
            <span style={styles.badgeCached} title={t('nucleo.dashboard.painel.dados_cache_tooltip')}>
              {t('nucleo.dashboard.painel.cache')}
            </span>
          )}
          {periodoFiltroRotulo && (
            <span
              style={styles.badgePeriodo}
              title={t('nucleo.dashboard.painel.periodo_widget_tooltip', { defaultValue: 'Período do widget' })}
            >
              {periodoFiltroRotulo}
              {mostrarLimparPeriodo && (
                <button
                  type="button"
                  className="db-no-drag"
                  style={styles.badgePeriodoClear}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onLimparPeriodoWidget?.() }}
                  aria-label={t('nucleo.dashboard.painel.limpar_periodo_widget', { defaultValue: 'Limpar período do widget' })}
                  data-testid="dashboard-widget-limpar-periodo"
                >
                  ×
                </button>
              )}
            </span>
          )}
        </div>

        {habilitarMenuOpcoes && (
          <div className="db-no-drag" style={styles.headerAcoesSlot}>
            {periodoControle}
            <OptionsMenu
              layoutModo={layoutModo}
              onEdit={onEdit ? () => onEdit(widget) : undefined}
              onRemove={onRemove ? () => onRemove(widget.id) : undefined}
              onMover={onMover}
              onRedimensionar={onRedimensionar}
              onConcluirLayout={onConcluirLayout}
            />
          </div>
        )}
      </div>

      <div style={styles.body}>
        {loading && <WidgetSkeleton />}

        {!loading && error && (
          <div style={styles.errorState}>
            <Warning size={24} color="var(--warning)" weight="duotone" />
            <p style={styles.errorText}>{error}</p>
            <button
              type="button"
              style={styles.retryBtn}
              onClick={() => window.location.reload()}
              aria-label={t('nucleo.dashboard.painel.tentar_novamente')}
              data-testid="dashboard-widget-retry"
            >
              <ArrowClockwise size={13} />
              {t('nucleo.dashboard.painel.tentar_novamente')}
            </button>
          </div>
        )}

        {!loading && !error && children}
      </div>

      {emMovimento && (
        <div className="db-no-drag" style={styles.faixaInteracao} data-testid="dashboard-widget-faixa-mover">
          <ArrowsOutCardinal size={14} weight="bold" />
          <span>
            {t('nucleo.dashboard.painel.faixa_mover', {
              defaultValue: 'Arraste pelo cabeçalho ou corpo do card para reposicionar. Conclua no menu ⋮.',
            })}
          </span>
        </div>
      )}

      {emRedimensionamento && (
        <div className="db-no-drag" style={styles.faixaInteracao} data-testid="dashboard-widget-faixa-redimensionar">
          <CornersOut size={14} weight="bold" />
          <span>
            {t('nucleo.dashboard.painel.faixa_redimensionar', {
              defaultValue: 'Arraste as bordas ou cantos para mudar o tamanho. Conclua no menu ⋮.',
            })}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const styles = {
  container: {
    background: 'var(--bg-base)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '14px 16px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 0,
    height: '100%',
    width: '100%',
    minWidth: 0,
    overflow: 'visible',
    boxSizing: 'border-box' as const,
  },
  containerHover: {
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  },
  containerClickableHover: {
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    borderColor: 'var(--border-accent)',
  },
  containerInteracaoLayout: {
    border: '2px dashed var(--accent)',
    boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
  },
  faixaInteracao: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--accent)',
    background: 'rgba(99,102,241,0.08)',
    border: '1px dashed rgba(99,102,241,0.35)',
    borderRadius: 'var(--radius-md)',
    flexShrink: 0,
  },
  dragHandleIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--accent)',
    opacity: 0.7,
    flexShrink: 0,
    cursor: 'grab',
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
    paddingBottom: '8px',
    borderBottom: '1px solid var(--border-default)',
    marginBottom: '10px',
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
  badgePeriodo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--accent)',
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.35)',
    borderRadius: '9999px',
    padding: '2px 8px',
    whiteSpace: 'nowrap' as const,
  },
  badgePeriodoClear: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    fontSize: '12px',
    lineHeight: 1,
    padding: 0,
    marginLeft: '2px',
  },
  headerAcoesSlot: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
    position: 'relative' as const,
    zIndex: 20,
    cursor: 'default',
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
    minWidth: '170px',
    zIndex: 100,
    overflow: 'hidden',
  },
  menuSeparator: {
    height: 1,
    margin: '4px 0',
    background: 'var(--border-default)',
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
