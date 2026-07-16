/**
 * Guia Gravity — módulo Navegação (Academy).
 * SSOT: manual-navegacao-conteudo.ts (paridade com /docs/navegacao).
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy, type CuradoriaSecaoAcademy } from './academy-blocos-manual'
import { DOC_NAVEGACAO_SECAO } from './manual-navegacao-conteudo'

const FLUXOS = DOC_NAVEGACAO_SECAO.fluxos ?? []

type OpcoesAulaNavegacao = Pick<
  CuradoriaSecaoAcademy,
  'incluirIntroSecao' | 'tituloIntroAcademy' | 'titulosFluxoAcademy'
>

function aulaNavegacao(
  slug: string,
  titulo: string,
  duracao: string,
  fluxoIndices: number[],
  opcoes?: OpcoesAulaNavegacao,
): AulaDemo {
  const blocos = blocosDeSecaoConfiguradorAcademy(DOC_NAVEGACAO_SECAO, {
    incluirIntroSecao: opcoes?.incluirIntroSecao ?? false,
    incluirImagemSecao: false,
    fluxoIndices,
    tituloIntroAcademy: opcoes?.tituloIntroAcademy,
    titulosFluxoAcademy: opcoes?.titulosFluxoAcademy,
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
  'menu-lateral',
  'acesso-gravity-university',
] as const

export const AULAS_NAVEGACAO: AulaDemo[] = [
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[0],
    'Navegação na plataforma',
    '8m',
    [],
    { incluirIntroSecao: true, tituloIntroAcademy: 'Navegação na plataforma' },
  ),
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[1],
    FLUXOS[0]?.tituloSumario ?? 'Menu superior',
    '10m',
    [0],
  ),
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[2],
    'Menu lateral',
    '35m',
    [1, 2, 3, 4],
    {
      titulosFluxoAcademy: {
        1: 'Produtos contratados',
        2: 'Troca de produtos',
        3: 'Troca de workspaces',
        4: 'Configuração',
      },
    },
  ),
  aulaNavegacao(
    NAVEGACAO_AULA_SLUGS[3],
    'Como acessar a Gravity University',
    '12m',
    [5, 6],
    {
      titulosFluxoAcademy: {
        6: 'Navegação na University',
      },
    },
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
