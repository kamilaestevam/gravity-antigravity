import React from 'react'
import { Eye } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export interface LogoModoBadgeVisaoFornecedorProps {
  label: string
  ariaLabel: string
  tooltipTitulo: string
  tooltipDescricao: string
  /** Classe par tipográfico com o nome do produto (mlg-logo-titulo-par) */
  textoClassName: string
}

/** Badge: ícone visão + rótulo fornecedor (cor = TIPO Fornecedor no Configurador) */
export function LogoModoBadgeVisaoFornecedor({
  label,
  ariaLabel,
  tooltipTitulo,
  tooltipDescricao,
  textoClassName,
}: LogoModoBadgeVisaoFornecedorProps) {
  const tituloPar = textoClassName.includes('mlg-logo-titulo-par')
  return (
    <TooltipGlobal
      titulo={tooltipTitulo}
      descricao={tooltipDescricao}
      posicaoPreferida="abaixo"
      alinhamentoHorizontal="inicio"
    >
      <span
        className="mlg-logo-modo-badge"
        role="status"
        aria-label={ariaLabel}
      >
        <Eye
          className="mlg-logo-modo-badge__icone"
          weight="duotone"
          size={tituloPar ? 11 : 15}
          aria-hidden
        />
        <span className={`mlg-logo-modo-badge__texto ${textoClassName}`}>{label}</span>
      </span>
    </TooltipGlobal>
  )
}
