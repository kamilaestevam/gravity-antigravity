import { describe, expect, it } from 'vitest'
import {
  calcularMetricaCardCustom,
  formatarValorCardCustom,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/lista-bid-frete-card-custom'
import type { CardDefinicao } from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/use-card-preferences'
import type { Cotacao } from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

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
    quantidade_volume_cotacao_bid_frete_internacional: 1,
    tipo_container_cotacao_bid_frete_internacional: null,
    peso_kg_cotacao_bid_frete_internacional: null,
    cubagem_m3_cotacao_bid_frete_internacional: null,
    incoterm_cotacao_bid_frete_internacional: 'FOB',
    zipcode_destino_cotacao_bid_frete_internacional: null,
    visibilidade_cotacao_bid_frete_internacional: 'DIRECIONADA',
    anonima_cotacao_bid_frete_internacional: false,
    valor_meta_cotacao_bid_frete_internacional: 1000,
    moeda_meta_cotacao_bid_frete_internacional: 'USD',
    data_limite_resposta_cotacao_bid_frete_internacional: null,
    ganho_valor_cotacao_bid_frete_internacional: 50,
    ganho_percentual_cotacao_bid_frete_internacional: null,
    data_criacao_cotacao_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
    data_atualizacao_cotacao_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
    ...partial,
  }
}

const defSoma: CardDefinicao = {
  id: 'card_test',
  campoBase: 'ganho_valor_cotacao_bid_frete_internacional',
  tipoAgg: 'Soma',
  origem: 'Cotação',
  labelKey: 'Saving custom',
  descKey: '',
  descricao: 'Teste',
}

describe('lista-bid-frete-card-custom', () => {
  it('soma campo da cotação', () => {
    const valor = calcularMetricaCardCustom(defSoma, [
      cotacaoBase({ id_cotacao_bid_frete_internacional: 'c1', ganho_valor_cotacao_bid_frete_internacional: 40 }),
      cotacaoBase({ id_cotacao_bid_frete_internacional: 'c2', ganho_valor_cotacao_bid_frete_internacional: 60 }),
    ])
    expect(valor).toBe(100)
  })

  it('conta propostas quando origem é Proposta', () => {
    const def: CardDefinicao = {
      ...defSoma,
      campoBase: 'id',
      tipoAgg: 'Contagem',
      origem: 'Proposta',
    }
    const valor = calcularMetricaCardCustom(def, [
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
            valor_frete_proposta_bid_frete_internacional: 1,
            taxas_origem_proposta_bid_frete_internacional: 0,
            taxas_destino_proposta_bid_frete_internacional: 0,
            valor_total_proposta_bid_frete_internacional: 1,
            dias_transito_proposta_bid_frete_internacional: 1,
            dias_free_time_proposta_bid_frete_internacional: null,
            quantidade_transbordo_proposta_bid_frete_internacional: 0,
            quantidade_escala_proposta_bid_frete_internacional: 0,
            validade_proposta_bid_frete_internacional: '2026-06-01',
            observacoes_proposta_bid_frete_internacional: null,
            status_proposta_bid_frete_internacional: 'PENDENTE',
            data_criacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
            data_atualizacao_proposta_bid_frete_internacional: '2026-05-28T10:00:00.000Z',
          },
        ],
      }),
    ])
    expect(valor).toBe(1)
  })

  it('formata valor monetário', () => {
    const fmt = (n: number, casas = 2) => n.toFixed(casas)
    expect(formatarValorCardCustom(defSoma, 1234.5, fmt)).toBe('USD 1234.50')
  })
})
