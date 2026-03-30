import type { ReactNode, CSSProperties } from 'react'

export type EspacamentoToken = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16

export interface StackProps {
  /** Espaçamento entre itens (escala de tokens: 1=4px, 4=16px, 8=32px) */
  gap?: EspacamentoToken
  /** Alinhamento horizontal dos itens */
  alinhar?: 'start' | 'center' | 'end' | 'stretch'
  /** Tag HTML do container */
  as?: 'div' | 'section' | 'main' | 'aside' | 'form'
  /** Conteúdo */
  children: ReactNode
  /** Classes extras */
  className?: string
  /** Estilos inline extras */
  style?: CSSProperties
}
