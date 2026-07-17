import { describe, expect, it } from 'vitest'
import { converterLeituraParaCotacaoBidFreteInternacional } from '../../../../servicos-global/produto/smart-read/shared/converter-leitura-para-cotacao-bid-frete-internacional-smart-read.js'

describe('converterLeituraParaCotacaoBidFreteInternacional', () => {
  it('mapeia incoterm, mercadoria, portos e modal marítimo FCL com containers', () => {
    const resultado = converterLeituraParaCotacaoBidFreteInternacional({
      id_leitura: 'leit_test_001',
      arquivos: [{
        resultado_extracao: [{
          tipo_documento: 'INVOICE',
          dados: {
            document: { incoterm: 'FOB', documentNumber: 'INV-99' },
            shipmentDetails: {
              transportMode: 'SEA',
              origin: { portCode: 'ARBUE', port: 'Buenos Aires' },
              destination: { portCode: 'BEANR', port: 'Antwerpen' },
            },
            containerNumbers: ['MSCU1234567'],
            containerType: '22G1',
            items: [{ description: 'Auto parts', quantity: 1 }],
            totals: { grossWeight: 12000 },
          },
        }],
      }],
    })

    expect(resultado.prefill.incoterm_cotacao_bid_frete_internacional).toBe('FOB')
    expect(resultado.prefill.descricao_mercadoria_cotacao_bid_frete_internacional).toBe('Auto parts')
    expect(resultado.prefill.porto_origem_cotacao_bid_frete_internacional).toBe('ARBUE')
    expect(resultado.prefill.porto_destino_cotacao_bid_frete_internacional).toBe('BEANR')
    expect(resultado.prefill.modal_cotacao_bid_frete_internacional).toBe('MARITIMO')
    expect(resultado.prefill.modalidade_cotacao_bid_frete_internacional).toBe('FCL')
    expect(resultado.prefill.quantidade_volume_cotacao_bid_frete_internacional).toBe(1)
    expect(resultado.prefill.tipo_operacao_cotacao_bid_frete_internacional).toBe('IMPORTACAO')
    expect(resultado.campos_faltantes).not.toContain('Incoterm')
  })

  it('sugere modal aéreo quando há aeroportos', () => {
    const resultado = converterLeituraParaCotacaoBidFreteInternacional({
      id_leitura: 'leit_test_002',
      arquivos: [{
        resultado_extracao: [{
          tipo_documento: 'PACKING_LIST',
          dados: {
            document: { incoterm: 'CIF' },
            shipmentDetails: {
              origin: { airport: 'GRU' },
              destination: { airport: 'MIA' },
            },
            goods: { description: 'Electronics' },
            totals: { packages: 3 },
          },
        }],
      }],
    })

    expect(resultado.prefill.modal_cotacao_bid_frete_internacional).toBe('AEREO')
    expect(resultado.prefill.aeroporto_origem_cotacao_bid_frete_internacional).toBe('GRU')
    expect(resultado.prefill.quantidade_volume_cotacao_bid_frete_internacional).toBe(3)
  })
})
