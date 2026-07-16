/**
 * Guia Gravity — módulo Pedido (Academy).
 * SSOT: manual-pedido-conteudo.ts — corpo via ManualSecaoFluxo (paridade com /docs/pedido).
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy } from './academy-blocos-manual'
import { DOC_PEDIDO_SECAO } from './manual-pedido-conteudo'

const FLUXOS = DOC_PEDIDO_SECAO.fluxos ?? []

const TITULO_PEDIDO_GRAVITY = 'Pedido Gravity'

const OPCOES_PEDIDO = {
  incluirImagemSecao: false,
  fluxoComoManualCompleto: true,
} as const

function aulaPedido(
  slug: string,
  titulo: string,
  duracao: string,
  fluxoIndices: number[],
  opcoes?: { incluirIntroSecao?: boolean },
): AulaDemo {
  const blocos = blocosDeSecaoConfiguradorAcademy(DOC_PEDIDO_SECAO, {
    ...OPCOES_PEDIDO,
    incluirIntroSecao: opcoes?.incluirIntroSecao ?? false,
    fluxoIndices,
  })
  return {
    slug,
    titulo,
    duracao,
    blocos: blocos as AulaDemo['blocos'],
    manualSecao: DOC_PEDIDO_SECAO.num,
  }
}

export const PEDIDO_AULA_SLUGS = [
  'pedido-gravity',
  'pedido-visao-insights',
  'pedido-visao-lista',
  'pedido-visao-dashboard',
  'pedido-visao-kanban',
  'pedido-configuracoes',
  'pedido-historico',
] as const

/** Durações de leitura (PlayerAula) — regra §10 MANUAL-GRAVITY-ONBOARDING.md */
export const PEDIDO_DURACOES = ['2m', '2m', '3m', '3m', '3m', '2m', '2m'] as const

export const AULAS_PEDIDO: AulaDemo[] = [
  aulaPedido(
    PEDIDO_AULA_SLUGS[0],
    TITULO_PEDIDO_GRAVITY,
    PEDIDO_DURACOES[0],
    [0, 1],
    { incluirIntroSecao: true },
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[1],
    FLUXOS[2]?.tituloSumario ?? 'Visão Insights',
    PEDIDO_DURACOES[1],
    [2],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[2],
    FLUXOS[3]?.tituloSumario ?? 'Visão Lista',
    PEDIDO_DURACOES[2],
    [3],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[3],
    FLUXOS[4]?.tituloSumario ?? 'Visão Dashboard',
    PEDIDO_DURACOES[3],
    [4],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[4],
    FLUXOS[5]?.tituloSumario ?? 'Visão Kanban',
    PEDIDO_DURACOES[4],
    [5],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[5],
    FLUXOS[6]?.tituloSumario ?? 'Configurações',
    PEDIDO_DURACOES[5],
    [6],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[6],
    FLUXOS[7]?.tituloSumario ?? 'Histórico',
    PEDIDO_DURACOES[6],
    [7],
  ),
]

export const PEDIDO_FASES_TRILHA = AULAS_PEDIDO.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))

const DURACAO_TOTAL_MIN = AULAS_PEDIDO.reduce((s, a) => s + parseInt(a.duracao, 10), 0)

export const PEDIDO_TRILHA = {
  slug: 'pedido',
  tag: '#f59e0b',
  emoji: '📦',
  nome: 'Guia Pedido',
  modulos: AULAS_PEDIDO.length,
  duracao: `${DURACAO_TOTAL_MIN}m`,
  prog: 0,
  fases: PEDIDO_FASES_TRILHA.map(f => ({ ...f, concluida: false })),
}
