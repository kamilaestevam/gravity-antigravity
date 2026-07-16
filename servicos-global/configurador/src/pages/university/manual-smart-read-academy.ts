/**
 * Guia Gravity — módulo Smart Docs (Academy).
 * SSOT: manual-smart-read-conteudo.ts — corpo via ManualSecaoFluxo (paridade com /docs/smart-read).
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy } from './academy-blocos-manual'
import { DOC_SMART_READ_SECAO } from './manual-smart-read-conteudo'

const FLUXOS = DOC_SMART_READ_SECAO.fluxos ?? []

const OPCOES_SMART_READ = {
  fluxoComoManualCompleto: true,
} as const

function aulaSmartRead(
  slug: string,
  titulo: string,
  duracao: string,
  fluxoIndices: number[],
  opcoes?: { incluirIntroSecao?: boolean },
): AulaDemo {
  const blocos = blocosDeSecaoConfiguradorAcademy(DOC_SMART_READ_SECAO, {
    ...OPCOES_SMART_READ,
    incluirIntroSecao: opcoes?.incluirIntroSecao ?? false,
    fluxoIndices,
  })
  return {
    slug,
    titulo,
    duracao,
    blocos: blocos as AulaDemo['blocos'],
    manualSecao: DOC_SMART_READ_SECAO.num,
  }
}

export const SMART_READ_AULA_SLUGS = [
  'smart-read-visao-geral',
  'smart-read-acesso',
  'smart-read-tipos-visualizacao',
  'smart-read-visao-insight',
  'smart-read-visao-lista',
  'smart-read-nova-leitura',
  'smart-read-configuracoes',
  'smart-read-historico',
] as const

/** Durações de leitura — regra §10 MANUAL-GRAVITY-ONBOARDING.md */
export const SMART_READ_DURACOES = ['1m', '2m', '2m', '2m', '4m', '4m', '2m', '2m'] as const

export const AULAS_SMART_READ: AulaDemo[] = [
  aulaSmartRead(
    SMART_READ_AULA_SLUGS[0],
    DOC_SMART_READ_SECAO.titulo,
    SMART_READ_DURACOES[0],
    [],
    { incluirIntroSecao: true },
  ),
  aulaSmartRead(
    SMART_READ_AULA_SLUGS[1],
    FLUXOS[0]?.tituloSumario ?? 'Como acessar o produto',
    SMART_READ_DURACOES[1],
    [0],
  ),
  aulaSmartRead(
    SMART_READ_AULA_SLUGS[2],
    FLUXOS[1]?.tituloSumario ?? 'Tipos de visualização',
    SMART_READ_DURACOES[2],
    [1],
  ),
  aulaSmartRead(
    SMART_READ_AULA_SLUGS[3],
    FLUXOS[2]?.tituloSumario ?? 'Visão Insight',
    SMART_READ_DURACOES[3],
    [2],
  ),
  aulaSmartRead(
    SMART_READ_AULA_SLUGS[4],
    FLUXOS[3]?.tituloSumario ?? 'Visão Lista',
    SMART_READ_DURACOES[4],
    [3],
  ),
  aulaSmartRead(
    SMART_READ_AULA_SLUGS[5],
    FLUXOS[4]?.tituloSumario ?? 'Nova Leitura',
    SMART_READ_DURACOES[5],
    [4],
  ),
  aulaSmartRead(
    SMART_READ_AULA_SLUGS[6],
    FLUXOS[5]?.tituloSumario ?? 'Configurações',
    SMART_READ_DURACOES[6],
    [5],
  ),
  aulaSmartRead(
    SMART_READ_AULA_SLUGS[7],
    FLUXOS[6]?.tituloSumario ?? 'Histórico',
    SMART_READ_DURACOES[7],
    [6],
  ),
]

export const SMART_READ_FASES_TRILHA = AULAS_SMART_READ.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))

const DURACAO_TOTAL_MIN = AULAS_SMART_READ.reduce((s, a) => s + parseInt(a.duracao, 10), 0)

export const SMART_READ_TRILHA = {
  slug: 'smart-read',
  tag: '#c084fc',
  emoji: '📄',
  nome: 'Guia Smart Docs',
  modulos: AULAS_SMART_READ.length,
  duracao: `${DURACAO_TOTAL_MIN}m`,
  prog: 0,
  fases: SMART_READ_FASES_TRILHA.map(f => ({ ...f, concluida: false })),
}
