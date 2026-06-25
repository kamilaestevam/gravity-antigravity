import { describe, it, expect } from 'vitest'
import {
  itensTaxasOrigemProposta,
  subtotalTaxasOrigemTexto,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/exibir-taxas-proposta-bid-frete-internacional'
import type { PropostaBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

function propostaMinima(
  partial: Partial<PropostaBidFreteInternacional>,
): PropostaBidFreteInternacional {
  return {
    id_proposta_bid_frete_internacional: 'p1',
    id_cotacao_bid_frete_internacional: 'c1',
    id_organizacao: 'org1',
    id_fornecedor_bid_frete_internacional: 'f1',
    id_disparo_cotacao_bid_frete_internacional: 'd1',
    moeda_proposta_bid_frete_internacional: 'USD',
    valor_frete_proposta_bid_frete_internacional: 200,
    taxas_origem_proposta_bid_frete_internacional: 30,
    taxas_destino_proposta_bid_frete_internacional: 0,
    valor_total_proposta_bid_frete_internacional: 230,
    dias_transito_proposta_bid_frete_internacional: 10,
    dias_free_time_proposta_bid_frete_internacional: null,
    quantidade_transbordo_proposta_bid_frete_internacional: 0,
    quantidade_escala_proposta_bid_frete_internacional: 0,
    validade_proposta_bid_frete_internacional: '2026-07-01',
    observacoes_proposta_bid_frete_internacional: null,
    status_proposta_bid_frete_internacional: 'ENVIADA',
    data_criacao_proposta_bid_frete_internacional: '',
    data_atualizacao_proposta_bid_frete_internacional: '',
    ...partial,
  }
}

describe('exibir-taxas-proposta-bid-frete-internacional', () => {
  it('subtotal por moeda quando há linhas detalhadas', () => {
    const p = propostaMinima({
      taxas_origem: [
        {
          id_taxa_origem_bid_frete_internacional: 't1',
          nome_taxa_origem_bid_frete_internacional: 'ABC',
          valor_taxa_origem_bid_frete_internacional: 10,
          moeda_taxa_origem_bid_frete_internacional: 'USD',
        },
        {
          id_taxa_origem_bid_frete_internacional: 't2',
          nome_taxa_origem_bid_frete_internacional: 'DDE',
          valor_taxa_origem_bid_frete_internacional: 20,
          moeda_taxa_origem_bid_frete_internacional: 'USD',
        },
      ],
    })
    expect(itensTaxasOrigemProposta(p)).toHaveLength(2)
    expect(subtotalTaxasOrigemTexto(p, 'USD')).toBe('USD 30,00')
  })
})
