import type { GabiInsightItem, DashboardKpis } from './api'
import { ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL } from './rotas-bid-frete-internacional'

const fmtNum = (n: number) => new Intl.NumberFormat('pt-BR').format(Math.round(n))
const fmtPct = (n: number) => `${n.toFixed(1)}%`

const ROTA_PENDENTES = ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.cotacoesPendentes
const ROTA_PROPOSTAS = ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.propostas
const ROTA_KANBAN = ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.kanban

export function buildClientInsightsFornecedor(kpis: DashboardKpis): GabiInsightItem[] {
  const items: GabiInsightItem[] = []

  const pendentes = Number(kpis.cotacoes_pendentes_visao_fornecedor ?? 0)
  if (pendentes > 0) {
    items.push({
      id: 'cotacoes_pendentes_fornecedor',
      variante: 'warn',
      tag: 'Atenção · Resposta pendente',
      texto: `${pendentes} cotação${pendentes > 1 ? 'ões' : ''} aguardando sua proposta de frete.`,
      stat: { label: 'Pendentes', valor: fmtNum(pendentes) },
      textoLink: 'Ver pendentes',
      rota: ROTA_PENDENTES,
    })
  }

  const emAnalise = Number(kpis.propostas_em_analise_visao_fornecedor ?? 0)
  if (emAnalise > 0) {
    items.push({
      id: 'propostas_em_analise_fornecedor',
      variante: 'default',
      tag: 'Em análise',
      texto: `${emAnalise} proposta${emAnalise > 1 ? 's' : ''} em análise pelo comprador.`,
      stat: { label: 'Em análise', valor: fmtNum(emAnalise) },
      textoLink: 'Minhas propostas',
      rota: ROTA_PROPOSTAS,
    })
  }

  const taxaResposta = Number(kpis.taxa_resposta_visao_fornecedor ?? 0)
  if (taxaResposta > 0) {
    items.push({
      id: 'taxa_resposta_fornecedor',
      variante: 'default',
      tag: 'Desempenho · Taxa de resposta',
      texto: `Você respondeu ${fmtPct(taxaResposta)} das cotações recebidas no período.`,
      stat: { label: 'Taxa de resposta', valor: fmtPct(taxaResposta) },
      textoLink: 'Ver funil',
      rota: ROTA_KANBAN,
    })
  }

  const aprovadas = Number(kpis.propostas_aprovadas_visao_fornecedor ?? 0)
  const taxaAprovacao = Number(kpis.taxa_aprovacao_visao_fornecedor ?? 0)
  if (aprovadas > 0) {
    items.push({
      id: 'propostas_aprovadas_fornecedor',
      variante: 'default',
      tag: 'Resultado · Aprovadas',
      texto: `${aprovadas} proposta${aprovadas > 1 ? 's' : ''} aprovada${aprovadas > 1 ? 's' : ''} pelo comprador.`,
      stat: taxaAprovacao > 0
        ? { label: 'Taxa de aprovação', valor: fmtPct(taxaAprovacao) }
        : { label: 'Aprovadas', valor: fmtNum(aprovadas) },
      textoLink: 'Ver aprovadas',
      rota: ROTA_PROPOSTAS,
    })
  }

  const reprovadas = Number(kpis.propostas_reprovadas_visao_fornecedor ?? 0)
  if (reprovadas > 0) {
    items.push({
      id: 'propostas_reprovadas_fornecedor',
      variante: 'warn',
      tag: 'Feedback · Reprovadas',
      texto: `${reprovadas} proposta${reprovadas > 1 ? 's' : ''} reprovada${reprovadas > 1 ? 's' : ''}. Revise valores e prazos nas próximas cotações.`,
      stat: { label: 'Reprovadas', valor: fmtNum(reprovadas) },
      textoLink: 'Ver histórico',
      rota: ROTA_PROPOSTAS,
    })
  }

  if (items.length === 0) {
    items.push({
      id: 'status_ok_fornecedor',
      variante: 'default',
      tag: 'Gabi AI · Tudo em dia',
      texto: 'Nenhuma pendência crítica nas suas cotações e propostas no período selecionado.',
      stat: { label: 'Período', valor: kpis.period ?? '30d' },
      textoLink: 'Ver cotações',
      rota: ROTA_PENDENTES,
    })
  }

  return items
}
