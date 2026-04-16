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

/**
 * Aviso persistente exibido no sininho (Mensageria / AvisoInternoGlobal).
 * Diferente de Notification (toast efêmero), fica visível até ser marcado como lido.
 */
export type AvisoTipo = 'aviso' | 'mencao' | 'sistema' | 'tarefa'

export interface AvisoShell {
  id: string
  conteudo: string
  autor?: { nome: string; avatarUrl?: string }
  dataHora: string
  lido: boolean
  tipo: AvisoTipo
  /** Link opcional — item vira clicável e navega para a rota. */
  href?: string
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

  // --- Avisos persistentes (sininho / mensageria) ---
  avisos: AvisoShell[]

  /**
   * Link contextual para o "Enviar Para" do sininho.
   * Cada tela pode chamar setLinkContextual() com a rota do item selecionado
   * (ex: /workspace/pedido/PED-2024-001). Quando presente, sobrescreve o
   * pathname genérico no campo de link do painel "Enviar Para".
   * Chamar com null para limpar (ex: ao desselecionar).
   */
  linkContextual: string | null

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

  /**
   * Empurra um aviso persistente para o sininho. Retorna o id gerado.
   * Use para eventos assíncronos (ex: job concluído) onde um toast efêmero não basta.
   */
  addAviso: (aviso: Omit<AvisoShell, 'id' | 'lido' | 'dataHora'> & { dataHora?: string }) => string
  marcarAvisoLido: (id: string) => void
  marcarTodosAvisosLidos: () => void
  setLinkContextual: (link: string | null) => void
}
