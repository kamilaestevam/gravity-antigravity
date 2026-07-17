/**
 * Guia Gravity — módulo BID Frete Internacional (Academy).
 * SSOT: manual-bid-frete-conteudo.ts — corpo via ManualSecaoFluxo (paridade com /docs/bid-frete).
 * Mapa Insights: galeria contínua (frase → print) sem subtítulos de tooltip/modal.
 */

import type { AulaDemo } from './manual-login-academy'
import { blocosDeSecaoConfiguradorAcademy } from './academy-blocos-manual'
import { DOC_BID_FRETE_SECAO } from './manual-bid-frete-conteudo'

const FLUXOS = DOC_BID_FRETE_SECAO.fluxos ?? []

const TITULO_ENTENDENDO_BID_FRETE = 'Entendendo o BID Frete Internacional'

const OPCOES_BID_FRETE = {
  incluirImagemSecao: false,
  fluxoComoManualCompleto: true,
} as const

function aulaBidFrete(
  slug: string,
  titulo: string,
  duracao: string,
  fluxoIndices: number[],
  opcoes?: { incluirIntroSecao?: boolean; ocultarCabecalhoNavSumario?: boolean; cabecalhoH1?: boolean },
): AulaDemo {
  const blocos = blocosDeSecaoConfiguradorAcademy(DOC_BID_FRETE_SECAO, {
    ...OPCOES_BID_FRETE,
    incluirIntroSecao: opcoes?.incluirIntroSecao ?? false,
    fluxoIndices,
  })
  if (opcoes?.cabecalhoH1 && !opcoes.incluirIntroSecao) {
    blocos.unshift({ tipo: 'heading', dados: { text: titulo, nivel: 1 } })
  }
  return {
    slug,
    titulo,
    duracao,
    blocos: blocos as AulaDemo['blocos'],
    manualSecao: DOC_BID_FRETE_SECAO.num,
    ...(opcoes?.ocultarCabecalhoNavSumario ? { ocultarCabecalhoNavSumario: true } : {}),
  }
}

export const BID_FRETE_AULA_SLUGS = [
  'bid-frete-entendendo',
  'bid-frete-insights',
  'bid-frete-lista',
  'bid-frete-cotacao-frete-internacional',
  'bid-frete-configuracoes',
] as const

export const AULAS_BID_FRETE: AulaDemo[] = [
  aulaBidFrete(
    BID_FRETE_AULA_SLUGS[0],
    TITULO_ENTENDENDO_BID_FRETE,
    '14m',
    [0, 1],
    { incluirIntroSecao: true, ocultarCabecalhoNavSumario: true },
  ),
  aulaBidFrete(
    BID_FRETE_AULA_SLUGS[1],
    FLUXOS[2]?.tituloSumario ?? 'Insights',
    '28m',
    [2],
  ),
  aulaBidFrete(
    BID_FRETE_AULA_SLUGS[2],
    FLUXOS[3]?.tituloSumario ?? 'Lista',
    '16m',
    [3],
  ),
  aulaBidFrete(
    BID_FRETE_AULA_SLUGS[3],
    'Cotação de frete internacional',
    '52m',
    [4, 5, 6],
    { cabecalhoH1: true },
  ),
  aulaBidFrete(
    BID_FRETE_AULA_SLUGS[4],
    FLUXOS[9]?.tituloSumario ?? 'Configurações',
    '14m',
    [9],
  ),
]

export const BID_FRETE_FASES_TRILHA = AULAS_BID_FRETE.map(a => ({
  slug: a.slug,
  nome: a.titulo,
  duracao: a.duracao,
}))

const DURACAO_TOTAL_MIN = AULAS_BID_FRETE.reduce((s, a) => s + parseInt(a.duracao, 10), 0)

export const BID_FRETE_TRILHA = {
  slug: 'bid-frete',
  tag: '#60a5fa',
  emoji: '✈️',
  nome: 'Guia BID Frete Internacional',
  modulos: AULAS_BID_FRETE.length,
  duracao: `${DURACAO_TOTAL_MIN}m`,
  prog: 0,
  fases: BID_FRETE_FASES_TRILHA.map(f => ({ ...f, concluida: false })),
}
