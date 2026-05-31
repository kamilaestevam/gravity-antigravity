import React from 'react'
import { Buildings } from '@phosphor-icons/react'

/** Badge compacto com nome da organização (empresa) do usuário. */
export function OrgBadge({ nome }: { nome: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.18rem 0.55rem',
        borderRadius: '9999px',
        background: 'rgba(139,92,246,0.1)',
        border: '1px solid rgba(139,92,246,0.2)',
        color: '#a78bfa',
        fontSize: '0.6875rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}
    >
      <Buildings size={11} weight="duotone" aria-hidden />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{nome}</span>
    </span>
  )
}
