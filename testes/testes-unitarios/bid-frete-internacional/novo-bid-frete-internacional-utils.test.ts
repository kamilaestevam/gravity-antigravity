import { describe, expect, it } from 'vitest'
import {
  buildQueryIdBid,
  buildRotaNovaCotacaoComBid,
  idBidDoQueryParam,
} from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/novo-bid-frete-internacional-utils'

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

  it('buildQueryIdBid codifica id_bid', () => {
    expect(buildQueryIdBid('abc 123')).toBe('id_bid=abc%20123')
  })
})
