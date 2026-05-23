/**
 * api.ts — Funções de chamada da API do BID Frete
 * Skill: antigravity-criar-produto (Passo 1 — shared/api.ts)
 */

import type {
  Cotacao,
  CotacoesListResponse,
  Fornecedor,
  FornecedoresListResponse,
  BidRequest,
  BidResponse,
  DashboardKPIs,
  CalendarioAlerta,
  TabelaPreco,
  Avaliacao,
  Porto,
  Moeda,
  StatusCotacao,
  StatusCotacaoBidFreteConfig,
} from './types'

const API_BASE = '/api/v1'

const headers = () => {
  const customHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
  }

  const orgId = sessionStorage.getItem('gravity_tenant_id') ||
                sessionStorage.getItem('gravity_company_id') ||
                sessionStorage.getItem('gravity_id_organizacao') ||
                import.meta.env.VITE_TENANT_ID ||
                import.meta.env.VITE_DEV_TENANT_ID ||
                'org_dev_default'

  const userId = sessionStorage.getItem('gravity_id_usuario') ||
                 import.meta.env.VITE_USER_ID ||
                 'user_dev_default'

  customHeaders['x-id-organizacao'] = orgId
  customHeaders['x-id-usuario'] = userId

  return customHeaders
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Erro ${res.status}`)
  }
  return res.json()
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function getDashboardKpis(): Promise<DashboardKPIs> {
  const res = await fetch(`${API_BASE}/bid-frete/dashboard/kpis`, { headers: headers() })
  return handleResponse(res)
}

export async function getDashboardCalendario(): Promise<CalendarioAlerta[]> {
  const res = await fetch(`${API_BASE}/bid-frete/dashboard/calendario`, { headers: headers() })
  return handleResponse(res)
}

// ─── Cotações CRUD ──────────────────────────────────────────────────────────

export interface CotacoesListParams {
  status?: StatusCotacao
  page?: number
  limit?: number
  busca?: string
}

export async function getCotacoes(params: CotacoesListParams = {}): Promise<CotacoesListResponse> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.busca) query.set('busca', params.busca)
  const res = await fetch(`${API_BASE}/bid-frete/cotacoes?${query}`, { headers: headers() })
  return handleResponse(res)
}

export async function getCotacao(id: string): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete/cotacoes/${id}`, { headers: headers() })
  return handleResponse(res)
}

export async function criarCotacao(input: Partial<Cotacao>): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete/cotacoes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(input),
  })
  return handleResponse(res)
}

export async function atualizarCotacao(id: string, input: Partial<Cotacao>): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete/cotacoes/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(input),
  })
  return handleResponse(res)
}

export async function mudarStatusCotacao(id: string, status: StatusCotacao): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete/cotacoes/${id}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  return handleResponse(res)
}

export async function excluirCotacao(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bid-frete/cotacoes/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Erro ${res.status} ao excluir cotação`)
}

// ─── Bids (Disparo) ─────────────────────────────────────────────────────────

export async function dispararBids(cotacaoId: string, fornecedorIds: string[], canais: string[]): Promise<BidRequest[]> {
  const res = await fetch(`${API_BASE}/bid-frete/bids/disparar`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ cotacao_id: cotacaoId, fornecedor_ids: fornecedorIds, canais }),
  })
  return handleResponse(res)
}

export async function getBidsPorCotacao(cotacaoId: string): Promise<BidRequest[]> {
  const res = await fetch(`${API_BASE}/bid-frete/bids/cotacao/${cotacaoId}`, { headers: headers() })
  return handleResponse(res)
}

// ─── Comparativo ────────────────────────────────────────────────────────────

export async function getRanking(cotacaoId: string): Promise<BidResponse[]> {
  const res = await fetch(`${API_BASE}/bid-frete/comparativo/${cotacaoId}/ranking`, { headers: headers() })
  return handleResponse(res)
}

export async function aprovarResposta(cotacaoId: string, responseId: string): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete/comparativo/${cotacaoId}/aprovar`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ response_id: responseId }),
  })
  return handleResponse(res)
}

export async function reprovarTodas(cotacaoId: string, motivo: string): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete/comparativo/${cotacaoId}/reprovar`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ motivo }),
  })
  return handleResponse(res)
}

// ─── Fornecedores ───────────────────────────────────────────────────────────

export interface FornecedoresListParams {
  tipo?: string
  status?: string
  busca?: string
  page?: number
  limit?: number
}

export async function getFornecedores(params: FornecedoresListParams = {}): Promise<FornecedoresListResponse> {
  const query = new URLSearchParams()
  if (params.tipo) query.set('tipo', params.tipo)
  if (params.status) query.set('status', params.status)
  if (params.busca) query.set('busca', params.busca)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const res = await fetch(`${API_BASE}/bid-frete/fornecedores?${query}`, { headers: headers() })
  return handleResponse(res)
}

export async function getFornecedor(id: string): Promise<Fornecedor> {
  const res = await fetch(`${API_BASE}/bid-frete/fornecedores/${id}`, { headers: headers() })
  return handleResponse(res)
}

export async function getTabelaPrecos(fornecedorId: string): Promise<TabelaPreco[]> {
  const res = await fetch(`${API_BASE}/bid-frete/fornecedores/${fornecedorId}/tabela`, { headers: headers() })
  return handleResponse(res)
}

export async function getAvaliacoes(fornecedorId: string): Promise<Avaliacao[]> {
  const res = await fetch(`${API_BASE}/bid-frete/avaliacoes/fornecedor/${fornecedorId}`, { headers: headers() })
  return handleResponse(res)
}

// ─── Portal do Fornecedor ───────────────────────────────────────────────────

export async function getPortalDashboard(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/bid-frete/portal/dashboard`, { headers: headers() })
  return handleResponse(res)
}

export async function getPortalPendentes(): Promise<BidRequest[]> {
  const res = await fetch(`${API_BASE}/bid-frete/portal/pendentes`, { headers: headers() })
  return handleResponse(res)
}

export async function responderBid(bidRequestId: string, data: Partial<BidResponse>): Promise<BidResponse> {
  const res = await fetch(`${API_BASE}/bid-frete/portal/responder/${bidRequestId}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function getPortalRespostas(): Promise<BidResponse[]> {
  const res = await fetch(`${API_BASE}/bid-frete/portal/respostas`, { headers: headers() })
  return handleResponse(res)
}

export async function getPortalDesempenho(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/bid-frete/portal/desempenho`, { headers: headers() })
  return handleResponse(res)
}

// ─── Portal Público (sem login) ─────────────────────────────────────────────

export async function getPublicCotacao(token: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/bid-frete/portal/public/${token}`)
  return handleResponse(res)
}

export async function responderPublico(token: string, data: Partial<BidResponse>): Promise<BidResponse> {
  const res = await fetch(`${API_BASE}/bid-frete/portal/public/${token}/responder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

// ─── Config Status (Configuração dinâmica) ─────────────────────────────────

export async function getStatusConfig(): Promise<StatusCotacaoBidFreteConfig[]> {
  const res = await fetch(`${API_BASE}/bid-frete/config/status`, { headers: headers() })
  const data = await handleResponse<{ status: StatusCotacaoBidFreteConfig[] }>(res)
  return data.status
}

export async function criarStatusConfig(input: {
  nome_status_cotacao_bid_frete: string
  rotulo_status_cotacao_bid_frete: string
  cor_status_cotacao_bid_frete: string
  icone_status_cotacao_bid_frete?: string
}): Promise<StatusCotacaoBidFreteConfig> {
  const res = await fetch(`${API_BASE}/bid-frete/config/status`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(input),
  })
  const data = await handleResponse<{ status: StatusCotacaoBidFreteConfig }>(res)
  return data.status
}

export async function editarStatusConfig(id: string, input: {
  rotulo_status_cotacao_bid_frete?: string
  cor_status_cotacao_bid_frete?: string
  icone_status_cotacao_bid_frete?: string | null
}): Promise<StatusCotacaoBidFreteConfig> {
  const res = await fetch(`${API_BASE}/bid-frete/config/status/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(input),
  })
  const data = await handleResponse<{ status: StatusCotacaoBidFreteConfig }>(res)
  return data.status
}

export async function excluirStatusConfig(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bid-frete/config/status/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Erro ${res.status} ao excluir status`)
  }
}

export async function reordenarStatusConfig(ids: string[]): Promise<StatusCotacaoBidFreteConfig[]> {
  const res = await fetch(`${API_BASE}/bid-frete/config/status/reordenar`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ ids }),
  })
  const data = await handleResponse<{ status: StatusCotacaoBidFreteConfig[] }>(res)
  return data.status
}

// ─── Master Data ────────────────────────────────────────────────────────────

export async function getPortos(tipo?: string): Promise<Porto[]> {
  const query = tipo ? `?tipo=${tipo}` : ''
  const res = await fetch(`${API_BASE}/bid-frete/master-data/portos${query}`)
  return handleResponse(res)
}

export async function getMoedas(): Promise<Moeda[]> {
  const res = await fetch(`${API_BASE}/bid-frete/master-data/moedas`)
  return handleResponse(res)
}
