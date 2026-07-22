/**
 * Status do catálogo Admin que permitem abrir o produto no menu lateral / Hub operacional.
 * EM_BREVE aparece na Store (roadmap) mas não abre no shell — paridade status-produto-store.
 */

export function statusCatalogoPermiteAbrirMenu(status: string | null | undefined): boolean {
  return (status ?? '').toUpperCase() === 'ATIVO'
}

/** Filtro Prisma reutilizável nos portões de produtos-acessiveis-service. */
export const filtroProdutoGravityAtivoNoCatalogo = {
  status_produto_gravity: 'ATIVO' as const,
}
