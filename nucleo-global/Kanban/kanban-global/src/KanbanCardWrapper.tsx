import React, { useEffect, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DotsThreeVertical, BuildingOffice } from '@phosphor-icons/react'
import { useKanban } from './KanbanContext'
import type { KanbanItem } from './tipos'

// ── Props ─────────────────────────────────────────────────────────────────────

interface KanbanCardWrapperProps {
  item: KanbanItem
  /** Chave da coluna atual — usada para filtrar opções no menu "Mover para" */
  colunaKey: string
}

// ── Componente ────────────────────────────────────────────────────────────────

export function KanbanCardWrapper({ item, colunaKey }: KanbanCardWrapperProps) {
  const {
    colunas,
    renderCard,
    isReadOnly,
    movingId,
    feedbackMap,
    testIdPrefix,
    modoGlobal,
    onMoverItemInternal,
    onCardClick,
    labels,
    dataTutorialAlvoPorCardId,
    dataTutorialAlvoMoverMenuCardId,
    dataTutorialAlvoMoverMenu,
    onMoverMenuOpenChange,
    dataTutorialAlvoMoverOpcoes,
    usarDragOverlay,
    fantasmaArrasteAtivo,
    activeId,
  } = useKanban()

  const isReadOnlyEfetivo = isReadOnly || (
    // Coluna atual é read-only
    colunas.find(c => c.key === colunaKey)?.isReadOnly ?? false
  )

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id:       item.id,
    disabled: isReadOnlyEfetivo,
    data:     { colunaKey },
  })

  const arrastandoEste = activeId === item.id
  const ocultarPlaceholder =
    isDragging && (usarDragOverlay || fantasmaArrasteAtivo)

  const style: React.CSSProperties = ocultarPlaceholder
    ? usarDragOverlay
      ? { opacity: 0, transform: CSS.Translate.toString(transform) }
      : { opacity: 0 }
    : {
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? undefined : (transition ?? undefined),
      }

  const isMoving = movingId === item.id
  const feedback = feedbackMap[item.id] ?? null
  const arrastouRef = useRef(false)

  useEffect(() => {
    if (isDragging) arrastouRef.current = true
  }, [isDragging])

  // ── Menu "Mover para" ────────────────────────────────────────────────────
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMenu) return
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showMenu])

  useEffect(() => {
    if (!onMoverMenuOpenChange || item.id !== dataTutorialAlvoMoverMenuCardId) return
    onMoverMenuOpenChange(item.id, showMenu)
  }, [showMenu, onMoverMenuOpenChange, item.id, dataTutorialAlvoMoverMenuCardId])

  // Colunas disponíveis como destino (exclui a atual)
  const colunasDestino = colunas.filter(c => c.key !== colunaKey)

  async function handleMoverPara(novaColunaKey: string) {
    setShowMenu(false)
    await onMoverItemInternal(item.id, novaColunaKey)
  }

  // ── Classes ──────────────────────────────────────────────────────────────
  const classes = [
    'kg-card-wrapper',
    isDragging && ocultarPlaceholder ? 'kg-dragging' : '',
    isDragging && arrastandoEste && !ocultarPlaceholder ? 'kg-dragging kg-drag-fallback' : '',
    isReadOnlyEfetivo ? 'kg-readonly'       : '',
    isMoving          ? 'kg-moving'         : '',
    feedback === 'sucesso' ? 'kg-feedback-sucesso' : '',
    feedback === 'erro'    ? 'kg-feedback-erro'    : '',
  ].filter(Boolean).join(' ')

  const alvoTutorialCard = dataTutorialAlvoPorCardId?.[item.id]

  return (
    <div
      ref={setNodeRef}
      className={classes}
      style={style}
      data-testid={`${testIdPrefix}-card`}
      data-card-id={item.id}
      {...(alvoTutorialCard ? { 'data-sds-tutorial-alvo': alvoTutorialCard } : {})}
      {...attributes}
      {...(isReadOnlyEfetivo ? {} : listeners)}
      role="listitem"
      onClick={
        onCardClick
          ? () => {
              if (isDragging || arrastouRef.current) {
                arrastouRef.current = false
                return
              }
              onCardClick(item)
            }
          : undefined
      }
    >
      {renderCard(item, isDragging)}

      {/* Badge de empresa no modo global */}
      {modoGlobal && item.tenantLabel && (
        <div
          className="kg-tenant-badge"
          style={{
            background: (item.tenantColor ?? '#6366f1') + '20',
            color:      item.tenantColor ?? '#6366f1',
            border:     `1px solid ${(item.tenantColor ?? '#6366f1')}44`,
          }}
        >
          <BuildingOffice size={10} />
          {item.tenantLabel}
        </div>
      )}

      {/* Botão "Mover para" — oculto em read-only ou sem colunas destino */}
      {!isReadOnlyEfetivo && !isMoving && colunasDestino.length > 0 && (
        <div className="kg-mover-wrap" ref={menuRef}>
          <button
            className="kg-mover-btn"
            title={labels.moveCardTitle}
            aria-label={labels.moveCardAriaLabel}
            onClick={e => {
              e.stopPropagation()
              setShowMenu(p => !p)
            }}
            {...(item.id === dataTutorialAlvoMoverMenuCardId && dataTutorialAlvoMoverMenu
              ? { 'data-sds-tutorial-alvo': dataTutorialAlvoMoverMenu }
              : {})}
          >
            <DotsThreeVertical size={14} weight="bold" />
          </button>

          {showMenu && (
            <div
              className="kg-mover-menu"
              role="menu"
              {...(item.id === dataTutorialAlvoMoverMenuCardId && dataTutorialAlvoMoverOpcoes
                ? { 'data-sds-tutorial-alvo': dataTutorialAlvoMoverOpcoes }
                : {})}
            >
              <div className="kg-mover-menu-label">{labels.moveCardMenuLabel}</div>
              {colunasDestino.map(col => (
                <button
                  key={col.key}
                  className="kg-mover-opcao"
                  role="menuitem"
                  disabled={col.isReadOnly}
                  onClick={() => handleMoverPara(col.key)}
                >
                  <span
                    className="kg-mover-opcao-dot"
                    style={{ background: col.color }}
                  />
                  {col.icon && <span className="kg-mover-opcao-icon">{col.icon}</span>}
                  {col.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Indicador de move assíncrono pendente */}
      {isMoving && (
        <div className="kg-moving-overlay" aria-label={labels.movingAriaLabel} />
      )}
    </div>
  )
}
