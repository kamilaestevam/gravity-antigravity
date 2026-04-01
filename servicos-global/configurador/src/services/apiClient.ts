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
  const authHeaders: Record<string, string> = {}
  const token = await getAuthToken()
  if (token) authHeaders['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error(body?.error?.message ?? body?.message ?? `HTTP ${res.status}`)
  }

  return res.json()
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
  created_at: string
  updated_at: string
  price_tiers: PriceTierApi[]
  negotiations?: NegotiationApi[]
}

export interface PriceTierApi {
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
  users?: Array<{ id: string; name: string; email: string; role: string; created_at: string }>
  companies?: Array<{ id: string; name: string; subdomain: string | null; status: string }>
  product_configs?: Array<{ product_key: string; is_active: boolean; updated_at: string }>
}

export interface PaginationApi {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ProductConfigApi {
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
  async list(params?: { page?: number; search?: string; status?: string }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.search) query.set('search', params.search)
    if (params?.status) query.set('status', params.status)
    const qs = query.toString()
    return request<{ products: ProductApi[]; pagination: PaginationApi }>(
      `/admin/products${qs ? `?${qs}` : ''}`
    )
  },

  async getById(id: string) {
    return request<{ product: ProductApi }>(`/admin/products/${id}`)
  },

  async create(data: Record<string, unknown>) {
    return request<{ product: ProductApi }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Record<string, unknown>) {
    return request<{ product: ProductApi }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async toggleStatus(id: string) {
    return request<{ product: ProductApi }>(`/admin/products/${id}/status`, {
      method: 'PATCH',
    })
  },

  async delete(id: string) {
    return request<{ deleted: boolean; id: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    })
  },

  async seed() {
    return request<{ seeded: boolean; count: number }>('/admin/products/seed', {
      method: 'POST',
    })
  },

  async getAvailableSlugs() {
    return request<{ available: string[]; all: string[] }>('/admin/products/available-slugs')
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

  async updateStatus(id: string, status: string) {
    return request<{ tenant: TenantApi }>(`/admin/tenants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
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
  role: string
  created_at: string
  tenant_id: string
  tenant: { name: string; slug: string }
  memberships: Array<{
    id: string
    company_id: string
    role: string
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
      `/admin/users${qs ? `?${qs}` : ''}`
    )
  },

  async promoteUser(userId: string, role: 'SUPER_ADMIN' | 'ADMIN') {
    return request<{ user: { id: string; email: string; role: string } }>(
      `/admin/users/${userId}/promote`,
      { method: 'POST', body: JSON.stringify({ role }) }
    )
  },

  async inviteUser(data: { email: string; name: string; role: string }) {
    return request<{ user: { id: string; email: string; role: string } }>(
      '/admin/users/invite',
      { method: 'POST', body: JSON.stringify(data) }
    )
  },
}

// ─── Admin: Billing / Faturas ───────────────────────────────────────────────

export interface InvoiceApi {
  id: string
  plan: string
  status: string
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  tenant: { id: string; name: string; slug: string; stripe_customer_id: string | null }
}

export const adminBillingApi = {
  async listInvoices(params?: { page?: number }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    const qs = query.toString()
    return request<{ invoices: InvoiceApi[]; pagination: PaginationApi }>(
      `/admin/billing/invoices${qs ? `?${qs}` : ''}`
    )
  },
}

// ─── Admin: Deploy Logs ─────────────────────────────────────────────────────

export interface DeployLogApi {
  id: string
  created_at: string
  user: string
  area: string
  from_state: string
  to_state: string
  version: string
  status: string
}

export const adminDeploysApi = {
  async list() {
    return request<{ deploys: DeployLogApi[] }>('/admin/deploys')
  },
}

// ─── Admin: Test Logs ───────────────────────────────────────────────────────

export interface TestLogApi {
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

export const adminTestLogsApi = {
  async list() {
    return request<{ logs: TestLogApi[] }>('/admin/test-logs')
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
    return request<{ config: PlatformConfigApi | null }>('/admin/platform-config')
  },

  async updateConfig(data: {
    name?: string
    cnpj?: string
    state?: string
    city?: string
    segment?: string
    tipo_empresa?: string
  }) {
    return request<{ config: PlatformConfigApi }>('/admin/platform-config', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// ─── Admin: Ativação de produtos por tenant ─────────────────────────────────

export const tenantProductsApi = {
  async listProducts(tenantId: string) {
    return request<{ tenant_id: string; tenant_name: string; products: ProductConfigApi[] }>(
      `/admin/tenants/${tenantId}/products`
    )
  },

  async activate(tenantId: string, productKey: string, config?: Record<string, unknown>) {
    return request<{ activated: boolean; config: ProductConfigApi }>(
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
    return request<{ tenant: TenantApi }>('/v1/tenants/me')
  },

  async getCompanies() {
    return request<{ companies: Array<{ id: string; name: string; subdomain: string | null; cnpj: string | null; status: string }> }>(
      '/v1/tenants/companies'
    )
  },

  async createCompany(data: { name: string; subdomain?: string; cnpj?: string }) {
    return request<{ company: { id: string; name: string } }>('/v1/tenants/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getUsers() {
    return request<{ users: Array<{ id: string; name: string; email: string; role: string; created_at: string; memberships: Array<{ company_id: string; role: string; is_active: boolean }> }> }>(
      '/v1/users'
    )
  },

  async inviteUser(data: { email: string; name: string; role: string }) {
    return request<{ user: { id: string; email: string } }>('/v1/users/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async setUserMembership(userId: string, data: { company_id: string; role: string }) {
    return request<{ membership: { id: string } }>(`/v1/users/${userId}/memberships`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateUserRole(userId: string, role: string) {
    return request<{ user: { id: string; role: string } }>(`/v1/users/${userId}/role`, {
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
