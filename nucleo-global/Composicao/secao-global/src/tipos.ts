import type { ReactNode, CSSProperties } from 'react'

export interface SecaoProps {
  /** Título da seção (exibido em uppercase como ws-section-title) */
  titulo?: string
  /** Subtítulo ou descrição */
  subtitulo?: string
  /** Ícone à esquerda do título (Phosphor React element) */
  icone?: ReactNode
  /** Ações à direita do título (botões, links) */
  acoes?: ReactNode
  /** Conteúdo da seção */
  children: ReactNode
  /** Adiciona card (background surface + border accent + border radius) ao redor */
  card?: boolean
  /** Animação de entrada staggered (ws-fade-up). Valor = delay index (0, 1, 2, 3) */
  fadeIndex?: 0 | 1 | 2 | 3
  /** Classes extras */
  className?: string
  /** Estilos inline extras */
  style?: CSSProperties
}
