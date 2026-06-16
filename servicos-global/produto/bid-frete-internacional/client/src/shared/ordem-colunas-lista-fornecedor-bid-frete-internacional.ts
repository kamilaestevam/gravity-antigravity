/**
 * Ordem e visibilidade padrão da Lista — Visão Fornecedor BID Frete Internacional.
 * SSOT — espelha o layout acordado em produção (:8000).
 */

/** Colunas ocultas por padrão (Transit time, Validade proposta). */
export const CHAVES_COLUNAS_OCULTAS_PADRAO_FORNECEDOR: readonly string[] = [
  'dias_transito_proposta_bid_frete_internacional',
  'validade_proposta_bid_frete_internacional',
]

/** 11 colunas exibidas por padrão — ordem exata da tabela em produção. */
export const CHAVES_COLUNAS_PADRAO_VISIVEIS_FORNECEDOR: readonly string[] = [
  'numero_cotacao_bid_frete_internacional',
  'referencia_interna_cotacao_bid_frete_internacional',
  'data_criacao_cotacao_bid_frete_internacional',
  'data_limite_resposta_cotacao_bid_frete_internacional',
  'nome_usuario_solicitante_bid_frete_internacional',
  'origem_nome_cotacao_bid_frete_internacional',
  'destino_nome_cotacao_bid_frete_internacional',
  'modal_cotacao_bid_frete_internacional',
  'modalidade_cotacao_bid_frete_internacional',
  'status_cotacao_bid_frete_internacional',
  'valor_total_proposta_bid_frete_internacional',
]

/** Ordem completa do catálogo fornecedor — exibidas + ocultas. */
export const ORDEM_COLUNAS_LISTA_FORNECEDOR_BID_FRETE_INTERNACIONAL: readonly string[] = [
  ...CHAVES_COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
  ...CHAVES_COLUNAS_OCULTAS_PADRAO_FORNECEDOR,
]

export {
  normalizarColunasVisiveisListaBidFrete as normalizarColunasVisiveisListaFornecedorBidFrete,
  ordemColunasVisiveisDivergeDaCanonica as ordemColunasVisiveisFornecedorDivergeDaCanonica,
} from './ordem-colunas-lista-bid-frete-internacional'
