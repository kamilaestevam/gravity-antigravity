import type { ReactNode, CSSProperties } from 'react'

export type EspacamentoToken = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16

export interface GridProps {
  /** Número de colunas (1-12) ou 'auto' para auto-fill responsivo */
  colunas?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto'
  /** Largura mínima de cada coluna quando colunas='auto' (em px). Padrão: 280 */
  larguraMin?: number
  /** Espaçamento entre itens (escala de tokens) */
  gap?: EspacamentoToken
  /** Tag HTML do container */
  as?: 'div' | 'section' | 'main'
  /** Conteúdo */
  children: ReactNode
  /** Classes extras */
  className?: string
  /** Estilos inline extras */
  style?: CSSProperties
}
