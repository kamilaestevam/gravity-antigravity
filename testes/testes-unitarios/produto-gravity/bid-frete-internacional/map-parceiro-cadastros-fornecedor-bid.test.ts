import { describe, expect, it } from 'vitest'
import {
  ehParceiroFreteInternacional,
  mapParceiroCadastrosParaFornecedorBid,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/map-parceiro-cadastros-fornecedor-bid'

describe('map-parceiro-cadastros-fornecedor-bid', () => {
  it('mapeia agente de carga do Cadastros para fornecedor BID', () => {
    const parceiro = {
      id_fornecedor: 'BR-AGENTE-00001',
      id_organizacao: 'org_1',
      nome_fornecedor: 'AGENTE DE CARGA TESTE',
      pais_fornecedor: 'BR',
      pode_ser_agente_fornecedor: true,
      pode_ser_armador_fornecedor: false,
      pode_ser_cia_aerea_fornecedor: false,
      pode_ser_transportadora_rodoviaria_nacional_fornecedor: false,
      pode_ser_transportadora_rodoviaria_internacional_fornecedor: false,
      ativo_fornecedor: true,
    }

    expect(ehParceiroFreteInternacional(parceiro)).toBe(true)
    const fornecedor = mapParceiroCadastrosParaFornecedorBid(parceiro)
    expect(fornecedor.nome_fornecedor_bid_frete_internacional).toBe('AGENTE DE CARGA TESTE')
    expect(fornecedor.tipo_fornecedor_bid_frete_internacional).toBe('AGENTE_CARGA')
    expect(fornecedor.id_fornecedor_bid_frete_internacional).toBe('BR-AGENTE-00001')
  })
})
