// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { wherePedidoVisivelImportacao } from '../../../../../../servicos-global/produto/pedido/server/src/services/smartImportService.js'

describe('wherePedidoVisivelImportacao (U-DUP)', () => {
  it('U-DUP-01: alinha com Lista — exige data_exclusao_pedido null e workspace', () => {
    expect(
      wherePedidoVisivelImportacao('org_1', 'ws_1', { numero_pedido: 'D-1382' }),
    ).toEqual({
      id_organizacao: 'org_1',
      data_exclusao_pedido: null,
      id_workspace: 'ws_1',
      numero_pedido: 'D-1382',
    })
  })

  it('U-DUP-02: sem workspace não filtra id_workspace (retrocompat analisar legado)', () => {
    expect(wherePedidoVisivelImportacao('org_1', undefined)).toEqual({
      id_organizacao: 'org_1',
      data_exclusao_pedido: null,
    })
  })
})
