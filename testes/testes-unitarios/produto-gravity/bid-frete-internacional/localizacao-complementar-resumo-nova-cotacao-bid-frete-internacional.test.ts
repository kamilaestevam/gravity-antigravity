import { describe, it, expect } from 'vitest'
import {
  montarPartesLocalizacaoComplementarResumoNovaCotacaoBidFrete,
  temLocalizacaoComplementarResumoNovaCotacaoBidFrete,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/localizacao-complementar-resumo-nova-cotacao-bid-frete-internacional'

describe('localizacao-complementar-resumo-nova-cotacao-bid-frete-internacional', () => {
  it('monta país, estado, cidade e endereço', () => {
    expect(
      montarPartesLocalizacaoComplementarResumoNovaCotacaoBidFrete({
        paisNome: 'Argentina',
        estadoProvincia: 'Buenos Aires',
        cidade: 'La Plata',
        endereco: 'Av. Mitre 100',
      }),
    ).toEqual({
      pais: 'Argentina',
      estadoProvincia: 'Buenos Aires',
      cidade: 'La Plata',
      endereco: 'Av. Mitre 100',
    })
  })

  it('detecta quando há complemento preenchido', () => {
    expect(temLocalizacaoComplementarResumoNovaCotacaoBidFrete({ endereco: 'Rua A' })).toBe(true)
    expect(temLocalizacaoComplementarResumoNovaCotacaoBidFrete({ paisNome: 'Brasil' })).toBe(true)
    expect(temLocalizacaoComplementarResumoNovaCotacaoBidFrete({})).toBe(false)
  })
})
