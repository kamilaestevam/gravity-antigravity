import React from 'react'
import './switch.css'

export interface SwitchGlobalProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

export function SwitchGlobal({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  id
}: SwitchGlobalProps) {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`sg-container ${disabled ? 'sg-container--disabled' : ''} ${className}`}>
      {label && <label htmlFor={switchId} className="sg-label">{label}</label>}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`sg-root ${checked ? 'sg-root--checked' : ''}`}
      >
        <span className={`sg-thumb ${checked ? 'sg-thumb--checked' : ''}`} />
      </button>
    </div>
  )
}
