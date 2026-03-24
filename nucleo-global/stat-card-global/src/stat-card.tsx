import React from 'react'
import { ArrowUp, ArrowDown, ArrowRight } from '@phosphor-icons/react'
import type { StatCardProps } from './tipos'
import './stat-card.css'

export interface StatCardGlobalProps extends StatCardProps {
  /** Alinhamento do conteúdo: à esquerda (padrão) ou centralizado */
  alinhamento?: 'esquerda' | 'centro'
}

/**
 * StatCardGlobal — Mini Dashboard Card do Gravity Design System
 * 
 * Card flexível para exibição de métricas rápidas.
 * Suporta título, ícone, grande valor numérico, indicador de tendência e subtexto.
 */
export function StatCardGlobal({
  titulo,
  valor,
  tendencia,
  subtexto,
  icone,
  variante = 'padrao',
  alinhamento = 'esquerda',
  className = '',
  tooltip,
}: StatCardGlobalProps) {

  const baseClass = [
    'scg-card',
    `scg-card--${variante}`,
    `scg-card--align-${alinhamento}`,
    tooltip ? 'scg-card--has-tooltip' : '',
    className
  ].filter(Boolean).join(' ')
  
  return (
    <div className={baseClass}>
      <div className="scg-card__header">
        {icone && <div className="scg-card__icon-wrap">{icone}</div>}
        <p className="scg-card__label">{titulo}</p>
      </div>
      
      <div className="scg-card__body">
        <div className="scg-card__value-row">
          <span className="scg-card__value">{valor}</span>
          
          {tendencia && (
            <span className={`scg-card__trend scg-card__trend--${tendencia.direcao}`}>
              {tendencia.direcao === 'up' && <ArrowUp size={12} weight="bold" />}
              {tendencia.direcao === 'down' && <ArrowDown size={12} weight="bold" />}
              {tendencia.direcao === 'neutral' && <ArrowRight size={12} weight="bold" />}
              {tendencia.valor}
            </span>
          )}
        </div>

        {subtexto && (
          <div className="scg-card__subtext">
            {subtexto}
          </div>
        )}
      </div>

      {tooltip && (
        <div className="scg-card__tooltip">
          {/* Cabeçalho automático: ícone + título */}
          <div className="scg-tooltip__header">
            {icone && <span className="scg-tooltip__header-icon">{icone}</span>}
            <p className="scg-tooltip__title">{titulo}</p>
          </div>
          <div className="scg-tooltip__divider" />
          {tooltip}
        </div>
      )}
    </div>
  )
}
