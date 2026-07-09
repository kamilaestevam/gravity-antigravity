/**
 * Helpers client — filtro de fornecedores elegíveis ao disparo por modal da cotação.
 */

import type { ModalFrete, Fornecedor } from '../shared/types'
import {
  resolverElegibilidadeDisparoFornecedorBidFreteInternacional,
} from '../../../shared/fornecedor-elegivel-disparo-bid-frete-internacional'

export function filtrarFornecedoresDisparoBidFreteInternacional(
  fornecedores: Fornecedor[],
  modal: ModalFrete,
): Fornecedor[] {
  return fornecedores.filter(f =>
    resolverElegibilidadeDisparoFornecedorBidFreteInternacional(modal, f),
  )
}

export function filtrarIdsFornecedoresDisparoBidFreteInternacional(
  fornecedores: Fornecedor[],
  modal: ModalFrete,
  ids: string[],
): string[] {
  const elegiveis = new Set(
    filtrarFornecedoresDisparoBidFreteInternacional(fornecedores, modal)
      .map(f => f.id_fornecedor_bid_frete_internacional),
  )
  return ids.filter(id => elegiveis.has(id))
}
