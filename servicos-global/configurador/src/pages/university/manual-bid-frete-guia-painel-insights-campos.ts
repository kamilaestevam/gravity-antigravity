import {
  ChartBar,
  ChartLineUp,
  CheckCircle,
  Clock,
  CurrencyDollar,
  Medal,
  Path,
  Trophy,
  UserCircle,
  type Icon,
} from '@phosphor-icons/react'
import { NOME_AGENTE_LIDER_DEMO_PAINEL_INSIGHTS } from './manual-bid-frete-mock-propostas-painel-insights'
import type { CampoGuiaAoVivo } from './manual-bid-frete-guia-ao-vivo'

export type CampoPainelInsightsId =
  | 'valor_total'
  | 'transit_time'
  | 'free_time'
  | 'escala'
  | 'fornecedor'
  | 'aprovar'
  | 'ranking_lider'
  | 'ranking_eixo_frete'
  | 'ranking_eixo_transit'
  | 'ranking_eixo_rota'
  | 'ranking_eixo_prazo'
  | 'termometro_historico'

type CampoPainelInsights = CampoGuiaAoVivo<CampoPainelInsightsId>

export const CAMPOS_MELHOR_PROPOSTA_PAINEL_INSIGHTS: CampoPainelInsights[] = [
  {
    id: 'valor_total',
    num: '01',
    rotulo: 'Valor total',
    paragrafoGuia:
      'Exibe o **menor frete total** entre as propostas recebidas: referência rápida para comparar competitividade.',
    descricaoPontos: ['Menor frete entre as respostas', 'Atualizado a cada nova proposta'],
    icone: CurrencyDollar,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    id: 'transit_time',
    num: '02',
    rotulo: 'Transit Time',
    paragrafoGuia:
      'Prazo de trânsito da **melhor proposta**. O gráfico compara o ganhador com as demais respostas.',
    descricaoPontos: ['Dias até a chegada', 'Comparativo visual entre fornecedores'],
    icone: Clock,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    id: 'free_time',
    num: '03',
    rotulo: 'Free Time',
    paragrafoGuia:
      'Dias de **free time** na melhor oferta: tempo de permanência no terminal sem custo adicional.',
    descricaoPontos: ['Dias de permanência gratuita', 'Comparativo entre propostas'],
    icone: ChartBar,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    id: 'escala',
    num: '04',
    rotulo: 'Escala',
    paragrafoGuia:
      'Indica se a rota é **direta** ou quantas **escalas/transbordos** a melhor proposta prevê.',
    descricaoPontos: ['Direto ou número de escalas', 'Comparativo visual no card'],
    icone: Path,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    id: 'fornecedor',
    num: '05',
    rotulo: 'Fornecedor',
    paragrafoGuia:
      'Agente de carga responsável pela **melhor proposta** exibida no card.',
    descricaoPontos: ['Nome do fornecedor ganhador', 'Avatar com inicial'],
    icone: UserCircle,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.1)',
  },
  {
    id: 'aprovar',
    num: '06',
    rotulo: 'Aprovar',
    paragrafoGuia:
      'Atalho para **aprovar** a melhor proposta diretamente do painel, quando a cotação permite ação.',
    descricaoPontos: ['Disponível com propostas válidas', 'Abre o fluxo de aprovação'],
    icone: CheckCircle,
    cor: '#4ade80',
    borda: 'rgba(74,222,128,.32)',
    fundo: 'rgba(34,197,94,.08)',
  },
]

export const CAMPOS_RANKING_PAINEL_INSIGHTS: CampoPainelInsights[] = [
  {
    id: 'ranking_lider',
    num: '07',
    rotulo: 'Líder do ranking',
    paragrafoGuia:
      'Exibe a proposta em **1º lugar** no score geral: fornecedor, valor total e colocação consolidada.',
    descricaoPontos: ['1º no ranking geral', 'Menor frete entre as respostas recebidas'],
    icone: Medal,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.32)',
    fundo: 'rgba(251,191,36,.08)',
  },
  {
    id: 'ranking_eixo_frete',
    num: '08',
    rotulo: 'Frete total',
    paragrafoGuia:
      'Colocação da proposta líder no eixo **frete total**. Badge **Melhor** quando lidera o comparativo.',
    descricaoPontos: ['Valor total da proposta', 'Comparativo entre todas as respostas'],
    icone: CurrencyDollar,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    id: 'ranking_eixo_transit',
    num: '09',
    rotulo: 'Transit time',
    paragrafoGuia:
      'Posição no eixo **Transit time**: quantos dias até a chegada em relação às demais propostas.',
    descricaoPontos: ['Dias de trânsito', 'Badge com colocação (ex.: 2º de 3)'],
    icone: Clock,
    cor: '#60a5fa',
    borda: 'rgba(96,165,250,.32)',
    fundo: 'rgba(96,165,250,.08)',
  },
  {
    id: 'ranking_eixo_rota',
    num: '10',
    rotulo: 'Escala / transbordo',
    paragrafoGuia:
      'Colocação no eixo **rota**: direto ou quantidade de escalas/transbordos previstos.',
    descricaoPontos: ['Direto ou número de escalas', 'Menos escalas = melhor colocação'],
    icone: Path,
    cor: '#a78bfa',
    borda: 'rgba(167,139,250,.32)',
    fundo: 'rgba(139,92,246,.08)',
  },
  {
    id: 'ranking_eixo_prazo',
    num: '11',
    rotulo: 'Prazo pagamento',
    paragrafoGuia:
      'Eixo **prazo de pagamento** quando informado na proposta; exibe *(vazio)* se o fornecedor não preencheu.',
    descricaoPontos: ['Dias para pagamento', 'Opcional conforme resposta do agente'],
    icone: ChartBar,
    cor: '#94a3b8',
    borda: 'rgba(148,163,184,.28)',
    fundo: 'rgba(148,163,184,.08)',
  },
]

export const CAMPOS_TERMOMETRO_PAINEL_INSIGHTS: CampoPainelInsights[] = [
  {
    id: 'termometro_historico',
    num: '12',
    rotulo: 'Termômetro histórico',
    paragrafoGuia:
      'Compara o **frete base da melhor proposta (Dele)** com a **média de mercado** dos últimos 6 meses nas mesmas condições: curva azul e referência de posicionamento.',
    descricaoPontos: [
      'Dele vs mercado (média 6 meses)',
      'Gráfico de evolução mensal',
      'Filtros por componente do frete',
    ],
    icone: ChartLineUp,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.32)',
    fundo: 'rgba(56,189,248,.08)',
  },
]

export const CAMPOS_PAINEL_INSIGHTS_BID_FRETE: CampoPainelInsights[] = [
  ...CAMPOS_MELHOR_PROPOSTA_PAINEL_INSIGHTS,
  ...CAMPOS_RANKING_PAINEL_INSIGHTS,
  ...CAMPOS_TERMOMETRO_PAINEL_INSIGHTS,
]

export const ROTULO_CAMPO_PAINEL_INSIGHTS: Record<CampoPainelInsightsId, string> = {
  valor_total: 'Melhor proposta',
  transit_time: 'Transit Time',
  free_time: 'Free Time',
  escala: 'Escala',
  fornecedor: 'Fornecedor',
  aprovar: 'Aprovar',
  ranking_lider: 'Líder do ranking',
  ranking_eixo_frete: 'Frete total',
  ranking_eixo_transit: 'Transit time',
  ranking_eixo_rota: 'Escala / transbordo',
  ranking_eixo_prazo: 'Prazo pagamento',
  termometro_historico: 'Termômetro histórico',
}

export const ICONE_CAMPO_PAINEL_INSIGHTS: Record<CampoPainelInsightsId, Icon> = {
  valor_total: Trophy,
  transit_time: Clock,
  free_time: ChartBar,
  escala: Path,
  fornecedor: UserCircle,
  aprovar: CheckCircle,
  ranking_lider: Medal,
  ranking_eixo_frete: CurrencyDollar,
  ranking_eixo_transit: Clock,
  ranking_eixo_rota: Path,
  ranking_eixo_prazo: ChartBar,
  termometro_historico: ChartLineUp,
}

export function resolverExplicacaoPainelInsights(campo: CampoPainelInsightsId): string {
  const meta = CAMPOS_PAINEL_INSIGHTS_BID_FRETE.find((item) => item.id === campo)
  return meta?.paragrafoGuia ?? ''
}

export function resolverSelecoesPainelInsights(
  interagiu: Partial<Record<CampoPainelInsightsId, boolean>>,
  opcoes?: { propostaAprovada?: boolean },
): { id: CampoPainelInsightsId; valor: string }[] {
  const valores: Record<CampoPainelInsightsId, string> = {
    valor_total: 'US$ 2.150',
    transit_time: '30 dias',
    free_time: '15 dias',
    escala: 'Direto',
    fornecedor: NOME_AGENTE_LIDER_DEMO_PAINEL_INSIGHTS,
    aprovar: opcoes?.propostaAprovada ? 'Aprovado' : 'Aprovar proposta',
    ranking_lider: `1º · ${NOME_AGENTE_LIDER_DEMO_PAINEL_INSIGHTS} · US$ 2.150,00`,
    ranking_eixo_frete: 'US$ 2.150,00 · Melhor',
    ranking_eixo_transit: '30 dias · 2º de 3',
    ranking_eixo_rota: 'Direto',
    ranking_eixo_prazo: '—',
    termometro_historico: 'Dele US$ 2.000 · Mercado US$ 1.042 (6 meses)',
  }

  return CAMPOS_PAINEL_INSIGHTS_BID_FRETE
    .filter((campo) => interagiu[campo.id])
    .map((campo) => ({ id: campo.id, valor: valores[campo.id] }))
}
