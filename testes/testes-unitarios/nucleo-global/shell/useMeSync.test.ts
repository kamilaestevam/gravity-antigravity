// @vitest-environment jsdom
// TST-UNIT-SHELL-002 — useMeSync + resolveRole
// Cobre: mapeamento DDD, fluxo de sucesso, cenários de erro (/me → 401/500/exceção),
// guard de re-fetch (fetchedForRef), logout e meStatus correto em cada cenário.
/// <reference types="vitest/globals" />
import { renderHook, act, waitFor } from '@testing-library/react'

// ─── Mocks hoistados (vi.hoisted executa antes dos imports) ──────────────────
const {
  mockGetToken,
  mockSetCurrentUser,
  mockClearCurrentUser,
  mockSetMeStatus,
  mockUseAuth,
  mockUseUser,
} = vi.hoisted(() => ({
  mockGetToken:       vi.fn(),
  mockSetCurrentUser: vi.fn(),
  mockClearCurrentUser: vi.fn(),
  mockSetMeStatus:    vi.fn(),
  mockUseAuth:        vi.fn(),
  mockUseUser:        vi.fn(),
}))

vi.mock('@clerk/clerk-react', () => ({
  useAuth: mockUseAuth,
  useUser: mockUseUser,
}))

vi.mock('../../../../servicos-global/shell/store', () => ({
  useShellStore: vi.fn(() => ({
    setCurrentUser:  mockSetCurrentUser,
    clearCurrentUser: mockClearCurrentUser,
    setMeStatus:     mockSetMeStatus,
  })),
}))

import { resolveRole, useMeSync } from '../../../../servicos-global/shell/hooks/useMeSync.js'

// ─── Fixture ─────────────────────────────────────────────────────────────────
const ME_RESPONSE = {
  usuario: {
    id_usuario:              'usr_abc123',
    nome_usuario:            'Maria Silva',
    email_usuario:           'maria@example.com',
    tipo_usuario:            'MASTER',
    id_organizacao_usuario:  'ten_xyz789',
  },
  organizacao: { nome_organizacao: 'Empresa Teste Ltda' },
}

// ─── resolveRole ─────────────────────────────────────────────────────────────
describe('resolveRole', () => {
  it.each([
    ['gravity_admin', 'Admin Gravity'],
    ['SUPER_ADMIN',   'Super Admin'],
    ['ADMIN',         'Admin'],
    ['MASTER',        'Master'],
    ['STANDARD',      'Standard'],
    ['SUPPLIER',      'Fornecedor'],
  ])('mapeia %s → %s', (input, expected) => {
    expect(resolveRole(input)).toBe(expected)
  })

  it('retorna string vazia como "Standard" (fallback)', () => {
    expect(resolveRole('')).toBe('Standard')
  })

  it('retorna role desconhecida sem transformação', () => {
    expect(resolveRole('ROLE_DESCONHECIDA')).toBe('ROLE_DESCONHECIDA')
  })
})

// ─── useMeSync — comportamento do hook ───────────────────────────────────────
describe('useMeSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUser.mockReturnValue({ user: { imageUrl: 'https://img.example.com/av.jpg' } })
    vi.stubGlobal('fetch', vi.fn())
  })

  it('popula store com campos DDD corretos e define meStatus="success" em /me 200', async () => {
    mockGetToken.mockResolvedValue('valid-jwt')
    mockUseAuth.mockReturnValue({ isSignedIn: true, userId: 'clerk_success_01', getToken: mockGetToken })
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(ME_RESPONSE), { status: 200 })
    )

    renderHook(() => useMeSync())

    await waitFor(() => {
      expect(mockSetMeStatus).toHaveBeenCalledWith('success')
    })

    expect(mockSetMeStatus).toHaveBeenNthCalledWith(1, 'loading')
    expect(mockSetCurrentUser).toHaveBeenCalledWith(expect.objectContaining({
      id:         'usr_abc123',
      name:       'Maria Silva',
      email:      'maria@example.com',
      tenantId:   'ten_xyz789',
      tenantName: 'Empresa Teste Ltda',
      role:       'Master',
    }))
  })

  it('define meStatus="error" e NÃO popula store quando /me retorna 401', async () => {
    mockGetToken.mockResolvedValue('expired-token')
    mockUseAuth.mockReturnValue({ isSignedIn: true, userId: 'clerk_401_test', getToken: mockGetToken })
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('Unauthorized', { status: 401 })
    )

    renderHook(() => useMeSync())

    await waitFor(() => {
      expect(mockSetMeStatus).toHaveBeenCalledWith('error')
    })

    expect(mockSetCurrentUser).not.toHaveBeenCalled()
  })

  it('define meStatus="error" quando /me retorna 500', async () => {
    mockGetToken.mockResolvedValue('token-500')
    mockUseAuth.mockReturnValue({ isSignedIn: true, userId: 'clerk_500_test', getToken: mockGetToken })
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('Internal Server Error', { status: 500 })
    )

    renderHook(() => useMeSync())

    await waitFor(() => {
      expect(mockSetMeStatus).toHaveBeenCalledWith('error')
    })

    expect(mockSetCurrentUser).not.toHaveBeenCalled()
  })

  it('define meStatus="error" em exceção de rede (fetch rejeita)', async () => {
    mockGetToken.mockResolvedValue('token-net')
    mockUseAuth.mockReturnValue({ isSignedIn: true, userId: 'clerk_net_err', getToken: mockGetToken })
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    renderHook(() => useMeSync())

    await waitFor(() => {
      expect(mockSetMeStatus).toHaveBeenCalledWith('error')
    })

    expect(mockSetCurrentUser).not.toHaveBeenCalled()
  })

  it('define meStatus="error" quando getToken retorna null', async () => {
    mockGetToken.mockResolvedValue(null)
    mockUseAuth.mockReturnValue({ isSignedIn: true, userId: 'clerk_no_token', getToken: mockGetToken })

    renderHook(() => useMeSync())

    await waitFor(() => {
      expect(mockSetMeStatus).toHaveBeenCalledWith('error')
    })

    expect(fetch).not.toHaveBeenCalled()
  })

  it('não re-fetcha para o mesmo userId (guard do fetchedForRef)', async () => {
    mockGetToken.mockResolvedValue('guard-token')
    mockUseAuth.mockReturnValue({ isSignedIn: true, userId: 'clerk_guard_user', getToken: mockGetToken })
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(ME_RESPONSE), { status: 200 })
    )

    const { rerender } = renderHook(() => useMeSync())
    await waitFor(() => expect(mockSetMeStatus).toHaveBeenCalledWith('success'))

    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ isSignedIn: true, userId: 'clerk_guard_user', getToken: mockGetToken })
    rerender()
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })

    expect(fetch).not.toHaveBeenCalled()
  })

  it('chama clearCurrentUser (que reseta meStatus para "idle") quando usuário desloga', async () => {
    mockUseAuth.mockReturnValue({ isSignedIn: false, userId: null, getToken: mockGetToken })

    renderHook(() => useMeSync())
    await act(async () => { await Promise.resolve() })

    expect(mockClearCurrentUser).toHaveBeenCalled()
  })
})
