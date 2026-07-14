/**
 * Guia Gravity — módulo Navegação (Academy).
 * SSOT: manual-navegacao-conteudo.ts (paridade com /docs/navegacao).
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy } from './academy-blocos-manual'
import { DOC_NAVEGACAO_SECAO } from './manual-navegacao-conteudo'

const FLUXOS = DOC_NAVEGACAO_SECAO.fluxos ?? []

function aulaNavegacao(
  slug: string,
  titulo: string,
  duracao: string,
  fluxoIndices: number[],
  opcoes?: { incluirIntroSecao?: boolean },
): AulaDemo {
  const blocos = blocosDeSecaoConfiguradorAcademy(DOC_NAVEGACAO_SECAO, {
    incluirIntroSecao: opcoes?.incluirIntroSecao ?? false,
    incluirImagemSecao: false,
    fluxoIndices,
  })
  return {
    slug,
    titulo,
    duracao,
    blocos: blocos as AulaDemo['blocos'],
    manualSecao: DOC_NAVEGACAO_SECAO.num,
  }
}

export const NAVEGACAO_AULA_SLUGS = [
  'navegacao-plataforma',
  'menu-superior',
  'menu-lateral-produtos',
  'troca-produtos-gravity',
  'troca-workspaces',
  'menu-lateral-configuracao',
  'acesso-gravity-university',
  'navegacao-gravity-university',
] as const

export const AULAS_NAVEGACAO: AulaDemo[] = [
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[0],
    DOC_NAVEGACAO_SECAO.titulo,
    '8m',
    [],
    { incluirIntroSecao: true },
  ),
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[1],
    FLUXOS[0]?.tituloSumario ?? 'Menu superior',
    '10m',
    [0],
  ),
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[2],
    FLUXOS[1]?.tituloSumario ?? 'Menu lateral — Produtos Gravity',
    '5m',
    [1],
  ),
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[3],
    FLUXOS[2]?.tituloSumario ?? 'Troca de Produtos Gravity',
    '8m',
    [2],
  ),
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[4],
    FLUXOS[3]?.tituloSumario ?? 'Troca de workspaces',
    '10m',
    [3],
  ),
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[5],
    FLUXOS[4]?.tituloSumario ?? 'Menu lateral — Configuração',
    '12m',
    [4],
  ),
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[6],
    FLUXOS[5]?.tituloSumario ?? 'Como acessar a Gravity University',
    '6m',
    [5],
  ),
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[7],
    FLUXOS[6]?.tituloSumario ?? 'Navegação na Gravity University',
    '6m',
    [6],
  ),
]

export const NAVEGACAO_FASES_TRILHA = AULAS_NAVEGACAO.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))

const DURACAO_TOTAL_MIN = AULAS_NAVEGACAO.reduce((s, a) => s + parseInt(a.duracao, 10), 0)

export const NAVEGACAO_TRILHA = {
  slug: 'navegacao',
  tag: '#38bdf8',
  emoji: '🧭',
  nome: 'Guia Navegação',
  modulos: AULAS_NAVEGACAO.length,
  duracao: `${DURACAO_TOTAL_MIN}m`,
  prog: 0,
  fases: NAVEGACAO_FASES_TRILHA.map(f => ({ ...f, concluida: false })),
}
