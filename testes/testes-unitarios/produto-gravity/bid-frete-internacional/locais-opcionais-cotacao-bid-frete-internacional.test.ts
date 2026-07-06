import { describe, it, expect } from 'vitest'
import {
  coletarCodigosLocaisCotacaoBidFrete,
  rotuloLocalFromSnapshotCotacaoBidFrete,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/rotulos-locais-resposta-fornecedor-bid-frete-internacional'

describe('coletarCodigosLocaisCotacaoBidFrete', () => {
  it('deduplica principal e opcionais elegíveis', () => {
    const codigos = coletarCodigosLocaisCotacaoBidFrete({
      modal_cotacao_bid_frete_internacional: 'MARITIMO',
      porto_origem_cotacao_bid_frete_internacional: 'CNSHA',
      habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: true,
      codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: ['CNGZH', 'CNSHA'],
    })

    expect(codigos).toEqual(['CNSHA', 'CNGZH'])
  })
})

describe('rotuloLocalFromSnapshotCotacaoBidFrete', () => {
  it('monta SIGLA — nome quando snapshot não inclui código', () => {
    expect(
      rotuloLocalFromSnapshotCotacaoBidFrete(
        {
          modal_cotacao_bid_frete_internacional: 'MARITIMO',
          porto_origem_cotacao_bid_frete_internacional: 'CNSHA',
          origem_nome_cotacao_bid_frete_internacional: 'Shanghai',
        },
        'origem',
        'CNSHA',
      ),
    ).toBe('CNSHA — Shanghai')
  })

  it('preserva snapshot já formatado', () => {
    expect(
      rotuloLocalFromSnapshotCotacaoBidFrete(
        {
          modal_cotacao_bid_frete_internacional: 'MARITIMO',
          porto_origem_cotacao_bid_frete_internacional: 'CNGZH',
          origem_nome_cotacao_bid_frete_internacional: 'CNGZH — Guangzhou (Nansha), CN',
        },
        'origem',
        'CNGZH',
      ),
    ).toBe('CNGZH — Guangzhou (Nansha), CN')
  })
})
