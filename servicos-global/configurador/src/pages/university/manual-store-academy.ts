/**
 * Guia Gravity — módulo Gravity Store (Academy).
 * SSOT: manual-store-conteudo.ts (mesma estrutura do manual /docs/store).
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy } from './academy-blocos-manual'
import { DOC_STORE_SECAO } from './manual-store-conteudo'

const FLUXOS = DOC_STORE_SECAO.fluxos ?? []

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
  'gravity-store',
  'como-acessar-a-store',
  'buscar-e-filtrar',
  'linhas-do-catalogo',
  'status-dos-produtos',
  'contratar-um-produto',
  'cancelar-produto',
] as const

export const AULAS_STORE: AulaDemo[] = [
  aulaStore(
    STORE_AULA_SLUGS[0],
    DOC_STORE_SECAO.titulo,
    '5m',
    [],
    { incluirIntroSecao: true, incluirImagemSecao: true },
  ),
  aulaStore(
    STORE_AULA_SLUGS[1],
    FLUXOS[0]?.tituloSumario ?? 'Como acessar a Gravity Store',
    '8m',
    [0],
  ),
  aulaStore(
    STORE_AULA_SLUGS[2],
    FLUXOS[1]?.tituloSumario ?? 'Buscar e filtrar',
    '8m',
    [1],
  ),
  aulaStore(
    STORE_AULA_SLUGS[3],
    FLUXOS[2]?.tituloSumario ?? 'Linhas do catálogo',
    '6m',
    [2],
  ),
  aulaStore(
    STORE_AULA_SLUGS[4],
    FLUXOS[3]?.tituloSumario ?? 'Status dos produtos',
    '8m',
    [3],
  ),
  aulaStore(
    STORE_AULA_SLUGS[5],
    FLUXOS[4]?.tituloSumario ?? 'Contratar um produto',
    '8m',
    [4],
  ),
  aulaStore(
    STORE_AULA_SLUGS[6],
    FLUXOS[5]?.tituloSumario ?? 'Cancelar produto',
    '4m',
    [5],
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
