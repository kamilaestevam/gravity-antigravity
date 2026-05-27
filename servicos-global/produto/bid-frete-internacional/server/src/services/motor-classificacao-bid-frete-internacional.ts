/**
 * motor-classificacao.ts — Motor de Classificação (Automático + Manual)
 * Classificação/Rating GLOBAL: cross-tenant, baseado no email do fornecedor
 * Classificação manual: por avaliação individual de cada tenant
 */

import { PrismaClient } from '../generated/client/index.js'

export const motorClassificacao = {
  /**
   * Recalcula classificação global de um fornecedor (cross-tenant)
   * Chamado após cada avaliação manual ou resposta de BID
   */
  async recalcular(prisma: PrismaClient, fornecedorEmail: string) {
    // Buscar todos os BidRequests deste fornecedor (cross-tenant, usa basePrisma)
    const allRequests = await (prisma as any).disparoCotacaoBidFreteInternacional.findMany({
      where: { fornecedor: { email_fornecedor_bid_frete_internacional: fornecedorEmail } },
      include: { fornecedor: { select: { email_fornecedor_bid_frete_internacional: true } } },
    })

    const allResponses = await (prisma as any).propostaBidFreteInternacional.findMany({
      where: { fornecedor: { email_fornecedor_bid_frete_internacional: fornecedorEmail } },
    })

    const allAvaliacoes = await (prisma as any).avaliacaoBidFreteInternacional.findMany({
      where: { fornecedor: { email_fornecedor_bid_frete_internacional: fornecedorEmail } },
    })

    // Metricas automáticas
    type RequestRow = { status_disparo_cotacao_bid_frete_internacional?: string; data_envio_disparo_cotacao_bid_frete_internacional?: Date | string | null; data_resposta_disparo_cotacao_bid_frete_internacional?: Date | string | null }
    type ResponseRow = { status_proposta_bid_frete_internacional?: string }
    const totalRecebidas = allRequests.length
    const totalRespondidas = allRequests.filter((r: RequestRow) => r.status_disparo_cotacao_bid_frete_internacional === 'RESPONDIDO').length
    const totalAprovadas = allResponses.filter((r: ResponseRow) => r.status_proposta_bid_frete_internacional === 'APROVADA').length

    const taxaResposta = totalRecebidas > 0 ? (totalRespondidas / totalRecebidas) * 100 : 0
    const taxaAprovacao = totalRespondidas > 0 ? (totalAprovadas / totalRespondidas) * 100 : 0

    // Tempo médio de resposta
    const temposResposta = allRequests
      .filter((r: RequestRow) => r.data_envio_disparo_cotacao_bid_frete_internacional && r.data_resposta_disparo_cotacao_bid_frete_internacional)
      .map((r: RequestRow) => (new Date(r.data_resposta_disparo_cotacao_bid_frete_internacional as string).getTime() - new Date(r.data_envio_disparo_cotacao_bid_frete_internacional as string).getTime()) / (1000 * 60 * 60))
    const tempoMedio = temposResposta.length > 0
      ? temposResposta.reduce((a: number, b: number) => a + b, 0) / temposResposta.length
      : 0

    // Médias manuais
    const mediaFrete = calcularMedia(allAvaliacoes, 'nota_frete_avaliacao_bid_frete_internacional')
    const mediaAtendimento = calcularMedia(allAvaliacoes, 'nota_atendimento_avaliacao_bid_frete_internacional')
    const mediaResposta = calcularMedia(allAvaliacoes, 'nota_resposta_avaliacao_bid_frete_internacional')
    const mediaConfiabilidade = calcularMedia(allAvaliacoes, 'nota_confiabilidade_avaliacao_bid_frete_internacional')

    // Classificação global consolidada (0-5)
    // 40% automático + 60% manual (se houver avaliações)
    const scoreAuto = (
      (taxaResposta / 100) * 2 +       // até 2 pontos por taxa de resposta
      (taxaAprovacao / 100) * 2 +       // até 2 pontos por taxa de aprovação
      (tempoMedio < 24 ? 1 : tempoMedio < 48 ? 0.5 : 0) // até 1 ponto por velocidade
    )

    const scoreManual = allAvaliacoes.length > 0
      ? (mediaFrete + mediaAtendimento + mediaResposta + mediaConfiabilidade) / 4
      : 0

    const ratingGlobal = allAvaliacoes.length > 0
      ? scoreAuto * 0.4 + scoreManual * 0.6
      : scoreAuto

    // Upsert na Classificação (tabela global)
    await (prisma as any).classificacaoBidFreteInternacional.upsert({
      where: { email_fornecedor_classificacao_bid_frete_internacional: fornecedorEmail },
      create: {
        email_fornecedor_classificacao_bid_frete_internacional: fornecedorEmail,
        total_cotacoes_recebidas_classificacao_bid_frete_internacional: totalRecebidas,
        total_cotacoes_respondidas_classificacao_bid_frete_internacional: totalRespondidas,
        total_cotacoes_aprovadas_classificacao_bid_frete_internacional: totalAprovadas,
        taxa_resposta_classificacao_bid_frete_internacional: taxaResposta,
        taxa_aprovacao_classificacao_bid_frete_internacional: taxaAprovacao,
        tempo_medio_resposta_horas_classificacao_bid_frete_internacional: tempoMedio,
        nota_global_classificacao_bid_frete_internacional: Math.min(5, Math.max(0, ratingGlobal)),
        media_frete_classificacao_bid_frete_internacional: mediaFrete,
        media_atendimento_classificacao_bid_frete_internacional: mediaAtendimento,
        media_resposta_classificacao_bid_frete_internacional: mediaResposta,
        media_confiabilidade_classificacao_bid_frete_internacional: mediaConfiabilidade,
        total_avaliacoes_classificacao_bid_frete_internacional: allAvaliacoes.length,
      },
      update: {
        total_cotacoes_recebidas_classificacao_bid_frete_internacional: totalRecebidas,
        total_cotacoes_respondidas_classificacao_bid_frete_internacional: totalRespondidas,
        total_cotacoes_aprovadas_classificacao_bid_frete_internacional: totalAprovadas,
        taxa_resposta_classificacao_bid_frete_internacional: taxaResposta,
        taxa_aprovacao_classificacao_bid_frete_internacional: taxaAprovacao,
        tempo_medio_resposta_horas_classificacao_bid_frete_internacional: tempoMedio,
        nota_global_classificacao_bid_frete_internacional: Math.min(5, Math.max(0, ratingGlobal)),
        media_frete_classificacao_bid_frete_internacional: mediaFrete,
        media_atendimento_classificacao_bid_frete_internacional: mediaAtendimento,
        media_resposta_classificacao_bid_frete_internacional: mediaResposta,
        media_confiabilidade_classificacao_bid_frete_internacional: mediaConfiabilidade,
        total_avaliacoes_classificacao_bid_frete_internacional: allAvaliacoes.length,
      },
    })

    return { nota_global_classificacao_bid_frete_internacional: ratingGlobal, email_fornecedor_classificacao_bid_frete_internacional: fornecedorEmail }
  },
}

function calcularMedia(avaliacoes: Array<Record<string, unknown>>, campo: string): number {
  const notas = avaliacoes
    .filter((a: Record<string, unknown>) => a[campo] != null)
    .map((a: Record<string, unknown>) => a[campo] as number)
  return notas.length > 0 ? notas.reduce((a: number, b: number) => a + b, 0) / notas.length : 0
}
