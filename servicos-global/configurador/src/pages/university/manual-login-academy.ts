/**
 * Guia Gravity Login — aulas geradas a partir do manual (SSOT: manual-login-conteudo.ts).
 * Convite de usuários vive no Configurador › Administrando / Convidar usuários.
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
  /** Academy — oculta o rótulo da aula no painel lateral (módulo sem camada própria no sumário). */
  ocultarCabecalhoNavSumario?: boolean
}

/** Slugs das aulas do Guia Login (Academy). Manual docs mantém seções 1:1. */
export const LOGIN_AULA_SLUGS = [
  'meu-primeiro-acesso',
  'entrar-email-senha',
  'recuperar-senha',
] as const

/** Durações de leitura (PlayerAula) — regra §10 MANUAL-GRAVITY-ONBOARDING.md / skill manual-gravity-onboarding */
const LOGIN_DURACOES = ['3m', '3m', '2m'] as const

const SECAO_TELA_ACESSO = DOC_LOGIN_SECOES[0]
const SECAO_CRIAR_CONTA = DOC_LOGIN_SECOES[1]
const SECAO_ENTRAR_EMAIL = DOC_LOGIN_SECOES[2]
const SECAO_RECUPERAR = DOC_LOGIN_SECOES[3]
const SECAO_GOOGLE = DOC_LOGIN_SECOES[5]

const TITULO_ENTRAR = 'Já tenho usuário e senha, como entrar?'
const TITULO_ESQUECI_SENHA = 'Esqueci minha senha'

function aulaDeSecao(
  slug: (typeof LOGIN_AULA_SLUGS)[number],
  secao: (typeof DOC_LOGIN_SECOES)[number],
  duracao: string,
  tituloOverride?: string,
): AulaDemo {
  const titulo = tituloOverride ?? secao.titulo
  const blocos = blocosDeSecaoLogin(secao) as BlocoConteudoAcademy[] as BlocoConteudo[]
  if (blocos[0]?.tipo === 'heading') {
    blocos[0] = { tipo: 'heading', dados: { ...blocos[0].dados, text: titulo } }
  }
  return { slug, titulo, duracao, blocos, manualSecao: secao.num }
}

const AULA_MEU_PRIMEIRO_ACESSO: AulaDemo = {
  slug: 'meu-primeiro-acesso',
  titulo: 'Meu primeiro acesso',
  duracao: LOGIN_DURACOES[0],
  blocos: [
    { tipo: 'heading', dados: { text: 'Meu primeiro acesso', nivel: 1 } },
    {
      tipo: 'texto',
      dados: {
        text: 'Nesta aula você conhece a tela de acesso e cria sua conta Gravity. Do primeiro olhar ao cadastro completo.',
      },
    },
    ...blocosDeSecaoLogin(SECAO_TELA_ACESSO, { nivelTitulo: 2 }) as BlocoConteudo[],
    ...blocosDeSecaoLogin(SECAO_CRIAR_CONTA, { nivelTitulo: 2 }) as BlocoConteudo[],
  ],
  manualSecao: SECAO_TELA_ACESSO.num,
}

/** E-mail/senha + Google: formas de entrar quando a conta já existe. */
const AULA_JA_TENHO_ACESSO: AulaDemo = {
  slug: 'entrar-email-senha',
  titulo: TITULO_ENTRAR,
  duracao: LOGIN_DURACOES[1],
  blocos: [
    { tipo: 'heading', dados: { text: TITULO_ENTRAR, nivel: 1 } },
    {
      tipo: 'texto',
      dados: {
        text: 'Se você já tem conta, entre com e-mail e senha ou use o Continuar com Google. Abaixo estão os dois caminhos.',
      },
    },
    ...blocosDeSecaoLogin(SECAO_ENTRAR_EMAIL, { nivelTitulo: 2 }) as BlocoConteudo[],
    ...blocosDeSecaoLogin(SECAO_GOOGLE, { nivelTitulo: 2 }) as BlocoConteudo[],
  ],
  manualSecao: SECAO_ENTRAR_EMAIL.num,
}

export const AULAS_LOGIN: AulaDemo[] = [
  AULA_MEU_PRIMEIRO_ACESSO,
  AULA_JA_TENHO_ACESSO,
  aulaDeSecao('recuperar-senha', SECAO_RECUPERAR, LOGIN_DURACOES[2], TITULO_ESQUECI_SENHA),
]

export const LOGIN_FASES_TRILHA = AULAS_LOGIN.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))
