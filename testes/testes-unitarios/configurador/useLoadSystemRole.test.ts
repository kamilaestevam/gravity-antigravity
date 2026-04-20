// @vitest-environment jsdom
// TST-UNIT-CONF-AUTH-001 — useLoadSystemRole
// Valida: extrai role de data.usuario.tipo_usuario (DDD), isGravityAdmin,
// cache por userId, cenários de erro (token null, fetch falha, 4xx).
/// <reference types="vitest/globals" />
import { renderHook, waitFor } from '@testing-library/react'

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const { mockGetToken, mockUseAuth } = vi.hoisted(() => ({
  mockGetToken: vi.fn(),
  mockUseAuth:  vi.fn(),
}))

vi.mock('@clerk/clerk-react', () => ({
  useAuth: mockUseAuth,
}))

import {
  useLoadSystemRole,
  invalidateRoleCache,
  type SystemRole,
} from '../../../servicos-global/configurador/src/hooks/useLoadSystemRole.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeMeResponse(tipoUsuario: string) {
  return {
    usuario: {
      id_usuario:             'usr_test',
      nome_usuario:           'Teste',
      email_usuario:          'teste@example.com',
      tipo_usuario:           tipoUsuario,
      id_organizacao_usuario: 'ten_test',
      preferred_company_id:   null,
    },
    organizacao: null,
    workspaces:  [],
  }
}

function mockAuthSignedIn(userId = 'clerk_test_user') {
  mockGetToken.mockResolvedValue('valid-jwt')
  mockUseAuth.mockReturnValue({
    isLoaded: true, isSignedIn: true, userId, getToken: mockGetToken,
  })
}

// ─── Setup / Teardown ────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks()
  invalidateRoleCache()
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─── Extração do campo DDD ────────────────────────────────────────────────────
describe('extração de role via data.usuario.tipo_usuario', () => {
  it('retorna role MASTER lido de data.usuario.tipo_usuario', async () => {
    mockAuthSignedIn('clerk_master')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse('MASTER')), { status: 200 })
    )

    const { result } = renderHook(() => useLoadSystemRole())

    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.role).toBe('MASTER')
    expect(result.current.isGravityAdmin).toBe(false)
  })

  it('retorna role SUPER_ADMIN e isGravityAdmin=true', async () => {
    mockAuthSignedIn('clerk_super')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse('SUPER_ADMIN')), { status: 200 })
    )

    const { result } = renderHook(() => useLoadSystemRole())

    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.role).toBe('SUPER_ADMIN')
    expect(result.current.isGravityAdmin).toBe(true)
  })

  it('retorna role ADMIN e isGravityAdmin=true', async () => {
    mockAuthSignedIn('clerk_admin')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse('ADMIN')), { status: 200 })
    )

    const { result } = renderHook(() => useLoadSystemRole())

    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.role).toBe('ADMIN')
    expect(result.current.isGravityAdmin).toBe(true)
  })

  it('NÃO lê data.user.role (estrutura legada) — role deve ser null', async () => {
    mockAuthSignedIn('clerk_legado')
    // Payload na estrutura antiga — sem usuario.tipo_usuario
    const payloadLegado = { user: { id: 'x', role: 'SUPER_ADMIN' } }
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(payloadLegado), { status: 200 })
    )

    const { result } = renderHook(() => useLoadSystemRole())

    await waitFor(() => expect(result.current.isReady).toBe(true))
    // Se lesse data.user.role, retornaria 'SUPER_ADMIN'. Deve retornar null.
    expect(result.current.role).toBeNull()
    expect(result.current.isGravityAdmin).toBe(false)
  })
})

// ─── Cenários de erro ────────────────────────────────────────────────────────
describe('cenários de erro e edge cases', () => {
  it('role é null quando getToken retorna null', async () => {
    mockGetToken.mockResolvedValue(null)
    mockUseAuth.mockReturnValue({
      isLoaded: true, isSignedIn: true, userId: 'clerk_no_token', getToken: mockGetToken,
    })

    const { result } = renderHook(() => useLoadSystemRole())

    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.role).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('role é null e isReady=true quando /me retorna 4xx', async () => {
    mockAuthSignedIn('clerk_401')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('Unauthorized', { status: 401 })
    )

    const { result } = renderHook(() => useLoadSystemRole())

    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.role).toBeNull()
  })

  it('role é null e isReady=true em exceção de rede', async () => {
    mockAuthSignedIn('clerk_net')
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useLoadSystemRole())

    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.role).toBeNull()
  })

  it('não executa fetch quando usuário não está autenticado', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true, isSignedIn: false, userId: null, getToken: mockGetToken,
    })

    const { result } = renderHook(() => useLoadSystemRole())

    await waitFor(() => {
      // Hook fica em isReady=false sem userId — não deve chamar fetch
      expect(fetch).not.toHaveBeenCalled()
    })
    expect(result.current.role).toBeNull()
  })
})

// ─── Cache ────────────────────────────────────────────────────────────────────
describe('cache por userId', () => {
  it('cache hit: fetch não é chamado novamente para o mesmo userId', async () => {
    mockAuthSignedIn('clerk_cached')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse('STANDARD')), { status: 200 })
    )

    const { result, rerender } = renderHook(() => useLoadSystemRole())
    await waitFor(() => expect(result.current.isReady).toBe(true))

    vi.clearAllMocks()
    mockAuthSignedIn('clerk_cached')  // mesmo userId
    rerender()

    // Segundo render não deve chamar fetch
    expect(fetch).not.toHaveBeenCalled()
    expect(result.current.role).toBe('STANDARD')
  })

  it('invalidateRoleCache força novo fetch no próximo render', async () => {
    const userId = 'clerk_invalidate'
    mockAuthSignedIn(userId)
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse('STANDARD')), { status: 200 })
    )

    const { result } = renderHook(() => useLoadSystemRole())
    await waitFor(() => expect(result.current.isReady).toBe(true))

    expect(result.current.role).toBe('STANDARD')
    const fetchCallsFirst = (fetch as ReturnType<typeof vi.fn>).mock.calls.length
    expect(fetchCallsFirst).toBe(1)
  })

  it('invalidateRoleCache limpa o cache e permite novo fetch', async () => {
    const userId = 'clerk_invalidate_v2'
    mockAuthSignedIn(userId)
    ;(fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(new Response(JSON.stringify(makeMeResponse('STANDARD')), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(makeMeResponse('ADMIN')), { status: 200 }))

    const { result } = renderHook(() => useLoadSystemRole())
    await waitFor(() => expect(result.current.isReady).toBe(true))
    expect(result.current.role).toBe('STANDARD')

    // Limpa cache — o próximo mount deve buscar novamente
    invalidateRoleCache()

    const { result: result2 } = renderHook(() => useLoadSystemRole())
    await waitFor(() => expect(result2.current.isReady).toBe(true))
    expect(result2.current.role).toBe('ADMIN')
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(2)
  })
})

// ─── isGravityAdmin ───────────────────────────────────────────────────────────
describe('isGravityAdmin', () => {
  it.each<[SystemRole, boolean]>([
    ['SUPER_ADMIN', true],
    ['ADMIN',       true],
    ['MASTER',      false],
    ['STANDARD',    false],
    ['SUPPLIER',    false],
    [null,          false],
  ])('role=%s → isGravityAdmin=%s', async (role, expected) => {
    if (role === null) {
      mockGetToken.mockResolvedValue(null)
      mockUseAuth.mockReturnValue({
        isLoaded: true, isSignedIn: true, userId: `clerk_${expected}_null`, getToken: mockGetToken,
      })
    } else {
      mockAuthSignedIn(`clerk_${role}`)
      ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify(makeMeResponse(role)), { status: 200 })
      )
    }

    const { result } = renderHook(() => useLoadSystemRole())
    await waitFor(() => expect(result.current.isReady).toBe(true))

    expect(result.current.isGravityAdmin).toBe(expected)
  })
})
