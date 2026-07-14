/**
 * Guia Gravity — módulo Hub (Academy).
 * SSOT: manual-hub-conteudo.ts (mesma estrutura do manual /docs/hub).
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy } from './academy-blocos-manual'
import { DOC_HUB_SECAO } from './manual-hub-conteudo'

function aulaHub(
  slug: string,
  titulo: string,
  duracao: string,
  fluxoIndices: number[],
  opcoes?: { incluirIntroSecao?: boolean; cabecalhoH1?: boolean },
): AulaDemo {
  const blocos = blocosDeSecaoConfiguradorAcademy(DOC_HUB_SECAO, {
    incluirIntroSecao: opcoes?.incluirIntroSecao ?? false,
    fluxoIndices,
    incluirImagemSecao: false,
  })
  if (opcoes?.cabecalhoH1 && !opcoes.incluirIntroSecao) {
    blocos.unshift({ tipo: 'heading', dados: { text: titulo, nivel: 1 } })
  }
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
  'gravity-store-na-tela-hub',
] as const

const TITULO_GRAVITY_STORE_NA_TELA_HUB = 'Gravity Store na tela Hub'

export const AULAS_HUB: AulaDemo[] = [
  aulaHub(
    HUB_AULA_SLUGS[0],
    DOC_HUB_SECAO.titulo,
    '43m',
    [0, 1, 2, 4, 6],
    { incluirIntroSecao: true },
  ),
  aulaHub(
    HUB_AULA_SLUGS[1],
    TITULO_GRAVITY_STORE_NA_TELA_HUB,
    '14m',
    [3, 5],
    { cabecalhoH1: true },
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
