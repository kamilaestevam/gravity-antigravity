import {
  resolverRotaProdutoGravity,
  slugsProdutoEquivalentes,
} from './resolver-rota-produto'

export const SLUG_ATALHO_PROCESSOS = 'processo'
export const ROTA_ATALHO_PROCESSOS = '/acesso-processos/lista'

export type NavegacaoTrocarProduto =
  | { tipo: 'noop' }
  | { tipo: 'redirect'; href: string }

/** Resolve navegação do seletor — noop quando o slug já é o contexto aberto. */
export function resolverNavegacaoTrocarProduto(
  slug: string,
  produtoAtualSlug: string,
): NavegacaoTrocarProduto {
  if (slugsProdutoEquivalentes(slug, produtoAtualSlug)) {
    return { tipo: 'noop' }
  }
  if (slug === SLUG_ATALHO_PROCESSOS) {
    return { tipo: 'redirect', href: ROTA_ATALHO_PROCESSOS }
  }
  return { tipo: 'redirect', href: resolverRotaProdutoGravity(slug) }
}
