/**
 * tooltip-conferencia-regra-smart-read.tsx — corpo da tooltip de regra do checklist
 * (o que analisamos + base legal, quando disponível no SSOT).
 */

import type { ReactElement } from 'react'
import { Scales } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export type PropsTooltipConferenciaRegraSmartRead = {
  titulo: string
  tooltip_conferencia: string
  base_normativa?: string
  children: ReactElement
}

function ConteudoTooltipConferenciaRegra({
  tooltip_conferencia,
  base_normativa,
}: {
  tooltip_conferencia: string
  base_normativa?: string
}) {
  return (
    <span className="sr-conf-chk-tooltip-conteudo">
      <span className="sr-conf-chk-tooltip-analise">{tooltip_conferencia}</span>
      {base_normativa ? (
        <>
          <span className="sr-conf-chk-tooltip-separador" aria-hidden />
          <span className="sr-conf-chk-tooltip-base-cabecalho">
            <Scales size={14} weight="duotone" aria-hidden />
            Base legal
          </span>
          <span className="sr-conf-chk-tooltip-base-texto">{base_normativa}</span>
        </>
      ) : null}
    </span>
  )
}

export function TooltipConferenciaRegraSmartRead({
  titulo,
  tooltip_conferencia,
  base_normativa,
  children,
}: PropsTooltipConferenciaRegraSmartRead) {
  const temBaseLegal = Boolean(base_normativa?.trim())

  return (
    <TooltipGlobal
      titulo={titulo}
      descricao={
        <ConteudoTooltipConferenciaRegra
          tooltip_conferencia={tooltip_conferencia}
          base_normativa={base_normativa}
        />
      }
      interativo={temBaseLegal}
      posicaoPreferida="abaixo"
    >
      {children}
    </TooltipGlobal>
  )
}
