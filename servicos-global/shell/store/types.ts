// nucleo-global/shell/store/types.ts
// Contrato fechado do ShellState — ninguém adiciona campos de negócio aqui

export type Theme = 'light' | 'dark'

export type MeStatus = 'idle' | 'loading' | 'success' | 'error'

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

export interface WorkspaceShell {
  id: string
  nome_workspace: string
  status: string
  tipo_usuario: string
  produtos: string[]
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  idOrganizacao?: string
  nomeOrganizacao?: string
  idWorkspacePreferido?: string
  nomeWorkspacePreferido?: string
  /**
   * Label traduzido do tipo_usuario (ex: "Super Admin", "Master") — usado para exibição.
   * Para checagens de autorização use `tipoUsuario` (raw), nunca este.
   */
  role?: string
  /**
   * Valor RAW do enum `tipo_usuario` (SUPER_ADMIN / ADMIN / MASTER / PADRAO / FORNECEDOR).
   * Usado por hooks de autorização frontend (ex: `useOrganizacaoOverride`)
   * — Mandamento 08 (autorização não pode depender de label traduzido).
   */
  tipoUsuario?: string
}

/**
 * Override de organização ativado pelo admin Gravity.
 * Persistido em localStorage (sobrevive refresh) — limpo no logout.
 * Quando presente, todo `fetch` injeta header `x-organizacao-override`.
 *
 * Apenas SUPER_ADMIN/ADMIN podem ativar (defesa no cliente + servidor).
 * Backend valida em `packages/resolver-organizacao/src/middleware.ts`.
 */
export interface OrganizacaoOverride {
  idOrganizacao: string
  nomeOrganizacao: string
}

export interface OrganizacaoShell {
  id_organizacao: string
  nome_organizacao: string
  subdominio_organizacao: string
  status_organizacao: string
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

  // --- Workspaces da organização ---
  workspaces: WorkspaceShell[]
  idWorkspaceAtivo: string | null

  // --- Organizações disponíveis (SUPER_ADMIN/ADMIN) ---
  organizacoes: OrganizacaoShell[]

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
   * (ex: /configurador/pedido/PED-2024-001). Quando presente, sobrescreve o
   * pathname genérico no campo de link do painel "Enviar Para".
   * Chamar com null para limpar (ex: ao desselecionar).
   */
  linkContextual: string | null

  // --- Status do carregamento de identidade (GET /api/v1/me) ---
  meStatus: MeStatus

  // --- Override de organização (admin Gravity) ---
  /**
   * Quando SUPER_ADMIN/ADMIN gira a chave "Trocar Organização", este campo
   * guarda a org alvo. Toda request HTTP injeta header
   * `x-organizacao-override` enquanto não-nulo. Persistido em localStorage
   * (key `gravity-shell-state`). Limpo no logout.
   *
   * Apenas SUPER_ADMIN/ADMIN podem ativar — defesa cliente em
   * `useOrganizacaoOverride`, defesa servidor no middleware do SDK.
   */
  organizacaoOverride: OrganizacaoOverride | null

  // --- Actions ---
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  toggleTooltips: () => void
  setCurrentUser: (user: CurrentUser) => void
  clearCurrentUser: () => void
  setWorkspaces: (workspaces: WorkspaceShell[]) => void
  setWorkspaceAtivo: (id: string) => void
  setOrganizacoes: (organizacoes: OrganizacaoShell[]) => void
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
  setMeStatus: (status: MeStatus) => void

  /**
   * Ativa override de organização (admin Gravity).
   * Action permissive — caller (`useOrganizacaoOverride`) é quem valida que
   * `currentUser.tipoUsuario` é SUPER_ADMIN/ADMIN antes de chamar.
   */
  definirOrganizacaoOverride: (override: OrganizacaoOverride) => void
  /** Remove override — admin volta a operar na própria org. */
  limparOrganizacaoOverride: () => void
}
