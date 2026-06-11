/**
 * api.ts — Base HTTP para módulos da lista Processo (camadas Pedido/Item).
 * Cópia enxuta do Pedido — sem endpoints de domínio.
 */

let context = { idOrganizacao: '', userId: '', userName: '', idWorkspace: '' }

const LS_TENANT_KEY = 'gravity:idOrganizacao'

function lsGet(): string {
  try { return localStorage.getItem(LS_TENANT_KEY) || '' } catch { return '' }
}
function lsSet(id: string): void {
  try { localStorage.setItem(LS_TENANT_KEY, id) } catch { /* noop */ }
}

let getDynamicTenantId: () => string | undefined = () => undefined

export const injectTenantGetter = (fn: () => string | undefined): void => {
  getDynamicTenantId = () => {
    const live = fn()
    if (live) {
      context.idOrganizacao = live
      lsSet(live)
    }
    return context.idOrganizacao || lsGet() || undefined
  }
}

let getDynamicWorkspaceId: () => string | undefined = () => undefined

export const injectWorkspaceGetter = (fn: () => string | undefined): void => {
  getDynamicWorkspaceId = () => {
    const live = fn()
    if (live) context.idWorkspace = live
    return context.idWorkspace || undefined
  }
}

let getDynamicToken: (() => Promise<string | null>) | null = null

export const injectTokenGetter = (fn: () => Promise<string | null>): void => {
  getDynamicToken = fn
}

async function getAuthToken(): Promise<string | null> {
  if (getDynamicToken) {
    try {
      const token = await getDynamicToken()
      if (token) return token
    } catch { /* fallback */ }
  }
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
  if (ctx.userId) context.userId = ctx.userId
  if (ctx.userName) context.userName = ctx.userName
}

export function getApiContext(): { idOrganizacao: string; userId: string; userName: string } {
  return {
    idOrganizacao: context.idOrganizacao || lsGet() || (import.meta.env.VITE_DEV_TENANT_ID as string | undefined) || '',
    userId: context.userId,
    userName: context.userName,
  }
}

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const idOrganizacao = getDynamicTenantId() || context.idOrganizacao || lsGet() || (import.meta.env.VITE_DEV_TENANT_ID as string | undefined) || ''
  const idWorkspace = getDynamicWorkspaceId() || context.idWorkspace || ''
  const token = await getAuthToken()

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'x-id-organizacao': idOrganizacao,
      'x-id-usuario': context.userId,
      'x-nome-usuario': context.userName,
      ...(idWorkspace ? { 'x-id-workspace': idWorkspace } : {}),
      'x-chave-interna-servico': import.meta.env.VITE_CHAVE_INTERNA_SERVICO || '',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    const raw = await response.json().catch(() => null)
    const msg = raw?.error?.message || raw?.erro?.mensagem || (typeof raw?.error === 'string' ? raw.error : null)
    throw new Error(msg || `HTTP ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  const text = await response.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}
