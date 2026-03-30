import React from 'react'
import type { GridProps } from './tipos.js'
import './grid.css'

const GAP_MAP: Record<number, string> = {
  1:  '0.25rem',
  2:  '0.5rem',
  3:  '0.75rem',
  4:  '1rem',
  5:  '1.25rem',
  6:  '1.5rem',
  8:  '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
}

/**
 * GridGlobal — Grid responsivo com colunas configuráveis.
 *
 * Match com .em-grid do Configurador:
 * - gap=5 (1.25rem) para formulários
 * - margin-bottom: 1.25rem entre grids (:last-child → 0)
 * - Responsivo: 3+ colunas → 2 abaixo de 900px, tudo → 1 abaixo de 640px
 *
 * @example
 * // Grid de formulário (match Configurador)
 * <GridGlobal colunas={2} gap={5}>
 *   <GeralCampoGlobal label="Nome" ... />
 *   <GeralCampoGlobal label="CNPJ" ... />
 * </GridGlobal>
 *
 * // Grid 4 colunas (match .em-grid--4)
 * <GridGlobal colunas={4} gap={5}>
 *   <GeralCampoGlobal ... />
 *   <GeralCampoGlobal ... />
 *   <GeralCampoGlobal ... />
 *   <GeralCampoGlobal ... />
 * </GridGlobal>
 */
export function GridGlobal({
  colunas = 'auto',
  larguraMin = 280,
  gap = 4,
  as: Tag = 'div',
  children,
  className = '',
  style,
}: GridProps) {
  const gridTemplate = colunas === 'auto'
    ? `repeat(auto-fill, minmax(${larguraMin}px, 1fr))`
    : `repeat(${colunas}, 1fr)`

  const colClass = typeof colunas === 'number' ? `gb-grid--cols-${colunas}` : ''

  return (
    <Tag
      className={`gb-grid ${colClass} ${className}`.trim()}
      style={{
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        gap: GAP_MAP[gap],
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}
