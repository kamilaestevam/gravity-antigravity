// TST-UNIT-PEDIDO-REQ-ERR-001 — request() error message extraction
// Cobre: extração de mensagem de erro em formato EN (error.message)
// e formato PT-BR DDD (erro.mensagem) do Cadastros.
/// <reference types="vitest/globals" />

// ─── Stubs de ambiente browser ────────────────────────────────────────────────
const lsStore: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem:    vi.fn((k: string) => lsStore[k] ?? null),
  setItem:    vi.fn((k: string, v: string) => { lsStore[k] = v }),
  removeItem: vi.fn((k: string) => { delete lsStore[k] }),
})

import {
  request,
  setApiContext,
} from '../../../servicos-global/produto/pedido/client/src/shared/api.js'

beforeEach(() => {
  vi.clearAllMocks()
  setApiContext({ tenantId: 'org_test', userId: 'usr_test', userName: 'Test' })
})

describe('request() — extração de mensagem de erro', () => {
  it('extrai mensagem do formato EN { error: { message } } (Pedido backend)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: { message: 'Registro não encontrado.' } }),
    }))

    await expect(request('/api/v1/test')).rejects.toThrow('Registro não encontrado.')
  })

  it('extrai mensagem do formato PT-BR { erro: { mensagem } } (Cadastros backend)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({
        erro: {
          codigo: 'EMPRESA_DA_ORG_AUSENTE',
          mensagem: 'Organização não tem empresa-da-org cadastrada (onboarding incompleto).',
        },
      }),
    }))

    await expect(request('/api/v1/test')).rejects.toThrow(
      'Organização não tem empresa-da-org cadastrada (onboarding incompleto).',
    )
  })

  it('extrai mensagem do formato EN string { error: "texto" }', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'x-id-organizacao header obrigatorio' }),
    }))

    await expect(request('/api/v1/test')).rejects.toThrow('x-id-organizacao header obrigatorio')
  })

  it('cai no fallback HTTP status quando resposta não tem mensagem', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    }))

    await expect(request('/api/v1/test')).rejects.toThrow('HTTP 500')
  })

  it('cai no fallback HTTP status quando json() falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error('invalid json')),
    }))

    await expect(request('/api/v1/test')).rejects.toThrow('HTTP 502')
  })

  it('preserva details do formato EN quando presente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({
        error: {
          message: 'Dados inválidos',
          details: [{ campo: 'nome', erro: 'obrigatório' }],
        },
      }),
    }))

    const err = await request('/api/v1/test').catch((e: unknown) => e) as Error & { details?: unknown }
    expect(err.message).toBe('Dados inválidos')
    expect(err.details).toEqual([{ campo: 'nome', erro: 'obrigatório' }])
  })

  it('prioriza error.message (EN) sobre erro.mensagem (PT-BR) quando ambos presentes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({
        error: { message: 'EN message' },
        erro: { mensagem: 'PT-BR mensagem' },
      }),
    }))

    await expect(request('/api/v1/test')).rejects.toThrow('EN message')
  })
})
