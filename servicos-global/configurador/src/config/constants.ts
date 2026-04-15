// src/config/constants.ts
// Constantes compartilhadas do frontend do configurador.
// URLs e valores que variam entre ambientes vêm de variáveis de ambiente Vite.

/**
 * URL base do frontend de workspace.
 * Usada para construir links que abrem um workspace específico.
 * Ex: `${WORKSPACE_BASE_URL}/workspace/acme` → http://localhost:8010/workspace/acme
 */
export const WORKSPACE_BASE_URL: string =
  (import.meta.env.VITE_WORKSPACE_URL as string | undefined) ?? 'http://localhost:8010'

/**
 * Constrói a URL de um workspace específico pelo subdomínio.
 */
export function workspaceUrl(subdominio: string): string {
  return `${WORKSPACE_BASE_URL}/workspace/${subdominio}`
}
