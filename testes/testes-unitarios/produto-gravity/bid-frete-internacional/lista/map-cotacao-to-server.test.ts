import { describe, expect, it } from 'vitest'
import { mapCotacaoToServer } from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/api'

describe('mapCotacaoToServer — numero_cotacao editável', () => {
  it('inclui numero_cotacao_bid_frete_internacional no payload PATCH', () => {
    const payload = mapCotacaoToServer({
      numero_cotacao_bid_frete_internacional: 'COT-EDITADO',
    })

    expect(payload.numero_cotacao_bid_frete_internacional).toBe('COT-EDITADO')
  })

  it('continua removendo id_organizacao do payload', () => {
    const payload = mapCotacaoToServer({
      id_organizacao: 'org-1',
      numero_cotacao_bid_frete_internacional: 'COT-1',
    })

    expect(payload).not.toHaveProperty('id_organizacao')
    expect(payload.numero_cotacao_bid_frete_internacional).toBe('COT-1')
  })
})
