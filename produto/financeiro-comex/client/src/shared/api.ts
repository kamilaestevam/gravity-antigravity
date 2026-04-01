/**
 * api.ts — Client API para o Financeiro Comex
 * Todas as chamadas incluem x-internal-key via cookie/env
 */

import type {
  FinanceiroProcesso,
  FinanceiroLancamento,
  FinanceiroCategorias,
  FinanceiroCondicaoPagamento,
  FinanceiroNumerario,
  FinanceiroRateio,
  PaginaMeta,
} from './types'

const BASE = '/api/v1/financeiro'

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error(err.error?.message || 'Erro na requisicao')
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export const dashboard = {
  get: (processoId: string) =>
    req<{ data: FinanceiroProcesso }>('GET', `${BASE}/${processoId}`),

  criar: (body: { processo_id: string; company_id: string; tipo_operacao: string; referencia?: string }) =>
    req<{ data: FinanceiroProcesso }>('POST', BASE, body),
}

// ── Lançamentos ──────────────────────────────────────────────────────────────

export const lancamentos = {
  listar: (processoId: string, params?: Record<string, string | number>) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return req<{ data: FinanceiroLancamento[]; meta: PaginaMeta }>('GET', `${BASE}/${processoId}/lancamentos${qs}`)
  },

  criar: (processoId: string, body: Partial<FinanceiroLancamento>) =>
    req<FinanceiroLancamento>('POST', `${BASE}/${processoId}/lancamentos`, body),

  editar: (processoId: string, id: string, body: Partial<FinanceiroLancamento>) =>
    req<FinanceiroLancamento>('PUT', `${BASE}/${processoId}/lancamentos/${id}`, body),

  excluir: (processoId: string, id: string) =>
    req<void>('DELETE', `${BASE}/${processoId}/lancamentos/${id}`),
}

// ── Importar ─────────────────────────────────────────────────────────────────

export const importar = {
  previewXml: (processoId: string, xml_content: string) =>
    req<{ data: unknown[]; preview: true }>('POST', `${BASE}/${processoId}/importar/xml`, { xml_content }),

  confirmarXml: (processoId: string, lancamentosData: unknown[]) =>
    req<{ data: FinanceiroLancamento[]; count: number }>('POST', `${BASE}/${processoId}/importar/xml/confirmar`, { lancamentos: lancamentosData }),

  previewPortalUnico: (processoId: string, duimp_numero: string) =>
    req<{ data: unknown[]; preview: true }>('POST', `${BASE}/${processoId}/importar/portal-unico`, { duimp_numero }),

  confirmarPortalUnico: (processoId: string, lancamentosData: unknown[]) =>
    req<{ data: FinanceiroLancamento[]; count: number }>('POST', `${BASE}/${processoId}/importar/portal-unico/confirmar`, { lancamentos: lancamentosData }),
}

// ── Numerário ────────────────────────────────────────────────────────────────

export const numerario = {
  listar: (processoId: string) =>
    req<{ data: FinanceiroNumerario[]; total: number }>('GET', `${BASE}/${processoId}/numerario`),

  criar: (processoId: string, body: unknown) =>
    req<{ data: FinanceiroNumerario }>('POST', `${BASE}/${processoId}/numerario`, body),

  editar: (processoId: string, id: string, body: unknown) =>
    req<{ data: FinanceiroNumerario }>('PUT', `${BASE}/${processoId}/numerario/${id}`, body),

  excluir: (processoId: string, id: string) =>
    req<void>('DELETE', `${BASE}/${processoId}/numerario/${id}`),
}

// ── Rateio ───────────────────────────────────────────────────────────────────

export const rateio = {
  listar: (processoId: string) =>
    req<{ data: FinanceiroRateio[] }>('GET', `${BASE}/${processoId}/rateio`),

  gerar: async (processoId: string): Promise<{ blob: Blob; nome: string; rateioId: string }> => {
    const res = await fetch(`${BASE}/${processoId}/rateio/gerar`, { method: 'POST' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
      throw new Error(err.error?.message || 'Erro ao gerar rateio')
    }
    const blob = await res.blob()
    const nome = res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] ?? 'Rateio.xlsx'
    const rateioId = res.headers.get('x-rateio-id') ?? ''
    return { blob, nome, rateioId }
  },

  download: async (processoId: string, id: string): Promise<{ blob: Blob; nome: string }> => {
    const res = await fetch(`${BASE}/${processoId}/rateio/${id}/download`)
    if (!res.ok) throw new Error('Erro ao baixar rateio')
    const blob = await res.blob()
    const nome = res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] ?? 'Rateio.xlsx'
    return { blob, nome }
  },
}

// ── Config — Categorias ───────────────────────────────────────────────────────

export const categorias = {
  listar: (params?: { tipo_operacao?: string; ativo?: boolean }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return req<{ data: FinanceiroCategorias[] }>('GET', `${BASE}/config/categorias${qs}`)
  },

  criar: (body: Partial<FinanceiroCategorias>) =>
    req<FinanceiroCategorias>('POST', `${BASE}/config/categorias`, body),

  editar: (id: string, body: Partial<FinanceiroCategorias>) =>
    req<FinanceiroCategorias>('PUT', `${BASE}/config/categorias/${id}`, body),

  excluir: (id: string) =>
    req<void>('DELETE', `${BASE}/config/categorias/${id}`),
}

// ── Config — Condições ───────────────────────────────────────────────────────

export const condicoes = {
  listar: () =>
    req<{ data: FinanceiroCondicaoPagamento[] }>('GET', `${BASE}/config/condicoes`),

  criar: (body: Partial<FinanceiroCondicaoPagamento>) =>
    req<FinanceiroCondicaoPagamento>('POST', `${BASE}/config/condicoes`, body),

  editar: (id: string, body: Partial<FinanceiroCondicaoPagamento>) =>
    req<FinanceiroCondicaoPagamento>('PUT', `${BASE}/config/condicoes/${id}`, body),

  excluir: (id: string) =>
    req<void>('DELETE', `${BASE}/config/condicoes/${id}`),
}

// ── Histórico ─────────────────────────────────────────────────────────────────

export const historico = {
  listar: (processoId: string, params?: { page?: number; lancamento_id?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return req<{ data: unknown[]; meta: PaginaMeta }>('GET', `${BASE}/${processoId}/historico${qs}`)
  },
}
