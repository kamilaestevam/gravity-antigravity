/**
 * partNumberDuplicado.ts — Alerta client-side para Part Number repetido no mesmo pedido.
 *
 * Módulo puro: zero dependências de React ou servidor.
 * A flag `part_number_duplicado_no_pedido` não persiste no banco.
 */

export type ItemComAlertaPartNumber = {
  part_number?: string | null
  part_number_duplicado_no_pedido?: boolean
}

/**
 * Marca itens cujo part_number (trim, não vazio) aparece mais de uma vez no pedido.
 */
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

/** True quando ao menos um item do pedido repete part_number (após marcação). */
export function pedidoTemPartNumberDuplicado(itens: ItemComAlertaPartNumber[]): boolean {
  return itens.some(item => item.part_number_duplicado_no_pedido === true)
}
