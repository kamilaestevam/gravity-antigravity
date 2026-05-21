/**
 * types.ts — Tipos do dominio BID Cambio
 * Alinhado com fragment.prisma — enums e campos.
 * Source of truth: produto/bid-cambio/server/prisma/fragment.prisma
 * Nomenclatura DDD aplicada.
 */

// --- Enums (espelham fragment.prisma) ---

export type BidCambioTipoOperacao = 'IMPORTACAO' | 'EXPORTACAO'

export type BidCambioModalidade = 'PRONTO' | 'FUTURO'

export type BidCambioLiquidacao = 'D0' | 'D1' | 'D2'

export type BidCambioMoeda = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'BRL' | 'CNY' | 'JPY'

export type BidCambioStatusParcela = 'PENDENTE' | 'AGENDADO' | 'PAGO'

export type BidCambioStatusCotacao =
  | 'RASCUNHO'
  | 'ENVIADA_CORRETORAS'
  | 'EM_COTACAO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADA'
  | 'REPROVADA'
  | 'CANCELADA'
  | 'EXPIRADA'

export type BidCambioCanalDisparo = 'EMAIL' | 'PORTAL'

export type BidCambioStatusDisparoCotacao =
  | 'PENDENTE'
  | 'ENVIADO'
  | 'VISUALIZADO'
  | 'RESPONDIDO'
  | 'EXPIRADO'
  | 'ERRO_ENVIO'

export type BidCambioStatusRespostaCotacao =
  | 'RECEBIDA'
  | 'EM_ANALISE'
  | 'MELHOR_TAXA'
  | 'MELHOR_SPREAD'
  | 'MELHOR_AVALIACAO'
  | 'APROVADA'
  | 'REPROVADA'

export type BidCambioTipoCorretora = 'CORRETORA_CAMBIO' | 'BANCO_COMERCIAL' | 'BANCO_CAMBIO' | 'FINTECH'

export type BidCambioStatusCorretora = 'ATIVA' | 'INATIVA' | 'BLOQUEADA'

export type BidCambioBaseVencimento =
  | 'DATA_EMBARQUE'
  | 'DATA_CHEGADA'
  | 'DATA_REGISTRO_DI'
  | 'DATA_DESEMBARACO'
  | 'DATA_ENTREGA'
  | 'PRONTIDAO_CARGA'
  | 'DATA_FIXA'

// --- Labels para UI ---

export const OPERACAO_CAMBIO_LABELS: Record<BidCambioTipoOperacao, string> = {
  IMPORTACAO: 'Importacao',
  EXPORTACAO: 'Exportacao',
}

export const MODALIDADE_CAMBIO_LABELS: Record<BidCambioModalidade, string> = {
  PRONTO: 'Pronto',
  FUTURO: 'Futuro',
}

export const LIQUIDACAO_LABELS: Record<BidCambioLiquidacao, string> = {
  D0: 'D+0',
  D1: 'D+1',
  D2: 'D+2',
}

export const MOEDA_CAMBIO_LABELS: Record<BidCambioMoeda, string> = {
  USD: 'Dolar Americano',
  EUR: 'Euro',
  GBP: 'Libra Esterlina',
  CHF: 'Franco Suico',
  BRL: 'Real Brasileiro',
  CNY: 'Yuan Chines',
  JPY: 'Iene Japones',
}

export const MOEDA_SIMBOLO: Record<BidCambioMoeda, string> = {
  USD: 'US$',
  EUR: '€',
  GBP: '£',
  CHF: 'CHF',
  BRL: 'R$',
  CNY: '¥',
  JPY: '¥',
}

export const STATUS_PARCELA_LABELS: Record<BidCambioStatusParcela, string> = {
  PENDENTE: 'Pendente',
  AGENDADO: 'Agendado',
  PAGO: 'Pago',
}

export const STATUS_COTACAO_LABELS: Record<BidCambioStatusCotacao, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADA_CORRETORAS: 'Enviada as corretoras',
  EM_COTACAO: 'Em cotacao',
  AGUARDANDO_APROVACAO: 'Aprovacao pendente',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
}

export const CANAL_CAMBIO_LABELS: Record<BidCambioCanalDisparo, string> = {
  EMAIL: 'Email',
  PORTAL: 'Portal',
}

export const STATUS_BID_REQUEST_LABELS: Record<BidCambioStatusDisparoCotacao, string> = {
  PENDENTE: 'Pendente',
  ENVIADO: 'Enviado',
  VISUALIZADO: 'Visualizado',
  RESPONDIDO: 'Respondido',
  EXPIRADO: 'Expirado',
  ERRO_ENVIO: 'Erro de envio',
}

export const STATUS_BID_RESPONSE_LABELS: Record<BidCambioStatusRespostaCotacao, string> = {
  RECEBIDA: 'Recebida',
  EM_ANALISE: 'Em analise',
  MELHOR_TAXA: 'Melhor taxa',
  MELHOR_SPREAD: 'Melhor spread',
  MELHOR_AVALIACAO: 'Melhor avaliacao',
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
}

export const TIPO_CORRETORA_LABELS: Record<BidCambioTipoCorretora, string> = {
  CORRETORA_CAMBIO: 'Corretora de Cambio',
  BANCO_COMERCIAL: 'Banco Comercial',
  BANCO_CAMBIO: 'Banco de Cambio',
  FINTECH: 'Fintech',
}

export const STATUS_CORRETORA_LABELS: Record<BidCambioStatusCorretora, string> = {
  ATIVA: 'Ativa',
  INATIVA: 'Inativa',
  BLOQUEADA: 'Bloqueada',
}

export const METODO_VENCIMENTO_LABELS: Record<BidCambioBaseVencimento, string> = {
  DATA_EMBARQUE: 'Data de Embarque',
  DATA_CHEGADA: 'Data de Chegada',
  DATA_REGISTRO_DI: 'Registro da DI',
  DATA_DESEMBARACO: 'Desembaraco',
  DATA_ENTREGA: 'Data de Entrega',
  PRONTIDAO_CARGA: 'Prontidao da Carga',
  DATA_FIXA: 'Data Fixa',
}

// --- Badge Colors ---

export const STATUS_PARCELA_BADGE: Record<BidCambioStatusParcela, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  PENDENTE: 'warning',
  AGENDADO: 'info',
  PAGO: 'success',
}

export const STATUS_COTACAO_BADGE: Record<BidCambioStatusCotacao, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  RASCUNHO: 'default',
  ENVIADA_CORRETORAS: 'info',
  EM_COTACAO: 'info',
  AGUARDANDO_APROVACAO: 'warning',
  APROVADA: 'success',
  REPROVADA: 'danger',
  CANCELADA: 'default',
  EXPIRADA: 'default',
}

export const STATUS_CORRETORA_BADGE: Record<BidCambioStatusCorretora, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  ATIVA: 'success',
  INATIVA: 'default',
  BLOQUEADA: 'danger',
}

export const STATUS_BID_RESPONSE_BADGE: Record<BidCambioStatusRespostaCotacao, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  RECEBIDA: 'info',
  EM_ANALISE: 'warning',
  MELHOR_TAXA: 'success',
  MELHOR_SPREAD: 'success',
  MELHOR_AVALIACAO: 'success',
  APROVADA: 'success',
  REPROVADA: 'danger',
}

// --- Entidades (alinhadas com fragment.prisma) ---

export interface BidCambioParcela {
  id_parcela_bid_cambio: string
  id_organizacao: string
  id_produto_gravity: string
  id_usuario: string
  referencia_processo_parcela_bid_cambio: string | null
  numero_pedido_parcela_bid_cambio: string | null
  exportador_parcela_bid_cambio: string | null
  numero_di_parcela_bid_cambio: string | null
  numero_invoice_parcela_bid_cambio: string | null
  numero_bl_parcela_bid_cambio: string | null
  numero_contrato_cambio_parcela_bid_cambio: string | null
  numero_transmissao_di_parcela_bid_cambio: string | null
  referencia_cliente_parcela_bid_cambio: string | null
  numero_duimp_parcela_bid_cambio: string | null
  numero_due_parcela_bid_cambio: string | null
  moeda_parcela_bid_cambio: BidCambioMoeda
  cambio_total_parcela_bid_cambio: number
  porcentagem_parcela_bid_cambio: number
  valor_a_pagar_parcela_bid_cambio: number
  valor_a_pagar_brl_parcela_bid_cambio: number
  valor_pago_parcela_bid_cambio: number | null
  valor_pago_brl_parcela_bid_cambio: number | null
  numero_parcela_bid_cambio: number
  total_parcelas_parcela_bid_cambio: number
  status_parcela_bid_cambio: BidCambioStatusParcela
  data_vencimento_parcela_bid_cambio: string | null
  data_agendamento_parcela_bid_cambio: string | null
  data_pagamento_parcela_bid_cambio: string | null
  data_vencimento_original_parcela_bid_cambio: string | null
  metodo_vencimento_parcela_bid_cambio: BidCambioBaseVencimento | null
  prazo_dias_parcela_bid_cambio: number | null
  taxa_fechamento_parcela_bid_cambio: number | null
  banco_corretora_parcela_bid_cambio: string | null
  condicao_pagamento_parcela_bid_cambio: string | null
  id_cotacao_bid_cambio: string | null
  id_resposta_cotacao_bid_cambio: string | null
  anexos?: BidCambioAnexo[]
  data_criacao_parcela_bid_cambio: string
  data_atualizacao_parcela_bid_cambio: string
}

export interface BidCambioAnexo {
  id_anexo_bid_cambio: string
  id_organizacao: string
  id_parcela_bid_cambio: string
  nome_arquivo_anexo_bid_cambio: string | null
  nome_original_anexo_bid_cambio: string
  url_anexo_bid_cambio: string
  categoria_anexo_bid_cambio: string
  tamanho_bytes_anexo_bid_cambio: number | null
  data_criacao_anexo_bid_cambio: string
}

export interface BidCambioCotacao {
  id_cotacao_bid_cambio: string
  id_organizacao: string
  id_produto_gravity: string
  id_usuario: string
  moeda_cotacao_bid_cambio: BidCambioMoeda
  valor_cotacao_bid_cambio: number
  tipo_operacao_cotacao_bid_cambio: BidCambioTipoOperacao
  modalidade_cotacao_bid_cambio: BidCambioModalidade
  liquidacao_cotacao_bid_cambio: BidCambioLiquidacao
  referencia_processo_cotacao_bid_cambio: string | null
  numero_pedido_cotacao_bid_cambio: string | null
  exportador_cotacao_bid_cambio: string | null
  status_cotacao_bid_cambio: BidCambioStatusCotacao
  ptax_referencia_cotacao_bid_cambio: number | null
  ptax_data_cotacao_bid_cambio: string | null
  data_expiracao_cotacao_bid_cambio: string | null
  economia_brl_cotacao_bid_cambio: number | null
  economia_percentual_cotacao_bid_cambio: number | null
  bid_requests?: BidCambioDisparoCotacao[]
  bid_responses?: BidCambioRespostaCotacao[]
  data_criacao_cotacao_bid_cambio: string
  data_atualizacao_cotacao_bid_cambio: string
}

export interface BidCambioDisparoCotacao {
  id_disparo_cotacao_bid_cambio: string
  id_organizacao: string
  id_cotacao_bid_cambio: string
  id_corretora_bid_cambio: string
  corretora?: BidCambioCorretora
  canal_disparo_cotacao_bid_cambio: BidCambioCanalDisparo
  status_disparo_cotacao_bid_cambio: BidCambioStatusDisparoCotacao
  token_publico_disparo_cotacao_bid_cambio: string | null
  token_expiracao_disparo_cotacao_bid_cambio: string | null
  enviado_em_disparo_cotacao_bid_cambio: string | null
  visualizado_em_disparo_cotacao_bid_cambio: string | null
  respondido_em_disparo_cotacao_bid_cambio: string | null
  response?: BidCambioRespostaCotacao
  data_criacao_disparo_cotacao_bid_cambio: string
  data_atualizacao_disparo_cotacao_bid_cambio: string
}

export interface BidCambioRespostaCotacao {
  id_resposta_cotacao_bid_cambio: string
  id_organizacao: string
  id_cotacao_bid_cambio: string
  id_corretora_bid_cambio: string
  corretora?: BidCambioCorretora
  id_disparo_cotacao_bid_cambio: string
  taxa_oferecida_resposta_cotacao_bid_cambio: number
  spread_resposta_cotacao_bid_cambio: number
  valor_total_brl_resposta_cotacao_bid_cambio: number
  iof_percentual_resposta_cotacao_bid_cambio: number
  iof_valor_resposta_cotacao_bid_cambio: number
  liquidacao_proposta_resposta_cotacao_bid_cambio: BidCambioLiquidacao
  validade_minutos_resposta_cotacao_bid_cambio: number
  validade_ate_resposta_cotacao_bid_cambio: string
  condicoes_resposta_cotacao_bid_cambio: string | null
  status_resposta_cotacao_bid_cambio: BidCambioStatusRespostaCotacao
  data_criacao_resposta_cotacao_bid_cambio: string
  data_atualizacao_resposta_cotacao_bid_cambio: string
}

export interface BidCambioCorretora {
  id_corretora_bid_cambio: string
  id_organizacao: string
  id_produto_gravity: string
  id_usuario: string
  razao_social_corretora_bid_cambio: string
  nome_fantasia_corretora_bid_cambio: string | null
  cnpj_corretora_bid_cambio: string | null
  tipo_corretora_bid_cambio: BidCambioTipoCorretora
  status_corretora_bid_cambio: BidCambioStatusCorretora
  email_corretora_bid_cambio: string
  telefone_corretora_bid_cambio: string | null
  contato_nome_corretora_bid_cambio: string | null
  contato_cargo_corretora_bid_cambio: string | null
  portal_habilitado_corretora_bid_cambio: boolean
  moedas_operadas_corretora_bid_cambio: string | null
  bid_requests?: BidCambioDisparoCotacao[]
  bid_responses?: BidCambioRespostaCotacao[]
  avaliacoes?: BidCambioAvaliacaoCorretora[]
  data_criacao_corretora_bid_cambio: string
  data_atualizacao_corretora_bid_cambio: string
}

export interface BidCambioAvaliacaoCorretora {
  id_avaliacao_corretora_bid_cambio: string
  id_organizacao: string
  id_usuario: string
  id_corretora_bid_cambio: string
  id_cotacao_bid_cambio: string | null
  nota_taxa_avaliacao_corretora_bid_cambio: number
  nota_agilidade_avaliacao_corretora_bid_cambio: number
  nota_atendimento_avaliacao_corretora_bid_cambio: number
  nota_confiabilidade_avaliacao_corretora_bid_cambio: number
  comentario_avaliacao_corretora_bid_cambio: string | null
  data_criacao_avaliacao_corretora_bid_cambio: string
}

export interface BidCambioClassificacaoCorretora {
  id_classificacao_corretora_bid_cambio: string
  email_corretora_classificacao_bid_cambio: string
  taxa_resposta_classificacao_bid_cambio: number
  taxa_aprovacao_classificacao_bid_cambio: number
  tempo_medio_resposta_classificacao_bid_cambio: number
  total_cotacoes_classificacao_bid_cambio: number
  total_aprovacoes_classificacao_bid_cambio: number
  nota_media_taxa_classificacao_bid_cambio: number
  nota_media_agilidade_classificacao_bid_cambio: number
  nota_media_atendimento_classificacao_bid_cambio: number
  nota_media_confiabilidade_classificacao_bid_cambio: number
  total_avaliacoes_classificacao_bid_cambio: number
  score_global_classificacao_bid_cambio: number
  data_atualizacao_classificacao_bid_cambio: string
}

export interface BidCambioGanho {
  id_ganho_bid_cambio: string
  id_organizacao: string
  id_cotacao_bid_cambio: string
  id_corretora_bid_cambio: string
  valor_operacao_ganho_bid_cambio: number
  moeda_ganho_bid_cambio: BidCambioMoeda
  taxa_aprovada_ganho_bid_cambio: number
  taxa_media_respostas_ganho_bid_cambio: number
  ptax_referencia_ganho_bid_cambio: number
  economia_brl_ganho_bid_cambio: number
  economia_percentual_ganho_bid_cambio: number
  data_criacao_ganho_bid_cambio: string
}

export interface BidCambioPreferenciaUsuario {
  id_preferencia_usuario_bid_cambio: string
  id_organizacao: string
  id_produto_gravity: string
  mostrar_no_financeiro_preferencia_bid_cambio: boolean
  alerta_email_vencimento_preferencia_bid_cambio: boolean
  dias_antecedencia_alerta_preferencia_bid_cambio: number | null
  enviar_email_exportador_preferencia_bid_cambio: boolean
  enviar_email_fim_de_semana_preferencia_bid_cambio: boolean
  data_atualizacao_preferencia_bid_cambio: string
}

export interface BidCambioPreferenciaGrid {
  id_preferencia_grid_bid_cambio: string
  id_organizacao: string
  id_usuario: string
  colunas_visiveis_preferencia_grid_bid_cambio: string
  ordem_colunas_preferencia_grid_bid_cambio: string
  filtros_salvos_preferencia_grid_bid_cambio: string | null
  ordenacao_preferencia_grid_bid_cambio: string | null
  data_atualizacao_preferencia_grid_bid_cambio: string
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
    moeda: BidCambioMoeda
    _sum: { valor_a_pagar_parcela_bid_cambio: number; valor_a_pagar_brl_parcela_bid_cambio: number }
    _count: number
  }>
  cotacoes_ativas: number
  cotacoes_aprovadas: number
  economia_total_brl: number
  economia_media_percentual: number
  corretoras_ativas: number
  parcelas_vencendo: Array<BidCambioParcela>
}
