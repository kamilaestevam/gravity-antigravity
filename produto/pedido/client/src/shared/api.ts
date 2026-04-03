/**
 * api.ts — Client API para o produto Pedido
 *
 * Comunica com o backend via processos-core (proxy Vite -> :8025)
 */

import type {
  Pedido,
  PedidoItem,
  PedidosListResponse,
  PedidoStatusConfig,
  PedidoColunaConfig,
  PedidoPreferenciasColunas,
} from './types'

let context = { tenantId: '', userId: '' }

export function setApiContext(ctx: { tenantId: string; userId: string }): void {
  context = ctx
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': context.tenantId,
      'x-user-id': context.userId,
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

// ── Pedidos ───────────────────────────────────────────────────────────────────

export const pedidoApi = {
  listar: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<{ data: Pedido[]; total: number }>(`/api/v1/pedidos${query}`)
  },

  buscarPorId: (id: string) =>
    request<Pedido>(`/api/v1/pedidos/${id}`),

  criar: (data: Partial<Pedido>) =>
    request<Pedido>('/api/v1/pedidos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<Pedido>) =>
    request<Pedido>(`/api/v1/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletar: (id: string) =>
    request<void>(`/api/v1/pedidos/${id}`, { method: 'DELETE' }),

  alterarStatus: (id: string, status: string) =>
    request<Pedido>(`/api/v1/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  duplicar: (id: string) =>
    request<Pedido>(`/api/v1/pedidos/${id}/duplicar`, { method: 'POST' }),
}

// ── Itens do Pedido ───────────────────────────────────────────────────────────

export const pedidoItemApi = {
  adicionar: (pedidoId: string, data: Partial<PedidoItem>) =>
    request<PedidoItem>(`/api/v1/pedidos/${pedidoId}/itens`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (pedidoId: string, itemId: string, data: Partial<PedidoItem>) =>
    request<PedidoItem>(`/api/v1/pedidos/${pedidoId}/itens/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remover: (pedidoId: string, itemId: string) =>
    request<void>(`/api/v1/pedidos/${pedidoId}/itens/${itemId}`, { method: 'DELETE' }),

  cancelarQuantidade: (pedidoId: string, itemId: string, quantidade: number) =>
    request<PedidoItem>(`/api/v1/pedidos/${pedidoId}/itens/${itemId}/cancelar`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade }),
    }),

  atualizarPronta: (pedidoId: string, itemId: string, quantidade: number) =>
    request<PedidoItem>(`/api/v1/pedidos/${pedidoId}/itens/${itemId}/pronta`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade_pronta: quantidade }),
    }),
}

// ── Cursor pagination + inline edit ───────────────────────────────────────────

export const pedidoVirtualApi = {
  /** Listagem com cursor keyset — para TabelaVirtualGlobal */
  listar: (params: {
    cursor?: string
    sort?: string
    dir?: 'asc' | 'desc'
    limit?: number
    status?: string
    busca?: string
  } = {}) => {
    const q = new URLSearchParams()
    if (params.cursor) q.set('cursor', params.cursor)
    if (params.sort)   q.set('sort', params.sort)
    if (params.dir)    q.set('dir', params.dir)
    if (params.limit)  q.set('limit', String(params.limit))
    if (params.status) q.set('status', params.status)
    if (params.busca)  q.set('busca', params.busca)
    return request<PedidosListResponse>(`/api/v1/pedidos?${q}`)
  },

  /** Edição inline de um campo com optimistic lock (lança em 409) */
  editarCampo: (id: string, campo: string, valor: unknown, version?: number) =>
    request<Pedido>(`/api/v1/pedidos/${id}/campo`, {
      method: 'PATCH',
      body: JSON.stringify({ campo, valor, version }),
    }),
}

// ── Configuração de status e colunas ──────────────────────────────────────────

export const pedidoConfigApi = {
  listarStatus: () =>
    request<{ data: PedidoStatusConfig[] }>('/api/v1/pedidos/config/status'),

  listarColunas: () =>
    request<{ data: PedidoColunaConfig[] }>('/api/v1/pedidos/config/colunas'),

  getPreferenciasUsuario: () =>
    request<PedidoPreferenciasColunas>('/api/v1/pedidos/config/preferencias-usuario'),

  salvarPreferenciasUsuario: (prefs: PedidoPreferenciasColunas) =>
    request<PedidoPreferenciasColunas>('/api/v1/pedidos/config/preferencias-usuario', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    }),
}

// ── Ações em lote ─────────────────────────────────────────────────────────────

export const pedidoLoteApi = {
  mudarStatusPreview: (ids: string[], novoStatus: string) =>
    request<{ total: number; afetados: { id: string; numero_pedido: string; status: string }[]; bloqueados: { id: string; numero: string; motivo: string }[] }>(
      '/api/v1/pedidos/lote/status/preview',
      { method: 'POST', body: JSON.stringify({ ids, status_novo: novoStatus }) }
    ),

  mudarStatusConfirmar: (ids: string[], novoStatus: string) =>
    request<{ sucesso: number; erros: { id: string; motivo: string }[] }>('/api/v1/pedidos/lote/status/confirmar', {
      method: 'POST',
      body: JSON.stringify({ ids, status_novo: novoStatus }),
    }),

  cancelarPreview: (ids: string[]) =>
    request<{ total: number; afetados: number; resumo: string[] }>(
      '/api/v1/pedidos/lote/cancelar/preview',
      { method: 'POST', body: JSON.stringify({ ids }) }
    ),

  cancelarConfirmar: (ids: string[]) =>
    request<{ cancelados: number }>('/api/v1/pedidos/lote/cancelar/confirmar', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  exportar: (ids: string[], formato: 'csv' | 'excel' = 'csv') =>
    request<{ url: string; total: number }>('/api/v1/pedidos/lote/exportar', {
      method: 'POST',
      body: JSON.stringify({ ids, formato }),
    }),
}

// ── Importacao ────────────────────────────────────────────────────────────────

export const importacaoApi = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('arquivo', file)
    return request<{ preview: Partial<Pedido>[]; total: number }>('/api/v1/pedidos/importar', {
      method: 'POST',
      headers: {
        'x-tenant-id': context.tenantId,
        'x-user-id': context.userId,
        'x-internal-key': import.meta.env.VITE_INTERNAL_KEY || '',
      },
      body: formData,
    })
  },

  confirmar: (pedidos: Partial<Pedido>[]) =>
    request<{ criados: number }>('/api/v1/pedidos/importar/confirmar', {
      method: 'POST',
      body: JSON.stringify({ pedidos }),
    }),
}

// ── Exportacao ────────────────────────────────────────────────────────────────

export const exportacaoApi = {
  exportar: (formato: 'csv' | 'excel', filtros?: Record<string, string>) =>
    request<Blob>('/api/v1/pedidos/exportar', {
      method: 'POST',
      body: JSON.stringify({ formato, filtros }),
    }),
}
