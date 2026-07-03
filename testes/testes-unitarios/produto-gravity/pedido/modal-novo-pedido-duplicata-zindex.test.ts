// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  Z_INDEX_CONFIRM_DUPLICATA_MARGEM,
  Z_INDEX_CONFIRM_DUPLICATA_NOVO_PEDIDO,
  Z_INDEX_MODAL_PASSO_PASSO,
} from '../../../../servicos-global/produto/pedido/client/src/shared/modal-novo-pedido-constants.ts'

describe('ModalNovoPedido — z-index confirmação duplicata', () => {
  it('espelha Z_INDEX_MODAL_PASSO_PASSO do nucleo (9999) + margem fixa', () => {
    expect(Z_INDEX_MODAL_PASSO_PASSO).toBe(9999)
    expect(Z_INDEX_CONFIRM_DUPLICATA_MARGEM).toBeGreaterThan(0)
    expect(Z_INDEX_CONFIRM_DUPLICATA_NOVO_PEDIDO).toBe(
      Z_INDEX_MODAL_PASSO_PASSO + Z_INDEX_CONFIRM_DUPLICATA_MARGEM,
    )
    expect(Z_INDEX_CONFIRM_DUPLICATA_NOVO_PEDIDO).toBeGreaterThan(Z_INDEX_MODAL_PASSO_PASSO)
  })
})
