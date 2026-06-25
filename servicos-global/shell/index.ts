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
export { buscarOrganizacoesAdmin } from './utils/buscar-organizacoes-admin'
export type { OrganizacaoAdminOpcao, BuscarOrganizacoesAdminOpts } from './utils/buscar-organizacoes-admin'

// Hooks
export { useUserPreferences } from './hooks/useUserPreferences'
export { useShellBodyClasses } from './hooks/useShellBodyClasses'
export { useMeSync }           from './hooks/useMeSync'
export { resolverNomeExibicaoUsuario } from './utils/resolver-nome-exibicao-usuario'
export { useLoadAllowedProducts } from './hooks/useLoadAllowedProducts'
export { useOrganizacaoOverride } from './hooks/useOrganizacaoOverride'
export type { UsoOrganizacaoOverride } from './hooks/useOrganizacaoOverride'
export { useProdutosSwitcher, EVENTO_PRODUTOS_WORKSPACE_ATUALIZADOS, montarListaProdutosSwitcherInicial } from './hooks/useProdutosSwitcher'
export { rotaTemSeletorProdutosProcesso, ROTA_PROCESSO_COM_SWITCHER } from './utils/rota-processo-com-switcher'
export { resolverNavegacaoTrocarProduto, SLUG_ATALHO_PROCESSOS, ROTA_ATALHO_PROCESSOS } from './utils/navegacao-trocar-produto'
export { produtosWorkspaceResponseSchema } from './schemas/produtos-workspace-response.schema'
export {
  ROTA_ENTRADA_SMART_READ,
  resolverRotaProdutoGravity,
  resolverSlugMetaProduto,
  slugsProdutoEquivalentes,
} from './utils/resolver-rota-produto'
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

// Sininho de notificações (SSOT — não importar notificacoes/src direto nas páginas)
export { Notificacoes } from './NotificacoesSininho'
export type { NotificationItem } from './NotificacoesSininho'
