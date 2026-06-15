/**
 * Agregação de KPIs do Dashboard operacional — SSOT para /kpis e /insights GABI.
 */

import type { Request } from 'express'
import { motorGanho } from '../services/motor-ganho-bid-frete-internacional.js'
import { clausulaFiltroWorkspaceBidFrete, parseIdsWorkspacesQuery } from '../shared/workspace-filtro-bid-frete-internacional.js'

const STATUS_ANDAMENTO = [
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'FALTA_INFORMACAO',
] as const

function extrairCountGroupBy(row: { _count: number | { _all?: number } }): number {
  const count = row._count
  if (typeof count === 'number') return count
  return count._all ?? 0
}

export type KpisDashboardBidFretePayload = {
  cotacoes_andamento: number
  cotacoes_passadas: number
  cotacoes_aprovadas: number
  valor_andamento_usd: number
  valor_aprovado_usd: number
  tempo_medio_resposta_dias: number | null
  aprovacao: {
    total: number
    em_tempo: number
    fora_prazo: number
    percentual_em_tempo: string
  }
  savings: Awaited<ReturnType<typeof motorGanho.calcularMetricas>>
  funil: Array<{ status: string; count: number }>
  distribuicao_modal_andamento: Array<{ modal_cotacao_bid_frete_internacional: string; count: number }>
}

export type OpcoesAgregarKpisDashboardBidFrete = {
  data_inicio?: string
  data_fim?: string
  status_slug_kpi_andamento?: string | null
}

export async function agregarKpisDashboardBidFreteInternacional(
  req: Request,
  opts: OpcoesAgregarKpisDashboardBidFrete = {},
): Promise<KpisDashboardBidFretePayload> {
  const filtroWorkspace = clausulaFiltroWorkspaceBidFrete(req)
  const statusKpiAndamento =
    typeof opts.status_slug_kpi_andamento === 'string' && opts.status_slug_kpi_andamento.trim()
      ? opts.status_slug_kpi_andamento.trim()
      : null

  const cotacoesAndamento = await (req.prisma as any).cotacaoBidFreteInternacional.count({
    where: {
      id_produto_gravity: 'bid-frete-internacional',
      status_cotacao_bid_frete_internacional: {
        in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO', 'FALTA_INFORMACAO'],
      },
      ...filtroWorkspace,
    },
  })

  const cotacoesPassadas = await (req.prisma as any).cotacaoBidFreteInternacional.count({
    where: {
      id_produto_gravity: 'bid-frete-internacional',
      status_cotacao_bid_frete_internacional: { in: ['APROVADA', 'REPROVADA', 'CANCELADA', 'EXPIRADA'] },
      ...filtroWorkspace,
    },
  })

  const filtroStatusValorAndamento = statusKpiAndamento
    ? statusKpiAndamento
    : { in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO', 'AGUARDANDO_APROVACAO'] as const }

  const valoresAndamento = await (req.prisma as any).propostaBidFreteInternacional.aggregate({
    where: {
      id_produto_gravity: 'bid-frete-internacional',
      cotacao: {
        status_cotacao_bid_frete_internacional: filtroStatusValorAndamento,
        ...filtroWorkspace,
      },
    },
    _sum: { valor_total_proposta_bid_frete_internacional: true },
  })

  const valoresPassadas = await (req.prisma as any).propostaBidFreteInternacional.aggregate({
    where: {
      id_produto_gravity: 'bid-frete-internacional',
      status_proposta_bid_frete_internacional: 'APROVADA',
      ...(Object.keys(filtroWorkspace).length > 0 ? { cotacao: filtroWorkspace } : {}),
    },
    _sum: { valor_total_proposta_bid_frete_internacional: true },
  })

  const cotacoesAprovadas = await (req.prisma as any).cotacaoBidFreteInternacional.findMany({
    where: {
      id_produto_gravity: 'bid-frete-internacional',
      status_cotacao_bid_frete_internacional: 'APROVADA',
      ...filtroWorkspace,
    },
    select: {
      data_aprovacao_cotacao_bid_frete_internacional: true,
      data_limite_resposta_cotacao_bid_frete_internacional: true,
    },
  })

  type AprovadaRow = {
    data_aprovacao_cotacao_bid_frete_internacional: Date
    data_limite_resposta_cotacao_bid_frete_internacional: Date | null
  }
  const emTempo = (cotacoesAprovadas as AprovadaRow[]).filter(c =>
    !c.data_limite_resposta_cotacao_bid_frete_internacional
    || new Date(c.data_aprovacao_cotacao_bid_frete_internacional)
      <= new Date(c.data_limite_resposta_cotacao_bid_frete_internacional),
  ).length
  const fora = cotacoesAprovadas.length - emTempo

  const idsWorkspaces = parseIdsWorkspacesQuery(req)
  const idWorkspaceUnico =
    !idsWorkspaces?.length && typeof filtroWorkspace.id_workspace === 'string'
      ? filtroWorkspace.id_workspace
      : undefined

  const savings = await motorGanho.calcularMetricas(req.prisma!, {
    ...(idsWorkspaces?.length ? { ids_workspaces: idsWorkspaces } : {}),
    ...(idWorkspaceUnico ? { id_workspace: idWorkspaceUnico } : {}),
    data_inicio: opts.data_inicio ? new Date(opts.data_inicio) : undefined,
    data_fim: opts.data_fim ? new Date(opts.data_fim) : undefined,
  })

  const funil = await (req.prisma as any).cotacaoBidFreteInternacional.groupBy({
    by: ['status_cotacao_bid_frete_internacional'],
    where: { id_produto_gravity: 'bid-frete-internacional', ...filtroWorkspace },
    _count: true,
  })

  const funilMapped = (
    funil as Array<{ status_cotacao_bid_frete_internacional: string; _count: number | { _all?: number } }>
  ).map(f => ({
    status: f.status_cotacao_bid_frete_internacional,
    count: extrairCountGroupBy(f),
  }))

  const cotacoesAprovadasCount =
    funilMapped.find(f => f.status === 'APROVADA')?.count ?? cotacoesAprovadas.length

  const disparosComResposta = await (req.prisma as any).disparoCotacaoBidFreteInternacional.findMany({
    where: {
      id_produto_gravity: 'bid-frete-internacional',
      data_envio_disparo_cotacao_bid_frete_internacional: { not: null },
      data_resposta_disparo_cotacao_bid_frete_internacional: { not: null },
      ...(Object.keys(filtroWorkspace).length > 0 ? { cotacao: filtroWorkspace } : {}),
    },
    select: {
      data_envio_disparo_cotacao_bid_frete_internacional: true,
      data_resposta_disparo_cotacao_bid_frete_internacional: true,
    },
    take: 500,
  })

  type DisparoRespostaRow = {
    data_envio_disparo_cotacao_bid_frete_internacional: Date
    data_resposta_disparo_cotacao_bid_frete_internacional: Date
  }
  const diasResposta = (disparosComResposta as DisparoRespostaRow[])
    .map(d => {
      const envio = new Date(d.data_envio_disparo_cotacao_bid_frete_internacional).getTime()
      const resposta = new Date(d.data_resposta_disparo_cotacao_bid_frete_internacional).getTime()
      return (resposta - envio) / (1000 * 60 * 60 * 24)
    })
    .filter(d => Number.isFinite(d) && d >= 0)

  const tempo_medio_resposta_dias =
    diasResposta.length > 0
      ? Math.round((diasResposta.reduce((a, b) => a + b, 0) / diasResposta.length) * 10) / 10
      : null

  const modalAndamento = await (req.prisma as any).cotacaoBidFreteInternacional.groupBy({
    by: ['modal_cotacao_bid_frete_internacional'],
    where: {
      id_produto_gravity: 'bid-frete-internacional',
      status_cotacao_bid_frete_internacional: statusKpiAndamento
        ? statusKpiAndamento
        : { in: [...STATUS_ANDAMENTO] },
      ...filtroWorkspace,
    },
    _count: true,
  })

  const distribuicao_modal_andamento = (
    modalAndamento as Array<{ modal_cotacao_bid_frete_internacional: string; _count: number | { _all?: number } }>
  ).map(m => ({
    modal_cotacao_bid_frete_internacional: m.modal_cotacao_bid_frete_internacional,
    count: extrairCountGroupBy(m),
  }))

  return {
    cotacoes_andamento: cotacoesAndamento,
    cotacoes_passadas: cotacoesPassadas,
    cotacoes_aprovadas: cotacoesAprovadasCount,
    valor_andamento_usd: valoresAndamento._sum?.valor_total_proposta_bid_frete_internacional ?? 0,
    valor_aprovado_usd: valoresPassadas._sum?.valor_total_proposta_bid_frete_internacional ?? 0,
    tempo_medio_resposta_dias,
    aprovacao: {
      total: cotacoesAprovadas.length,
      em_tempo: emTempo,
      fora_prazo: fora,
      percentual_em_tempo:
        cotacoesAprovadas.length > 0 ? (emTempo / cotacoesAprovadas.length * 100).toFixed(1) : '0',
    },
    savings,
    funil: funilMapped,
    distribuicao_modal_andamento,
  }
}
