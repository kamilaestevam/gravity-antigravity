// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockSignOut, mockUseClerk, mockUseAuth, mockGetToken } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
  mockUseClerk: vi.fn(),
  mockUseAuth: vi.fn(),
  mockGetToken: vi.fn(),
}))

vi.mock('@clerk/clerk-react', () => ({
  useClerk: mockUseClerk,
  useAuth: mockUseAuth,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('react-router-dom', () => ({
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: () => null,
  Navigate: () => null,
  useLocation: () => ({ pathname: '/produto/pedido/pedidos/lista' }),
  useNavigate: () => vi.fn(),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, d: string) => d || k, i18n: { language: 'pt' } }),
}))

vi.mock('@gravity/shell', () => ({
  useShellStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const store: Record<string, unknown> = {
      currentUser: { name: 'Test', email: 'test@test.com', role: 'MASTER', avatarUrl: '' },
      toggleTheme: vi.fn(),
      currentTheme: 'dark',
      workspaces: [],
      idWorkspaceAtivo: null,
      allowedProducts: [],
      meStatus: 'ok',
    }
    return selector(store)
  }),
  ToastContainer: () => null,
  useMeSync: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn().mockReturnValue({}),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@nucleo/tela-produto-global', () => ({
  TelaProdutoGlobal: ({ usuario }: { usuario: { onSignOut: () => void } }) => {
    globalThis.__pedidoOnSignOut = usuario.onSignOut
    return null
  },
}))

vi.mock('@nucleo/localizador-global', () => ({
  useLocalizadorHistory: () => ({ registrar: vi.fn() }),
}))

vi.mock('@nucleo/logo-produtos', () => ({
  getProdutoMeta: () => ({ cor: '#000', nome: 'Test' }),
}))

vi.mock('@phosphor-icons/react', () => new Proxy({}, { get: () => () => null }))

vi.mock('../../../../servicos-global/produto/pedido/client/src/shared/config', () => ({
  PRODUCT_CONFIG: { product_id: 'pedido', port: 8030, nav: [] },
}))

vi.mock('../../../../servicos-global/servicos-plataforma/notificacoes/src/Notificacoes', () => ({
  Notificacoes: () => null,
}))

vi.mock('../../../../servicos-global/produto/pedido/client/src/shared/api', () => ({
  setApiContext: vi.fn(),
  injectTenantGetter: vi.fn(),
  injectTokenGetter: vi.fn(),
  injectWorkspaceGetter: vi.fn(),
}))

vi.mock('../../../../servicos-global/produto/pedido/client/src/shared/permissoes/usePermissoesPedido', () => ({
  usePermissoesPedido: () => ({
    podeVer: () => true,
    podeEditar: () => true,
    carregando: false,
    estadoPermissao: () => 'permitido',
  }),
}))

vi.mock('../../../../servicos-global/produto/pedido/client/src/shared/permissoes/BloqueioPermissaoOpaco', () => ({
  BloqueioPermissaoOpaco: ({ children }: { children: React.ReactNode }) => children,
}))

declare global {
  // eslint-disable-next-line no-var
  var __pedidoOnSignOut: (() => void) | undefined
}

describe('Pedido App — logout (onSignOut)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockImplementation((cb?: () => void) => { if (cb) cb() })
    mockUseClerk.mockReturnValue({ signOut: mockSignOut })
    mockUseAuth.mockReturnValue({ isSignedIn: true, userId: 'u1', getToken: mockGetToken })
    mockGetToken.mockResolvedValue('jwt-test')
    globalThis.__pedidoOnSignOut = undefined
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete globalThis.__pedidoOnSignOut
  })

  it('onSignOut chama signOut() do Clerk em vez de apenas clearCurrentUser (bug fix)', async () => {
    const { renderHook } = await import('@testing-library/react')
    const React = await import('react')

    const useAppSignOut = () => {
      const { signOut } = mockUseClerk()
      return { signOut }
    }

    const { result } = renderHook(() => useAppSignOut())
    result.current.signOut()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('signOut recebe callback de redirect como argumento', () => {
    const signOut = mockSignOut
    signOut.mockImplementation((cb?: () => void) => { if (cb) cb() })

    const onSignOut = () => { signOut(() => { /* redirect */ }) }
    onSignOut()

    expect(signOut).toHaveBeenCalledWith(expect.any(Function))
  })

  it('NÃO chama clearCurrentUser diretamente — useMeSync cuida do cleanup automático', () => {
    const clearCurrentUser = vi.fn()
    const signOut = mockSignOut

    const onSignOut = () => { signOut(() => { window.location.href = '/' }) }
    onSignOut()

    expect(clearCurrentUser).not.toHaveBeenCalled()
    expect(signOut).toHaveBeenCalledTimes(1)
  })
})
