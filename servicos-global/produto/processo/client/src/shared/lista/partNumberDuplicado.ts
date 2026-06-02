/**
 * partNumberDuplicado.ts — Alerta client-side para Part Number repetido no mesmo pedido.
 */

export type ItemComAlertaPartNumber = {
  part_number?: string | null
  part_number_duplicado_no_pedido?: boolean
}

export function marcarPartNumbersDuplicados<T extends ItemComAlertaPartNumber>(itens: T[]): T[] {
  if (itens.length < 2) {
    return itens.map(item => ({ ...item, part_number_duplicado_no_pedido: false }))
  }

  const contagem = new Map<string, number>()
  for (const item of itens) {
    const pn = item.part_number?.trim()
    if (pn) contagem.set(pn, (contagem.get(pn) ?? 0) + 1)
  }

  return itens.map(item => {
    const pn = item.part_number?.trim()
    return {
      ...item,
      part_number_duplicado_no_pedido: pn ? (contagem.get(pn) ?? 0) > 1 : false,
    }
  })
}

export function pedidoTemPartNumberDuplicado(itens: ItemComAlertaPartNumber[]): boolean {
  return itens.some(item => item.part_number_duplicado_no_pedido === true)
}
