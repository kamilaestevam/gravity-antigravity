import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// Gera ID único para cada notificação
function generateId() {
    return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
const DEFAULT_USER = {
    id: '',
    name: '',
    email: '',
    avatarUrl: undefined,
    tenantId: undefined,
    tenantName: undefined,
};
export const useShellStore = create()(persist((set, _get) => ({
    // ─── Estado inicial ────────────────────────────────────────────────────
    sidebarOpen: true,
    currentTheme: 'dark',
    tooltipsDisabled: false,
    currentUser: DEFAULT_USER,
    notifications: [],
    // ─── Sidebar ──────────────────────────────────────────────────────────
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    // ─── Tema ─────────────────────────────────────────────────────────────
    setTheme: (theme) => {
        document.body.classList.remove('light-theme', 'dark-theme');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        }
        set({ currentTheme: theme });
    },
    toggleTheme: () => {
        set((state) => {
            const next = state.currentTheme === 'dark' ? 'light' : 'dark';
            document.body.classList.remove('light-theme', 'dark-theme');
            if (next === 'light')
                document.body.classList.add('light-theme');
            return { currentTheme: next };
        });
    },
    toggleTooltips: () => {
        set((state) => ({ tooltipsDisabled: !state.tooltipsDisabled }));
    },
    // ─── Usuário ──────────────────────────────────────────────────────────
    setCurrentUser: (user) => set({ currentUser: user }),
    clearCurrentUser: () => set({ currentUser: DEFAULT_USER }),
    // ─── Notificações (toasts) ────────────────────────────────────────────
    /**
     * addNotification — ÚNICA forma de disparar toasts na aplicação.
     * Nunca criar elementos de toast manualmente.
     *
     * @example
     * const { addNotification } = useShellStore()
     * addNotification({ type: 'success', message: 'Salvo com sucesso!' })
     */
    addNotification: (notification) => {
        const id = generateId();
        const duration = notification.duration ?? 4000;
        set((state) => ({
            notifications: [...state.notifications, { ...notification, id, duration }],
        }));
        // Auto-remove após duração
        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            }, duration);
        }
    },
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
    })),
    clearNotifications: () => set({ notifications: [] }),
}), {
    name: 'gravity-shell-state',
    storage: createJSONStorage(() => localStorage),
    // Persiste apenas tema e sidebar — nunca dados sensíveis
    partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        currentTheme: state.currentTheme,
        tooltipsDisabled: state.tooltipsDisabled,
    }),
}));
