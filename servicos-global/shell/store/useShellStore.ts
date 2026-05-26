import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ShellState, CurrentUser, Notification, Theme, AllowedProduct, AvisoShell, MeStatus, WorkspaceShell, OrganizacaoShell, OrganizacaoOverride } from './types'

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
      organizacoes: [],
      allowedProducts: [],
      productsLoaded: false,
      notifications: [],
      avisos: [],
      linkContextual: null,
      meStatus: 'idle' as MeStatus,
      organizacaoOverride: null as OrganizacaoOverride | null,

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
      
      setTooltipsDisabled: (disabled: boolean) => {
        if (typeof document !== 'undefined') {
          document.body.classList.toggle('tooltips-disabled', disabled)
        }
        set({ tooltipsDisabled: disabled })
      },

      toggleTooltips: () => {
        set((state) => {
          const next = !state.tooltipsDisabled
          if (typeof document !== 'undefined') {
            document.body.classList.toggle('tooltips-disabled', next)
          }
          return { tooltipsDisabled: next }
        })
      },

      // ─── Usuário ──────────────────────────────────────────────────────────
      setCurrentUser: (user: CurrentUser) =>
        set({ currentUser: user }),

      clearCurrentUser: () =>
        set({
          currentUser: DEFAULT_USER,
          workspaces: [],
          idWorkspaceAtivo: null,
          organizacoes: [],
          allowedProducts: [],
          productsLoaded: false,
          meStatus: 'idle',
          // Override de admin NUNCA persiste entre sessões — limpa no logout.
          // Evita que admin saia e o próximo usuário (possivelmente outro tipo)
          // entre vendo dados da org alvo do admin anterior.
          organizacaoOverride: null,
        }),

      setWorkspaces: (workspaces: WorkspaceShell[]) =>
        set({ workspaces }),

      setWorkspaceAtivo: (id: string) =>
        set({ idWorkspaceAtivo: id }),

      setOrganizacoes: (organizacoes: OrganizacaoShell[]) =>
        set({ organizacoes }),

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

      // ─── Override de organização (admin Gravity) ──────────────────────────
      // Action é permissive — caller (`useOrganizacaoOverride`) é responsável
      // por validar que `currentUser.tipoUsuario` é SUPER_ADMIN/ADMIN antes
      // de chamar. Backend (middleware do SDK) é fonte da verdade — se um
      // não-admin de alguma forma chamar isso e o header for enviado, o
      // backend rejeita com 403 OVERRIDE_NAO_AUTORIZADO.
      definirOrganizacaoOverride: (override: OrganizacaoOverride) =>
        set({ organizacaoOverride: override }),

      limparOrganizacaoOverride: () =>
        set({ organizacaoOverride: null }),
    }),
    {
      name: 'gravity-shell-state',
      storage: createJSONStorage(() => localStorage),
      // Persiste apenas tema, sidebar e override de admin — nunca dados sensíveis.
      // O override é considerado seguro persistir porque:
      //   (a) o backend valida o tipo_usuario do JWT a cada request, e
      //   (b) `clearCurrentUser` (logout) zera o override antes do próximo login,
      //   (c) sem JWT válido de admin, o header é silenciosamente ignorado no servidor.
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        currentTheme: state.currentTheme,
        tooltipsDisabled: state.tooltipsDisabled,
        organizacaoOverride: state.organizacaoOverride,
      }),
      // Reaplica a classe no body ao hidratar do localStorage (ex: refresh de página)
      onRehydrateStorage: () => (state) => {
        if (state?.currentTheme === 'light') {
          document.body.classList.add('light-theme')
        } else {
          document.body.classList.remove('light-theme')
        }
        if (typeof document !== 'undefined') {
          document.body.classList.toggle('tooltips-disabled', !!state?.tooltipsDisabled)
        }
      },
    }
  )
)

// Mantém <body> alinhado ao store em qualquer mudança (toggle, rehydrate, setState direto).
if (typeof document !== 'undefined') {
  useShellStore.subscribe((state, prev) => {
    if (state.tooltipsDisabled !== prev.tooltipsDisabled) {
      document.body.classList.toggle('tooltips-disabled', state.tooltipsDisabled)
    }
  })
}

// DEV: expõe o store em window.__shellStore para inspeção manual via DevTools.
// Útil para depurar fluxos assíncronos (ex: aviso do motor de testes chegando
// no sininho). Em produção, Vite elimina este bloco via tree-shaking se o
// bundler considerar o efeito colateral descartável.
if (typeof window !== 'undefined') {
  ;(window as unknown as { __shellStore?: typeof useShellStore }).__shellStore = useShellStore
}
