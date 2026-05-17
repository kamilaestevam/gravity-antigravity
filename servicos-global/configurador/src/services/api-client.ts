// services/apiClient.ts
// Cliente HTTP centralizado para o frontend do Configurador.
// Substitui o catalogService (localStorage) por chamadas reais ao backend.

import { z } from 'zod'

const BASE_URL = '/api'

// ─── Auth token provider (Clerk JWT) ──────────────────────────────────────

let _getToken: (() => Promise<string | null>) | null = null

/** Configura o provider de token Clerk para todas as chamadas API */
export function setAuthTokenProvider(getToken: () => Promise<string | null>) {
  _getToken = getToken
}

/**
 * Tenta obter o token Clerk de múltiplas formas:
 * 1. Provider configurado via setAuthTokenProvider
 * 2. Cookie __session do Clerk (fallback)
 * 3. window.Clerk?.session?.getToken() (fallback global)
 */
async function getAuthToken(): Promise<string | null> {
  // 1. Provider configurado
  if (_getToken) {
    try {
      const token = await _getToken()
      if (token) return token
    } catch { /* fallback */ }
  }

  // 2. Clerk global (injetado pelo ClerkProvider)
  try {
    const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    if (clerk?.session?.getToken) {
      const token = await clerk.session.getToken()
      if (token) return token
    }
  } catch { /* fallback */ }

  return null
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers: extraHeaders, ...restOptions } = options
  const authHeaders: Record<string, string> = {}
  const token = await getAuthToken()
  if (token) authHeaders['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(extraHeaders as Record<string, string>),
    },
    ...restOptions,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error(body?.error?.message ?? body?.message ?? `HTTP ${res.status}`)
  }

  // 204 No Content / corpo vazio: não tentar parsear JSON (lança SyntaxError em delete bem-sucedido)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }

  // Defesa extra: se o servidor não declarar JSON, devolve texto ou undefined sem quebrar
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const text = await res.text()
    return (text ? (text as unknown as T) : (undefined as T))
  }

  return res.json()
}

/**
 * Baixa um arquivo de uma rota autenticada com requireAuth (Bearer token).
 * window.open()/<a href> não enviam Authorization → 401. Solução: fetch como blob
 * via apiFetch e disparar download programático.
 */
export async function apiDownload(url: string, fallbackName = 'arquivo'): Promise<void> {
  const res = await apiFetch(url)
  if (!res.ok) {
    throw new Error(`Falha ao baixar (${res.status}): ${await res.text()}`)
  }
  const blob = await res.blob()
  const cd = res.headers.get('Content-Disposition') ?? ''
  const match = cd.match(/filename="?([^"]+)"?/i)
  const filename = match ? decodeURIComponent(match[1]) : fallbackName
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

/** fetch autenticado com token Clerk — retorna Response bruta (como fetch nativo) */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { headers: extraHeaders, ...restOptions } = options
  const authHeaders: Record<string, string> = {}
  const token = await getAuthToken()
  if (token) authHeaders['Authorization'] = `Bearer ${token}`

  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(extraHeaders as Record<string, string>),
    },
    ...restOptions,
  })
}

// ─── Tipos de resposta ──────────────────────────────────────────────────────

export interface ProductApi {
  id: string
  name: string
  slug: string
  description: string
  status: 'ATIVO' | 'SUSPENSO' | 'EM_BREVE' | 'LEGADO' | 'INATIVO'
  launch_date: string | null
  has_setup: boolean
  setup_price: string | null
  setup_currency: string
  billing_type: string
  unit_price: string
  unit_currency: string
  minimum_price: string
  minimum_currency: string
  total_price: string | null
  total_currency: string
  user_limit_type: 'ILIMITADO' | 'LIMITADO'
  base_users_qty: number | null
  extra_user_price: string | null
  extra_user_currency: string
  helpdesk_hours: number
  extra_hour_price: string | null
  extra_hour_currency: string
  backend_module: string | null
  target_audience: string | null
  gabi_quota_mensal: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  price_tiers: FaixaPrecoApi[]
  negotiations?: NegociacaoEspecialApi[]
}

export interface FaixaPrecoApi {
  id: string
  product_id: string
  range_from: number
  range_to: number | null
  price: string
  currency: string
}

// NegociacaoEspecialApi — espelha model ProdutoGravityNegociacaoEspecial do Prisma
// Paridade Absoluta: nomes idênticos ao schema (configurador/prisma/schema.prisma)
export interface NegociacaoEspecialApi {
  id_negociacao_especial: string
  id_produto_gravity: string
  id_organizacao: string
  nome_organizacao_negociacao_especial: string
  acordo_negociacao_especial: string
  /** Decimal serializado como string ("1500.00"); null = só descritivo */
  valor_unitario_negociacao_especial: string | null
  moeda_negociacao_especial: string
  data_inicio_negociacao_especial: string | null
  data_fim_negociacao_especial: string | null
  ilimitado_prazo_negociacao_especial: boolean
  data_criacao_negociacao_especial: string
  data_atualizacao_negociacao_especial: string
}

// PARIDADE ABSOLUTA: espelha model Workspace + back-relations renomeadas.
// Backend retorna estes nomes diretamente (sem tradução).
export interface WorkspaceApi {
  id_workspace: string
  nome_workspace: string
  subdominio_workspace: string | null
  cnpj_workspace?: string | null
  status_workspace: string
  data_criacao_workspace?: string
  quantidade_usuarios_workspace?: number
  _count?: { vinculos_workspace: number }
}

export interface UsuarioOrgApi {
  id_usuario: string
  nome_usuario: string
  email_usuario: string
  tipo_usuario: string
  data_criacao_usuario: string
}

export interface ConfiguracaoProdutoOrgApi {
  chave_produto_configuracao_produto_gravity: string
  ativo_configuracao_produto_gravity: boolean
  data_atualizacao_configuracao_produto_gravity: string
}

export interface OrganizacaoApi {
  id_organizacao: string
  nome_organizacao: string
  subdominio_organizacao: string
  status_organizacao: string
  cnpj_organizacao?: string | null
  estado_organizacao?: string | null
  cidade_organizacao?: string | null
  segmento_organizacao?: string | null
  tipo_organizacao?: string | null
  /** Indica se a organização hospeda colaboradores Gravity. Usado no
   *  modal de convite admin para filtrar orgs onde SUPER_ADMIN/ADMIN
   *  podem ser criados. Decisão dono 2026-05-12. */
  hospeda_colaboradores_gravity?: boolean
  data_criacao_organizacao: string
  _count?: { usuarios: number; workspaces: number }
  usuarios?: UsuarioOrgApi[]
  workspaces?: WorkspaceApi[]
  assinaturas?: Array<{
    status_assinatura_produto_gravity: string
    data_fim_teste_assinatura_produto_gravity: string | null
  }>
  configuracoes_produto?: ConfiguracaoProdutoOrgApi[]
}

// ─── Zod schemas bilaterais (Mand. 06 e 09) ─────────────────────────────────
// Espelham as respostas das rotas /api/v1/organizacoes/me e /api/v1/me/workspaces.
// Atualizar SEMPRE no mesmo commit em que o backend mudar o payload.

// Schema Zod para a resposta do PATCH /admin/organizacoes/:id_organizacao
// Mand. 09 (contrato bilateral): atualizar SEMPRE em sincronia com o
// `select` do prisma.update em `server/routes/admin.ts` (PATCH handler).
export const organizacaoAdminResponseSchema = z.object({
  id_organizacao:         z.string(),
  nome_organizacao:       z.string(),
  subdominio_organizacao: z.string(),
  status_organizacao:     z.string(),
  cnpj_organizacao:       z.string().nullable().optional(),
  estado_organizacao:     z.string().nullable().optional(),
  cidade_organizacao:     z.string().nullable().optional(),
  segmento_organizacao:   z.string().nullable().optional(),
  tipo_organizacao:       z.string().nullable().optional(),
  // Flag para filtrar orgs no modal de convite admin: SUPER_ADMIN/ADMIN só
  // podem ser criados em organizações que hospedam colaboradores Gravity.
  hospeda_colaboradores_gravity: z.boolean().optional(),
})
export const adminOrganizacaoUpdateResponseSchema = z.object({
  organizacao: organizacaoAdminResponseSchema,
})
export type AdminOrganizacaoUpdateResponse = z.infer<typeof adminOrganizacaoUpdateResponseSchema>

export const meResponseSchema = z.object({
  organizacao: z.object({
    id_organizacao: z.string(),
    nome_organizacao: z.string(),
    subdominio_organizacao: z.string(),
    status_organizacao: z.string(),
    cnpj_organizacao: z.string().nullable().optional(),
    estado_organizacao: z.string().nullable().optional(),
    cidade_organizacao: z.string().nullable().optional(),
    segmento_organizacao: z.string().nullable().optional(),
    tipo_organizacao: z.string().nullable().optional(),
    data_criacao_organizacao: z.union([z.string(), z.date()]),
    _count: z.object({
      usuarios: z.number(),
      workspaces: z.number(),
    }).optional(),
    assinaturas: z.array(z.object({
      status_assinatura_produto_gravity: z.string(),
      data_fim_teste_assinatura_produto_gravity: z.union([z.string(), z.date()]).nullable(),
    })).optional(),
  }),
})

export type MeResponse = z.infer<typeof meResponseSchema>

export const workspaceItemSchema = z.object({
  id_workspace: z.string(),
  nome_workspace: z.string(),
  subdominio_workspace: z.string().nullable().optional(),
  cnpj_workspace: z.string().nullable().optional(),
  status_workspace: z.string(),
  data_criacao_workspace: z.union([z.string(), z.date()]),
  quantidade_usuarios_workspace: z.number().optional(),
  _count: z.object({ vinculos_workspace: z.number() }).optional(),
})

export type WorkspaceItem = z.infer<typeof workspaceItemSchema>

export const workspacesResponseSchema = z.object({
  workspaces: z.array(workspaceItemSchema),
})

export type WorkspacesResponse = z.infer<typeof workspacesResponseSchema>

export const workspaceSingleResponseSchema = z.object({
  workspace: workspaceItemSchema,
  subdominio_solicitado: z.string().optional(),
  subdominio_ajustado: z.boolean().optional(),
})

export type WorkspaceSingleResponse = z.infer<typeof workspaceSingleResponseSchema>

// Resposta da rota GET /api/v1/me/sugestoes-subdominio — preview ao vivo
// do subdomínio que o sistema atribuiria, dado um nome/base.
export const sugestaoSubdominioResponseSchema = z.object({
  subdominio_solicitado: z.string(),
  subdominio_sugerido: z.string(),
  subdominio_ajustado: z.boolean(),
})

export type SugestaoSubdominioResponse = z.infer<typeof sugestaoSubdominioResponseSchema>

// ─── Schemas de Usuários da Organização ─────────────────────────────────────
// Espelham as respostas das rotas /api/v1/usuarios* (ver server/routes/usuario.ts).
// Atualizar SEMPRE no mesmo commit em que o backend mudar o payload (Mand. 09).

const tipoUsuarioWorkspaceEnum = z.enum(['MASTER', 'PADRAO', 'FORNECEDOR'])
const tipoUsuarioEnum = z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR'])

export const usuarioWorkspaceItemSchema = z.object({
  id_usuario_workspace: z.string(),
  id_workspace: z.string(),
  tipo_usuario_workspace: tipoUsuarioWorkspaceEnum,
  ativo_usuario_workspace: z.boolean(),
})
export type UsuarioWorkspaceItem = z.infer<typeof usuarioWorkspaceItemSchema>

export const usuarioListItemSchema = z.object({
  id_usuario: z.string(),
  nome_usuario: z.string(),
  email_usuario: z.string().email(),
  tipo_usuario: tipoUsuarioEnum,
  acesso_workspaces_futuros: z.boolean(),
  data_criacao_usuario: z.union([z.string(), z.date()]),
  /** Status do usuário (3 valores no DTO — alinhado com decisão 2026-05-12):
   *  - 'CONVIDADO': convite Clerk pendente (`id_clerk_usuario.startsWith('pending_')`).
   *                 Derivado em runtime — não persistido (evita duplicar fonte
   *                 da verdade do Clerk no fluxo de invite).
   *  - 'ATIVO' | 'INATIVO': valor persistido em `Usuario.status_usuario`
   *                          (enum StatusUsuario no schema Prisma).
   *  PATCH `/api/v1/usuarios/:id/status` muda ATIVO ↔ INATIVO. requireAuth
   *  bloqueia INATIVO com 401 USUARIO_INATIVO. */
  status_usuario: z.enum(['ATIVO', 'INATIVO', 'CONVIDADO']),
  usuario_workspaces: z.array(usuarioWorkspaceItemSchema),
})
export type UsuarioListItem = z.infer<typeof usuarioListItemSchema>

export const listarUsuariosResponseSchema = z.object({
  usuarios: z.array(usuarioListItemSchema),
})

export const convidarUsuarioResponseSchema = z.object({
  message: z.string(),
  usuario: z.object({
    id_usuario: z.string(),
    email_usuario: z.string().email(),
    tipo_usuario: tipoUsuarioEnum,
    acesso_workspaces_futuros: z.boolean(),
    /** Sempre 'CONVIDADO' no momento do convite — transição para 'ATIVO'
     *  ocorre no primeiro login (via fallback requireAuth.ts). */
    status_usuario: z.enum(['ATIVO', 'CONVIDADO']).optional().default('CONVIDADO'),
  }),
})

export const usuarioWorkspaceResponseSchema = z.object({
  usuario_workspace: z.object({
    id_usuario_workspace: z.string(),
    id_organizacao: z.string(),
    id_usuario: z.string(),
    id_workspace: z.string(),
    tipo_usuario_workspace: tipoUsuarioWorkspaceEnum,
    ativo_usuario_workspace: z.boolean(),
    data_criacao_usuario_workspace: z.union([z.string(), z.date()]),
    data_atualizacao_usuario_workspace: z.union([z.string(), z.date()]),
  }),
})

export const alterarTipoUsuarioResponseSchema = z.object({
  usuario: z.object({
    id_usuario: z.string(),
    email_usuario: z.string().email(),
    tipo_usuario: tipoUsuarioEnum,
    acesso_workspaces_futuros: z.boolean(),
  }),
})

export const alterarAcessoWorkspacesFuturosResponseSchema = z.object({
  usuario: z.object({
    id_usuario: z.string(),
    tipo_usuario: tipoUsuarioEnum,
    acesso_workspaces_futuros: z.boolean(),
  }),
})

/** Response do PATCH /usuarios/:id/status — Mand. 09 (contrato bilateral). */
export const atualizarStatusUsuarioResponseSchema = z.object({
  usuario: z.object({
    id_usuario: z.string(),
    email_usuario: z.string().email(),
    status_usuario: z.enum(['ATIVO', 'INATIVO']),
  }),
})
export type AtualizarStatusUsuarioResponse = z.infer<typeof atualizarStatusUsuarioResponseSchema>

export const substituirWorkspacesResponseSchema = z.object({
  workspaces: z.array(z.string()),
})

// ─── Permissões granulares (formato canônico <slug>:<secao>:<acao>) ─────────
// Mandamento 09 — schema bilateral. Espelha SetPermissoesUsuarioSchema /
// permissoesResponseSchema em servicos-global/configurador/server/routes/usuario.ts.
// Regex importado do shared/ (FONTE ÚNICA — Mandamento 07).

import { PERMISSAO_REGEX_PATTERN } from '../../shared/index.js'

const permissaoStringClientSchema = z.string().regex(
  new RegExp(PERMISSAO_REGEX_PATTERN),
  'Formato inválido — esperado <slug>:<secao>:<acao>',
)

export const permissaoUsuarioItemApiSchema = z.object({
  id_organizacao: z.string(),
  id_workspace: z.string(),
  id_usuario: z.string(),
  id_produto_gravity: z.string(),
  permissao_usuario: permissaoStringClientSchema,
  permissao_usuario_concedido_por: z.string(),
  data_criacao_permissao_usuario: z.union([z.string(), z.date()]),
})

export const listarPermissoesUsuarioResponseSchema = z.object({
  permissoes: z.array(permissaoUsuarioItemApiSchema),
})

export const configurarPermissoesResponseSchema = z.object({
  permissoes: z.array(z.string()),
  total_inseridas: z.number(),
  total_removidas: z.number(),
})

// Produtos do workspace (catálogo + status_produto_gravity)
export const produtoWorkspaceCatalogoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  status: z.string(), // 'ATIVO' | 'EM_BREVE' | 'SUSPENSO' | 'LEGADO' | 'INATIVO'
}).nullable()

export const produtoWorkspaceItemSchema = z.object({
  id: z.string(),
  product_key: z.string(),
  is_active: z.boolean(),
  activated_at: z.union([z.string(), z.date()]),
  catalog: produtoWorkspaceCatalogoSchema,
})

export const produtosWorkspaceResponseSchema = z.object({
  products: z.array(produtoWorkspaceItemSchema),
})

export type ProdutoWorkspaceItem = z.infer<typeof produtoWorkspaceItemSchema>
export type PermissaoUsuarioItem = z.infer<typeof permissaoUsuarioItemApiSchema>

export interface PaginationApi {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ConfigProdutoApi {
  id: string
  tenant_id: string
  product_key: string
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Admin: Catálogo de Produtos ────────────────────────────────────────────

export const adminProductsApi = {
  async list(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.search) query.set('search', params.search)
    if (params?.status) query.set('status', params.status)
    const qs = query.toString()
    return request<{ products: ProductApi[]; pagination: PaginationApi }>(
      `/v1/admin/produtos-gravity${qs ? `?${qs}` : ''}`
    )
  },

  async getById(id: string) {
    return request<{ product: ProductApi }>(`/v1/admin/produtos-gravity/${id}`)
  },

  async create(data: Record<string, unknown>) {
    return request<{ product: ProductApi }>('/v1/admin/produtos-gravity', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Record<string, unknown>) {
    return request<{ product: ProductApi }>(`/v1/admin/produtos-gravity/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async toggleStatus(id: string) {
    return request<{ product: ProductApi }>(`/v1/admin/produtos-gravity/${id}/status`, {
      method: 'PATCH',
    })
  },

  async delete(id: string, opts?: { force?: boolean; ackNegotiations?: boolean }) {
    const query = new URLSearchParams()
    if (opts?.force) query.set('force', 'true')
    if (opts?.ackNegotiations) query.set('ack_negotiations', 'true')
    const qs = query.toString()
    return request<{ deleted: boolean; id: string; mode: 'hard' | 'soft' }>(
      `/v1/admin/produtos-gravity/${id}${qs ? `?${qs}` : ''}`,
      { method: 'DELETE' },
    )
  },

  async getAvailableSlugs() {
    return request<{ available: string[]; all: string[] }>('/v1/admin/produtos-gravity/slugs-disponiveis')
  },
}

// ─── Admin: Organizações ────────────────────────────────────────────────────
// Endpoints do painel admin para gestão cross-org. Mand. 09 — Zod bilateral.

export const listarWorkspacesOrganizacaoAdminResponseSchema = z.object({
  workspaces: z.array(z.object({
    id_workspace: z.string(),
    nome_workspace: z.string(),
    subdominio_workspace: z.string().nullable(),
    status_workspace: z.string(),
    data_criacao_workspace: z.union([z.string(), z.date()]),
  })),
})

export const adminOrganizacoesApi = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams()
    if (params?.page)   query.set('page',   String(params.page))
    if (params?.limit)  query.set('limit',  String(params.limit))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return request<{ organizacoes: OrganizacaoApi[]; pagination: PaginationApi }>(
      `/v1/admin/organizacoes${qs ? `?${qs}` : ''}`
    )
  },

  async getById(id_organizacao: string) {
    return request<{ organizacao: OrganizacaoApi }>(`/v1/admin/organizacoes/${id_organizacao}`)
  },

  async create(data: { nome_organizacao: string; subdominio_organizacao: string; cnpj_organizacao?: string }) {
    return request<{ organizacao: OrganizacaoApi }>('/v1/admin/organizacoes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateStatus(id_organizacao: string, status_organizacao: string) {
    return request<{ organizacao: OrganizacaoApi }>(`/v1/admin/organizacoes/${id_organizacao}`, {
      method: 'PATCH',
      body: JSON.stringify({ status_organizacao }),
    })
  },

  async update(
    id_organizacao: string,
    data: {
      nome_organizacao?:       string
      subdominio_organizacao?: string
      cnpj_organizacao?:       string
      estado_organizacao?:     string
      cidade_organizacao?:     string
      segmento_organizacao?:   string
      tipo_organizacao?:       string
    },
  ) {
    return request<{ organizacao: OrganizacaoApi }>(`/v1/admin/organizacoes/${id_organizacao}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async updateWorkspaceStatus(id_workspace: string, status_workspace: 'ATIVO' | 'INATIVO') {
    return request<{ workspace: WorkspaceApi & { id_organizacao: string } }>(
      `/v1/admin/workspaces/${id_workspace}`,
      { method: 'PATCH', body: JSON.stringify({ status_workspace }) }
    )
  },

  async getStats() {
    return request<{
      stats: {
        totalOrganizacoes:     number
        ativasOrganizacoes:    number
        suspensasOrganizacoes: number
        totalUsuarios:         number
      }
    }>('/v1/admin/estatisticas-plataforma')
  },

  /**
   * Lista workspaces ATIVOs de uma organização — alimenta o editor de
   * vínculos no Admin Panel (lazy-load no expand da linha do usuário).
   * Auth: SUPER_ADMIN + ADMIN (requireGravityAdmin no backend).
   */
  async listarWorkspaces(id_organizacao: string) {
    const raw = await request<unknown>(
      `/v1/admin/organizacoes/${encodeURIComponent(id_organizacao)}/workspaces`,
    )
    return listarWorkspacesOrganizacaoAdminResponseSchema.parse(raw)
  },
}

// ─── Admin: Usuários Globais ────────────────────────────────────────────────

// PARIDADE ABSOLUTA: espelha model Usuario + relações.
export interface UsuarioGlobalApi {
  id_usuario: string
  nome_usuario: string
  email_usuario: string
  tipo_usuario: string
  data_criacao_usuario: string
  id_organizacao: string
  /** Status do usuário (3 valores no DTO — alinhado com decisão 2026-05-12):
   *  - 'CONVIDADO': convite Clerk pendente (derivado em runtime)
   *  - 'ATIVO' | 'INATIVO': valor persistido em Usuario.status_usuario */
  status_usuario: 'ATIVO' | 'INATIVO' | 'CONVIDADO'
  organizacao: {
    nome_organizacao: string
    subdominio_organizacao: string
    /** Flag que define se SAdmin pode atribuir SUPER_ADMIN/ADMIN a usuários
     *  desta org (decisão dono 2026-05-11). */
    hospeda_colaboradores_gravity: boolean
  }
  memberships: Array<{
    id_usuario_workspace: string
    id_workspace: string
    tipo_usuario_workspace: string
    ativo_usuario_workspace: boolean
    workspace: { nome_workspace: string; subdominio_workspace: string | null }
  }>
}

export const adminUsuariosApi = {
  async listar(params?: { page?: number; search?: string }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return request<{ usuarios: UsuarioGlobalApi[]; pagination: PaginationApi }>(
      `/v1/admin/usuarios${qs ? `?${qs}` : ''}`
    )
  },

  /**
   * Convida usuário cross-org via admin panel.
   *
   * Schema bilateral (Mand. 09): backend exige `id_organizacao_alvo` + payload
   * `.strict()` que rejeita campos desconhecidos. `workspaces_alvo` obrigatório
   * para PADRAO/FORNECEDOR (validado no service + backend).
   *
   * Apenas SUPER_ADMIN pode chamar (ADMIN é read-only — backend retorna 403).
   */
  async convidar(data: {
    id_organizacao_alvo: string
    email_usuario: string
    nome_usuario: string
    tipo_usuario: string
    workspaces_alvo?: 'all' | string[]
  }) {
    return request<{
      message: string
      usuario: {
        id_usuario: string
        email_usuario: string
        tipo_usuario: string
        acesso_workspaces_futuros: boolean
        workspaces_vinculados: number
      }
    }>(
      '/v1/admin/usuarios/convidar',
      { method: 'POST', body: JSON.stringify(data) }
    )
  },
}

// ─── Admin: Billing / Faturas (BillingProvider abstrato) ────────────────────
// Shape estável independente do provider (Conta Azul / Itaú / Santander / ASAAS / ...).
// Ver servicos-global/configurador/server/lib/billing/types.ts

export type GravityInvoiceStatus =
  | 'RASCUNHO'
  | 'EMITIDA'
  | 'ENVIADA'
  | 'PAGA'
  | 'EM_ATRASO'
  | 'ANULADA'
  | 'INCOBRAVEL'

export interface GravityInvoiceLineItemApi {
  description: string
  amount_cents: number
  quantity: number
  currency: string
}

export interface GravityInvoiceDocumentApi {
  type: 'boleto' | 'nfe' | 'receipt' | 'pdf' | 'other'
  name: string
  url: string
  size_bytes?: number
}

export interface GravityInvoiceCustomerApi {
  id: string
  name: string
  email: string | null
  tenant_id: string | null
}

export interface GravityInvoiceApi {
  id: string
  number: string | null
  status: GravityInvoiceStatus
  customer: GravityInvoiceCustomerApi
  amount_due_cents: number
  amount_paid_cents: number
  currency: string
  due_date: string | null
  competencia: string | null
  description: string
  line_items: GravityInvoiceLineItemApi[]
  documents: GravityInvoiceDocumentApi[]
  hosted_url: string | null
  created_at: string
  provider: string
  provider_id: string
}

export interface BillingPaginationApi {
  has_more: boolean
  next_cursor: string | null
}

export interface ListInvoicesResponseApi {
  invoices: GravityInvoiceApi[]
  pagination: BillingPaginationApi
  provider: string
}

export interface CreateInvoiceRequest {
  customer_tenant_id: string
  description: string
  line_items: Array<{
    description: string
    amount_cents: number
    quantity: number
  }>
  due_date?: string
  competencia?: string
  customer_email?: string
  currency?: string
  auto_finalize?: boolean
  metadata?: Record<string, string>
}

export const adminBillingApi = {
  async listInvoices(params?: { cursor?: string; limit?: number; status?: GravityInvoiceStatus; customer_id?: string }) {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.status) query.set('status', params.status)
    if (params?.customer_id) query.set('customer_id', params.customer_id)
    const qs = query.toString()
    return request<ListInvoicesResponseApi>(`/v1/admin/financeiro-admin${qs ? `?${qs}` : ''}`)
  },

  async getInvoice(id: string) {
    return request<{ invoice: GravityInvoiceApi }>(`/v1/admin/financeiro-admin/${id}`)
  },

  async createInvoice(data: CreateInvoiceRequest) {
    return request<{ invoice: GravityInvoiceApi }>('/v1/admin/financeiro-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async voidInvoice(id: string, reason?: string) {
    return request<{ invoice: GravityInvoiceApi }>(`/v1/admin/financeiro-admin/${id}/anular`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  },

  async sendInvoice(id: string) {
    return request<{ invoice: GravityInvoiceApi }>(`/v1/admin/financeiro-admin/${id}/enviar`, {
      method: 'POST',
    })
  },
}

// ─── Admin: Deploy Logs ─────────────────────────────────────────────────────
// Histórico manual de deploys da plataforma Gravity.

export type DeployEnvironment = 'DESENVOLVIMENTO' | 'HOMOLOGACAO' | 'PRODUCAO' | 'TODOS'
export type DeployStatus = 'SUCESSO' | 'FALHOU' | 'REVERTIDO' | 'EM_ANDAMENTO'

export interface DeployApi {
  id: string
  deploy_number: number
  area: string
  version: string
  description: string
  environment: DeployEnvironment
  status: DeployStatus
  deployed_by: string
  deployed_by_user_id: string | null
  deployed_at: string
  created_at: string
}

export interface ListDeploysResponseApi {
  deploys: DeployApi[]
  pagination: PaginationApi
}

export interface CreateDeployRequest {
  area: string
  version: string
  description: string
  environment?: DeployEnvironment
  status?: DeployStatus
  deployed_at?: string
}

export const adminDeploysApi = {
  async list(params?: {
    page?: number
    limit?: number
    area?: string
    environment?: DeployEnvironment
    status?: DeployStatus
    search?: string
    from_date?: string
    to_date?: string
  }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.area) query.set('area', params.area)
    if (params?.environment) query.set('environment', params.environment)
    if (params?.status) query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    if (params?.from_date) query.set('from_date', params.from_date)
    if (params?.to_date) query.set('to_date', params.to_date)
    const qs = query.toString()
    return request<ListDeploysResponseApi>(`/v1/admin/deploy${qs ? `?${qs}` : ''}`)
  },

  async create(data: CreateDeployRequest) {
    return request<{ deploy: DeployApi }>('/v1/admin/deploy', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return request<{ deleted: boolean; id: string }>(`/v1/admin/deploy/${id}`, {
      method: 'DELETE',
    })
  },
}

// ─── Admin: Testes (model Teste, tabela `teste`) ────────────────────────────
// 4 clients alinhados aos models do Prisma:
//   - adminTestesApi          → model Teste            (recurso /testes)
//   - adminAgendamentosTesteApi → model TesteAgendamento (recurso /agendamentos-teste)
//   - adminPlanosTesteApi     → model TestePlano       (recurso /planos-teste)
//   - adminMetricasLlmApi     → model LLMMetricas      (recurso /metricas-llm)

export interface TesteApi {
  id: string
  created_at: string
  type: string
  module: string
  test_name: string
  result: string
  duration: string
  error_log: string | null
  ai_analysis: Record<string, unknown> | null
}

/** Plano de teste — espelha colunas do model TestePlano + atalhos do registry. */
export interface PlanoTesteApi {
  id: string                 // id_plano_teste
  tipo: string               // tipo_plano_teste — UNI | CON | FUN | CRO | E2E | PEN
  escopo: string             // escopo_plano_teste — ADMIN | CONFIG | PEDIDO | ...
  sublocal: string           // sublocal_plano_teste
  modulo?: string
  tela?: string
  criticidade?: string       // criticidade_plano_teste
  planoFile?: string
  specFile?: string
  componenteFile?: string
  passosTotal?: number       // passos_total_plano_teste
  casosTotal?: number
  coberturaPercentual?: number  // cobertura_pct_plano_teste
  status?: string            // status_plano_teste
  criadoEm?: string
}

/** Recurso /testes — model Teste */
export const adminTestesApi = {
  /** GET /api/v1/admin/testes */
  async listar() {
    return request<{ logs: TesteApi[] }>('/v1/admin/testes')
  },
  /** POST /api/v1/admin/testes/disparar */
  async disparar(opts?: { planos?: string[]; modulos?: string[] }) {
    return request<{ started: boolean }>('/v1/admin/testes/disparar', {
      method: 'POST',
      body: JSON.stringify(opts ?? {}),
    })
  },
  /** GET /api/v1/admin/testes/status */
  async status() {
    return request<{ running: boolean }>('/v1/admin/testes/status')
  },
  /** POST /api/v1/admin/testes/:id_teste/reanalisar */
  async reanalisar(id_teste: string) {
    return request<{ analysis: Record<string, unknown> }>(`/v1/admin/testes/${id_teste}/reanalisar`, { method: 'POST' })
  },
  /** POST /api/v1/admin/testes/:id_teste/aplicar-correcao */
  async aplicarCorrecao(id_teste: string) {
    return request<{ applied: boolean; arquivo: string }>(`/v1/admin/testes/${id_teste}/aplicar-correcao`, { method: 'POST' })
  },
  /** POST /api/v1/admin/testes/:id_teste/rejeitar */
  async rejeitar(id_teste: string, motivo: string) {
    return request<{ rejected: boolean }>(`/v1/admin/testes/${id_teste}/rejeitar`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    })
  },
  /** POST /api/v1/admin/testes/pentest */
  async dispararPentest(payload: { targetUrl: string; scanType?: 'baseline' | 'full' | 'api' }) {
    return request<{ scanId: string }>('/v1/admin/testes/pentest', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

// ─── Admin: Agendamentos de Teste (model TesteAgendamento) ──────────────────

export const adminAgendamentosTesteApi = {
  /** GET /api/v1/admin/agendamentos-teste */
  async listar() {
    return request<{ schedules: Array<Record<string, unknown>> }>('/v1/admin/agendamentos-teste')
  },
  /** POST /api/v1/admin/agendamentos-teste */
  async criar(data: Record<string, unknown>) {
    return request<{ schedule: Record<string, unknown> }>('/v1/admin/agendamentos-teste', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  /** PATCH /api/v1/admin/agendamentos-teste/:id_agendamento_teste */
  async atualizar(id_agendamento_teste: string, data: Record<string, unknown>) {
    return request<{ schedule: Record<string, unknown> }>(`/v1/admin/agendamentos-teste/${id_agendamento_teste}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
  /** DELETE /api/v1/admin/agendamentos-teste/:id_agendamento_teste */
  async deletar(id_agendamento_teste: string) {
    return request<{ deleted: boolean }>(`/v1/admin/agendamentos-teste/${id_agendamento_teste}`, { method: 'DELETE' })
  },
}

// ─── Admin: Planos de Teste (model TestePlano) ──────────────────────────────

export const adminPlanosTesteApi = {
  /** GET /api/v1/admin/planos-teste?escopo=X */
  async listar(escopo?: string) {
    const qs = escopo ? `?escopo=${encodeURIComponent(escopo)}` : ''
    return request<{ planos: PlanoTesteApi[] }>(`/v1/admin/planos-teste${qs}`)
  },
  /** POST /api/v1/admin/planos-teste/gerar */
  async gerar(data: {
    escopo: string
    sublocal: string
    tela: string
    rota: string
    componenteFilePath: string
    criticidade: string
    temDinheiro?: boolean
  }) {
    return request<{ plan: Record<string, unknown> }>('/v1/admin/planos-teste/gerar', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  /** POST /api/v1/admin/planos-teste/:id_plano_teste/expandir */
  async expandir(id_plano_teste: string, payload: { componenteFilePath: string }) {
    return request<{ plan: Record<string, unknown> }>(`/v1/admin/planos-teste/${id_plano_teste}/expandir`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  /** POST /api/v1/admin/planos-teste/:id_plano_teste/gerar-spec */
  async gerarSpec(id_plano_teste: string) {
    return request<{ specPath: string }>(`/v1/admin/planos-teste/${id_plano_teste}/gerar-spec`, { method: 'POST' })
  },
  /** POST /api/v1/admin/planos-teste/extrair-testids */
  async extrairTestids(payload: { componenteFilePath: string; escopo: string; sublocal: string }) {
    return request<{ mapping: Record<string, unknown> }>('/v1/admin/planos-teste/extrair-testids', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

// ─── Admin: Métricas LLM (model LLMMetricas) ────────────────────────────────

export const adminMetricasLlmApi = {
  /** GET /api/v1/admin/metricas-llm */
  async listar() {
    return request<{
      cache: Record<string, unknown>
      daily: Array<Record<string, unknown>>
    }>('/v1/admin/metricas-llm')
  },
}

// ─── Admin: Platform Config (Visão Geral) ───────────────────────────────────

export interface PlatformConfigApi {
  id: string
  nome_organizacao: string
  subdominio_organizacao: string
  cnpj_organizacao: string | null
  estado_organizacao: string | null
  cidade_organizacao: string | null
  segmento_organizacao: string | null
  tipo_organizacao: string | null
  data_criacao_organizacao: string
}

export const adminPlatformApi = {
  async getConfig() {
    return request<{ config: PlatformConfigApi | null }>('/v1/admin/visao-geral')
  },

  async updateConfig(data: {
    nome_organizacao?: string
    cnpj_organizacao?: string
    estado_organizacao?: string
    cidade_organizacao?: string
    segmento_organizacao?: string
    tipo_organizacao?: string
  }) {
    return request<{ config: PlatformConfigApi }>('/v1/admin/visao-geral', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// ─── Admin: NCM Sync (Portal Único Siscomex) ───────────────────────────────
// Backend: configurador (porta 8005) é proxy para o serviço Cadastros (porta 8031).
// Tipos refletem o payload do cadastros (sem id_organizacao — catálogo global).

export interface NcmSyncStatusApi {
  ultima_sync:   string | null
  status:        'EXECUTANDO' | 'SUCESSO' | 'ERRO' | null
  total_ativos:  number
  erros_48h:     number
  desatualizado: boolean
}

export interface NcmSyncLogApi {
  id_ncm_sync_log:               string
  data_inicio_ncm_sync_log:      string
  data_conclusao_ncm_sync_log:   string | null
  status_ncm_sync_log:           'EXECUTANDO' | 'SUCESSO' | 'ERRO'
  total_ncm_sync_log:            number
  adicionados_ncm_sync_log:      number
  alterados_ncm_sync_log:        number
  removidos_ncm_sync_log:        number
  origem_ncm_sync_log:           'JOB' | 'MANUAL'
  disparado_por_ncm_sync_log:    string | null
  mensagem_erro_ncm_sync_log:    string | null
  data_criacao_ncm_sync_log:     string
  data_atualizacao_ncm_sync_log: string
}

// ── Tipos de schedule ──────────────────────────────────────────────────────

export interface NcmNotificador {
  id:       string
  nome:     string
  contato:  string
  condicao: 'Apenas Erros' | 'Sempre'
  canal:    'E-mail' | 'WhatsApp' | 'Ambos'
}

export interface NcmAgendamentoConfigApi {
  ativo:           boolean
  cron_expressao:  string
  notificadores:   NcmNotificador[]
  proxima_execucao: string | null
  atualizado_em:   string | null
}

export interface NcmSyncResultado {
  syncId:      string
  total:       number
  adicionados: number
  alterados:   number
  removidos:   number
  duracaoMs:   number
}

// ─── Admin: Certificados Digitais Siscomex ───────────────────────────────────

export interface CertificadoMetadataApi {
  id: string
  nome: string
  cnpj: string
  cn: string
  serial_number: string
  emissor: string
  validade_inicio: string
  validade_fim: string
  ativo: boolean
  data_criacao: string
  data_atualizacao: string
}

export interface CertificadoValidacaoApi {
  valido: boolean
  mensagem: string
  token_preview: string | null
}

export const adminCertificadosApi = {
  async listar() {
    return request<{ certificados: CertificadoMetadataApi[]; total: number }>('/v1/admin/certificados')
  },

  async obterAtivo() {
    return request<{ certificado: CertificadoMetadataApi | null }>('/v1/admin/certificados/ativo')
  },

  async obter(id: string) {
    return request<CertificadoMetadataApi>(`/v1/admin/certificados/${id}`)
  },

  async upload(dados: { nome: string; pfx_base64: string; senha_pfx: string; ativar: boolean }) {
    return request<CertificadoMetadataApi>('/v1/admin/certificados', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  },

  async remover(id: string) {
    return request<{ sucesso: boolean; id: string }>(`/v1/admin/certificados/${id}`, {
      method: 'DELETE',
    })
  },

  async ativar(id: string) {
    return request<CertificadoMetadataApi>(`/v1/admin/certificados/${id}/ativar`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  async validar(id: string) {
    return request<CertificadoValidacaoApi>(`/v1/admin/certificados/${id}/validar`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
}

// ─── Admin: NCM Sincronização ────────────────────────────────────────────────

export const adminNcmApi = {
  async getStatus() {
    return request<NcmSyncStatusApi>('/v1/admin/integracao-ncm')
  },

  async getHistorico(params?: { pagina?: number; por_page?: number }) {
    const query = new URLSearchParams()
    if (params?.pagina)   query.set('pagina',   String(params.pagina))
    if (params?.por_page) query.set('por_page', String(params.por_page))
    const qs = query.toString()
    return request<{ logs: NcmSyncLogApi[]; paginacao: { pagina: number; por_page: number; total: number; paginas: number } }>(
      `/v1/admin/integracao-ncm/historico${qs ? `?${qs}` : ''}`,
    )
  },

  async triggerSync() {
    return request<{ sucesso: boolean } & NcmSyncResultado>(
      '/v1/admin/integracao-ncm/sincronizar',
      { method: 'POST', body: JSON.stringify({}) },
    )
  },

  // ── Schedule endpoints ──────────────────────────────────────────────────

  async getSchedule() {
    return request<NcmAgendamentoConfigApi>('/v1/admin/integracao-ncm/agendamento')
  },

  async saveSchedule(data: { ativo: boolean; cron_expressao: string; notificadores: NcmNotificador[] }) {
    return request<NcmAgendamentoConfigApi>('/v1/admin/integracao-ncm/agendamento', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async executeManual() {
    return request<{ sucesso: boolean; sincronizacoes_executadas: number; resultado: NcmSyncResultado }>(
      '/v1/admin/integracao-ncm/agendamento/executar',
      { method: 'POST', body: JSON.stringify({}) },
    )
  },
}

// ─── Público: Catálogo (Store/Marketplace) ──────────────────────────────────

export const publicCatalogApi = {
  async listProducts() {
    return request<{ products: ProductApi[] }>('/v1/catalog/products')
  },

  async getProduct(slug: string) {
    return request<{ product: ProductApi }>(`/v1/catalog/products/${slug}`)
  },
}

// ─── Workspace: Workspaces da organização autenticada ───────────────────────

export const workspaceApi = {
  async getWorkspaces() {
    const raw = await request<unknown>('/v1/me/workspaces')
    return workspacesResponseSchema.parse(raw)
  },

  async createWorkspace(data: { nome_workspace: string; subdominio_workspace?: string; cnpj_workspace?: string }) {
    const raw = await request<unknown>('/v1/me/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return workspaceSingleResponseSchema.parse(raw)
  },

  /**
   * Atualiza workspace. Subdomínio NÃO é aceito no body (imutável após criação,
   * ADR 0002 — backend rejeita via Zod `.strict()`).
   */
  async updateWorkspace(
    id_workspace: string,
    data: Partial<{
      nome_workspace: string
      cnpj_workspace: string
      status_workspace: 'ATIVO' | 'INATIVO'
    }>,
  ) {
    const raw = await request<unknown>(`/v1/me/workspaces/${id_workspace}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return workspaceSingleResponseSchema.parse(raw)
  },

  async deleteWorkspace(id_workspace: string) {
    return request<void>(`/v1/me/workspaces/${id_workspace}`, { method: 'DELETE' })
  },

  /**
   * Preview ao vivo do subdomínio que o sistema atribuiria.
   * Política: sistema gera (cross-tabela, auto-suffix), usuário não escolhe.
   */
  async sugerirSubdominio(base: string) {
    const qs = new URLSearchParams({ base }).toString()
    const raw = await request<unknown>(`/v1/me/sugestoes-subdominio?${qs}`)
    return sugestaoSubdominioResponseSchema.parse(raw)
  },
}

// ─── Usuários da organização autenticada ────────────────────────────────────
// Espelha server/routes/usuario.ts. Toda resposta é validada via Zod (Mand. 09).

export const usuariosApi = {
  async listar() {
    const raw = await request<unknown>('/v1/usuarios')
    return listarUsuariosResponseSchema.parse(raw)
  },

  async convidar(data: {
    email_usuario: string
    nome_usuario: string
    tipo_usuario: 'MASTER' | 'PADRAO' | 'FORNECEDOR'
    workspaces_alvo?: 'all' | string[]
  }) {
    const raw = await request<unknown>('/v1/usuarios/convidar', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return convidarUsuarioResponseSchema.parse(raw)
  },

  async vincularWorkspace(
    id_usuario: string,
    data: { id_workspace: string; tipo_usuario_workspace: 'MASTER' | 'PADRAO' | 'FORNECEDOR' },
  ) {
    const raw = await request<unknown>(`/v1/usuarios/${id_usuario}/vinculos`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return usuarioWorkspaceResponseSchema.parse(raw)
  },

  async substituirWorkspaces(id_usuario: string, workspaces: string[]) {
    const raw = await request<unknown>(`/v1/usuarios/${id_usuario}/workspaces`, {
      method: 'PUT',
      body: JSON.stringify({ workspaces }),
    })
    return substituirWorkspacesResponseSchema.parse(raw)
  },

  /**
   * Cancela convite pendente: deleta o registro Usuario + revoga invitation
   * no Clerk. Aceita apenas usuários em status CONVIDADO. 204 No Content em sucesso.
   * 409 CONVITE_JA_ACEITO se o usuário já completou cadastro.
   */
  async cancelarConvite(id_usuario: string): Promise<void> {
    await request<void>(`/v1/usuarios/${id_usuario}/convite`, { method: 'DELETE' })
  },

  async alterarTipoUsuario(
    id_usuario: string,
    // Regra condicional (decisão dono 2026-05-11): SUPER_ADMIN/ADMIN só são
    // atribuíveis se o alvo está em organização que hospeda colaboradores
    // Gravity. Backend (autorizarAlteracaoPatente) valida e retorna 403
    // TIPO_GRAVITY_EXIGE_ORG_GRAVITY se a regra for violada.
    // Frontend permite os 5 tipos no input; a UI filtra via usePodeEditarUsuario.
    tipo_usuario: 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR',
  ) {
    const raw = await request<unknown>(`/v1/usuarios/${id_usuario}/patente`, {
      method: 'PATCH',
      body: JSON.stringify({ tipo_usuario }),
    })
    return alterarTipoUsuarioResponseSchema.parse(raw)
  },

  /**
   * Atualiza o status do usuário (ATIVO ↔ INATIVO). Persiste em
   * Usuario.status_usuario e invalida cache do requireAuth para kick-out
   * imediato. CONVIDADO não pode ser inativado por aqui — use cancelarConvite.
   *
   * Codes de erro do backend (Mand. 08 — falha alta):
   *   - 403 AUTO_ALTERACAO_BLOQUEADA — usuário tentou inativar a si mesmo
   *   - 409 USUARIO_CONVIDADO_NAO_PODE_INATIVAR — alvo ainda é CONVIDADO
   *   - 409 ULTIMO_MASTER_ATIVO_ORGANIZACAO — anti-bricking (Mand. 04)
   *   - 400 VALIDATION_ERROR — body fora do contrato
   *   - 404 NOT_FOUND — alvo não existe (com escopo de org)
   */
  async atualizarStatus(
    id_usuario: string,
    status_usuario: 'ATIVO' | 'INATIVO',
  ) {
    const raw = await request<unknown>(`/v1/usuarios/${id_usuario}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status_usuario }),
    })
    const parsed = atualizarStatusUsuarioResponseSchema.safeParse(raw)
    if (!parsed.success) {
      console.error('[usuariosApi.atualizarStatus] payload fora do contrato', parsed.error)
      throw new Error('Falha de contrato na resposta do servidor.')
    }
    return parsed.data
  },

  /**
   * F4 — Alterna a flag `acesso_workspaces_futuros` do usuário.
   * NÃO faz backfill nos workspaces atuais — só afeta workspaces criados depois.
   * Backend rejeita alvo MASTER/SAdmin/Admin (Mand. 04).
   */
  async alterarAcessoWorkspacesFuturos(id_usuario: string, acesso_workspaces_futuros: boolean) {
    const raw = await request<unknown>(`/v1/usuarios/${id_usuario}/acesso-workspaces-futuros`, {
      method: 'PATCH',
      body: JSON.stringify({ acesso_workspaces_futuros }),
    })
    return alterarAcessoWorkspacesFuturosResponseSchema.parse(raw)
  },

  /** Lista permissões granulares (formato canônico <slug>:<secao>:<acao>). */
  async listarPermissoes(id_usuario: string, id_workspace?: string) {
    const qs = id_workspace ? `?id_workspace=${encodeURIComponent(id_workspace)}` : ''
    const raw = await request<unknown>(`/v1/usuarios/${id_usuario}/permissoes${qs}`)
    return listarPermissoesUsuarioResponseSchema.parse(raw)
  },

  /** Substitui (atomicamente) permissões de um usuário em UM produto/workspace. */
  async configurarPermissoes(
    id_usuario: string,
    data: { id_workspace: string; id_produto_gravity: string; permissoes: string[] },
  ) {
    const raw = await request<unknown>(`/v1/usuarios/${id_usuario}/permissoes`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return configurarPermissoesResponseSchema.parse(raw)
  },
}

// ─── Produtos do workspace (catálogo + status) ──────────────────────────────

export const produtosWorkspaceApi = {
  /** Lista produtos contratados pelo workspace (inclui catálogo com slug + status). */
  async listar(id_workspace: string) {
    const raw = await request<unknown>(`/v1/workspaces/${id_workspace}/produtos-gravity`)
    return produtosWorkspaceResponseSchema.parse(raw)
  },
}

// ─── Catálogo público de produtos Gravity ───────────────────────────────────

// Shape devolvido por GET /api/v1/produtos-gravity (catálogo global).
// Difere do produtosWorkspaceResponseSchema: aqui não há habilitação por workspace —
// é o catálogo bruto que alimenta a Store e o menu lateral.
export const catalogoProdutoItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  status: z.string(), // 'Ativo' | 'Em Breve' | 'Suspenso' | ...
  unit_price: z.union([z.string(), z.number()]).nullable().optional(),
  unit_currency: z.string().nullable().optional(),
  backend_module: z.string().nullable().optional(),
  billing_type: z.string().nullable().optional(),
  type_billing: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
})

export const catalogoProdutosResponseSchema = z.object({
  products: z.array(catalogoProdutoItemSchema),
})

export type CatalogoProdutoItem = z.infer<typeof catalogoProdutoItemSchema>

export const catalogoProdutosApi = {
  /** Lista todos os produtos do catálogo Gravity (rota pública). */
  async listar() {
    const raw = await request<unknown>('/v1/produtos-gravity')
    return catalogoProdutosResponseSchema.parse(raw)
  },
}
