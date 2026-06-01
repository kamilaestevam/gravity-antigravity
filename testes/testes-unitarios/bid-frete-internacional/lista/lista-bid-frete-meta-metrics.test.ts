import { describe, expect, it } from 'vitest'
import {
  analisarCotacaoAcimaMeta,
  calcularMetricasCotacoesAcimaMeta,
  obterValorComparacaoMeta,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/lista-bid-frete-meta-metrics'
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
    status_cotacao_bid_frete_internacional: 'EM_COTACAO',
    origem_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
    origem_nome_cotacao_bid_frete_internacional: 'Santos',
    origem_pais_cotacao_bid_frete_internacional: 'BR',
    destino_codigo_cotacao_bid_frete_internacional: 'CNSHA',
    destino_nome_cotacao_bid_frete_internacional: 'Shanghai',
    destino_pais_cotacao_bid_frete_internacional: 'CN',
    descricao_mercadoria_cotacao_bid_frete_internacional: 'Carga',
    ncm_cotacao_bid_frete_internacional: null,
    quantidade_volume_cotacao_bid_frete_internacional: 1,
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

describe('lista-bid-frete-meta-metrics', () => {
  it('usa melhor proposta quando valor está acima da meta', () => {
    const cotacao = cotacaoBase({
      id_cotacao_bid_frete_internacional: 'c1',
      numero_cotacao_bid_frete_internacional: 'BID-100',
      valor_meta_cotacao_bid_frete_internacional: 5000,
      propostas_bid_frete_internacional: [
        {
          id_proposta_bid_frete_internacional: 'p1',
          id_organizacao: 'org-1',
          id_cotacao_bid_frete_internacional: 'c1',
          id_fornecedor_bid_frete_internacional: 'f1',
          id_disparo_cotacao_bid_frete_internacional: 'd1',
          moeda_proposta_bid_frete_internacional: 'USD',
          valor_frete_proposta_bid_frete_internacional: 5200,
          taxas_origem_proposta_bid_frete_internacional: 0,
          taxas_destino_proposta_bid_frete_internacional: 0,
          valor_total_proposta_bid_frete_internacional: 5200,
          dias_transito_proposta_bid_frete_internacional: 20,
          dias_free_time_proposta_bid_frete_internacional: null,
          quantidade_transbordo_proposta_bid_frete_internacional: 0,
          quantidade_escala_proposta_bid_frete_internacional: 0,
          validade_proposta_bid_frete_internacional: '2026-06-01',
          observacoes_proposta_bid_frete_internacional: null,
          status_proposta_bid_frete_internacional: 'EM_ANALISE',
          data_criacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
          data_atualizacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
        },
        {
          id_proposta_bid_frete_internacional: 'p2',
          id_organizacao: 'org-1',
          id_cotacao_bid_frete_internacional: 'c1',
          id_fornecedor_bid_frete_internacional: 'f2',
          id_disparo_cotacao_bid_frete_internacional: 'd2',
          moeda_proposta_bid_frete_internacional: 'USD',
          valor_frete_proposta_bid_frete_internacional: 6000,
          taxas_origem_proposta_bid_frete_internacional: 0,
          taxas_destino_proposta_bid_frete_internacional: 0,
          valor_total_proposta_bid_frete_internacional: 6000,
          dias_transito_proposta_bid_frete_internacional: 18,
          dias_free_time_proposta_bid_frete_internacional: null,
          quantidade_transbordo_proposta_bid_frete_internacional: 0,
          quantidade_escala_proposta_bid_frete_internacional: 0,
          validade_proposta_bid_frete_internacional: '2026-06-01',
          observacoes_proposta_bid_frete_internacional: null,
          status_proposta_bid_frete_internacional: 'EM_ANALISE',
          data_criacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
          data_atualizacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
        },
      ],
    })

    expect(obterValorComparacaoMeta(cotacao)).toBe(5200)
    const detalhe = analisarCotacaoAcimaMeta(cotacao)
    expect(detalhe?.percentualAcima).toBe(4)
  })

  it('ignora cotação abaixo da meta e agrega métricas', () => {
    const acima = cotacaoBase({
      id_cotacao_bid_frete_internacional: 'c-acima',
      numero_cotacao_bid_frete_internacional: 'BID-ACIMA',
      valor_meta_cotacao_bid_frete_internacional: 1000,
      propostas_bid_frete_internacional: [{
        id_proposta_bid_frete_internacional: 'p1',
        id_organizacao: 'org-1',
        id_cotacao_bid_frete_internacional: 'c-acima',
        id_fornecedor_bid_frete_internacional: 'f1',
        id_disparo_cotacao_bid_frete_internacional: 'd1',
        moeda_proposta_bid_frete_internacional: 'USD',
        valor_frete_proposta_bid_frete_internacional: 1200,
        taxas_origem_proposta_bid_frete_internacional: 0,
        taxas_destino_proposta_bid_frete_internacional: 0,
        valor_total_proposta_bid_frete_internacional: 1200,
        dias_transito_proposta_bid_frete_internacional: 20,
        dias_free_time_proposta_bid_frete_internacional: null,
        quantidade_transbordo_proposta_bid_frete_internacional: 0,
        quantidade_escala_proposta_bid_frete_internacional: 0,
        validade_proposta_bid_frete_internacional: '2026-06-01',
        observacoes_proposta_bid_frete_internacional: null,
        status_proposta_bid_frete_internacional: 'EM_ANALISE',
        data_criacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
        data_atualizacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
      }],
    })
    const abaixo = cotacaoBase({
      id_cotacao_bid_frete_internacional: 'c-abaixo',
      valor_meta_cotacao_bid_frete_internacional: 1000,
      propostas_bid_frete_internacional: [{
        id_proposta_bid_frete_internacional: 'p2',
        id_organizacao: 'org-1',
        id_cotacao_bid_frete_internacional: 'c-abaixo',
        id_fornecedor_bid_frete_internacional: 'f2',
        id_disparo_cotacao_bid_frete_internacional: 'd2',
        moeda_proposta_bid_frete_internacional: 'USD',
        valor_frete_proposta_bid_frete_internacional: 900,
        taxas_origem_proposta_bid_frete_internacional: 0,
        taxas_destino_proposta_bid_frete_internacional: 0,
        valor_total_proposta_bid_frete_internacional: 900,
        dias_transito_proposta_bid_frete_internacional: 20,
        dias_free_time_proposta_bid_frete_internacional: null,
        quantidade_transbordo_proposta_bid_frete_internacional: 0,
        quantidade_escala_proposta_bid_frete_internacional: 0,
        validade_proposta_bid_frete_internacional: '2026-06-01',
        observacoes_proposta_bid_frete_internacional: null,
        status_proposta_bid_frete_internacional: 'EM_ANALISE',
        data_criacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
        data_atualizacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
      }],
    })

    const metricas = calcularMetricasCotacoesAcimaMeta([acima, abaixo])
    expect(metricas.quantidade).toBe(1)
    expect(metricas.totalComMetaAvaliavel).toBe(2)
    expect(metricas.percentualDoTotalComMeta).toBe(50)
    expect(metricas.percentualMedioAcima).toBe(20)
    expect(metricas.detalhes[0]?.numero).toBe('BID-ACIMA')
  })
})
