// @vitest-environment node
/// <reference types="vitest/globals" />

import {
  clausulaDataEmissaoPedido,
  resolverPeriodoPedido,
} from '../../../../servicos-global/produto/pedido/server/src/shared/pedido-periodo-filtro.js'

describe('pedido-periodo-filtro', () => {
  it('tudo — sem cláusula de data_emissao_pedido', () => {
    const { from, to } = resolverPeriodoPedido('tudo')
    expect(from).toBeNull()
    expect(to).toBeInstanceOf(Date)
    expect(clausulaDataEmissaoPedido(from, to)).toEqual({})
  })

  it('30d — aplica janela de 30 dias', () => {
    const { from, to } = resolverPeriodoPedido('30d')
    expect(from).toBeInstanceOf(Date)
    const clausula = clausulaDataEmissaoPedido(from, to) as {
      data_emissao_pedido?: { gte: Date; lte: Date }
    }
    expect(clausula.data_emissao_pedido?.gte).toBeInstanceOf(Date)
    expect(clausula.data_emissao_pedido?.lte).toBeInstanceOf(Date)
  })

  it('1a e 12m — equivalentes (1 ano)', () => {
    const a = resolverPeriodoPedido('1a')
    const b = resolverPeriodoPedido('12m')
    expect(a.from?.getFullYear()).toBe(b.from?.getFullYear())
  })
})

describe('periodoPedidoSync (client)', () => {
  it('mapearPeriodoDashboardParaLista — 12m vira 1a', async () => {
    const { mapearPeriodoDashboardParaLista } = await import(
      '../../../../servicos-global/produto/pedido/client/src/shared/periodoPedidoSync.ts'
    )
    expect(mapearPeriodoDashboardParaLista('12m')).toBe('1a')
    expect(mapearPeriodoDashboardParaLista('tudo')).toBe('tudo')
  })
})
