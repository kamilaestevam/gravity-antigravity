/**
 * api.ts — Client API para o produto NF Importacao
 *
 * Comunica com o backend via proxy Vite -> :8028
 */

import type {
  NFImportacao,
  NFImportacaoItens,
  NFImportacaoDespesas,
  NFImportacaoRateio,
  NFImportacaoAnexo,
  NFImportacaoHistorico,
  NFImportacaoTipoDespesa,
  NFImportacaoTemplates,
  NFImportacaoExportarLayout,
  NFImportacaoFiscaisFavoritos,
  RateioPreviewResult,
} from './types'

// ── Context ─────────────────────────────────────────────────────────────────

let context = { tenantId: '', userId: '' }

export function setApiContext(ctx: { tenantId: string; userId: string }): void {
  context = ctx
}

// ── Request Helper ──────────────────────────────────────────────────────────

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

// ── NFs ─────────────────────────────────────────────────────────────────────

export const nfApi = {
  listar: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<{ data: NFImportacao[]; total: number }>(`/api/v1/nf-importacao${query}`)
  },

  buscarPorId: (id: string) =>
    request<NFImportacao>(`/api/v1/nf-importacao/${id}`),

  criar: (data: Partial<NFImportacao>) =>
    request<NFImportacao>('/api/v1/nf-importacao', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<NFImportacao>) =>
    request<NFImportacao>(`/api/v1/nf-importacao/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  cancelar: (id: string) =>
    request<void>(`/api/v1/nf-importacao/${id}`, { method: 'DELETE' }),

  duplicar: (id: string) =>
    request<NFImportacao>(`/api/v1/nf-importacao/${id}/duplicar`, { method: 'POST' }),
}

// ── Importacao (canais de entrada) ──────────────────────────────────────────

export const importarApi = {
  xml: (file: File) => {
    const formData = new FormData()
    formData.append('arquivo', file)
    return request<NFImportacao>('/api/v1/nf-importacao/importar/xml', {
      method: 'POST',
      headers: {
        'x-id-organizacao': context.tenantId,
        'x-id-usuario': context.userId,
        'x-internal-key': import.meta.env.VITE_INTERNAL_KEY || '',
      },
      body: formData,
    })
  },

  smartRead: (file: File) => {
    const formData = new FormData()
    formData.append('arquivo', file)
    return request<{ preview: Partial<NFImportacao>; confianca: Record<string, number> }>('/api/v1/nf-importacao/importar/smart-read', {
      method: 'POST',
      headers: {
        'x-id-organizacao': context.tenantId,
        'x-id-usuario': context.userId,
        'x-internal-key': import.meta.env.VITE_INTERNAL_KEY || '',
      },
      body: formData,
    })
  },

  portalUnico: (duimpNumero: string) =>
    request<NFImportacao>('/api/v1/nf-importacao/importar/portal-unico', {
      method: 'POST',
      body: JSON.stringify({ duimp_numero: duimpNumero }),
    }),

  processo: (processoId: string) =>
    request<NFImportacao>(`/api/v1/nf-importacao/importar/processo/${processoId}`, {
      method: 'POST',
    }),
}

// ── Itens ───────────────────────────────────────────────────────────────────

export const itemApi = {
  listar: (nfId: string) =>
    request<NFImportacaoItens[]>(`/api/v1/nf-importacao/${nfId}/itens`),

  adicionar: (nfId: string, data: Partial<NFImportacaoItens>) =>
    request<NFImportacaoItens>(`/api/v1/nf-importacao/${nfId}/itens`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (nfId: string, itemId: string, data: Partial<NFImportacaoItens>) =>
    request<NFImportacaoItens>(`/api/v1/nf-importacao/${nfId}/itens/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remover: (nfId: string, itemId: string) =>
    request<void>(`/api/v1/nf-importacao/${nfId}/itens/${itemId}`, { method: 'DELETE' }),
}

// ── Despesas ────────────────────────────────────────────────────────────────

export const despesaApi = {
  listar: (nfId: string) =>
    request<NFImportacaoDespesas[]>(`/api/v1/nf-importacao/${nfId}/despesas`),

  adicionar: (nfId: string, data: Partial<NFImportacaoDespesas>) =>
    request<NFImportacaoDespesas>(`/api/v1/nf-importacao/${nfId}/despesas`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (nfId: string, despesaId: string, data: Partial<NFImportacaoDespesas>) =>
    request<NFImportacaoDespesas>(`/api/v1/nf-importacao/${nfId}/despesas/${despesaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remover: (nfId: string, despesaId: string) =>
    request<void>(`/api/v1/nf-importacao/${nfId}/despesas/${despesaId}`, { method: 'DELETE' }),

  smartRead: (nfId: string, file: File) => {
    const formData = new FormData()
    formData.append('arquivo', file)
    return request<NFImportacaoDespesas[]>(`/api/v1/nf-importacao/${nfId}/despesas/smart-read`, {
      method: 'POST',
      headers: {
        'x-id-organizacao': context.tenantId,
        'x-id-usuario': context.userId,
        'x-internal-key': import.meta.env.VITE_INTERNAL_KEY || '',
      },
      body: formData,
    })
  },

  aplicarTemplate: (nfId: string, templateId: string) =>
    request<NFImportacaoDespesas[]>(`/api/v1/nf-importacao/${nfId}/despesas/aplicar-template`, {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId }),
    }),
}

// ── Rateio ──────────────────────────────────────────────────────────────────

export const rateioApi = {
  preview: (nfId: string) =>
    request<RateioPreviewResult>(`/api/v1/nf-importacao/${nfId}/rateio/preview`, {
      method: 'POST',
    }),

  aplicar: (nfId: string) =>
    request<NFImportacaoRateio[]>(`/api/v1/nf-importacao/${nfId}/rateio/aplicar`, {
      method: 'POST',
    }),

  override: (nfId: string, rateioId: string, valor: number) =>
    request<NFImportacaoRateio>(`/api/v1/nf-importacao/${nfId}/rateio/${rateioId}`, {
      method: 'PUT',
      body: JSON.stringify({ valor_rateado: valor }),
    }),
}

// ── Exportacao ──────────────────────────────────────────────────────────────

export const exportacaoApi = {
  gerar: (nfId: string, formato: string, layoutId?: string) =>
    request<{ url: string; nome_arquivo: string }>(`/api/v1/nf-importacao/${nfId}/exportar`, {
      method: 'POST',
      body: JSON.stringify({ formato, layout_id: layoutId }),
    }),

  preview: (nfId: string, formato: string, layoutId?: string) => {
    const params = new URLSearchParams({ formato })
    if (layoutId) params.set('layout_id', layoutId)
    return request<{ conteudo: string; linhas: number }>(`/api/v1/nf-importacao/${nfId}/exportar/preview?${params}`)
  },
}

// ── Config: Catalogo ────────────────────────────────────────────────────────

export const catalogoApi = {
  listar: () =>
    request<NFImportacaoTipoDespesa[]>('/api/v1/nf-importacao/config/despesas'),

  criar: (data: Partial<NFImportacaoTipoDespesa>) =>
    request<NFImportacaoTipoDespesa>('/api/v1/nf-importacao/config/despesas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<NFImportacaoTipoDespesa>) =>
    request<NFImportacaoTipoDespesa>(`/api/v1/nf-importacao/config/despesas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remover: (id: string) =>
    request<void>(`/api/v1/nf-importacao/config/despesas/${id}`, { method: 'DELETE' }),
}

// ── Config: Templates ───────────────────────────────────────────────────────

export const templateApi = {
  listar: () =>
    request<NFImportacaoTemplates[]>('/api/v1/nf-importacao/config/templates'),

  criar: (data: Partial<NFImportacaoTemplates>) =>
    request<NFImportacaoTemplates>('/api/v1/nf-importacao/config/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<NFImportacaoTemplates>) =>
    request<NFImportacaoTemplates>(`/api/v1/nf-importacao/config/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remover: (id: string) =>
    request<void>(`/api/v1/nf-importacao/config/templates/${id}`, { method: 'DELETE' }),
}

// ── Config: Layouts ─────────────────────────────────────────────────────────

export const layoutApi = {
  listar: () =>
    request<NFImportacaoExportarLayout[]>('/api/v1/nf-importacao/config/layouts'),

  criar: (data: Partial<NFImportacaoExportarLayout>) =>
    request<NFImportacaoExportarLayout>('/api/v1/nf-importacao/config/layouts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<NFImportacaoExportarLayout>) =>
    request<NFImportacaoExportarLayout>(`/api/v1/nf-importacao/config/layouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remover: (id: string) =>
    request<void>(`/api/v1/nf-importacao/config/layouts/${id}`, { method: 'DELETE' }),
}

// ── Config: Favoritos Fiscais ───────────────────────────────────────────────

export const favoritoApi = {
  listar: () =>
    request<NFImportacaoFiscaisFavoritos[]>('/api/v1/nf-importacao/config/favoritos-fiscais'),

  criar: (data: Partial<NFImportacaoFiscaisFavoritos>) =>
    request<NFImportacaoFiscaisFavoritos>('/api/v1/nf-importacao/config/favoritos-fiscais', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<NFImportacaoFiscaisFavoritos>) =>
    request<NFImportacaoFiscaisFavoritos>(`/api/v1/nf-importacao/config/favoritos-fiscais/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remover: (id: string) =>
    request<void>(`/api/v1/nf-importacao/config/favoritos-fiscais/${id}`, { method: 'DELETE' }),
}

// ── Documentos ──────────────────────────────────────────────────────────────

export const documentoApi = {
  listar: (nfId: string) =>
    request<NFImportacaoAnexo[]>(`/api/v1/nf-importacao/${nfId}/documentos`),

  upload: (nfId: string, file: File, tipo: string) => {
    const formData = new FormData()
    formData.append('arquivo', file)
    formData.append('tipo', tipo)
    return request<NFImportacaoAnexo>(`/api/v1/nf-importacao/${nfId}/documentos`, {
      method: 'POST',
      headers: {
        'x-id-organizacao': context.tenantId,
        'x-id-usuario': context.userId,
        'x-internal-key': import.meta.env.VITE_INTERNAL_KEY || '',
      },
      body: formData,
    })
  },

  remover: (nfId: string, docId: string) =>
    request<void>(`/api/v1/nf-importacao/${nfId}/documentos/${docId}`, { method: 'DELETE' }),
}

// ── Historico ───────────────────────────────────────────────────────────────

export const historicoApi = {
  listar: (nfId: string) =>
    request<NFImportacaoHistorico[]>(`/api/v1/nf-importacao/${nfId}/historico`),
}
