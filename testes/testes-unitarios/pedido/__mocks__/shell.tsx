/**
 * Mock de @gravity/shell — mini-store zustand-compatible para testes
 */
import React, { useEffect, useReducer } from 'react'
import { createPortal } from 'react-dom'

// ── State store (singleton de módulo) ─────────────────────────────────────────

type NotificationType = 'success' | 'error' | 'warning' | 'info'
interface Notification { id: string; type: NotificationType; message: string }

interface ShellState {
  notifications: Notification[]
  addNotification: (n: { type: NotificationType; message: string }) => void
  removeNotification: (id: string) => void
  currentUser: { id: string; name: string; email: string; role: string; tenantName: string }
  tooltipsDisabled: boolean
  currentTheme: string
  toggleTooltips: () => void
  toggleTheme: () => void
  clearCurrentUser: () => void
}

let _state: ShellState = {
  notifications: [],
  addNotification: (n) => {
    _state = {
      ..._state,
      notifications: [..._state.notifications, { id: String(Date.now() + Math.random()), ...n }],
    }
    _listeners.forEach(fn => fn())
  },
  removeNotification: (id) => {
    _state = { ..._state, notifications: _state.notifications.filter(n => n.id !== id) }
    _listeners.forEach(fn => fn())
  },
  currentUser: { id: 'user-test', name: 'Teste User', email: 'test@gravity.com', role: 'Admin', tenantName: 'Empresa Teste' },
  tooltipsDisabled: false,
  currentTheme: 'dark',
  toggleTooltips: () => {},
  toggleTheme: () => {},
  clearCurrentUser: () => {},
}

let _listeners: (() => void)[] = []

function subscribe(listener: () => void) {
  _listeners.push(listener)
  return () => { _listeners = _listeners.filter(f => f !== listener) }
}

// ── useShellStore — zustand-compatible hook ───────────────────────────────────

export function useShellStore(): ShellState
export function useShellStore<T>(selector: (s: ShellState) => T): T
export function useShellStore(selector?: (s: ShellState) => unknown) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)
  useEffect(() => subscribe(forceUpdate), [])
  const state = _state
  return selector ? selector(state) : state
}

useShellStore.getState = (): ShellState => _state
useShellStore.setState = (partial: Partial<ShellState> | ((s: ShellState) => Partial<ShellState>)) => {
  const patch = typeof partial === 'function' ? partial(_state) : partial
  _state = { ..._state, ...patch }
  _listeners.forEach(fn => fn())
}

// ── ToastContainer ────────────────────────────────────────────────────────────

export function ToastContainer() {
  const notifications = useShellStore(s => s.notifications)
  if (notifications.length === 0) return null
  return createPortal(
    <div className="shell-toast-container" role="region" aria-live="polite">
      {notifications.map(n => (
        <div key={n.id} className={`shell-toast shell-toast--${n.type}`} role="alert">
          <p className="shell-toast__message">{n.message}</p>
        </div>
      ))}
    </div>,
    document.body,
  )
}

// ── Outros exports ────────────────────────────────────────────────────────────

export function useSyncClerkToShell() {}
