import type { ReactNode } from 'react'

export interface StatCardProps {
  /** Rótulo principal do card (ex: "TOTAL DE FILHAS") */
  titulo: string
  /** Valor numérico ou string a ser exibido em destaque (ex: "30" ou "2") */
  valor: ReactNode
  /** Objeto opcional para indicar tendência métrica (ex: { valor: "15%", direcao: "up" }) */
  tendencia?: {
    valor: string
    direcao: 'up' | 'down' | 'neutral'
  }
  /** Subtexto opcional exibido no rodapé do card (ex: "20 slots disponíveis") */
  subtexto?: ReactNode
  /** Ícone opcional que pode ser acompanhado ao título (ex: <span className="stat-dot red" />) */
  icone?: ReactNode
  /** Variantes de cor do card. Ajusta bordas e glow */
  variante?: 'padrao' | 'sucesso' | 'aviso' | 'perigo' | 'primario'
  /** Classe CSS extra para customizações */
  className?: string
  /** Conteúdo do tooltip exibido ao hover no card */
  tooltip?: ReactNode
}
