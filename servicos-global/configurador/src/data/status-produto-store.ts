/**
 * Status de exibição na Gravity Store — fonte única (Admin ProdutoGravity + assinatura da org).
 *
 * Regras:
 * - Catálogo admin (`status_produto_gravity`) prevalece sobre assinatura legada.
 * - EM_BREVE nunca aparece como contratado/disponível.
 * - ATIVO + assinatura ativa → contratado (acessar).
 * - ATIVO sem assinatura → disponível (contratar).
 * - Slug fora do catálogo publicado → fora_catalogo (peça roadmap no puzzle, sem card).
 */

export type StatusExibicaoProdutoStore =
  | 'em_breve'
  | 'contratado'
  | 'disponivel'
  | 'fora_catalogo'

export type CatalogoProdutoStore = {
  slug: string
  status: string
}

export type AssinaturaProdutoStore = {
  is_active: boolean
}

function normalizarStatusAdmin(status: string | undefined): string {
  return (status ?? '').toUpperCase()
}

export function resolverStatusProdutoStore(
  slug: string,
  catalogo: readonly CatalogoProdutoStore[],
  assinaturas: ReadonlyMap<string, AssinaturaProdutoStore>,
): StatusExibicaoProdutoStore {
  const produto = catalogo.find((p) => p.slug === slug)
  if (!produto) return 'fora_catalogo'

  const statusAdmin = normalizarStatusAdmin(produto.status)
  if (statusAdmin === 'EM_BREVE') return 'em_breve'
  if (assinaturas.get(slug)?.is_active) return 'contratado'
  if (statusAdmin === 'ATIVO') return 'disponivel'
  return 'fora_catalogo'
}

/** Compatível com cards/filtros existentes (`owned` | `available` | `soon`). */
export function statusExibicaoParaLegado(
  status: StatusExibicaoProdutoStore,
): 'owned' | 'available' | 'soon' | null {
  switch (status) {
    case 'contratado':
      return 'owned'
    case 'disponivel':
      return 'available'
    case 'em_breve':
      return 'soon'
    default:
      return null
  }
}

export function classePecaPuzzleStore(status: StatusExibicaoProdutoStore): string {
  switch (status) {
    case 'contratado':
      return ' gs-piece--contratado'
    case 'disponivel':
      return ' gs-piece--disponivel'
    case 'em_breve':
      return ' gs-piece--em-breve'
    default:
      return ''
  }
}

export function classeSegmentoPuzzleStore(status: StatusExibicaoProdutoStore): string {
  switch (status) {
    case 'contratado':
      return ' gs-stack__seg--contratado'
    case 'disponivel':
      return ' gs-stack__seg--disponivel'
    case 'em_breve':
      return ' gs-stack__seg--em-breve'
    default:
      return ''
  }
}

export type ContagemStatusCatalogoStore = {
  /** Itens publicados no catálogo (ATIVO + EM_BREVE). */
  publicados: number
  /** ATIVO na org, sem assinatura — prontos para contratar. */
  disponiveis: number
  /** Assinatura ativa na organização. */
  contratados: number
  /** status EM_BREVE no admin. */
  em_breve: number
}

/** Contadores dos cards superiores — mesma regra do puzzle e dos cards. */
export function contarStatusCatalogoStore(
  catalogo: readonly CatalogoProdutoStore[],
  assinaturas: ReadonlyMap<string, AssinaturaProdutoStore>,
): ContagemStatusCatalogoStore {
  let disponiveis = 0
  let contratados = 0
  let em_breve = 0
  for (const item of catalogo) {
    const status = resolverStatusProdutoStore(item.slug, catalogo, assinaturas)
    if (status === 'disponivel') disponiveis++
    else if (status === 'contratado') contratados++
    else if (status === 'em_breve') em_breve++
  }
  return {
    publicados: catalogo.length,
    disponiveis,
    contratados,
    em_breve,
  }
}

/** Chave i18n do rótulo de status (peça do puzzle / tooltip). */
export function chaveLegendaStatusStore(status: StatusExibicaoProdutoStore): string | null {
  switch (status) {
    case 'contratado':
      return 'store.status_contratado'
    case 'disponivel':
      return 'store.status_disponivel'
    case 'em_breve':
      return 'store.status_em_breve'
    case 'fora_catalogo':
      return 'store.status_roadmap'
    default:
      return null
  }
}
