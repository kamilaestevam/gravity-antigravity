/**
 * Deep-links Pedido → Configurador (SSOT de destino das colunas Partes).
 *
 * Destinos:
 * - Workspace (CNPJ): /configurador/workspaces
 * - Exportador/Importador (Cadastros): /configurador/empresas-e-parceiros
 */

function urlBaseConfigurador(): string {
  if (import.meta.env.DEV) {
    const origin = import.meta.env.VITE_CONFIGURADOR_URL ?? 'http://localhost:8000'
    return `${origin}/configurador`
  }
  return '/configurador'
}

function urlRetornoListaPedido(pedidoId?: string): string {
  const urlAtual = new URL(window.location.href)
  if (pedidoId) urlAtual.searchParams.set('expandir', pedidoId)
  return encodeURIComponent(urlAtual.toString())
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
