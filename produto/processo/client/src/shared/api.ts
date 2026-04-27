/**
 * api.ts — Funções de chamada da API do Processo
 * Skill: antigravity-criar-produto (Passo 1 — shared/api.ts)
 */

import type {
  Processo,
  ProcessoDetail,
  FollowUp,
  Documento,
  CreateProcessoInput,
  CreateFollowUpInput,
  UploadDocumentoInput,
  FilterFollowUp,
  PedidoRico,
  PedidoItemRico,
  PedidoStatusConfig,
  PedidoColunaConfig,
  PedidoPreferencias,
  PedidosListResponse,
} from './types'

const API_BASE = '/api/v1'

const headers = (tenantId: string) => ({
  'Content-Type': 'application/json',
  'x-tenant-id': tenantId,
  'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY ?? 'dev-key',
})

// ─── Processos ──────────────────────────────────────────────────────────────

export async function getProcessos(tenantId: string): Promise<Processo[]> {
  const res = await fetch(`${API_BASE}/processos`, {
    headers: headers(tenantId),
  })
  if (!res.ok) return []
  return res.json()
}

export async function getProcesso(tenantId: string, id: string): Promise<ProcessoDetail> {
  const res = await fetch(`${API_BASE}/processos/${id}?include=etapas,pedidos,followUps,documentos,estimativasCusto,dadosTecnicos`, {
    headers: headers(tenantId),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao buscar processo`)
  }
  return res.json()
}

export async function createProcesso(tenantId: string, data: CreateProcessoInput): Promise<Processo> {
  const res = await fetch(`${API_BASE}/processos`, {
    method: 'POST',
    headers: headers(tenantId),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao criar processo`)
  }
  return res.json()
}

export async function updateProcesso(tenantId: string, id: string, data: Partial<CreateProcessoInput>): Promise<Processo> {
  const res = await fetch(`${API_BASE}/processos/${id}`, {
    method: 'PATCH',
    headers: headers(tenantId),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao atualizar processo`)
  }
  return res.json()
}

// ─── Follow-ups ─────────────────────────────────────────────────────────────

export async function getFollowUps(
  tenantId: string,
  processoId: string,
  filters?: FilterFollowUp
): Promise<FollowUp[]> {
  const params = new URLSearchParams()
  if (filters?.tipo) params.set('tipo', filters.tipo)
  if (filters?.categoria) params.set('categoria', filters.categoria)
  const qs = params.toString() ? `?${params.toString()}` : ''

  const res = await fetch(`${API_BASE}/processos/${processoId}/follow-ups${qs}`, {
    headers: headers(tenantId),
  })
  if (!res.ok) return []
  return res.json()
}

export async function createFollowUp(
  tenantId: string,
  processoId: string,
  data: CreateFollowUpInput
): Promise<FollowUp> {
  const res = await fetch(`${API_BASE}/processos/${processoId}/follow-ups`, {
    method: 'POST',
    headers: headers(tenantId),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao criar follow-up`)
  }
  return res.json()
}

// ─── Documentos ─────────────────────────────────────────────────────────────

export async function getDocumentos(tenantId: string, processoId: string): Promise<Documento[]> {
  const res = await fetch(`${API_BASE}/processos/${processoId}/documentos`, {
    headers: headers(tenantId),
  })
  if (!res.ok) return []
  return res.json()
}

export async function uploadDocumento(
  tenantId: string,
  processoId: string,
  data: UploadDocumentoInput
): Promise<Documento> {
  const formData = new FormData()
  formData.append('tipo', data.tipo)
  formData.append('nome', data.nome)
  formData.append('arquivo', data.arquivo)
  if (data.observacoes) formData.append('observacoes', data.observacoes)

  const res = await fetch(`${API_BASE}/processos/${processoId}/documentos`, {
    method: 'POST',
    headers: {
      'x-tenant-id': tenantId,
      'x-internal-key': import.meta.env.VITE_INTERNAL_SERVICE_KEY ?? 'dev-key',
    },
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao enviar documento`)
  }
  return res.json()
}

export async function deleteDocumento(tenantId: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documentos-processo/${id}`, {
    method: 'DELETE',
    headers: headers(tenantId),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao excluir documento`)
  }
}

// ─── Pedidos (novo — TabelaVirtualGlobal) ───────────────────────────────────

export async function getPedidos(
  tenantId: string,
  params: {
    cursor?: string
    sort?: string
    dir?: 'asc' | 'desc'
    limit?: number
    status?: string
    busca?: string
  } = {}
): Promise<PedidosListResponse> {
  const qs = new URLSearchParams()
  if (params.cursor) qs.set('cursor', params.cursor)
  if (params.sort) qs.set('sort', params.sort)
  if (params.dir) qs.set('dir', params.dir)
  if (params.limit !== undefined) qs.set('limit', String(params.limit))
  if (params.status) qs.set('status', params.status)
  if (params.busca) qs.set('busca', params.busca)
  const query = qs.toString() ? `?${qs.toString()}` : ''
  const res = await fetch(`${API_BASE}/pedidos${query}`, {
    headers: headers(tenantId),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao listar pedidos`)
  }
  return res.json()
}

export async function getPedidoItens(
  tenantId: string,
  pedidoId: string
): Promise<PedidoItemRico[]> {
  const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/itens`, {
    headers: headers(tenantId),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao buscar itens do pedido`)
  }
  return res.json()
}

export async function editarCampoPedido(
  tenantId: string,
  pedidoId: string,
  campo: string,
  valor: unknown
): Promise<PedidoRico> {
  const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/${campo}`, {
    method: 'PATCH',
    headers: headers(tenantId),
    body: JSON.stringify({ campo, valor }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao editar pedido`)
  }
  return res.json()
}

export async function getPedidosStatus(tenantId: string): Promise<PedidoStatusConfig[]> {
  const res = await fetch(`${API_BASE}/pedidos/config/status`, {
    headers: headers(tenantId),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao buscar status de pedidos`)
  }
  return res.json()
}

export async function getPedidosColunas(tenantId: string): Promise<PedidoColunaConfig[]> {
  const res = await fetch(`${API_BASE}/pedidos/config/colunas`, {
    headers: headers(tenantId),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao buscar colunas de pedidos`)
  }
  return res.json()
}

export async function getPreferenciasUsuario(
  tenantId: string,
  userId: string
): Promise<PedidoPreferencias | null> {
  const res = await fetch(`${API_BASE}/pedidos/config/preferencias/usuario?user_id=${encodeURIComponent(userId)}`, {
    headers: headers(tenantId),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao buscar preferências do usuário`)
  }
  return res.json()
}

export async function salvarPreferenciasUsuario(
  tenantId: string,
  userId: string,
  prefs: PedidoPreferencias
): Promise<void> {
  const res = await fetch(`${API_BASE}/pedidos/config/preferencias/usuario`, {
    method: 'POST',
    headers: headers(tenantId),
    body: JSON.stringify({ user_id: userId, ...prefs }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao salvar preferências`)
  }
}

export async function mudarStatusLotePreview(
  tenantId: string,
  ids: string[],
  statusNovo: string
): Promise<{ total: number; afetados: PedidoRico[]; bloqueados: { id: string; numero: string; motivo: string }[] }> {
  const res = await fetch(`${API_BASE}/pedidos/lote/status/preview`, {
    method: 'POST',
    headers: headers(tenantId),
    body: JSON.stringify({ ids, status_novo: statusNovo }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao pré-visualizar mudança de status em lote`)
  }
  return res.json()
}

export async function mudarStatusLoteConfirmar(
  tenantId: string,
  ids: string[],
  statusNovo: string
): Promise<{ sucesso: number; erros: { id: string; motivo: string }[] }> {
  const res = await fetch(`${API_BASE}/pedidos/lote/status/confirmar`, {
    method: 'POST',
    headers: headers(tenantId),
    body: JSON.stringify({ ids, status_novo: statusNovo }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao confirmar mudança de status em lote`)
  }
  return res.json()
}

export async function exportarPedidos(
  tenantId: string,
  ids: string[],
  formato: 'csv' | 'xlsx' | 'json'
): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/pedidos/lote/exportar`, {
    method: 'POST',
    headers: headers(tenantId),
    body: JSON.stringify({ ids, formato }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao exportar pedidos`)
  }
  return res.json()
}
