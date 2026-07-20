/**
 * Tooltip interativa por hover — painéis informativos do dashboard Minha jornada.
 */

import React from 'react'
import { Info } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

interface PopoverInfoDashboardGuiaGravityProps {
  titulo: string
  ariaLabel: string
  children: React.ReactNode
  alinhamentoHorizontal?: 'inicio' | 'centro' | 'fim'
  posicaoPreferida?: 'abaixo' | 'acima'
}

export function PopoverInfoDashboardGuiaGravity({
  titulo,
  ariaLabel,
  children,
  alinhamentoHorizontal = 'fim',
  posicaoPreferida = 'abaixo',
}: PopoverInfoDashboardGuiaGravityProps) {
  return (
    <TooltipGlobal
      titulo={titulo}
      descricao={children}
      interativo
      silenciarIconeAuxiliar
      posicaoPreferida={posicaoPreferida}
      alinhamentoHorizontal={alinhamentoHorizontal}
    >
      <button
        type="button"
        className="uni-dashboard-nivel-info-trigger"
        aria-label={ariaLabel}
      >
        <Info size={11} weight="fill" aria-hidden />
      </button>
    </TooltipGlobal>
  )
}
