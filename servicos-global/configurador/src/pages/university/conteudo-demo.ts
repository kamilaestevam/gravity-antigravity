/**
 * Conteúdo de demonstração das aulas (WIP).
 * Produção: virá do banco de dados via API (tabela `aula` + `bloco_conteudo`).
 */

import { AULAS_LOGIN } from './manual-login-academy'

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

export interface BlocoConteudo {
  tipo: TipoBloco
  dados: Record<string, string | number>
}

export const CONTEUDO_DEMO: Record<string, import('./manual-login-academy').AulaDemo[]> = {
  login: AULAS_LOGIN,
}

export function getAulaDemo(produto: string, faseSlug: string) {
  return CONTEUDO_DEMO[produto]?.find(a => a.slug === faseSlug) ?? null
}

export function getAulasDemo(produto: string) {
  return CONTEUDO_DEMO[produto] ?? []
}
