import { describe, expect, it } from 'vitest'
import {
  calcularVariacaoPtaxDiaAnterior,
  montarCotacoesPtaxFuturoPorMoeda,
  montarCotacoesPtaxInsights,
  montarSpreadMedioInsights,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/taxas-cambio-insights-bid-frete-internacional'

describe('montarCotacoesPtaxInsights', () => {
  it('usa última cotação por moeda', () => {
    const cotacoes = montarCotacoesPtaxInsights({
      USD: [
        { moeda: 'USD', compra: 5, venda: 5.1, data_cotacao: '2026-06-14' },
        { moeda: 'USD', compra: 5.05, venda: 5.12, data_cotacao: '2026-06-15' },
      ],
    })
    expect(cotacoes[0]?.valor_brl).toBe(5.12)
  })
})

describe('calcularVariacaoPtaxDiaAnterior', () => {
  it('calcula variação percentual entre dois boletins', () => {
    const variacao = calcularVariacaoPtaxDiaAnterior({
      USD: [
        { moeda: 'USD', compra: 5, venda: 5 },
        { moeda: 'USD', compra: 5.1, venda: 5.1 },
      ],
      EUR: [],
      CNY: [],
    }, 'USD')
    expect(variacao).toBe(2)
  })
})
describe('montarCotacoesPtaxFuturoPorMoeda', () => {
  it('usa previsão Focus por moeda sem escalar USD em EUR', () => {
    const base = montarCotacoesPtaxInsights({
      USD: [{ moeda: 'USD', compra: 5, venda: 5, data_cotacao: '2026-06-15' }],
      EUR: [{ moeda: 'EUR', compra: 5.5, venda: 5.5, data_cotacao: '2026-06-15' }],
    })
    const futuro = montarCotacoesPtaxFuturoPorMoeda(
      base,
      {
        USD: [{ valor_mediano_previsao_taxa_futura_moeda: 5.5 }],
        EUR: [{ valor_mediano_previsao_taxa_futura_moeda: 6.1 }],
      },
      30,
    )
    expect(futuro.find(m => m.codigo === 'USD')?.valor_brl).toBe(5.5)
    expect(futuro.find(m => m.codigo === 'EUR')?.valor_brl).toBe(6.1)
  })
})

describe('montarSpreadMedioInsights', () => {
  it('calcula spread entre taxa aplicada e PTAX', () => {
    const spreads = montarSpreadMedioInsights(
      {
        USD: [{ moeda: 'USD', compra: 5, venda: 5, data_cotacao: '2026-06-15' }],
        EUR: [{ moeda: 'EUR', compra: 5.5, venda: 5.5, data_cotacao: '2026-06-15' }],
        CNY: [],
      },
      { USD: 5.25, EUR: 5.72 },
    )
    expect(spreads[0]?.valor_pct).toBe(5)
    expect(spreads[1]?.valor_pct).toBeCloseTo(4, 0)
  })
})
