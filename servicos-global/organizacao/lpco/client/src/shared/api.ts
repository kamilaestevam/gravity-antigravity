/**
 * api.ts — Client API para o produto LPCO
 *
 * Comunica com o backend via proxy Vite -> :8027
 */

import type { Lpco, LpcoItem, LpcoExigencia, LpcoVinculo } from './types'

let context = { tenantId: '', userId: '' }

export function setApiContext(ctx: { tenantId: string; userId: string }): void {
  context = ctx
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-id-organizacao': context.tenantId,
      'x-id-usuario': context.userId,
      'x-internal-key': import.meta.env.VITE_INTERNAL_KEY || '',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }))
    throw new Error(error.error?.message || `HTTP ${response.status}`)
  }
  return response.json()
}

// ── LPCOs ─────────────────────────────────────────────────────────────────────

export const lpcoApi = {
  listar: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<{ data: Lpco[]; total: number }>(`/api/v1/lpcos${query}`)
  },

  buscarPorId: (id: string) =>
    request<Lpco>(`/api/v1/lpcos/${id}`),

  criar: (data: Partial<Lpco>) =>
    request<Lpco>('/api/v1/lpcos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<Lpco>) =>
    request<Lpco>(`/api/v1/lpcos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  registrar: (id: string) =>
    request<Lpco>(`/api/v1/lpcos/${id}/registrar`, { method: 'POST' }),

  cancelar: (id: string, motivo: string) =>
    request<Lpco>(`/api/v1/lpcos/${id}/cancelar`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    }),

  atualizarStatus: (id: string, status: string) =>
    request<Lpco>(`/api/v1/lpcos/${id}/atualizar-status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  duplicar: (id: string) =>
    request<Lpco>(`/api/v1/lpcos/${id}/duplicar`, { method: 'POST' }),

  stats: (periodo?: string) => {
    const query = periodo ? `?periodo=${periodo}` : ''
    return request<Record<string, number>>(`/api/v1/lpcos/stats${query}`)
  },

  prefillPedido: (pedidoId: string) =>
    request<Partial<Lpco>>(`/api/v1/lpcos/prefill/pedido/${pedidoId}`),
}

// ── Itens ─────────────────────────────────────────────────────────────────────

export const lpcoItemApi = {
  listar: (lpcoId: string) =>
    request<LpcoItem[]>(`/api/v1/lpcos/${lpcoId}/itens`),

  adicionar: (lpcoId: string, data: Partial<LpcoItem>) =>
    request<LpcoItem>(`/api/v1/lpcos/${lpcoId}/itens`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (lpcoId: string, itemId: string, data: Partial<LpcoItem>) =>
    request<LpcoItem>(`/api/v1/lpcos/${lpcoId}/itens/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remover: (lpcoId: string, itemId: string) =>
    request<void>(`/api/v1/lpcos/${lpcoId}/itens/${itemId}`, { method: 'DELETE' }),
}

// ── Exigencias ────────────────────────────────────────────────────────────────

export const lpcoExigenciaApi = {
  listar: (lpcoId: string) =>
    request<LpcoExigencia[]>(`/api/v1/lpcos/${lpcoId}/exigencias`),

  registrar: (lpcoId: string, data: Partial<LpcoExigencia>) =>
    request<LpcoExigencia>(`/api/v1/lpcos/${lpcoId}/exigencias`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  responder: (lpcoId: string, exId: string, resposta: string) =>
    request<LpcoExigencia>(`/api/v1/lpcos/${lpcoId}/exigencias/${exId}/responder`, {
      method: 'POST',
      body: JSON.stringify({ resposta }),
    }),
}

// ── Vinculos ──────────────────────────────────────────────────────────────────

export const lpcoVinculoApi = {
  listar: (lpcoId: string) =>
    request<LpcoVinculo[]>(`/api/v1/lpcos/${lpcoId}/vinculos`),

  criar: (lpcoId: string, data: Partial<LpcoVinculo>) =>
    request<LpcoVinculo>(`/api/v1/lpcos/${lpcoId}/vinculos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancelar: (lpcoId: string, vincId: string) =>
    request<void>(`/api/v1/lpcos/${lpcoId}/vinculos/${vincId}`, { method: 'DELETE' }),

  saldo: (lpcoId: string) =>
    request<{ disponivel: number; deferida: number; vinculada: number }>(`/api/v1/lpcos/${lpcoId}/saldo`),
}

// ── Smart Read ────────────────────────────────────────────────────────────────

export const smartReadApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('documento', file)
    return request<{ jobId: string }>('/api/v1/lpcos/smart-read', {
      method: 'POST',
      headers: {
        'x-id-organizacao': context.tenantId,
        'x-id-usuario': context.userId,
        'x-internal-key': import.meta.env.VITE_INTERNAL_KEY || '',
      },
      body: formData,
    })
  },

  resultado: (jobId: string) =>
    request<{ dados: Partial<Lpco>; confianca: Record<string, number> }>(`/api/v1/lpcos/smart-read/${jobId}`),
}

// ── Simulador TA ──────────────────────────────────────────────────────────────

export const simuladorApi = {
  simular: (ncm: string, operacao: 'IMPORTACAO' | 'EXPORTACAO') =>
    request<{ orgaos: Array<{ sigla: string; modelo: string; obrigatorio: boolean }> }>(
      `/api/v1/simulacoes-tratamento-administrativo?ncm=${ncm}&operacao=${operacao}`
    ),
}

// ── Portal Unico ──────────────────────────────────────────────────────────────

export const portalUnicoApi = {
  registrar: (lpcoId: string) =>
    request<{ lpco: Lpco; portal: { numero: string; situacao: string } }>(`/api/v1/lpcos/${lpcoId}/portal/registrar`, { method: 'POST' }),

  sincronizar: (lpcoId: string) =>
    request<{ lpco: Lpco; sincronizado: boolean; status_alterado: boolean }>(`/api/v1/lpcos/${lpcoId}/portal/sincronizar`),

  retificar: (lpcoId: string, payload: Partial<Lpco>) =>
    request<{ sucesso: boolean }>(`/api/v1/lpcos/${lpcoId}/portal/retificar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancelarPortal: (lpcoId: string, motivo: string) =>
    request<{ sucesso: boolean; lpco: Lpco }>(`/api/v1/lpcos/${lpcoId}/portal/cancelar`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    }),

  responderExigenciaPortal: (lpcoId: string, exId: string, resposta: string) =>
    request<{ sucesso: boolean }>(`/api/v1/lpcos/${lpcoId}/portal/exigencia/${exId}/responder`, {
      method: 'POST',
      body: JSON.stringify({ resposta }),
    }),
}

// ── Credenciais Siscomex ─────────────────────────────────────────────────────

interface CredencialResumo {
  id: string
  tenant_id: string
  company_id: string
  tipo_auth: string
  certificado_cn: string | null
  certificado_validade: string | null
  oauth_client_id: string | null
  oauth_scope: string | null
  ultimo_uso: string | null
  status: string
  created_at: string
}

export const credenciaisApi = {
  listar: (companyId?: string) => {
    const query = companyId ? `?company_id=${companyId}` : ''
    return request<{ data: CredencialResumo[] }>(`/api/v1/credenciais-portal-unico${query}`)
  },

  criar: (data: Record<string, unknown>) =>
    request<{ id: string; tipo_auth: string; status: string }>('/api/v1/credenciais-portal-unico', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Record<string, unknown>) =>
    request<{ sucesso: boolean }>(`/api/v1/credenciais-portal-unico/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  revogar: (id: string) =>
    request<{ sucesso: boolean }>(`/api/v1/credenciais-portal-unico/${id}`, { method: 'DELETE' }),

  testar: (id: string) =>
    request<{ sucesso: boolean; metodo?: string; pode_escrita?: boolean; erro?: string }>(
      `/api/v1/credenciais-portal-unico/${id}/testar`,
      { method: 'POST' }
    ),
}

// ── Importacao Planilha ───────────────────────────────────────────────────────

export const importacaoApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('arquivo', file)
    return request<{ jobId: string; preview: Partial<Lpco>[]; total: number }>('/api/v1/lpcos/import/planilha', {
      method: 'POST',
      headers: {
        'x-id-organizacao': context.tenantId,
        'x-id-usuario': context.userId,
        'x-internal-key': import.meta.env.VITE_INTERNAL_KEY || '',
      },
      body: formData,
    })
  },

  template: () => request<Blob>('/api/v1/lpcos/import/template'),
}
