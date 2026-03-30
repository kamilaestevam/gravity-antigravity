/**
 * api.ts — Client API para o produto Pedido
 *
 * Comunica com o backend via processos-core (proxy Vite -> :8025)
 */

import type { Pedido, PedidoItem } from './types'

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
