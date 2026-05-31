import { describe, it, expect } from 'vitest'
import {
  filtrarTaxasCatalogoNaoLegado,
  taxasCatalogoPorSecao,
  linhasParaPayloadTaxas,
  criarLinhaTaxaManual,
  formatarValorTotalPropostaResposta,
  agruparValorTotalPropostaResposta,
  agruparValoresPorMoedaLinhas,
  calcularComposicaoPropostaResposta,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/taxas-linha-proposta-bid-frete-internacional'
type TaxaCatalogoMin = {
  id_taxa_origem_destino: string
  nome_taxa_origem_destino: string
  tipo_taxa_origem_destino: 'ORIGEM' | 'DESTINO' | 'FRETE'
  codigo_taxa_origem_destino: string
  ativo_taxa_origem_destino: boolean
  legado_taxa_origem_destino?: boolean
}

function taxa(partial: Partial<TaxaCatalogoMin> & Pick<TaxaCatalogoMin, 'id_taxa_origem_destino' | 'nome_taxa_origem_destino' | 'tipo_taxa_origem_destino'>): TaxaCatalogoMin {
  return {
    codigo_taxa_origem_destino: 'BID_TEST',
    ativo_taxa_origem_destino: true,
    ...partial,
  }
}

describe('taxas-linha-proposta-bid-frete-internacional', () => {
  it('exclui itens legados do catálogo', () => {
    const itens = [
      taxa({ id_taxa_origem_destino: 'a', nome_taxa_origem_destino: 'Ativa', tipo_taxa_origem_destino: 'ORIGEM', legado_taxa_origem_destino: false }),
      taxa({ id_taxa_origem_destino: 'b', nome_taxa_origem_destino: 'Legado', tipo_taxa_origem_destino: 'ORIGEM', legado_taxa_origem_destino: true }),
    ]
    expect(filtrarTaxasCatalogoNaoLegado(itens)).toHaveLength(1)
    expect(filtrarTaxasCatalogoNaoLegado(itens)[0].id_taxa_origem_destino).toBe('a')
  })

  it('usa tipo FRETE quando não há ORIGEM/DESTINO', () => {
    const itens = [
      taxa({ id_taxa_origem_destino: 'f1', nome_taxa_origem_destino: 'Handling', tipo_taxa_origem_destino: 'FRETE' }),
      taxa({ id_taxa_origem_destino: 'o1', nome_taxa_origem_destino: 'THC', tipo_taxa_origem_destino: 'ORIGEM' }),
    ]
    expect(taxasCatalogoPorSecao(itens, 'origem').map((t) => t.id_taxa_origem_destino)).toEqual(['o1'])
    const soFrete = [itens[0]]
    expect(taxasCatalogoPorSecao(soFrete, 'origem')).toHaveLength(1)
    expect(taxasCatalogoPorSecao(soFrete, 'destino')).toHaveLength(1)
  })

  it('valor total soma frete e taxas na mesma moeda', () => {
    const manual = criarLinhaTaxaManual('USD')
    manual.nome_taxa_bid_frete_internacional = 'THC'
    manual.valor_taxa_bid_frete_internacional = '30'
    const dest = criarLinhaTaxaManual('USD')
    dest.nome_taxa_bid_frete_internacional = 'Dest'
    dest.valor_taxa_bid_frete_internacional = '19.99'

    const total = formatarValorTotalPropostaResposta({
      moeda_frete: 'USD',
      valor_frete: '200',
      linhas_taxa_origem: [manual],
      linhas_taxa_destino: [dest],
    })
    expect(total).toBe('USD 249,99')
  })

  it('agrupa taxas multi-moeda por seção', () => {
    const eur = criarLinhaTaxaManual('EUR')
    eur.valor_taxa_bid_frete_internacional = '10'
    const usd = criarLinhaTaxaManual('USD')
    usd.valor_taxa_bid_frete_internacional = '20'

    expect(agruparValoresPorMoedaLinhas([eur, usd], 'USD')).toEqual([
      { moeda: 'USD', total: 20 },
      { moeda: 'EUR', total: 10 },
    ])
  })

  it('valor total multi-moeda mantém moeda do frete em primeiro', () => {
    const origemEur = criarLinhaTaxaManual('EUR')
    origemEur.valor_taxa_bid_frete_internacional = '10'
    const destinoUsd = criarLinhaTaxaManual('USD')
    destinoUsd.valor_taxa_bid_frete_internacional = '20'

    expect(
      agruparValorTotalPropostaResposta({
        moeda_frete: 'USD',
        valor_frete: '0',
        linhas_taxa_origem: [origemEur],
        linhas_taxa_destino: [destinoUsd],
      }),
    ).toEqual([
      { moeda: 'USD', total: 20 },
      { moeda: 'EUR', total: 10 },
    ])

    expect(
      formatarValorTotalPropostaResposta({
        moeda_frete: 'USD',
        valor_frete: '0',
        linhas_taxa_origem: [origemEur],
        linhas_taxa_destino: [destinoUsd],
      }),
    ).toBe('USD 20,00 · EUR 10,00')
  })

  it('composição detalha frete base e taxas por moeda', () => {
    const origemEur = criarLinhaTaxaManual('EUR')
    origemEur.valor_taxa_bid_frete_internacional = '2030'
    const origemUsd = criarLinhaTaxaManual('USD')
    origemUsd.valor_taxa_bid_frete_internacional = '20'

    expect(
      calcularComposicaoPropostaResposta({
        moeda_frete: 'EUR',
        valor_frete: '200',
        linhas_taxa_origem: [origemEur, origemUsd],
        linhas_taxa_destino: [],
      }),
    ).toEqual([
      {
        moeda: 'EUR',
        frete_base: 200,
        taxas_origem: 2030,
        taxas_destino: 0,
        total: 2230,
      },
      {
        moeda: 'USD',
        frete_base: 0,
        taxas_origem: 20,
        taxas_destino: 0,
        total: 20,
      },
    ])
  })

  it('monta payload apenas com linhas nomeadas', () => {
    const manual = criarLinhaTaxaManual('USD')
    manual.nome_taxa_bid_frete_internacional = 'Taxa extra'
    manual.valor_taxa_bid_frete_internacional = '12.5'
    const vazio = criarLinhaTaxaManual('USD')

    const payload = linhasParaPayloadTaxas([manual, vazio], 'origem')
    expect(payload).toHaveLength(1)
    expect(payload[0]).toMatchObject({
      tipo_taxa_bid_frete_internacional: 'origem',
      nome_taxa_bid_frete_internacional: 'Taxa extra',
      valor_taxa_bid_frete_internacional: 12.5,
      moeda_taxa_bid_frete_internacional: 'USD',
    })
  })
})
