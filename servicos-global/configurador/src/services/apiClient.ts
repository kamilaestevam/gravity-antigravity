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
  status: 'ACTIVE' | 'SUSPENDED' | 'COMING_SOON' | 'LEGACY' | 'INACTIVE'
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
  user_limit_type: 'UNLIMITED' | 'LIMITED'
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

export interface NegotiationApi {
  id: string
  product_id: string
  tenant_id: string
  tenant_name: string
  agreement: string
  starts_at: string | null
  ends_at: string | null
  is_unlimited: boolean
}

export interface TenantApi {
  id: string
  name: string
  slug: string
  status: string
  created_at: string
  _count?: { users: number; companies: number }
  subscriptions?: Array<{ plan: string; status: string }>
  users?: Array<{ id: string; name: string; email: string; tipo_usuario: string; created_at: string }>
  companies?: Array<{ id: string; name: string; subdomain: string | null; status: string; _count?: { memberships: number } }>
  product_configs?: Array<{ product_key: string; is_active: boolean; updated_at: string }>
}

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
      `/admin/produtos-gravity${qs ? `?${qs}` : ''}`
    )
  },

  async getById(id: string) {
    return request<{ product: ProductApi }>(`/admin/produtos-gravity/${id}`)
  },

  async create(data: Record<string, unknown>) {
    return request<{ product: ProductApi }>('/admin/produtos-gravity', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Record<string, unknown>) {
    return request<{ product: ProductApi }>(`/admin/produtos-gravity/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async toggleStatus(id: string) {
    return request<{ product: ProductApi }>(`/admin/produtos-gravity/${id}/status`, {
      method: 'PATCH',
    })
  },

  async delete(id: string, opts?: { force?: boolean; ackNegotiations?: boolean }) {
    const query = new URLSearchParams()
    if (opts?.force) query.set('force', 'true')
    if (opts?.ackNegotiations) query.set('ack_negotiations', 'true')
    const qs = query.toString()
    return request<{ deleted: boolean; id: string; mode: 'hard' | 'soft' }>(
      `/admin/produtos-gravity/${id}${qs ? `?${qs}` : ''}`,
      { method: 'DELETE' },
    )
  },

  async getAvailableSlugs() {
    return request<{ available: string[]; all: string[] }>('/admin/produtos-gravity/available-slugs')
  },
}

// ─── Admin: Tenants ─────────────────────────────────────────────────────────

export const adminTenantsApi = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return request<{ tenants: TenantApi[]; pagination: PaginationApi }>(
      `/admin/tenants${qs ? `?${qs}` : ''}`
    )
  },

  async getById(id: string) {
    return request<{ tenant: TenantApi }>(`/admin/tenants/${id}`)
  },

  async create(data: { name: string; slug: string; plano?: string; cnpj?: string }) {
    return request<{ tenant: TenantApi }>('/admin/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateStatus(id: string, status: string) {
    return request<{ tenant: TenantApi }>(`/admin/tenants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  async update(id: string, data: { name?: string; slug?: string; plano?: string }) {
    return request<{ tenant: TenantApi }>(`/admin/tenants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async updateWorkspaceStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
    return request<{ workspace: { id: string; name: string; status: string; tenant_id: string } }>(
      `/admin/workspaces/${id}`,
      { method: 'PATCH', body: JSON.stringify({ status }) }
    )
  },

  async getStats() {
    return request<{
      stats: {
        totalTenants: number
        activeTenants: number
        suspendedTenants: number
        totalUsers: number
      }
    }>('/admin/stats')
  },
}

// ─── Admin: Usuários Globais ────────────────────────────────────────────────

export interface GlobalUserApi {
  id: string
  name: string
  email: string
  tipo_usuario: string
  created_at: string
  tenant_id: string
  tenant: { name: string; slug: string }
  memberships: Array<{
    id: string
    company_id: string
    tipo_usuario: string
    is_active: boolean
    company: { name: string; subdomain: string | null }
  }>
}

export const adminUsersApi = {
  async list(params?: { page?: number; search?: string }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return request<{ users: GlobalUserApi[]; pagination: PaginationApi }>(
      `/admin/usuarios-globais${qs ? `?${qs}` : ''}`
    )
  },

  async promoteUser(userId: string, role: 'SUPER_ADMIN' | 'ADMIN') {
    return request<{ user: { id: string; email: string; tipo_usuario: string } }>(
      `/admin/usuarios-globais/${userId}/promote`,
      { method: 'POST', body: JSON.stringify({ role }) }
    )
  },

  async inviteUser(data: { email: string; name: string; role: string }) {
    return request<{ user: { id: string; email: string; tipo_usuario: string } }>(
      '/admin/usuarios-globais/invite',
      { method: 'POST', body: JSON.stringify(data) }
    )
  },
}

// ─── Admin: Billing / Faturas (BillingProvider abstrato) ────────────────────
// Shape estável independente do provider (Stripe / Itaú / Santander / ASAAS / ...).
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
    return request<ListInvoicesResponseApi>(`/admin/financeiro-admin/invoices${qs ? `?${qs}` : ''}`)
  },

  async getInvoice(id: string) {
    return request<{ invoice: GravityInvoiceApi }>(`/admin/financeiro-admin/invoices/${id}`)
  },

  async createInvoice(data: CreateInvoiceRequest) {
    return request<{ invoice: GravityInvoiceApi }>('/admin/financeiro-admin/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async voidInvoice(id: string, reason?: string) {
    return request<{ invoice: GravityInvoiceApi }>(`/admin/financeiro-admin/invoices/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  },

  async sendInvoice(id: string) {
    return request<{ invoice: GravityInvoiceApi }>(`/admin/financeiro-admin/invoices/${id}/send`, {
      method: 'POST',
    })
  },
}

// ─── Admin: Deploy Logs ─────────────────────────────────────────────────────
// Histórico manual de deploys da plataforma Gravity.

export type DeployEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'ALL'
export type DeployStatus = 'SUCCESS' | 'FAILED' | 'ROLLBACK' | 'IN_PROGRESS'

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
    return request<ListDeploysResponseApi>(`/admin/deploy${qs ? `?${qs}` : ''}`)
  },

  async create(data: CreateDeployRequest) {
    return request<{ deploy: DeployApi }>('/admin/deploy', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return request<{ deleted: boolean; id: string }>(`/admin/deploy/${id}`, {
      method: 'DELETE',
    })
  },
}

// ─── Admin: Test Logs ───────────────────────────────────────────────────────

export interface TestesApi {
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

export interface TestePlanoApi {
  id: string
  name: string
  product: string
  description: string
  specFile: string
  url: string
  steps: string[]
}

export const adminTestesApi = {
  async list() {
    return request<{ logs: TestesApi[] }>('/admin/testes-gerais/logs')
  },
  async runTests(opts?: { planos?: string[]; modulos?: string[] }) {
    return request<{ started: boolean }>('/admin/testes-gerais/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts ?? {}),
    })
  },
  async runStatus() {
    return request<{ running: boolean }>('/admin/testes-gerais/run/status')
  },
  async listPlans(product?: string) {
    const qs = product ? `?product=${encodeURIComponent(product)}` : ''
    return request<{ plans: TestePlanoApi[] }>(`/admin/testes-gerais/plans${qs}`)
  },
  async reanalyze(id: string) {
    return request<{ analysis: Record<string, unknown> }>(`/admin/testes-gerais/logs/${id}/reanalyze`, { method: 'POST' })
  },
  async applyFix(id: string) {
    return request<{ applied: boolean; arquivo: string }>(`/admin/testes-gerais/logs/${id}/apply-fix`, { method: 'POST' })
  },
  async reject(id: string, motivo: string) {
    return request<{ rejected: boolean }>(`/admin/testes-gerais/logs/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    })
  },
  async generatePlan(data: { escopo: string; sublocal: string; tela: string; rota: string; componenteFilePath: string; criticidade: string; temDinheiro?: boolean }) {
    return request<{ plan: Record<string, unknown> }>('/admin/testes-gerais/plans/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async geminiMetrics() {
    return request<{ cache: Record<string, unknown>; daily: Array<Record<string, unknown>> }>('/admin/testes-gerais/gemini-metrics')
  },
  async listSchedules() {
    return request<{ schedules: Array<Record<string, unknown>> }>('/admin/testes-gerais/schedules')
  },
  async createSchedule(data: Record<string, unknown>) {
    return request<{ schedule: Record<string, unknown> }>('/admin/testes-gerais/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async updateSchedule(id: string, data: Record<string, unknown>) {
    return request<{ schedule: Record<string, unknown> }>(`/admin/testes-gerais/schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
  async deleteSchedule(id: string) {
    return request<{ deleted: boolean }>(`/admin/testes-gerais/schedules/${id}`, { method: 'DELETE' })
  },
}

// ─── Admin: Platform Config (Visão Geral) ───────────────────────────────────

export interface PlatformConfigApi {
  id: string
  name: string
  slug: string
  cnpj: string | null
  state: string | null
  city: string | null
  segment: string | null
  tipo_empresa: string | null
  created_at: string
  subscriptions?: Array<{ plan: string }>
}

export const adminPlatformApi = {
  async getConfig() {
    return request<{ config: PlatformConfigApi | null }>('/admin/visao-geral')
  },

  async updateConfig(data: {
    name?: string
    cnpj?: string
    state?: string
    city?: string
    segment?: string
    tipo_empresa?: string
  }) {
    return request<{ config: PlatformConfigApi }>('/admin/visao-geral', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// ─── Admin: Ativação de produtos por tenant ─────────────────────────────────

export const tenantProductsApi = {
  async listProducts(tenantId: string) {
    return request<{ tenant_id: string; tenant_name: string; products: ConfigProdutoApi[] }>(
      `/admin/tenants/${tenantId}/products`
    )
  },

  async activate(tenantId: string, productKey: string, config?: Record<string, unknown>) {
    return request<{ activated: boolean; config: ConfigProdutoApi }>(
      `/admin/tenants/${tenantId}/products/${productKey}/activate`,
      { method: 'POST', body: JSON.stringify({ config: config ?? {} }) }
    )
  },

  async deactivate(tenantId: string, productKey: string) {
    return request<{ deactivated: boolean }>(
      `/admin/tenants/${tenantId}/products/${productKey}/deactivate`,
      { method: 'POST' }
    )
  },
}

// ─── Admin: NCM Sync (Portal Único Siscomex) ───────────────────────────────

export interface NcmSyncStatusApi {
  ultima_sync:   string | null
  status:        'RUNNING' | 'SUCCESS' | 'ERROR' | null
  total_ativos:  number
  total_tenants: number
  erros_48h:     number
  desatualizado: boolean
}

export interface NcmSyncLogApi {
  id:           string
  tenant_id:    string
  iniciado_em:  string
  concluido_em: string | null
  status:       'RUNNING' | 'SUCCESS' | 'ERROR'
  total:        number
  adicionados:  number
  alterados:    number
  removidos:    number
  origem:       'JOB' | 'MANUAL'
  disparado_por: string | null
  erro_msg:     string | null
  created_at:   string
}

// ── Tipos de schedule ──────────────────────────────────────────────────────

export interface NcmNotificador {
  id:       string
  nome:     string
  contato:  string
  condicao: 'Apenas Erros' | 'Sempre'
  canal:    'E-mail' | 'WhatsApp' | 'Ambos'
}

export interface NcmScheduleConfigApi {
  ativo:           boolean
  cron_expressao:  string
  notificadores:   NcmNotificador[]
  proxima_execucao: string | null
  atualizado_em:   string | null
}

export interface NcmExecuteResultado {
  tenant_id:   string
  sucesso:     boolean
  total?:      number
  adicionados?: number
  alterados?:  number
  removidos?:  number
  duracaoMs?:  number
  erro?:       string
}

export const adminNcmApi = {
  async getStatus() {
    return request<NcmSyncStatusApi>('/admin/ncm-integracao')
  },

  async getHistorico(params?: { pagina?: number; por_page?: number }) {
    const query = new URLSearchParams()
    if (params?.pagina)   query.set('pagina',   String(params.pagina))
    if (params?.por_page) query.set('por_page', String(params.por_page))
    const qs = query.toString()
    return request<{ logs: NcmSyncLogApi[]; paginacao: { pagina: number; por_page: number; total: number; paginas: number } }>(
      `/admin/ncm-integracao/historico${qs ? `?${qs}` : ''}`,
    )
  },

  async triggerSync(tenantId: string) {
    return request<{ sucesso: boolean; total: number; adicionados: number; alterados: number; removidos: number; duracaoMs: number }>(
      `/admin/ncm-integracao/sync/${tenantId}`,
      { method: 'POST' },
    )
  },

  // ── Schedule endpoints ──────────────────────────────────────────────────

  async getSchedule() {
    return request<NcmScheduleConfigApi>('/admin/ncm-integracao/schedule')
  },

  async saveSchedule(data: { ativo: boolean; cron_expressao: string; notificadores: NcmNotificador[] }) {
    return request<NcmScheduleConfigApi>('/admin/ncm-integracao/schedule', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async executeManual(tenantId?: string) {
    return request<{ sucesso: boolean; tenants_executados: number; resultados: NcmExecuteResultado[]; aviso?: string }>(
      '/admin/ncm-integracao/schedule/execute',
      {
        method: 'POST',
        body: JSON.stringify(tenantId ? { tenant_id: tenantId } : {}),
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
    return request<{ tenant: TenantApi }>('/v1/organizacao/me')
  },

  async getCompanies() {
    return request<{ companies: Array<{ id: string; name: string; subdomain: string | null; cnpj: string | null; status: string }> }>(
      '/v1/organizacao/companies'
    )
  },

  async createCompany(data: { name: string; subdomain?: string; cnpj?: string }) {
    return request<{ company: { id: string; name: string } }>('/v1/organizacao/companies', {
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
    return request<{ user: { id: string; email: string } }>('/v1/usuarios/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async setUserMembership(userId: string, data: { company_id: string; role: string }) {
    return request<{ membership: { id: string } }>(`/v1/usuarios/${userId}/memberships`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateUserRole(userId: string, role: string) {
    return request<{ user: { id: string; tipo_usuario: string } }>(`/v1/usuarios/${userId}/role`, {
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
