import React from 'react'
import './cfg-section-label.css'

export interface CfgSectionLabelProps {
  label: string
  count?: string | number
  hint?: string
  action?: React.ReactNode
  style?: React.CSSProperties
}

export function ConfiguracaoSecaoGlobal({ label, count, hint, action, style }: CfgSectionLabelProps) {
  return (
    <div className="cfg-section-label-header" style={style}>
      <p className="cfg-section-label-text">
        {label}
        {count !== undefined && (
          <span className="cfg-section-label-count">{count}</span>
        )}
      </p>
      {hint && <span className="cfg-section-label-hint">{hint}</span>}
      {action}
    </div>
  )
}
