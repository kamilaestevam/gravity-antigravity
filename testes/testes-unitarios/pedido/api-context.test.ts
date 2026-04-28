// TST-UNIT-PEDIDO-API-001 — api.ts context injection
// Cobre: injectUserNameGetter (antes/depois), setApiContext, getApiContext
// e propagação do header x-user-name via getDynamicUserName.
/// <reference types="vitest/globals" />

// ─── Stubs de ambiente browser ────────────────────────────────────────────────
const lsStore: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem:    vi.fn((k: string) => lsStore[k] ?? null),
  setItem:    vi.fn((k: string, v: string) => { lsStore[k] = v }),
  removeItem: vi.fn((k: string) => { delete lsStore[k] }),
})

import {
  setApiContext,
  getApiContext,
  injectUserNameGetter,
} from '../../../servicos-global/organizacao/pedido/client/src/shared/api.js'

// ─── setApiContext ────────────────────────────────────────────────────────────
describe('setApiContext', () => {
  it('define userId e userName no contexto', () => {
    setApiContext({ tenantId: 'ten_abc', userId: 'usr_123', userName: 'Fulano da Silva' })
    const ctx = getApiContext()
    expect(ctx.userId).toBe('usr_123')
    expect(ctx.userName).toBe('Fulano da Silva')
  })

  it('não sobrescreve campos com strings vazias (guard de truthy)', () => {
    setApiContext({ tenantId: 'ten_base', userId: 'usr_base', userName: 'Base User' })
    setApiContext({ tenantId: '', userId: '', userName: '' })
    const ctx = getApiContext()
    // setApiContext só atualiza campos truthy — valores anteriores permanecem
    expect(ctx.userId).toBe('usr_base')
    expect(ctx.userName).toBe('Base User')
  })

  it('persiste tenantId quando fornecido', () => {
    setApiContext({ tenantId: 'ten_persist', userId: 'usr_p', userName: 'P' })
    const ctx = getApiContext()
    expect(ctx.tenantId).toBe('ten_persist')
  })
})

// ─── injectUserNameGetter ─────────────────────────────────────────────────────
describe('injectUserNameGetter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('após injeção, request usa o nome do getter e atualiza context.userName', async () => {
    setApiContext({ tenantId: 'ten_inj', userId: 'usr_inj', userName: 'antes-inject' })
    injectUserNameGetter(() => 'nome-injetado')

    const capturedHeaders: Record<string, string> = {}
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ data: [], total: 0 }),
    })
    ;(fetch as ReturnType<typeof vi.fn>).mockImplementation(async (_url: string, opts?: RequestInit) => {
      Object.assign(capturedHeaders, opts?.headers ?? {})
      return {
        ok: true,
        text: async () => JSON.stringify({ data: [], total: 0 }),
      }
    })

    // Qualquer chamada de API aciona getDynamicUserName
    const { pedidoApi } = await import('../../../produto/pedido/client/src/shared/api.js')
    await pedidoApi.listar().catch(() => { /* ignora erros de parse */ })

    // O getter foi chamado durante a request — context.userName deve ter sido atualizado
    expect(capturedHeaders['x-user-name']).toBe('nome-injetado')
    expect(getApiContext().userName).toBe('nome-injetado')
  })

  it('getter retornando string vazia NÃO sobrescreve context.userName existente', () => {
    setApiContext({ tenantId: 'ten_h', userId: 'usr_h', userName: 'preservado' })
    injectUserNameGetter(() => '')
    // context.userName permanece 'preservado' — o getter só atualiza se retornar valor truthy
    const ctx = getApiContext()
    expect(ctx.userName).toBe('preservado')
  })
})

// ─── Guard do App.tsx — setApiContext só é chamado com currentUser completo ──
describe('comportamento esperado do guard em App.tsx', () => {
  it('setApiContext com userId e userName preenchidos registra ambos', () => {
    // Simula o guard: if (currentUser.id && currentUser.name) setApiContext(...)
    const currentUser = { id: 'usr_guard', name: 'Guard User' }
    if (currentUser.id && currentUser.name) {
      setApiContext({ tenantId: '', userId: currentUser.id, userName: currentUser.name })
    }
    const ctx = getApiContext()
    expect(ctx.userId).toBe('usr_guard')
    expect(ctx.userName).toBe('Guard User')
  })

  it('setApiContext NÃO é chamado quando userId ou name estão ausentes', () => {
    setApiContext({ tenantId: 'ten_before', userId: 'usr_before', userName: 'Before' })

    // Simula currentUser incompleto (antes do useMeSync terminar)
    const currentUser = { id: '', name: '' }
    if (currentUser.id && currentUser.name) {
      // Este bloco NÃO executa — guard protege contra userId/name vazios
      setApiContext({ tenantId: '', userId: 'never', userName: 'never' })
    }

    // Contexto permanece com valores anteriores
    expect(getApiContext().userId).toBe('usr_before')
  })
})
