// services/apiClient.ts
// Cliente HTTP centralizado para o frontend do Configurador.
// Substitui o catalogService (localStorage) por chamadas reais ao backend.

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

  return res.json()
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
  negotiations?: NegotiationApi[]
}

export interface FaixaPrecoApi {
  id: string
  product_id: string
  range_from: number
  range_to: number | null
  price: string
  currency: string
}

// NegotiationApi — espelha model ProdutoGravityNegociacaoEspecial do Prisma
// Paridade Absoluta: nomes idênticos ao schema (configurador/prisma/schema.prisma)
export interface NegotiationApi {
  id_negociacao_especial_preco_produto_gravity: string
  id_produto_gravity: string
  id_organizacao: string
  nome_organizacao_negociacao_especial_preco_produto_gravity: string
  acordo_negociacao_especial_preco_produto_gravity: string
  data_inicio_negociacao_especial_preco_produto_gravity: string | null
  data_fim_negociacao_especial_preco_produto_gravity: string | null
  ilimitado_negociacao_especial_preco_produto_gravity: boolean
}

// PARIDADE ABSOLUTA: espelha model Organizacao + back-relations renomeadas.
// Backend retorna estes nomes diretamente (sem tradução).
export interface WorkspaceApi {
  id_workspace: string
  nome_workspace: string
  subdominio_workspace: string | null
  status_workspace: string
  _count?: { memberships: number }
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
  data_criacao_organizacao: string
  _count?: { users_organizacao: number; workspaces_organizacao: number }
  usuarios?: UsuarioOrgApi[]
  workspaces?: WorkspaceApi[]
  configuracoes_produto?: ConfiguracaoProdutoOrgApi[]
}

/**
 * @deprecated Use OrganizacaoApi. Mantido temporariamente como alias para
 * arquivos legados (FinanceiroAdmin, etc.) ainda não migrados.
 */
export type TenantApi = OrganizacaoApi

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

  async update(id_organizacao: string, data: { nome_organizacao?: string; subdominio_organizacao?: string }) {
    return request<{ organizacao: OrganizacaoApi }>(`/v1/admin/organizacoes/${id_organizacao}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async updateWorkspaceStatus(id_workspace: string, status: 'ATIVO' | 'INATIVO') {
    return request<{ workspace: WorkspaceApi & { id_organizacao: string } }>(
      `/v1/admin/workspaces/${id_workspace}`,
      { method: 'PATCH', body: JSON.stringify({ status }) }
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
}

/**
 * @deprecated Use adminOrganizacoesApi. Mantido temporariamente para arquivos
 * ainda não migrados (FinanceiroAdmin etc.).
 */
export const adminTenantsApi = adminOrganizacoesApi

// ─── Admin: Usuários Globais ────────────────────────────────────────────────

// PARIDADE ABSOLUTA: espelha model Usuario + relações.
export interface GlobalUserApi {
  id_usuario: string
  nome_usuario: string
  email_usuario: string
  tipo_usuario: string
  data_criacao_usuario: string
  id_organizacao: string
  organizacao: { nome_organizacao: string; subdominio_organizacao: string }
  memberships: Array<{
    id_usuario_workspace: string
    id_workspace: string
    tipo_usuario_workspace: string
    ativo_usuario_workspace: boolean
    workspace: { nome_workspace: string; subdominio_workspace: string | null }
  }>
}

export const adminUsersApi = {
  async list(params?: { page?: number; search?: string }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return request<{ usuarios: GlobalUserApi[]; pagination: PaginationApi }>(
      `/v1/admin/usuarios${qs ? `?${qs}` : ''}`
    )
  },

  async promoteUser(id_usuario: string, tipo_usuario: 'SUPER_ADMIN' | 'ADMIN') {
    return request<{ usuario: { id_usuario: string; email_usuario: string; tipo_usuario: string } }>(
      `/v1/admin/usuarios/${id_usuario}/promover`,
      { method: 'POST', body: JSON.stringify({ tipo_usuario }) }
    )
  },

  async inviteUser(data: { email_usuario: string; nome_usuario: string; tipo_usuario: string }) {
    return request<{ usuario: { id_usuario: string; email_usuario: string; tipo_usuario: string } }>(
      '/v1/admin/usuarios/convidar',
      { method: 'POST', body: JSON.stringify(data) }
    )
  },
}

// ─── Admin: Billing / Faturas (BillingProvider abstrato) ────────────────────
// Shape estável independente do provider (Conta Azul / Itaú / Santander / ASAAS / ...).
// Ver servicos-global/configurador/server/lib/billing/types.ts

export type GravityInvoiceStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'PAID'
  | 'VOID'
  | 'OVERDUE'
  | 'UNCOLLECTIBLE'

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
  tipo_empresa_organizacao: string | null
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
    tipo_empresa_organizacao?: string
  }) {
    return request<{ config: PlatformConfigApi }>('/v1/admin/visao-geral', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// ─── Admin: NCM Sync (Portal Único Siscomex) ───────────────────────────────

export interface NcmSyncStatusApi {
  ultima_sync:           string | null
  status:                'EXECUTANDO' | 'SUCESSO' | 'ERRO' | null
  total_ativos:          number
  total_organizacoes:    number
  organizacoes_com_ncm:  number
  erros_48h:             number
  desatualizado:         boolean
}

export interface NcmSyncLogApi {
  id_ncm_log:               string
  id_organizacao:           string
  id_produto_gravity:       string | null
  id_usuario:               string | null
  data_inicio_ncm_log:      string
  data_conclusao_ncm_log:   string | null
  status_ncm_log:           'EXECUTANDO' | 'SUCESSO' | 'ERRO'
  total_ncm_log:            number
  adicionados_ncm_log:      number
  alterados_ncm_log:        number
  removidos_ncm_log:        number
  origem_ncm_log:           'JOB' | 'MANUAL'
  disparado_por_ncm_log:    string | null
  mensagem_erro_ncm_log:    string | null
  data_criacao_ncm_log:     string
  data_atualizacao_ncm_log: string
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

export interface NcmExecuteResultado {
  id_organizacao: string
  sucesso:        boolean
  total?:         number
  adicionados?:   number
  alterados?:     number
  removidos?:     number
  duracaoMs?:     number
  erro?:          string
}

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

  async triggerSync(idOrganizacao: string) {
    return request<{ sucesso: boolean; total: number; adicionados: number; alterados: number; removidos: number; duracaoMs: number }>(
      `/v1/admin/integracao-ncm/sincronizar/${idOrganizacao}`,
      { method: 'POST' },
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

  async executeManual(idOrganizacao?: string) {
    return request<{ sucesso: boolean; organizacoes_executadas: number; resultados: NcmExecuteResultado[]; aviso?: string }>(
      '/v1/admin/integracao-ncm/agendamento/executar',
      {
        method: 'POST',
        body: JSON.stringify(idOrganizacao ? { id_organizacao: idOrganizacao } : {}),
      },
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

// ─── Workspace: Tenants & Users ─────────────────────────────────────────────

export const workspaceApi = {
  async getMyTenant() {
    return request<{ tenant: TenantApi }>('/v1/organizacoes/me')
  },

  async getCompanies() {
    return request<{ companies: Array<{ id: string; name: string; subdomain: string | null; cnpj: string | null; status: string }> }>(
      '/v1/organizacoes/me/workspaces'
    )
  },

  async createCompany(data: { name: string; subdomain?: string; cnpj?: string }) {
    return request<{ company: { id: string; name: string } }>('/v1/organizacoes/me/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getUsers() {
    return request<{ users: Array<{ id: string; name: string; email: string; tipo_usuario: string; created_at: string; memberships: Array<{ company_id: string; tipo_usuario: string; is_active: boolean }> }> }>(
      '/v1/usuarios'
    )
  },

  async inviteUser(data: { email: string; name: string; role: string }) {
    return request<{ user: { id: string; email: string } }>('/v1/usuarios/convidar', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async setUserMembership(userId: string, data: { company_id: string; role: string }) {
    return request<{ membership: { id: string } }>(`/v1/usuarios/${userId}/vinculos`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateUserRole(userId: string, role: string) {
    return request<{ user: { id: string; tipo_usuario: string } }>(`/v1/usuarios/${userId}/patente`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  },

  async getPlans() {
    return request<{ plans: Array<{ key: string; name: string; price: number; features: string[] }> }>(
      '/v1/plans'
    )
  },

  async getActiveProducts(tenantId: string) {
    return request<{ products: Array<{ product_key: string; config: Record<string, unknown>; updated_at: string }> }>(
      `/internal/check-access?tenantId=${tenantId}`
    )
  },
}
