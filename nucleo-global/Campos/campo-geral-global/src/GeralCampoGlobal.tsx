import React, { ReactNode } from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export interface GeralCampoGlobalProps {
  label?: string
  tooltipTitulo?: string
  tooltipDescricao?: string
  children: ReactNode
  className?: string
  obrigatorio?: boolean
}

export function GeralCampoGlobal({
  label,
  tooltipTitulo,
  tooltipDescricao,
  children,
  className = '',
  obrigatorio = false
}: GeralCampoGlobalProps) {
  const compLabel = label ? (obrigatorio ? `${label} *` : label) : null

  return (
    <div className={`ws-field ${className}`.trim()}>
      {compLabel && (
        <label>
          {tooltipTitulo && tooltipDescricao ? (
            <TooltipGlobal titulo={tooltipTitulo} descricao={tooltipDescricao}>
              <span style={{ cursor: 'help' }}>{compLabel}</span>
            </TooltipGlobal>
          ) : (
            <span>{compLabel}</span>
          )}
        </label>
      )}
      {children}
    </div>
  )
}
