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
export { Layout } from './Layout';
export { Sidebar } from './Sidebar';
export { Header } from './Header';
export { Navigation } from './Navigation';
export { ToastContainer } from './ToastContainer';
// Store e tipos
export { useShellStore } from './store';
// Hooks
export { useUserPreferences } from './hooks/useUserPreferences';
