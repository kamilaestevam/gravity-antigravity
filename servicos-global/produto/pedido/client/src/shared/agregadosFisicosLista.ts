import type { PedidoItem } from './types'

/** Contribuição física de um item: unitário × qtd. inicial (espelha recalcularAgregadosPedido). */
function contribuicaoFisicaItem(
  unitario: number | null | undefined,
  quantidadeInicial: number | null | undefined,
): number {
  const unit = Number(unitario) || 0
  const qty = Number(quantidadeInicial) || 0
  return unit * qty
}

export function somaPesoLiquidoItensLista(itens: PedidoItem[]): number {
  return itens.reduce(
    (s, i) => s + contribuicaoFisicaItem(i.peso_liquido_unitario, i.quantidade_inicial_pedido),
    0,
  )
}

export function somaPesoBrutoItensLista(itens: PedidoItem[]): number {
  return itens.reduce(
    (s, i) => s + contribuicaoFisicaItem(i.peso_bruto_unitario, i.quantidade_inicial_pedido),
    0,
  )
}

export function somaCubagemItensLista(itens: PedidoItem[]): number {
  return itens.reduce(
    (s, i) => s + contribuicaoFisicaItem(i.cubagem_unitaria, i.quantidade_inicial_pedido),
    0,
  )
}

/** Soma valor_total_item quando moedas homogêneas (Onda A8 — espelha backend). */
export function somaValorTotalPedidoLocal(itens: PedidoItem[]): number | null {
  const moedasContrib = new Set(
    itens
      .filter(i => Number(i.valor_total_item ?? 0) > 0 && i.moeda_item)
      .map(i => i.moeda_item as string),
  )
  if (moedasContrib.size > 1) return null
  return itens.reduce((s, i) => s + (Number(i.valor_total_item) || 0), 0)
}

/** Soma qtd. inicial quando unidades homogêneas (Onda A8 — espelha backend). */
export function somaQuantidadeTotalPedidoLocal(itens: PedidoItem[]): number | null {
  const unidadesContrib = new Set(
    itens
      .filter(i => Number(i.quantidade_inicial_pedido ?? 0) > 0 && i.unidade_comercializada_item)
      .map(i => i.unidade_comercializada_item as string),
  )
  if (unidadesContrib.size > 1) return null
  return itens.reduce((s, i) => s + (Number(i.quantidade_inicial_pedido) || 0), 0)
}
