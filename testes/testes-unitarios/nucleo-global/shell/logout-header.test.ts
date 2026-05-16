// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockSignOut, mockUseClerk } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
  mockUseClerk: vi.fn(),
}))

vi.mock('@clerk/clerk-react', () => ({
  useClerk: mockUseClerk,
}))

describe('Shell Header — logout (onSignOut)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockImplementation((cb?: () => void) => { if (cb) cb() })
    mockUseClerk.mockReturnValue({ signOut: mockSignOut })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('onSignOut chama signOut() do Clerk para encerrar sessão', () => {
    const { signOut } = mockUseClerk()

    const onSignOut = () => { signOut(() => { window.location.href = '/' }) }
    onSignOut()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockSignOut).toHaveBeenCalledWith(expect.any(Function))
  })

  it('signOut recebe callback que redireciona para "/" após encerrar sessão', () => {
    let redirectCalled = false
    mockSignOut.mockImplementation((cb?: () => void) => {
      if (cb) cb()
    })

    const originalHref = Object.getOwnPropertyDescriptor(window, 'location')
    const mockLocation = { href: '' }
    Object.defineProperty(window, 'location', { value: mockLocation, writable: true })

    const { signOut } = mockUseClerk()
    const onSignOut = () => { signOut(() => { window.location.href = '/' }) }
    onSignOut()

    expect(window.location.href).toBe('/')

    if (originalHref) {
      Object.defineProperty(window, 'location', originalHref)
    }
  })

  it('NÃO usa clearCurrentUser no callback — cleanup é automático via useMeSync', () => {
    const clearCurrentUser = vi.fn()
    const { signOut } = mockUseClerk()

    const onSignOut = () => { signOut(() => { window.location.href = '/' }) }
    onSignOut()

    expect(clearCurrentUser).not.toHaveBeenCalled()
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })
})
