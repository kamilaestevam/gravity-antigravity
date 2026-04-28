import React, { ReactNode } from 'react'
import './tooltip-stat-card.css'

export interface TooltipStatCardGlobalProps {
  /** Ícone opcional clonado do cabeçalho do StatCard */
  icone?: ReactNode
  /** Título obrigatório clonado do cabeçalho do StatCard para montagem automática */
  titulo: string
  /** O conteúdo customizado a ser renderizado pelo desenvolvedor na tooltip (ex. StatCardTooltipRow) */
  children: ReactNode
}

/**
 * Tooltip nativa customizada para o contexto do CardEstatisticaGlobal.
 * Não é um componente global solto, é fortemente acoplado ao sub-ecossistema do Card.
 */
export function TooltipCardEstatisticaGlobal({ icone, titulo, children }: TooltipStatCardGlobalProps) {
  return (
    <div className="scg-card__tooltip">
      {/* Cabeçalho automático: ícone + título reutizado de cima */}
      <div className="scg-tooltip__header">
        {icone && <span className="scg-tooltip__header-icon">{icone}</span>}
        <p className="scg-tooltip__title">{titulo}</p>
      </div>
      
      <div className="scg-tooltip__divider" />
      
      {/* Injeção do detalhamento */}
      {children}
    </div>
  )
}
