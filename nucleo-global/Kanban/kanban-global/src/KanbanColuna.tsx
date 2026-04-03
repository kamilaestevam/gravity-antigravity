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
  CaretRight,
  CaretDown,
} from '@phosphor-icons/react'
import { KanbanCardWrapper } from './KanbanCardWrapper'
import { useKanban } from './KanbanContext'
import type { KanbanColunaDef, KanbanItem, KanbanSortKey } from './tipos'

// ── Opções de ordenação ───────────────────────────────────────────────────────

const SORT_OPCOES: { value: KanbanSortKey; label: string; Icon: React.ElementType }[] = [
  { value: 'newest', label: 'Mais recente primeiro', Icon: SortDescending },
  { value: 'oldest', label: 'Mais antigo primeiro',  Icon: SortAscending  },
  { value: 'alpha',  label: 'Ordem alfabética',      Icon: TextAa         },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface KanbanColunaProps {
  coluna: KanbanColunaDef
  itens: KanbanItem[]
  sort: KanbanSortKey
  onSortChange: (sort: KanbanSortKey) => void
  isLoading?: boolean
  skeletonCount?: number
}

// ── Componente ────────────────────────────────────────────────────────────────

export function KanbanColuna({
  coluna,
  itens,
  sort,
  onSortChange,
  isLoading,
  skeletonCount = 3,
}: KanbanColunaProps) {
  const {
    isReadOnly: globalReadOnly,
    emptyLabel,
    activeId,
    testIdPrefix,
    colunaFooterSlot,
  } = useKanban()

  // isReadOnly desta coluna = global OU específico desta coluna
  const isReadOnly = globalReadOnly || (coluna.isReadOnly ?? false)

  const { setNodeRef, isOver } = useDroppable({
    id: coluna.key,
    disabled: isReadOnly,
  })

  const [showSort,   setShowSort]   = useState(false)
  const [collapsed,  setCollapsed]  = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Fecha popover ao clicar fora
  useEffect(() => {
    if (!showSort) return
    function handle(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowSort(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showSort])

  const isDraggingAny = activeId !== null

  // WIP limit
  const wip          = coluna.limiteWip
  const wipExcedido  = wip !== undefined && itens.length > wip

  const countStyle: React.CSSProperties = {
    background: coluna.color + '20',
    color:      coluna.color,
    border:     `1px solid ${coluna.color}44`,
  }

  const dropzoneClass = [
    'kg-dropzone',
    isOver ? 'kg-drag-over' : '',
  ].filter(Boolean).join(' ')

  const colunaClass = [
    'kg-coluna',
    collapsed ? 'kg-coluna-colapsada' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={colunaClass}
      style={{ zIndex: isOver ? 10 : 1 }}
      data-testid={`${testIdPrefix}-column`}
      data-column-key={coluna.key}
    >
      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className="kg-coluna-header">
        <div className="kg-coluna-titulo">
          {coluna.icon}
          <span className="kg-coluna-titulo-label">{coluna.label}</span>
        </div>

        <div className="kg-coluna-acoes" ref={popoverRef}>
          {/* Badge de contagem */}
          <span
            className="kg-coluna-count"
            style={countStyle}
            data-testid={`${testIdPrefix}-column-header`}
          >
            {itens.length}
          </span>

          {/* Badge WIP */}
          {wip !== undefined && (
            <span className={`kg-wip-badge ${wipExcedido ? 'kg-wip-excedido' : ''}`}>
              WIP {itens.length}/{wip}
            </span>
          )}

          {/* Botão ordenação */}
          {!isReadOnly && !collapsed && (
            <button
              className="kg-sort-btn"
              title="Ordenar coluna"
              onClick={() => setShowSort(p => !p)}
              aria-label={`Ordenar coluna ${coluna.label}`}
            >
              <SortDescending size={16} />
            </button>
          )}

          {/* Botão colapsar */}
          {coluna.colapsavel && (
            <button
              className="kg-collapse-btn"
              title={collapsed ? 'Expandir coluna' : 'Colapsar coluna'}
              onClick={() => setCollapsed(p => !p)}
              aria-label={collapsed ? `Expandir ${coluna.label}` : `Colapsar ${coluna.label}`}
            >
              {collapsed ? <CaretRight size={14} /> : <CaretDown size={14} />}
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

      {/* ── Corpo (cards) ─────────────────────────────────────────────────── */}
      {!collapsed && (
        <>
          <div ref={setNodeRef} className={dropzoneClass}>

            {/* Skeleton de carregamento */}
            {isLoading && Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="kg-skeleton-card" />
            ))}

            {/* Cards */}
            {!isLoading && itens.map(item => (
              <KanbanCardWrapper key={item.id} item={item} colunaKey={coluna.key} />
            ))}

            {/* Empty state — só quando não está arrastando */}
            {!isLoading && itens.length === 0 && !isDraggingAny && (
              <div className="kg-empty">
                <Tray size={24} />
                <span>{emptyLabel}</span>
              </div>
            )}

            {/* Hint de drop — aparece ao arrastar sobre esta coluna */}
            {isOver && !isReadOnly && (
              <div
                className="kg-drop-hint"
                style={{
                  borderColor: coluna.color + '66',
                  color:       coluna.color,
                  background:  coluna.color + '0d',
                }}
              >
                <ArrowFatDown size={14} weight="bold" />
                Mover para {coluna.label}
              </div>
            )}
          </div>

          {/* Footer slot */}
          {colunaFooterSlot && (
            <div className="kg-coluna-footer">
              {colunaFooterSlot(coluna)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
