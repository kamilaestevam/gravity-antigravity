import React, { useEffect, useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
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
    testIdPrefix,
    modoGlobal,
    onMoverItemInternal,
    onCardClick,
  } = useKanban()

  const isReadOnlyEfetivo = isReadOnly || (
    // Coluna atual é read-only
    colunas.find(c => c.key === colunaKey)?.isReadOnly ?? false
  )

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id:       item.id,
    disabled: isReadOnlyEfetivo,
    data:     { colunaKey },
  })

  const isMoving = movingId === item.id

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

  // Colunas disponíveis como destino (exclui a atual)
  const colunasDestino = colunas.filter(c => c.key !== colunaKey)

  async function handleMoverPara(novaColunaKey: string) {
    setShowMenu(false)
    await onMoverItemInternal(item.id, novaColunaKey)
  }

  // ── Classes ──────────────────────────────────────────────────────────────
  const classes = [
    'kg-card-wrapper',
    isDragging       ? 'kg-dragging' : '',
    isReadOnlyEfetivo ? 'kg-readonly' : '',
    isMoving         ? 'kg-moving'   : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={setNodeRef}
      className={classes}
      data-testid={`${testIdPrefix}-card`}
      data-card-id={item.id}
      {...attributes}
      {...(isReadOnlyEfetivo ? {} : listeners)}
      onClick={onCardClick && !isDragging ? () => onCardClick(item) : undefined}
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
            title="Mover para…"
            aria-label="Mover card para outra coluna"
            onClick={e => {
              e.stopPropagation()
              setShowMenu(p => !p)
            }}
          >
            <DotsThreeVertical size={14} weight="bold" />
          </button>

          {showMenu && (
            <div className="kg-mover-menu" role="menu">
              <div className="kg-mover-menu-label">Mover para</div>
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
        <div className="kg-moving-overlay" aria-label="Movendo…" />
      )}
    </div>
  )
}
