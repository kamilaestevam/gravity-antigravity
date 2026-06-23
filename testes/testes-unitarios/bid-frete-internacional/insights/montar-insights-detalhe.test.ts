import { describe, expect, it } from 'vitest'
import {
  montarWhereInsightsDetalheBidFreteInternacional,
  mapearCotacaoInsightsDetalhe,
} from '../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/montar-insights-detalhe-bid-frete-internacional'

describe('montarWhereInsightsDetalheBidFreteInternacional', () => {
  it('filtra respostas pendentes pelos status corretos', () => {
    const where = montarWhereInsightsDetalheBidFreteInternacional('resposta', { id_workspace: 'ws-1' })
    expect(where.status_cotacao_bid_frete_internacional).toEqual({
      in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO'],
    })
    expect(where.id_workspace).toBe('ws-1')
  })

  it('filtra rota por origem, destino e modal', () => {
    const where = montarWhereInsightsDetalheBidFreteInternacional(
      'rota',
      {},
      {
        codigo_origem: 'CNSHA',
        codigo_destino: 'BRSSZ',
        modal_cotacao_bid_frete_internacional: 'MARITIMO',
      },
    )
    expect(where.origem_codigo_cotacao_bid_frete_internacional).toBe('CNSHA')
    expect(where.destino_codigo_cotacao_bid_frete_internacional).toBe('BRSSZ')
    expect(where.modal_cotacao_bid_frete_internacional).toBe('MARITIMO')
  })

  it('vence_hoje usa data_referencia informada em vez de hoje', () => {
    const where = montarWhereInsightsDetalheBidFreteInternacional(
      'vence_hoje',
      {},
      { data_referencia: '2026-06-10' },
    )
    const limite = where.data_limite_resposta_cotacao_bid_frete_internacional as {
      gte: Date
      lte: Date
    }
    const fmtLocal = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    expect(fmtLocal(limite.gte)).toBe('2026-06-10')
    expect(fmtLocal(limite.lte)).toBe('2026-06-10')
  })
})

describe('mapearCotacaoInsightsDetalhe', () => {
  it('mapeia propostas e histórico mínimo', () => {
    const dto = mapearCotacaoInsightsDetalhe({
      id_cotacao_bid_frete_internacional: 'c1',
      numero_cotacao_bid_frete_internacional: 'COT-001',
      status_cotacao_bid_frete_internacional: 'RASCUNHO',
      origem_nome_cotacao_bid_frete_internacional: 'Shanghai',
      origem_codigo_cotacao_bid_frete_internacional: 'CNSHA',
      destino_nome_cotacao_bid_frete_internacional: 'Santos',
      destino_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
      descricao_mercadoria_cotacao_bid_frete_internacional: 'Peças',
      ncm_cotacao_bid_frete_internacional: '8471',
      quantidade_volume_cotacao_bid_frete_internacional: 2,
      peso_kg_cotacao_bid_frete_internacional: 1000,
      cubagem_m3_cotacao_bid_frete_internacional: 12,
      incoterm_cotacao_bid_frete_internacional: 'FOB',
      modal_cotacao_bid_frete_internacional: 'MARITIMO',
      modalidade_cotacao_bid_frete_internacional: 'FCL',
      valor_meta_cotacao_bid_frete_internacional: 5000,
      moeda_meta_cotacao_bid_frete_internacional: 'USD',
      data_criacao_cotacao_bid_frete_internacional: new Date('2026-06-01T10:00:00Z'),
      data_limite_resposta_cotacao_bid_frete_internacional: null,
      data_aprovacao_cotacao_bid_frete_internacional: null,
      propostas: [
        {
          valor_total_proposta_bid_frete_internacional: 4800,
          moeda_proposta_bid_frete_internacional: 'USD',
          dias_transito_proposta_bid_frete_internacional: 28,
          status_proposta_bid_frete_internacional: 'PENDENTE',
          data_criacao_proposta_bid_frete_internacional: new Date('2026-06-02T10:00:00Z'),
          fornecedor: { nome_fornecedor_bid_frete_internacional: 'Carrier A' },
        },
      ],
      disparo_cotacao_bid_frete_internacional: [],
    })

    expect(dto.propostas).toHaveLength(1)
    expect(dto.propostas[0]?.fornecedor).toBe('Carrier A')
    expect(dto.historico.some(h => h.texto.includes('Cotação criada'))).toBe(true)
  })

  it('expõe data do primeiro disparo enviado', () => {
    const dto = mapearCotacaoInsightsDetalhe({
      id_cotacao_bid_frete_internacional: 'c2',
      numero_cotacao_bid_frete_internacional: 'COT-002',
      status_cotacao_bid_frete_internacional: 'ENVIADA_FORNECEDORES',
      origem_nome_cotacao_bid_frete_internacional: 'Shanghai',
      origem_codigo_cotacao_bid_frete_internacional: 'CNSHA',
      destino_nome_cotacao_bid_frete_internacional: 'Santos',
      destino_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
      descricao_mercadoria_cotacao_bid_frete_internacional: 'Peças',
      ncm_cotacao_bid_frete_internacional: null,
      quantidade_volume_cotacao_bid_frete_internacional: 1,
      peso_kg_cotacao_bid_frete_internacional: null,
      cubagem_m3_cotacao_bid_frete_internacional: null,
      incoterm_cotacao_bid_frete_internacional: 'FOB',
      modal_cotacao_bid_frete_internacional: 'MARITIMO',
      modalidade_cotacao_bid_frete_internacional: 'FCL',
      valor_meta_cotacao_bid_frete_internacional: null,
      moeda_meta_cotacao_bid_frete_internacional: null,
      data_criacao_cotacao_bid_frete_internacional: new Date('2026-06-01T10:00:00Z'),
      data_limite_resposta_cotacao_bid_frete_internacional: null,
      data_aprovacao_cotacao_bid_frete_internacional: null,
      propostas: [],
      disparo_cotacao_bid_frete_internacional: [
        {
          data_envio_disparo_cotacao_bid_frete_internacional: new Date('2026-06-03T08:00:00Z'),
          data_resposta_disparo_cotacao_bid_frete_internacional: null,
          fornecedor: { nome_fornecedor_bid_frete_internacional: 'Carrier B' },
        },
        {
          data_envio_disparo_cotacao_bid_frete_internacional: new Date('2026-06-02T08:00:00Z'),
          data_resposta_disparo_cotacao_bid_frete_internacional: null,
          fornecedor: { nome_fornecedor_bid_frete_internacional: 'Carrier A' },
        },
      ],
    })

    expect(dto.data_envio_disparo_cotacao_bid_frete_internacional).toBe(
      new Date('2026-06-02T08:00:00Z').toISOString(),
    )
  })
})
