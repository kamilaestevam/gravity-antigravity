/**
 * Teste unitário — useShellStore
 *
 * Cobertura:
 * - addNotification: cria notificação com ID único, auto-remove após duration
 * - toggleTheme / setTheme: altera currentTheme e aplica classe ao body
 * - setCurrentUser / clearCurrentUser: gerencia dados do usuário ativo
 * - toggleSidebar / setSidebarOpen: alterna estado da sidebar
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from '@testing-library/react'

// Importa a store depois de garantir reset entre testes
let useShellStore: typeof import('@gravity/shell')['useShellStore']

beforeEach(async () => {
  // Reset do módulo para limpar estado do Zustand entre testes
  vi.resetModules()
  const mod = await import('@gravity/shell')
  useShellStore = mod.useShellStore
  // Reseta estado inicial manualmente
  useShellStore.setState({
    sidebarOpen: true,
    currentTheme: 'dark',
    currentUser: { id: '', name: '', email: '' },
    notifications: [],
  })
  // Garante body limpo
  document.body.className = ''
})

afterEach(() => {
  vi.clearAllTimers()
  document.body.className = ''
})

// ─── Notificações ───────────────────────────────────────────────────────────

describe('addNotification', () => {
  it('adiciona notificação ao estado com ID único', () => {
    const { addNotification } = useShellStore.getState()

    act(() => {
      addNotification({ type: 'success', message: 'Salvo com sucesso!' })
    })

    const { notifications } = useShellStore.getState()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].message).toBe('Salvo com sucesso!')
    expect(notifications[0].type).toBe('success')
    expect(notifications[0].id).toMatch(/^notif-/)
  })

  it('gera IDs únicos para notificações distintas', () => {
    const { addNotification } = useShellStore.getState()

    act(() => {
      addNotification({ type: 'success', message: 'A' })
      addNotification({ type: 'error',   message: 'B' })
    })

    const { notifications } = useShellStore.getState()
    expect(notifications).toHaveLength(2)
    expect(notifications[0].id).not.toBe(notifications[1].id)
  })

  it('remove notificação automaticamente após duration', async () => {
    vi.useFakeTimers()
    const { addNotification } = useShellStore.getState()

    act(() => {
      addNotification({ type: 'info', message: 'Vai sumir', duration: 1000 })
    })

    expect(useShellStore.getState().notifications).toHaveLength(1)

    act(() => { vi.advanceTimersByTime(1000) })

    expect(useShellStore.getState().notifications).toHaveLength(0)
    vi.useRealTimers()
  })

  it('suporta todos os tipos de notificação', () => {
    const { addNotification } = useShellStore.getState()
    const tipos = ['success', 'error', 'warning', 'info'] as const

    act(() => {
      tipos.forEach((type) => addNotification({ type, message: `${type} msg` }))
    })

    const { notifications } = useShellStore.getState()
    expect(notifications).toHaveLength(4)
    tipos.forEach((type, i) => {
      expect(notifications[i].type).toBe(type)
    })
  })
})

describe('removeNotification', () => {
  it('remove notificação pelo ID correto', () => {
    const { addNotification } = useShellStore.getState()

    act(() => {
      addNotification({ type: 'success', message: 'A', duration: 0 })
      addNotification({ type: 'error',   message: 'B', duration: 0 })
    })

    const id = useShellStore.getState().notifications[0].id

    act(() => {
      useShellStore.getState().removeNotification(id)
    })

    const { notifications } = useShellStore.getState()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].message).toBe('B')
  })
})

describe('clearNotifications', () => {
  it('limpa todas as notificações', () => {
    const { addNotification, clearNotifications } = useShellStore.getState()

    act(() => {
      addNotification({ type: 'success', message: 'A', duration: 0 })
      addNotification({ type: 'error',   message: 'B', duration: 0 })
    })

    act(() => { clearNotifications() })

    expect(useShellStore.getState().notifications).toHaveLength(0)
  })
})

// ─── Tema ───────────────────────────────────────────────────────────────────

describe('toggleTheme', () => {
  it('alterna de dark para light', () => {
    act(() => {
      useShellStore.getState().toggleTheme()
    })
    expect(useShellStore.getState().currentTheme).toBe('light')
    expect(document.body.classList.contains('light-theme')).toBe(true)
  })

  it('alterna de light para dark', () => {
    useShellStore.setState({ currentTheme: 'light' })
    document.body.classList.add('light-theme')

    act(() => {
      useShellStore.getState().toggleTheme()
    })

    expect(useShellStore.getState().currentTheme).toBe('dark')
    expect(document.body.classList.contains('light-theme')).toBe(false)
  })
})

describe('setTheme', () => {
  it('seta light theme e aplica classe ao body', () => {
    act(() => {
      useShellStore.getState().setTheme('light')
    })
    expect(useShellStore.getState().currentTheme).toBe('light')
    expect(document.body.classList.contains('light-theme')).toBe(true)
  })

  it('seta dark theme e remove classe light do body', () => {
    document.body.classList.add('light-theme')
    act(() => {
      useShellStore.getState().setTheme('dark')
    })
    expect(useShellStore.getState().currentTheme).toBe('dark')
    expect(document.body.classList.contains('light-theme')).toBe(false)
  })
})

// ─── Usuário ─────────────────────────────────────────────────────────────────

describe('setCurrentUser', () => {
  it('atualiza todos os campos do usuário', () => {
    const user = {
      id: 'user-123',
      name: 'João Silva',
      email: 'joao@empresa.com',
      tenantId: 'tenant-abc',
      tenantName: 'Empresa ABC',
    }

    act(() => {
      useShellStore.getState().setCurrentUser(user)
    })

    const { currentUser } = useShellStore.getState()
    expect(currentUser.id).toBe('user-123')
    expect(currentUser.name).toBe('João Silva')
    expect(currentUser.tenantId).toBe('tenant-abc')
    expect(currentUser.tenantName).toBe('Empresa ABC')
  })
})

describe('clearCurrentUser', () => {
  it('reseta usuário para estado vazio', () => {
    useShellStore.setState({
      currentUser: { id: 'u1', name: 'Test', email: 't@t.com' }
    })

    act(() => {
      useShellStore.getState().clearCurrentUser()
    })

    const { currentUser } = useShellStore.getState()
    expect(currentUser.id).toBe('')
    expect(currentUser.name).toBe('')
  })
})

// ─── Sidebar ─────────────────────────────────────────────────────────────────

describe('toggleSidebar', () => {
  it('alterna sidebarOpen de true para false', () => {
    expect(useShellStore.getState().sidebarOpen).toBe(true)
    act(() => { useShellStore.getState().toggleSidebar() })
    expect(useShellStore.getState().sidebarOpen).toBe(false)
  })

  it('alterna sidebarOpen de false para true', () => {
    useShellStore.setState({ sidebarOpen: false })
    act(() => { useShellStore.getState().toggleSidebar() })
    expect(useShellStore.getState().sidebarOpen).toBe(true)
  })
})

describe('setSidebarOpen', () => {
  it('define sidebarOpen diretamente', () => {
    act(() => { useShellStore.getState().setSidebarOpen(false) })
    expect(useShellStore.getState().sidebarOpen).toBe(false)

    act(() => { useShellStore.getState().setSidebarOpen(true) })
    expect(useShellStore.getState().sidebarOpen).toBe(true)
  })
})
