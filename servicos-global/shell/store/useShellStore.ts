import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ShellState, CurrentUser, Notification, Theme, AllowedProduct, AvisoShell, MeStatus, WorkspaceShell } from './types'

// Gera ID único para cada notificação
function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function generateAvisoId(): string {
  return `aviso-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const DEFAULT_USER: CurrentUser = {
  id: '',
  name: '',
  email: '',
  avatarUrl: undefined,
  idOrganizacao: undefined,
  nomeOrganizacao: undefined,
  idWorkspacePreferido: undefined,
  nomeWorkspacePreferido: undefined,
}

export const useShellStore = create<ShellState>()(
  persist(
    (set, get) => ({
      // ─── Estado inicial ────────────────────────────────────────────────────
      sidebarOpen: true,
      currentTheme: 'dark' as Theme,
      tooltipsDisabled: false,
      currentUser: DEFAULT_USER,
      workspaces: [],
      idWorkspaceAtivo: null,
      allowedProducts: [],
      productsLoaded: false,
      notifications: [],
      avisos: [],
      linkContextual: null,
      meStatus: 'idle' as MeStatus,

      // ─── Sidebar ──────────────────────────────────────────────────────────
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) =>
        set({ sidebarOpen: open }),

      // ─── Tema ─────────────────────────────────────────────────────────────
      setTheme: (theme: Theme) => {
        document.body.classList.remove('light-theme', 'dark-theme')
        if (theme === 'light') {
          document.body.classList.add('light-theme')
        }
        set({ currentTheme: theme })
      },

      toggleTheme: () => {
        set((state) => {
          const next: Theme = state.currentTheme === 'dark' ? 'light' : 'dark'
          document.body.classList.remove('light-theme', 'dark-theme')
          if (next === 'light') document.body.classList.add('light-theme')
          return { currentTheme: next }
        })
      },
      
      toggleTooltips: () => {
        set((state) => ({ tooltipsDisabled: !state.tooltipsDisabled }))
      },

      // ─── Usuário ──────────────────────────────────────────────────────────
      setCurrentUser: (user: CurrentUser) =>
        set({ currentUser: user }),

      clearCurrentUser: () =>
        set({ currentUser: DEFAULT_USER, workspaces: [], idWorkspaceAtivo: null, allowedProducts: [], productsLoaded: false, meStatus: 'idle' }),

      setWorkspaces: (workspaces: WorkspaceShell[]) =>
        set({ workspaces }),

      setWorkspaceAtivo: (id: string) =>
        set({ idWorkspaceAtivo: id }),

      // ─── Produtos permitidos ──────────────────────────────────────────────
      setAllowedProducts: (products: AllowedProduct[]) =>
        set({ allowedProducts: products, productsLoaded: true }),

      isProductAllowed: (productKey: string) => {
        const state = get()
        // Se ainda não carregou, permite tudo (evita flash)
        if (!state.productsLoaded) return true
        // Se não há produtos configurados, permite tudo (tenant sem restrições)
        if (state.allowedProducts.length === 0) return true
        return state.allowedProducts.some(
          (p) => p.product_key === productKey && p.is_active
        )
      },

      // ─── Notificações (toasts) ────────────────────────────────────────────
      /**
       * addNotification — ÚNICA forma de disparar toasts na aplicação.
       * Nunca criar elementos de toast manualmente.
       *
       * @example
       * const { addNotification } = useShellStore()
       * addNotification({ type: 'success', message: 'Salvo com sucesso!' })
       */
      addNotification: (notification: Omit<Notification, 'id'>) => {
        const id = generateId()
        const duration = notification.duration ?? 4000

        set((state) => ({
          notifications: [...state.notifications, { ...notification, id, duration }],
        }))

        // Auto-remove após duração
        if (duration > 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }))
          }, duration)
        }
      },

      removeNotification: (id: string) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () =>
        set({ notifications: [] }),

      // ─── Avisos persistentes (sininho) ────────────────────────────────────
      addAviso: (aviso) => {
        const id = generateAvisoId()
        const novo: AvisoShell = {
          id,
          conteudo: aviso.conteudo,
          autor: aviso.autor,
          dataHora: aviso.dataHora ?? new Date().toLocaleString('pt-BR'),
          lido: false,
          tipo: aviso.tipo,
          href: aviso.href,
        }
        set((state) => ({ avisos: [novo, ...state.avisos] }))
        return id
      },

      marcarAvisoLido: (id: string) =>
        set((state) => ({
          avisos: state.avisos.map((a) => (a.id === id ? { ...a, lido: true } : a)),
        })),

      marcarTodosAvisosLidos: () =>
        set((state) => ({
          avisos: state.avisos.map((a) => ({ ...a, lido: true })),
        })),

      setLinkContextual: (link: string | null) =>
        set({ linkContextual: link }),

      setMeStatus: (status: MeStatus) =>
        set({ meStatus: status }),
    }),
    {
      name: 'gravity-shell-state',
      storage: createJSONStorage(() => localStorage),
      // Persiste apenas tema e sidebar — nunca dados sensíveis
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        currentTheme: state.currentTheme,
        tooltipsDisabled: state.tooltipsDisabled,
      }),
      // Reaplica a classe no body ao hidratar do localStorage (ex: refresh de página)
      onRehydrateStorage: () => (state) => {
        if (state?.currentTheme === 'light') {
          document.body.classList.add('light-theme')
        } else {
          document.body.classList.remove('light-theme')
        }
        if (state?.tooltipsDisabled) {
          document.body.classList.add('tooltips-disabled')
        }
      },
    }
  )
)

// DEV: expõe o store em window.__shellStore para inspeção manual via DevTools.
// Útil para depurar fluxos assíncronos (ex: aviso do motor de testes chegando
// no sininho). Em produção, Vite elimina este bloco via tree-shaking se o
// bundler considerar o efeito colateral descartável.
if (typeof window !== 'undefined') {
  ;(window as unknown as { __shellStore?: typeof useShellStore }).__shellStore = useShellStore
}
