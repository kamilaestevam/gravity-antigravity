/**
 * CelulaIdentidadeItemLista — coluna Processo (L3): part number + descrição.
 * A tag Item N fica na coluna expand (ConectorFilhoLista).
 */
import type { ReactElement, ReactNode } from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { PedidoItem } from '../../shared/lista/pedidoTypes'

type Props = {
  item: PedidoItem
}

function textoPartNumber(partNumber: string): ReactNode {
  if (partNumber.length <= 40) {
    return partNumber
  }
  return (
    <TooltipGlobal titulo="Part Number" descricao={partNumber}>
      <span>{partNumber.slice(0, 40)}…</span>
    </TooltipGlobal>
  )
}

function textoDescricao(descricao: string): ReactNode {
  if (descricao.length <= 60) {
    return descricao
  }
  return (
    <TooltipGlobal titulo="Descrição do item" descricao={descricao}>
      <span>{descricao}</span>
    </TooltipGlobal>
  )
}

export function CelulaIdentidadeItemLista({ item }: Props): ReactElement {
  const partNumber = item.part_number?.trim() ?? ''
  const descricao = item.descricao_item?.trim() ?? ''

  if (!partNumber && !descricao) {
    return <span className="pl-celula-vazia">—</span>
  }

  return (
    <div className="pl-item-identidade">
      {partNumber ? (
        <span className="pl-item-identidade__pn">
          {textoPartNumber(partNumber)}
        </span>
      ) : (
        <span className="pl-celula-vazia">—</span>
      )}
      {descricao ? (
        <span className="pl-item-identidade__desc">
          {textoDescricao(descricao)}
        </span>
      ) : null}
    </div>
  )
}
