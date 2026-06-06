/**
 * ConectorFilhoLista — chevron pedido→item na coluna expand das linhas filhas.
 */
import React from 'react'
import type { FilhoLinhaLista } from '../../shared/lista/mockListaHierarquica'
import { itensDoPedido } from '../../shared/lista/mockListaHierarquica'
import { rotuloItemLista } from '../../shared/lista/rotuloItemLista'

function IconeChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M4 2L8 6L4 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export interface ConectorFilhoListaProps {
  filho: FilhoLinhaLista
  pedidosExpandidos: ReadonlySet<string>
  onTogglePedido: (id_pedido: string) => void
}

export function ConectorFilhoLista({
  filho,
  pedidosExpandidos,
  onTogglePedido,
}: ConectorFilhoListaProps) {
  if (filho.camada === 'item') {
    const rotulo = rotuloItemLista(filho.item.sequencia_item)
    return (
      <div className="pl-conector-item-slot">
        <span className="pl-camada pl-camada--item pl-conector-item-tag" aria-label={rotulo}>
          {rotulo}
        </span>
      </div>
    )
  }

  const id_pedido = filho.pedido.id
  const qtd_itens = itensDoPedido(id_pedido).length
  if (qtd_itens === 0) {
    return <span className="gtv-conector pl-conector-vazio" aria-hidden="true">•</span>
  }

  const expandido = pedidosExpandidos.has(id_pedido)
  return (
    <button
      type="button"
      className="gtv-chevron-btn pl-pedido-chevron pl-conector-pedido"
      aria-expanded={expandido}
      aria-label={expandido ? 'Retrair itens do pedido' : 'Expandir itens do pedido'}
      onClick={(e) => {
        e.stopPropagation()
        onTogglePedido(id_pedido)
      }}
    >
      <span className={`gtv-chevron-icon${expandido ? ' gtv-chevron-icon--aberto' : ''}`}>
        <IconeChevron />
      </span>
    </button>
  )
}
