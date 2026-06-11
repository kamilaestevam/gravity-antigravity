/**
 * DashboardToolbarBotaoIcon — botão circular da toolbar (paridade Lista / BotaoGlobal).
 */

import React from 'react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export interface DashboardToolbarBotaoIconProps {
  titulo: string
  descricao: string
  icone: React.ReactNode
  ariaLabel: string
  onClick?: () => void
  'data-testid'?: string
  ariaExpanded?: boolean
  ariaHaspopup?: React.AriaAttributes['aria-haspopup']
  destacado?: boolean
}

export function DashboardToolbarBotaoIcon({
  titulo,
  descricao,
  icone,
  ariaLabel,
  onClick,
  'data-testid': dataTestId,
  ariaExpanded,
  ariaHaspopup,
  destacado = false,
}: DashboardToolbarBotaoIconProps) {
  return (
    <TooltipGlobal titulo={titulo} descricao={descricao}>
      <BotaoGlobal
        variante={destacado ? 'primario' : 'secundario'}
        tamanho="pequeno"
        icone={icone}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHaspopup}
        data-testid={dataTestId}
        className="bid-frete-dashboard-toolbar-botao-icone"
        onClick={onClick}
      />
    </TooltipGlobal>
  )
}
