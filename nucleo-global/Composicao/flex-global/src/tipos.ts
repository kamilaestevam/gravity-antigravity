import type { ReactNode, CSSProperties } from 'react'

export type EspacamentoToken = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16

export interface FlexProps {
  /** Espaçamento entre itens (escala de tokens) */
  gap?: EspacamentoToken
  /** Alinhamento vertical */
  alinhar?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  /** Distribuição horizontal */
  justificar?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  /** Permite quebra de linha */
  wrap?: boolean
  /** Tag HTML do container */
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav'
  /** Conteúdo */
  children: ReactNode
  /** Classes extras */
  className?: string
  /** Estilos inline extras */
  style?: CSSProperties
}
