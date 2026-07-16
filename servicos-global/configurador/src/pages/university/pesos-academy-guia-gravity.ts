/**
 * Guia Gravity — pesos oficiais de XP por módulo/aula (PO).
 * 1 peso = 10 XP exibidos na jornada e no dashboard.
 *
 * Módulos com peso único: divide-se igualmente entre todas as aulas do produto.
 * Pedido e Smart Docs: peso por aula (sobrescreve divisão do módulo).
 */

export const PESO_GUAI_XP_MULTIPLICADOR = 10

/** Slugs de produto com peso definido ao nível do módulo inteiro. */
export type ProdutoPesoSlug =
  | 'bem-vindo'
  | 'login'
  | 'navegacao'
  | 'admin'
  | 'configurador'
  | 'gabi'
  | 'hub'
  | 'store'
  | 'pedido'
  | 'smart-read'
  | 'processo'
  | 'bid-frete'
  | 'bid-cambio'

/**
 * Peso total do produto — rateado entre todas as aulas (todas as trilhas/capítulos),
 * exceto quando a aula tem entrada em `PESO_AULA_GUAI`.
 */
export const PESO_MODULO_GUAI: Partial<Record<ProdutoPesoSlug, number>> = {
  'bem-vindo': 0.5,
  login: 1,
  navegacao: 1,
  admin: 1,
  configurador: 2.5,
  gabi: 2,
  hub: 1.5,
  store: 1,
  /** WIP PO — placeholder até definição oficial. */
  processo: 1,
}

/** Peso por slug de aula — prevalece sobre `PESO_MODULO_GUAI`. */
export const PESO_AULA_GUAI: Readonly<Record<string, number>> = {
  // Pedido
  'pedido-gravity': 1.5,
  'pedido-visao-insights': 1,
  'pedido-visao-lista': 3,
  'pedido-visao-dashboard': 1,
  'pedido-visao-kanban': 1,
  'pedido-configuracoes': 1,
  'pedido-historico': 1,

  // Smart Docs — «Entendendo» (peso 2) repartido nas 3 aulas introdutórias
  'smart-read-visao-geral': 2 / 3,
  'smart-read-acesso': 2 / 3,
  'smart-read-tipos-visualizacao': 2 / 3,
  'smart-read-visao-insight': 1,
  'smart-read-visao-lista': 1,
  'smart-read-nova-leitura': 3,
  'smart-read-configuracoes': 1,
  'smart-read-historico': 1,
}

export function pesoParaXp(peso: number): number {
  return Math.round(peso * PESO_GUAI_XP_MULTIPLICADOR * 100) / 100
}

interface FaseComSlug {
  slug?: string
}

/** Mapa slug → XP máximo por aula, considerando pesos PO e rateio de módulo. */
export function montarMapaXpAulas(
  produtoSlug: string,
  fases: FaseComSlug[],
): Map<string, number> {
  const mapa = new Map<string, number>()
  const pesoModulo = PESO_MODULO_GUAI[produtoSlug as ProdutoPesoSlug]

  const fasesComSlug = fases.filter((f): f is FaseComSlug & { slug: string } => Boolean(f.slug))
  const somaExplicita = fasesComSlug.reduce(
    (soma, f) => soma + (PESO_AULA_GUAI[f.slug] ?? 0),
    0,
  )
  const fasesSemPesoExplicito = fasesComSlug.filter(f => PESO_AULA_GUAI[f.slug] === undefined)

  const todasExplicitas =
    produtoSlug === 'pedido' ||
    produtoSlug === 'smart-read' ||
    (fasesComSlug.length > 0 && fasesSemPesoExplicito.length === 0)

  if (todasExplicitas) {
    for (const fase of fasesComSlug) {
      const peso = PESO_AULA_GUAI[fase.slug]
      if (peso !== undefined) mapa.set(fase.slug, pesoParaXp(peso))
    }
    return mapa
  }

  if (pesoModulo !== undefined && fasesSemPesoExplicito.length > 0) {
    const pesoRestante = Math.max(0, pesoModulo - somaExplicita)
    const pesoPorAula = pesoRestante / fasesSemPesoExplicito.length
    for (const fase of fasesComSlug) {
      const peso = PESO_AULA_GUAI[fase.slug] ?? pesoPorAula
      mapa.set(fase.slug, pesoParaXp(peso))
    }
    return mapa
  }

  /** Fallback demo: peso 1 no módulo, rateado entre aulas. */
  const pesoFallback = 1
  const pesoPorAula = fasesComSlug.length > 0 ? pesoFallback / fasesComSlug.length : 0
  for (const fase of fasesComSlug) {
    mapa.set(fase.slug, pesoParaXp(pesoPorAula))
  }
  return mapa
}

export function obterXpMaxFase(
  produtoSlug: string,
  fase: FaseComSlug,
  mapaXp?: Map<string, number>,
): number {
  if (!fase.slug) return 0
  const mapa = mapaXp ?? montarMapaXpAulas(produtoSlug, [fase])
  return mapa.get(fase.slug) ?? 0
}

export function obterXpMaxTrilha(
  trilhaFases: FaseComSlug[],
  mapaXp: Map<string, number>,
): number {
  return trilhaFases.reduce(
    (soma, fase) => soma + (fase.slug ? (mapaXp.get(fase.slug) ?? 0) : 0),
    0,
  )
}

export function obterXpMaxProduto(mapaXp: Map<string, number>): number {
  let soma = 0
  for (const xp of mapaXp.values()) soma += xp
  return soma
}
