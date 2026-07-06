import { describe, it, expect } from 'vitest'
import {
  montarExibicaoLocaisPropostaComprador,
  parseObservacoesPropostaComLocais,
  serializarLocaisPropostaObservacoes,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/local-proposta-resposta-bid-frete-internacional'

describe('local-proposta-resposta-bid-frete-internacional', () => {
  it('serializa e parseia locais dentro de observacoes', () => {
    const obs = serializarLocaisPropostaObservacoes(
      {
        codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: 'BRSSZ',
        codigo_porto_aeroporto_destino_proposta_bid_frete_internacional: 'NLRTM',
      },
      'Observação livre do agente',
    )
    expect(obs).toContain('__GRAVITY_BID_LOCAIS__')
    expect(obs).toContain('Observação livre do agente')

    const parsed = parseObservacoesPropostaComLocais(obs)
    expect(parsed.locais.codigo_porto_aeroporto_origem_proposta_bid_frete_internacional).toBe('BRSSZ')
    expect(parsed.locais.codigo_porto_aeroporto_destino_proposta_bid_frete_internacional).toBe('NLRTM')
    expect(parsed.observacoes).toBe('Observação livre do agente')
  })

  it('montarExibicaoLocaisPropostaComprador separa locais e observações livres', () => {
    const obs = serializarLocaisPropostaObservacoes(
      { codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: 'BRPNG' },
      '',
    )
    const exibicao = montarExibicaoLocaisPropostaComprador(obs, (codigo) => `Porto ${codigo}`)
    expect(exibicao.observacoesUsuario).toBe('')
    expect(exibicao.locaisUtilizados).toEqual([
      { lado: 'origem', codigo: 'BRPNG', rotulo: 'Porto BRPNG' },
    ])
  })
})
