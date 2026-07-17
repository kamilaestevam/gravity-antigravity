/**
 * Conclusão de aulas Academy — normalização de slugs legados (front + back).
 * SSOT para desbloqueio linear, certificados e ritmo.
 */

/** Slugs renomeados/unificados — valores: slugs antigos que contam como o slug atual. */
export const SLUGS_LEGADOS_AULA_CONCLUIDA_GUIA: Partial<Record<string, readonly string[]>> = {
  'acessar-workspaces': [
    'gerenciando-workspaces',
    'configurando-workspaces',
    'criar-workspace',
    'editar-workspace',
    'ativar-workspace',
    'excluir-workspace',
  ],
  'administrando-usuarios': ['convidando-usuarios', 'gerenciando-usuarios', 'organize-usuarios-na-plataforma'],
  'gerenciando-assinaturas': ['assinaturas-e-financeiro', 'gerenciando-assinaturas'],
  'financeiro-da-conta': ['assinaturas-e-financeiro', 'financeiro-da-conta'],
  'menu-lateral': [
    'menu-lateral-produtos',
    'troca-produtos-gravity',
    'troca-workspaces',
    'menu-lateral-configuracao',
  ],
  'menus-plataforma': [
    'navegacao-plataforma',
    'menu-superior',
    'menu-lateral',
  ],
  'bid-frete-entendendo': ['bid-frete-visao-geral'],
  'bid-frete-tipos-cotacao': ['bid-frete-acesso'],
}

/** Unificação de várias aulas — exige todos os slugs legados, não apenas um. */
export const SLUGS_LEGADOS_EXIGEM_TODAS_GUIA: ReadonlySet<string> = new Set(['menu-lateral', 'menus-plataforma'])

function legadoContaComoConclusao(
  slugAtual: string,
  legados: readonly string[],
  concluidas: ReadonlySet<string>,
): boolean {
  if (SLUGS_LEGADOS_EXIGEM_TODAS_GUIA.has(slugAtual)) {
    return legados.every(slug => concluidas.has(slug))
  }
  return legados.some(slug => concluidas.has(slug))
}

/** Promove slugs legados → atuais para desbloqueio linear e certificados. */
export function normalizarSlugsConclusaoAcademyGuia(slugs: Iterable<string>): Set<string> {
  const s = new Set(slugs)
  for (const [atual, legados] of Object.entries(SLUGS_LEGADOS_AULA_CONCLUIDA_GUIA)) {
    if (s.has(atual)) continue
    if (!legados?.length) continue
    if (legadoContaComoConclusao(atual, legados, s)) s.add(atual)
  }
  return s
}

/** Slug de aula concluída (inclui equivalências legadas). */
export function aulaGuiaEstaConcluida(slugAula: string, concluidas: ReadonlySet<string>): boolean {
  if (concluidas.has(slugAula)) return true
  const legados = SLUGS_LEGADOS_AULA_CONCLUIDA_GUIA[slugAula]
  if (!legados?.length) return false
  return legadoContaComoConclusao(slugAula, legados, concluidas)
}
