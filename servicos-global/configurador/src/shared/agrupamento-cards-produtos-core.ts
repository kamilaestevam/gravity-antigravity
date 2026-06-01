/**
 * agrupamento-cards-produtos-core.ts — agrupa cards por papel (workspace vs fornecedor).
 * Módulo sem dependências de UI (testável em node).
 */

import type { VarianteCardProdutoCore } from './cards-produtos-core-types.js'

export interface CardComVarianteCore {
  key: string
  variant: VarianteCardProdutoCore
}

export interface AgrupamentoCardsProdutosCore<T extends CardComVarianteCore = CardComVarianteCore> {
  meusProdutos: T[]
  comoFornecedor: T[]
}

export function agruparCardsProdutosCore<T extends CardComVarianteCore>(
  cards: readonly T[],
): AgrupamentoCardsProdutosCore<T> {
  const meusProdutos: T[] = []
  const comoFornecedor: T[] = []
  for (const card of cards) {
    if (card.variant === 'bid_fornecedor') {
      comoFornecedor.push(card)
    } else {
      meusProdutos.push(card)
    }
  }
  return { meusProdutos, comoFornecedor }
}

export function temDuasZonasProdutosCore(grupo: AgrupamentoCardsProdutosCore): boolean {
  return grupo.meusProdutos.length > 0 && grupo.comoFornecedor.length > 0
}
