/**
 * Ordem e visibilidade padrão da Lista BID Frete Internacional (seletor Colunas + tabela).
 * SSOT — espelha o layout acordado em produção (:8000).
 */

/** Colunas ocultas por padrão (aba "Ocultas" no seletor — após as exibidas). */
export const CHAVES_COLUNAS_OCULTAS_PADRAO_LISTA: readonly string[] = [
  'id_cotacao_bid_frete_internacional',
  'id_produto_gravity',
  'id_usuario',
]

/** 41 colunas exibidas por padrão — ordem exata do seletor "Todas". */
export const CHAVES_COLUNAS_PADRAO_VISIVEIS_LISTA: readonly string[] = [
  'numero_cotacao_bid_frete_internacional',
  'status_cotacao_bid_frete_internacional',
  'tipo_operacao_cotacao_bid_frete_internacional',
  'modal_cotacao_bid_frete_internacional',
  'modalidade_cotacao_bid_frete_internacional',
  'porto_destino_cotacao_bid_frete_internacional',
  'porto_origem_cotacao_bid_frete_internacional',
  'tipo_container_cotacao_bid_frete_internacional',
  'peso_kg_cotacao_bid_frete_internacional',
  'cubagem_m3_cotacao_bid_frete_internacional',
  'quantidade_cotacao_bid_frete_internacional',
  'aeroporto_origem_cotacao_bid_frete_internacional',
  'aeroporto_destino_cotacao_bid_frete_internacional',
  'ncm_cotacao_bid_frete_internacional',
  'incoterm_cotacao_bid_frete_internacional',
  'descricao_mercadoria_cotacao_bid_frete_internacional',
  'moeda_meta_cotacao_bid_frete_internacional',
  'valor_meta_cotacao_bid_frete_internacional',
  'visibilidade_cotacao_bid_frete_internacional',
  'anonima_cotacao_bid_frete_internacional',
  'data_limite_resposta_cotacao_bid_frete_internacional',
  'id_organizacao',
  'id_workspace',
  'referencia_interna_cotacao_bid_frete_internacional',
  'origem_nome_cotacao_bid_frete_internacional',
  'endereco_origem_cotacao_bid_frete_internacional',
  'origem_pais_cotacao_bid_frete_internacional',
  'zipcode_origem_cotacao_bid_frete_internacional',
  'destino_nome_cotacao_bid_frete_internacional',
  'endereco_destino_cotacao_bid_frete_internacional',
  'destino_pais_cotacao_bid_frete_internacional',
  'zipcode_destino_cotacao_bid_frete_internacional',
  'data_atualizacao_cotacao_bid_frete_internacional',
  'data_criacao_cotacao_bid_frete_internacional',
  'data_aprovacao_cotacao_bid_frete_internacional',
  'id_fornecedor_vencedor_cotacao_bid_frete_internacional',
  'ganho_valor_cotacao_bid_frete_internacional',
  'ganho_percentual_cotacao_bid_frete_internacional',
  'data_cancelamento_cotacao_bid_frete_internacional',
  'motivo_cancelamento_cotacao_bid_frete_internacional',
  'motivo_reprovacao_cotacao_bid_frete_internacional',
]

/** Ordem completa do catálogo (44) — exibidas + ocultas. */
export const ORDEM_COLUNAS_LISTA_BID_FRETE_INTERNACIONAL: readonly string[] = [
  ...CHAVES_COLUNAS_PADRAO_VISIVEIS_LISTA,
  ...CHAVES_COLUNAS_OCULTAS_PADRAO_LISTA,
]
