/**
 * Guia Gravity — módulo Admin (Academy).
 * SSOT: manual-admin-conteudo.ts — corpo via ManualSecaoFluxo (paridade com /docs/admin).
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy } from './academy-blocos-manual'
import { DOC_ADMIN_SECAO } from './manual-admin-conteudo'

const FLUXOS = DOC_ADMIN_SECAO.fluxos ?? []

const OPCOES_ADMIN = {
  fluxoComoManualCompleto: true,
} as const

function aulaAdmin(
  slug: string,
  titulo: string,
  duracao: string,
  fluxoIndices: number[],
  opcoes?: { incluirIntroSecao?: boolean },
): AulaDemo {
  const blocos = blocosDeSecaoConfiguradorAcademy(DOC_ADMIN_SECAO, {
    ...OPCOES_ADMIN,
    incluirIntroSecao: opcoes?.incluirIntroSecao ?? false,
    fluxoIndices,
  })
  return {
    slug,
    titulo,
    duracao,
    blocos: blocos as AulaDemo['blocos'],
    manualSecao: DOC_ADMIN_SECAO.num,
  }
}

export const ADMIN_AULA_SLUGS = [
  'admin-visao-geral',
  'admin-como-acessar',
  'admin-areas-painel',
  'admin-impersonacao',
  'admin-monitor-apis-deploys',
] as const

export const AULAS_ADMIN: AulaDemo[] = [
  aulaAdmin(
    ADMIN_AULA_SLUGS[0],
    DOC_ADMIN_SECAO.titulo,
    '10m',
    [],
    { incluirIntroSecao: true },
  ),
  aulaAdmin(
    ADMIN_AULA_SLUGS[1],
    FLUXOS[0]?.tituloSumario ?? 'Como acessar',
    '6m',
    [0],
  ),
  aulaAdmin(
    ADMIN_AULA_SLUGS[2],
    FLUXOS[1]?.tituloSumario ?? 'Visão geral do Admin',
    '22m',
    [1],
  ),
  aulaAdmin(
    ADMIN_AULA_SLUGS[3],
    FLUXOS[2]?.tituloSumario ?? 'Impersonação',
    '18m',
    [2],
  ),
  aulaAdmin(
    ADMIN_AULA_SLUGS[4],
    FLUXOS[3]?.tituloSumario ?? 'APIs e deploys',
    '20m',
    [3],
  ),
]

export const ADMIN_FASES_TRILHA = AULAS_ADMIN.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))

const DURACAO_TOTAL_MIN = AULAS_ADMIN.reduce((s, a) => s + parseInt(a.duracao, 10), 0)

export const ADMIN_TRILHA = {
  slug: 'admin',
  tag: '#f43f5e',
  emoji: '🛡️',
  nome: 'Painel Administrativo',
  modulos: AULAS_ADMIN.length,
  duracao: `${DURACAO_TOTAL_MIN}m`,
  prog: 0,
  fases: ADMIN_FASES_TRILHA.map(f => ({ ...f, concluida: false })),
}
