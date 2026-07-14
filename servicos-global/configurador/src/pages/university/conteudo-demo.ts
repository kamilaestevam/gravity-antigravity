/**
 * Conteúdo de demonstração das aulas (WIP).
 * Produção: virá do banco de dados via API (tabela `aula` + `bloco_conteudo`).
 */

import { AULAS_LOGIN } from './manual-login-academy'
import { AULAS_BEM_VINDO } from './manual-bem-vindo-academy'
import { CONFIGURADOR_TRILHAS, AULAS_CONFIGURADOR } from './manual-configurador-academy'
import { AULAS_GABI } from './manual-gabi-academy'
import { AULAS_HUB } from './manual-hub-academy'
import { AULAS_STORE } from './manual-store-academy'
import { AULAS_NAVEGACAO } from './manual-navegacao-academy'
import { AULAS_BID_FRETE } from './manual-bid-frete-academy'
import { AULAS_PEDIDO } from './manual-pedido-academy'

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
  | 'lista_legenda'
  | 'requisitos_cadastro'
  | 'passo_visual'
  | 'catalogo_historico'
  | 'gabi_conversas'
  | 'topicos_imagem_lateral'
  | 'cenarios_grade'
  | 'fluxo_manual'
  | 'galeria_comparacao'

export interface BlocoConteudo {
  tipo: TipoBloco
  dados: Record<string, string | number>
}

export const CONTEUDO_DEMO: Record<string, import('./manual-login-academy').AulaDemo[]> = {
  'bem-vindo': AULAS_BEM_VINDO,
  login: AULAS_LOGIN,
  configurador: AULAS_CONFIGURADOR,
  gabi: AULAS_GABI,
  hub: AULAS_HUB,
  store: AULAS_STORE,
  navegacao: AULAS_NAVEGACAO,
  'bid-frete': AULAS_BID_FRETE,
  pedido: AULAS_PEDIDO,
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
