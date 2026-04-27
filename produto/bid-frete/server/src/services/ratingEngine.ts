/**
 * ratingEngine.ts — Motor de Rating (Automatico + Manual)
 * Rating GLOBAL: cross-tenant, baseado no email do fornecedor
 * Rating manual: por avaliacao individual de cada tenant
 */

import { PrismaClient } from '@prisma/client'

export const ratingEngine = {
  /**
   * Recalcula rating global de um fornecedor (cross-tenant)
   * Chamado apos cada avaliacao manual ou resposta de BID
   */
  async recalcular(prisma: PrismaClient, fornecedorEmail: string) {
    // Buscar todos os BidRequests deste fornecedor (cross-tenant, usa basePrisma)
    const allRequests = await (prisma as any).freteIntBidPedidoCotacoes.findMany({
      where: { fornecedor: { email: fornecedorEmail } },
      include: { fornecedor: { select: { email: true } } },
    })

    const allResponses = await (prisma as any).freteIntBidPropostas.findMany({
      where: { fornecedor: { email: fornecedorEmail } },
    })

    const allAvaliacoes = await (prisma as any).freteIntBidFornecedoresAvaliacoes.findMany({
      where: { fornecedor: { email: fornecedorEmail } },
    })

    // Metricas automaticas
    type RequestRow = { status?: string; enviado_em?: Date | string | null; respondido_em?: Date | string | null }
    type ResponseRow = { status?: string }
    const totalRecebidas = allRequests.length
    const totalRespondidas = allRequests.filter((r: RequestRow) => r.status === 'RESPONDIDO').length
    const totalAprovadas = allResponses.filter((r: ResponseRow) => r.status === 'APROVADA').length

    const taxaResposta = totalRecebidas > 0 ? (totalRespondidas / totalRecebidas) * 100 : 0
    const taxaAprovacao = totalRespondidas > 0 ? (totalAprovadas / totalRespondidas) * 100 : 0

    // Tempo medio de resposta
    const temposResposta = allRequests
      .filter((r: RequestRow) => r.enviado_em && r.respondido_em)
      .map((r: RequestRow) => (new Date(r.respondido_em as string).getTime() - new Date(r.enviado_em as string).getTime()) / (1000 * 60 * 60))
    const tempoMedio = temposResposta.length > 0
      ? temposResposta.reduce((a: number, b: number) => a + b, 0) / temposResposta.length
      : 0

    // Medias manuais
    const mediaFrete = calcularMedia(allAvaliacoes, 'nota_frete')
    const mediaAtendimento = calcularMedia(allAvaliacoes, 'nota_atendimento')
    const mediaResposta = calcularMedia(allAvaliacoes, 'nota_resposta')
    const mediaConfiabilidade = calcularMedia(allAvaliacoes, 'nota_confiabilidade')

    // Rating global consolidado (0-5)
    // 40% automatico + 60% manual (se houver avaliacoes)
    const scoreAuto = (
      (taxaResposta / 100) * 2 +       // ate 2 pontos por taxa de resposta
      (taxaAprovacao / 100) * 2 +       // ate 2 pontos por taxa de aprovacao
      (tempoMedio < 24 ? 1 : tempoMedio < 48 ? 0.5 : 0) // ate 1 ponto por velocidade
    )

    const scoreManual = allAvaliacoes.length > 0
      ? (mediaFrete + mediaAtendimento + mediaResposta + mediaConfiabilidade) / 4
      : 0

    const ratingGlobal = allAvaliacoes.length > 0
      ? scoreAuto * 0.4 + scoreManual * 0.6
      : scoreAuto

    // Upsert no RatingFornecedor (tabela global)
    await (prisma as any).freteIntBidClassificacaoFornecedores.upsert({
      where: { fornecedor_email: fornecedorEmail },
      create: {
        fornecedor_email: fornecedorEmail,
        total_cotacoes_recebidas: totalRecebidas,
        total_cotacoes_respondidas: totalRespondidas,
        total_cotacoes_aprovadas: totalAprovadas,
        taxa_resposta: taxaResposta,
        taxa_aprovacao: taxaAprovacao,
        tempo_medio_resposta_horas: tempoMedio,
        rating_global: Math.min(5, Math.max(0, ratingGlobal)),
        media_frete: mediaFrete,
        media_atendimento: mediaAtendimento,
        media_resposta: mediaResposta,
        media_confiabilidade: mediaConfiabilidade,
        total_avaliacoes: allAvaliacoes.length,
      },
      update: {
        total_cotacoes_recebidas: totalRecebidas,
        total_cotacoes_respondidas: totalRespondidas,
        total_cotacoes_aprovadas: totalAprovadas,
        taxa_resposta: taxaResposta,
        taxa_aprovacao: taxaAprovacao,
        tempo_medio_resposta_horas: tempoMedio,
        rating_global: Math.min(5, Math.max(0, ratingGlobal)),
        media_frete: mediaFrete,
        media_atendimento: mediaAtendimento,
        media_resposta: mediaResposta,
        media_confiabilidade: mediaConfiabilidade,
        total_avaliacoes: allAvaliacoes.length,
      },
    })

    return { rating_global: ratingGlobal, fornecedor_email: fornecedorEmail }
  },
}

function calcularMedia(avaliacoes: Array<Record<string, unknown>>, campo: string): number {
  const notas = avaliacoes
    .filter((a: Record<string, unknown>) => a[campo] != null)
    .map((a: Record<string, unknown>) => a[campo] as number)
  return notas.length > 0 ? notas.reduce((a: number, b: number) => a + b, 0) / notas.length : 0
}
