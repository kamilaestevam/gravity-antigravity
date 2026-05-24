import { describe, it, expect } from 'vitest'
import {
  construirCamposPropagadosParaItem,
  derivarNomesEmpresaParaItem,
} from '../../../servicos-global/produto/pedido/shared/mapaPropagacaoPedidoItem'

describe('POST /pedidos/:id/itens — montagem de item herdado', () => {
  it('propaga moeda/unidade/casas do pedido quando item não envia', () => {
    const pedido = {
      moeda_pedido: 'EUR',
      unidade_comercializada_pedido: 'KG',
      casas_decimais_valor_pedido: 3,
      casas_decimais_quantidade_pedido: 1,
      incoterm_pedido: 'FOB',
    }

    const camposHerdados = construirCamposPropagadosParaItem(pedido)

    expect(camposHerdados.moeda_item).toBe('EUR')
    expect(camposHerdados.unidade_comercializada_item).toBe('KG')
    expect(camposHerdados.casas_decimais_valor_item).toBe(3)
    expect(camposHerdados.casas_decimais_quantidade_item).toBe(1)
    expect(camposHerdados.incoterm_item).toBe('FOB')
  })

  it('deriva nomes de exportador/importador a partir dos snapshots', () => {
    const nomes = derivarNomesEmpresaParaItem([
      { papel: 'exportador', nome_empresa: 'Org BR' },
      { papel: 'importador', nome_empresa: 'Buyer US' },
    ])

    expect(nomes.nome_exportador_item).toBe('Org BR')
    expect(nomes.nome_importador_item).toBe('Buyer US')
    expect(nomes.nome_fabricante_item).toBeNull()
  })
})
