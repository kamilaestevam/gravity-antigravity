import { describe, expect, it } from 'vitest'
import {
  calcularStatsListaBidFrete,
  calcularTempoMedioRespostaHoras,
  somarValorTotalFreteAprovado,
} from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/lista-bid-frete-kpi-metrics'
import type { Cotacao } from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

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

describe('lista-bid-frete-kpi-metrics', () => {
  it('soma propostas aprovadas quando existem', () => {
    const total = somarValorTotalFreteAprovado([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c1',
        propostas_bid_frete_internacional: [
          {
            id_proposta_bid_frete_internacional: 'p1',
            id_organizacao: 'org-1',
            id_cotacao_bid_frete_internacional: 'c1',
            id_fornecedor_bid_frete_internacional: 'f1',
            id_disparo_cotacao_bid_frete_internacional: 'd1',
            moeda_proposta_bid_frete_internacional: 'USD',
            valor_frete_proposta_bid_frete_internacional: 1000,
            taxas_origem_proposta_bid_frete_internacional: 0,
            taxas_destino_proposta_bid_frete_internacional: 0,
            valor_total_proposta_bid_frete_internacional: 1500,
            dias_transito_proposta_bid_frete_internacional: 20,
            dias_free_time_proposta_bid_frete_internacional: null,
            quantidade_transbordo_proposta_bid_frete_internacional: 0,
            quantidade_escala_proposta_bid_frete_internacional: 0,
            validade_proposta_bid_frete_internacional: '2026-06-01',
            observacoes_proposta_bid_frete_internacional: null,
            status_proposta_bid_frete_internacional: 'APROVADA',
            data_criacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
            data_atualizacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
          },
        ],
      }),
    ])
    expect(total).toBe(1500)
  })

  it('usa valor_aprovado_ganho quando não há proposta aprovada', () => {
    const total = somarValorTotalFreteAprovado([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c2',
        valor_aprovado_ganho_bid_frete_internacional: 2200,
      }),
    ])
    expect(total).toBe(2200)
  })

  it('calcula tempo médio de resposta em horas', () => {
    const media = calcularTempoMedioRespostaHoras([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c3',
        disparo_cotacao_bid_frete_internacional: [
          {
            id_disparo_cotacao_bid_frete_internacional: 'd1',
            id_organizacao: 'org-1',
            id_cotacao_bid_frete_internacional: 'c3',
            id_fornecedor_bid_frete_internacional: 'f1',
            canal_disparo_cotacao_bid_frete_internacional: 'EMAIL',
            status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
            token_resposta_disparo_cotacao_bid_frete_internacional: null,
            data_envio_disparo_cotacao_bid_frete_internacional: '2026-05-28T08:00:00.000Z',
            data_visualizacao_disparo_cotacao_bid_frete_internacional: null,
            data_resposta_disparo_cotacao_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
            data_expiracao_token_disparo_cotacao_bid_frete_internacional: null,
            data_criacao_disparo_cotacao_bid_frete_internacional: '2026-05-28T08:00:00.000Z',
            data_atualizacao_disparo_cotacao_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
          },
        ],
      }),
    ])
    expect(media).toBe(2)
  })

  it('retorna null para tempo médio sem disparos válidos', () => {
    expect(calcularTempoMedioRespostaHoras([cotacaoBase({ id_cotacao_bid_frete_internacional: 'c4' })])).toBeNull()
  })

  it('agrega stats da lista a partir das cotações filtradas', () => {
    const stats = calcularStatsListaBidFrete([
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c5',
        status_cotacao_bid_frete_internacional: 'EM_COTACAO',
        ganho_valor_cotacao_bid_frete_internacional: 100,
        propostas_bid_frete_internacional: [],
      }),
      cotacaoBase({
        id_cotacao_bid_frete_internacional: 'c6',
        status_cotacao_bid_frete_internacional: 'EXPIRADA',
      }),
    ])
    expect(stats.total).toBe(2)
    expect(stats.emAndamento).toBe(1)
    expect(stats.expiradas).toBe(1)
    expect(stats.savingTotal).toBe(100)
  })
})
