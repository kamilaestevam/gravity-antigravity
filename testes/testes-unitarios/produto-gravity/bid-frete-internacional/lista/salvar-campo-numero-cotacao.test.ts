import { describe, expect, it } from 'vitest'
import { normalizarValorEdicaoCotacao } from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/salvar-campo-cotacao-bid-frete-internacional'

describe('normalizarValorEdicaoCotacao — numero_cotacao', () => {
  it('retorna texto trimado', () => {
    expect(
      normalizarValorEdicaoCotacao(
        'numero_cotacao_bid_frete_internacional',
        '  COT-CUSTOM  ',
      ),
    ).toBe('COT-CUSTOM')
  })

  it('rejeita vazio', () => {
    expect(() =>
      normalizarValorEdicaoCotacao('numero_cotacao_bid_frete_internacional', '   '),
    ).toThrow('Número da cotação não pode ficar vazio.')
  })
})
