/**
 * Deep-links Pedido → Configurador (SSOT de destino das colunas Partes).
 *
 * Destinos:
 * - Workspace (CNPJ): /configurador/workspaces
 * - Exportador/Importador (Cadastros): /configurador/empresas-e-parceiros
 *
 * Navegação SPA usa caminho relativo `/configurador` (shell :8000 ou produção).
 * VITE_CONFIGURADOR_URL aponta para a API (:8005) — não usar aqui.
 * Pedido standalone (Vite :5179) precisa URL absoluta para o shell em :8000.
 */

const ORIGEM_SHELL_DEV = 'http://localhost:8000'

function pedidoStandaloneDev(): boolean {
  return import.meta.env.DEV
    && typeof window !== 'undefined'
    && window.location.port === '5179'
}

function urlBaseConfigurador(): string {
  if (pedidoStandaloneDev()) {
    return `${ORIGEM_SHELL_DEV}/configurador`
  }
  return '/configurador'
}

function urlRetornoListaPedido(pedidoId?: string): string {
  const urlAtual = new URL(window.location.href)
  if (pedidoId) urlAtual.searchParams.set('expandir', pedidoId)
  return encodeURIComponent(urlAtual.toString())
}

/** Listagem de workspaces no Configurador (menu lateral → Gerenciar workspace). */
export function urlGerenciarWorkspaces(): string {
  return `${urlBaseConfigurador()}/workspaces`
}

/** Criar workspace no Configurador (menu lateral → Criar workspace). */
export function urlCriarWorkspace(): string {
  return `${urlBaseConfigurador()}/workspaces?criar=1`
}

/** Editar CNPJ do workspace (importador em importação / exportador em exportação). */
export function urlEditarCnpjWorkspace(idWorkspace: string, pedidoId?: string): string {
  const retorno = urlRetornoListaPedido(pedidoId)
  return `${urlBaseConfigurador()}/workspaces?id=${idWorkspace}&foco=cnpj&retorno=${retorno}`
}

/** Vincular ou editar exportador (contraparte em operação de importação). */
export function urlVincularExportador(idExportador: string | null, pedidoId?: string): string {
  const retorno = urlRetornoListaPedido(pedidoId)
  const base = `${urlBaseConfigurador()}/empresas-e-parceiros`
  if (idExportador) {
    return `${base}?id=${idExportador}&tipo=exportador-quando-importacao&retorno=${retorno}`
  }
  return `${base}?criar=exportador-quando-importacao&retorno=${retorno}`
}

/** Vincular ou editar importador (contraparte em operação de exportação). */
export function urlVincularImportador(idImportador: string | null, pedidoId?: string): string {
  const retorno = urlRetornoListaPedido(pedidoId)
  const base = `${urlBaseConfigurador()}/empresas-e-parceiros`
  if (idImportador) {
    return `${base}?id=${idImportador}&tipo=importador-quando-exportacao&retorno=${retorno}`
  }
  return `${base}?criar=importador-quando-exportacao&retorno=${retorno}`
}
