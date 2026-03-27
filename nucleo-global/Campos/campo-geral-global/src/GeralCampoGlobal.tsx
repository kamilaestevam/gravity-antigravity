import React, { ReactNode } from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './campo-geral.css'

export interface GeralCampoGlobalProps {
  label?: string
  tooltipTitulo?: string
  tooltipDescricao?: string
  children: ReactNode
  className?: string
  obrigatorio?: boolean
  erro?: string
  hint?: string
}

export function GeralCampoGlobal({
  label,
  tooltipTitulo,
  tooltipDescricao,
  children,
  className = '',
  obrigatorio = false,
  erro,
  hint,
}: GeralCampoGlobalProps) {
  const compLabel = label ? (obrigatorio ? `${label} *` : label) : null

  return (
    <div className={`cg-wrapper ${erro ? 'cg-wrapper--erro' : ''} ${className}`.trim()}>
      {compLabel && (
        <label className="cg-label">
          {tooltipTitulo && tooltipDescricao ? (
            <TooltipGlobal titulo={tooltipTitulo} descricao={tooltipDescricao}>
              <span>{compLabel}</span>
            </TooltipGlobal>
          ) : (
            <span>{compLabel}</span>
          )}
        </label>
      )}
      {children}
      {hint && !erro && (
        <span className="cg-hint">{hint}</span>
      )}
      {erro && (
        <span className="cg-erro" role="alert">{erro}</span>
      )}
    </div>
  )
}
