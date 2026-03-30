import React from 'react'
import type { StackProps } from './tipos.js'

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

const ALIGN_MAP: Record<string, string> = {
  start:   'flex-start',
  center:  'center',
  end:     'flex-end',
  stretch: 'stretch',
}

/**
 * StackGlobal — Empilha elementos verticalmente com espaçamento consistente.
 *
 * Substitui divs com flex-direction: column + gap manual.
 *
 * @example
 * <StackGlobal gap={4}>
 *   <CabecalhoGlobal titulo="Usuários" />
 *   <TabelaGlobal ... />
 * </StackGlobal>
 */
export function StackGlobal({
  gap = 4,
  alinhar = 'stretch',
  as: Tag = 'div',
  children,
  className = '',
  style,
}: StackProps) {
  return (
    <Tag
      className={`gb-stack ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: GAP_MAP[gap],
        alignItems: ALIGN_MAP[alinhar],
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}
