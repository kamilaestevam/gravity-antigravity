// @vitest-environment node
// TST-UNI-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000086 — fonte do tenant em request (Fase 1, commit 502e73df3)
// Cobre UNI-09/10 da Matriz usuário × organização.
// Substitui (FONTE PRIMÁRIA) o legado api-context.test.ts (quebrado: `vi is not defined`,
// e usa nomenclatura legada `tenantId` em vez de `idOrganizacao`).
//
// Valida o objetivo da Fase 1: o tenant em request vem do STORE (getDynamicTenantId), e
// `getApiContext` NÃO usa mais `localStorage` (lsGet). Documenta também o fallback de
// HIDRATAÇÃO que permanece em getDynamicTenantId (recuperação pós-F5), limpo no logout.
//
// Isolamento: api.ts tem `context` module-level que não é zerável por setApiContext (guard
// de truthy). Cada teste faz vi.resetModules() + re-import para um módulo limpo.

import { vi, describe, it, expect, beforeEach } from 'vitest'

const lsStore: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem:    vi.fn((k: string) => lsStore[k] ?? null),
  setItem:    vi.fn((k: string, v: string) => { lsStore[k] = v }),
  removeItem: vi.fn((k: string) => { delete lsStore[k] }),
})

const LS_KEY = 'gravity:idOrganizacao'
const API_PATH = '../../../../servicos-global/produto/pedido/client/src/shared/api.js'

type ApiModulo = typeof import('../../../../servicos-global/produto/pedido/client/src/shared/api.js')

async function carregarApiLimpo(): Promise<ApiModulo> {
  vi.resetModules()
  const api = (await import(API_PATH)) as ApiModulo
  api.injectTokenGetter(async () => null) // sem Clerk no teste
  return api
}

async function capturarHeaders(api: ApiModulo): Promise<Record<string, string>> {
  const captured: Record<string, string> = {}
  vi.stubGlobal('fetch', vi.fn(async (_url: string, opts?: RequestInit) => {
    Object.assign(captured, opts?.headers ?? {})
    return { ok: true, status: 200, text: async () => JSON.stringify({ data: [], total: 0 }) }
  }))
  await api.request('/api/v1/pedidos/qualquer').catch(() => { /* parse irrelevante */ })
  return captured
}

beforeEach(() => {
  for (const k of Object.keys(lsStore)) delete lsStore[k]
})

describe('fonte do tenant em request()', () => {
  // UNI-09 — store tem precedência sobre localStorage defasado
  it('usa a org do STORE no header, mesmo com localStorage defasado de outra org', async () => {
    const api = await carregarApiLimpo()
    lsStore[LS_KEY] = 'org-DEFASADA'
    api.injectTenantGetter(() => 'org-DO-STORE')

    const headers = await capturarHeaders(api)
    expect(headers['x-id-organizacao']).toBe('org-DO-STORE')
    expect(headers['x-id-organizacao']).not.toBe('org-DEFASADA')
  })

  // UNI-09b — comportamento REAL documentado: pré-/me (store vazio), getDynamicTenantId cai
  // no localStorage como RECUPERAÇÃO DE HIDRATAÇÃO (pós-F5). Esse resíduo é limpo no logout
  // (useMeSync.ts) — por isso não vaza entre sessões. Teste fixa o contrato real.
  it('store vazio + localStorage presente → usa localStorage (hidratação pós-F5)', async () => {
    const api = await carregarApiLimpo()
    lsStore[LS_KEY] = 'org-HIDRATADA'
    api.injectTenantGetter(() => undefined)

    const headers = await capturarHeaders(api)
    expect(headers['x-id-organizacao']).toBe('org-HIDRATADA')
  })
})

describe('getApiContext() — sem lsGet (Fase 1)', () => {
  // UNI-10 — getApiContext NÃO usa localStorage; contexto vazio → '' (não a org defasada)
  it('contexto vazio + localStorage defasado → idOrganizacao vazio (nunca a org do storage)', async () => {
    const api = await carregarApiLimpo()
    lsStore[LS_KEY] = 'org-DEFASADA'
    expect(api.getApiContext().idOrganizacao).toBe('')
  })

  it('contexto preenchido → idOrganizacao do contexto', async () => {
    const api = await carregarApiLimpo()
    api.setApiContext({ idOrganizacao: 'org-CTX', userId: 'u', userName: 'U' })
    expect(api.getApiContext().idOrganizacao).toBe('org-CTX')
  })
})
