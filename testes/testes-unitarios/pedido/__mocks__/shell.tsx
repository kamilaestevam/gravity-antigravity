/**
 * Mock de @gravity/shell — mini-store sem zustand
 */
import { useCallback } from 'react'

const defaultUser = { id: 'user-test', name: 'Teste User', email: 'test@gravity.com', role: 'Admin', tenantName: 'Empresa Teste' }

export function useShellStore() {
  return {
    currentUser: defaultUser,
    tooltipsDisabled: false,
    currentTheme: 'dark',
    toggleTooltips: () => {},
    toggleTheme: () => {},
    clearCurrentUser: () => {},
  }
}

export function useSyncClerkToShell() {}
