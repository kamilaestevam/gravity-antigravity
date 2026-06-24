/**
 * KPIs Insights (cards 1 e 2) — regra operacional no banco (enum Prisma).
 * Status custom da config UI não persistem; contagem segue fluxo real (status + propostas + disparos).
 */

export const STATUS_TERMINAIS_KPI_INSIGHTS_BID_FRETE_INTERNACIONAL = [
  'APROVADA',
  'REPROVADA',
  'CANCELADA',
  'EXPIRADA',
] as const

export const STATUS_AGUARDANDO_RESPOSTA_KPI_INSIGHTS_BID_FRETE_INTERNACIONAL = [
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'FALTA_INFORMACAO',
] as const

/** Card 1 — já há resposta de fornecedor e cliente ainda não encerrou (aprovação pendente). */
export function montarWhereKpiInsightsAguardandoAprovacaoBidFreteInternacional(
  base: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...base,
    OR: [
      { status_cotacao_bid_frete_internacional: 'AGUARDANDO_APROVACAO' },
      {
        status_cotacao_bid_frete_internacional: {
          notIn: [...STATUS_TERMINAIS_KPI_INSIGHTS_BID_FRETE_INTERNACIONAL, 'RASCUNHO'],
        },
        propostas: { some: {} },
      },
    ],
  }
}

/** Card 2 — disparada e ainda sem proposta / sem resposta de fornecedor. */
export function montarWhereKpiInsightsAguardandoRespostaBidFreteInternacional(
  base: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...base,
    OR: [
      {
        status_cotacao_bid_frete_internacional: {
          in: [...STATUS_AGUARDANDO_RESPOSTA_KPI_INSIGHTS_BID_FRETE_INTERNACIONAL],
        },
        propostas: { none: {} },
        NOT: {
          disparos_cotacao: {
            some: { status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO' },
          },
        },
      },
      {
        status_cotacao_bid_frete_internacional: 'RASCUNHO',
        propostas: { none: {} },
        disparos_cotacao: {
          some: {
            data_envio_disparo_cotacao_bid_frete_internacional: { not: null },
            status_disparo_cotacao_bid_frete_internacional: { not: 'RESPONDIDO' },
          },
        },
      },
    ],
  }
}

export function montarWhereKpiInsightsAguardandoRespostaPorStatusBidFreteInternacional(
  base: Record<string, unknown>,
  status: 'ENVIADA_FORNECEDORES' | 'EM_COTACAO',
): Record<string, unknown> {
  const whereResposta = montarWhereKpiInsightsAguardandoRespostaBidFreteInternacional(base)
  return {
    AND: [
      whereResposta,
      { status_cotacao_bid_frete_internacional: status },
    ],
  }
}
