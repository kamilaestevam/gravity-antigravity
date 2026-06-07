/**
 * TooltipListaColuna — SSOT visual da lista de pedidos (título + pills + aviso).
 *
 * O título é SEMPRE resolvido aqui via `colunaKey` + `nivel` — callers não podem
 * passar título de pedido numa célula de item por engano ou legado do núcleo.
 */

import React from 'react'
import type { TFunction } from 'i18next'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { RegraPillId } from './pillsTooltipColunaLista'
import type { NivelColunaLista } from './regrasTooltipColunaLista'
import { tituloTooltipListaPorNivel } from './tituloTooltipLista'
import { TooltipRegrasColuna } from './TooltipRegrasColuna'

export type TooltipListaColunaProps = {
  colunaKey: string
  nivel: NivelColunaLista
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
  colunaKey,
  nivel,
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
  const titulo = tituloTooltipListaPorNivel(t, colunaKey, nivel)
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
          ghostSemCheckbox={ghostSemCheckbox && nivel === 'pai'}
          numeroUnicoOrg={numeroUnicoOrg && nivel === 'pai'}
          aviso={aviso}
          avisoImpacto={avisoImpacto}
          descricaoExtra={descricaoExtra}
        />
      )}
      interativo={interativo}
      cursorBloqueado={cursorBloqueado}
    >
      <span
        style={styleTrigger}
        data-tooltip-lista-coluna={colunaKey}
        data-tooltip-lista-nivel={nivel}
      >
        {children}
      </span>
    </TooltipGlobal>
  )
}
