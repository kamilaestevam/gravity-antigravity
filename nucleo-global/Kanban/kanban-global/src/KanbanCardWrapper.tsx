import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { KanbanItem } from './tipos'

interface KanbanCardWrapperProps<T extends KanbanItem> {
  item: T
  renderCard: (item: T, isDragging: boolean) => React.ReactNode
  isReadOnly?: boolean
}

/**
 * Wrapper interno que adiciona drag behavior a qualquer card.
 * O visual do card é sempre delegado para renderCard.
 */
export function KanbanCardWrapper<T extends KanbanItem>({
  item,
  renderCard,
  isReadOnly,
}: KanbanCardWrapperProps<T>) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    disabled: isReadOnly,
    data: { colunaKey: item.colunaKey },
  })

  const classes = [
    'kg-card-wrapper',
    isDragging ? 'kg-dragging' : '',
    isReadOnly ? 'kg-readonly' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={setNodeRef}
      className={classes}
      {...attributes}
      {...(isReadOnly ? {} : listeners)}
    >
      {renderCard(item, isDragging)}
    </div>
  )
}
