import type { TFunction } from 'i18next'

/** Campo Prisma → chave camelCase em `bidfrete.colunas`. */
const CHAVE_I18N_COLUNA_LISTA: Record<string, string> = {
  numero_cotacao_bid_frete_internacional: 'numeroCotacao',
  id_cotacao_bid_frete_internacional: 'id',
  id_organizacao: 'organizacao',
  id_produto_gravity: 'produtoGravity',
  id_usuario: 'usuario',
  id_workspace: 'workspace',
  referencia_interna_cotacao_bid_frete_internacional: 'referenciaInterna',
  tipo_operacao_cotacao_bid_frete_internacional: 'operacao',
  status_cotacao_bid_frete_internacional: 'status',
  data_criacao_cotacao_bid_frete_internacional: 'dataCotacao',
  data_atualizacao_cotacao_bid_frete_internacional: 'ultimaAtualizacao',
  modal_cotacao_bid_frete_internacional: 'modal',
  modalidade_cotacao_bid_frete_internacional: 'modalidade',
  porto_origem_cotacao_bid_frete_internacional: 'portoOrigem',
  aeroporto_origem_cotacao_bid_frete_internacional: 'aeroportoOrigem',
  origem_nome_cotacao_bid_frete_internacional: 'origem',
  origem_pais_cotacao_bid_frete_internacional: 'paisOrigem',
  endereco_origem_cotacao_bid_frete_internacional: 'enderecoOrigem',
  porto_destino_cotacao_bid_frete_internacional: 'portoDestino',
  aeroporto_destino_cotacao_bid_frete_internacional: 'aeroportoDestino',
  destino_nome_cotacao_bid_frete_internacional: 'destino',
  destino_pais_cotacao_bid_frete_internacional: 'paisDestino',
  endereco_destino_cotacao_bid_frete_internacional: 'enderecoDestino',
  descricao_mercadoria_cotacao_bid_frete_internacional: 'descricaoMercadoria',
  ncm_cotacao_bid_frete_internacional: 'ncm',
  quantidade_cotacao_bid_frete_internacional: 'quantidade',
  tipo_container_cotacao_bid_frete_internacional: 'tipoContainer',
  peso_kg_cotacao_bid_frete_internacional: 'pesoKg',
  cubagem_m3_cotacao_bid_frete_internacional: 'volumeM3',
  incoterm_cotacao_bid_frete_internacional: 'incoterm',
  zipcode_origem_cotacao_bid_frete_internacional: 'zipcodeOrigem',
  zipcode_destino_cotacao_bid_frete_internacional: 'zipcodeDestino',
  valor_meta_cotacao_bid_frete_internacional: 'valorMeta',
  moeda_meta_cotacao_bid_frete_internacional: 'moedaMeta',
  visibilidade_cotacao_bid_frete_internacional: 'visibilidade',
  anonima_cotacao_bid_frete_internacional: 'anonima',
  id_fornecedor_vencedor_cotacao_bid_frete_internacional: 'fornecedorVencedor',
  ganho_valor_cotacao_bid_frete_internacional: 'ganhoEstimado',
  ganho_percentual_cotacao_bid_frete_internacional: 'ganhoPercentual',
}

/** Campo Prisma → chave em `bidfrete.colunas_datas_motivos`. */
const CHAVE_I18N_COLUNAS_DATAS_MOTIVOS: Record<string, string> = {
  data_limite_resposta_cotacao_bid_frete_internacional: 'data_limite_resposta',
  data_aprovacao_cotacao_bid_frete_internacional: 'data_aprovacao',
  data_cancelamento_cotacao_bid_frete_internacional: 'data_cancelamento',
  motivo_reprovacao_cotacao_bid_frete_internacional: 'motivo_reprovacao',
  motivo_cancelamento_cotacao_bid_frete_internacional: 'motivo_cancelamento',
}

export function traduzirLabelColunaListaBidFrete(
  t: TFunction | null | undefined,
  chaveCampo: string,
  padraoPt: string,
): string {
  if (!t) return padraoPt

  const chaveDatas = CHAVE_I18N_COLUNAS_DATAS_MOTIVOS[chaveCampo]
  if (chaveDatas) {
    return t(`bidfrete.colunas_datas_motivos.${chaveDatas}`, { defaultValue: padraoPt })
  }

  const chaveColuna = CHAVE_I18N_COLUNA_LISTA[chaveCampo]
  if (chaveColuna) {
    return t(`bidfrete.colunas.${chaveColuna}`, { defaultValue: padraoPt })
  }

  return padraoPt
}
