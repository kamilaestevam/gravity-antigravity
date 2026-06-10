import { describe, expect, it } from 'vitest'
import { valorTotalCambioItemParaLista } from '../../../../servicos-global/produto/pedido/client/src/shared/valorTotalCambioItemLista'
import type { PedidoItem } from '../../../../servicos-global/produto/pedido/client/src/shared/types'

describe('valorTotalCambioItemParaLista', () => {
  it('retorna valor persistido quando presente', () => {
    expect(valorTotalCambioItemParaLista({ valor_total_cambio_item_pedido: 1200 } as PedidoItem)).toBe(1200)
  })

  it('retorna null quando ausente', () => {
    expect(valorTotalCambioItemParaLista({} as PedidoItem)).toBeNull()
  })
})
