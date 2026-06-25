import { describe, expect, it } from 'vitest'
import {
  converterValorMoedaParaBrlEstimado,
  formatarEstimadoBrlProposta,
  somarEstimadoBrlComposicaoProposta,
  somarEstimadoBrlLinhasTaxasProposta,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/conversao-estimada-brl-proposta-bid-frete-internacional'
import { montarMapaTaxaParaBrl } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/taxas-cambio-insights-bid-frete-internacional'
import { criarLinhaTaxaManual } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/taxas-linha-proposta-bid-frete-internacional'

describe('montarMapaTaxaParaBrl', () => {
  it('prioriza taxa aplicada do produto sobre PTAX', () => {
    const mapa = montarMapaTaxaParaBrl(
      { USD: [{ moeda: 'USD', compra: 5, venda: 5.1, data_cotacao: '2026-06-15' }] },
      { USD: 5.25 },
    )
    expect(mapa.USD).toBe(5.25)
    expect(mapa.BRL).toBe(1)
  })
})

describe('conversao-estimada-brl-proposta', () => {
  const taxas = { BRL: 1, USD: 5, EUR: 6 }

  it('converte frete USD para BRL', () => {
    expect(converterValorMoedaParaBrlEstimado(950, 'USD', taxas)).toBe(4750)
  })

  it('formata estimado em reais', () => {
    expect(formatarEstimadoBrlProposta(4750)).toBe('≈ R$ 4.750,00')
  })

  it('soma linhas de taxas convertidas separadamente', () => {
    const usd = criarLinhaTaxaManual('USD')
    usd.valor_taxa_bid_frete_internacional = '100'
    const eur = criarLinhaTaxaManual('EUR')
    eur.valor_taxa_bid_frete_internacional = '50'

    expect(somarEstimadoBrlLinhasTaxasProposta([usd, eur], taxas)).toBe(800)
  })

  it('soma composição por moeda no total BRL', () => {
    expect(
      somarEstimadoBrlComposicaoProposta(
        [{ moeda: 'USD', frete_base: 1000, taxas_origem: 0, taxas_destino: 0, total: 1000 }],
        taxas,
      ),
    ).toBe(5000)
  })
})
