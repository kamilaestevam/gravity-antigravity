/**
 * @gravity/shell — Barrel de exportações
 *
 * Todos os consumidores do shell importam daqui.
 * Nunca importar diretamente dos arquivos internos.
 *
 * @example
 * import { Layout, useShellStore } from '@gravity/shell'
 */

// Componentes de layout
export { Layout }          from './Layout'
export { Sidebar }         from './Sidebar'
export { ProductSidebar }  from './ProductSidebar'
export { Header }          from './Header'
export { Navigation }      from './Navigation'
export { ToastContainer }  from './ToastContainer'

// Store e tipos
export { useShellStore }   from './store'

// Utilitários
export { buildEntityLink } from './entityLinkFactory'
export type { KnownEntity } from './entityLinkFactory'

// Hooks
export { useUserPreferences } from './hooks/useUserPreferences'
export { useMeSync }           from './hooks/useMeSync'
export { useLoadAllowedProducts } from './hooks/useLoadAllowedProducts'
export type {
  ShellState,
  CurrentUser,
  AllowedProduct,
  Notification,
  NotificationType,
  Theme,
  WorkspaceShell,
  OrganizacaoShell,
} from './store'
