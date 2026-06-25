import { describe, expect, it } from 'vitest'
import { avaliarAcessoRespostaDisparoBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/acesso-resposta-disparo-bid-frete-internacional.js'

const base = {
  token_valido: true,
  token_expirado: false,
  status_cotacao_bid_frete_internacional: 'EM_COTACAO',
  status_proposta_bid_frete_internacional: null,
  possui_proposta: false,
  disparo_respondido: false,
  data_limite_resposta_cotacao_bid_frete_internacional: null as string | null,
}

describe('avaliarAcessoRespostaDisparoBidFreteInternacional', () => {
  it('permite criar quando disparo ainda nao foi respondido', () => {
    const r = avaliarAcessoRespostaDisparoBidFreteInternacional(base)
    expect(r.modo_acesso_resposta_disparo_bid_frete_internacional).toBe('criar')
    expect(r.codigo_bloqueio_resposta_disparo_bid_frete_internacional).toBeNull()
  })

  it('permite editar quando disparo ja foi respondido e cotação segue aberta', () => {
    const r = avaliarAcessoRespostaDisparoBidFreteInternacional({
      ...base,
      possui_proposta: true,
      disparo_respondido: true,
      status_proposta_bid_frete_internacional: 'RECEBIDA',
    })
    expect(r.modo_acesso_resposta_disparo_bid_frete_internacional).toBe('editar')
  })

  it('bloqueia quando cotação foi aprovada', () => {
    const r = avaliarAcessoRespostaDisparoBidFreteInternacional({
      ...base,
      status_cotacao_bid_frete_internacional: 'APROVADA',
      possui_proposta: true,
      disparo_respondido: true,
    })
    expect(r.modo_acesso_resposta_disparo_bid_frete_internacional).toBe('bloqueado')
    expect(r.codigo_bloqueio_resposta_disparo_bid_frete_internacional).toBe('COTACAO_APROVADA')
  })

  it('bloqueia quando proposta foi reprovada', () => {
    const r = avaliarAcessoRespostaDisparoBidFreteInternacional({
      ...base,
      possui_proposta: true,
      disparo_respondido: true,
      status_proposta_bid_frete_internacional: 'REPROVADA',
    })
    expect(r.codigo_bloqueio_resposta_disparo_bid_frete_internacional).toBe('PROPOSTA_REPROVADA')
  })

  it('bloqueia primeira resposta após prazo quando ainda nao respondeu', () => {
    const r = avaliarAcessoRespostaDisparoBidFreteInternacional({
      ...base,
      data_limite_resposta_cotacao_bid_frete_internacional: '2020-01-01T00:00:00.000Z',
      agora: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(r.codigo_bloqueio_resposta_disparo_bid_frete_internacional).toBe('PRAZO_RESPOSTA_ENCERRADO')
  })

  it('permite editar após prazo se ja enviou proposta', () => {
    const r = avaliarAcessoRespostaDisparoBidFreteInternacional({
      ...base,
      possui_proposta: true,
      disparo_respondido: true,
      data_limite_resposta_cotacao_bid_frete_internacional: '2020-01-01T00:00:00.000Z',
      agora: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(r.modo_acesso_resposta_disparo_bid_frete_internacional).toBe('editar')
  })
})
