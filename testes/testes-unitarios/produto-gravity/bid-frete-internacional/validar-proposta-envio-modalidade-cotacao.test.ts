import { describe, expect, it } from 'vitest'
import { validarPropostaEnvioModalidadeCotacaoBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/validar-proposta-envio-modalidade-cotacao-bid-frete-internacional'

describe('validarPropostaEnvioModalidadeCotacaoBidFreteInternacional', () => {
  it('exige free time para FCL', () => {
    expect(
      validarPropostaEnvioModalidadeCotacaoBidFreteInternacional(
        { dias_free_time_proposta_bid_frete_internacional: null },
        'FCL',
      ),
    ).toBeTruthy()
    expect(
      validarPropostaEnvioModalidadeCotacaoBidFreteInternacional(
        { dias_free_time_proposta_bid_frete_internacional: 0 },
        'FCL',
      ),
    ).toBeNull()
  })

  it('nao exige free time para LCL', () => {
    expect(
      validarPropostaEnvioModalidadeCotacaoBidFreteInternacional(
        { dias_free_time_proposta_bid_frete_internacional: null },
        'LCL',
      ),
    ).toBeNull()
  })
})
