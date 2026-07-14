/**
 * Guia Gravity — módulo Gravity Store (Academy).
 * SSOT: manual-store-conteudo.ts (mesma estrutura do manual /docs/store).
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy } from './academy-blocos-manual'
import { DOC_STORE_SECAO } from './manual-store-conteudo'

const TITULO_ENTENDA_GRAVITY_STORE = 'Entenda a Gravity Store'

function aulaStore(
  slug: string,
  titulo: string,
  duracao: string,
  fluxoIndices: number[],
  opcoes?: { incluirIntroSecao?: boolean; incluirImagemSecao?: boolean },
): AulaDemo {
  const blocos = blocosDeSecaoConfiguradorAcademy(DOC_STORE_SECAO, {
    incluirIntroSecao: opcoes?.incluirIntroSecao ?? false,
    incluirImagemSecao: opcoes?.incluirImagemSecao ?? false,
    fluxoIndices,
  })
  return {
    slug,
    titulo,
    duracao,
    blocos: blocos as AulaDemo['blocos'],
    manualSecao: DOC_STORE_SECAO.num,
  }
}

export const STORE_AULA_SLUGS = [
  'entenda-a-gravity-store',
] as const

export const AULAS_STORE: AulaDemo[] = [
  aulaStore(
    STORE_AULA_SLUGS[0],
    TITULO_ENTENDA_GRAVITY_STORE,
    '47m',
    [0, 1, 2, 3, 4, 5],
    { incluirIntroSecao: true, incluirImagemSecao: true },
  ),
]

export const STORE_FASES_TRILHA = AULAS_STORE.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))

const DURACAO_TOTAL_MIN = AULAS_STORE.reduce((s, a) => s + parseInt(a.duracao, 10), 0)

export const STORE_TRILHA = {
  slug: 'store',
  tag: '#10b981',
  emoji: '🛒',
  nome: 'Guia Gravity Store',
  modulos: AULAS_STORE.length,
  duracao: `${DURACAO_TOTAL_MIN}m`,
  prog: 0,
  fases: STORE_FASES_TRILHA.map(f => ({ ...f, concluida: false })),
}
