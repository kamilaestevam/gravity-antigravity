/**
 * SSOT — menu lateral dos produtos → Configurador (Criar / Gerenciar workspace).
 *
 * Rotas canônicas:
 * - Gerenciar: /configurador/workspaces
 * - Criar:     /configurador/workspaces?criar=1
 *
 * Produto em Vite standalone (porta própria) redireciona para o shell em :8000.
 */

const ORIGEM_SHELL_DEV = 'http://localhost:8000'

function urlBaseConfigurador(portaDevStandalone?: string): string {
  if (
    portaDevStandalone
    && import.meta.env.DEV
    && typeof window !== 'undefined'
    && window.location.port === portaDevStandalone
  ) {
    return `${ORIGEM_SHELL_DEV}/configurador`
  }
  return '/configurador'
}

/** Listagem de workspaces (menu lateral → Gerenciar workspace). */
export function urlGerenciarWorkspaces(portaDevStandalone?: string): string {
  return `${urlBaseConfigurador(portaDevStandalone)}/workspaces`
}

/** Modal criar workspace (menu lateral → Criar workspace). */
export function urlCriarWorkspace(portaDevStandalone?: string): string {
  return `${urlBaseConfigurador(portaDevStandalone)}/workspaces?criar=1`
}
