/**
 * Mock de @gravity/shell e @shell
 * Implementa um mini-store sem dependencia de zustand
 */
import React, { useCallback, useSyncExternalStore } from 'react'

interface Notification {
  type: string
  message: string
}

interface ShellState {
  sidebarOpen: boolean
  currentTheme: string
  tooltipsDisabled: boolean
  currentUser: { id: string; name: string; email: string }
  notifications: Notification[]
}

type Listener = () => void

let state: ShellState = {
  sidebarOpen: true,
  currentTheme: 'dark',
  tooltipsDisabled: false,
  currentUser: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
  notifications: [],
}

const listeners = new Set<Listener>()

function setState(partial: Partial<ShellState> | ((s: ShellState) => Partial<ShellState>)) {
  const update = typeof partial === 'function' ? partial(state) : partial
  state = { ...state, ...update }
  listeners.forEach((l) => l())
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

/** Resetar estado para testes */
export function resetShellStore(overrides?: Partial<ShellState>) {
  state = {
    sidebarOpen: true,
    currentTheme: 'dark',
    tooltipsDisabled: false,
    currentUser: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
    notifications: [],
    ...overrides,
  }
  listeners.forEach((l) => l())
}

interface ShellStoreApi extends ShellState {
  addNotification: (n: Notification) => void
  toggleTooltips: () => void
  toggleSidebar: () => void
}

type Selector<T> = (s: ShellStoreApi) => T

export function useShellStore<T>(selector: Selector<T>): T
export function useShellStore(): ShellStoreApi
export function useShellStore<T>(selector?: Selector<T>): T | ShellStoreApi {
  const snap = useSyncExternalStore(subscribe, getSnapshot)

  const api: ShellStoreApi = {
    ...snap,
    addNotification: (n: Notification) => setState((s) => ({ notifications: [...s.notifications, n] })),
    toggleTooltips: () => setState((s) => ({ tooltipsDisabled: !s.tooltipsDisabled })),
    toggleSidebar: () => setState((s) => ({ sidebarOpen: !s.sidebarOpen })),
  }

  if (selector) return selector(api)
  return api
}

// Permite acesso direto ao setState para testes
useShellStore.setState = (partial: Partial<ShellState>) => setState(partial)
useShellStore.getState = () => {
  const s = getSnapshot()
  return {
    ...s,
    addNotification: (n: Notification) => setState((prev) => ({ notifications: [...prev.notifications, n] })),
    toggleTooltips: () => setState((prev) => ({ tooltipsDisabled: !prev.tooltipsDisabled })),
    toggleSidebar: () => setState((prev) => ({ sidebarOpen: !prev.sidebarOpen })),
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return <div data-testid="shell-layout">{children}</div>
}

export function ToastContainer() {
  return <div data-testid="toast-container" />
}
