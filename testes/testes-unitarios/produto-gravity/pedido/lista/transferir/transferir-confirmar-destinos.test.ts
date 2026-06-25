import { describe, it, expect } from 'vitest'
import { montarDestinosConfirmarTransferir } from '../../../../../../servicos-global/produto/pedido/client/src/shared/transferirConfirmarDestinos'
import type { TransferDestino } from '../../../../../../servicos-global/produto/pedido/client/src/shared/types'

const destinoNovo: TransferDestino[] = [{ tipo: 'novo', quantidade: 0 }]

describe('montarDestinosConfirmarTransferir — split_novo_pedido multi-item', () => {
  it('item 0 mantém destino novo', () => {
    const res = montarDestinosConfirmarTransferir('split_novo_pedido', destinoNovo, 10, 0, undefined)
    expect(res).toEqual([{ tipo: 'novo', quantidade: 10 }])
  })

  it('item 1+ usa pedido existente criado no 1º confirmar (não o resultado do item anterior)', () => {
    const idCriado = 'pedi_id_9999999-26'
    const res = montarDestinosConfirmarTransferir('split_novo_pedido', destinoNovo, 5, 2, idCriado)
    expect(res).toEqual([{ tipo: 'existente', pedido_id: idCriado, quantidade: 5 }])
  })

  it('item 1+ sem id criado ainda mantém novo (1º item ainda não confirmou)', () => {
    const res = montarDestinosConfirmarTransferir('split_novo_pedido', destinoNovo, 3, 1, undefined)
    expect(res).toEqual([{ tipo: 'novo', quantidade: 3 }])
  })

  it('reducao_simples retorna destinos vazios', () => {
    expect(montarDestinosConfirmarTransferir('reducao_simples', destinoNovo, 1, 0, 'pedi_x')).toEqual([])
  })
})
