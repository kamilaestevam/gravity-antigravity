import { describe, expect, it } from 'vitest'
import {
  buildQueryIdBid,
  buildRotaNovaCotacaoComBid,
  buildRotaNovaCotacaoManual,
  idBidDoQueryParam,
} from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/novo-bid-frete-internacional-utils'
import {
  buildRotaListaBidFreteComPainelAtivo,
  idPainelListaBidFreteDoQueryParam,
} from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/rotas-bid-frete-internacional'

describe('novo-bid-frete-internacional-utils', () => {
  it('idBidDoQueryParam retorna null para vazio', () => {
    expect(idBidDoQueryParam(null)).toBeNull()
    expect(idBidDoQueryParam('')).toBeNull()
    expect(idBidDoQueryParam('   ')).toBeNull()
  })

  it('idBidDoQueryParam preserva id trimado', () => {
    expect(idBidDoQueryParam('  clxyz123  ')).toBe('clxyz123')
  })

  it('buildRotaNovaCotacaoComBid monta rota com query id_bid', () => {
    expect(buildRotaNovaCotacaoComBid('abc/123')).toBe('/bid-frete/cotacoes/nova?id_bid=abc%2F123')
  })

  it('buildRotaNovaCotacaoComBid inclui id_painel_lista quando informado', () => {
    expect(buildRotaNovaCotacaoComBid('abc', 'painel-1')).toBe(
      '/bid-frete/cotacoes/nova?id_bid=abc&id_painel_lista=painel-1',
    )
  })

  it('buildRotaNovaCotacaoManual monta rota com ou sem painel', () => {
    expect(buildRotaNovaCotacaoManual(null)).toBe('/bid-frete/cotacoes/nova')
    expect(buildRotaNovaCotacaoManual('painel-x')).toBe('/bid-frete/cotacoes/nova?id_painel_lista=painel-x')
  })

  it('buildQueryIdBid codifica id_bid', () => {
    expect(buildQueryIdBid('abc 123')).toBe('id_bid=abc%20123')
  })
})

describe('rotas-bid-frete-internacional — painel lista', () => {
  it('idPainelListaBidFreteDoQueryParam retorna null para vazio', () => {
    expect(idPainelListaBidFreteDoQueryParam(null)).toBeNull()
    expect(idPainelListaBidFreteDoQueryParam('  ')).toBeNull()
  })

  it('buildRotaListaBidFreteComPainelAtivo monta query id_painel_lista', () => {
    expect(buildRotaListaBidFreteComPainelAtivo('clpainel123')).toBe(
      '/bid-frete/lista?id_painel_lista=clpainel123',
    )
  })
})
