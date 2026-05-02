import React from 'react'
import { ArrowUp, ArrowDown, ArrowRight } from '@phosphor-icons/react'
import type { StatCardProps } from './tipos'
import './CardEstatisticaGlobal.css'

export interface StatCardGlobalProps extends StatCardProps {
  /** Alinhamento do conteúdo: à esquerda (padrão) ou centralizado */
  alinhamento?: 'esquerda' | 'centro'
}

/**
 * CardEstatisticaGlobal — Mini Dashboard Card do Gravity Design System
 * 
 * Card flexível para exibição de métricas rápidas.
 * Suporta título, ícone, grande valor numérico, indicador de tendência e subtexto.
 */
import { TooltipCardEstatisticaGlobal } from '../sub-componentes/tooltip-stat-card-global/src/TooltipCardEstatisticaGlobal'

export function CardEstatisticaGlobal({
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
        <TooltipCardEstatisticaGlobal icone={icone} titulo={titulo}>
          {tooltip}
        </TooltipCardEstatisticaGlobal>
      )}
    </div>
  )
}
