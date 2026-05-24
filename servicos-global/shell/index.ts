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
export { BannerOrganizacaoOverride } from './BannerOrganizacaoOverride'
export { ModalTrocarOrganizacao } from './components/ModalTrocarOrganizacao'
export type { ModalTrocarOrganizacaoProps } from './components/ModalTrocarOrganizacao'
export { TelaProdutoComOrganizacaoOverride } from './TelaProdutoComOrganizacaoOverride'
export type { TelaProdutoComOrganizacaoOverrideProps } from './TelaProdutoComOrganizacaoOverride'

// Store e tipos
export { useShellStore }   from './store'

// Utilitários
export { buildEntityLink } from './entityLinkFactory'
export type { KnownEntity } from './entityLinkFactory'
export { injetarHeaderOverride } from './utils/inject-override-header'

// Hooks
export { useUserPreferences } from './hooks/useUserPreferences'
export { useMeSync }           from './hooks/useMeSync'
export { useLoadAllowedProducts } from './hooks/useLoadAllowedProducts'
export { useOrganizacaoOverride } from './hooks/useOrganizacaoOverride'
export type { UsoOrganizacaoOverride } from './hooks/useOrganizacaoOverride'
export type {
  ShellState,
  CurrentUser,
  AllowedProduct,
  Notification,
  NotificationType,
  Theme,
  WorkspaceShell,
  OrganizacaoShell,
  OrganizacaoOverride,
} from './store'
