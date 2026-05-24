/**
 * Badge visual de Importador/Exportador = Workspace (espelha ColunasPai nos itens).
 */

import React from 'react'
import { Buildings } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

const BADGE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  background: 'rgba(129, 140, 248, 0.12)',
  border: '1px solid rgba(129, 140, 248, 0.28)',
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '0.78rem',
  color: '#818cf8',
  maxWidth: '100%',
}

export type ParteWorkspacePapel = 'importador' | 'exportador'

export function renderBadgeParteWorkspace(opts: {
  nomeWorkspace: string
  titulo: string
  descricao: string
  href?: string
  somenteLeitura?: boolean
}): React.ReactElement {
  const { nomeWorkspace, titulo, descricao, href, somenteLeitura } = opts
  const truncado = nomeWorkspace.length > 50

  const badge = (
    <span
      role={href && !somenteLeitura ? 'link' : undefined}
      tabIndex={href && !somenteLeitura ? 0 : undefined}
      onClick={href && !somenteLeitura
        ? (e) => { e.stopPropagation(); window.location.href = href }
        : undefined}
      onKeyDown={href && !somenteLeitura
        ? (e) => { if (e.key === 'Enter') { e.stopPropagation(); window.location.href = href } }
        : undefined}
      style={{
        ...BADGE_STYLE,
        cursor: href && !somenteLeitura ? 'pointer' : 'default',
      }}
    >
      <Buildings size={12} weight="bold" style={{ flexShrink: 0, color: '#818cf8' }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {truncado ? `${nomeWorkspace.slice(0, 50)}…` : nomeWorkspace}
      </span>
    </span>
  )

  return (
    <TooltipGlobal
      titulo={titulo}
      descricao={truncado ? `${descricao} — ${nomeWorkspace}` : descricao}
    >
      {badge}
    </TooltipGlobal>
  )
}
