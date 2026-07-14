/**
 * Guia Gravity — módulo Pedido (Academy).
 * SSOT: manual-pedido-conteudo.ts — corpo via ManualSecaoFluxo (paridade com /docs/pedido).
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy } from './academy-blocos-manual'
import { DOC_PEDIDO_SECAO } from './manual-pedido-conteudo'

const FLUXOS = DOC_PEDIDO_SECAO.fluxos ?? []

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
  'pedido-visao-geral',
  'pedido-acesso',
  'pedido-tipos-visualizacao',
  'pedido-visao-insights',
  'pedido-visao-lista',
  'pedido-visao-dashboard',
  'pedido-visao-kanban',
  'pedido-configuracoes',
  'pedido-historico',
] as const

export const AULAS_PEDIDO: AulaDemo[] = [
  aulaPedido(
    PEDIDO_AULA_SLUGS[0],
    DOC_PEDIDO_SECAO.titulo,
    '10m',
    [],
    { incluirIntroSecao: true },
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[1],
    FLUXOS[0]?.tituloSumario ?? 'Como acessar o produto',
    '6m',
    [0],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[2],
    FLUXOS[1]?.tituloSumario ?? 'Tipos de visualização',
    '8m',
    [1],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[3],
    FLUXOS[2]?.tituloSumario ?? 'Visão Insights',
    '22m',
    [2],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[4],
    FLUXOS[3]?.tituloSumario ?? 'Visão Lista',
    '48m',
    [3],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[5],
    FLUXOS[4]?.tituloSumario ?? 'Visão Dashboard',
    '26m',
    [4],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[6],
    FLUXOS[5]?.tituloSumario ?? 'Visão Kanban',
    '16m',
    [5],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[7],
    FLUXOS[6]?.tituloSumario ?? 'Configurações',
    '16m',
    [6],
  ),
  aulaPedido(
    PEDIDO_AULA_SLUGS[8],
    FLUXOS[7]?.tituloSumario ?? 'Histórico',
    '12m',
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
