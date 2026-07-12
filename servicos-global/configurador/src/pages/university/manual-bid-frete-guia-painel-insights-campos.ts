import {
  ChartBar,
  CheckCircle,
  Clock,
  CurrencyDollar,
  Path,
  Trophy,
  UserCircle,
  type Icon,
} from '@phosphor-icons/react'
import type { CampoGuiaAoVivo } from './manual-bid-frete-guia-ao-vivo'

export type CampoPainelInsightsId =
  | 'valor_total'
  | 'transit_time'
  | 'free_time'
  | 'escala'
  | 'fornecedor'
  | 'aprovar'

type CampoPainelInsights = CampoGuiaAoVivo<CampoPainelInsightsId>

export const CAMPOS_PAINEL_INSIGHTS_BID_FRETE: CampoPainelInsights[] = [
  {
    id: 'valor_total',
    num: '01',
    rotulo: 'Valor total',
    paragrafoGuia:
      'Exibe o **menor frete total** entre as propostas recebidas — referência rápida para comparar competitividade.',
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
      'Dias de **free time** na melhor oferta — tempo de permanência no terminal sem custo adicional.',
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

export const ROTULO_CAMPO_PAINEL_INSIGHTS: Record<CampoPainelInsightsId, string> = {
  valor_total: 'Melhor proposta',
  transit_time: 'Transit Time',
  free_time: 'Free Time',
  escala: 'Escala',
  fornecedor: 'Fornecedor',
  aprovar: 'Aprovar',
}

export const ICONE_CAMPO_PAINEL_INSIGHTS: Record<CampoPainelInsightsId, Icon> = {
  valor_total: Trophy,
  transit_time: Clock,
  free_time: ChartBar,
  escala: Path,
  fornecedor: UserCircle,
  aprovar: CheckCircle,
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
    fornecedor: 'Agente de Carga Ltda',
    aprovar: opcoes?.propostaAprovada ? 'Aprovado' : 'Aprovar proposta',
  }

  return CAMPOS_PAINEL_INSIGHTS_BID_FRETE
    .filter((campo) => interagiu[campo.id])
    .map((campo) => ({ id: campo.id, valor: valores[campo.id] }))
}
