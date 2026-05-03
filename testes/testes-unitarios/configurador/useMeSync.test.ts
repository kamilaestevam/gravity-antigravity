// @vitest-environment jsdom
// TST-UNIT-CONF-ME-001 — useMeSync + resolveRole
// Cobre: fluxo completo useMeSync → currentUser (tenantName, userName, userEmail),
// fallback 'Organização' quando tenantName é undefined, resolveRole, meStatus
// e cenários de erro (token null, 4xx, falha de rede).
/// <reference types="vitest/globals" />
import { renderHook, waitFor, act } from '@testing-library/react'

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const { mockGetToken, mockUseAuth, mockUseUser } = vi.hoisted(() => ({
  mockGetToken: vi.fn(),
  mockUseAuth:  vi.fn(),
  mockUseUser:  vi.fn(),
}))

vi.mock('@clerk/clerk-react', () => ({
  useAuth: mockUseAuth,
  useUser: mockUseUser,
}))

import {
  useMeSync,
  resolveRole,
} from '../../../servicos-global/shell/hooks/useMeSync.js'
import { useShellStore } from '../../../servicos-global/shell/store/useShellStore.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeMeResponse(overrides: {
  nome_usuario?: string
  email_usuario?: string
  tipo_usuario?: string
  id_organizacao?: string
  nome_organizacao?: string | null
} = {}) {
  return {
    usuario: {
      id_usuario:             'usr_test',
      nome_usuario:           overrides.nome_usuario ?? 'Gravity Tester',
      email_usuario:          overrides.email_usuario ?? 'tester@usegravity.com.br',
      tipo_usuario:           overrides.tipo_usuario  ?? 'STANDARD',
      id_organizacao: overrides.id_organizacao ?? 'ten_test',
      preferred_company_id:   null,
    },
    organizacao: overrides.nome_organizacao !== undefined
      ? { nome_organizacao: overrides.nome_organizacao }
      : { nome_organizacao: 'Importes Real SA' },
  }
}

function mockAuthSignedIn(userId = 'clerk_test_user') {
  mockGetToken.mockResolvedValue('valid-jwt')
  mockUseAuth.mockReturnValue({
    isLoaded: true, isSignedIn: true, userId, getToken: mockGetToken,
  })
  mockUseUser.mockReturnValue({ user: { imageUrl: 'https://img.clerk.dev/test.jpg' } })
}

// ─── Setup / Teardown ────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())
  // Reseta o store entre testes
  act(() => {
    useShellStore.getState().clearCurrentUser()
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─── resolveRole (puro) ───────────────────────────────────────────────────────
describe('resolveRole', () => {
  it.each([
    ['gravity_admin', 'Admin Gravity'],
    ['SUPER_ADMIN',   'Super Admin'],
    ['ADMIN',         'Admin'],
    ['MASTER',        'Master'],
    ['STANDARD',      'Standard'],
    ['SUPPLIER',      'Fornecedor'],
    ['',              'Standard'],
    ['DESCONHECIDO',  'DESCONHECIDO'],
  ] as const)('role raw=%j → label=%j', (raw, expected) => {
    expect(resolveRole(raw)).toBe(expected)
  })
})

// ─── Fluxo principal: tenantName dinâmico ────────────────────────────────────
describe('useMeSync → currentUser.nomeOrganizacao', () => {
  it('popula tenantName com nome_organizacao retornado pela API', async () => {
    mockAuthSignedIn('clerk_tenant_ok')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse({ nome_organizacao: 'Importes Real SA' })), { status: 200 })
    )

    renderHook(() => useMeSync())

    await waitFor(() =>
      expect(useShellStore.getState().currentUser.nomeOrganizacao).toBe('Importes Real SA')
    )
  })

  it('tenantName é undefined quando organizacao.nome_organizacao é null — sidebar mostra fallback', async () => {
    mockAuthSignedIn('clerk_no_org')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse({ nome_organizacao: null })), { status: 200 })
    )

    renderHook(() => useMeSync())

    await waitFor(() =>
      expect(useShellStore.getState().meStatus).toBe('success')
    )

    // Quando undefined, o WorkspaceLayout exibe 'Organização' via ?? operator
    const { nomeOrganizacao } = useShellStore.getState().currentUser
    expect(nomeOrganizacao).toBeUndefined()
    // Simula o ?? do WorkspaceLayout:
    expect(nomeOrganizacao ?? 'Organização').toBe('Organização')
  })

  it('NÃO exibe "Importes SA" — o mock foi removido', async () => {
    mockAuthSignedIn('clerk_no_mock')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse({ nome_organizacao: 'Outra Empresa' })), { status: 200 })
    )

    renderHook(() => useMeSync())

    await waitFor(() =>
      expect(useShellStore.getState().currentUser.nomeOrganizacao).toBe('Outra Empresa')
    )

    expect(useShellStore.getState().currentUser.nomeOrganizacao).not.toBe('Importes SA')
  })
})

// ─── Fluxo principal: userName e userEmail ───────────────────────────────────
describe('useMeSync → currentUser.name e currentUser.email', () => {
  it('popula name e email do backend como fonte primária', async () => {
    mockAuthSignedIn('clerk_user_fields')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse({
        nome_usuario: 'Daniel Tester',
        email_usuario: 'daniel@usegravity.com.br',
      })), { status: 200 })
    )

    renderHook(() => useMeSync())

    await waitFor(() =>
      expect(useShellStore.getState().meStatus).toBe('success')
    )

    const { name, email } = useShellStore.getState().currentUser
    expect(name).toBe('Daniel Tester')
    expect(email).toBe('daniel@usegravity.com.br')
  })

  it('name e email ficam como string vazia quando API retorna null — ?? preserva o vazio', async () => {
    mockAuthSignedIn('clerk_null_fields')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse({
        nome_usuario:  '',
        email_usuario: '',
      })), { status: 200 })
    )

    renderHook(() => useMeSync())

    await waitFor(() =>
      expect(useShellStore.getState().meStatus).toBe('success')
    )

    const { name, email } = useShellStore.getState().currentUser
    // ?? preserva empty string — Clerk é fallback externo, não interno
    expect(name ?? 'Usuário').toBe('')
    expect(email ?? 'usuario@usegravity.com.br').toBe('')
  })
})

// ─── meStatus — máquina de estados ───────────────────────────────────────────
describe('useMeSync — meStatus', () => {
  it('transição idle → loading → success no caminho feliz', async () => {
    mockAuthSignedIn('clerk_status_ok')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse()), { status: 200 })
    )

    renderHook(() => useMeSync())

    await waitFor(() =>
      expect(useShellStore.getState().meStatus).toBe('success')
    )
  })

  it('transição idle → loading → error quando /me retorna 4xx', async () => {
    mockAuthSignedIn('clerk_status_4xx')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('Unauthorized', { status: 401 })
    )

    renderHook(() => useMeSync())

    await waitFor(() =>
      expect(useShellStore.getState().meStatus).toBe('error')
    )
  })

  it('transição idle → loading → error em falha de rede', async () => {
    mockAuthSignedIn('clerk_status_net')
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    renderHook(() => useMeSync())

    await waitFor(() =>
      expect(useShellStore.getState().meStatus).toBe('error')
    )
  })
})

// ─── Cenários de erro e edge cases ───────────────────────────────────────────
describe('useMeSync — cenários de erro', () => {
  it('não faz fetch quando token é null', async () => {
    mockGetToken.mockResolvedValue(null)
    mockUseAuth.mockReturnValue({
      isLoaded: true, isSignedIn: true, userId: 'clerk_no_token', getToken: mockGetToken,
    })
    mockUseUser.mockReturnValue({ user: null })

    renderHook(() => useMeSync())

    await waitFor(() =>
      expect(useShellStore.getState().meStatus).toBe('error')
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('não faz fetch quando usuário não está autenticado', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true, isSignedIn: false, userId: null, getToken: mockGetToken,
    })
    mockUseUser.mockReturnValue({ user: null })

    renderHook(() => useMeSync())

    // Aguarda ciclo de render sem expect de status (hook fica em idle)
    await new Promise(r => setTimeout(r, 50))
    expect(fetch).not.toHaveBeenCalled()
    expect(useShellStore.getState().meStatus).toBe('idle')
  })

  it('clearCurrentUser é chamado quando isSignedIn vira false', async () => {
    // Inicia autenticado
    mockAuthSignedIn('clerk_logout')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse()), { status: 200 })
    )

    const { rerender } = renderHook(() => useMeSync())
    await waitFor(() =>
      expect(useShellStore.getState().meStatus).toBe('success')
    )
    expect(useShellStore.getState().currentUser.nomeOrganizacao).toBe('Importes Real SA')

    // Simula logout
    mockUseAuth.mockReturnValue({
      isLoaded: true, isSignedIn: false, userId: null, getToken: mockGetToken,
    })
    rerender()

    await waitFor(() =>
      expect(useShellStore.getState().currentUser.nomeOrganizacao).toBeUndefined()
    )
    expect(useShellStore.getState().meStatus).toBe('idle')
  })

  it('fetch não é duplicado para o mesmo userId (ref guard)', async () => {
    mockAuthSignedIn('clerk_dedup')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse()), { status: 200 })
    )

    const { rerender } = renderHook(() => useMeSync())
    await waitFor(() =>
      expect(useShellStore.getState().meStatus).toBe('success')
    )

    rerender()
    rerender()

    expect((fetch as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(1)
  })
})
