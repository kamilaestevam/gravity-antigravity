import type { ReactNode } from 'react'

/**
 * Props do CabecalhoGlobal — cabeçalho padrão de página Gravity.
 */
export interface CabecalhoProps {
  /** Título principal da página */
  titulo: string
  /** Subtítulo / descrição da página */
  subtitulo?: string
  /** Ícone à esquerda do título (ReactNode — ex: ícone Phosphor) */
  icone?: ReactNode
  /** Slot direito — ex: botão de ação primária */
  acoes?: ReactNode
}
