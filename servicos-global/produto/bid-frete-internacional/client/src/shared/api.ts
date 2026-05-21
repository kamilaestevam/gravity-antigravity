/// <reference types="vite/client" />
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
} from './types'

const API_BASE = '/api/v1'

const headers = () => ({
  'Content-Type': 'application/json',
  'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
})

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Erro ${res.status}`)
  }
  return res.json()
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function getDashboardKpis(): Promise<DashboardKPIs> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard/kpis`, { headers: headers() })
  return handleResponse(res)
}

export async function getDashboardCalendario(): Promise<CalendarioAlerta[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard/calendario`, { headers: headers() })
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
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes?${query}`, { headers: headers() })
  return handleResponse(res)
}

export async function getCotacao(id: string): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, { headers: headers() })
  return handleResponse(res)
}

export async function criarCotacao(input: Partial<Cotacao>): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(input),
  })
  return handleResponse(res)
}

export async function atualizarCotacao(id: string, input: Partial<Cotacao>): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(input),
  })
  return handleResponse(res)
}

export async function mudarStatusCotacao(id: string, status: StatusCotacao): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  return handleResponse(res)
}

export async function excluirCotacao(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/cotacoes/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Erro ${res.status} ao excluir cotação`)
}

// ─── Bids (Disparo) ─────────────────────────────────────────────────────────

export async function dispararBids(cotacaoId: string, fornecedorIds: string[], canais: string[]): Promise<BidRequest[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/pedidos-cotacao/disparar`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ id_cotacao_bid_frete_internacional: cotacaoId, fornecedor_ids: fornecedorIds, canais }),
  })
  return handleResponse(res)
}

export async function getBidsPorCotacao(cotacaoId: string): Promise<BidRequest[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/pedidos-cotacao/cotacao/${cotacaoId}`, { headers: headers() })
  return handleResponse(res)
}

// ─── Comparativo ────────────────────────────────────────────────────────────

export async function getRanking(cotacaoId: string): Promise<BidResponse[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/comparativo/${cotacaoId}/classificacao`, { headers: headers() })
  return handleResponse(res)
}

export async function aprovarResposta(cotacaoId: string, responseId: string): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/comparativo/${cotacaoId}/aprovar`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ id_proposta_bid_frete_internacional: responseId }),
  })
  return handleResponse(res)
}

export async function reprovarTodas(cotacaoId: string, motivo: string): Promise<Cotacao> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/comparativo/${cotacaoId}/reprovar`, {
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
  const res = await fetch(`${API_BASE}/bid-frete-internacional/fornecedores?${query}`, { headers: headers() })
  return handleResponse(res)
}

export async function getFornecedor(id: string): Promise<Fornecedor> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/fornecedores/${id}`, { headers: headers() })
  return handleResponse(res)
}

export async function getTabelaPrecos(fornecedorId: string): Promise<TabelaPreco[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/fornecedores/${fornecedorId}/tabelas-valor`, { headers: headers() })
  return handleResponse(res)
}

export async function getAvaliacoes(fornecedorId: string): Promise<Avaliacao[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/avaliacoes/fornecedor/${fornecedorId}`, { headers: headers() })
  return handleResponse(res)
}

// ─── Portal do Fornecedor ───────────────────────────────────────────────────

export async function getPortalDashboard(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/dashboard`, { headers: headers() })
  return handleResponse(res)
}

export async function getPortalPendentes(): Promise<BidRequest[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/pendentes`, { headers: headers() })
  return handleResponse(res)
}

export async function responderBid(bidRequestId: string, data: Partial<BidResponse>): Promise<BidResponse> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/responder/${bidRequestId}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function getPortalRespostas(): Promise<BidResponse[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/propostas`, { headers: headers() })
  return handleResponse(res)
}

export async function getPortalDesempenho(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/desempenho`, { headers: headers() })
  return handleResponse(res)
}

// ─── Portal Público (sem login) ─────────────────────────────────────────────

export async function getPublicCotacao(token: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/publico/${token}`)
  return handleResponse(res)
}

export async function responderPublico(token: string, data: Partial<BidResponse>): Promise<BidResponse> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/portal/publico/${token}/responder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

// ─── Master Data ────────────────────────────────────────────────────────────

export async function getPortos(tipo?: string): Promise<Porto[]> {
  const query = tipo ? `?tipo=${tipo}` : ''
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dados-mestre/portos${query}`)
  return handleResponse(res)
}

export async function getMoedas(): Promise<Moeda[]> {
  const res = await fetch(`${API_BASE}/bid-frete-internacional/dados-mestre/moedas`)
  return handleResponse(res)
}

// ─── Dashboard Painéis ─────────────────────────────────────────────────────────

export interface DashboardPainel {
  id:           string
  tenant_id:    string
  user_id:      string
  nome:         string
  ordem:        number
  is_visivel:   boolean
  widgets_json: string
  created_at:   string
  updated_at:   string
}

export const paineisDashboardApi = {
  listar: (): Promise<{ data: DashboardPainel[] }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis`, { headers: headers() })
      .then(res => handleResponse<{ data: DashboardPainel[] }>(res))
      .catch(() => ({ data: [] })),

  criar: (nome: string): Promise<{ data: DashboardPainel }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nome }),
    }).then(res => handleResponse<{ data: DashboardPainel }>(res)),

  atualizar: (id: string, patch: Partial<Pick<DashboardPainel, 'nome' | 'is_visivel' | 'widgets_json'>>): Promise<{ data: DashboardPainel }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(patch),
    }).then(res => handleResponse<{ data: DashboardPainel }>(res)),

  reordenar: (ids: string[]): Promise<{ data: { reordenado: boolean } }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/reordenar`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ ids }),
    }).then(res => handleResponse<{ data: { reordenado: boolean } }>(res)),

  deletar: (id: string): Promise<{ data: { deletado: boolean } }> =>
    fetch(`${API_BASE}/bid-frete-internacional/dashboard/paineis/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(res => handleResponse<{ data: { deletado: boolean } }>(res)),
}

export interface DashboardKpis {
  period: string
  saving_total: number
  valor_medio_ganho_bid_frete_internacional: number
  ganho_percentual_ganho_bid_frete_internacional: number
  transit_time: number
  volume_mensal: number
  cotacoes_andamento: number
  cotacoes_passadas: number
  valor_andamento_usd: number
  valor_aprovado_usd: number
  cotacoes_status: Record<string, number>
  [key: string]: number | string | Record<string, number> | string[]
}

export interface DashboardTrendBucket {
  month: string
  volume_mensal: number
  saving_total: number
  valor_medio_ganho_bid_frete_internacional: number
  ganho_percentual_ganho_bid_frete_internacional: number
  transit_time: number
  cotacoes_andamento: number
  cotacoes_passadas: number
  valor_andamento_usd: number
  valor_aprovado_usd: number
  [key: string]: string | number
}

export interface GabiInsightItem {
  id: string
  variante: 'default' | 'warn'
  tag: string
  texto: string
  stat?: { label: string; valor: string }
  textoLink?: string
  rota?: string
}

export const dashboardApi = {
  kpis: async (period: string, range?: { from: string; to: string }): Promise<DashboardKpis> => {
    const params = new URLSearchParams()
    if (range) {
      params.set('data_inicio', range.from)
      params.set('data_fim', range.to)
    }
    const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard?${params}`, { headers: headers() })
    const raw = await handleResponse<any>(res)
    
    const mapped: Record<string, any> = {
      period,
      saving_total: raw.savings?.total_saving_vs_target ?? 0,
      valor_medio_ganho_bid_frete_internacional: raw.savings?.total_valor_aprovado ? (raw.savings?.total_valor_aprovado / (raw.savings?.total_cotacoes_aprovadas_classificacao_bid_frete_internacional || 1)) : 0,
      ganho_percentual_ganho_bid_frete_internacional: raw.savings?.media_saving_percentual ?? 0,
      transit_time: 0,
      volume_mensal: 0,
      cotacoes_andamento: raw.cotacoes_andamento ?? 0,
      cotacoes_passadas: raw.cotacoes_passadas ?? 0,
      valor_andamento_usd: raw.valor_andamento_usd ?? 0,
      valor_aprovado_usd: raw.valor_aprovado_usd ?? 0,
      
      cotacoes_status: Object.fromEntries(
        (raw.funil ?? []).map((f: { status: string; count: number }) => [f.status, f.count])
      ),
    }

    return mapped as unknown as DashboardKpis
  },

  trend: async (period: string, granularity = 'month'): Promise<{ period: string; granularity: string; value: DashboardTrendBucket[] }> => {
    const res = await fetch(`${API_BASE}/bid-frete-internacional/dashboard/widgets`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        metrics: ['volume_mensal'],
        filters: { period },
      }),
    })
    const raw = await handleResponse<any>(res)
    const value = (raw.volume_mensal ?? []).map((item: { month: string; value: number }) => ({
      month: item.month,
      volume_mensal: item.value,
      saving_total: 0,
      valor_medio_ganho_bid_frete_internacional: 0,
      ganho_percentual_ganho_bid_frete_internacional: 0,
      transit_time: 0,
      cotacoes_andamento: 0,
      cotacoes_passadas: 0,
      valor_andamento_usd: 0,
      valor_aprovado_usd: 0,
    }))
    return { period, granularity, value }
  },

  insights: async (period: string, range?: { from: string; to: string }): Promise<{ period: string; role: string; insights: GabiInsightItem[] }> => {
    return { period, role: '', insights: [] }
  },

  ncmStatus: async () => {
    return {
      total_invalidos: 0,
      itens_invalidos: 0,
      sem_sync: true,
      ultima_sync: null,
    }
  }
}

