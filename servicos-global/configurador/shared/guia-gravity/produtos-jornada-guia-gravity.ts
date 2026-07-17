/**
 * Produtos da jornada — plataforma (sempre) + assinaturas ATIVA/EM_TESTE.
 */

/** Academy/onboarding incluído na org sem assinatura de produto. */
export const PRODUTOS_GUIA_PLATAFORMA = [
  'bem-vindo',
  'login',
  'navegacao',
  'admin',
  'configurador',
  'gabi',
  'hub',
  'store',
] as const

export type ProdutoGuiaPlataforma = (typeof PRODUTOS_GUIA_PLATAFORMA)[number]

const STATUS_ASSINATURA_JORNADA = new Set(['ATIVA', 'EM_TESTE'])

export function assinaturaAtivaParaJornada(status: string): boolean {
  return STATUS_ASSINATURA_JORNADA.has(status)
}

/** Une produtos de plataforma + slugs de assinatura (deduplicado, ordem estável). */
export function montarProdutosJornadaContratados(slugsAssinatura: readonly string[]): string[] {
  const vistos = new Set<string>()
  const resultado: string[] = []
  for (const slug of [...PRODUTOS_GUIA_PLATAFORMA, ...slugsAssinatura]) {
    if (vistos.has(slug)) continue
    vistos.add(slug)
    resultado.push(slug)
  }
  return resultado
}

export function produtoCompradoNaOrganizacao(
  slug: string,
  slugsAssinaturaAtiva: ReadonlySet<string>,
): boolean {
  if ((PRODUTOS_GUIA_PLATAFORMA as readonly string[]).includes(slug)) return true
  return slugsAssinaturaAtiva.has(slug)
}
