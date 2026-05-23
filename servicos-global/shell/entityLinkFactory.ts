/**
 * entityLinkFactory — constrói a URL de navegação a partir da entidade e ID.
 *
 * REGRA: nunca salvar URLs no banco. Salvar target_entity + target_id.
 * Esta factory é a única fonte de verdade para as rotas de deep link.
 */

const ENTITY_ROUTES: Record<string, (id: string) => string> = {
  PEDIDO:       (id) => `/pedido/pedidos/${id}/editar`,
  ITEM:         (id) => `/pedido/pedidos/${id}/editar`,
  SIMULACUSTO:  (id) => `/simula-custo/resultado/${id}`,
  PROCESSO:     (id) => `/processo/${id}`,
  FINANCEIRO:   (id) => `/configurador/financeiro/${id}`,
  NF_IMPORTACAO:(id) => `/nf-importacao/${id}`,
}

export function buildEntityLink(entity: string, id: string): string {
  const builder = ENTITY_ROUTES[entity.toUpperCase()]
  if (!builder) {
    console.warn(`[entityLinkFactory] Entidade desconhecida: "${entity}" — redirecionando para /`)
    return '/'
  }
  return builder(id)
}

export type KnownEntity = keyof typeof ENTITY_ROUTES
