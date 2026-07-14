/**
 * Conteúdo de demonstração das aulas (WIP).
 * Produção: virá do banco de dados via API (tabela `aula` + `bloco_conteudo`).
 */

import { AULAS_LOGIN } from './manual-login-academy'
import { AULAS_BEM_VINDO } from './manual-bem-vindo-academy'
import { CONFIGURADOR_TRILHAS, AULAS_CONFIGURADOR } from './manual-configurador-academy'
import { AULAS_GABI } from './manual-gabi-academy'

export type { AulaDemo } from './manual-login-academy'

export type TipoBloco =
  | 'heading'
  | 'texto'
  | 'imagem'
  | 'video'
  | 'citacao'
  | 'destaque'
  | 'definicao'
  | 'dois_colunas'
  | 'timeline'
  | 'destaque_escuro'
  | 'infografico'
  | 'origem_dados'

export interface BlocoConteudo {
  tipo: TipoBloco
  dados: Record<string, string | number>
}

export const CONTEUDO_DEMO: Record<string, import('./manual-login-academy').AulaDemo[]> = {
  'bem-vindo': AULAS_BEM_VINDO,
  login: AULAS_LOGIN,
  configurador: AULAS_CONFIGURADOR,
  gabi: AULAS_GABI,
}

export function getAulaDemo(produto: string, faseSlug: string) {
  return CONTEUDO_DEMO[produto]?.find(a => a.slug === faseSlug) ?? null
}

export function getAulasDemo(produto: string) {
  return CONTEUDO_DEMO[produto] ?? []
}

/** Aulas do capítulo atual (Configurador fatiado); demais produtos retornam a trilha inteira. */
export function getAulasCapituloDemo(produto: string, faseSlug: string) {
  const todas = getAulasDemo(produto)
  if (produto !== 'configurador') return todas
  const capitulo = CONFIGURADOR_TRILHAS.find(tr => tr.fases.some(f => f.slug === faseSlug))
  if (!capitulo) return todas
  const slugsCapitulo = new Set(capitulo.fases.map(f => f.slug).filter(Boolean) as string[])
  return todas.filter(a => slugsCapitulo.has(a.slug))
}
