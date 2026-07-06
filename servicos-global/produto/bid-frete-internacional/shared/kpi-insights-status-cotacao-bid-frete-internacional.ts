/**
 * KPIs Insights — slugs derivados da config de status (Configurações › Status Cotação).
 * Inclui status custom do usuário além dos canônicos fixos por card.
 */

export const NOMES_STATUS_COTACAO_CANONICO_BID_FRETE_INTERNACIONAL = [
  'RASCUNHO',
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'REPROVADA',
  'CANCELADA',
  'FALTA_INFORMACAO',
  'EXPIRADA',
] as const

export const NOMES_STATUS_COTACAO_SISTEMA_BID_FRETE_INTERNACIONAL = new Set<string>(
  NOMES_STATUS_COTACAO_CANONICO_BID_FRETE_INTERNACIONAL,
)

export type StatusCotacaoConfigMinimoKpiInsightsBidFreteInternacional = {
  nome: string
  ordem?: number
  gerenciado_sistema?: boolean
}

export function ehStatusCotacaoCustomUsuarioBidFreteInternacional(nome: string): boolean {
  return !NOMES_STATUS_COTACAO_SISTEMA_BID_FRETE_INTERNACIONAL.has(nome)
}

/** Slugs aceitos pelo Prisma (`BidFreteInternacionalStatusCotacao`) — custom da config UI não persistem no banco. */
export function filtrarSlugsStatusCotacaoPersistidosBidFreteInternacional(
  slugs: readonly string[],
): string[] {
  return slugs.filter((slug) => NOMES_STATUS_COTACAO_SISTEMA_BID_FRETE_INTERNACIONAL.has(slug))
}

/** Card 1 — aguardando aprovação: canônico + custom da config (contagem funil client; Prisma só canônicos). */
export function resolverSlugsKpiInsightsAguardandoAprovacaoBidFreteInternacional(
  statusConfig: StatusCotacaoConfigMinimoKpiInsightsBidFreteInternacional[],
): string[] {
  const slugs = new Set<string>(['AGUARDANDO_APROVACAO'])
  for (const status of statusConfig) {
    if (ehStatusCotacaoCustomUsuarioBidFreteInternacional(status.nome)) {
      slugs.add(status.nome)
    }
  }
  return [...slugs]
}

export const SLUGS_PADRAO_KPI_INSIGHTS_AGUARDANDO_RESPOSTA_BID_FRETE_INTERNACIONAL = [
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
] as const

/**
 * Card 2 — aguardando resposta: enviada + em cotação + custom entre esses e aprovação pendente.
 */
export function resolverSlugsKpiInsightsAguardandoRespostaBidFreteInternacional(
  statusConfig: StatusCotacaoConfigMinimoKpiInsightsBidFreteInternacional[],
): string[] {
  const slugs = new Set<string>(SLUGS_PADRAO_KPI_INSIGHTS_AGUARDANDO_RESPOSTA_BID_FRETE_INTERNACIONAL)

  const ordemAguardando = statusConfig.find((s) => s.nome === 'AGUARDANDO_APROVACAO')?.ordem
  const ordemEnviada = statusConfig.find((s) => s.nome === 'ENVIADA_FORNECEDORES')?.ordem
  if (ordemAguardando == null || ordemEnviada == null) {
    return [...slugs]
  }

  for (const status of statusConfig) {
    if (
      ehStatusCotacaoCustomUsuarioBidFreteInternacional(status.nome) &&
      status.ordem != null &&
      status.ordem > ordemEnviada &&
      status.ordem < ordemAguardando
    ) {
      slugs.add(status.nome)
    }
  }
  return [...slugs]
}

export function contagemSlugsNoFunilBidFreteInternacional(
  funil: Array<{ status: string; count: number }>,
  slugs: readonly string[],
): number {
  return slugs.reduce(
    (acc, slug) => acc + (funil.find((f) => f.status === slug)?.count ?? 0),
    0,
  )
}

export function detalharSlugsNoFunilBidFreteInternacional(
  funil: Array<{ status: string; count: number }>,
  slugs: readonly string[],
): Record<string, number> {
  const detalhe: Record<string, number> = {}
  for (const slug of slugs) {
    detalhe[slug] = funil.find((f) => f.status === slug)?.count ?? 0
  }
  return detalhe
}
