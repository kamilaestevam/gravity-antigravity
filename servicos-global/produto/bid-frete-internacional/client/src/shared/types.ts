/**
 * types.ts — Tipos do domínio BID Frete
 * Skill: antigravity-criar-produto (Passo 1 — shared/types.ts)
 * Alinhado com fragment.prisma — enums e campos.
 */

// ─── Enums (espelham fragment.prisma) ────────────────────────────────────────

export type TipoOperacao = 'IMPORTACAO' | 'EXPORTACAO'

export type ModalFrete = 'MARITIMO' | 'AEREO' | 'RODOVIARIO'

export type ModalidadeCarga = 'FCL' | 'LCL' | 'AEREO_GERAL' | 'RODOVIARIO_FTL' | 'RODOVIARIO_LTL'

export type StatusCotacao =
  | 'RASCUNHO'
  | 'ENVIADA_FORNECEDORES'
  | 'EM_COTACAO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADA'
  | 'REPROVADA'
  | 'CANCELADA'
  | 'FALTA_INFORMACAO'
  | 'EXPIRADA'

export type TipoFornecedor = 'AGENTE_CARGA' | 'ARMADOR' | 'CIA_AEREA' | 'TRANSPORTADORA'

export type StatusFornecedor = 'ATIVO' | 'INATIVO' | 'PENDENTE_APROVACAO' | 'BLOQUEADO'

export type CanalDisparo = 'EMAIL' | 'WHATSAPP' | 'API' | 'PORTAL'

export type StatusDisparoCotacaoBidFreteInternacional =
  | 'PENDENTE'
  | 'ENVIADO'
  | 'VISUALIZADO'
  | 'RESPONDIDO'
  | 'EXPIRADO'
  | 'ERRO_ENVIO'

export type Visibilidade = 'DIRECIONADA' | 'ABERTA'

// ─── Labels para UI ──────────────────────────────────────────────────────────

export const OPERACAO_LABELS: Record<TipoOperacao, string> = {
  IMPORTACAO: 'Importação',
  EXPORTACAO: 'Exportação',
}

export const MODAL_LABELS: Record<ModalFrete, string> = {
  MARITIMO: 'Marítimo',
  AEREO: 'Aéreo',
  RODOVIARIO: 'Rodoviário',
}

export const MODALIDADE_LABELS: Record<ModalidadeCarga, string> = {
  FCL: 'FCL',
  LCL: 'LCL',
  AEREO_GERAL: 'Aéreo Geral',
  RODOVIARIO_FTL: 'FTL',
  RODOVIARIO_LTL: 'LTL',
}

export const STATUS_LABELS: Record<StatusCotacao, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADA_FORNECEDORES: 'Enviada ao fornecedor',
  EM_COTACAO: 'Em cotação',
  AGUARDANDO_APROVACAO: 'Aprovação pendente',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  CANCELADA: 'Cancelada',
  FALTA_INFORMACAO: 'Falta de informação',
  EXPIRADA: 'Expirada',
}

export const STATUS_BADGE: Record<StatusCotacao, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  RASCUNHO: 'default',
  ENVIADA_FORNECEDORES: 'info',
  EM_COTACAO: 'info',
  AGUARDANDO_APROVACAO: 'warning',
  APROVADA: 'success',
  REPROVADA: 'danger',
  CANCELADA: 'default',
  FALTA_INFORMACAO: 'warning',
  EXPIRADA: 'default',
}

export const TIPO_FORNECEDOR_LABELS: Record<TipoFornecedor, string> = {
  AGENTE_CARGA: 'Agente de Carga',
  ARMADOR: 'Armador',
  CIA_AEREA: 'Cia Aérea',
  TRANSPORTADORA: 'Transportadora',
}

export const STATUS_FORNECEDOR_LABELS: Record<StatusFornecedor, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  PENDENTE_APROVACAO: 'Pendente',
  BLOQUEADO: 'Bloqueado',
}

export const CANAL_LABELS: Record<CanalDisparo, string> = {
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  API: 'API',
  PORTAL: 'Portal',
}

export const STATUS_DISPARO_COTACAO_BID_FRETE_INTERNACIONAL_LABELS: Record<
  StatusDisparoCotacaoBidFreteInternacional,
  string
> = {
  PENDENTE: 'Pendente',
  ENVIADO: 'Enviado',
  VISUALIZADO: 'Visualizado',
  RESPONDIDO: 'Respondido',
  EXPIRADO: 'Expirado',
  ERRO_ENVIO: 'Erro de envio',
}

export const INCOTERMS = [
  'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP',
  'FAS', 'FOB', 'CFR', 'CIF',
] as const

export type Incoterm = typeof INCOTERMS[number]

// ─── Entidades ───────────────────────────────────────────────────────────────

export interface Cotacao {
  id_cotacao_bid_frete_internacional: string
  id_organizacao: string
  id_usuario: string | null
  id_workspace?: string | null
  numero_cotacao_bid_frete_internacional: string
  referencia_interna_cotacao_bid_frete_internacional: string | null
  tipo_operacao_cotacao_bid_frete_internacional: TipoOperacao
  modal_cotacao_bid_frete_internacional: ModalFrete
  modalidade_cotacao_bid_frete_internacional: ModalidadeCarga
  status_cotacao_bid_frete_internacional: StatusCotacao
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  origem_pais_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  destino_pais_cotacao_bid_frete_internacional: string
  descricao_mercadoria_cotacao_bid_frete_internacional: string
  ncm_cotacao_bid_frete_internacional: string | null
  quantidade_cotacao_bid_frete_internacional: number
  tipo_container_cotacao_bid_frete_internacional: string | null
  peso_kg_cotacao_bid_frete_internacional: number | null
  cubagem_m3_cotacao_bid_frete_internacional: number | null
  incoterm_cotacao_bid_frete_internacional: string
  zipcode_origem_cotacao_bid_frete_internacional?: string | null
  zipcode_destino_cotacao_bid_frete_internacional: string | null
  endereco_origem_cotacao_bid_frete_internacional?: string | null
  estado_provincia_origem_cotacao_bid_frete_internacional?: string | null
  aeroporto_origem_cotacao_bid_frete_internacional?: string | null
  estado_provincia_destino_cotacao_bid_frete_internacional?: string | null
  aeroporto_destino_cotacao_bid_frete_internacional?: string | null
  hs_code_cotacao_bid_frete_internacional?: string | null
  peso_ton_cotacao_bid_frete_internacional?: number | null
  visibilidade_cotacao_bid_frete_internacional: Visibilidade
  anonima_cotacao_bid_frete_internacional: boolean
  valor_meta_cotacao_bid_frete_internacional: number | null
  moeda_meta_cotacao_bid_frete_internacional: string | null
  data_limite_resposta_cotacao_bid_frete_internacional: string | null
  valor_aprovado_ganho_bid_frete_internacional?: number | null
  moeda_aprovada?: string | null
  ganho_valor_cotacao_bid_frete_internacional: number | null
  ganho_percentual_cotacao_bid_frete_internacional: number | null
  data_criacao_cotacao_bid_frete_internacional: string
  data_atualizacao_cotacao_bid_frete_internacional: string
  disparo_cotacao_bid_frete_internacional?: DisparoCotacaoBidFreteInternacional[]
  propostas_bid_frete_internacional?: PropostaBidFreteInternacional[]
}

export interface Fornecedor {
  id_fornecedor_bid_frete_internacional: string
  id_organizacao: string
  nome_fornecedor_bid_frete_internacional: string
  nome_fantasia_fornecedor_bid_frete_internacional: string | null
  tipo_fornecedor_bid_frete_internacional: TipoFornecedor
  status_fornecedor_bid_frete_internacional: StatusFornecedor
  cnpj_fornecedor_bid_frete_internacional: string | null
  email_fornecedor_bid_frete_internacional: string
  telefone_fornecedor_bid_frete_internacional: string | null
  whatsapp_fornecedor_bid_frete_internacional: string | null
  website_fornecedor_bid_frete_internacional: string | null
  pais_fornecedor_bid_frete_internacional: string | null
  cidade_fornecedor_bid_frete_internacional: string | null
  aceita_cotacao_aberta_fornecedor_bid_frete_internacional: boolean
  cotacao_automatica_fornecedor_bid_frete_internacional: boolean
  nota_global_classificacao_bid_frete_internacional?: number | null
  total_cotacoes?: number
  taxa_resposta?: number | null
  taxa_aprovacao?: number | null
  tempo_medio_resposta?: number | null
  data_criacao_fornecedor_bid_frete_internacional: string
  data_atualizacao_fornecedor_bid_frete_internacional: string
}

export interface DisparoCotacaoBidFreteInternacional {
  id_disparo_cotacao_bid_frete_internacional: string
  id_organizacao: string
  id_cotacao_bid_frete_internacional: string
  id_fornecedor_bid_frete_internacional: string
  fornecedor?: Fornecedor
  canal_disparo_cotacao_bid_frete_internacional: CanalDisparo
  status_disparo_cotacao_bid_frete_internacional: StatusDisparoCotacaoBidFreteInternacional
  token_resposta_disparo_cotacao_bid_frete_internacional: string | null
  data_envio_disparo_cotacao_bid_frete_internacional: string | null
  data_visualizacao_disparo_cotacao_bid_frete_internacional: string | null
  data_resposta_disparo_cotacao_bid_frete_internacional: string | null
  data_expiracao_token_disparo_cotacao_bid_frete_internacional: string | null
  data_criacao_disparo_cotacao_bid_frete_internacional: string
  data_atualizacao_disparo_cotacao_bid_frete_internacional: string
  proposta?: PropostaBidFreteInternacional
  cotacao?: Cotacao
}

export interface PropostaBidFreteInternacional {
  id_proposta_bid_frete_internacional: string
  id_organizacao: string
  id_cotacao_bid_frete_internacional: string
  id_fornecedor_bid_frete_internacional: string
  fornecedor?: Fornecedor
  id_disparo_cotacao_bid_frete_internacional: string
  moeda_proposta_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: number
  taxas_origem_proposta_bid_frete_internacional: number
  taxas_destino_proposta_bid_frete_internacional: number
  valor_total_proposta_bid_frete_internacional: number
  dias_transito_proposta_bid_frete_internacional: number
  dias_free_time_proposta_bid_frete_internacional: number | null
  quantidade_transbordo_proposta_bid_frete_internacional: number
  quantidade_escala_proposta_bid_frete_internacional: number
  validade_proposta_bid_frete_internacional: string
  observacoes_proposta_bid_frete_internacional: string | null
  status_proposta_bid_frete_internacional: string
  classificacao_valor_proposta_bid_frete_internacional?: number | null
  classificacao_transito_proposta_bid_frete_internacional?: number | null
  classificacao_avaliacao_proposta_bid_frete_internacional?: number | null
  data_criacao_proposta_bid_frete_internacional: string
  data_atualizacao_proposta_bid_frete_internacional: string
  cotacao?: Cotacao
}

/** Proposta enriquecida pelo motor de ranking (comparativo) */
export interface PropostaRankingBidFreteInternacional extends PropostaBidFreteInternacional {
  ranking_geral: number
  fornecedor_nome?: string
  fornecedor_tipo?: string
  tags?: string[]
  nota_global_classificacao_bid_frete_internacional?: number | null
}

export interface TabelaPreco {
  id: string
  id_organizacao: string
  id_fornecedor_bid_frete_internacional: string
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: ModalFrete
  modalidade_cotacao_bid_frete_internacional: ModalidadeCarga
  moeda_ganho_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: number
  taxas_origem_proposta_bid_frete_internacional: number
  taxas_destino_proposta_bid_frete_internacional: number
  dias_transito_proposta_bid_frete_internacional: number
  dias_free_time_proposta_bid_frete_internacional: number | null
  validade_inicio: string
  validade_fim: string
  ativo: boolean
  created_at: string
}

export interface Avaliacao {
  id: string
  id_organizacao: string
  id_fornecedor_bid_frete_internacional: string
  id_cotacao_bid_frete_internacional: string | null
  nota_frete_avaliacao_bid_frete_internacional: number
  nota_atendimento_avaliacao_bid_frete_internacional: number
  nota_prazo: number
  nota_confiabilidade_avaliacao_bid_frete_internacional: number
  nota_global: number
  comentario_avaliacao_bid_frete_internacional: string | null
  created_at: string
}

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────

export interface DashboardKPIs {
  cotacoes_andamento: number
  cotacoes_passadas: number
  valor_andamento_usd: number
  valor_andamento_brl: number
  valor_aprovado_usd: number
  valor_aprovado_brl: number
  aprovacao: {
    percentual_em_tempo: number
    percentual_atraso: number
    nao_respondidas: number
  }
  savings: {
    total_saving_usd: number
    media_saving_percentual: number
  }
  funil: Array<{ status: StatusCotacao; count: number }>
  fornecedores_cadastrados: number
  fornecedores_por_tipo: Array<{ tipo: TipoFornecedor; count: number }>
  moedas: Array<{
    codigo: string
    nome: string
    referencia: boolean
    valor_brl: number
    variacao: number
  }>
}

export interface CalendarioAlerta {
  tipo: string
  label: string
  count: number
  cor: 'green' | 'yellow' | 'orange' | 'red'
}

// ─── API Responses ──────────────────────────────────────────────────────────

export interface CotacoesListResponse {
  cotacoes: Cotacao[]
  pagination: {
    page: number
    total: number
    pages: number
    limit: number
  }
}

export interface FornecedoresListResponse {
  fornecedores: Fornecedor[]
  pagination: {
    page: number
    total: number
    pages: number
    limit: number
  }
}

// ─── Master Data ─────────────────────────────────────────────────────────────

export interface Porto {
  codigo: string
  nome: string
  pais: string
  tipo?: 'maritimo' | 'aereo' | 'rodoviario'
  lat?: number
  lng?: number
}

export interface Moeda {
  codigo: string
  nome: string
  simbolo: string
}

export interface Pais {
  id_pais: string
  nome_pais_portugues: string
  codigo_pais_iso_alpha2: string
}

export interface Aeroporto {
  id_aeroporto: string
  codigo_iata_aeroporto: string
  nome_aeroporto: string
  codigo_pais_aeroporto: string
}

export interface ContainerOption {
  codigo: string
  nome: string
  teus: number
}

export interface IncotermOption {
  codigo: string
  nome: string
  grupo: string
  descricao: string
}
