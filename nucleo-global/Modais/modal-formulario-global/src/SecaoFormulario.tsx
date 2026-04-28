import React from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export interface SecaoFormularioGlobalProps {
  icone: React.ReactNode
  titulo: string
  tooltip?: string
  marginBottom?: string | number
}

export function SecaoFormulario({
  icone,
  titulo,
  tooltip,
  marginBottom = '1rem',
}: SecaoFormularioGlobalProps) {
  return (
    <p className="ws-section-title" style={{ width: 'max-content', marginBottom, marginTop: 0 }}>
      {tooltip ? (
        <TooltipGlobal titulo={titulo} descricao={tooltip}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }}>
            <span style={{ color: 'var(--ws-accent)', display: 'flex', alignItems: 'center' }}>{icone}</span>
            {titulo}
          </span>
        </TooltipGlobal>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ color: 'var(--ws-accent)', display: 'flex', alignItems: 'center' }}>{icone}</span>
          {titulo}
        </span>
      )}
    </p>
  )
}
