import { describe, expect, it } from 'vitest'
import {
  marcarPartNumbersDuplicados,
  pedidoTemPartNumberDuplicado,
} from '../../../../servicos-global/produto/pedido/shared/partNumberDuplicado'

describe('marcarPartNumbersDuplicados', () => {
  it('marca itens com part_number repetido no mesmo pedido', () => {
    const itens = marcarPartNumbersDuplicados([
      { part_number: 'PN-A' },
      { part_number: 'PN-B' },
      { part_number: 'PN-A' },
    ])

    expect(itens[0].part_number_duplicado_no_pedido).toBe(true)
    expect(itens[1].part_number_duplicado_no_pedido).toBe(false)
    expect(itens[2].part_number_duplicado_no_pedido).toBe(true)
  })

  it('ignora part_number vazio ou só espaços', () => {
    const itens = marcarPartNumbersDuplicados([
      { part_number: '  ' },
      { part_number: '' },
      { part_number: 'PN-UNICO' },
    ])

    expect(itens.every(i => i.part_number_duplicado_no_pedido === false)).toBe(true)
  })

  it('compara com trim — espaços não evitam duplicata', () => {
    const itens = marcarPartNumbersDuplicados([
      { part_number: ' PN-X ' },
      { part_number: 'PN-X' },
    ])

    expect(itens[0].part_number_duplicado_no_pedido).toBe(true)
    expect(itens[1].part_number_duplicado_no_pedido).toBe(true)
  })

  it('menos de 2 itens nunca marca duplicado', () => {
    const itens = marcarPartNumbersDuplicados([{ part_number: 'PN-A' }])
    expect(itens[0].part_number_duplicado_no_pedido).toBe(false)
  })
})

describe('pedidoTemPartNumberDuplicado', () => {
  it('true quando algum item está marcado como duplicado', () => {
    const itens = marcarPartNumbersDuplicados([
      { part_number: 'PN-A' },
      { part_number: 'PN-A' },
    ])
    expect(pedidoTemPartNumberDuplicado(itens)).toBe(true)
  })

  it('false quando todos os part_number são únicos', () => {
    const itens = marcarPartNumbersDuplicados([
      { part_number: 'PN-A' },
      { part_number: 'PN-B' },
    ])
    expect(pedidoTemPartNumberDuplicado(itens)).toBe(false)
  })
})
