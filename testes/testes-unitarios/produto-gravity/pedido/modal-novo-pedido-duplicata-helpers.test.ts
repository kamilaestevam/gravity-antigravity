// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  CODE_DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED,
  deveAbrirConfirmacaoDuplicata,
  interpretarErroCriacaoDuplicata,
  montarMensagemCancelamentoDuplicata,
  type ErroApiPedido,
} from '../../../../servicos-global/produto/pedido/client/src/shared/modal-novo-pedido-duplicata-helpers.ts'

describe('modal-novo-pedido-duplicata-helpers', () => {
  it('deveAbrirConfirmacaoDuplicata — true quando há pedidos existentes', () => {
    expect(deveAbrirConfirmacaoDuplicata([])).toBe(false)
    expect(
      deveAbrirConfirmacaoDuplicata([{ id_pedido: 'ped-1', numero_pedido: '123' }]),
    ).toBe(true)
  })

  it('montarMensagemCancelamentoDuplicata — repassa count real', () => {
    const msg = montarMensagemCancelamentoDuplicata('123', 3, (key, opts) =>
      `${key}:${opts?.numero}:${opts?.count}`,
    )
    expect(msg).toBe('pedido.modal_novo.confirm_duplicata_msg:123:3')
  })

  it('interpretarErroCriacaoDuplicata — 409 DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED', () => {
    const err = new Error('Ja existem pedidos com este numero na organizacao') as ErroApiPedido
    err.codeBackend = CODE_DUPLICATE_NUMERO_PEDIDO_CONFIRM_REQUIRED
    err.pedidosExistentesDuplicata = [
      { id_pedido: 'ped-a', numero_pedido: '123' },
      { id_pedido: 'ped-b', numero_pedido: '123' },
    ]

    expect(interpretarErroCriacaoDuplicata(err)).toEqual({
      requerConfirmacao: true,
      pedidosExistentes: err.pedidosExistentesDuplicata,
    })
  })

  it('interpretarErroCriacaoDuplicata — ignora outros erros', () => {
    expect(interpretarErroCriacaoDuplicata(new Error('HTTP 500'))).toEqual({
      requerConfirmacao: false,
      pedidosExistentes: [],
    })
  })
})
