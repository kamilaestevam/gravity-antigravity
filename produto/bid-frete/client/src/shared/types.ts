/**
 * types.ts — Tipos compartilhados do BID Frete
 */

export type TipoOperacao = 'IMPORTACAO' | 'EXPORTACAO'
export type ModalFrete = 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
export type ModalidadeCarga = 'FCL' | 'LCL' | 'AEREO_GERAL' | 'RODOVIARIO_FTL' | 'RODOVIARIO_LTL'
export type StatusCotacao = 'RASCUNHO' | 'ENVIADA_FORNECEDORES' | 'EM_COTACAO' | 'AGUARDANDO_APROVACAO' | 'APROVADA' | 'REPROVADA' | 'CANCELADA' | 'FALTA_INFORMACAO' | 'EXPIRADA'
export type TipoFornecedor = 'AGENTE_CARGA' | 'ARMADOR' | 'CIA_AEREA' | 'TRANSPORTADORA'
export type CanalDisparo = 'EMAIL' | 'WHATSAPP' | 'API' | 'PORTAL'
export type VisibilidadeCotacao = 'DIRECIONADA' | 'ABERTA'

export interface Cotacao {
  id: string
  numero: string
  referencia_interna?: string
  tipo_operacao: TipoOperacao
  modal: ModalFrete
  modalidade: ModalidadeCarga
  origem_codigo: string
  origem_nome: string
  origem_pais: string
  destino_codigo: string
  destino_nome: string
  destino_pais: string
  descricao_mercadoria: string
  ncm?: string
  quantidade: number
  tipo_container?: string
  peso_kg?: number
  cubagem_m3?: number
  incoterm: string
  valor_target?: number
  moeda_target?: string
  visibilidade: VisibilidadeCotacao
  ocultar_nome_empresa: boolean
  status: StatusCotacao
  data_limite_resposta?: string
  data_aprovacao?: string
  fornecedor_vencedor_id?: string
  saving_valor?: number
  saving_percentual?: number
  created_at: string
  updated_at: string
  bid_requests?: BidRequest[]
  bid_responses?: BidResponse[]
}

export interface Fornecedor {
  id: string
  nome: string
  nome_fantasia?: string
  tipo: TipoFornecedor
  cnpj?: string
  email: string
  telefone?: string
  whatsapp?: string
  website?: string
  pais?: string
  cidade?: string
  status: 'ATIVO' | 'INATIVO' | 'PENDENTE_APROVACAO' | 'BLOQUEADO'
  aceita_cotacao_aberta: boolean
  cotacao_automatica: boolean
  clerk_user_id?: string
  created_at: string
  _count?: { bid_requests: number; bid_responses: number; avaliacoes: number }
}

export interface BidRequest {
  id: string
  cotacao_id: string
  fornecedor_id: string
  canal: CanalDisparo
  status: 'PENDENTE' | 'ENVIADO' | 'VISUALIZADO' | 'RESPONDIDO' | 'EXPIRADO' | 'ERRO_ENVIO'
  enviado_em?: string
  respondido_em?: string
  fornecedor?: Pick<Fornecedor, 'id' | 'nome' | 'tipo' | 'email'>
  response?: BidResponse
}

export interface BidResponse {
  id: string
  cotacao_id: string
  fornecedor_id: string
  moeda: string
  valor_frete: number
  taxas_origem: number
  taxas_destino: number
  valor_total: number
  transit_time_dias: number
  free_time_dias?: number
  validade_cotacao: string
  transbordos: number
  escalas?: string
  observacoes?: string
  status: string
  ranking_preco?: number
  ranking_transit?: number
  ranking_avaliacao?: number
  via_tabela_padrao: boolean
  via_api: boolean
  via_portal: boolean
  via_email: boolean
  fornecedor?: Pick<Fornecedor, 'id' | 'nome' | 'tipo' | 'email'>
  detalhes_taxas?: DetalheTaxa[]
}

export interface DetalheTaxa {
  id: string
  tipo: 'origem' | 'destino' | 'frete'
  nome: string
  valor: number
  moeda: string
}

export interface TabelaPreco {
  id: string
  fornecedor_id: string
  origem_codigo: string
  origem_nome: string
  destino_codigo: string
  destino_nome: string
  modal: ModalFrete
  modalidade: ModalidadeCarga
  moeda: string
  valor_frete: number
  taxas_origem: number
  taxas_destino: number
  valor_total: number
  transit_time_dias: number
  free_time_dias?: number
  validade_inicio: string
  validade_fim: string
  ativa: boolean
}

export interface RatingFornecedor {
  fornecedor_email: string
  rating_global: number
  total_cotacoes_recebidas: number
  total_cotacoes_respondidas: number
  total_cotacoes_aprovadas: number
  taxa_resposta: number
  taxa_aprovacao: number
  tempo_medio_resposta_horas: number
  media_frete: number
  media_atendimento: number
  media_resposta: number
  media_confiabilidade: number
  total_avaliacoes: number
}

export interface DashboardKPIs {
  cotacoes_andamento: number
  cotacoes_passadas: number
  valor_andamento_usd: number
  valor_aprovado_usd: number
  aprovacao: {
    total: number
    em_tempo: number
    fora_prazo: number
    percentual_em_tempo: string
  }
  savings: {
    total_cotacoes_aprovadas: number
    total_saving_vs_target: number
    total_saving_vs_media: number
    total_valor_aprovado: number
    media_saving_percentual: number
    moeda: string
  }
  funil: Array<{ status: string; count: number }>
}

export interface Porto {
  codigo: string
  nome: string
  pais: string
  pais_codigo: string
  tipo: 'porto' | 'aeroporto' | 'rodoviario'
}

export interface Incoterm {
  codigo: string
  nome: string
  grupo: string
  descricao: string
}
