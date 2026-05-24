import { describe, expect, it } from 'vitest'
import {
  CHAVES_COLUNA_DINAMICA_PEDIDO_ITEM,
  classificarRegraTooltipColuna,
} from '../../../servicos-global/produto/pedido/client/src/shared/regrasTooltipColunaLista'

describe('classificarRegraTooltipColuna', () => {
  it('classifica colunas pai conhecidas', () => {
    expect(classificarRegraTooltipColuna('descricao_item', 'pai')).toBe('pai_ghost_descricao')
    expect(classificarRegraTooltipColuna('ncm', 'pai')).toBe('pai_ghost_ncm')
    expect(classificarRegraTooltipColuna('valor_total_pedido', 'pai')).toBe('pai_calculado_valor')
    expect(classificarRegraTooltipColuna('saldo_itens_do_pedido', 'pai')).toBe('pai_saldo_formula')
    expect(classificarRegraTooltipColuna('moeda_cambio_pedido', 'pai')).toBe('pai_moeda_cambio')
    expect(classificarRegraTooltipColuna('anexo_pedido', 'pai')).toBe('pai_anexo')
    expect(classificarRegraTooltipColuna('cnpj_exportador', 'pai')).toBe('pai_somente_leitura')
  })

  it('classifica colunas item conhecidas', () => {
    expect(classificarRegraTooltipColuna('saldo_itens_do_pedido', 'item')).toBe('item_nao_editavel_saldo')
    expect(classificarRegraTooltipColuna('quantidade_transferida_total', 'item')).toBe(
      'item_nao_editavel_transferencia',
    )
    expect(classificarRegraTooltipColuna('valor_total_pedido', 'item')).toBe('item_editavel_valor_total')
    expect(classificarRegraTooltipColuna('numero_pedido', 'item')).toBe('item_part_number')
  })

  it('usa regras dinâmicas pedido/item quando expandido', () => {
    for (const key of CHAVES_COLUNA_DINAMICA_PEDIDO_ITEM) {
      const id = classificarRegraTooltipColuna(key, 'pai', { modoDinamicoPedidoItem: true })
      expect(id.startsWith('dinamico_')).toBe(true)
    }
  })

  it('datas e alfanuméricos do pedido usam regra de replicação', () => {
    expect(classificarRegraTooltipColuna('data_emissao_pedido', 'pai')).toBe('pai_editavel_replicar_alerta')
    expect(classificarRegraTooltipColuna('incoterm', 'pai')).toBe('pai_editavel_replicar_alerta')
  })
})
