import React, { useState, useCallback, useMemo, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { KanbanColuna } from './KanbanColuna'
import { KanbanContext, type KanbanContextValue } from './KanbanContext'
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

    case 'oldest':
      return arr.sort((a, b) => {
        const da = getItemDate ? toDate(getItemDate(a)) : null
        const db = getItemDate ? toDate(getItemDate(b)) : null
        return compareNullable(da, db, 1)
      })

    case 'newest':
    default:
      return arr.sort((a, b) => {
        const da = getItemDate ? toDate(getItemDate(a)) : null
        const db = getItemDate ? toDate(getItemDate(b)) : null
        return compareNullable(da, db, -1)
      })
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
  onCardClick,
  isReadOnly,
  emptyLabel = 'Nenhum item',
  getItemLabel,
  getItemDate,
  filterFn,
  isLoading,
  skeletonCount = 3,
  colunasVisiveis,
  toolbarSlot,
  colunaFooterSlot,
  testIdPrefix = 'kg',
  modoGlobal = false,
}: KanbanGlobalProps<T>) {
  const [activeId, setActiveId]       = useState<string | null>(null)
  const [movingId, setMovingId]       = useState<string | null>(null)
  const [columnSorts, setColumnSorts] = useState<Record<string, KanbanSortKey>>({})
  // Optimistic: itemId → novaColunaKey enquanto move assíncrono está pendente
  const [pendingMoves, setPendingMoves] = useState<Record<string, string>>({})

  // Refs para evitar stale closure no useCallback estável
  const itensRef       = useRef(itens)
  const pendingRef     = useRef(pendingMoves)
  const onMoverRef     = useRef(onMoverItem)
  itensRef.current     = itens
  pendingRef.current   = pendingMoves
  onMoverRef.current   = onMoverItem

  // Todos os sensores: mouse, teclado e toque
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  // Colunas visíveis (filtradas por permissão)
  const colunasRender = useMemo(
    () => colunasVisiveis
      ? colunas.filter(c => colunasVisiveis.includes(c.key))
      : colunas,
    [colunas, colunasVisiveis],
  )

  // Itens com filtro interno opcional
  const itensFiltrados = useMemo(
    () => filterFn ? itens.filter(filterFn) : itens,
    [itens, filterFn],
  )

  // Distribui e ordena itens por coluna (aplica pending moves otimistas)
  function getColumnItems(colKey: string): T[] {
    const colItems = itensFiltrados.filter(i => {
      const efetivo = pendingMoves[i.id] ?? i.colunaKey
      return efetivo === colKey
    })
    return sortItems(colItems, columnSorts[colKey] ?? 'newest', getItemLabel, getItemDate)
  }

  // Move item com update otimista + rollback automático
  const handleMoverItemInternal = useCallback(
    async (itemId: string, novaColunaKey: string): Promise<void> => {
      const handler = onMoverRef.current
      if (!handler) return

      const items   = itensRef.current
      const pending = pendingRef.current

      const item = items.find(i => i.id === itemId)
      if (!item) return

      const colunaAtual = pending[item.id] ?? item.colunaKey
      if (colunaAtual === novaColunaKey) return

      // Posição = fim da coluna de destino (após aplicar pending)
      const posicao = items.filter(i => (pending[i.id] ?? i.colunaKey) === novaColunaKey).length

      // Update otimista
      setMovingId(itemId)
      setPendingMoves(prev => ({ ...prev, [itemId]: novaColunaKey }))

      let sucesso = false
      try {
        await handler(itemId, novaColunaKey, posicao)
        sucesso = true
      } finally {
        setMovingId(null)
        if (sucesso) {
          // Aguarda o pai atualizar o estado antes de limpar (evita flicker)
          setTimeout(() => {
            setPendingMoves(prev => {
              const next = { ...prev }
              delete next[itemId]
              return next
            })
          }, 50)
        } else {
          // Rollback imediato
          setPendingMoves(prev => {
            const next = { ...prev }
            delete next[itemId]
            return next
          })
        }
      }
    },
    [], // deps vazias — acessa tudo via refs
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id))
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over || !onMoverItem) return
    await handleMoverItemInternal(String(active.id), String(over.id))
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  function handleSortChange(colKey: string, sort: KanbanSortKey) {
    setColumnSorts(prev => ({ ...prev, [colKey]: sort }))
  }

  const activeItem = activeId ? itensFiltrados.find(i => i.id === activeId) : null

  // Contexto interno — memoizado por estabilidade das deps
  const ctxValue = useMemo<KanbanContextValue>(
    () => ({
      colunas:     colunasRender,
      renderCard:  renderCard as KanbanContextValue['renderCard'],
      isReadOnly:  isReadOnly ?? !onMoverItem,
      emptyLabel,
      activeId,
      movingId,
      testIdPrefix,
      modoGlobal,
      colunaFooterSlot,
      onMoverItemInternal: handleMoverItemInternal,
      onCardClick: onCardClick as KanbanContextValue['onCardClick'],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colunasRender, renderCard, isReadOnly, onMoverItem, emptyLabel,
     activeId, movingId, testIdPrefix, modoGlobal, colunaFooterSlot,
     handleMoverItemInternal, onCardClick],
  )

  return (
    <KanbanContext.Provider value={ctxValue}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {toolbarSlot && (
          <div className="kg-toolbar-slot">{toolbarSlot}</div>
        )}

        <div className="kg-grid" data-testid={`${testIdPrefix}-board`}>
          {colunasRender.map(col => (
            <KanbanColuna
              key={col.key}
              coluna={col}
              itens={isLoading ? [] : (getColumnItems(col.key) as KanbanItem[])}
              sort={columnSorts[col.key] ?? 'newest'}
              onSortChange={(sort) => handleSortChange(col.key, sort)}
              isLoading={isLoading}
              skeletonCount={skeletonCount}
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
    </KanbanContext.Provider>
  )
}
