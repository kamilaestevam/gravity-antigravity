import React, { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { KanbanColuna } from './KanbanColuna'
import type { KanbanGlobalProps, KanbanItem, KanbanSortKey } from './tipos'
import './kanban-global.css'

// ── Ordenação local por coluna ────────────────────────────────────────────────

function sortItems<T extends KanbanItem>(
  items: T[],
  sort: KanbanSortKey,
  getItemLabel?: (item: T) => string,
  getItemDate?: (item: T) => string | Date | undefined,
): T[] {
  const arr = [...items]

  switch (sort) {
    case 'alpha':
      return arr.sort((a, b) => {
        const la = getItemLabel ? getItemLabel(a) : a.id
        const lb = getItemLabel ? getItemLabel(b) : b.id
        return la.localeCompare(lb, 'pt-BR')
      })

    case 'oldest': {
      return arr.sort((a, b) => {
        const da = getItemDate ? toDate(getItemDate(a)) : null
        const db = getItemDate ? toDate(getItemDate(b)) : null
        return compareNullable(da, db, 1)
      })
    }

    case 'newest':
    default: {
      return arr.sort((a, b) => {
        const da = getItemDate ? toDate(getItemDate(a)) : null
        const db = getItemDate ? toDate(getItemDate(b)) : null
        return compareNullable(da, db, -1)
      })
    }
  }
}

function toDate(v: string | Date | undefined): Date | null {
  if (!v) return null
  return v instanceof Date ? v : new Date(v)
}

function compareNullable(a: Date | null, b: Date | null, dir: 1 | -1): number {
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1
  return dir * (a.getTime() - b.getTime())
}

// ── KanbanGlobal ──────────────────────────────────────────────────────────────

export function KanbanGlobal<T extends KanbanItem = KanbanItem>({
  colunas,
  itens,
  renderCard,
  onMoverItem,
  isReadOnly,
  emptyLabel,
  getItemLabel,
  getItemDate,
}: KanbanGlobalProps<T>) {
  const [activeId, setActiveId]       = useState<string | null>(null)
  const [columnSorts, setColumnSorts] = useState<Record<string, KanbanSortKey>>({})

  // Ativa drag apenas após mover 8px — evita drag acidental em cliques
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over || !onMoverItem) return

    const itemId       = String(active.id)
    const novaColunaKey = String(over.id)

    const item = itens.find(i => i.id === itemId)
    if (!item) return

    // Só chama callback se a coluna realmente mudou
    if (item.colunaKey !== novaColunaKey) {
      onMoverItem(itemId, novaColunaKey)
    }
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  function getColumnItems(colKey: string): T[] {
    const colItems = itens.filter(i => i.colunaKey === colKey)
    return sortItems(colItems, columnSorts[colKey] ?? 'newest', getItemLabel, getItemDate)
  }

  function handleSortChange(colKey: string, sort: KanbanSortKey) {
    setColumnSorts(prev => ({ ...prev, [colKey]: sort }))
  }

  const activeItem = activeId ? itens.find(i => i.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="kg-grid">
        {colunas.map(col => (
          <KanbanColuna
            key={col.key}
            coluna={col}
            itens={getColumnItems(col.key)}
            renderCard={renderCard}
            activeId={activeId}
            sort={columnSorts[col.key] ?? 'newest'}
            onSortChange={(sort) => handleSortChange(col.key, sort)}
            isReadOnly={isReadOnly ?? !onMoverItem}
            emptyLabel={emptyLabel}
          />
        ))}
      </div>

      {/* Card flutuando durante o drag */}
      <DragOverlay>
        {activeItem ? (
          <div className="kg-overlay-card">
            {renderCard(activeItem, true)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
