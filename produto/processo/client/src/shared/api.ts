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
  const res = await fetch(`${API_BASE}/documentos/${id}`, {
    method: 'DELETE',
    headers: headers(tenantId),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Erro ${res.status} ao excluir documento`)
  }
}
