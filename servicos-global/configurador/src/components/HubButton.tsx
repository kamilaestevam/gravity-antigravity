import React from 'react'
import { Graph } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

interface HubButtonProps {
  onClick: () => void
  label?: string
  tooltip?: string
}

export function HubButton({ onClick, label = 'Hub', tooltip = 'Voltar ao Hub' }: HubButtonProps) {
  return (
    <TooltipGlobal titulo={tooltip} descricao={tooltip}>
      <button
        onClick={onClick}
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.875rem',
          borderRadius: '9999px',
          border: '1px solid rgba(129,140,248,0.25)',
          background: 'rgba(129,140,248,0.08)',
          color: '#818cf8',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.15)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.25)' }}
      >
        <Graph size={16} weight="bold" />
        {label}
      </button>
    </TooltipGlobal>
  )
}
