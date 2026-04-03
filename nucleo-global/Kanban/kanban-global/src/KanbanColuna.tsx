import React, { useEffect, useRef, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortDescending,
  SortAscending,
  TextAa,
  Check,
  X,
  Tray,
  ArrowFatDown,
} from '@phosphor-icons/react'
import { KanbanCardWrapper } from './KanbanCardWrapper'
import type { KanbanColunaDef, KanbanItem, KanbanSortKey } from './tipos'

// ── Opções de ordenação ───────────────────────────────────────────────────────

const SORT_OPCOES: { value: KanbanSortKey; label: string; Icon: React.ElementType }[] = [
  { value: 'newest', label: 'Mais recente primeiro', Icon: SortDescending },
  { value: 'oldest', label: 'Mais antigo primeiro',  Icon: SortAscending  },
  { value: 'alpha',  label: 'Ordem alfabética',      Icon: TextAa         },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface KanbanColunaProps<T extends KanbanItem> {
  coluna: KanbanColunaDef
  itens: T[]
  renderCard: (item: T, isDragging: boolean) => React.ReactNode
  activeId: string | null
  sort: KanbanSortKey
  onSortChange: (sort: KanbanSortKey) => void
  isReadOnly?: boolean
  emptyLabel?: string
}

// ── Componente ────────────────────────────────────────────────────────────────

export function KanbanColuna<T extends KanbanItem>({
  coluna,
  itens,
  renderCard,
  activeId,
  sort,
  onSortChange,
  isReadOnly,
  emptyLabel = 'Nenhum item',
}: KanbanColunaProps<T>) {
  const { setNodeRef, isOver } = useDroppable({ id: coluna.key })
  const [showSort, setShowSort] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Fecha o popover ao clicar fora
  useEffect(() => {
    if (!showSort) return
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowSort(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showSort])

  const countStyle: React.CSSProperties = {
    background: coluna.color + '20',
    color: coluna.color,
    border: `1px solid ${coluna.color}44`,
  }

  const dropzoneClass = ['kg-dropzone', isOver ? 'kg-drag-over' : ''].filter(Boolean).join(' ')

  const isDraggingAny = activeId !== null

  return (
    <div className="kg-coluna" style={{ zIndex: isOver ? 10 : 1 }}>

      {/* Cabeçalho */}
      <div className="kg-coluna-header">
        <div className="kg-coluna-titulo">
          {coluna.icon}
          <span>{coluna.label}</span>
        </div>

        <div className="kg-coluna-acoes" ref={popoverRef}>
          <span className="kg-coluna-count" style={countStyle}>
            {itens.length}
          </span>

          {!isReadOnly && (
            <button
              className="kg-sort-btn"
              title="Ordenar coluna"
              onClick={() => setShowSort(p => !p)}
              aria-label={`Ordenar coluna ${coluna.label}`}
            >
              <SortDescending size={16} />
            </button>
          )}

          {/* Popover de ordenação */}
          {showSort && (
            <div className="kg-sort-popover" role="menu">
              <div className="kg-sort-popover-header">
                <span className="kg-sort-popover-title">Ordenar lista</span>
                <button
                  className="kg-sort-popover-close"
                  onClick={() => setShowSort(false)}
                  aria-label="Fechar ordenação"
                >
                  <X size={14} />
                </button>
              </div>

              {SORT_OPCOES.map(({ value, label, Icon }) => {
                const isActive = sort === value
                return (
                  <button
                    key={value}
                    className={['kg-sort-option', isActive ? 'kg-sort-active' : ''].filter(Boolean).join(' ')}
                    role="menuitem"
                    onClick={() => {
                      onSortChange(value)
                      setShowSort(false)
                    }}
                  >
                    <Icon size={16} />
                    {label}
                    {isActive && (
                      <span className="kg-sort-option-check">
                        <Check size={14} weight="bold" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Zona de drop */}
      <div ref={setNodeRef} className={dropzoneClass}>

        {/* Cards */}
        {itens.map(item => (
          <KanbanCardWrapper
            key={item.id}
            item={item}
            renderCard={renderCard}
            isReadOnly={isReadOnly}
          />
        ))}

        {/* Empty state — só aparece quando não está arrastando */}
        {itens.length === 0 && !isDraggingAny && (
          <div className="kg-empty">
            <Tray size={24} />
            <span>{emptyLabel}</span>
          </div>
        )}

        {/* Hint de drop — aparece quando arrastando sobre esta coluna */}
        {isOver && (
          <div
            className="kg-drop-hint"
            style={{
              borderColor: coluna.color + '66',
              color: coluna.color,
              background: coluna.color + '0d',
            }}
          >
            <ArrowFatDown size={14} weight="bold" />
            Mover para {coluna.label}
          </div>
        )}
      </div>
    </div>
  )
}
