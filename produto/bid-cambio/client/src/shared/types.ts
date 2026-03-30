/**
 * types.ts — Tipos do dominio BID Cambio
 * Alinhado com fragment.prisma — enums e campos.
 * Source of truth: produto/bid-cambio/server/prisma/fragment.prisma
 */

// --- Enums (espelham fragment.prisma) ---

export type TipoOperacaoCambio = 'IMPORTACAO' | 'EXPORTACAO'

export type ModalidadeCambio = 'PRONTO' | 'FUTURO'

export type LiquidacaoCambio = 'D0' | 'D1' | 'D2'

export type MoedaCambio = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'BRL' | 'CNY' | 'JPY'

export type StatusParcela = 'PENDENTE' | 'AGENDADO' | 'PAGO'

export type StatusCotacaoCambio =
  | 'RASCUNHO'
  | 'ENVIADA_CORRETORAS'
  | 'EM_COTACAO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADA'
  | 'REPROVADA'
  | 'CANCELADA'
  | 'EXPIRADA'

export type CanalDisparoCambio = 'EMAIL' | 'PORTAL'

export type StatusBidRequestCambio =
  | 'PENDENTE'
  | 'ENVIADO'
  | 'VISUALIZADO'
  | 'RESPONDIDO'
  | 'EXPIRADO'
  | 'ERRO_ENVIO'

export type StatusBidResponseCambio =
  | 'RECEBIDA'
  | 'EM_ANALISE'
  | 'MELHOR_TAXA'
  | 'MELHOR_SPREAD'
  | 'MELHOR_AVALIACAO'
  | 'APROVADA'
  | 'REPROVADA'

export type TipoCorretora = 'CORRETORA_CAMBIO' | 'BANCO_COMERCIAL' | 'BANCO_CAMBIO' | 'FINTECH'

export type StatusCorretora = 'ATIVA' | 'INATIVA' | 'BLOQUEADA'

export type MetodoVencimento =
  | 'DATA_EMBARQUE'
  | 'DATA_CHEGADA'
  | 'DATA_REGISTRO_DI'
  | 'DATA_DESEMBARACO'
  | 'DATA_ENTREGA'
  | 'PRONTIDAO_CARGA'
  | 'DATA_FIXA'

// --- Labels para UI ---

export const OPERACAO_CAMBIO_LABELS: Record<TipoOperacaoCambio, string> = {
  IMPORTACAO: 'Importacao',
  EXPORTACAO: 'Exportacao',
}

export const MODALIDADE_CAMBIO_LABELS: Record<ModalidadeCambio, string> = {
  PRONTO: 'Pronto',
  FUTURO: 'Futuro',
}

export const LIQUIDACAO_LABELS: Record<LiquidacaoCambio, string> = {
  D0: 'D+0',
  D1: 'D+1',
  D2: 'D+2',
}

export const MOEDA_CAMBIO_LABELS: Record<MoedaCambio, string> = {
  USD: 'Dolar Americano',
  EUR: 'Euro',
  GBP: 'Libra Esterlina',
  CHF: 'Franco Suico',
  BRL: 'Real Brasileiro',
  CNY: 'Yuan Chines',
  JPY: 'Iene Japones',
}

export const MOEDA_SIMBOLO: Record<MoedaCambio, string> = {
  USD: 'US$',
  EUR: '€',
  GBP: '£',
  CHF: 'CHF',
  BRL: 'R$',
  CNY: '¥',
  JPY: '¥',
}

export const STATUS_PARCELA_LABELS: Record<StatusParcela, string> = {
  PENDENTE: 'Pendente',
  AGENDADO: 'Agendado',
  PAGO: 'Pago',
}

export const STATUS_COTACAO_LABELS: Record<StatusCotacaoCambio, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADA_CORRETORAS: 'Enviada as corretoras',
  EM_COTACAO: 'Em cotacao',
  AGUARDANDO_APROVACAO: 'Aprovacao pendente',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
}

export const CANAL_CAMBIO_LABELS: Record<CanalDisparoCambio, string> = {
  EMAIL: 'Email',
  PORTAL: 'Portal',
}

export const STATUS_BID_REQUEST_LABELS: Record<StatusBidRequestCambio, string> = {
  PENDENTE: 'Pendente',
  ENVIADO: 'Enviado',
  VISUALIZADO: 'Visualizado',
  RESPONDIDO: 'Respondido',
  EXPIRADO: 'Expirado',
  ERRO_ENVIO: 'Erro de envio',
}

export const STATUS_BID_RESPONSE_LABELS: Record<StatusBidResponseCambio, string> = {
  RECEBIDA: 'Recebida',
  EM_ANALISE: 'Em analise',
  MELHOR_TAXA: 'Melhor taxa',
  MELHOR_SPREAD: 'Melhor spread',
  MELHOR_AVALIACAO: 'Melhor avaliacao',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
}

export const TIPO_CORRETORA_LABELS: Record<TipoCorretora, string> = {
  CORRETORA_CAMBIO: 'Corretora de Cambio',
  BANCO_COMERCIAL: 'Banco Comercial',
  BANCO_CAMBIO: 'Banco de Cambio',
  FINTECH: 'Fintech',
}

export const STATUS_CORRETORA_LABELS: Record<StatusCorretora, string> = {
  ATIVA: 'Ativa',
  INATIVA: 'Inativa',
  BLOQUEADA: 'Bloqueada',
}

export const METODO_VENCIMENTO_LABELS: Record<MetodoVencimento, string> = {
  DATA_EMBARQUE: 'Data de Embarque',
  DATA_CHEGADA: 'Data de Chegada',
  DATA_REGISTRO_DI: 'Registro da DI',
  DATA_DESEMBARACO: 'Desembaraco',
  DATA_ENTREGA: 'Data de Entrega',
  PRONTIDAO_CARGA: 'Prontidao da Carga',
  DATA_FIXA: 'Data Fixa',
}

// --- Badge Colors ---

export const STATUS_PARCELA_BADGE: Record<StatusParcela, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  PENDENTE: 'warning',
  AGENDADO: 'info',
  PAGO: 'success',
}

export const STATUS_COTACAO_BADGE: Record<StatusCotacaoCambio, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  RASCUNHO: 'default',
  ENVIADA_CORRETORAS: 'info',
  EM_COTACAO: 'info',
  AGUARDANDO_APROVACAO: 'warning',
  APROVADA: 'success',
  REPROVADA: 'danger',
  CANCELADA: 'default',
  EXPIRADA: 'default',
}

export const STATUS_CORRETORA_BADGE: Record<StatusCorretora, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  ATIVA: 'success',
  INATIVA: 'default',
  BLOQUEADA: 'danger',
}

export const STATUS_BID_RESPONSE_BADGE: Record<StatusBidResponseCambio, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  RECEBIDA: 'info',
  EM_ANALISE: 'warning',
  MELHOR_TAXA: 'success',
  MELHOR_SPREAD: 'success',
  MELHOR_AVALIACAO: 'success',
  APROVADA: 'success',
  REPROVADA: 'danger',
}

// --- Entidades (alinhadas com fragment.prisma) ---

export interface ParcelaCambio {
  id: string
  tenant_id: string
  product_id: string
  user_id: string
  referencia_processo: string | null
  numero_pedido: string | null
  exportador: string | null
  numero_di: string | null
  numero_invoice: string | null
  numero_bl: string | null
  numero_contrato_cambio: string | null
  numero_transmissao_di: string | null
  referencia_cliente: string | null
  moeda: MoedaCambio
  cambio_total: number
  porcentagem_parcela: number
  valor_a_pagar: number
  valor_a_pagar_brl: number
  valor_pago: number | null
  valor_pago_brl: number | null
  numero_parcela: number
  total_parcelas: number
  status: StatusParcela
  data_vencimento: string | null
  data_agendamento: string | null
  data_pagamento: string | null
  data_vencimento_original: string | null
  metodo_vencimento: MetodoVencimento | null
  prazo_dias: number | null
  taxa_fechamento: number | null
  banco_corretora: string | null
  condicao_pagamento: string | null
  cotacao_cambio_id: string | null
  bid_response_id: string | null
  anexos?: AnexoCambio[]
  created_at: string
  updated_at: string
}

export interface AnexoCambio {
  id: string
  tenant_id: string
  parcela_id: string
  nome_arquivo: string | null
  nome_original: string
  url: string
  categoria: string
  tamanho_bytes: number | null
  created_at: string
}

export interface CotacaoCambio {
  id: string
  tenant_id: string
  product_id: string
  user_id: string
  moeda: MoedaCambio
  valor: number
  tipo_operacao: TipoOperacaoCambio
  modalidade: ModalidadeCambio
  liquidacao: LiquidacaoCambio
  referencia_processo: string | null
  numero_pedido: string | null
  exportador: string | null
  status: StatusCotacaoCambio
  ptax_referencia: number | null
  ptax_data: string | null
  data_expiracao: string | null
  economia_brl: number | null
  economia_percentual: number | null
  bid_requests?: BidRequestCambio[]
  bid_responses?: BidResponseCambio[]
  created_at: string
  updated_at: string
}

export interface BidRequestCambio {
  id: string
  tenant_id: string
  cotacao_id: string
  corretora_id: string
  corretora?: Corretora
  canal: CanalDisparoCambio
  status: StatusBidRequestCambio
  token_publico: string | null
  token_expiracao: string | null
  enviado_em: string | null
  visualizado_em: string | null
  respondido_em: string | null
  response?: BidResponseCambio
  created_at: string
  updated_at: string
}

export interface BidResponseCambio {
  id: string
  tenant_id: string
  cotacao_id: string
  corretora_id: string
  corretora?: Corretora
  bid_request_id: string
  taxa_oferecida: number
  spread: number
  valor_total_brl: number
  iof_percentual: number
  iof_valor: number
  liquidacao_proposta: LiquidacaoCambio
  validade_minutos: number
  validade_ate: string
  condicoes: string | null
  status: StatusBidResponseCambio
  created_at: string
  updated_at: string
}

export interface Corretora {
  id: string
  tenant_id: string
  product_id: string
  user_id: string
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  tipo: TipoCorretora
  status: StatusCorretora
  email: string
  telefone: string | null
  contato_nome: string | null
  contato_cargo: string | null
  portal_habilitado: boolean
  moedas_operadas: string | null
  bid_requests?: BidRequestCambio[]
  bid_responses?: BidResponseCambio[]
  avaliacoes?: AvaliacaoCorretora[]
  created_at: string
  updated_at: string
}

export interface AvaliacaoCorretora {
  id: string
  tenant_id: string
  user_id: string
  corretora_id: string
  cotacao_id: string | null
  nota_taxa: number
  nota_agilidade: number
  nota_atendimento: number
  nota_confiabilidade: number
  comentario: string | null
  created_at: string
}

export interface RatingCorretora {
  id: string
  corretora_email: string
  taxa_resposta: number
  taxa_aprovacao: number
  tempo_medio_resposta: number
  total_cotacoes: number
  total_aprovacoes: number
  nota_media_taxa: number
  nota_media_agilidade: number
  nota_media_atendimento: number
  nota_media_confiabilidade: number
  total_avaliacoes: number
  score_global: number
  updated_at: string
}

export interface SavingCambio {
  id: string
  tenant_id: string
  cotacao_id: string
  corretora_id: string
  valor_operacao: number
  moeda: MoedaCambio
  taxa_aprovada: number
  taxa_media_respostas: number
  ptax_referencia: number
  economia_brl: number
  economia_percentual: number
  created_at: string
}

export interface PreferenciaCambio {
  id: string
  tenant_id: string
  product_id: string
  mostrar_no_financeiro: boolean
  alerta_email_vencimento: boolean
  dias_antecedencia_alerta: number | null
  enviar_email_exportador: boolean
  enviar_email_fim_de_semana: boolean
  updated_at: string
}

export interface PreferenciaGridCambio {
  id: string
  tenant_id: string
  user_id: string
  colunas_visiveis: string
  ordem_colunas: string
  filtros_salvos: string | null
  ordenacao: string | null
  updated_at: string
}

// --- Pagination ---

export interface Pagination {
  page: number
  total: number
  pages: number
  limit: number
}

// --- API Responses ---

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface DashboardKPIs {
  totais_por_moeda: Array<{
    moeda: MoedaCambio
    _sum: { valor_a_pagar: number; valor_a_pagar_brl: number }
    _count: number
  }>
  cotacoes_ativas: number
  cotacoes_aprovadas: number
  economia_total_brl: number
  economia_media_percentual: number
  corretoras_ativas: number
  parcelas_vencendo: Array<ParcelaCambio>
}
