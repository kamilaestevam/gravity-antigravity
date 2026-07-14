/**
 * Guia Gravity — módulo Hub (Academy).
 * SSOT: manual-hub-conteudo.ts (mesma estrutura do manual /docs/hub).
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy } from './academy-blocos-manual'
import { DOC_HUB_SECAO } from './manual-hub-conteudo'

const FLUXOS = DOC_HUB_SECAO.fluxos ?? []

function aulaHub(
  slug: string,
  titulo: string,
  duracao: string,
  fluxoIndices: number[],
  opcoes?: { incluirIntroSecao?: boolean },
): AulaDemo {
  const blocos = blocosDeSecaoConfiguradorAcademy(DOC_HUB_SECAO, {
    incluirIntroSecao: opcoes?.incluirIntroSecao ?? false,
    fluxoIndices,
    incluirImagemSecao: false,
  })
  return {
    slug,
    titulo,
    duracao,
    blocos: blocos as AulaDemo['blocos'],
    manualSecao: DOC_HUB_SECAO.num,
  }
}

export const HUB_AULA_SLUGS = [
  'hub-tela-principal',
  'acesso-ao-hub',
  'seus-produtos-gravity',
  'acesso-a-gravity-store',
  'aguardando-acao',
  'vitrine-gravity-store',
  'gabi-insights',
] as const

export const AULAS_HUB: AulaDemo[] = [
  aulaHub(
    HUB_AULA_SLUGS[0],
    DOC_HUB_SECAO.titulo,
    '6m',
    [],
    { incluirIntroSecao: true },
  ),
  aulaHub(
    HUB_AULA_SLUGS[1],
    FLUXOS[0]?.tituloSumario ?? 'Acesso ao Hub',
    '6m',
    [0],
  ),
  aulaHub(
    HUB_AULA_SLUGS[2],
    FLUXOS[1]?.tituloSumario ?? 'Seus produtos Gravity',
    '10m',
    [1],
  ),
  aulaHub(
    HUB_AULA_SLUGS[3],
    FLUXOS[2]?.tituloSumario ?? 'Acesso à Gravity Store',
    '8m',
    [2],
  ),
  aulaHub(
    HUB_AULA_SLUGS[4],
    FLUXOS[3]?.tituloSumario ?? 'Aguardando ação',
    '5m',
    [3],
  ),
  aulaHub(
    HUB_AULA_SLUGS[5],
    FLUXOS[4]?.tituloSumario ?? 'Vitrine Gravity Store no Hub',
    '6m',
    [4],
  ),
  aulaHub(
    HUB_AULA_SLUGS[6],
    FLUXOS[5]?.tituloSumario ?? 'Gabi Insights',
    '8m',
    [5],
  ),
]

export const HUB_FASES_TRILHA = AULAS_HUB.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))

const DURACAO_TOTAL_MIN = AULAS_HUB.reduce((s, a) => s + parseInt(a.duracao, 10), 0)

export const HUB_TRILHA = {
  slug: 'hub',
  tag: '#a78bfa',
  emoji: '🏠',
  nome: 'Guia Hub',
  modulos: AULAS_HUB.length,
  duracao: `${DURACAO_TOTAL_MIN}m`,
  prog: 0,
  fases: HUB_FASES_TRILHA.map(f => ({ ...f, concluida: false })),
}
