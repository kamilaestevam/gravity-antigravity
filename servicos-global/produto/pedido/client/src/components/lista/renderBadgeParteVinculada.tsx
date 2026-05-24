/**
 * Badge de contraparte vinculada (Exportador/Importador via Cadastros) — espelha ColunasPai nos itens.
 */

import React from 'react'
import { LinkSimple, PencilSimpleLine } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

const BADGE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  cursor: 'pointer',
  background: 'rgba(129, 140, 248, 0.12)',
  border: '1px solid rgba(129, 140, 248, 0.28)',
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '0.78rem',
  color: '#818cf8',
  maxWidth: '100%',
}

export function renderBadgeParteVinculada(opts: {
  nome: string
  titulo: string
  descricao: string
  href: string
}): React.ReactElement {
  const { nome, titulo, descricao, href } = opts
  const truncado = nome.length > 50
  const nomeExibicao = truncado ? `${nome.slice(0, 50)}…` : nome

  return (
    <TooltipGlobal
      titulo={titulo}
      descricao={truncado ? `${descricao} — ${nome}` : descricao}
    >
      <span
        role="link"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); window.location.href = href }}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
        style={BADGE_STYLE}
      >
        <LinkSimple size={12} weight="bold" style={{ flexShrink: 0, color: '#818cf8' }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nomeExibicao}</span>
      </span>
    </TooltipGlobal>
  )
}

export function renderLinkVincularParte(opts: {
  label: string
  descricao: string
  href: string
}): React.ReactElement {
  const { label, descricao, href } = opts
  return (
    <TooltipGlobal titulo={label} descricao={descricao}>
      <span
        role="link"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); window.location.href = href }}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }}
        style={{
          color: '#818cf8',
          cursor: 'pointer',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
        }}
      >
        <PencilSimpleLine size={12} weight="bold" />
        {label}
      </span>
    </TooltipGlobal>
  )
}
