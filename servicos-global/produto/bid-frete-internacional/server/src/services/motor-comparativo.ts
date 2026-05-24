/**
 * motor-comparativo.ts — Motor de Comparativo e Ranking
 * Responsável por:
 * 1. Ranquear respostas por preço, transit time e avaliação
 * 2. Identificar melhor preço, melhor transit, melhor avaliação
 * 3. Calcular ganho potencial
 */

import { PrismaClient } from '../generated/client/index.js'

interface RankedResponse {
  id: string
  id_fornecedor_bid_frete_internacional: string
  fornecedor_nome: string
  fornecedor_tipo: string
  valor_total_proposta_bid_frete_internacional: number
  valor_frete_proposta_bid_frete_internacional: number
  taxas_origem_proposta_bid_frete_internacional: number
  taxas_destino_proposta_bid_frete_internacional: number
  dias_transito_proposta_bid_frete_internacional: number
  dias_free_time_proposta_bid_frete_internacional: number | null
  moeda_ganho_bid_frete_internacional: string
  transbordos_proposta_bid_frete_internacional: number
  validade_proposta_bid_frete_internacional: Date
  via_tabela_valor_proposta_bid_frete_internacional: boolean
  via_api_proposta_bid_frete_internacional: boolean
  classificacao_valor_proposta_bid_frete_internacional: number
  classificacao_transito_proposta_bid_frete_internacional: number
  classificacao_avaliacao_proposta_bid_frete_internacional: number
  ranking_geral: number
  nota_global_classificacao_bid_frete_internacional: number | null
  tags: string[] // ["MELHOR_PRECO", "MELHOR_TRANSIT", "MELHOR_AVALIACAO"]
  taxas: Array<Record<string, unknown>>
}

type CotacaoRow = {
  id_cotacao_bid_frete_internacional: string
  numero_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  valor_meta_cotacao_bid_frete_internacional?: number | null
  id_workspace?: string | null
  [key: string]: unknown
}

type ResponseRow = Record<string, unknown> & {
  id_proposta_bid_frete_internacional: string
  valor_total_proposta_bid_frete_internacional: number
  dias_transito_proposta_bid_frete_internacional: number
  fornecedor?: { email_fornecedor_bid_frete_internacional?: string }
}

type RatingRow = Record<string, unknown> & { email_fornecedor_classificacao_bid_frete_internacional: string }

export const motorComparativo = {
  /**
   * Gera ranking completo das respostas de uma cotacao
   */
  async ranquear(prisma: PrismaClient, id_cotacao_bid_frete_internacional: string): Promise<{
    ranking: RankedResponse[]
    saving: { vs_target: number | null; vs_media: number | null; percentual: number | null }
    cotacao: CotacaoRow
  }> {
    // Buscar cotacao com respostas
    const cotacao = await (prisma as any).bidFreteInternacionalCotacao.findFirst({
      where: { id_cotacao_bid_frete_internacional },
    })

    if (!cotacao) throw new Error('Cotacao nao encontrada')

    const responses = await (prisma as any).bidFreteInternacionalProposta.findMany({
      where: { id_cotacao_bid_frete_internacional },
      include: {
        fornecedor: {
          select: {
            id_fornecedor_bid_frete_internacional: true,
            nome_fornecedor_bid_frete_internacional: true,
            tipo_fornecedor_bid_frete_internacional: true,
            email_fornecedor_bid_frete_internacional: true,
          },
        },
        taxas: true,
      },
      orderBy: { valor_total_proposta_bid_frete_internacional: 'asc' },
    })

    if (responses.length === 0) {
      return { ranking: [], saving: { vs_target: null, vs_media: null, percentual: null }, cotacao }
    }

    // Buscar ratings globais
    const emails = responses.map((r: ResponseRow) => r.fornecedor?.email_fornecedor_bid_frete_internacional).filter(Boolean)
    let ratings: RatingRow[] = []
    try {
      ratings = await (prisma as any).bidFreteInternacionalClassificacao.findMany({
        where: { email_fornecedor_classificacao_bid_frete_internacional: { in: emails } },
      })
    } catch { /* tabela pode nao existir */ }

    const ratingMap = new Map(ratings.map((r: RatingRow) => [r.email_fornecedor_classificacao_bid_frete_internacional, r as Record<string, unknown>]))

    // Ranking por preco (menor valor = melhor)
    const byPreco = [...responses].sort((a: ResponseRow, b: ResponseRow) => a.valor_total_proposta_bid_frete_internacional - b.valor_total_proposta_bid_frete_internacional)
    // Ranking por transit time (menor = melhor)
    const byTransit = [...responses].sort((a: ResponseRow, b: ResponseRow) => a.dias_transito_proposta_bid_frete_internacional - b.dias_transito_proposta_bid_frete_internacional)
    // Ranking por avaliacao (maior rating = melhor)
    const byAvaliacao = [...responses].sort((a: ResponseRow, b: ResponseRow) => {
      const rA = (ratingMap.get(a.fornecedor?.email_fornecedor_bid_frete_internacional ?? '')?.nota_global_classificacao_bid_frete_internacional as number) ?? 0
      const rB = (ratingMap.get(b.fornecedor?.email_fornecedor_bid_frete_internacional ?? '')?.nota_global_classificacao_bid_frete_internacional as number) ?? 0
      return rB - rA
    })

    // Montar ranking
    const ranking: RankedResponse[] = responses.map((_r: ResponseRow) => {
      const r = _r as any
      const rankPreco = byPreco.findIndex((x: ResponseRow) => x.id_proposta_bid_frete_internacional === r.id_proposta_bid_frete_internacional) + 1
      const rankTransit = byTransit.findIndex((x: ResponseRow) => x.id_proposta_bid_frete_internacional === r.id_proposta_bid_frete_internacional) + 1
      const rankAvaliacao = byAvaliacao.findIndex((x: ResponseRow) => x.id_proposta_bid_frete_internacional === r.id_proposta_bid_frete_internacional) + 1
      const ratingGlobal = (ratingMap.get(r.fornecedor?.email_fornecedor_bid_frete_internacional)?.nota_global_classificacao_bid_frete_internacional as number | null) ?? null

      // Score geral: peso 40% preco, 30% transit, 30% avaliacao
      const rankGeral = Math.round(rankPreco * 0.4 + rankTransit * 0.3 + rankAvaliacao * 0.3)

      const tags: string[] = []
      if (rankPreco === 1) tags.push('MELHOR_PRECO')
      if (rankTransit === 1) tags.push('MELHOR_TRANSIT')
      if (rankAvaliacao === 1) tags.push('MELHOR_AVALIACAO')

      return {
        id: r.id_proposta_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: r.fornecedor.id_fornecedor_bid_frete_internacional,
        fornecedor_nome: r.fornecedor.nome_fornecedor_bid_frete_internacional,
        fornecedor_tipo: r.fornecedor.tipo_fornecedor_bid_frete_internacional,
        valor_total_proposta_bid_frete_internacional: r.valor_total_proposta_bid_frete_internacional,
        valor_frete_proposta_bid_frete_internacional: r.valor_frete_proposta_bid_frete_internacional,
        taxas_origem_proposta_bid_frete_internacional: r.taxas_origem_proposta_bid_frete_internacional,
        taxas_destino_proposta_bid_frete_internacional: r.taxas_destino_proposta_bid_frete_internacional,
        dias_transito_proposta_bid_frete_internacional: r.dias_transito_proposta_bid_frete_internacional,
        dias_free_time_proposta_bid_frete_internacional: r.dias_free_time_proposta_bid_frete_internacional,
        moeda_ganho_bid_frete_internacional: r.moeda_proposta_bid_frete_internacional,
        transbordos_proposta_bid_frete_internacional: r.transbordos_proposta_bid_frete_internacional,
        validade_proposta_bid_frete_internacional: r.validade_proposta_bid_frete_internacional,
        via_tabela_valor_proposta_bid_frete_internacional: r.via_tabela_valor_proposta_bid_frete_internacional,
        via_api_proposta_bid_frete_internacional: r.via_api_proposta_bid_frete_internacional,
        classificacao_valor_proposta_bid_frete_internacional: rankPreco,
        classificacao_transito_proposta_bid_frete_internacional: rankTransit,
        classificacao_avaliacao_proposta_bid_frete_internacional: rankAvaliacao,
        ranking_geral: rankGeral,
        nota_global_classificacao_bid_frete_internacional: ratingGlobal,
        tags,
        taxas: r.taxas,
      }
    })

    // Ordenar por ranking geral
    ranking.sort((a, b) => a.ranking_geral - b.ranking_geral)

    // Calcular saving
    const melhorPreco = ranking[0]?.valor_total_proposta_bid_frete_internacional ?? 0
    const mediaPreco = responses.reduce((acc: number, r: ResponseRow) => acc + r.valor_total_proposta_bid_frete_internacional, 0) / responses.length

    const cotacaoLoose = cotacao as Record<string, unknown> & { valor_meta_cotacao_bid_frete_internacional?: number }
    const saving = {
      vs_target: cotacaoLoose.valor_meta_cotacao_bid_frete_internacional ? cotacaoLoose.valor_meta_cotacao_bid_frete_internacional - melhorPreco : null,
      vs_media: mediaPreco - melhorPreco,
      percentual: cotacaoLoose.valor_meta_cotacao_bid_frete_internacional
        ? ((cotacaoLoose.valor_meta_cotacao_bid_frete_internacional - melhorPreco) / cotacaoLoose.valor_meta_cotacao_bid_frete_internacional) * 100
        : mediaPreco > 0 ? ((mediaPreco - melhorPreco) / mediaPreco) * 100 : null,
    }

    // Atualizar rankings no banco
    for (const r of ranking) {
      await (prisma as any).bidFreteInternacionalProposta.update({
        where: { id_proposta_bid_frete_internacional: r.id },
        data: {
          classificacao_valor_proposta_bid_frete_internacional: r.classificacao_valor_proposta_bid_frete_internacional,
          classificacao_transito_proposta_bid_frete_internacional: r.classificacao_transito_proposta_bid_frete_internacional,
          classificacao_avaliacao_proposta_bid_frete_internacional: r.classificacao_avaliacao_proposta_bid_frete_internacional,
          status_proposta_bid_frete_internacional: r.tags.includes('MELHOR_PRECO') ? 'MELHOR_PRECO'
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
  async aprovar(prisma: PrismaClient, id_cotacao_bid_frete_internacional: string, id_proposta_bid_frete_internacional: string, id_usuario: string) {
    const response = await (prisma as any).bidFreteInternacionalProposta.findFirst({
      where: { id_proposta_bid_frete_internacional, id_cotacao_bid_frete_internacional },
    })

    if (!response) throw new Error('Resposta nao encontrada')

    // Buscar cotacao para saving
    const cotacao = await (prisma as any).bidFreteInternacionalCotacao.findFirst({ where: { id_cotacao_bid_frete_internacional } })

    // Aprovar a resposta
    await (prisma as any).bidFreteInternacionalProposta.update({
      where: { id_proposta_bid_frete_internacional },
      data: { status_proposta_bid_frete_internacional: 'APROVADA' },
    })

    // Reprovar todas as outras
    await (prisma as any).bidFreteInternacionalProposta.updateMany({
      where: { id_cotacao_bid_frete_internacional, id_proposta_bid_frete_internacional: { not: id_proposta_bid_frete_internacional } },
      data: { status_proposta_bid_frete_internacional: 'REPROVADA' },
    })

    // Atualizar cotacao
    const allResponses = await (prisma as any).bidFreteInternacionalProposta.findMany({
      where: { id_cotacao_bid_frete_internacional },
    })
    const media = allResponses.reduce((acc: number, r: ResponseRow) => acc + r.valor_total_proposta_bid_frete_internacional, 0) / allResponses.length

    const savingVsTarget = cotacao.valor_meta_cotacao_bid_frete_internacional ? cotacao.valor_meta_cotacao_bid_frete_internacional - response.valor_total_proposta_bid_frete_internacional : null
    const savingVsMedia = media - response.valor_total_proposta_bid_frete_internacional
    const savingPct = cotacao.valor_meta_cotacao_bid_frete_internacional
      ? ((cotacao.valor_meta_cotacao_bid_frete_internacional - response.valor_total_proposta_bid_frete_internacional) / cotacao.valor_meta_cotacao_bid_frete_internacional) * 100
      : media > 0 ? ((media - response.valor_total_proposta_bid_frete_internacional) / media) * 100 : null

    await (prisma as any).bidFreteInternacionalCotacao.update({
      where: { id_cotacao_bid_frete_internacional },
      data: {
        status_cotacao_bid_frete_internacional: 'APROVADA',
        id_fornecedor_vencedor_cotacao_bid_frete_internacional: response.id_fornecedor_bid_frete_internacional,
        data_aprovacao_cotacao_bid_frete_internacional: new Date(),
        ganho_valor_cotacao_bid_frete_internacional: savingVsTarget ?? savingVsMedia,
        ganho_percentual_cotacao_bid_frete_internacional: savingPct,
      },
    })

    // Registrar saving/ganho
    await (prisma as any).bidFreteInternacionalGanho.create({
      data: {
        id_produto_gravity: 'bid-frete-internacional',
        id_usuario,
        id_organizacao: cotacao.id_organizacao,
        id_cotacao_bid_frete_internacional,
        id_workspace: cotacao.id_workspace,
        valor_meta_ganho_bid_frete_internacional: cotacao.valor_meta_cotacao_bid_frete_internacional,
        valor_aprovado_ganho_bid_frete_internacional: response.valor_total_proposta_bid_frete_internacional,
        valor_medio_ganho_bid_frete_internacional: media,
        ganho_vs_meta_ganho_bid_frete_internacional: savingVsTarget,
        ganho_vs_media_ganho_bid_frete_internacional: savingVsMedia,
        ganho_percentual_ganho_bid_frete_internacional: savingPct,
        moeda_ganho_bid_frete_internacional: response.moeda_proposta_bid_frete_internacional,
      },
    })

    return { approved: true, ganho_percentual_ganho_bid_frete_internacional: savingPct }
  },
}
