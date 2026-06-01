import React from 'react'
import { Buildings } from '@phosphor-icons/react'

const ESTILO_BADGE = {
  organizacao: {
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.2)',
    color: '#a78bfa',
  },
  fornecedor: {
    background: 'rgba(245,158,11,0.1)',
    border: '1px solid rgba(245,158,11,0.2)',
    color: '#fbbf24',
  },
} as const

type VarianteBadgeEmpresa = keyof typeof ESTILO_BADGE

/** Badge compacto com nome da organização ou empresa fornecedora. */
export function OrgBadge({
  nome,
  variant = 'organizacao',
}: {
  nome: string
  variant?: VarianteBadgeEmpresa
}) {
  const estilo = ESTILO_BADGE[variant]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.18rem 0.55rem',
        borderRadius: '9999px',
        background: estilo.background,
        border: estilo.border,
        color: estilo.color,
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
