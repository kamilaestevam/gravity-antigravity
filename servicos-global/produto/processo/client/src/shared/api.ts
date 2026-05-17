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

const headers = (idOrganizacao: string) => ({
  'Content-Type': 'application/json',
  'x-id-organizacao': idOrganizacao,
  'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
})

// ─── Processos ──────────────────────────────────────────────────────────────

export async function getProcessos(idOrganizacao: string): Promise<Processo[]> {
  const res = await fetch(`${API_BASE}/processos`, {
    headers: headers(idOrganizacao),
  })
  if (!res.ok) return []
  return res.json()
}

export async function getProcesso(idOrganizacao: string, id: string): Promise<ProcessoDetail> {
  const res = await fetch(`${API_BASE}/processos/${id}?include=etapas,pedidos,followUps,documentos,estimativasCusto,dadosTecnicos`, {
    headers: headers(idOrganizacao),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao buscar processo`)
  }
  return res.json()
}

export async function createProcesso(idOrganizacao: string, data: CreateProcessoInput): Promise<Processo> {
  const res = await fetch(`${API_BASE}/processos`, {
    method: 'POST',
    headers: headers(idOrganizacao),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao criar processo`)
  }
  return res.json()
}

export async function updateProcesso(idOrganizacao: string, id: string, data: Partial<CreateProcessoInput>): Promise<Processo> {
  const res = await fetch(`${API_BASE}/processos/${id}`, {
    method: 'PATCH',
    headers: headers(idOrganizacao),
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
  idOrganizacao: string,
  processoId: string,
  filters?: FilterFollowUp
): Promise<FollowUp[]> {
  const params = new URLSearchParams()
  if (filters?.tipo) params.set('tipo', filters.tipo)
  if (filters?.categoria) params.set('categoria', filters.categoria)
  const qs = params.toString() ? `?${params.toString()}` : ''

  const res = await fetch(`${API_BASE}/processos/${processoId}/follow-ups${qs}`, {
    headers: headers(idOrganizacao),
  })
  if (!res.ok) return []
  return res.json()
}

export async function createFollowUp(
  idOrganizacao: string,
  processoId: string,
  data: CreateFollowUpInput
): Promise<FollowUp> {
  const res = await fetch(`${API_BASE}/processos/${processoId}/follow-ups`, {
    method: 'POST',
    headers: headers(idOrganizacao),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao criar follow-up`)
  }
  return res.json()
}

// ─── Documentos ─────────────────────────────────────────────────────────────

export async function getDocumentos(idOrganizacao: string, processoId: string): Promise<Documento[]> {
  const res = await fetch(`${API_BASE}/processos/${processoId}/documentos`, {
    headers: headers(idOrganizacao),
  })
  if (!res.ok) return []
  return res.json()
}

export async function uploadDocumento(
  idOrganizacao: string,
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
      'x-id-organizacao': idOrganizacao,
      'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
    },
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao enviar documento`)
  }
  return res.json()
}

export async function deleteDocumento(idOrganizacao: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documentos-processo/${id}`, {
    method: 'DELETE',
    headers: headers(idOrganizacao),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao excluir documento`)
  }
}

// ─── Pedidos (novo — TabelaVirtualGlobal) ───────────────────────────────────

export async function getPedidos(
  idOrganizacao: string,
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
    headers: headers(idOrganizacao),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao listar pedidos`)
  }
  return res.json()
}

export async function getPedidoItens(
  idOrganizacao: string,
  pedidoId: string
): Promise<PedidoItemRico[]> {
  const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/itens`, {
    headers: headers(idOrganizacao),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao buscar itens do pedido`)
  }
  return res.json()
}

export async function editarCampoPedido(
  idOrganizacao: string,
  pedidoId: string,
  campo: string,
  valor: unknown
): Promise<PedidoRico> {
  const res = await fetch(`${API_BASE}/pedidos/${pedidoId}/${campo}`, {
    method: 'PATCH',
    headers: headers(idOrganizacao),
    body: JSON.stringify({ campo, valor }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao editar pedido`)
  }
  return res.json()
}

export async function getPedidosStatus(idOrganizacao: string): Promise<PedidoStatusConfig[]> {
  const res = await fetch(`${API_BASE}/pedidos/config/status`, {
    headers: headers(idOrganizacao),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao buscar status de pedidos`)
  }
  return res.json()
}

export async function getPedidosColunas(idOrganizacao: string): Promise<PedidoColunaConfig[]> {
  const res = await fetch(`${API_BASE}/pedidos/config/colunas`, {
    headers: headers(idOrganizacao),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao buscar colunas de pedidos`)
  }
  return res.json()
}

export async function getPreferenciasUsuario(
  idOrganizacao: string,
  userId: string
): Promise<PedidoPreferencias | null> {
  const res = await fetch(`${API_BASE}/pedidos/config/preferencias/usuario?user_id=${encodeURIComponent(userId)}`, {
    headers: headers(idOrganizacao),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao buscar preferências do usuário`)
  }
  return res.json()
}

export async function salvarPreferenciasUsuario(
  idOrganizacao: string,
  userId: string,
  prefs: PedidoPreferencias
): Promise<void> {
  const res = await fetch(`${API_BASE}/pedidos/config/preferencias/usuario`, {
    method: 'POST',
    headers: headers(idOrganizacao),
    body: JSON.stringify({ user_id: userId, ...prefs }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao salvar preferências`)
  }
}

export async function mudarStatusLotePreview(
  idOrganizacao: string,
  ids: string[],
  statusNovo: string
): Promise<{ total: number; afetados: PedidoRico[]; bloqueados: { id: string; numero: string; motivo: string }[] }> {
  const res = await fetch(`${API_BASE}/pedidos/lote/status/preview`, {
    method: 'POST',
    headers: headers(idOrganizacao),
    body: JSON.stringify({ ids, status_novo: statusNovo }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao pré-visualizar mudança de status em lote`)
  }
  return res.json()
}

export async function mudarStatusLoteConfirmar(
  idOrganizacao: string,
  ids: string[],
  statusNovo: string
): Promise<{ sucesso: number; erros: { id: string; motivo: string }[] }> {
  const res = await fetch(`${API_BASE}/pedidos/lote/status/confirmar`, {
    method: 'POST',
    headers: headers(idOrganizacao),
    body: JSON.stringify({ ids, status_novo: statusNovo }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao confirmar mudança de status em lote`)
  }
  return res.json()
}

export async function exportarPedidos(
  idOrganizacao: string,
  ids: string[],
  formato: 'csv' | 'xlsx' | 'json'
): Promise<unknown[]> {
  const res = await fetch(`${API_BASE}/pedidos/lote/exportar`, {
    method: 'POST',
    headers: headers(idOrganizacao),
    body: JSON.stringify({ ids, formato }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao exportar pedidos`)
  }
  return res.json()
}
