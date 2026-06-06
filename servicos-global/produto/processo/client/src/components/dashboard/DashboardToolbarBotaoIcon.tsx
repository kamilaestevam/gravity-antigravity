/**
 * DashboardToolbarBotaoIcon — botão circular da toolbar Processo.
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
  disabled?: boolean
}

export function DashboardToolbarBotaoIcon({
  titulo,
  descricao,
  icone,
  ariaLabel,
  onClick,
  'data-testid': dataTestId,
  disabled = false,
}: DashboardToolbarBotaoIconProps) {
  return (
    <TooltipGlobal titulo={titulo} descricao={descricao}>
      <BotaoGlobal
        variante="secundario"
        tamanho="pequeno"
        icone={icone}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        className="processo-dashboard-toolbar-botao-icone"
        onClick={onClick}
        disabled={disabled}
      />
    </TooltipGlobal>
  )
}
