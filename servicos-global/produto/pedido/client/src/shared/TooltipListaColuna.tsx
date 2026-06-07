/**
 * TooltipListaColuna — SSOT visual da lista de pedidos (título + pills + aviso).
 *
 * Componente único do produto Pedido para tooltips de regra na lista.
 * O núcleo (GTV) não monta tooltip de regra quando `tooltipInline: true`.
 *
 * Pills: vocabulário e ordem canônica em `pillsTooltipColunaLista.ts`
 * (espelha LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md §0 e /tooltip-pedido).
 */

import React from 'react'
import type { TFunction } from 'i18next'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { RegraPillId } from './pillsTooltipColunaLista'
import { TooltipRegrasColuna } from './TooltipRegrasColuna'

export type TooltipListaColunaProps = {
  titulo: string
  children: React.ReactNode
  t: TFunction
  pills: RegraPillId[]
  aviso?: React.ReactNode
  avisoImpacto?: string
  descricaoExtra?: string
  linkFormula?: boolean
  ghostSemCheckbox?: boolean
  numeroUnicoOrg?: boolean
  interativo?: boolean
  cursorBloqueado?: boolean
  triggerStyle?: React.CSSProperties
}

/** Tooltip completa da lista — título no shell, pills no corpo. */
export function TooltipListaColuna({
  titulo,
  children,
  t,
  pills,
  aviso,
  avisoImpacto,
  descricaoExtra,
  linkFormula = false,
  ghostSemCheckbox = false,
  numeroUnicoOrg = false,
  interativo,
  cursorBloqueado,
  triggerStyle,
}: TooltipListaColunaProps) {
  const styleTrigger = triggerStyle
    ?? (cursorBloqueado
      ? {
        display: 'flex',
        flex: 1,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'inherit',
        minWidth: 0,
        width: '100%',
        cursor: 'not-allowed',
      }
      : { display: 'contents' })

  return (
    <TooltipGlobal
      titulo={titulo}
      descricao={(
        <TooltipRegrasColuna
          t={t}
          pillsPedido={pills}
          linkFormula={linkFormula}
          ghostSemCheckbox={ghostSemCheckbox}
          numeroUnicoOrg={numeroUnicoOrg}
          aviso={aviso}
          avisoImpacto={avisoImpacto}
          descricaoExtra={descricaoExtra}
        />
      )}
      interativo={interativo}
      cursorBloqueado={cursorBloqueado}
    >
      <span style={styleTrigger}>{children}</span>
    </TooltipGlobal>
  )
}
