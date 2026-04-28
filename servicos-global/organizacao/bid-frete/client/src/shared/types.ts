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

export type StatusBidRequest = 'PENDENTE' | 'ENVIADO' | 'VISUALIZADO' | 'RESPONDIDO' | 'EXPIRADO' | 'ERRO_ENVIO'

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

export const STATUS_BID_LABELS: Record<StatusBidRequest, string> = {
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
  id: string
  id_organizacao: string
  user_id: string | null
  numero: string
  referencia_interna: string | null
  tipo_operacao: TipoOperacao
  modal: ModalFrete
  modalidade: ModalidadeCarga
  status: StatusCotacao
  origem_codigo: string
  origem_nome: string
  origem_pais: string
  destino_codigo: string
  destino_nome: string
  destino_pais: string
  descricao_mercadoria: string
  ncm: string | null
  quantidade: number
  tipo_container: string | null
  peso_kg: number | null
  cubagem_m3: number | null
  incoterm: string
  cep_destino: string | null
  visibilidade: Visibilidade
  anonima: boolean
  valor_alvo: number | null
  moeda_alvo: string
  prazo_resposta: string | null
  valor_aprovado: number | null
  moeda_aprovada: string | null
  saving_valor: number | null
  saving_percentual: number | null
  created_at: string
  updated_at: string
  bid_requests?: BidRequest[]
  bid_responses?: BidResponse[]
}

export interface Fornecedor {
  id: string
  id_organizacao: string
  nome: string
  nome_fantasia: string | null
  tipo: TipoFornecedor
  status: StatusFornecedor
  cnpj: string | null
  email: string
  telefone: string | null
  whatsapp: string | null
  website: string | null
  pais: string | null
  cidade: string | null
  aceita_cotacao_aberta: boolean
  resposta_automatica: boolean
  rating_global: number | null
  total_cotacoes: number
  taxa_resposta: number | null
  taxa_aprovacao: number | null
  tempo_medio_resposta: number | null
  created_at: string
  updated_at: string
}

export interface BidRequest {
  id: string
  id_organizacao: string
  cotacao_id: string
  fornecedor_id: string
  fornecedor?: Fornecedor
  canal: CanalDisparo
  status: StatusBidRequest
  token_publico: string | null
  enviado_em: string | null
  visualizado_em: string | null
  respondido_em: string | null
  expirado_em: string | null
  created_at: string
  response?: BidResponse
}

export interface BidResponse {
  id: string
  id_organizacao: string
  cotacao_id: string
  fornecedor_id: string
  fornecedor?: Fornecedor
  bid_request_id: string
  moeda: string
  valor_frete: number
  taxas_origem: number
  taxas_destino: number
  valor_total: number
  transit_time_dias: number
  free_time_dias: number | null
  transbordos: number
  escalas: string | null
  validade: string
  observacoes: string | null
  score_total: number | null
  score_preco: number | null
  score_transit: number | null
  score_rating: number | null
  aprovada: boolean
  aprovada_em: string | null
  aprovada_por: string | null
  created_at: string
}

export interface TabelaPreco {
  id: string
  id_organizacao: string
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
  transit_time_dias: number
  free_time_dias: number | null
  validade_inicio: string
  validade_fim: string
  ativo: boolean
  created_at: string
}

export interface Avaliacao {
  id: string
  id_organizacao: string
  fornecedor_id: string
  cotacao_id: string | null
  nota_frete: number
  nota_atendimento: number
  nota_prazo: number
  nota_confiabilidade: number
  nota_global: number
  comentario: string | null
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
  tipo: 'maritimo' | 'aereo' | 'rodoviario'
  lat?: number
  lng?: number
}

export interface Moeda {
  codigo: string
  nome: string
  simbolo: string
}
