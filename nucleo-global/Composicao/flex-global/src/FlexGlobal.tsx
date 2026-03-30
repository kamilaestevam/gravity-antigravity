import React from 'react'
import type { FlexProps } from './tipos.js'

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
  start:    'flex-start',
  center:   'center',
  end:      'flex-end',
  stretch:  'stretch',
  baseline: 'baseline',
}

const JUSTIFY_MAP: Record<string, string> = {
  start:   'flex-start',
  center:  'center',
  end:     'flex-end',
  between: 'space-between',
  around:  'space-around',
  evenly:  'space-evenly',
}

/**
 * FlexGlobal — Layout horizontal com alinhamento e distribuição.
 *
 * Substitui divs com display: flex + gap + justify-content manuais.
 *
 * @example
 * <FlexGlobal justificar="between" alinhar="center">
 *   <h2>Título</h2>
 *   <BotaoGlobal variante="primario">Novo</BotaoGlobal>
 * </FlexGlobal>
 */
export function FlexGlobal({
  gap = 4,
  alinhar = 'center',
  justificar = 'start',
  wrap = false,
  as: Tag = 'div',
  children,
  className = '',
  style,
}: FlexProps) {
  return (
    <Tag
      className={`gb-flex ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: GAP_MAP[gap],
        alignItems: ALIGN_MAP[alinhar],
        justifyContent: JUSTIFY_MAP[justificar],
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}
