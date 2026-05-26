// TST-UNI-LOGIN-000003 — useDestinoPosAutenticacao hook
// Plano: testes/testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.json
/// <reference types="vitest/globals" />
import { renderHook, waitFor } from '@testing-library/react'

const { mockGetToken, mockUseAuth } = vi.hoisted(() => ({
  mockGetToken: vi.fn(),
  mockUseAuth: vi.fn(),
}))

vi.mock('@clerk/clerk-react', () => ({
  useAuth: mockUseAuth,
}))

import {
  useDestinoPosAutenticacao,
  limparCacheDestinoPosAutenticacao,
} from '../../../servicos-global/configurador/src/hooks/use-destino-pos-autenticacao.js'

function mockSignedIn(userId = 'clerk_test') {
  mockGetToken.mockResolvedValue('jwt-valid')
  mockUseAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId,
    getToken: mockGetToken,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  limparCacheDestinoPosAutenticacao()
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TST-UNI-LOGIN-000003 — useDestinoPosAutenticacao', () => {
  it('UNI-030: inicia em carregando quando signed in sem cache', () => {
    mockSignedIn()
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ organizacao: null }),
    } as Response)

    const { result } = renderHook(() => useDestinoPosAutenticacao())
    expect(result.current.destino).toBe('carregando')
  })

  it('UNI-031: /me 401 → destino trial', async () => {
    mockSignedIn()
    vi.mocked(fetch).mockResolvedValue({
      status: 401,
      headers: { get: () => null },
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useDestinoPosAutenticacao())
    await waitFor(() => expect(result.current.pronto).toBe(true))
    expect(result.current.destino).toBe('trial')
  })

  it('UNI-032: /me 200 com org → destino hub', async () => {
    mockSignedIn()
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ organizacao: { id_organizacao: 'org_1' } }),
    } as Response)

    const { result } = renderHook(() => useDestinoPosAutenticacao())
    await waitFor(() => expect(result.current.destino).toBe('hub'))
    expect(fetch).toHaveBeenCalledWith('/api/v1/me', {
      headers: { Authorization: 'Bearer jwt-valid' },
    })
  })

  it('UNI-033: cache hit evita segundo fetch', async () => {
    mockSignedIn('clerk_cache')
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ organizacao: { id_organizacao: 'org_1' } }),
    } as Response)

    const { result, rerender } = renderHook(() => useDestinoPosAutenticacao())
    await waitFor(() => expect(result.current.destino).toBe('hub'))
    expect(fetch).toHaveBeenCalledTimes(1)

    rerender()
    await waitFor(() => expect(result.current.pronto).toBe(true))
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('UNI-034: token null → trial sem chamar fetch', async () => {
    mockGetToken.mockResolvedValue(null)
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'clerk_no_token',
      getToken: mockGetToken,
    })

    const { result } = renderHook(() => useDestinoPosAutenticacao())
    await waitFor(() => expect(result.current.pronto).toBe(true))
    expect(result.current.destino).toBe('trial')
    expect(fetch).not.toHaveBeenCalled()
  })
})
