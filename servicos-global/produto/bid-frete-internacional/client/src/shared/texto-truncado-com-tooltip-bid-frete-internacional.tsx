/**
 * Truncamento de texto com ícone Eye + tooltip — paridade Pedido (ColunasFilho / ColunasPai).
 */
import React from 'react'
import { Eye } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  LIMITE_TRUNCAR_DESCRICAO_LISTA,
  LIMITE_TRUNCAR_TEXTO_BID_FRETE_INTERNACIONAL,
  montarTextoTruncadoExibicao,
} from './texto-truncado-bid-frete-internacional.js'

export {
  LIMITE_TRUNCAR_DESCRICAO_LISTA,
  LIMITE_TRUNCAR_TEXTO_BID_FRETE_INTERNACIONAL,
  montarTextoTruncadoExibicao,
} from './texto-truncado-bid-frete-internacional.js'

export function TextoTruncadoComTooltip({
  texto,
  rotuloTooltip,
  className,
  limiteCaracteres = LIMITE_TRUNCAR_TEXTO_BID_FRETE_INTERNACIONAL,
}: {
  texto: string | null | undefined
  rotuloTooltip?: string
  className?: string
  limiteCaracteres?: number
}): React.ReactElement {
  if (!texto?.trim()) {
    return <span className={className} style={{ color: 'var(--text-muted)' }}>—</span>
  }

  const valor = texto.trim()
  const titulo = rotuloTooltip?.trim() || valor
  const { truncado, exibicao } = montarTextoTruncadoExibicao(valor, limiteCaracteres)

  if (!truncado) {
    return <span className={className}>{valor}</span>
  }

  return (
    <TooltipGlobal titulo={titulo} descricao={valor}>
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {exibicao}
        </span>
        <Eye size={14} style={{ flexShrink: 0, opacity: 0.6 }} aria-hidden />
      </span>
    </TooltipGlobal>
  )
}
