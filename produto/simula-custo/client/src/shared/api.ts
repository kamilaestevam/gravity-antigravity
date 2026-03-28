/**
 * api.ts — Funções de chamada da API do SimulaCusto
 * Skill: antigravity-criar-produto (Passo 1 — shared/api.ts)
 */

import type { SimulacaoInput, ResultadoFiscal, Estimativa, NcmItem, UfItem, PaisItem } from './types'

const API_BASE = '/api/v1'

const headers = () => ({
  'Content-Type': 'application/json',
  'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY ?? 'dev-key',
})

// ─── Simulação ─────────────────────────────────────────────────────────────────

export async function postSimulacao(input: SimulacaoInput): Promise<ResultadoFiscal> {
  const res = await fetch(`${API_BASE}/simula-custo`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} na simulação`)
  }
  const json = await res.json()
  return { ...json.data, source: json.source, ptaxUtilizada: json.data.ptaxUtilizada ?? 0 }
}

// ─── Master Data ──────────────────────────────────────────────────────────────

export async function searchNcm(query: string): Promise<NcmItem[]> {
  if (query.length < 3) return []
  const res = await fetch(`${API_BASE}/master-data/ncm/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) return []
  return res.json()
}

export async function getUfs(): Promise<UfItem[]> {
  const res = await fetch(`${API_BASE}/master-data/ufs`)
  if (!res.ok) return []
  return res.json()
}

export async function getPaises(): Promise<PaisItem[]> {
  const res = await fetch(`${API_BASE}/master-data/countries`)
  if (!res.ok) return []
  return res.json()
}

// ─── Estimativas (com tenant isolation via header) ────────────────────────────

export async function getEstimativas(tenantId: string): Promise<Estimativa[]> {
  const res = await fetch(`${API_BASE}/simula-custo/estimativas`, {
    headers: { ...headers(), 'x-tenant-id': tenantId },
  })
  if (!res.ok) return []
  return res.json()
}
