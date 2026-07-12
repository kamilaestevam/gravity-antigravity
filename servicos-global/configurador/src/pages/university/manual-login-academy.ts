/**
 * Academy Login — aulas geradas a partir do manual (SSOT: manual-login-conteudo.ts).
 */

import { DOC_LOGIN_SECOES } from './manual-login-conteudo'
import { blocosDeSecaoLogin, type BlocoConteudoAcademy, type TipoBlocoAcademy } from './academy-blocos-manual'

export type TipoBloco = TipoBlocoAcademy

export interface BlocoConteudo {
  tipo: TipoBloco
  dados: Record<string, string | number>
}

export interface AulaDemo {
  slug: string
  titulo: string
  duracao: string
  blocos: BlocoConteudo[]
  /** Número da seção correspondente no manual (`#doc-sec-N`). */
  manualSecao?: number
  /** Capítulo do manual Configurador (`/docs/configurador/{capitulo}`). */
  manualCapitulo?: string
}

export const LOGIN_AULA_SLUGS = [
  'a-tela-de-acesso',
  'criar-sua-conta',
  'entrar-email-senha',
  'recuperar-senha',
  'convite-usuario',
  'entrar-com-google',
] as const

/** Durações de leitura (PlayerAula) — regra §10 MANUAL-GRAVITY-ONBOARDING.md / skill manual-gravity-onboarding */
const LOGIN_DURACOES = ['2m', '6m', '4m', '5m', '7m', '2m']

export const LOGIN_FASES_TRILHA = DOC_LOGIN_SECOES.map((secao, i) => ({
  slug: LOGIN_AULA_SLUGS[i],
  nome: secao.titulo,
  duracao: LOGIN_DURACOES[i] ?? '10m',
}))

export const AULAS_LOGIN: AulaDemo[] = DOC_LOGIN_SECOES.map((secao, i) => ({
  slug: LOGIN_AULA_SLUGS[i],
  titulo: secao.titulo,
  duracao: LOGIN_DURACOES[i] ?? '10m',
  blocos: blocosDeSecaoLogin(secao) as BlocoConteudoAcademy[] as BlocoConteudo[],
  manualSecao: secao.num,
}))
