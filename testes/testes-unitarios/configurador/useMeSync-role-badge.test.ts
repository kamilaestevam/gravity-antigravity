// @vitest-environment jsdom
// TST-UNIT-CONFIG-MSYNC-001 — useMeSync + resolveRole (role-badge guard)
// Foco: casos NÃO cobertos pelos arquivos existentes (useMeSync.test.ts).
// Casos críticos marcados com BUG DETECTION falharão com a implementação atual —
// isso é intencional: eles sinalizam o bug do badge 'USUÁRIO'.
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

import { resolveRole, useMeSync } from '../../../servicos-global/shell/hooks/useMeSync.js'
import { useShellStore } from '../../../servicos-global/shell/store/useShellStore.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const VALID_LABELS = new Set([
  'Admin Gravity', 'Super Admin', 'Admin', 'Master', 'Standard', 'Fornecedor',
])

function mockAuthSignedIn(userId = 'clerk_badge_user') {
  mockGetToken.mockResolvedValue('valid-jwt')
  mockUseAuth.mockReturnValue({
    isLoaded: true, isSignedIn: true, userId, getToken: mockGetToken,
  })
  mockUseUser.mockReturnValue({ user: { imageUrl: undefined } })
}

function makeMeResponse(tipoUsuario: string) {
  return {
    usuario: {
      id_usuario:             'usr_badge_test',
      nome_usuario:           'Badge Tester',
      email_usuario:          'badge@usegravity.com.br',
      tipo_usuario:           tipoUsuario,
      id_organizacao_usuario: 'ten_badge',
      preferred_company_id:   null,
    },
    organizacao: { nome_organizacao: 'Empresa Badge Ltda' },
  }
}

// ─── Setup / Teardown ────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())
  act(() => { useShellStore.getState().clearCurrentUser() })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─── resolveRole — roles legadas / desconhecidas nunca passam como badge ─────
describe('resolveRole — roles inválidas e legadas', () => {
  // MSYNC-008 — BUG DETECTION: com a implementação atual este teste FALHA
  // A correção é: `return ROLE_LABELS[raw] ?? 'Standard'` (remover o passthrough)
  it('MSYNC-008: resolveRole("USUÁRIO") retorna "Standard" — NÃO passa a string "USUÁRIO" como badge', () => {
    expect(resolveRole('USUÁRIO')).toBe('Standard')
    expect(resolveRole('USUÁRIO')).not.toBe('USUÁRIO')
  })

  // MSYNC-009 — lowercase legado
  it('MSYNC-009: resolveRole("usuario") retorna "Standard" — não faz passthrough de lowercase', () => {
    expect(resolveRole('usuario')).toBe('Standard')
  })

  // MSYNC-010 — BUG DETECTION: qualquer role desconhecida retorna 'Standard'
  it('MSYNC-010: resolveRole("ROLE_QUALQUER_OUTRA") retorna "Standard" — não passthrough de string arbitrária', () => {
    expect(resolveRole('ROLE_QUALQUER_OUTRA')).toBe('Standard')
    expect(resolveRole('ROLE_QUALQUER_OUTRA')).not.toBe('ROLE_QUALQUER_OUTRA')
  })

  // MSYNC-011 — conjunto de roles legadas
  it('MSYNC-011: todas as roles legadas/inválidas retornam "Standard"', () => {
    const legacyRoles = ['USUÁRIO', 'user', 'USER', 'Admin', 'standard', 'Unknown', '123', 'null']
    for (const role of legacyRoles) {
      expect(resolveRole(role), `resolveRole('${role}') deve ser 'Standard'`).toBe('Standard')
    }
  })

  // MSYNC-012 — resultado sempre na allowlist
  it('MSYNC-012: resolveRole sempre retorna valor da allowlist de labels válidos', () => {
    const inputs = ['gravity_admin', 'SUPER_ADMIN', 'ADMIN', 'MASTER', 'STANDARD', 'SUPPLIER', '', 'USUÁRIO', 'garbage', 'user']
    for (const raw of inputs) {
      const result = resolveRole(raw)
      expect(VALID_LABELS.has(result), `resolveRole('${raw}') = '${result}' não está na allowlist`).toBe(true)
    }
  })
})

// ─── resolveRole — casos extremos (null / undefined) ─────────────────────────
describe('resolveRole — null e undefined', () => {
  // MSYNC-013
  it('MSYNC-013: resolveRole(null as string) retorna "Standard" sem crash', () => {
    expect(() => resolveRole(null as unknown as string)).not.toThrow()
    expect(resolveRole(null as unknown as string)).toBe('Standard')
  })

  // MSYNC-014
  it('MSYNC-014: resolveRole(undefined as string) retorna "Standard" sem crash', () => {
    expect(() => resolveRole(undefined as unknown as string)).not.toThrow()
    expect(resolveRole(undefined as unknown as string)).toBe('Standard')
  })
})

// ─── Store — role default é undefined (nunca "USUÁRIO") ──────────────────────
describe('Shell store — estado inicial de role', () => {
  // MSYNC-015
  it('MSYNC-015: DEFAULT_USER não tem campo role — currentUser.role é undefined quando store está limpo', () => {
    act(() => { useShellStore.getState().clearCurrentUser() })
    expect(useShellStore.getState().currentUser.role).toBeUndefined()
  })

  // MSYNC-016
  it('MSYNC-016: Header fallback `currentUser.role || "Standard"` com role undefined → "Standard", nunca "USUÁRIO"', () => {
    act(() => { useShellStore.getState().clearCurrentUser() })
    const role = useShellStore.getState().currentUser.role
    expect(role || 'Standard').toBe('Standard')
    expect(role || 'Standard').not.toBe('USUÁRIO')
    expect(role).toBeUndefined()
  })
})

// ─── useMeSync — integração com store: role nunca é "USUÁRIO" ─────────────────
describe('useMeSync — integração store: role badge guard', () => {
  // MSYNC-017 — BUG DETECTION: tipo_usuario='USUÁRIO' do banco → store.role deve ser 'Standard'
  it('MSYNC-017: quando /api/v1/me retorna tipo_usuario="USUÁRIO" → store.role é "Standard" (não "USUÁRIO")', async () => {
    mockAuthSignedIn('clerk_legacy_role')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(makeMeResponse('USUÁRIO')), { status: 200 })
    )

    renderHook(() => useMeSync())

    await waitFor(() => expect(useShellStore.getState().meStatus).toBe('success'))

    expect(useShellStore.getState().currentUser.role).toBe('Standard')
    expect(useShellStore.getState().currentUser.role).not.toBe('USUÁRIO')
  })

  // MSYNC-018 — quando /api/v1/me retorna 403, store.role permanece undefined (não 'USUÁRIO')
  it('MSYNC-018: quando /api/v1/me retorna 403 → meStatus="error", store.role não é "USUÁRIO"', async () => {
    mockAuthSignedIn('clerk_403_user')
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('Forbidden', { status: 403 })
    )

    renderHook(() => useMeSync())

    await waitFor(() => expect(useShellStore.getState().meStatus).toBe('error'))

    expect(useShellStore.getState().currentUser.role).toBeUndefined()
    expect(useShellStore.getState().currentUser.role).not.toBe('USUÁRIO')
  })

  // MSYNC-019 — store.role sempre na allowlist para qualquer tipo_usuario válido
  it.each([
    ['SUPER_ADMIN', 'Super Admin'],
    ['ADMIN',       'Admin'],
    ['MASTER',      'Master'],
    ['STANDARD',    'Standard'],
    ['SUPPLIER',    'Fornecedor'],
  ] as const)(
    'MSYNC-019: tipo_usuario="%s" → store.role="%s" (sempre na allowlist)',
    async (tipoUsuario, expectedLabel) => {
      const userId = `clerk_${tipoUsuario.toLowerCase()}`
      mockAuthSignedIn(userId)
      ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify(makeMeResponse(tipoUsuario)), { status: 200 })
      )

      const { unmount } = renderHook(() => useMeSync())

      await waitFor(() => expect(useShellStore.getState().meStatus).toBe('success'))

      const role = useShellStore.getState().currentUser.role ?? 'Standard'
      expect(VALID_LABELS.has(role)).toBe(true)
      expect(role).toBe(expectedLabel)

      unmount()
      act(() => { useShellStore.getState().clearCurrentUser() })
    }
  )
})
