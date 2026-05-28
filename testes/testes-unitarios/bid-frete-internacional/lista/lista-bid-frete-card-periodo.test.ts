import { describe, expect, it } from 'vitest'
import {
  cotacaoDentroPeriodoCards,
  filtrarCotacoesPorPeriodoCards,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/lista-bid-frete-card-periodo'
import type { Cotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

function cotacaoBase(partial: Partial<Cotacao> & Pick<Cotacao, 'id_cotacao_bid_frete_internacional'>): Cotacao {
  return {
    id_organizacao: 'org-1',
    id_usuario: 'user-1',
    numero_cotacao_bid_frete_internacional: 'BID-1',
    referencia_interna_cotacao_bid_frete_internacional: null,
    tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
    modal_cotacao_bid_frete_internacional: 'MARITIMO',
    modalidade_cotacao_bid_frete_internacional: 'FCL',
    status_cotacao_bid_frete_internacional: 'RASCUNHO',
    origem_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
    origem_nome_cotacao_bid_frete_internacional: 'Santos',
    origem_pais_cotacao_bid_frete_internacional: 'BR',
    destino_codigo_cotacao_bid_frete_internacional: 'CNSHA',
    destino_nome_cotacao_bid_frete_internacional: 'Shanghai',
    destino_pais_cotacao_bid_frete_internacional: 'CN',
    descricao_mercadoria_cotacao_bid_frete_internacional: 'Carga',
    ncm_cotacao_bid_frete_internacional: null,
    quantidade_cotacao_bid_frete_internacional: 1,
    tipo_container_cotacao_bid_frete_internacional: null,
    peso_kg_cotacao_bid_frete_internacional: null,
    cubagem_m3_cotacao_bid_frete_internacional: null,
    incoterm_cotacao_bid_frete_internacional: 'FOB',
    zipcode_destino_cotacao_bid_frete_internacional: null,
    visibilidade_cotacao_bid_frete_internacional: 'DIRECIONADA',
    anonima_cotacao_bid_frete_internacional: false,
    valor_meta_cotacao_bid_frete_internacional: null,
    moeda_meta_cotacao_bid_frete_internacional: 'USD',
    data_limite_resposta_cotacao_bid_frete_internacional: null,
    ganho_valor_cotacao_bid_frete_internacional: null,
    ganho_percentual_cotacao_bid_frete_internacional: null,
    data_criacao_cotacao_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
    data_atualizacao_cotacao_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
    ...partial,
  }
}

describe('lista-bid-frete-card-periodo', () => {
  const agora = new Date('2026-05-28T12:00:00.000Z').getTime()

  it('periodo tudo inclui todas as cotações', () => {
    const lista = [
      cotacaoBase({ id_cotacao_bid_frete_internacional: 'c1', data_criacao_cotacao_bid_frete_internacional: '2020-01-01T00:00:00.000Z' }),
      cotacaoBase({ id_cotacao_bid_frete_internacional: 'c2' }),
    ]
    expect(filtrarCotacoesPorPeriodoCards(lista, 'tudo', agora)).toHaveLength(2)
  })

  it('periodo 7d exclui cotação antiga', () => {
    const recente = cotacaoBase({ id_cotacao_bid_frete_internacional: 'c-recente' })
    const antiga = cotacaoBase({
      id_cotacao_bid_frete_internacional: 'c-antiga',
      data_criacao_cotacao_bid_frete_internacional: '2020-01-01T00:00:00.000Z',
    })
    const filtradas = filtrarCotacoesPorPeriodoCards([recente, antiga], '7d', agora)
    expect(filtradas).toHaveLength(1)
    expect(filtradas[0].id_cotacao_bid_frete_internacional).toBe('c-recente')
  })

  it('cotacaoDentroPeriodoCards valida data de criação', () => {
    expect(cotacaoDentroPeriodoCards(cotacaoBase({ id_cotacao_bid_frete_internacional: 'c1' }), '30d', agora)).toBe(true)
    expect(cotacaoDentroPeriodoCards(
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c2',
        data_criacao_cotacao_bid_frete_internacional: '2010-01-01T00:00:00.000Z',
      }),
      '30d',
      agora,
    )).toBe(false)
  })
})
