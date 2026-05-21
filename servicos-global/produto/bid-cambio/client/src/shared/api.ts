/**
 * api.ts — Funcoes de chamada da API do BID Cambio
 * Alinhado com as rotas reais do server (routes/*.ts)
 */

import type {
  BidCambioParcela,
  BidCambioCotacao,
  BidCambioCorretora,
  BidCambioRespostaCotacao,
  BidCambioPreferenciaUsuario,
  BidCambioPreferenciaGrid,
  BidCambioAvaliacaoCorretora,
  Pagination,
  PaginatedResponse,
  DashboardKPIs,
  BidCambioStatusParcela,
  BidCambioStatusCotacao,
  BidCambioMoeda,
} from './types'

// --- Config ---

const API_BASE = '/api/v1'

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
    'x-id-organizacao': import.meta.env.VITE_TENANT_ID ?? '',
    'x-id-usuario': import.meta.env.VITE_USER_ID ?? '',
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Erro ${res.status}`)
  }
  return res.json() as Promise<T>
}

// --- Master Data (publico, sem auth) ---

export async function getMoedas() {
  const res = await fetch(`${API_BASE}/master-data/moedas`)
  return handleResponse<Array<{ codigo: string; nome: string; simbolo: string }>>(res)
}

export async function getPtax() {
  const res = await fetch(`${API_BASE}/master-data/ptax`)
  return handleResponse<{ moeda: string; data: string; compra: number; venda: number }>(res)
}

// --- Dashboard ---

export async function getDashboard() {
  const res = await fetch(`${API_BASE}/bid-cambio/dashboard`, { headers: getHeaders() })
  return handleResponse<DashboardKPIs>(res)
}

export async function getDashboardVencimentos(dias = 30) {
  const res = await fetch(`${API_BASE}/bid-cambio/dashboard/vencimentos?dias=${dias}`, { headers: getHeaders() })
  return handleResponse<{
    proximos_vencimentos: { data: BidCambioParcela[]; total: number; dias_consulta: number }
    vencidos: { data: BidCambioParcela[]; total: number }
    por_moeda: Array<{ moeda_parcela_bid_cambio: BidCambioMoeda; _sum: { valor_a_pagar_parcela_bid_cambio: number; valor_a_pagar_brl_parcela_bid_cambio: number }; _count: number }>
  }>(res)
}

// --- Cambios (Pilar 1 — Parcelas) ---

export interface CambiosListParams {
  status?: BidCambioStatusParcela
  moeda_parcela_bid_cambio?: string
  data_vencimento_inicio_parcela_bid_cambio?: string
  data_vencimento_fim_parcela_bid_cambio?: string
  page?: number
  limit?: number
}

export async function listarCambios(params: CambiosListParams = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.moeda_parcela_bid_cambio) query.set('moeda_parcela_bid_cambio', params.moeda_parcela_bid_cambio)
  if (params.data_vencimento_inicio_parcela_bid_cambio) query.set('data_vencimento_inicio_parcela_bid_cambio', params.data_vencimento_inicio_parcela_bid_cambio)
  if (params.data_vencimento_fim_parcela_bid_cambio) query.set('data_vencimento_fim_parcela_bid_cambio', params.data_vencimento_fim_parcela_bid_cambio)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const res = await fetch(`${API_BASE}/bid-cambio/cambios?${query}`, { headers: getHeaders() })
  return handleResponse<PaginatedResponse<BidCambioParcela>>(res)
}

export async function getCambioDetalhe(id: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/cambios/${id}`, { headers: getHeaders() })
  return handleResponse<BidCambioParcela>(res)
}

export async function getCambiosTotais(status?: string) {
  const query = status ? `?status=${status}` : ''
  const res = await fetch(`${API_BASE}/bid-cambio/cambios/totais${query}`, { headers: getHeaders() })
  return handleResponse<Array<{ moeda_parcela_bid_cambio: BidCambioMoeda; _sum: { valor_a_pagar_parcela_bid_cambio: number; valor_a_pagar_brl_parcela_bid_cambio: number }; _count: number }>>(res)
}

export async function agendarParcelas(parcela_ids: string[], data_agendamento: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/cambios/agendar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ parcela_ids, data_agendamento }),
  })
  return handleResponse<{ agendadas: number; data: string }>(res)
}

export async function pagarParcela(input: {
  id_parcela_bid_cambio: string
  valor_pago_parcela_bid_cambio: number
  taxa_fechamento_parcela_bid_cambio: number
  banco_corretora_parcela_bid_cambio: string
  numero_contrato_cambio_parcela_bid_cambio?: string
  anexos?: Array<{ nome_original: string; url: string; categoria?: string }>
}) {
  const res = await fetch(`${API_BASE}/bid-cambio/cambios/pagar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<{ parcela_id: string; status: string; valor_pago: number; valor_pago_brl: number; taxa: number }>(res)
}

export async function retornarParaPendente(parcela_id: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/cambios/retornar-pendente`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ parcela_id }),
  })
  return handleResponse<{ parcela_id: string; status: string }>(res)
}

// --- Cotacoes (Pilar 2 — Marketplace) ---

export interface CotacoesListParams {
  status?: BidCambioStatusCotacao
  page?: number
  limit?: number
}

export async function listarCotacoes(params: CotacoesListParams = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const res = await fetch(`${API_BASE}/bid-cambio/cotacoes?${query}`, { headers: getHeaders() })
  return handleResponse<PaginatedResponse<BidCambioCotacao>>(res)
}

export async function criarCotacao(input: {
  moeda_cotacao_bid_cambio: BidCambioMoeda
  valor_cotacao_bid_cambio: number
  tipo_operacao_cotacao_bid_cambio: string
  modalidade_cotacao_bid_cambio?: string
  liquidacao_cotacao_bid_cambio?: string
  referencia_processo_cotacao_bid_cambio?: string
  numero_pedido_cotacao_bid_cambio?: string
  exportador_cotacao_bid_cambio?: string
  data_expiracao_cotacao_bid_cambio?: string
}) {
  const res = await fetch(`${API_BASE}/bid-cambio/cotacoes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<BidCambioCotacao>(res)
}

export async function getCotacaoDetalhe(id: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/cotacoes/${id}`, { headers: getHeaders() })
  return handleResponse<BidCambioCotacao>(res)
}

// --- Bids (Disparo) ---

export async function dispararBids(cotacao_id: string, corretora_ids: string[], mensagem_personalizada?: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/bids/disparar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ cotacao_id, corretora_ids, mensagem_personalizada }),
  })
  return handleResponse<{ cotacao_id: string; bid_requests: unknown[]; total_disparados: number; expira_em: string }>(res)
}

export async function cotacaoAberta(cotacao_id: string, mensagem_personalizada?: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/bids/cotacao-aberta`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ cotacao_id, mensagem_personalizada }),
  })
  return handleResponse<{ cotacao_id: string; total_disparados: number }>(res)
}

export async function getBidStatus(cotacao_id: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/bids/cotacao/${cotacao_id}`, { headers: getHeaders() })
  return handleResponse<{ cotacao: unknown; bid_requests: unknown[]; total: number; respondidos: number; pendentes: number }>(res)
}

// --- Comparativo ---

export async function getComparativo(cotacaoId: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/comparativo/${cotacaoId}`, { headers: getHeaders() })
  return handleResponse<{
    cotacao: unknown
    ranking: Array<BidCambioRespostaCotacao & { tags: string[] }>
    total_respostas: number
    melhor_taxa: number | null
    pior_taxa: number | null
  }>(res)
}

export async function aprovarResposta(cotacaoId: string, bid_response_id: string, observacao?: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/comparativo/${cotacaoId}/aprovar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ bid_response_id, observacao }),
  })
  return handleResponse<{ cotacao_id: string; resposta_aprovada: string; taxa_aprovada: number; economia_brl: number }>(res)
}

export async function reprovarCotacao(cotacaoId: string, motivo: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/comparativo/${cotacaoId}/reprovar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ motivo }),
  })
  return handleResponse<{ cotacao_id: string; status: string; motivo: string }>(res)
}

// --- Corretoras ---

export interface CorretorasListParams {
  status?: string
  busca?: string
  page?: number
  limit?: number
}

export async function listarCorretoras(params: CorretorasListParams = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.busca) query.set('busca', params.busca)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const res = await fetch(`${API_BASE}/bid-cambio/corretoras?${query}`, { headers: getHeaders() })
  return handleResponse<PaginatedResponse<BidCambioCorretora>>(res)
}

export async function getCorretoraDetalhe(id: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/corretoras/${id}`, { headers: getHeaders() })
  return handleResponse<BidCambioCorretora>(res)
}

export async function criarCorretora(input: {
  razao_social_corretora_bid_cambio: string
  nome_fantasia_corretora_bid_cambio?: string
  cnpj_corretora_bid_cambio?: string
  tipo_corretora_bid_cambio?: string
  email_corretora_bid_cambio: string
  telefone_corretora_bid_cambio?: string
  contato_nome_corretora_bid_cambio?: string
  contato_cargo_corretora_bid_cambio?: string
  portal_habilitado_corretora_bid_cambio?: boolean
  moedas_operadas_corretora_bid_cambio?: string
}) {
  const res = await fetch(`${API_BASE}/bid-cambio/corretoras`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<BidCambioCorretora>(res)
}

// --- Avaliacoes ---

export async function criarAvaliacao(input: {
  id_corretora_bid_cambio: string
  id_cotacao_bid_cambio?: string
  nota_taxa_avaliacao_corretora_bid_cambio: number
  nota_agilidade_avaliacao_corretora_bid_cambio: number
  nota_atendimento_avaliacao_corretora_bid_cambio: number
  nota_confiabilidade_avaliacao_corretora_bid_cambio: number
  comentario_avaliacao_corretora_bid_cambio?: string
}) {
  const res = await fetch(`${API_BASE}/bid-cambio/avaliacoes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<BidCambioAvaliacaoCorretora>(res)
}

export async function getAvaliacoesCorretora(corretoraId: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/avaliacoes/corretora/${corretoraId}`, { headers: getHeaders() })
  return handleResponse<{ corretora: unknown; medias: Record<string, number | null>; avaliacoes: PaginatedResponse<BidCambioAvaliacaoCorretora> }>(res)
}

// --- Preferencias ---

export async function getPreferencias() {
  const res = await fetch(`${API_BASE}/bid-cambio/preferencias`, { headers: getHeaders() })
  return handleResponse<BidCambioPreferenciaUsuario>(res)
}

export async function atualizarPreferencias(input: Partial<BidCambioPreferenciaUsuario>) {
  const res = await fetch(`${API_BASE}/bid-cambio/preferencias`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<BidCambioPreferenciaUsuario>(res)
}

export async function getPreferenciasGrid(grid_id: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/preferencias/grid?grid_id=${grid_id}`, { headers: getHeaders() })
  return handleResponse<BidCambioPreferenciaGrid>(res)
}

export async function salvarPreferenciasGrid(input: {
  grid_id: string
  colunas_visiveis_preferencia_grid_bid_cambio?: string[]
  ordenacao_preferencia_grid_bid_cambio?: { campo: string; direcao: 'asc' | 'desc' }
  filtros_salvos_preferencia_grid_bid_cambio?: Record<string, unknown>
}) {
  const res = await fetch(`${API_BASE}/bid-cambio/preferencias/grid`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<BidCambioPreferenciaGrid>(res)
}
