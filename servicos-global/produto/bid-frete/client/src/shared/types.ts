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
  id_cotacao_bid_frete: string
  id_organizacao: string
  id_produto_gravity: string | null
  id_usuario: string | null
  id_workspace: string | null
  numero_cotacao_bid_frete: string
  referencia_interna_cotacao_bid_frete: string | null
  tipo_operacao: TipoOperacao
  modal: ModalFrete
  modalidade: ModalidadeCarga
  status_cotacao_bid_frete: StatusCotacao
  porto_origem_cotacao_bid_frete: string
  pais_origem_cotacao_bid_frete: string
  estado_provincia_origem_cotacao_bid_frete?: string
  aeroporto_origem_cotacao_bid_frete?: string
  porto_destino_cotacao_bid_frete: string
  pais_destino_cotacao_bid_frete: string
  estado_provincia_destino_cotacao_bid_frete?: string
  aeroporto_destino_cotacao_bid_frete?: string
  descricao_mercadoria_cotacao_bid_frete: string
  ncm_cotacao_bid_frete: string | null
  hs_code_cotacao_bid_frete?: string
  quantidade_volumes_cotacao_bid_frete: number
  tipo_container: string | null
  peso_kg_cotacao_bid_frete: number | null
  peso_ton_cotacao_bid_frete?: number
  cubagem_m3_cotacao_bid_frete: number | null
  incoterm_cotacao_bid_frete: string
  cep_origem_cotacao_bid_frete: string | null
  cep_destino_cotacao_bid_frete: string | null
  visibilidade_cotacao_bid_frete: Visibilidade
  anonima_cotacao_bid_frete: boolean
  valor_alvo_cotacao_bid_frete: number | null
  moeda_alvo_cotacao_bid_frete: string
  data_limite_resposta_cotacao_bid_frete: string | null
  data_aprovacao_cotacao_bid_frete: string | null
  data_cancelamento_cotacao_bid_frete: string | null
  motivo_reprovacao_cotacao_bid_frete: string | null
  motivo_cancelamento_cotacao_bid_frete: string | null
  id_fornecedor_vencedor_cotacao_bid_frete: string | null
  valor_aprovado: number | null
  moeda_aprovada: string | null
  saving_valor_cotacao_bid_frete: number | null
  saving_percentual_cotacao_bid_frete: number | null
  criado_em_cotacao_bid_frete: string
  atualizado_em_cotacao_bid_frete: string
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

// ─── Status Config (Configuração dinâmica por organização) ──────────────────

export interface StatusCotacaoBidFreteConfig {
  id_status_cotacao_bid_frete: string
  id_organizacao: string
  nome_status_cotacao_bid_frete: string
  rotulo_status_cotacao_bid_frete: string
  cor_status_cotacao_bid_frete: string
  icone_status_cotacao_bid_frete: string | null
  ordem_status_cotacao_bid_frete: number
  padrao_status_cotacao_bid_frete: boolean
  gerenciado_sistema_status_cotacao_bid_frete: boolean
  data_criacao_status_cotacao_bid_frete: string
  data_atualizacao_status_cotacao_bid_frete: string
}

/** Chave do localStorage para sincronização status config */
export const STATUS_CONFIG_STORAGE_KEY = 'bid-frete:config:status-dinamico'

/** Sincroniza status da API com localStorage para consumo offline */
export function sincronizarStatusLocal(statusList: StatusCotacaoBidFreteConfig[]): void {
  try {
    localStorage.setItem(STATUS_CONFIG_STORAGE_KEY, JSON.stringify(statusList))
    // Também atualiza a chave legada para compatibilidade com Configuracoes.tsx
    const legado = statusList.map(s => ({
      id: s.id_status_cotacao_bid_frete,
      nome: s.nome_status_cotacao_bid_frete,
      rotulo: s.rotulo_status_cotacao_bid_frete,
      cor: s.cor_status_cotacao_bid_frete,
      ordem: s.ordem_status_cotacao_bid_frete,
      is_sistema: s.gerenciado_sistema_status_cotacao_bid_frete,
    }))
    localStorage.setItem('bid-frete:config:status', JSON.stringify(legado))
  } catch { /* storage indisponível */ }
}

/** Lê status config do localStorage */
export function lerStatusConfigLocal(): StatusCotacaoBidFreteConfig[] {
  try {
    const raw = localStorage.getItem(STATUS_CONFIG_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* storage indisponível */ }
  return []
}

/** Gera abas dinâmicas a partir dos status config */
export function gerarAbasStatus(statusList: StatusCotacaoBidFreteConfig[], t: (key: string, fallback?: string) => string): Array<{ valor: string; label: string }> {
  const abas: Array<{ valor: string; label: string }> = [
    { valor: 'TODAS', label: t('bidfrete.cotacoes.abas.todas', 'Todas') },
  ]
  for (const s of statusList) {
    abas.push({
      valor: s.nome_status_cotacao_bid_frete,
      label: s.rotulo_status_cotacao_bid_frete,
    })
  }
  return abas
}

/** Obtém rótulo e cor de um status a partir da config. Fallback para hardcoded. */
export function obterInfoStatus(statusNome: string, statusList: StatusCotacaoBidFreteConfig[]): { rotulo: string; cor: string } {
  const config = statusList.find(s => s.nome_status_cotacao_bid_frete === statusNome)
  if (config) {
    return {
      rotulo: config.rotulo_status_cotacao_bid_frete,
      cor: config.cor_status_cotacao_bid_frete,
    }
  }
  // Fallback para labels/badges hardcoded
  const rotulo = STATUS_LABELS[statusNome as StatusCotacao] ?? statusNome
  const variante = STATUS_BADGE[statusNome as StatusCotacao] ?? 'default'
  const FALLBACK_CORES: Record<string, string> = {
    info: '#6366f1', warning: '#f59e0b', success: '#22c55e', danger: '#ef4444', default: '#64748b',
  }
  return { rotulo, cor: FALLBACK_CORES[variante] ?? '#64748b' }
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
