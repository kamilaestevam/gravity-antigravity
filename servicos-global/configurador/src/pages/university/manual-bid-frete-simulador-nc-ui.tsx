import React from 'react'

export const ICONE_LABEL_SECAO = { size: 13, weight: 'fill' as const }
export const ICONE_FIELD = ICONE_LABEL_SECAO

export function SimuladorNcOptionButton({
  selected,
  onClick,
  icon,
  label,
  description,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      className={`nc-option-btn${selected ? ' nc-option-btn--selected' : ''}`}
      onClick={onClick}
    >
      <div className="nc-option-checkbox">
        {selected ? <span className="nc-option-checkmark">✓</span> : null}
      </div>
      <span className="nc-option-icon">{icon}</span>
      <div className="nc-option-text">
        <span className="nc-option-label">{label}</span>
        {description ? <span className="nc-option-desc">{description}</span> : null}
      </div>
    </button>
  )
}

export function SimuladorNcSectionTitle({
  icone,
  obrigatorio,
  children,
}: {
  icone: React.ReactNode
  obrigatorio?: boolean
  children: React.ReactNode
}) {
  return (
    <h3 className="nc-section-title">
      {icone}
      {children}
      {obrigatorio ? <span className="nc-obrig">*</span> : null}
    </h3>
  )
}

export function SimuladorNcField({
  label,
  icone,
  obrigatorio,
  className,
  children,
}: {
  label: string
  icone: React.ReactNode
  obrigatorio?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`nc-field${className ? ` ${className}` : ''}`}>
      <label className="nc-field-label">
        {icone}
        {label}
        {obrigatorio ? <span className="nc-obrig">*</span> : null}
      </label>
      {children}
    </div>
  )
}
