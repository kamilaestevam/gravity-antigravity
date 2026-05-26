/**
 * api.ts — Client API para o produto Pedido
 *
 * Comunica com o backend via processos-core (proxy Vite -> :8025)
 */

import {
  dashboardKpisSchema,
  dashboardBundleResponseSchema,
  dashboardTrendResponseSchema,
  dashboardDistributionResponseSchema,
  dashboardInsightsResponseSchema,
} from './dashboard-schemas.js'
import type {
  Pedido,
  PedidoItem,
  PedidosListResponse,
  PedidoStatusConfig,
  PedidoColunaConfig,
  PedidoPreferenciasColunas,
  PedidoPreferenciasColunasPut,
  ConsolidacaoPreview,
  ConsolidacaoPayload,
  CampoDivergente,
  CampoIgual,
  ItemConsolidado,
  TransferPayload,
  TransferPreview,
  TransferResultado,
  TransferHistorico,
  EdicaoMassaPayload,
  EdicaoMassaPreview,
  EdicaoMassaResultado,
  CampoEdicaoMassa,
  ColunaMapeada,
  SmartImportPreview,
  SmartImportConfirmar,
  SmartImportResultado,
  SmartImportLinha,
  SmartImportAlerta,
  DecisaoDuplicata,
  DuplicarPayload,
  DuplicarItemPayload,
  DuplicarResultado,
  ExcluirPreview,
  ExcluirResultado,
  Anexo,
  AnexoUploadResultado,
  TemplatePedido,
  GerarPdfPayload,
  GerarPdfResultado,
  TipoDocumentoGerar,
  IdiomaDocumento,
  GerarDocumentoPayload,
  ColunaUsuario,
  ValorColunaUsuario,
  CardUsuario,
} from './types'
import { MOCK_PEDIDOS_RESPONSE } from './mockData'
import { smartImportPreviewSchema } from '../../../shared/smart-import-schemas.js'

let context = { idOrganizacao: '', userId: '', userName: '', idWorkspace: '' }

const LS_TENANT_KEY = 'gravity:idOrganizacao'

function lsGet(): string {
  try { return localStorage.getItem(LS_TENANT_KEY) || '' } catch { return '' }
}
function lsSet(id: string): void {
  try { localStorage.setItem(LS_TENANT_KEY, id) } catch {}
}

// Getter dinâmico injetado pelo App.tsx — lê o Zustand no exato momento do request,
// eliminando a race condition entre useEffect do filho e useEffect do pai.
// Nunca importamos o store aqui para evitar circular dependency do Vite.
let getDynamicTenantId: () => string | undefined = () => undefined

export const injectTenantGetter = (fn: () => string | undefined): void => {
  getDynamicTenantId = () => {
    const live = fn()
    // Sempre que o store retorna um valor válido, persiste no context E no localStorage.
    // localStorage sobrevive a F5 — quando o Clerk ainda está carregando na próxima sessão,
    // o último idOrganizacao conhecido é recuperado sem race condition.
    if (live) {
      context.idOrganizacao = live
      lsSet(live)
    }
    return context.idOrganizacao || lsGet() || undefined
  }
}

// Getter dinâmico do id_workspace ativo — exigido pelo middleware
// verificarAcessoProduto (Portão 3 / Mandamento 04) no backend do Pedido.
// O Shell guarda o workspace selecionado em sessionStorage('gravity_company_id'),
// definido em SelecionarWorkspace.tsx. Lemos sincronamente no momento do request.
let getDynamicWorkspaceId: () => string | undefined = () => undefined

export const injectWorkspaceGetter = (fn: () => string | undefined): void => {
  getDynamicWorkspaceId = () => {
    const live = fn()
    if (live) context.idWorkspace = live
    return context.idWorkspace || undefined
  }
}

// Getter de token Clerk — backend do Pedido usa @gravity/resolver-organizacao
// que exige Authorization: Bearer <jwt>. Padrao espelhado de configurador
// api-client.ts:11-43 com 2 niveis de fallback para cobrir a janela entre
// montagem do useEffect no App.tsx e a primeira request feita por filhos
// lazy-loaded (que podem rodar antes do effect de injecao).
let getDynamicToken: (() => Promise<string | null>) | null = null

export const injectTokenGetter = (fn: () => Promise<string | null>): void => {
  getDynamicToken = fn
}

async function getAuthToken(): Promise<string | null> {
  // 1. Getter injetado pelo App.tsx via useAuth().getToken
  if (getDynamicToken) {
    try {
      const token = await getDynamicToken()
      if (token) return token
    } catch { /* fallback */ }
  }
  // 2. Fallback global — Clerk injeta window.Clerk via ClerkProvider
  try {
    const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    if (clerk?.session?.getToken) {
      const token = await clerk.session.getToken()
      if (token) return token
    }
  } catch { /* fallback */ }
  return null
}

export function setApiContext(ctx: { idOrganizacao: string; userId: string; userName?: string }): void {
  if (ctx.idOrganizacao) {
    context.idOrganizacao = ctx.idOrganizacao
    lsSet(ctx.idOrganizacao)
  }
  if (ctx.userId)   context.userId   = ctx.userId
  if (ctx.userName) context.userName = ctx.userName
}

export function getApiContext(): { idOrganizacao: string; userId: string; userName: string } {
  return {
    idOrganizacao: context.idOrganizacao || lsGet() || (import.meta.env.VITE_DEV_TENANT_ID as string | undefined) || '',
    userId:   context.userId,
    userName: context.userName,
  }
}

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const idOrganizacao = getDynamicTenantId() || context.idOrganizacao || lsGet() || (import.meta.env.VITE_DEV_TENANT_ID as string | undefined) || ''
  const idWorkspace   = getDynamicWorkspaceId() || context.idWorkspace || ''
  const token = await getAuthToken()

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'x-id-organizacao': idOrganizacao,
      'x-id-usuario':   context.userId,
      'x-nome-usuario': context.userName,
      ...(idWorkspace ? { 'x-id-workspace': idWorkspace } : {}),
      'x-chave-interna-servico': import.meta.env.VITE_CHAVE_INTERNA_SERVICO || '',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    const raw = await response.json().catch(() => null)
    // Servidor retorna { error: { message, details? } } ou { error: string }
    // BUG-C (Mand. 08): preservar `details` no Error para que a UI possa exibir
    // o(s) campo(s) realmente inválidos em vez de uma mensagem genérica.
    const msg = raw?.error?.message || raw?.erro?.mensagem || (typeof raw?.error === 'string' ? raw.error : null)
    const err = new Error(msg || `HTTP ${response.status}`) as Error & { details?: unknown }
    if (raw?.error && typeof raw.error === 'object' && 'details' in raw.error) {
      err.details = (raw.error as { details?: unknown }).details
    }
    throw err
  }
  // HTTP 204 No Content — resposta válida sem corpo (DELETE, PATCH sem retorno).
  // O `as T` é necessário porque T é genérico; quando o caller espera void/undefined
  // por contrato (ex: pedidoApi.excluir), undefined é o valor honesto e correto.
  if (response.status === 204) {
    return undefined as T
  }
  const text = await response.text()
  // Corpo vazio em outro 2xx (raro mas possível) — também trata como vazio.
  if (!text) {
    return undefined as T
  }
  try {
    return JSON.parse(text) as T
  } catch {
    console.error('[api] resposta não-JSON do servidor (status:', response.status, ')')
    throw new Error(`Resposta inválida do servidor (${response.status})`)
  }
}

// ── Pedidos ───────────────────────────────────────────────────────────────────

/** Codifica IDs legados que contêm '/' (ex: pedi_id_1234/26) para uso em URLs */
function pid(id: string): string {
  return encodeURIComponent(id)
}

// ── Workspaces disponíveis ao usuário (consumido pela Lista — filtro multi-workspace)
//
// Reaproveita o endpoint do Configurador `/api/v1/hub/init`, que já aplica a
// regra correta de visibilidade:
//   - SUPER_ADMIN/ADMIN/MASTER → todos workspaces ATIVOS da org
//   - PADRAO/FORNECEDOR        → apenas workspaces habilitados (UsuarioWorkspace.ativo)
//
// Dívida sinalizada: quando outro produto precisar dessa lista, migrar para
// ShellStore global (evita duplicação de fetch). Hoje cada produto faz o
// próprio request — caminho isolado por questão de escopo.

export interface WorkspaceDisponivel {
  id_workspace: string
  nome_workspace: string
  cnpj_workspace?: string | null
  status_workspace: string
}

export const workspacesDisponiveisApi = {
  listar: async (): Promise<WorkspaceDisponivel[]> => {
    const raw = await request<unknown>('/api/v1/hub/init')
    // /hub/init retorna muitos campos. Só precisamos da lista de workspaces.
    if (typeof raw !== 'object' || raw === null || !('workspaces' in raw)) {
      return []
    }
    const lista = (raw as { workspaces?: unknown }).workspaces
    if (!Array.isArray(lista)) return []
    return lista
      .filter((w): w is Record<string, unknown> => typeof w === 'object' && w !== null)
      .map((w) => ({
        id_workspace:    String(w.id_workspace ?? w.id ?? ''),
        nome_workspace:  String(w.nome_workspace ?? ''),
        cnpj_workspace:  w.cnpj_workspace == null ? null : String(w.cnpj_workspace),
        status_workspace: String(w.status_workspace ?? 'ATIVO'),
      }))
      .filter((w) => w.id_workspace && w.nome_workspace)
  },
}

export const pedidoApi = {
  listar: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<{ data: Pedido[]; total: number }>(`/api/v1/pedidos${query}`)
  },

  buscarPorId: (id: string) =>
    request<Pedido>(`/api/v1/pedidos/${pid(id)}`),

  criar: (data: Partial<Pedido> & { confirmar_numero_duplicado?: boolean }) =>
    request<Pedido>('/api/v1/pedidos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  buscarDuplicatasNumero: (numero_pedido: string) =>
    request<{ pedidos_existentes: Array<{ id_pedido: string; numero_pedido: string }> }>(
      `/api/v1/pedidos/duplicatas-numero?${new URLSearchParams({ numero_pedido })}`,
    ),

  atualizar: (id: string, data: Partial<Pedido>) =>
    request<Pedido>(`/api/v1/pedidos/${pid(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletar: (id: string) =>
    request<void>(`/api/v1/pedidos/${pid(id)}`, { method: 'DELETE' }),

  alterarStatus: (id: string, status: string) =>
    request<Pedido>(`/api/v1/pedidos/${pid(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  duplicar: (id: string) =>
    request<Pedido>(`/api/v1/pedidos/${pid(id)}/duplicar`, { method: 'POST' }),
}

// ── Itens do Pedido ───────────────────────────────────────────────────────────

export const pedidoItemApi = {
  listar: (pedidoId: string) =>
    request<PedidoItem[]>(`/api/v1/pedidos/${pid(pedidoId)}/itens`),

  adicionar: (pedidoId: string, data: Partial<PedidoItem>) =>
    request<PedidoItem>(`/api/v1/pedidos/${pid(pedidoId)}/itens`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(item => {
      // Em dev: sincroniza mock para que listar() fallback reflita o item real
      if (import.meta.env.DEV) {
        const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === pedidoId)
        if (pedido) pedido.itens = [...(pedido.itens ?? []), item]
      }
      return item
    }),

  atualizar: (pedidoId: string, itemId: string, data: Partial<PedidoItem>) =>
    request<PedidoItem>(`/api/v1/pedidos/${pid(pedidoId)}/itens/${pid(itemId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  editarCampo: (pedidoId: string, itemId: string, campo: string, valor: unknown) =>
    request<PedidoItem>(`/api/v1/pedidos/${pid(pedidoId)}/itens/${pid(itemId)}/campo`, {
      method: 'PATCH',
      body: JSON.stringify({ campo, valor: valor === undefined ? null : valor }),
    }),

  remover: (pedidoId: string, itemId: string) =>
    request<void>(`/api/v1/pedidos/${pid(pedidoId)}/itens/${pid(itemId)}`, { method: 'DELETE' }),

  cancelarQuantidade: (pedidoId: string, itemId: string, quantidade: number) =>
    request<PedidoItem>(`/api/v1/pedidos/${pid(pedidoId)}/itens/${pid(itemId)}/cancelar`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade }),
    }),

  atualizarPronta: (pedidoId: string, itemId: string, quantidade: number) =>
    request<PedidoItem>(`/api/v1/pedidos/${pid(pedidoId)}/itens/${pid(itemId)}/pronta`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidade_pronta_total_item_pedido: quantidade }),
    }),

  reordenar: (pedidoId: string, ids: string[]) =>
    request<{ ok: boolean; total_reordenados: number }>(`/api/v1/pedidos/${pid(pedidoId)}/itens/reordenar`, {
      method: 'PATCH',
      body: JSON.stringify({ ids }),
    }),
}

// ── Cursor pagination + inline edit ───────────────────────────────────────────

export const pedidoVirtualApi = {
  /**
   * Listagem com cursor keyset — para TabelaVirtualGlobal.
   *
   * Filtro multi-workspace via `idsWorkspacesFiltro` (vira query param CSV
   * `?ids_workspaces=cmo1,cmo2`). Backend valida contra UsuarioWorkspace
   * habilitados; se algum não autorizado → 403.
   */
  listar: (params: {
    cursor?: string
    page?: number
    sort?: string
    dir?: 'asc' | 'desc'
    limit?: number
    status?: string
    busca?: string
    /** Filtro multi-workspace (lista de IDs). Vence sobre o header x-id-workspace. */
    idsWorkspacesFiltro?: string[]
  } = {}) => {
    const q = new URLSearchParams()
    if (params.cursor)         q.set('cursor', params.cursor)
    if (params.page != null)   q.set('page', String(params.page))
    if (params.sort)             q.set('sort', params.sort)
    if (params.dir)              q.set('dir', params.dir)
    if (params.limit)            q.set('limit', String(params.limit))
    if (params.status)           q.set('status', params.status)
    if (params.busca)            q.set('busca', params.busca)
    if (params.idsWorkspacesFiltro && params.idsWorkspacesFiltro.length > 0) {
      q.set('ids_workspaces', params.idsWorkspacesFiltro.join(','))
    }
    return request<PedidosListResponse>(`/api/v1/pedidos?${q}`)
  },

  /** Contar total de matches find-in-page no banco (pedidos + itens) */
  localizar: (params: { termo: string; status?: string; busca?: string; idsWorkspacesFiltro?: string[] }) => {
    const q = new URLSearchParams()
    q.set('termo', params.termo)
    if (params.status) q.set('status', params.status)
    if (params.busca)  q.set('busca', params.busca)
    if (params.idsWorkspacesFiltro && params.idsWorkspacesFiltro.length > 0) {
      q.set('ids_workspaces', params.idsWorkspacesFiltro.join(','))
    }
    return request<{ total: number }>(`/api/v1/pedidos/localizar?${q}`)
  },

  /** Edição inline de um campo.
   *  replicar_em_itens: quando true, replica o valor para TODOS os itens do
   *  pedido na mesma transação backend. Decisão UX 2026-05-13.
   */
  editarCampo: (id: string, campo: string, valor: unknown, replicar_em_itens = false) => {
    // Log diagnóstico — facilita debug de erros que ficam mascarados pela
    // mensagem default "Erro ao salvar" e que não aparecem claramente no
    // Network (ex: requests muito rápidos, filtros do DevTools).
    // eslint-disable-next-line no-console
    console.log('[pedidoVirtualApi.editarCampo] →', { id, campo, valor, replicar_em_itens })
    return request<Pedido>(`/api/v1/pedidos/${pid(id)}/campo`, {
      method: 'PATCH',
      body: JSON.stringify({
        campo,
        valor: valor === undefined ? null : valor,
        replicar_em_itens,
      }),
    }).then(r => {
      // eslint-disable-next-line no-console
      console.log('[pedidoVirtualApi.editarCampo] ← OK', { id, campo })
      return r
    }).catch(err => {
      // eslint-disable-next-line no-console
      console.error('[pedidoVirtualApi.editarCampo] ← ERRO', {
        id,
        campo,
        valor,
        replicar_em_itens,
        mensagem: err instanceof Error ? err.message : String(err),
        details: (err as { details?: unknown })?.details,
        stack: err instanceof Error ? err.stack?.split('\n').slice(0, 5) : undefined,
      })
      if (import.meta.env.DEV) {
        const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === id)
        if (pedido) return { ...pedido, [campo]: valor } as Pedido
      }
      throw err
    })
  },
}

// ── Init — agrega 4 queries em 1 request ─────────────────────────────────────

export interface PedidoInitResponse {
  pedidos:      PedidosListResponse
  status:       { data: PedidoStatusConfig[] }
  preferencias: PedidoPreferenciasColunas | null
  colunas:      ColunaUsuario[]
}

export const pedidoInitApi = {
  carregar: (params: {
    sort?: string
    dir?: 'asc' | 'desc'
    limit?: number
    status?: string
    busca?: string
  } = {}): Promise<PedidoInitResponse> => {
    const q = new URLSearchParams()
    if (params.sort)   q.set('sort', params.sort)
    if (params.dir)    q.set('dir', params.dir)
    if (params.limit)  q.set('limit', String(params.limit))
    if (params.status) q.set('status', params.status)
    if (params.busca)  q.set('busca', params.busca)
    return request<PedidoInitResponse>(`/api/v1/pedidos/inicializacao?${q}`).catch(err => {
      if (import.meta.env.DEV) {
        // DEV sem backend: retorna mock combinado
        return {
          pedidos:      MOCK_PEDIDOS_RESPONSE,
          status:       { data: [] },
          preferencias: null,
          colunas:      [],
        }
      }
      throw err
    })
  },
}

// ── Configuração de status e colunas ──────────────────────────────────────────

export const pedidoConfigApi = {
  listarStatus: () =>
    request<{ data: PedidoStatusConfig[] }>('/api/v1/pedidos/config/status'),

  // syncStatus removido — tela de Status é 100% API-driven (sem localStorage)

  criarStatus: (data: { nome: string; rotulo: string; cor: string; ordem: number }) =>
    request<PedidoStatusConfig>('/api/v1/pedidos/config/status', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizarStatus: (id: string, data: Partial<{ rotulo: string; cor: string; ordem: number }>) =>
    request<PedidoStatusConfig>(`/api/v1/pedidos/config/status/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletarStatus: (id: string) =>
    request<void>(`/api/v1/pedidos/config/status/${id}`, { method: 'DELETE' }),

  reordenarStatus: (ids: string[]) =>
    request<{ sucesso: boolean }>('/api/v1/pedidos/config/status/reordenar', {
      method: 'PATCH',
      body: JSON.stringify({ ids }),
    }),

  listarColunas: () =>
    request<{ data: PedidoColunaConfig[] }>('/api/v1/pedidos/config/colunas'),

  obterPreferenciaUsuarioColunaPedido: () =>
    request<{ data: PedidoPreferenciasColunas | null }>('/api/v1/pedidos/config/preferencia-usuario-coluna-pedido'),

  salvarPreferenciaUsuarioColunaPedido: (prefs: PedidoPreferenciasColunasPut) =>
    request<{ data: PedidoPreferenciasColunas }>('/api/v1/pedidos/config/preferencia-usuario-coluna-pedido', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    }),
}

// ── Ações em lote ─────────────────────────────────────────────────────────────

export const pedidoLoteApi = {
  mudarStatusConfirmar: (ids: string[], novoStatus: string) =>
    request<{ sucesso: number; erros: { id: string; motivo: string }[] }>('/api/v1/pedidos/alteracoes-status-lote/confirmar', {
      method: 'POST',
      body: JSON.stringify({ ids, status_novo: novoStatus }),
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
        'x-id-organizacao': context.idOrganizacao,
        'x-id-usuario': context.userId,
        'x-nome-usuario': context.userName,
        'x-chave-interna-servico': import.meta.env.VITE_CHAVE_INTERNA_SERVICO || '',
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

// ── Consolidação de Pedidos ───────────────────────────────────────────────────

export const pedidoConsolidarApi = {
  /** Retorna divergências de campos e sugestões de merge para os ids selecionados */
  preview: (ids: string[]) =>
    request<ConsolidacaoPreview>('/api/v1/pedidos/consolidacoes/preview', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }).catch(err => {
      if (import.meta.env.DEV) return mockConsolidarPreview(ids)
      throw err
    }),

  /** Executa o merge e retorna o pedido consolidado criado */
  confirmar: (payload: ConsolidacaoPayload) =>
    request<Pedido>('/api/v1/pedidos/consolidacoes/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockConsolidarConfirmar(payload)
      throw err
    }),
}

/**
 * Mapeamento completo: campo do Pedido → rótulo + grupo para consolidação.
 *
 * REGRA CRÍTICA: TODO campo de negócio do Pedido DEVE estar mapeado aqui.
 * Campo não mapeado = dado perdido silenciosamente na consolidação.
 * Contagem: 4+2+9+5+2+6+12+3+3+2 = 48 campos em 10 grupos.
 */
const CAMPOS_CONSOLIDACAO: Array<{ campo: string; rotulo: string; grupo: string }> = [
  // ── Comercial (4) ──
  { campo: 'incoterm', rotulo: 'Incoterm', grupo: 'Comercial' },
  { campo: 'moeda_pedido', rotulo: 'Moeda', grupo: 'Comercial' },
  { campo: 'condicao_pagamento', rotulo: 'Condição de Pagamento', grupo: 'Comercial' },
  { campo: 'unidade_comercializada_pedido', rotulo: 'Unidade Comercializada', grupo: 'Comercial' },

  // ── Datas (2) ──
  { campo: 'data_emissao_pedido', rotulo: 'Data de Emissão', grupo: 'Datas' },
  { campo: 'data_prevista_pedido_pronto', rotulo: 'Data de Embarque', grupo: 'Datas' },

  // ── Exportador (9) ──
  { campo: 'nome_exportador', rotulo: 'Nome', grupo: 'Exportador' },
  { campo: 'cnpj_exportador', rotulo: 'CNPJ', grupo: 'Exportador' },
  { campo: 'endereco_exportador', rotulo: 'Endereço', grupo: 'Exportador' },
  { campo: 'pais_exportador', rotulo: 'País', grupo: 'Exportador' },
  { campo: 'estado_exportador', rotulo: 'Estado', grupo: 'Exportador' },
  { campo: 'cidade_exportador', rotulo: 'Cidade', grupo: 'Exportador' },
  { campo: 'zip_code_exportador', rotulo: 'CEP / Zip Code', grupo: 'Exportador' },
  { campo: 'exportador_ou_fabricante', rotulo: 'Exportador ou Fabricante', grupo: 'Exportador' },
  { campo: 'relacao_exportador_fabricante', rotulo: 'Relação Exportador-Fabricante', grupo: 'Exportador' },

  // ── Contato Exportador (5) ──
  { campo: 'nome_contato_exportador', rotulo: 'Nome do Contato', grupo: 'Contato Exportador' },
  { campo: 'email_contato_exportador', rotulo: 'E-mail', grupo: 'Contato Exportador' },
  { campo: 'whatsapp_contato_exportador', rotulo: 'WhatsApp', grupo: 'Contato Exportador' },
  { campo: 'cargo_contato_exportador', rotulo: 'Cargo', grupo: 'Contato Exportador' },
  { campo: 'departamento_contato_exportador', rotulo: 'Departamento', grupo: 'Contato Exportador' },

  // ── Importador (2) ──
  { campo: 'nome_importador', rotulo: 'Nome', grupo: 'Importador' },
  { campo: 'cnpj_importador', rotulo: 'CNPJ', grupo: 'Importador' },

  // ── Fabricante (6) ──
  { campo: 'nome_fabricante', rotulo: 'Nome', grupo: 'Fabricante' },
  { campo: 'endereco_fabricante', rotulo: 'Endereço', grupo: 'Fabricante' },
  { campo: 'pais_fabricante', rotulo: 'País', grupo: 'Fabricante' },
  { campo: 'estado_fabricante', rotulo: 'Estado', grupo: 'Fabricante' },
  { campo: 'cidade_fabricante', rotulo: 'Cidade', grupo: 'Fabricante' },
  { campo: 'zip_code_fabricante', rotulo: 'CEP / Zip Code', grupo: 'Fabricante' },

  // ── OPE (12) ──
  { campo: 'nome_ope', rotulo: 'Nome', grupo: 'OPE' },
  { campo: 'codigo_ope', rotulo: 'Código', grupo: 'OPE' },
  { campo: 'cnpj_raiz_empresa_responsavel', rotulo: 'CNPJ Raiz', grupo: 'OPE' },
  { campo: 'situacao_ope', rotulo: 'Situação', grupo: 'OPE' },
  { campo: 'versao_ope', rotulo: 'Versão', grupo: 'OPE' },
  { campo: 'endereco_ope', rotulo: 'Endereço', grupo: 'OPE' },
  { campo: 'pais_ope', rotulo: 'País', grupo: 'OPE' },
  { campo: 'estado_ope', rotulo: 'Estado', grupo: 'OPE' },
  { campo: 'cidade_ope', rotulo: 'Cidade', grupo: 'OPE' },
  { campo: 'zip_code_ope', rotulo: 'CEP / Zip Code', grupo: 'OPE' },
  { campo: 'tin_ope', rotulo: 'TIN', grupo: 'OPE' },
  { campo: 'email_ope', rotulo: 'E-mail', grupo: 'OPE' },

  // ── Câmbio (3) ──
  { campo: 'taxa_cambio_estimada', rotulo: 'Taxa de Câmbio Estimada', grupo: 'Câmbio' },
  { campo: 'moeda_cambio_pedido', rotulo: 'Moeda do Câmbio', grupo: 'Câmbio' },
  { campo: 'contrato_cambio_id_pedido', rotulo: 'Contrato de Câmbio', grupo: 'Câmbio' },

  // ── Documentos (5) ──
  { campo: 'numero_proforma', rotulo: 'Nº Proforma', grupo: 'Documentos' },
  { campo: 'numero_invoice', rotulo: 'Nº Invoice', grupo: 'Documentos' },
  { campo: 'referencia_importador', rotulo: 'Referência do Importador', grupo: 'Documentos' },
  { campo: 'referencia_exportador', rotulo: 'Referência do Exportador', grupo: 'Documentos' },
  { campo: 'referencia_fabricante', rotulo: 'Referência do Fabricante', grupo: 'Documentos' },

  // ── Logística (3) ──
  { campo: 'peso_liquido_total_pedido', rotulo: 'Peso Líquido Total', grupo: 'Logística' },
  { campo: 'peso_bruto_total_pedido', rotulo: 'Peso Bruto Total', grupo: 'Logística' },
  { campo: 'cubagem_total_pedido', rotulo: 'Cubagem Total', grupo: 'Logística' },
]

/** Mock de preview — detecta divergências nos pedidos selecionados do MOCK_PEDIDOS_RESPONSE.
 *  Se os IDs não existem no mock (ex: dados reais do banco em DEV), gera preview sintético.
 *
 *  REGRA: TODOS os 48 campos de CAMPOS_CONSOLIDACAO são analisados.
 *  Campo ausente no pedido → tratado como null (igual se ambos null). */
function mockConsolidarPreview(ids: string[]): ConsolidacaoPreview {
  if (ids.length < 2) {
    throw new Error('Selecione ao menos 2 pedidos para consolidar')
  }

  const pedidos = MOCK_PEDIDOS_RESPONSE.data.filter(p => ids.includes(p.id))

  // ── Análise completa dos 48 campos ──
  // Funciona tanto para pedidos mock quanto para o preview sintético
  const fontes = pedidos.length >= 2
    ? pedidos
    : null // fallback sintético

  const camposDivergentes: CampoDivergente[] = []
  const camposIguais: CampoIgual[] = []

  if (fontes) {
    // ── Pedidos mock encontrados → análise real de TODOS os 48 campos ──
    for (const def of CAMPOS_CONSOLIDACAO) {
      const valores = fontes.map(p => ({
        pedido_id: p.id,
        numero_pedido: p.numero_pedido,
        valor: ((p as unknown as Record<string, unknown>)[def.campo] as string | number | null) ?? null,
      }))
      const unicos = new Set(valores.map(v => String(v.valor)))

      if (unicos.size > 1) {
        camposDivergentes.push({
          campo: def.campo,
          rotulo: def.rotulo,
          grupo: def.grupo,
          valores,
          valor_sugerido: valores[0].valor,
        })
      } else {
        camposIguais.push({
          campo: def.campo,
          rotulo: def.rotulo,
          grupo: def.grupo,
          valor: valores[0].valor,
        })
      }
    }
  } else {
    // ── IDs reais (não encontrados no mock) → preview sintético com TODOS os 48 campos ──
    // Gera divergência em campos-chave, restante como igual (com dados ou null)
    // REGRA: todos os campos que tipicamente têm dados devem ter valores sintéticos
    const sinteticoDivergentes: Record<string, [string, string]> = {
      incoterm: ['FAS', 'FOB'],
      condicao_pagamento: ['30 dias', '60 dias'],
      nome_exportador: ['Exportador Alpha', 'Exportador Beta'],
      data_emissao_pedido: ['2026-01-15', '2026-02-20'],
      nome_fabricante: ['Fabricante Alpha', 'Fabricante Beta'],
    }
    const sinteticoIguais: Record<string, string | number | null> = {
      moeda_pedido: 'EUR',
      unidade_comercializada_pedido: 'KG',
      nome_importador: 'Importadora Brasil Ltda.',
      cnpj_importador: '12.345.678/0001-99',
      cnpj_exportador: '98-7654321',
      pais_exportador: 'China',
      cidade_exportador: 'Shenzhen',
      estado_exportador: 'Guangdong',
      endereco_exportador: 'No. 88 Keyuan Road, Nanshan District',
      zip_code_exportador: '518057',
      nome_contato_exportador: 'Li Wei',
      email_contato_exportador: 'li.wei@exportador.cn',
      pais_fabricante: 'China',
      cidade_fabricante: 'Shenzhen',
      numero_proforma: 'PRO-2026/001',
      referencia_importador: 'REF-IMP-001',
      referencia_exportador: 'EXP-REF-001',
      peso_liquido_total_pedido: 0,
      peso_bruto_total_pedido: 0,
      cubagem_total_pedido: 0,
      taxa_cambio_estimada: 5.45,
      moeda_cambio_pedido: 'BRL',
    }

    for (const def of CAMPOS_CONSOLIDACAO) {
      const div = sinteticoDivergentes[def.campo]
      const igualValor = sinteticoIguais[def.campo]

      if (div) {
        camposDivergentes.push({
          campo: def.campo,
          rotulo: def.rotulo,
          grupo: def.grupo,
          valores: ids.map((id, i) => ({
            pedido_id: id,
            numero_pedido: `Pedido ${i + 1}`,
            valor: i === 0 ? div[0] : div[1],
          })),
          valor_sugerido: div[0],
        })
      } else {
        camposIguais.push({
          campo: def.campo,
          rotulo: def.rotulo,
          grupo: def.grupo,
          valor: igualValor !== undefined ? igualValor : null,
        })
      }
    }
  }

  // Mapa de itens por part_number
  const ano = new Date().getFullYear()
  const seq = String(MOCK_PEDIDOS_RESPONSE.data.length + 1).padStart(3, '0')

  if (!fontes) {
    // ── Sintético: itens genéricos ──
    return {
      ids,
      campos_divergentes: camposDivergentes,
      campos_iguais: camposIguais,
      itens: ids.map((id, i) => ({
        part_number: `PART-${String(i + 1).padStart(3, '0')}`,
        descricao_item: `Item sintético ${i + 1}`,
        ncm: '8471.30.19',
        unidade_comercializada_item: 'UN',
        moeda_item: 'USD',
        valor_por_unidade_item: 100 + (i * 50),
        quantidade_total: 10 + (i * 5),
        pedidos_origem: [`Pedido ${i + 1}`],
        pode_fundir: false,
      })),
      valor_total_soma: ids.length * 25000,
      moeda: 'USD',
      numero_sugerido: `PO-CONS-${ano}/${seq}`,
      pedidos_info: ids.map((id, i) => ({ id, numero: `Pedido ${i + 1}` })),
    }
  }

  // ── Pedidos mock encontrados → itens reais ──
  const itensPorPart: Record<string, ItemConsolidado> = {}
  for (const pedido of fontes) {
    for (const item of pedido.itens) {
      if (itensPorPart[item.part_number]) {
        itensPorPart[item.part_number].quantidade_total += item.quantidade_atual_pedido
        itensPorPart[item.part_number].pedidos_origem.push(pedido.numero_pedido)
        itensPorPart[item.part_number].pode_fundir = true
      } else {
        itensPorPart[item.part_number] = {
          part_number: item.part_number,
          descricao_item: item.descricao_item,
          ncm: item.ncm,
          unidade_comercializada_item: item.unidade_comercializada_item ?? null,
          moeda_item: item.moeda_item,
          valor_por_unidade_item: item.valor_por_unidade_item ?? null,
          quantidade_total: item.quantidade_atual_pedido,
          pedidos_origem: [pedido.numero_pedido],
          pode_fundir: false,
        }
      }
    }
  }

  const valorTotal = fontes.reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0)

  return {
    ids,
    campos_divergentes: camposDivergentes,
    campos_iguais: camposIguais,
    itens: Object.values(itensPorPart),
    valor_total_soma: valorTotal,
    moeda: fontes[0].moeda_pedido,
    numero_sugerido: `PO-CONS-${ano}/${seq}`,
    pedidos_info: fontes.map(p => ({ id: p.id, numero: p.numero_pedido })),
  }
}

/** Mock de confirmar — cria pedido consolidado e "remove" originais do estado.
 *  Se os IDs não existem no mock (dados reais do banco em DEV), gera resultado sintético. */
function mockConsolidarConfirmar(payload: ConsolidacaoPayload): Pedido {
  const pedidos = MOCK_PEDIDOS_RESPONSE.data.filter(p => payload.ids.includes(p.id))

  // ── IDs reais (não encontrados no mock) → resultado sintético ──
  if (pedidos.length === 0) {
    return {
      id: `pedi_cons_${Date.now()}`,
      numero_pedido: payload.numero_pedido,
      status: 'consolidado',
      tipo_operacao: 'importacao',
      incoterm: (payload.campos_escolhidos?.incoterm as string) ?? 'FOB',
      moeda_pedido: 'USD',
      valor_total_pedido: payload.ids.length * 25000,
      pedidos_origem_id: payload.ids,
      itens: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Pedido
  }

  const primeiro = pedidos[0]

  const itensMerge: PedidoItem[] = []
  const partNumbers = new Set<string>()

  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      if (payload.fundir_itens_mesmo_part_number && partNumbers.has(item.part_number)) {
        const existente = itensMerge.find(i => i.part_number === item.part_number)
        if (existente) {
          existente.quantidade_inicial_pedido += item.quantidade_inicial_pedido
          existente.quantidade_atual_pedido += item.quantidade_atual_pedido
        }
      } else {
        partNumbers.add(item.part_number)
        itensMerge.push({ ...item, pedido_id: 'consolidado-mock' })
      }
    }
  }

  const novoPedido: Pedido = {
    ...primeiro,
    id: `pedi_cons_${Date.now()}`,
    numero_pedido: payload.numero_pedido,
    status: 'consolidado',
    pedidos_origem_id: payload.ids,
    valor_total_pedido: pedidos.reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0),
    itens: itensMerge,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...payload.campos_escolhidos,
  }

  // Remover originais do mock e adicionar o consolidado
  const idx = MOCK_PEDIDOS_RESPONSE.data.findIndex(p => payload.ids.includes(p.id))
  MOCK_PEDIDOS_RESPONSE.data = MOCK_PEDIDOS_RESPONSE.data.filter(p => !payload.ids.includes(p.id))
  MOCK_PEDIDOS_RESPONSE.data.splice(Math.max(0, idx), 0, novoPedido)
  MOCK_PEDIDOS_RESPONSE.total = MOCK_PEDIDOS_RESPONSE.data.length

  return novoPedido
}

// ── Transferência de Pedidos ──────────────────────────────────────────────────

export const pedidoTransferirApi = {
  preview: (payload: Omit<TransferPayload, 'numero_pedido_novo'>) =>
    request<TransferPreview>(`/api/v1/pedidos/${pid(payload.pedido_id)}/transferencias/preview`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  confirmar: (payload: TransferPayload) =>
    request<TransferResultado>(`/api/v1/pedidos/${pid(payload.pedido_id)}/transferencias/confirmar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  historico: (pedido_id: string) =>
    request<TransferHistorico[]>(`/api/v1/pedidos/${pid(pedido_id)}/transferencias`),
  reverter: (pedido_id: string, transfer_id: string) =>
    request<TransferResultado>(`/api/v1/pedidos/${pid(pedido_id)}/transferencias/${pid(transfer_id)}/reverter`, {
      method: 'POST',
    }),
}

// ── Mocks DEV para Transferência ──────────────────────────────────────────────

function mockTransferirPreview(payload: Omit<TransferPayload, 'numero_pedido_novo'>): TransferPreview {
  const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === payload.pedido_id)
  const item = pedido?.itens.find(i => i.id === payload.item_id)

  const quantidadeApos = (item?.quantidade_atual_pedido ?? 0) - payload.quantidade_origem
  const encerra = quantidadeApos <= 0

  const alertas: string[] = []
  if (encerra) alertas.push('Pedido de origem ficará com quantidade zero após a transferência')
  if (payload.quantidade_origem > (item?.quantidade_atual_pedido ?? 0)) {
    alertas.push('Quantidade solicitada excede quantidade disponível no item')
  }

  return {
    cenario: payload.cenario,
    origem: {
      pedido_numero: pedido?.numero_pedido ?? payload.pedido_id,
      item_part_number: item?.part_number ?? payload.item_id,
      quantidade_atual_pedido: item?.quantidade_atual_pedido ?? 0,
      quantidade_apos: Math.max(0, quantidadeApos),
      encerra,
    },
    destinos: payload.destinos.map(d => ({
      tipo: d.tipo === 'mesmo' ? 'existente' : d.tipo,
      pedido_numero: d.pedido_id
        ? MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === d.pedido_id)?.numero_pedido
        : undefined,
      quantidade: d.quantidade,
      alertas: [],
    })),
    alertas_globais: alertas,
  }
}

function mockTransferirConfirmar(payload: TransferPayload): TransferResultado {
  const pedidosDestino = payload.destinos
    .filter(d => d.pedido_id)
    .map(d => d.pedido_id as string)

  const pedidosCriados: string[] = payload.destinos
    .filter(d => d.tipo === 'novo')
    .map(() => `pedi_new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`)

  return {
    pedido_origem_id: payload.pedido_id,
    pedidos_destino_ids: pedidosDestino,
    pedidos_criados: pedidosCriados,
    itens_excluidos: [],
    pedidos_encerrados: [],
  }
}

function mockTransferirHistorico(pedido_id: string): TransferHistorico[] {
  // Retorna histórico vazio em DEV — não há transferências mock gravadas
  return []
}

function mockTransferirReverter(transfer_id: string): TransferResultado {
  return {
    pedido_origem_id: transfer_id,
    pedidos_destino_ids: [],
    pedidos_criados: [],
    itens_excluidos: [],
    pedidos_encerrados: [],
  }
}

// ── Edição em Massa ───────────────────────────────────────────────────────────

export const pedidoEdicaoMassaApi = {
  /**
   * Preview — mostra impacto antes de confirmar.
   *
   * SEM mock fallback (Mand. 08 — falha ruidosa em vez de silenciosa).
   * Se a API real falhar, propaga o erro para o componente exibir mensagem
   * ao usuário. Mascarar com mock em DEV induz a confiar em dados falsos
   * (caso real: preview retornou 5 itens de mock quando a API real falhava
   * por Zod desatualizado).
   */
  preview: (payload: EdicaoMassaPayload) =>
    request<EdicaoMassaPreview>('/api/v1/pedidos/edicoes-em-massa/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Confirmar — executa a edição em massa. Sem mock fallback (Mand. 08). */
  confirmar: (payload: EdicaoMassaPayload) =>
    request<EdicaoMassaResultado>('/api/v1/pedidos/edicoes-em-massa/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

/** Calcula o novo valor simulado dado o valor atual e a operação */
function calcularNovoValorMock(atual: string | number | null, c: CampoEdicaoMassa): string | number {
  switch (c.operacao) {
    case 'substituir':
      return c.valor
    case 'somar':
      return Number(atual ?? 0) + Number(c.valor)
    case 'subtrair':
      return Number(atual ?? 0) - Number(c.valor)
    case 'percentual':
      return Number(atual ?? 0) * (1 + Number(c.valor) / 100)
    case 'avancar_dias': {
      const d = new Date(String(atual ?? new Date().toISOString()))
      d.setDate(d.getDate() + Number(c.valor))
      return d.toISOString().slice(0, 10)
    }
    case 'recuar_dias': {
      const d = new Date(String(atual ?? new Date().toISOString()))
      d.setDate(d.getDate() - Number(c.valor))
      return d.toISOString().slice(0, 10)
    }
    default:
      return c.valor
  }
}

/** Mock DEV — preview de edição em massa */
function mockEdicaoMassaPreview(payload: EdicaoMassaPayload): EdicaoMassaPreview {
  const pedidosMock = MOCK_PEDIDOS_RESPONSE.data.filter(p => payload.pedido_ids.includes(p.id))
  // Fallback: quando IDs reais não batem com mock, usa count do payload
  const pedidos = pedidosMock.length > 0 ? pedidosMock : MOCK_PEDIDOS_RESPONSE.data.slice(0, payload.pedido_ids.length)
  return {
    pedidos_afetados: payload.pedido_ids.length,
    itens_afetados: pedidos.reduce((s, p) => s + (p.itens?.length ?? 0), 0),
    campos: payload.campos.map(c => {
      const valores = pedidos.map(p => String((p as Record<string, unknown>)[c.campo] ?? ''))
      const distintos = [...new Set(valores)]
      return {
        campo: c.campo,
        nivel: c.nivel,
        operacao: c.operacao,
        valor: c.valor,
        multiplos_valores: distintos.length > 1,
        valores_distintos: distintos,
        alertas: [],
      }
    }),
    alertas_globais: [],
    por_pedido: pedidos.map(p => ({
      pedido_id: p.id,
      numero_pedido: p.numero_pedido,
      alteracoes: payload.campos
        .filter(c => c.nivel === 'pedido')
        .map(c => {
          const atual = (p as Record<string, unknown>)[c.campo] as string | number | null ?? null
          return {
            campo: c.campo,
            valor_atual: atual,
            valor_novo: calcularNovoValorMock(atual, c),
          }
        }),
    })),
  }
}

/** Mock DEV — confirmar edição em massa */
function mockEdicaoMassaConfirmar(payload: EdicaoMassaPayload): EdicaoMassaResultado {
  let itensAtualizados = 0
  payload.pedido_ids.forEach(id => {
    const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === id)
    if (!pedido) return
    payload.campos.forEach(c => {
      if (c.nivel === 'pedido') {
        aplicarOperacaoMock(pedido as Record<string, unknown>, c)
      } else {
        pedido.itens?.forEach(item => {
          aplicarOperacaoMock(item as Record<string, unknown>, c)
          itensAtualizados++
        })
      }
    })
  })
  return {
    pedidos_atualizados: payload.pedido_ids.length,
    itens_atualizados: itensAtualizados,
    campos_alterados: payload.campos.map(c => c.campo),
    erros: [],
  }
}

/** Aplica a operação de edição em massa em um objeto mock */
function aplicarOperacaoMock(obj: Record<string, unknown>, c: CampoEdicaoMassa): void {
  const atual = obj[c.campo]
  switch (c.operacao) {
    case 'substituir':
      obj[c.campo] = c.valor
      break
    case 'somar':
      obj[c.campo] = Number(atual ?? 0) + Number(c.valor)
      break
    case 'subtrair':
      obj[c.campo] = Number(atual ?? 0) - Number(c.valor)
      break
    case 'percentual':
      obj[c.campo] = Number(atual ?? 0) * (1 + Number(c.valor) / 100)
      break
    case 'avancar_dias': {
      const d = new Date(String(atual ?? new Date().toISOString()))
      d.setDate(d.getDate() + Number(c.valor))
      obj[c.campo] = d.toISOString()
      break
    }
    case 'recuar_dias': {
      const d = new Date(String(atual ?? new Date().toISOString()))
      d.setDate(d.getDate() - Number(c.valor))
      obj[c.campo] = d.toISOString()
      break
    }
  }
}

// ── Smart Import ──────────────────────────────────────────────────────────────

export const smartImportApi = {
  /** Upload + parse + mapeamento IA — retorna preview com mapeamento e linhas */
  analisar: (arquivo: File) => {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    // P17 — Portao 3 (12/05/2026) exige x-id-workspace.
    const idWorkspace = getDynamicWorkspaceId() || context.idWorkspace || ''
    // Omitir Content-Type — browser define boundary automaticamente
    return fetch('/api/v1/pedidos/importacoes-inteligentes/analisar', {
      method: 'POST',
      headers: {
        'x-id-organizacao': context.idOrganizacao,
        'x-id-usuario': context.userId,
        'x-nome-usuario': context.userName,
        ...(idWorkspace ? { 'x-id-workspace': idWorkspace } : {}),
        'x-chave-interna-servico': import.meta.env.VITE_CHAVE_INTERNA_SERVICO || '',
      },
      body: formData,
    }).then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: 'Erro desconhecido' } }))
        throw new Error(err.error?.message || `HTTP ${res.status}`)
      }
      // REGRA 06/09 — parse Zod do contrato bilateral. Se o backend mudar
      // payload sem atualizar o schema, falha alta aqui em vez de bug
      // silencioso (Mandamento 08 — sem fallback silencioso).
      const raw = await res.json()
      return smartImportPreviewSchema.parse(raw) as SmartImportPreview
    }).catch(err => {
      // Q5 — Antes: `if (DEV) return mockSmartImportAnalisar(...)` engolia QUALQUER erro
      // (incluindo 500 do servidor) e retornava mock fake. Resultado: UI mostrava
      // "sucesso" com dados ficticios e o desenvolvedor ficava cego ao bug real.
      // Agora: so' usa mock se o servidor estiver UNREACHABLE (TypeError de fetch),
      // nunca para HTTP errors (500/400/etc). Erros HTTP sao propagados para a UI.
      const ehNetworkError = err instanceof TypeError && /fetch|network/i.test(err.message)
      if (import.meta.env.DEV && ehNetworkError) {
        console.warn('[smartImportApi.analisar] servidor offline, usando mock DEV:', err.message)
        return mockSmartImportAnalisar(arquivo.name)
      }
      throw err
    })
  },

  /** Confirmar importacao com decisoes do usuario */
  confirmar: (payload: SmartImportConfirmar) =>
    request<SmartImportResultado>('/api/v1/pedidos/importacoes-inteligentes/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      // Q5 — Mesmo fix do `analisar` acima. Mock so' substitui em network error
      // (servidor offline), nao em erros HTTP do servidor. Antes: UI fake "1 CRIADO"
      // com IDs ficticios `pedi_imp_<timestamp>_*` que NAO existiam no banco —
      // por isso voce via "sucesso" mas o pedido nao aparecia na lista.
      const ehNetworkError = err instanceof TypeError && /fetch|network/i.test(err.message)
      if (import.meta.env.DEV && ehNetworkError) {
        console.warn('[smartImportApi.confirmar] servidor offline, usando mock DEV:', err.message)
        return mockSmartImportConfirmar(payload)
      }
      console.error('[smartImportApi.confirmar] erro real do servidor:', err)
      throw err
    }),

  /** Buscar mapeamento salvo para hash de colunas */
  mapeamentoSalvo: (hashColunas: string) =>
    request<ColunaMapeada[] | null>(`/api/v1/pedidos/importacoes-inteligentes/mapeamentos/${hashColunas}`),
}

// ── Mocks DEV para Smart Import ───────────────────────────────────────────────

/** Mock de analisar: simula mapeamento IA com dados ficticios */
function mockSmartImportAnalisar(nomeArquivo: string): SmartImportPreview {
  const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? 'xlsx'
  void ext

  // Colunas com valores de exemplo reais do arquivo
  const colunasMock: Array<{ coluna: string; campo: string | null; conf: number; exemplo: string | null }> = [
    { coluna: 'PO Number',    campo: 'numero_pedido',       conf: 97, exemplo: '021597-00'          },
    { coluna: 'Supplier',     campo: 'exportador',          conf: 88, exemplo: 'STORK THERMEQ B.V.' },
    { coluna: 'NCM',          campo: 'ncm',                 conf: 95, exemplo: '8471.30.19'          },
    { coluna: 'Part No.',     campo: 'part_number',         conf: 91, exemplo: 'STE-A4-001'          },
    { coluna: 'Description',  campo: 'descricao_item',       conf: 85, exemplo: 'Heat exchanger plate'},
    { coluna: 'Qty',          campo: 'quantidade_inicial_pedido',  conf: 78, exemplo: '100'                 },
    { coluna: 'Unit',         campo: 'unidade',             conf: 72, exemplo: 'UN'                  },
    { coluna: 'Unit Price',   campo: 'valor_por_unidade_item',       conf: 83, exemplo: '330,00'              },
    { coluna: 'Currency',     campo: 'moeda_pedido',        conf: 90, exemplo: 'USD'                 },
    { coluna: 'Incoterms',    campo: 'incoterm',            conf: 94, exemplo: 'FOB'                 },
    { coluna: 'Ship Date',    campo: 'data_embarque',       conf: 67, exemplo: '30/05/2023'          },
    { coluna: 'Internal Ref', campo: null,                  conf: 15, exemplo: 'HPB-2023-042'        },
  ]

  const mapeamento: ColunaMapeada[] = colunasMock.map(c => ({
    coluna_arquivo: c.coluna,
    campo_sistema: c.campo,
    confianca: c.conf,
    nivel: c.conf >= 90 ? 'auto' : c.conf >= 50 ? 'confirmado' : 'ignorado',
    inferido_por: c.conf >= 90 ? 'ia' : c.conf >= 50 ? 'dados' : 'ia',
    valor_exemplo_coluna_pedido: c.exemplo,
  }))

  const alertasDuplicata: SmartImportAlerta[] = [{
    campo: 'numero_pedido',
    tipo: 'duplicado_sistema',
    mensagem: 'Pedido PO-2026/003 ja existe no sistema',
    nivel: 'aviso',
  }]

  const linhas: SmartImportLinha[] = [
    {
      linha_arquivo: 2,
      numero_pedido: '021597-00',
      status: 'ok',
      alertas: [],
      dados: {
        numero_pedido: '021597-00',
        exportador: 'STORK THERMEQ B.V.',
        incoterm: 'FOB',
        moeda_pedido: 'USD',
        data_embarque: '30/05/2023',
        part_number: 'STE-A4-001',
        descricao_item: 'Heat exchanger plate',
        quantidade_inicial_pedido: 100,
        unidade: 'UN',
        valor_por_unidade_item: 330.00,
        ncm: '8471.30.19',
      },
    },
    {
      linha_arquivo: 3,
      numero_pedido: 'PO-2026/011',
      status: 'ok',
      alertas: [],
      dados: {
        numero_pedido: 'PO-2026/011',
        exportador: 'Dongguan Electronics Ltd.',
        incoterm: 'CIF',
        moeda_pedido: 'USD',
        part_number: 'DGL-7700',
        descricao_item: 'Motor controller board',
        quantidade_inicial_pedido: 50,
        unidade: 'UN',
        valor_por_unidade_item: 85.00,
        ncm: '8544.42.90',
      },
    },
    {
      linha_arquivo: 4,
      numero_pedido: 'PO-2026/003',
      status: 'aviso',
      alertas: alertasDuplicata,
      dados: {
        numero_pedido: 'PO-2026/003',
        exportador: 'Berlin GmbH',
        incoterm: 'DAP',
        moeda_pedido: 'EUR',
        part_number: 'BRL-220V',
        descricao_item: 'Power supply unit',
        quantidade_inicial_pedido: 200,
        unidade: 'UN',
        valor_por_unidade_item: 45.00,
      },
    },
    {
      linha_arquivo: 5,
      numero_pedido: 'PO-2026/012',
      status: 'aviso',
      alertas: [{
        campo: 'ncm',
        tipo: 'formato_invalido',
        mensagem: 'NCM "8471" parece incompleto (esperado 8 digitos)',
        nivel: 'aviso',
      }],
      dados: {
        numero_pedido: 'PO-2026/012',
        exportador: 'Guangzhou Supplies Co.',
        incoterm: 'FOB',
        moeda_pedido: 'USD',
        part_number: 'GZH-CAB-001',
        descricao_item: 'Cable assembly',
        quantidade_inicial_pedido: 500,
        unidade: 'MT',
        valor_por_unidade_item: 3.20,
        ncm: '8471',
      },
    },
    {
      linha_arquivo: 6,
      numero_pedido: null,
      status: 'erro',
      alertas: [
        {
          campo: 'quantidade_inicial_pedido',
          tipo: 'valor_negativo',
          mensagem: 'Quantidade deve ser maior que zero',
          nivel: 'erro',
        },
      ],
      dados: { quantidade_inicial_pedido: -5, exportador: 'Unknown Supplier' },
    },
  ]

  // Dados brutos para visualização do documento original
  const dados_brutos = linhas.map(l => ({
    linha: l.linha_arquivo,
    valores: Object.fromEntries(
      Object.entries(l.dados).map(([k, v]) => [k, String(v ?? '')])
    ),
  }))

  return {
    preview_id: `mock-preview-${Date.now()}`,
    total_linhas: linhas.length,
    total_pedidos: 4,
    total_itens: 6,
    mapeamento,
    confianca_global: 83,
    memoria_aplicada: false,
    linhas,
    dados_brutos,
  }
}

/** Mock de confirmar: simula criacao de pedidos e insere no MOCK_PEDIDOS_RESPONSE */
function mockSmartImportConfirmar(payload: SmartImportConfirmar): SmartImportResultado {
  const ids = payload.linhas_incluidas.map(
    (_, i) => `pedi_imp_${Date.now()}_${i}`
  )
  const atualizados = Object.values(payload.decisoes_duplicatas).filter(d => d === 'sobrescrever').length
  const pulados     = Object.values(payload.decisoes_duplicatas).filter(d => d === 'pular').length
  const criados     = ids.length - atualizados - pulados

  // Adiciona pedidos mockados ao store em memória para aparecerem na lista
  const novosPedidos: Pedido[] = ids.map((id, i) => ({
    id,
    tenant_id: 'tenant-demo',
    company_id: 'company-demo',
    tipo_operacao: 'importacao' as const,
    numero_pedido: `PO-IMP-${Date.now()}-${i + 1}`,
    status: 'rascunho' as const,
    importacao_exportador_id: null,
    exportacao_importador_id: null,
    nome_exportador: 'Importado via Smart Import',
    nome_fabricante: null,
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    valor_total_pedido: 0,
    casas_decimais_valor_pedido: 2,
    casas_decimais_quantidade_pedido: 2,
    unidade_comercializada_pedido: 'UN',
    quantidade_total_pedido: 0,
    quantidade_transferida_total: 0,
    condicao_pagamento: null,
    data_emissao_pedido: new Date().toISOString().split('T')[0],
    numero_proforma: null,
    numero_invoice: null,
    referencia_importador: null,
    referencia_exportador: null,
    referencia_fabricante: null,
    itens: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  MOCK_PEDIDOS_RESPONSE.data.unshift(...novosPedidos)
  MOCK_PEDIDOS_RESPONSE.total += novosPedidos.length

  return {
    criados,
    atualizados,
    pulados,
    erros: [],
    ids_criados: ids,
  }
}

// ── Exportacao ────────────────────────────────────────────────────────────────

export const exportacaoApi = {
  exportar: (formato: 'csv' | 'excel', filtros?: Record<string, string>) =>
    request<Blob>('/api/v1/pedidos/exportar', {
      method: 'POST',
      body: JSON.stringify({ formato, filtros }),
    }),
}

// ── Duplicar Pedidos ──────────────────────────────────────────────────────────

export const pedidoDuplicarApi = {
  /** Preview: verifica o que será copiado/resetado conforme config do tenant */
  preview: (ids: string[]) =>
    request<{
      config: { numero_auto: boolean; copiar_datas: boolean; status_inicial: string }
      pedidos: { id: string; numero_pedido: string; total_itens: number }[]
    }>('/api/v1/pedidos/duplicacoes/preview', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }).catch(err => {
      if (import.meta.env.DEV) return mockDuplicarPreview(ids)
      throw err
    }),

  /** Confirmar duplicação de um ou mais pedidos */
  confirmar: (payload: DuplicarPayload) =>
    request<DuplicarResultado>('/api/v1/pedidos/duplicacoes/confirmar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockDuplicarConfirmar(payload)
      throw err
    }),

  /** Duplicar itens dentro de um pedido */
  duplicarItens: (payload: DuplicarItemPayload) =>
    request<DuplicarResultado>('/api/v1/pedidos/duplicacoes/itens', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockDuplicarItens(payload)
      throw err
    }),
}

function mockDuplicarPreview(ids: string[]): {
  config: { numero_auto: boolean; copiar_datas: boolean; status_inicial: string }
  pedidos: { id: string; numero_pedido: string; total_itens: number }[]
} {
  let pedidos = MOCK_PEDIDOS_RESPONSE.data
    .filter(p => ids.includes(p.id))
    .map(p => ({ id: p.id, numero_pedido: p.numero_pedido, total_itens: p.itens?.length ?? 0 }))

  if (pedidos.length === 0) {
    pedidos = ids.map((id, idx) => ({
      id,
      numero_pedido: `PO-${String(idx + 1).padStart(4, '0')}`,
      total_itens: 3,
    }))
  }

  return {
    config: { numero_auto: false, copiar_datas: false, status_inicial: 'copiar' },
    pedidos,
  }
}

function mockDuplicarConfirmar(payload: DuplicarPayload): DuplicarResultado {
  const criados = payload.ids.map(id => {
    const original = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === id)
    const numeroNovo = payload.numeros?.[id] ?? `PO-COPY-${Date.now()}-${id.slice(-4)}`
    const novoId = `pedi_dup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    if (original) {
      const copia = { ...original, id: novoId, numero_pedido: numeroNovo, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      MOCK_PEDIDOS_RESPONSE.data.push(copia)
      MOCK_PEDIDOS_RESPONSE.total = MOCK_PEDIDOS_RESPONSE.data.length
    }
    return { original_id: id, novo_id: novoId, numero_pedido: numeroNovo }
  })
  return { criados, erros: [] }
}

function mockDuplicarItens(payload: DuplicarItemPayload): DuplicarResultado {
  const pedido = MOCK_PEDIDOS_RESPONSE.data.find(p => p.id === payload.pedido_id)
  const criados: DuplicarResultado['criados'] = []

  if (pedido?.itens) {
    for (const itemId of payload.item_ids) {
      const original = (pedido.itens as Record<string, unknown>[]).find((i) => (i as { id: string }).id === itemId)
      if (original) {
        const novoId = `pite_dup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        (pedido.itens as Record<string, unknown>[]).push({ ...original, id: novoId })
        criados.push({ original_id: itemId, novo_id: novoId, numero_pedido: pedido.numero_pedido })
      }
    }
  }

  return { criados, erros: [] }
}

// ── Excluir Pedidos ───────────────────────────────────────────────────────────

export const pedidoExcluirApi = {
  /** Preview: quais pedidos podem ser excluídos, quais estão bloqueados */
  preview: (ids: string[]) =>
    request<ExcluirPreview>('/api/v1/pedidos/exclusoes/preview', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  /** Confirmar exclusão definitiva dos pedidos permitidos */
  confirmar: (ids: string[]) =>
    request<ExcluirResultado>('/api/v1/pedidos/exclusoes/confirmar', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  /** Excluir itens de um pedido */
  excluirItens: (pedido_id: string, item_ids: string[]) =>
    request<ExcluirResultado>('/api/v1/pedidos/exclusoes/itens', {
      method: 'POST',
      body: JSON.stringify({ pedido_id, item_ids }),
    }),
}

const STATUS_PERMITIDOS_TODOS = ['rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado']

function getMockStatusPermitidos(): string[] {
  try {
    const raw = localStorage.getItem('pedido:regras_config')
    if (raw) {
      const config = JSON.parse(raw) as { excluir?: { statusPermitidos?: string[] } }
      return config?.excluir?.statusPermitidos ?? STATUS_PERMITIDOS_TODOS
    }
  } catch { /* ignore */ }
  return STATUS_PERMITIDOS_TODOS
}

function mockExcluirPreview(ids: string[]): ExcluirPreview {
  // Gera preview a partir dos IDs recebidos (não filtra contra mock estático).
  // IDs reais (CUIDs) nunca batem com IDs do mock — defesa contra array vazio.
  const permitidos: ExcluirPreview['permitidos'] = ids.map((id, i) => ({
    id,
    numero_pedido: `MOCK-${i + 1}`,
    total_itens: 0,
  }))
  return { permitidos, bloqueados: [] }
}

function mockExcluirConfirmar(ids: string[]): ExcluirResultado {
  const antes = MOCK_PEDIDOS_RESPONSE.data.length
  const itensRemovidos = MOCK_PEDIDOS_RESPONSE.data
    .filter(p => ids.includes(p.id))
    .reduce((acc, p) => acc + (p.itens?.length ?? 0), 0)
  MOCK_PEDIDOS_RESPONSE.data = MOCK_PEDIDOS_RESPONSE.data.filter(p => !ids.includes(p.id))
  MOCK_PEDIDOS_RESPONSE.total = MOCK_PEDIDOS_RESPONSE.data.length
  return { excluidos: antes - MOCK_PEDIDOS_RESPONSE.data.length, itens_excluidos: itensRemovidos, pedidos_excluidos_por_sem_item: 0 }
}

function mockExcluirItens(_pedido_id: string, item_ids: string[]): ExcluirResultado {
  return { excluidos: 0, itens_excluidos: item_ids.length, pedidos_excluidos_por_sem_item: 0 }
}

// ── Regras de Configuração ────────────────────────────────────────────────────

export interface RegrasConfigBackend {
  duplicar_numero_auto: boolean
  duplicar_copiar_datas: boolean
  duplicar_status_inicial: string
  excluir_status_permitidos: string[]
  excluir_pedido_sem_item_permitido: boolean
  excluir_confirmar_com_preview: boolean
  alerta_numero_duplicado: boolean
  alerta_valor_total_divergente: boolean
  alerta_quantidade_total_divergente: boolean
  alerta_quantidade_pronta_divergente: boolean
  alerta_peso_liquido_divergente: boolean
  alerta_peso_bruto_divergente: boolean
  alerta_cubagem_divergente: boolean
}

const REGRAS_CONFIG_DEFAULT: RegrasConfigBackend = {
  duplicar_numero_auto: false,
  duplicar_copiar_datas: false,
  duplicar_status_inicial: 'copiar',
  excluir_status_permitidos: [],
  excluir_pedido_sem_item_permitido: true,
  excluir_confirmar_com_preview: true,
  alerta_numero_duplicado: true,
  alerta_valor_total_divergente: true,
  alerta_quantidade_total_divergente: true,
  alerta_quantidade_pronta_divergente: true,
  alerta_peso_liquido_divergente: true,
  alerta_peso_bruto_divergente: true,
  alerta_cubagem_divergente: true,
}

export const configRegrasApi = {
  obter: (): Promise<RegrasConfigBackend> =>
    request<RegrasConfigBackend>('/api/v1/pedidos/config/regras').catch(err => {
      if (import.meta.env.DEV) return REGRAS_CONFIG_DEFAULT
      throw err
    }),

  salvar: (dados: Partial<RegrasConfigBackend>): Promise<RegrasConfigBackend> =>
    request<RegrasConfigBackend>('/api/v1/pedidos/config/regras', {
      method: 'PUT',
      body: JSON.stringify(dados),
    }).catch(err => {
      if (import.meta.env.DEV) return { ...REGRAS_CONFIG_DEFAULT, ...dados }
      throw err
    }),
}

// ── Anexos ────────────────────────────────────────────────────────────────────

export const anexosApi = {
  listar: (vinculo: 'pedido' | 'item', vinculo_id: string) =>
    request<Anexo[]>(`/api/v1/pedidos/anexos?vinculo=${vinculo}&vinculo_id=${encodeURIComponent(vinculo_id)}`).catch(
      err => {
        if (import.meta.env.DEV) return mockAnexosListar(vinculo, vinculo_id)
        throw err
      }
    ),

  upload: (
    vinculo: 'pedido' | 'item',
    vinculo_id: string,
    arquivo: File,
    descricao?: string,
    categoria?: string
  ) => {
    const form = new FormData()
    form.append('arquivo', arquivo)
    form.append('vinculo', vinculo)
    form.append('vinculo_id', vinculo_id)
    if (descricao) form.append('descricao', descricao)
    if (categoria) form.append('categoria', categoria)
    // Não enviar Content-Type — o browser define boundary automaticamente para multipart
    return fetch('/api/v1/pedidos/anexos', {
      method: 'POST',
      headers: {
        'x-id-organizacao': context.idOrganizacao,
        'x-id-usuario': context.userId,
        'x-nome-usuario': context.userName,
        'x-chave-interna-servico': import.meta.env.VITE_CHAVE_INTERNA_SERVICO || '',
      },
      body: form,
    }).then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: 'Erro desconhecido' } }))
        throw new Error(err.error?.message || `HTTP ${res.status}`)
      }
      return res.json() as Promise<AnexoUploadResultado>
    }).catch(err => {
      if (import.meta.env.DEV) return mockAnexosUpload(vinculo, vinculo_id, arquivo, descricao, categoria)
      throw err
    })
  },

  download: (id: string) =>
    fetch(`/api/v1/pedidos/anexos/${id}/download`, {
      headers: {
        'x-id-organizacao': context.idOrganizacao,
        'x-id-usuario': context.userId,
        'x-nome-usuario': context.userName,
        'x-chave-interna-servico': import.meta.env.VITE_CHAVE_INTERNA_SERVICO || '',
      },
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.blob()
    }),

  excluir: (id: string) =>
    request<void>(`/api/v1/pedidos/anexos/${id}`, { method: 'DELETE' }).catch(err => {
      if (import.meta.env.DEV) { mockAnexosExcluir(id); return }
      throw err
    }),
}

// ── Template do Pedido (geração de PDF/documentos) ──────────────────────────

/** Tipo local simplificado para o gerenciador de templates da aba Configurações */
export interface TemplateLocal {
  id: string
  nome: string
  conteudo: string
  criadoEm: string
}

export const templatePedidoApi = {
  listarTemplates: () =>
    request<{ data: TemplateLocal[] }>('/api/v1/pedidos/template-pedido').catch(err => {
      if (import.meta.env.DEV) return { data: mockPdfTemplatesLocal() }
      throw err
    }),

  gerar: (payload: GerarPdfPayload) =>
    request<GerarPdfResultado>('/api/v1/pedidos/template-pedido/gerar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockPdfGerar(payload)
      throw err
    }),

  criarTemplate: (data: { nome: string; conteudo: string }) =>
    request<TemplateLocal>('/api/v1/pedidos/template-pedido', {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch(err => {
      if (import.meta.env.DEV) {
        const novo: TemplateLocal = {
          id: `tpl_${Date.now()}`,
          nome: data.nome,
          conteudo: data.conteudo,
          criadoEm: new Date().toISOString().slice(0, 10),
        }
        return novo
      }
      throw err
    }),

  atualizarTemplate: (id: string, data: { nome: string; conteudo: string }) =>
    request<TemplateLocal>(`/api/v1/pedidos/template-pedido/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).catch(err => {
      if (import.meta.env.DEV) {
        return { id, nome: data.nome, conteudo: data.conteudo, criadoEm: new Date().toISOString().slice(0, 10) } as TemplateLocal
      }
      throw err
    }),

  deletarTemplate: (id: string) =>
    request<void>(`/api/v1/pedidos/template-pedido/${id}`, { method: 'DELETE' }).catch(err => {
      if (import.meta.env.DEV) return
      throw err
    }),
}

// ── Gerar Documento (multilíngue) ────────────────────────────────────────────

export const gerarDocumentoApi = {
  gerar: (payload: GerarDocumentoPayload) =>
    request<GerarPdfResultado>('/api/v1/pedidos/template-pedido/documentos/gerar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).catch(err => {
      if (import.meta.env.DEV) return mockGerarDocumento(payload)
      throw err
    }),
}

function mockGerarDocumento(payload: GerarDocumentoPayload): GerarPdfResultado {
  const tipoLabel: Record<string, string> = {
    pedido_de_venda: 'Pedido de Venda', proforma_invoice: 'Proforma Invoice', invoice: 'Invoice',
  }
  const html = `<!DOCTYPE html><html lang="${payload.idioma}"><head>
<meta charset="utf-8"><title>${tipoLabel[payload.tipo_documento] ?? payload.tipo_documento}</title>
<style>body{font-family:sans-serif;margin:40px;color:#1e293b}h1{color:#3b82f6}table{border-collapse:collapse;width:100%}td,th{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}</style>
</head><body>
<h1>[MOCK] ${tipoLabel[payload.tipo_documento] ?? payload.tipo_documento}</h1>
<p><strong>Idioma:</strong> ${payload.idioma.toUpperCase()} &nbsp;&nbsp; <strong>Pedido:</strong> ${payload.pedido_id}</p>
<p style="color:#94a3b8;font-size:12px">Este é um documento de demonstração gerado em ambiente de desenvolvimento.</p>
<table><thead><tr><th>Campo</th><th>Valor</th></tr></thead><tbody>
<tr><td>Tipo</td><td>${tipoLabel[payload.tipo_documento]}</td></tr>
<tr><td>Idioma</td><td>${payload.idioma.toUpperCase()}</td></tr>
<tr><td>Pedido ID</td><td>${payload.pedido_id}</td></tr>
<tr><td>Salvar como anexo</td><td>${payload.salvar_como_anexo ? 'Sim' : 'Não'}</td></tr>
</tbody></table>
</body></html>`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  return {
    url_download: URL.createObjectURL(blob),
    anexo_id: `anexo_doc_${Date.now()}`,
    is_pdf: false,
  }
}

// ── Mocks Anexos ──────────────────────────────────────────────────────────────

const _mockAnexosStore: Anexo[] = []

function mockAnexosListar(vinculo: 'pedido' | 'item', vinculo_id: string): Anexo[] {
  return _mockAnexosStore.filter(a => a.vinculo === vinculo && a.vinculo_id === vinculo_id)
}

function mockAnexosUpload(
  vinculo: 'pedido' | 'item',
  vinculo_id: string,
  arquivo: File,
  descricao?: string,
  categoria?: string
): AnexoUploadResultado {
  const id = `anx_mock_${Date.now()}`
  const anexo: Anexo = {
    id,
    tenant_id: context.idOrganizacao,
    vinculo,
    vinculo_id,
    nome_arquivo: arquivo.name,
    tipo_arquivo: arquivo.type || 'application/octet-stream',
    tamanho_bytes: arquivo.size,
    descricao,
    categoria,
    storage_key: `${context.idOrganizacao}/${vinculo_id}/${id}_${arquivo.name}`,
    uploaded_by: context.userId,
    uploaded_at: new Date().toISOString(),
  }
  _mockAnexosStore.push(anexo)
  return { id, nome_arquivo: arquivo.name, tamanho_bytes: arquivo.size, url_download: `/api/v1/pedidos/anexos/${id}/download` }
}

function mockAnexosExcluir(id: string): void {
  const idx = _mockAnexosStore.findIndex(a => a.id === id)
  if (idx !== -1) _mockAnexosStore.splice(idx, 1)
}

// ── Mocks PDF ─────────────────────────────────────────────────────────────────

function mockPdfTemplatesLocal(): TemplateLocal[] {
  return [
    { id: 'tpl_mock_001', nome: 'Template PO Padrão',       conteudo: '<h1>{{numero_pedido}}</h1>',  criadoEm: '2026-04-01' },
    { id: 'tpl_mock_002', nome: 'Template Proforma Invoice', conteudo: '<h1>{{exportador}}</h1>',    criadoEm: '2026-04-02' },
  ]
}

function mockPdfGerar(payload: GerarPdfPayload): GerarPdfResultado {
  const anexoId = `anx_pdf_mock_${Date.now()}`
  const tpl = mockPdfTemplatesLocal().find(t => t.id === payload.template_id)
  const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>${tpl?.nome ?? 'Template'}</title>
<style>body{font-family:sans-serif;margin:40px;color:#1e293b}h1{color:#3b82f6}pre{background:#f8fafc;padding:16px;border-radius:8px;font-size:13px;overflow:auto}</style>
</head><body>
<h1>[MOCK] ${tpl?.nome ?? 'Template personalizado'}</h1>
<p><strong>Pedido:</strong> ${payload.pedido_id}</p>
<p style="color:#94a3b8;font-size:12px">Este é um documento de demonstração gerado em ambiente de desenvolvimento.</p>
${tpl ? `<p><strong>Conteúdo do template:</strong></p><pre>${tpl.conteudo.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>` : ''}
</body></html>`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  return {
    url_download: URL.createObjectURL(blob),
    anexo_id: anexoId,
    is_pdf: false,
  }
}

// ── Colunas do Usuário ────────────────────────────────────────────────────────

/** Mock com 3 colunas de exemplo para desenvolvimento */
export const colunasUsuarioApi = {
  listar: (): Promise<ColunaUsuario[]> =>
    request<ColunaUsuario[]>('/api/v1/pedidos/colunas-usuario').catch(err => {
      console.error('[colunasUsuarioApi.listar] ERRO REAL:', err)
      throw err
    }),

  criar: (
    data: Omit<ColunaUsuario, 'id' | 'tenant_id' | 'chave' | 'created_by' | 'created_at'>,
  ): Promise<ColunaUsuario> =>
    request<ColunaUsuario>('/api/v1/pedidos/colunas-usuario', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<ColunaUsuario>): Promise<ColunaUsuario> =>
    request<ColunaUsuario>(`/api/v1/pedidos/colunas-usuario/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  excluir: (id: string): Promise<void> =>
    request<void>(`/api/v1/pedidos/colunas-usuario/${id}`, { method: 'DELETE' }).catch(err => {
      console.error('[colunasUsuarioApi.excluir] ERRO REAL:', err)
      throw err
    }),

  reordenar: (ids: string[]): Promise<void> =>
    request<void>('/api/v1/pedidos/colunas-usuario/reordenar', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  salvarValores: (
    vinculo: 'pedido' | 'item',
    vinculo_id: string,
    valores: Record<string, string>,
  ): Promise<void> =>
    request<void>('/api/v1/pedidos/colunas-usuario/valores', {
      method: 'POST',
      body: JSON.stringify({ vinculo, vinculo_id, valores }),
    }).catch(err => {
      console.error('[colunasUsuarioApi.salvarValores] ERRO REAL:', err)
      throw err
    }),

  listarValores: (vinculo: 'pedido' | 'item', vinculo_id: string): Promise<ValorColunaUsuario[]> =>
    request<ValorColunaUsuario[]>(
      `/api/v1/pedidos/colunas-usuario/valores?vinculo=${vinculo}&vinculo_id=${vinculo_id}`,
    ).catch(err => {
      console.error('[colunasUsuarioApi.listarValores] ERRO REAL:', err)
      throw err
    }),

  /**
   * Análise semântica via Gemini.
   * Retorna { gemini: false } quando GEMINI_GABI_ENABLED=false no servidor —
   * o chamador deve usar o fallback determinístico local.
   */
  gabiAnalisar: async (
    expressao: string,
    campos: Array<{ chave: string; label: string; unidade?: string; papel?: string; tipo?: string }>,
  ): Promise<{ gemini: false } | { gemini: true; titulo: string; texto: string; sugestao?: string }> => {
    try {
      const res = await request<{ gemini: boolean; titulo?: string; texto?: string; sugestao?: string }>(
        '/api/v1/pedidos/colunas-usuario/analisar-via-gabi',
        { method: 'POST', body: JSON.stringify({ expressao, campos }) },
      )
      if (res.gemini && res.titulo && res.texto) {
        return { gemini: true, titulo: res.titulo, texto: res.texto, sugestao: res.sugestao }
      }
      return { gemini: false }
    } catch {
      return { gemini: false } // falha de rede → fallback silencioso
    }
  },
}

// ── Cards Customizados API ───────────────────────────────────────────────────

export const cardsUsuarioApi = {
  listar: (): Promise<CardUsuario[]> =>
    request<CardUsuario[]>('/api/v1/pedidos/cards-usuario'),

  criar: (
    data: Omit<CardUsuario, 'id' | 'tenant_id' | 'created_by' | 'created_at'>,
  ): Promise<CardUsuario> =>
    request<CardUsuario>('/api/v1/pedidos/cards-usuario', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  atualizar: (id: string, data: Partial<CardUsuario>): Promise<CardUsuario> =>
    request<CardUsuario>(`/api/v1/pedidos/cards-usuario/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  excluir: (id: string): Promise<void> =>
    request<void>(`/api/v1/pedidos/cards-usuario/${id}`, { method: 'DELETE' }),

  reordenar: (ids: string[]): Promise<void> =>
    request<void>('/api/v1/pedidos/cards-usuario/reordenar', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
}

// ── Dashboard API ─────────────────────────────────────────────────────────────

export interface DashboardKpis {
  period: string
  // Contagens
  total_pedidos: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  pedidos_concluidos: number
  pedidos_consolidados: number
  pedidos_cancelados: number
  pedidos_rascunho: number
  pedidos_atrasados: number
  pedidos_sem_exportador: number
  pedidos_importacao: number
  pedidos_exportacao: number
  // Financeiro
  valor_total: number
  valor_total_brl: number
  moedas_sem_taxa: string[]
  cobertura_pendente: number
  ticket_medio: number
  // Quantidades
  qtd_total: number
  itens_prontos: number
  qtd_inicial_total: number
  qtd_atual_total: number
  qtd_transferida_total: number
  valor_itens_total: number
  // Derivadas
  taxa_atraso: number
  taxa_conclusao_itens: number
  exposicao_financeira: number
  taxa_transferencia: number
  // Completude documental
  pedidos_sem_incoterm: number
  pedidos_sem_fabricante: number
  pedidos_sem_proforma: number
  pedidos_sem_invoice: number
  pedidos_sem_ref_imp: number
  // Moedas e logística
  moedas_distintas: number
  peso_bruto_total: number
  cubagem_total: number
  // Itens
  itens_sem_cobertura: number
  qtd_cancelada_total: number
  [key: string]: number | string | string[]
}

export interface DashboardTrendBucket {
  month: string
  label: string
  total_pedidos: number
  valor_total: number
  cobertura_pendente: number
  valor_itens_total: number
  [key: string]: string | number
}

export interface DashboardTrendResponse {
  period: string
  granularity: string
  value: DashboardTrendBucket[]
}

export interface DashboardDistributionGroup {
  status: string
  count: number
  valor_total: number
}

export interface DashboardDistributionResponse {
  period: string
  value: DashboardDistributionGroup[]
}

// ── Tipos de Insights da Gabi ─────────────────────────────────────────────────

export interface GabiInsightItem {
  id: string
  variante: 'default' | 'warn'
  tag: string
  texto: string
  stat?: { label: string; valor: string }
  textoLink?: string
  rota?: string
}

export interface DashboardInsightsResponse {
  period: string
  role: string
  insights: GabiInsightItem[]
}

export interface DashboardBundleResponse {
  period: string
  kpis: DashboardKpis
  prev_kpis: DashboardKpis | null
  trend: DashboardTrendResponse
  cached: boolean
  computed_at: string
}

// ─────────────────────────────────────────────────────────────────────────────

function appendIdsWorkspacesParam(params: URLSearchParams, idsWorkspaces?: string[]): void {
  if (idsWorkspaces?.length) {
    params.set('ids_workspaces', idsWorkspaces.join(','))
  }
}

export const dashboardApi = {
  bundle: async (
    period: string,
    range?: { from: string; to: string },
    idsWorkspaces?: string[],
    trendPeriod = '12m',
    granularity = 'month',
  ): Promise<DashboardBundleResponse> => {
    const params = new URLSearchParams({ period, trend_period: trendPeriod, granularity })
    if (range) { params.set('from', range.from); params.set('to', range.to) }
    appendIdsWorkspacesParam(params, idsWorkspaces)
    const raw = await request<unknown>(`/api/v1/pedidos/dashboard/bundle?${params}`)
    return dashboardBundleResponseSchema.parse(raw) as unknown as DashboardBundleResponse
  },

  kpis: async (
    period: string,
    range?: { from: string; to: string },
    idsWorkspaces?: string[],
  ): Promise<DashboardKpis> => {
    const params = new URLSearchParams({ period })
    if (range) { params.set('from', range.from); params.set('to', range.to) }
    appendIdsWorkspacesParam(params, idsWorkspaces)
    const raw = await request<unknown>(`/api/v1/pedidos/dashboard/kpis?${params}`)
    // Mandamento 06 + 09: contrato bilateral via Zod (ver dashboard-schemas.ts)
    return dashboardKpisSchema.parse(raw) as unknown as DashboardKpis
  },

  trend: async (
    period: string,
    granularity = 'month',
    idsWorkspaces?: string[],
  ): Promise<DashboardTrendResponse> => {
    const params = new URLSearchParams({
      period,
      granularity,
    })
    appendIdsWorkspacesParam(params, idsWorkspaces)
    const raw = await request<unknown>(`/api/v1/pedidos/dashboard/tendencia?${params}`)
    return dashboardTrendResponseSchema.parse(raw) as unknown as DashboardTrendResponse
  },

  distribution: async (period: string, idsWorkspaces?: string[]): Promise<DashboardDistributionResponse> => {
    const params = new URLSearchParams({ period })
    appendIdsWorkspacesParam(params, idsWorkspaces)
    const raw = await request<unknown>(`/api/v1/pedidos/dashboard/distribuicao?${params}`)
    return dashboardDistributionResponseSchema.parse(raw) as unknown as DashboardDistributionResponse
  },

  /** Fase 1+2+3 — insights ranqueados por role + comportamento + LLM */
  insights: async (
    period: string,
    range?: { from: string; to: string },
    idsWorkspaces?: string[],
  ): Promise<DashboardInsightsResponse> => {
    const params = new URLSearchParams({ period })
    if (range) { params.set('from', range.from); params.set('to', range.to) }
    appendIdsWorkspacesParam(params, idsWorkspaces)
    const raw = await request<unknown>(`/api/v1/pedidos/dashboard/insights?${params}`)
    return dashboardInsightsResponseSchema.parse(raw) as unknown as DashboardInsightsResponse
  },

  /** Status NCM — itens com NCM inválido segundo o Portal Único Siscomex */
  ncmStatus: (idsWorkspaces?: string[]) => {
    const params = new URLSearchParams()
    appendIdsWorkspacesParam(params, idsWorkspaces)
    const qs = params.toString()
    return request<{
      invalidos:         string[]
      total_invalidos:   number
      itens_invalidos:   number
      total_verificados: number
      sem_sync:          boolean
      ultima_sync:       string | null
    }>(`/api/v1/pedidos/dashboard/status-ncm${qs ? `?${qs}` : ''}`)
  },
}

// ── Dashboard Painéis ─────────────────────────────────────────────────────────

export interface DashboardPainel {
  id:           string
  tenant_id:    string
  user_id:      string
  nome:         string
  ordem:        number
  is_visivel:   boolean
  widgets_json: string
  created_at:   string
  updated_at:   string
}

export const paineisDashboardApi = {
  listar: (): Promise<{ data: DashboardPainel[] }> =>
    request<{ data: DashboardPainel[] }>('/api/v1/pedidos/dashboard/paineis')
      .catch(() => ({ data: [] })),

  criar: (nome: string): Promise<{ data: DashboardPainel }> =>
    request<{ data: DashboardPainel }>('/api/v1/pedidos/dashboard/paineis', {
      method: 'POST',
      body: JSON.stringify({ nome }),
    }),

  atualizar: (id: string, patch: Partial<Pick<DashboardPainel, 'nome' | 'is_visivel' | 'widgets_json'>>): Promise<{ data: DashboardPainel }> =>
    request<{ data: DashboardPainel }>(`/api/v1/pedidos/dashboard/paineis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),

  reordenar: (ids: string[]): Promise<{ data: { reordenado: boolean } }> =>
    request<{ data: { reordenado: boolean } }>('/api/v1/pedidos/dashboard/paineis/reordenar', {
      method: 'PUT',
      body: JSON.stringify({ ids }),
    }),

  deletar: (id: string): Promise<{ data: { deletado: boolean } }> =>
    request<{ data: { deletado: boolean } }>(`/api/v1/pedidos/dashboard/paineis/${id}`, {
      method: 'DELETE',
    }),
}

// ── Kanban Preferências ───────────────────────────────────────────────────────

export const kanbanConfigApi = {
  obterPreferencias: (): Promise<{ data: import('./types').KanbanPreferencias | null }> =>
    request<{ data: import('./types').KanbanPreferencias | null }>('/api/v1/pedidos/kanban/preferencias')
      .catch(() => ({ data: null })),

  salvarPreferencias: (payload: import('./types').KanbanPreferencias): Promise<{ data: import('./types').KanbanPreferencias }> =>
    request<{ data: import('./types').KanbanPreferencias }>('/api/v1/pedidos/kanban/preferencias', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  restaurarPadrao: (): Promise<{ data: { restaurado: boolean } }> =>
    request<{ data: { restaurado: boolean } }>('/api/v1/pedidos/kanban/preferencias', {
      method: 'DELETE',
    }),
}

// ── Casas Decimais ────────────────────────────────────────────────────────────

export interface CasasDecimaisConfigPayload {
  valor_total_pedido:              number
  valor_por_unidade_item:             number
  quantidade_total_pedido: number
  quantidade_pronta_pedido_total:  number
  saldo_itens_do_pedido:           number
  quantidade_transferida_total:    number
  quantidade_cancelada_total_pedido: number
  peso_liquido_total_pedido:       number
  peso_bruto_total_pedido:         number
  cubagem_total_pedido:            number
  /** Formato de exibição de datas — padrão 'DD/MM/AAAA' */
  formato_data?:                   string
}

export interface CasasDecimaisAuditoria {
  total_pedidos:     number
  total_itens:       number
  migracao_iniciada: boolean
}

export const casasDecimaisApi = {
  obter: (): Promise<{ data: CasasDecimaisConfigPayload }> =>
    request<{ data: CasasDecimaisConfigPayload }>('/api/v1/pedidos/configuracoes/casas-decimais')
      .catch(() => ({ data: {
        valor_total_pedido: 2, valor_por_unidade_item: 2, quantidade_total_pedido: 2,
        quantidade_pronta_pedido_total: 2, saldo_itens_do_pedido: 2,
        quantidade_transferida_total: 2, quantidade_cancelada_total_pedido: 2,
        peso_liquido_total_pedido: 3, peso_bruto_total_pedido: 3, cubagem_total_pedido: 3,
      } })),

  salvar: (payload: CasasDecimaisConfigPayload & { confirmar?: boolean }): Promise<{ data: CasasDecimaisConfigPayload; auditoria: CasasDecimaisAuditoria }> =>
    request<{ data: CasasDecimaisConfigPayload; auditoria: CasasDecimaisAuditoria }>('/api/v1/pedidos/configuracoes/casas-decimais', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
}

// ── Saldo Formula (fórmula do Saldo do Pedido por workspace) ─────────────────

export interface SaldoFormulaPayload {
  formula_expressao: string
  is_default: boolean
}

const SALDO_FORMULA_DEFAULT: SaldoFormulaPayload = {
  formula_expressao: 'quantidade_total_pedido - quantidade_transferida_total - quantidade_cancelada_total_pedido',
  is_default: true,
}

export const saldoFormulaApi = {
  obter: (): Promise<{ data: SaldoFormulaPayload }> =>
    request<{ data: SaldoFormulaPayload }>('/api/v1/pedidos/configuracoes/saldo-formula')
      .catch(() => ({ data: SALDO_FORMULA_DEFAULT })),

  salvar: (formula_expressao: string): Promise<{ data: SaldoFormulaPayload }> =>
    request<{ data: SaldoFormulaPayload }>('/api/v1/pedidos/configuracoes/saldo-formula', {
      method: 'PUT',
      body: JSON.stringify({ formula_expressao }),
    }),

  restaurarPadrao: (): Promise<{ data: SaldoFormulaPayload }> =>
    request<{ data: SaldoFormulaPayload }>('/api/v1/pedidos/configuracoes/saldo-formula', {
      method: 'DELETE',
    }),
}

// ── Snapshot — Política de Atualização (pedido_snapshot_atualizacao) ─────────

import type { SnapshotAtualizacaoPolicy } from './types'

export const SNAPSHOT_ATUALIZACAO_DEFAULT: SnapshotAtualizacaoPolicy = {
  atualiza_importador:  false,
  atualiza_exportador:  false,
  atualiza_fabricante:  false,
  atualiza_agente:      false,
  atualiza_despachante: false,
  atualiza_armador:     false,
  atualiza_ope:         false,
  gatilho_emissao:      true,
  gatilho_embarque:     false,
  gatilho_desembaraco:  false,
}

export function obterSnapshotAtualizacaoPolicy(): Promise<{ data: SnapshotAtualizacaoPolicy | null }> {
  return request<{ data: SnapshotAtualizacaoPolicy | null }>('/api/v1/pedidos/config/snapshot-atualizacao-pedido')
    .catch(() => ({ data: null }))
}

export function salvarSnapshotAtualizacaoPolicy(payload: SnapshotAtualizacaoPolicy): Promise<{ data: SnapshotAtualizacaoPolicy }> {
  return request<{ data: SnapshotAtualizacaoPolicy }>('/api/v1/pedidos/config/snapshot-atualizacao-pedido', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

// ── Snapshot Status — banner retroativo (FASE 06E — Frente 3) ────────────────

import { z } from 'zod'

export const PAPEIS_SNAPSHOT = ['empresa', 'ope', 'ncm', 'moeda', 'unidade'] as const
export type PapelSnapshot = typeof PAPEIS_SNAPSHOT[number]

const PapelStatusSchema = z.object({
  papel:                z.enum(PAPEIS_SNAPSHOT),
  congelado_em:         z.string().nullable(),
  motivos_congelamento: z.array(z.string()),
  total_registros:      z.number().int().nonnegative(),
})

const SnapshotStatusResponseSchema = z.object({
  data: z.object({
    id_pedido: z.string(),
    papeis:    z.array(PapelStatusSchema),
  }),
})

export type PapelSnapshotStatus  = z.infer<typeof PapelStatusSchema>
export type SnapshotStatusPedido = z.infer<typeof SnapshotStatusResponseSchema>['data']

export function obterSnapshotStatusPedido(idPedido: string): Promise<SnapshotStatusPedido | null> {
  return request<unknown>(`/api/v1/pedidos/${pid(idPedido)}/snapshot-status`)
    .then(raw => SnapshotStatusResponseSchema.parse(raw).data)
    .catch(err => {
      // Backend pode estar offline ou pedido sem snapshot — não bloqueia a UI
      if (import.meta.env.DEV) console.warn('[api] obterSnapshotStatusPedido falhou:', err)
      return null
    })
}

// ── Eventos de Comportamento (GABI Insights — Fase 2) ────────────────────────

export type EventoComportamentoTipo =
  | 'route_visited'
  | 'filter_applied'
  | 'widget_clicked'
  | 'column_viewed'
  | 'insight_clicked'

export interface EventoComportamentoPayload {
  route?:        string
  filter_field?: string
  filter_value?: string
  widget_id?:    string
  column_key?:   string
  insight_id?:   string
}

export const pedidoEventoApi = {
  /** Fire-and-forget — falha silenciosa nao propaga pro usuario (UX intencional). */
  registrar: (event: EventoComportamentoTipo, payload: EventoComportamentoPayload): Promise<void> =>
    request<void>('/api/v1/pedidos/eventos-comportamento', {
      method: 'POST',
      body: JSON.stringify({ event, payload }),
    }),
}
