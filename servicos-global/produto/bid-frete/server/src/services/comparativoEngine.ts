/**
 * comparativoEngine.ts — Motor de Comparativo e Ranking
 * Responsavel por:
 * 1. Ranquear respostas por preco, transit time e avaliacao
 * 2. Identificar melhor preco, melhor transit, melhor avaliacao
 * 3. Calcular saving potencial
 */

import { PrismaClient } from '@prisma/client'

interface RankedResponse {
  id: string
  fornecedor_id: string
  fornecedor_nome: string
  fornecedor_tipo: string
  valor_total: number
  valor_frete: number
  taxas_origem: number
  taxas_destino: number
  transit_time_dias: number
  free_time_dias: number | null
  moeda: string
  transbordos: number
  validade_cotacao: Date
  via_tabela_padrao: boolean
  via_api: boolean
  ranking_preco: number
  ranking_transit: number
  ranking_avaliacao: number
  ranking_geral: number
  rating_global: number | null
  tags: string[] // ["MELHOR_PRECO", "MELHOR_TRANSIT", "MELHOR_AVALIACAO"]
  detalhes_taxas: Array<Record<string, unknown>>
}

// Shapes dinâmicos vindos do Prisma — usados apenas internamente neste módulo.
type CotacaoRow = {
  id_cotacao_bid_frete: string
  numero_cotacao_bid_frete: string
  // TODO: lookup from Cadastros
  // TODO: lookup from Cadastros
  valor_alvo_cotacao_bid_frete?: number | null
  [key: string]: unknown
}
type ResponseRow = Record<string, unknown> & {
  id: string
  valor_total: number
  transit_time_dias: number
  fornecedor?: { email?: string }
}
type RatingRow = Record<string, unknown> & { fornecedor_email: string }

export const comparativoEngine = {
  /**
   * Gera ranking completo das respostas de uma cotacao
   */
  async ranquear(prisma: PrismaClient, cotacao_id: string): Promise<{
    ranking: RankedResponse[]
    saving: { vs_target: number | null; vs_media: number | null; percentual: number | null }
    cotacao: CotacaoRow
  }> {
    // Buscar cotacao com respostas
    const cotacao = await (prisma as any).freteIntBidCotacoes.findFirst({
      where: { id_cotacao_bid_frete: cotacao_id },
    })

    if (!cotacao) throw new Error('Cotacao nao encontrada')

    const responses = await (prisma as any).freteIntBidPropostas.findMany({
      where: { cotacao_id },
      include: {
        fornecedor: { select: { id: true, nome: true, tipo: true, email: true } },
        detalhes_taxas: true,
      },
      orderBy: { valor_total: 'asc' },
    })

    if (responses.length === 0) {
      return { ranking: [], saving: { vs_target: null, vs_media: null, percentual: null }, cotacao }
    }

    // Buscar ratings globais
    const emails = responses.map((r: ResponseRow) => r.fornecedor?.email).filter(Boolean)
    let ratings: RatingRow[] = []
    try {
      ratings = await (prisma as any).freteIntBidClassificacaoFornecedores.findMany({
        where: { fornecedor_email: { in: emails } },
      })
    } catch { /* tabela pode nao existir */ }

    const ratingMap = new Map(ratings.map((r: RatingRow) => [r.fornecedor_email, r as Record<string, unknown>]))

    // Ranking por preco (menor valor = melhor)
    const byPreco = [...responses].sort((a: ResponseRow, b: ResponseRow) => a.valor_total - b.valor_total)
    // Ranking por transit time (menor = melhor)
    const byTransit = [...responses].sort((a: ResponseRow, b: ResponseRow) => a.transit_time_dias - b.transit_time_dias)
    // Ranking por avaliacao (maior rating = melhor)
    const byAvaliacao = [...responses].sort((a: ResponseRow, b: ResponseRow) => {
      const rA = (ratingMap.get(a.fornecedor?.email ?? '')?.rating_global as number) ?? 0
      const rB = (ratingMap.get(b.fornecedor?.email ?? '')?.rating_global as number) ?? 0
      return rB - rA
    })

    // Montar ranking
    const ranking: RankedResponse[] = responses.map((_r: ResponseRow) => {
      const r = _r as any
      const rankPreco = byPreco.findIndex((x: ResponseRow) => x.id === r.id) + 1
      const rankTransit = byTransit.findIndex((x: ResponseRow) => x.id === r.id) + 1
      const rankAvaliacao = byAvaliacao.findIndex((x: ResponseRow) => x.id === r.id) + 1
      const ratingGlobal = (ratingMap.get(r.fornecedor?.email)?.rating_global as number | null) ?? null

      // Score geral: peso 40% preco, 30% transit, 30% avaliacao
      const rankGeral = Math.round(rankPreco * 0.4 + rankTransit * 0.3 + rankAvaliacao * 0.3)

      const tags: string[] = []
      if (rankPreco === 1) tags.push('MELHOR_PRECO')
      if (rankTransit === 1) tags.push('MELHOR_TRANSIT')
      if (rankAvaliacao === 1) tags.push('MELHOR_AVALIACAO')

      return {
        id: r.id,
        fornecedor_id: r.fornecedor.id,
        fornecedor_nome: r.fornecedor.nome,
        fornecedor_tipo: r.fornecedor.tipo,
        valor_total: r.valor_total,
        valor_frete: r.valor_frete,
        taxas_origem: r.taxas_origem,
        taxas_destino: r.taxas_destino,
        transit_time_dias: r.transit_time_dias,
        free_time_dias: r.free_time_dias,
        moeda: r.moeda,
        transbordos: r.transbordos,
        validade_cotacao: r.validade_cotacao,
        via_tabela_padrao: r.via_tabela_padrao,
        via_api: r.via_api,
        ranking_preco: rankPreco,
        ranking_transit: rankTransit,
        ranking_avaliacao: rankAvaliacao,
        ranking_geral: rankGeral,
        rating_global: ratingGlobal,
        tags,
        detalhes_taxas: r.detalhes_taxas,
      }
    })

    // Ordenar por ranking geral
    ranking.sort((a, b) => a.ranking_geral - b.ranking_geral)

    // Calcular saving
    const melhorPreco = ranking[0]?.valor_total ?? 0
    const mediaPreco = responses.reduce((acc: number, r: ResponseRow) => acc + r.valor_total, 0) / responses.length

    const cotacaoLoose = cotacao as Record<string, unknown> & { valor_alvo_cotacao_bid_frete?: number }
    const saving = {
      vs_target: cotacaoLoose.valor_alvo_cotacao_bid_frete ? cotacaoLoose.valor_alvo_cotacao_bid_frete - melhorPreco : null,
      vs_media: mediaPreco - melhorPreco,
      percentual: cotacaoLoose.valor_alvo_cotacao_bid_frete
        ? ((cotacaoLoose.valor_alvo_cotacao_bid_frete - melhorPreco) / cotacaoLoose.valor_alvo_cotacao_bid_frete) * 100
        : mediaPreco > 0 ? ((mediaPreco - melhorPreco) / mediaPreco) * 100 : null,
    }

    // Atualizar rankings no banco
    for (const r of ranking) {
      await (prisma as any).freteIntBidPropostas.update({
        where: { id: r.id },
        data: {
          ranking_preco: r.ranking_preco,
          ranking_transit: r.ranking_transit,
          ranking_avaliacao: r.ranking_avaliacao,
          status: r.tags.includes('MELHOR_PRECO') ? 'MELHOR_PRECO'
            : r.tags.includes('MELHOR_TRANSIT') ? 'MELHOR_TRANSIT'
            : r.tags.includes('MELHOR_AVALIACAO') ? 'MELHOR_AVALIACAO'
            : 'EM_ANALISE',
        },
      })
    }

    return { ranking, saving, cotacao }
  },

  /**
   * Aprova cotacao com fornecedor vencedor (2 cliques)
   */
  async aprovar(prisma: PrismaClient, cotacao_id: string, response_id: string, user_id: string) {
    const response = await (prisma as any).freteIntBidPropostas.findFirst({
      where: { id: response_id, cotacao_id },
    })

    if (!response) throw new Error('Resposta nao encontrada')

    // Buscar cotacao para saving
    const cotacao = await (prisma as any).freteIntBidCotacoes.findFirst({ where: { id_cotacao_bid_frete: cotacao_id } })

    // Aprovar a resposta
    await (prisma as any).freteIntBidPropostas.update({
      where: { id: response_id },
      data: { status: 'APROVADA' },
    })

    // Reprovar todas as outras
    await (prisma as any).freteIntBidPropostas.updateMany({
      where: { cotacao_id, id: { not: response_id } },
      data: { status: 'REPROVADA' },
    })

    // Atualizar cotacao
    const allResponses = await (prisma as any).freteIntBidPropostas.findMany({
      where: { cotacao_id },
    })
    const media = allResponses.reduce((acc: number, r: ResponseRow) => acc + r.valor_total, 0) / allResponses.length

    const savingVsTarget = cotacao.valor_alvo_cotacao_bid_frete ? cotacao.valor_alvo_cotacao_bid_frete - response.valor_total : null
    const savingVsMedia = media - response.valor_total
    const savingPct = cotacao.valor_alvo_cotacao_bid_frete
      ? ((cotacao.valor_alvo_cotacao_bid_frete - response.valor_total) / cotacao.valor_alvo_cotacao_bid_frete) * 100
      : media > 0 ? ((media - response.valor_total) / media) * 100 : null

    await (prisma as any).freteIntBidCotacoes.update({
      where: { id_cotacao_bid_frete: cotacao_id },
      data: {
        status_cotacao_bid_frete: 'APROVADA',
        id_fornecedor_vencedor_cotacao_bid_frete: response.fornecedor_id,
        data_aprovacao_cotacao_bid_frete: new Date(),
        saving_valor_cotacao_bid_frete: savingVsTarget ?? savingVsMedia,
        saving_percentual_cotacao_bid_frete: savingPct,
      },
    })

    // Registrar saving
    await (prisma as any).freteIntBidGanhoEstimado.create({
      data: {
        product_id: 'bid-frete',
        user_id,
        cotacao_id,
        company_id: cotacao.id_workspace,
        valor_target: cotacao.valor_alvo_cotacao_bid_frete,
        valor_aprovado: response.valor_total,
        valor_medio: media,
        saving_vs_target: savingVsTarget,
        saving_vs_media: savingVsMedia,
        saving_percentual: savingPct,
        moeda: response.moeda,
      },
    })

    return { approved: true, saving_percentual: savingPct }
  },
}
