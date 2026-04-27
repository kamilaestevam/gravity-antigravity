/**
 * api.ts — Funções de chamada da API do SimulaCusto
 * Skill: antigravity-criar-produto (Passo 1 — shared/api.ts)
 */

import type {
  SimulacaoInput,
  ResultadoFiscal,
  Estimativa,
  EstimativasKpis,
  EstimativaStatus,
  NcmItem,
  UfItem,
  PaisItem,
} from './types'

const API_BASE = '/api/v1'

// Contexto do tenant — setado pelo App.tsx ao montar, lido do Shell store
let _tenantId = ''
let _userId = ''

/** Chamado pelo App.tsx para injetar o contexto do tenant no módulo de API */
export function setApiContext(ctx: { tenantId: string; userId: string }) {
  _tenantId = ctx.tenantId
  _userId = ctx.userId
}

const headers = (): Record<string, string> => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY ?? 'dev-key',
  }
  if (_tenantId) h['x-tenant-id'] = _tenantId
  if (_userId) h['x-user-id'] = _userId
  return h
}

// ─── Simulação ─────────────────────────────────────────────────────────────────

export async function postSimulacao(input: SimulacaoInput): Promise<ResultadoFiscal> {
  const res = await fetch(`${API_BASE}/simula-custo`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Erro ${res.status} na simulação`)
  }
  const json = await res.json()
  return { ...json.data, source: json.source, ptaxUtilizada: json.data.ptaxUtilizada ?? 0 }
}

// ─── Master Data ──────────────────────────────────────────────────────────────

export async function searchNcm(query: string): Promise<NcmItem[]> {
  if (query.length < 3) return []
  const res = await fetch(`${API_BASE}/simula-custo/ncm/buscar?q=${encodeURIComponent(query)}`)
  if (!res.ok) return []
  return res.json()
}

export async function getUfs(): Promise<UfItem[]> {
  const res = await fetch(`${API_BASE}/simula-custo/unidades-federativas`)
  if (!res.ok) return []
  return res.json()
}

export async function getPaises(): Promise<PaisItem[]> {
  const res = await fetch(`${API_BASE}/simula-custo/paises`)
  if (!res.ok) return []
  return res.json()
}

// ─── Estimativas CRUD ────────────────────────────────────────────────────────

export interface EstimativasListParams {
  status?: EstimativaStatus
  busca?: string
  pagina?: number
  limite?: number
}

export interface EstimativasListResponse {
  data: Estimativa[]
  total: number
  pagina: number
  limite: number
}

export async function getEstimativas(params: EstimativasListParams = {}): Promise<EstimativasListResponse> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.busca) query.set('busca', params.busca)
  if (params.pagina) query.set('pagina', String(params.pagina))
  if (params.limite) query.set('limite', String(params.limite))

  const res = await fetch(`${API_BASE}/simula-custo/estimativas?${query}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar estimativas`)
  return res.json()
}

export async function getEstimativa(id: string): Promise<Estimativa> {
  const res = await fetch(`${API_BASE}/simula-custo/estimativas/${id}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar estimativa`)
  return res.json()
}

export async function criarEstimativa(input: SimulacaoInput): Promise<Estimativa> {
  const res = await fetch(`${API_BASE}/simula-custo/estimativas`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Erro ${res.status} ao criar estimativa`)
  }
  return res.json()
}

export async function atualizarEstimativa(id: string, input: Partial<SimulacaoInput>): Promise<Estimativa> {
  const res = await fetch(`${API_BASE}/simula-custo/estimativas/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Erro ${res.status} ao atualizar estimativa`)
  }
  return res.json()
}

export async function atualizarStatusEstimativa(id: string, status: EstimativaStatus): Promise<Estimativa> {
  const res = await fetch(`${API_BASE}/simula-custo/estimativas/${id}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Erro ${res.status} ao atualizar status`)
  }
  return res.json()
}

export async function duplicarEstimativa(id: string): Promise<Estimativa> {
  const res = await fetch(`${API_BASE}/simula-custo/estimativas/${id}/duplicar`, {
    method: 'POST',
    headers: headers(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Erro ${res.status} ao duplicar estimativa`)
  }
  return res.json()
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

export async function getEstimativasKpis(): Promise<EstimativasKpis> {
  const res = await fetch(`${API_BASE}/simula-custo/estimativas/kpis`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar KPIs`)
  return res.json()
}
