/**
 * Escopo de workspaces por produto no HUB — SSOT client-side (pré-entrada no módulo).
 * Default: todos os workspaces da organização.
 * Pedido também sincroniza com a API do produto (preferencia-usuario-coluna-pedido).
 */

import { z } from 'zod'

const escopoPersistidoSchema = z.array(z.string().min(1))

export function chaveEscopoHubProduto(idOrganizacao: string, productKey: string): string {
  return `hub:escopo_workspaces:${idOrganizacao}:${productKey}`
}

/** Default do HUB: todos os workspaces disponíveis. */
export function escopoPadraoTodosWorkspaces(idsDisponiveis: readonly string[]): string[] {
  return [...idsDisponiveis]
}

export function lerEscopoHubProdutoLocal(
  idOrganizacao: string,
  productKey: string,
): string[] | null {
  try {
    const raw = localStorage.getItem(chaveEscopoHubProduto(idOrganizacao, productKey))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    const result = escopoPersistidoSchema.safeParse(parsed)
    return result.success && result.data.length > 0 ? result.data : null
  } catch {
    return null
  }
}

export function gravarEscopoHubProdutoLocal(
  idOrganizacao: string,
  productKey: string,
  ids: string[],
): void {
  try {
    const chave = chaveEscopoHubProduto(idOrganizacao, productKey)
    if (ids.length === 0) {
      localStorage.removeItem(chave)
      return
    }
    localStorage.setItem(chave, JSON.stringify(ids))
  } catch {
    /* quota / private mode */
  }
}

export function filtrarIdsEscopoHubValidos(
  ids: readonly string[],
  idsDisponiveis: readonly string[],
): string[] {
  const disponiveis = new Set(idsDisponiveis)
  return ids.filter(id => disponiveis.has(id))
}

export function resolverEscopoHubProduto(
  idsPreferencia: readonly string[] | null | undefined,
  idsDisponiveis: readonly string[],
): string[] {
  const filtrados = idsPreferencia
    ? filtrarIdsEscopoHubValidos(idsPreferencia, idsDisponiveis)
    : []
  if (filtrados.length > 0) return filtrados
  return escopoPadraoTodosWorkspaces(idsDisponiveis)
}
