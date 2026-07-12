import type { PropostaRankingBidFreteInternacional } from '@produto/bid-frete-internacional/client/src/shared/types'

/** Proposta vencedora do card Melhor proposta (demo manual §7.02). */
export const ID_PROPOSTA_MELHOR_PAINEL_INSIGHTS = 'prop-kn-demo'

const CAMPOS_BASE_MOCK = {
  id_cotacao_bid_frete_internacional: 'cot-manual-0007',
  id_organizacao: 'org-demo-manual',
  id_fornecedor_bid_frete_internacional: 'forn-demo',
  id_disparo_cotacao_bid_frete_internacional: 'disp-demo',
  moeda_proposta_bid_frete_internacional: 'USD',
  taxas_origem_proposta_bid_frete_internacional: 0,
  taxas_destino_proposta_bid_frete_internacional: 0,
  quantidade_transbordo_proposta_bid_frete_internacional: 0,
  validade_proposta_bid_frete_internacional: '2026-12-31',
  observacoes_proposta_bid_frete_internacional: null,
  status_proposta_bid_frete_internacional: 'ENVIADA',
  data_criacao_proposta_bid_frete_internacional: '2026-07-01T12:00:00.000Z',
  data_atualizacao_proposta_bid_frete_internacional: '2026-07-01T12:00:00.000Z',
} as const

function criarPropostaDemo(
  id: string,
  fornecedor: string,
  ranking: number,
  valorTotal: number,
  diasTransito: number,
  diasFreeTime: number,
): PropostaRankingBidFreteInternacional {
  return {
    ...CAMPOS_BASE_MOCK,
    id_proposta_bid_frete_internacional: id,
    id_fornecedor_bid_frete_internacional: `forn-${id}`,
    id_disparo_cotacao_bid_frete_internacional: `disp-${id}`,
    fornecedor_nome: fornecedor,
    ranking_geral: ranking,
    valor_frete_proposta_bid_frete_internacional: valorTotal,
    valor_total_proposta_bid_frete_internacional: valorTotal,
    dias_transito_proposta_bid_frete_internacional: diasTransito,
    dias_free_time_proposta_bid_frete_internacional: diasFreeTime,
    quantidade_escala_proposta_bid_frete_internacional: 0,
  }
}

/** Três propostas alinhadas aos prints do Painel de Insights (COT-MANUAL-0007/26). */
export const PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE: PropostaRankingBidFreteInternacional[] = [
  criarPropostaDemo(ID_PROPOSTA_MELHOR_PAINEL_INSIGHTS, 'Agente de Carga Ltda', 1, 2150, 30, 15),
  criarPropostaDemo('prop-dhl-demo', 'DHL Agente', 2, 3800, 25, 20),
  criarPropostaDemo('prop-asia-demo', 'ASIA SUPPLY CO LTD', 3, 4200, 40, 7),
]
