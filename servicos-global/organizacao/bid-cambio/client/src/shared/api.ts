/**
 * api.ts — Funcoes de chamada da API do BID Cambio
 * Alinhado com as rotas reais do server (routes/*.ts)
 */

import type {
  CambioParcelas,
  CambioCotacoes,
  CambioCorretoras,
  BidResponseCambio,
  CambioPreferenciaUsuario,
  CambioPreferenciaGrid,
  CambioCorretorasAvaliacoes,
  Pagination,
  PaginatedResponse,
  DashboardKPIs,
  CambioParcelaStatus,
  CambioCotacaoStatus,
  CambioMoeda,
} from './types'

// --- Config ---

const API_BASE = '/api/v1'

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY ?? 'dev-key',
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
    proximos_vencimentos: { data: CambioParcelas[]; total: number; dias_consulta: number }
    vencidos: { data: CambioParcelas[]; total: number }
    por_moeda: Array<{ moeda: CambioMoeda; _sum: { valor_a_pagar: number; valor_a_pagar_brl: number }; _count: number }>
  }>(res)
}

// --- Cambios (Pilar 1 — Parcelas) ---

export interface CambiosListParams {
  status?: CambioParcelaStatus
  moeda?: string
  data_vencimento_inicio?: string
  data_vencimento_fim?: string
  page?: number
  limit?: number
}

export async function listarCambios(params: CambiosListParams = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.moeda) query.set('moeda', params.moeda)
  if (params.data_vencimento_inicio) query.set('data_vencimento_inicio', params.data_vencimento_inicio)
  if (params.data_vencimento_fim) query.set('data_vencimento_fim', params.data_vencimento_fim)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const res = await fetch(`${API_BASE}/bid-cambio/cambios?${query}`, { headers: getHeaders() })
  return handleResponse<PaginatedResponse<CambioParcelas>>(res)
}

export async function getCambioDetalhe(id: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/cambios/${id}`, { headers: getHeaders() })
  return handleResponse<CambioParcelas>(res)
}

export async function getCambiosTotais(status?: string) {
  const query = status ? `?status=${status}` : ''
  const res = await fetch(`${API_BASE}/bid-cambio/cambios/totais${query}`, { headers: getHeaders() })
  return handleResponse<Array<{ moeda: CambioMoeda; _sum: { valor_a_pagar: number; valor_a_pagar_brl: number }; _count: number }>>(res)
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
  parcela_id: string
  valor_pago: number
  taxa_fechamento: number
  banco_corretora: string
  numero_contrato?: string
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
  status?: CambioCotacaoStatus
  page?: number
  limit?: number
}

export async function listarCotacoes(params: CotacoesListParams = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const res = await fetch(`${API_BASE}/bid-cambio/cotacoes?${query}`, { headers: getHeaders() })
  return handleResponse<PaginatedResponse<CambioCotacoes>>(res)
}

export async function criarCotacao(input: {
  moeda: CambioMoeda
  valor: number
  tipo_operacao: string
  modalidade?: string
  liquidacao?: string
  referencia_processo?: string
  numero_pedido?: string
  exportador?: string
  data_expiracao?: string
}) {
  const res = await fetch(`${API_BASE}/bid-cambio/cotacoes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<CambioCotacoes>(res)
}

export async function getCotacaoDetalhe(id: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/cotacoes/${id}`, { headers: getHeaders() })
  return handleResponse<CambioCotacoes>(res)
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
    ranking: Array<BidResponseCambio & { tags: string[] }>
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
  return handleResponse<PaginatedResponse<CambioCorretoras>>(res)
}

export async function getCorretoraDetalhe(id: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/corretoras/${id}`, { headers: getHeaders() })
  return handleResponse<CambioCorretoras>(res)
}

export async function criarCorretora(input: {
  razao_social: string
  nome_fantasia?: string
  cnpj?: string
  tipo?: string
  email: string
  telefone?: string
  contato_nome?: string
  contato_cargo?: string
  portal_habilitado?: boolean
  moedas_operadas?: string
}) {
  const res = await fetch(`${API_BASE}/bid-cambio/corretoras`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<CambioCorretoras>(res)
}

// --- Avaliacoes ---

export async function criarAvaliacao(input: {
  corretora_id: string
  cotacao_id?: string
  nota_taxa: number
  nota_agilidade: number
  nota_atendimento: number
  nota_confiabilidade: number
  comentario?: string
}) {
  const res = await fetch(`${API_BASE}/bid-cambio/avaliacoes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<CambioCorretorasAvaliacoes>(res)
}

export async function getAvaliacoesCorretora(corretoraId: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/avaliacoes/corretora/${corretoraId}`, { headers: getHeaders() })
  return handleResponse<{ corretora: unknown; medias: Record<string, number | null>; avaliacoes: PaginatedResponse<CambioCorretorasAvaliacoes> }>(res)
}

// --- Preferencias ---

export async function getPreferencias() {
  const res = await fetch(`${API_BASE}/bid-cambio/preferencias`, { headers: getHeaders() })
  return handleResponse<CambioPreferenciaUsuario>(res)
}

export async function atualizarPreferencias(input: Partial<CambioPreferenciaUsuario>) {
  const res = await fetch(`${API_BASE}/bid-cambio/preferencias`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<CambioPreferenciaUsuario>(res)
}

export async function getPreferenciasGrid(grid_id: string) {
  const res = await fetch(`${API_BASE}/bid-cambio/preferencias/grid?grid_id=${grid_id}`, { headers: getHeaders() })
  return handleResponse<CambioPreferenciaGrid>(res)
}

export async function salvarPreferenciasGrid(input: {
  grid_id: string
  colunas_visiveis?: string[]
  ordenacao?: { campo: string; direcao: 'asc' | 'desc' }
  filtros_salvos?: Record<string, unknown>
}) {
  const res = await fetch(`${API_BASE}/bid-cambio/preferencias/grid`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(input),
  })
  return handleResponse<CambioPreferenciaGrid>(res)
}
