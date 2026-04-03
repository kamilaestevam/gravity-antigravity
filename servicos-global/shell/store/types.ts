// nucleo-global/shell/store/types.ts
// Contrato fechado do ShellState — ninguém adiciona campos de negócio aqui

export type Theme = 'light' | 'dark'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number // ms — padrão 4000
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  tenantId?: string
  tenantName?: string
  role?: string
}

export interface AllowedProduct {
  product_key: string
  is_active: boolean
}

export interface ShellState {
  // --- UI ---
  sidebarOpen: boolean
  currentTheme: Theme
  tooltipsDisabled: boolean

  // --- Usuário ativo ---
  currentUser: CurrentUser

  // --- Produtos habilitados para o tenant ---
  allowedProducts: AllowedProduct[]
  productsLoaded: boolean

  // --- Notificações (toasts) ---
  notifications: Notification[]

  // --- Actions ---
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  toggleTooltips: () => void
  setCurrentUser: (user: CurrentUser) => void
  clearCurrentUser: () => void
  setAllowedProducts: (products: AllowedProduct[]) => void
  isProductAllowed: (productKey: string) => boolean

  /**
   * Única forma de disparar toasts na aplicação.
   * Nunca criar elementos de toast manualmente.
   */
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}
