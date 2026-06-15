/** Contratos compartilhados — importação de cotações/BID via planilha */

export type CampoImportacaoBidFreteInternacional =
  | 'referencia_interna_cotacao_bid_frete_internacional'
  | 'tipo_operacao_cotacao_bid_frete_internacional'
  | 'status_cotacao_bid_frete_internacional'
  | 'modal_cotacao_bid_frete_internacional'
  | 'modalidade_cotacao_bid_frete_internacional'
  | 'porto_origem_cotacao_bid_frete_internacional'
  | 'aeroporto_origem_cotacao_bid_frete_internacional'
  | 'origem_nome_cotacao_bid_frete_internacional'
  | 'origem_pais_cotacao_bid_frete_internacional'
  | 'endereco_origem_cotacao_bid_frete_internacional'
  | 'porto_destino_cotacao_bid_frete_internacional'
  | 'aeroporto_destino_cotacao_bid_frete_internacional'
  | 'destino_nome_cotacao_bid_frete_internacional'
  | 'destino_pais_cotacao_bid_frete_internacional'
  | 'endereco_destino_cotacao_bid_frete_internacional'
  | 'descricao_mercadoria_cotacao_bid_frete_internacional'
  | 'ncm_cotacao_bid_frete_internacional'
  | 'quantidade_volume_cotacao_bid_frete_internacional'
  | 'tipo_container_cotacao_bid_frete_internacional'
  | 'peso_kg_cotacao_bid_frete_internacional'
  | 'cubagem_m3_cotacao_bid_frete_internacional'
  | 'incoterm_cotacao_bid_frete_internacional'
  | 'zipcode_origem_cotacao_bid_frete_internacional'
  | 'zipcode_destino_cotacao_bid_frete_internacional'
  | 'valor_meta_cotacao_bid_frete_internacional'
  | 'moeda_meta_cotacao_bid_frete_internacional'
  | 'visibilidade_cotacao_bid_frete_internacional'
  | 'anonima_cotacao_bid_frete_internacional'
  | 'data_limite_resposta_cotacao_bid_frete_internacional'
  | 'data_aprovacao_cotacao_bid_frete_internacional'
  | 'data_cancelamento_cotacao_bid_frete_internacional'
  | 'motivo_reprovacao_cotacao_bid_frete_internacional'
  | 'motivo_cancelamento_cotacao_bid_frete_internacional'
  /** Apenas mapeamento (forwarder / legado) — não aparece no template Gravity. */
  | 'origem_codigo_cotacao_bid_frete_internacional'
  | 'destino_codigo_cotacao_bid_frete_internacional'

export type GrupoCampoImportacaoBidFreteInternacional = 'essencial' | 'detalhes'

export type ModoPlanilhaImportacaoBidFreteInternacional = 'gravity' | 'usuario'

export type NivelConfiancaMapeamento = 'auto' | 'confirmado' | 'ignorado'

export interface ColunaMapeadaBidFreteInternacional {
  coluna_arquivo: string
  campo_sistema: CampoImportacaoBidFreteInternacional | null
  confianca: number
  nivel: NivelConfiancaMapeamento
  inferido_por: 'rotulo' | 'nome_interno' | 'alias' | 'dados' | 'usuario'
  valor_exemplo: string | null
}

export type LinhaImportacaoBidFreteInternacional = Record<CampoImportacaoBidFreteInternacional, string>

export interface ResultadoParseImportacaoBidFreteInternacional {
  linhas: LinhaImportacaoBidFreteInternacional[]
  mapeamento: ColunaMapeadaBidFreteInternacional[]
  confianca_global: number
  score_essenciais: number
  colunas_detectadas: Set<CampoImportacaoBidFreteInternacional>
}

/** Campos do template Gravity (espelho da lista — exclui técnicos e legado). */
export const CAMPOS_TEMPLATE_GRAVITY_BID: readonly CampoImportacaoBidFreteInternacional[] = [
  'referencia_interna_cotacao_bid_frete_internacional',
  'tipo_operacao_cotacao_bid_frete_internacional',
  'status_cotacao_bid_frete_internacional',
  'modal_cotacao_bid_frete_internacional',
  'modalidade_cotacao_bid_frete_internacional',
  'porto_origem_cotacao_bid_frete_internacional',
  'aeroporto_origem_cotacao_bid_frete_internacional',
  'origem_nome_cotacao_bid_frete_internacional',
  'origem_pais_cotacao_bid_frete_internacional',
  'endereco_origem_cotacao_bid_frete_internacional',
  'porto_destino_cotacao_bid_frete_internacional',
  'aeroporto_destino_cotacao_bid_frete_internacional',
  'destino_nome_cotacao_bid_frete_internacional',
  'destino_pais_cotacao_bid_frete_internacional',
  'endereco_destino_cotacao_bid_frete_internacional',
  'descricao_mercadoria_cotacao_bid_frete_internacional',
  'ncm_cotacao_bid_frete_internacional',
  'quantidade_volume_cotacao_bid_frete_internacional',
  'tipo_container_cotacao_bid_frete_internacional',
  'peso_kg_cotacao_bid_frete_internacional',
  'cubagem_m3_cotacao_bid_frete_internacional',
  'incoterm_cotacao_bid_frete_internacional',
  'zipcode_origem_cotacao_bid_frete_internacional',
  'zipcode_destino_cotacao_bid_frete_internacional',
  'valor_meta_cotacao_bid_frete_internacional',
  'moeda_meta_cotacao_bid_frete_internacional',
  'visibilidade_cotacao_bid_frete_internacional',
  'anonima_cotacao_bid_frete_internacional',
  'data_limite_resposta_cotacao_bid_frete_internacional',
  'data_aprovacao_cotacao_bid_frete_internacional',
  'data_cancelamento_cotacao_bid_frete_internacional',
  'motivo_reprovacao_cotacao_bid_frete_internacional',
  'motivo_cancelamento_cotacao_bid_frete_internacional',
] as const
