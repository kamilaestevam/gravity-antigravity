import { describe, it, expect, vi } from 'vitest'
import { motorClassificacao } from '../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-classificacao'
import type { PrismaClient } from '@prisma/client'

describe('motorClassificacao — Motor de Avaliação e Rating', () => {
  it('deve recalcular a classificação global corretamente com base nas cotações e avaliações manuais', async () => {
    // Arrange: Mock Prisma data
    const mockFindManyRequests = vi.fn().mockResolvedValue([
      { status_pedido_cotacao_bid_frete_internacional: 'RESPONDIDO', data_envio_pedido_cotacao_bid_frete_internacional: '2026-05-20T10:00:00Z', data_resposta_pedido_cotacao_bid_frete_internacional: '2026-05-20T18:00:00Z' }, // 8 horas
      { status_pedido_cotacao_bid_frete_internacional: 'RESPONDIDO', data_envio_pedido_cotacao_bid_frete_internacional: '2026-05-19T08:00:00Z', data_resposta_pedido_cotacao_bid_frete_internacional: '2026-05-20T08:00:00Z' }, // 24 horas
      { status_pedido_cotacao_bid_frete_internacional: 'PENDENTE', data_envio_pedido_cotacao_bid_frete_internacional: '2026-05-21T08:00:00Z', data_resposta_pedido_cotacao_bid_frete_internacional: null }
    ])

    const mockFindManyResponses = vi.fn().mockResolvedValue([
      { status_proposta_bid_frete_internacional: 'APROVADA' },
      { status_proposta_bid_frete_internacional: 'REJEITADA' }
    ])

    const mockFindManyAvaliacoes = vi.fn().mockResolvedValue([
      { nota_frete_avaliacao_bid_frete_internacional: 4, nota_atendimento_avaliacao_bid_frete_internacional: 5, nota_resposta_avaliacao_bid_frete_internacional: 4, nota_confiabilidade_avaliacao_bid_frete_internacional: 5 },
      { nota_frete_avaliacao_bid_frete_internacional: 3, nota_atendimento_avaliacao_bid_frete_internacional: 4, nota_resposta_avaliacao_bid_frete_internacional: 3, nota_confiabilidade_avaliacao_bid_frete_internacional: 4 }
    ])

    const mockUpsert = vi.fn().mockResolvedValue({})

    const mockPrisma = {
      bidFreteInternacionalPedidoCotacao: {
        findMany: mockFindManyRequests
      },
      bidFreteInternacionalProposta: {
        findMany: mockFindManyResponses
      },
      bidFreteInternacionalAvaliacao: {
        findMany: mockFindManyAvaliacoes
      },
      bidFreteInternacionalClassificacao: {
        upsert: mockUpsert
      }
    } as unknown as PrismaClient

    // Act
    const result = await motorClassificacao.recalcular(mockPrisma, 'fornecedor@globalfrete.com')

    // Assert
    expect(result.email_fornecedor_classificacao_bid_frete_internacional).toBe('fornecedor@globalfrete.com')
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { email_fornecedor_classificacao_bid_frete_internacional: 'fornecedor@globalfrete.com' },
      create: expect.objectContaining({
        email_fornecedor_classificacao_bid_frete_internacional: 'fornecedor@globalfrete.com',
        total_cotacoes_recebidas_classificacao_bid_frete_internacional: 3,
        total_cotacoes_respondidas_classificacao_bid_frete_internacional: 2,
        total_cotacoes_aprovadas_classificacao_bid_frete_internacional: 1,
        nota_global_classificacao_bid_frete_internacional: expect.any(Number)
      }),
      update: expect.objectContaining({
        total_cotacoes_recebidas_classificacao_bid_frete_internacional: 3,
        total_cotacoes_respondidas_classificacao_bid_frete_internacional: 2,
        total_cotacoes_aprovadas_classificacao_bid_frete_internacional: 1
      })
    })

    // Calculated values verification:
    // taxaResposta = (2 / 3) * 100 = 66.67%
    // taxaAprovacao = (1 / 2) * 100 = 50%
    // tempoMedio = (8 + 24) / 2 = 16 horas
    // scoreAuto = (0.6667 * 2) + (0.50 * 2) + 1.0 (since 16h < 24h) = 1.3333 + 1.0 + 1.0 = 3.3333
    // mediaFrete = (4 + 3) / 2 = 3.5
    // mediaAtendimento = (5 + 4) / 2 = 4.5
    // mediaResposta = (4 + 3) / 2 = 3.5
    // mediaConfiabilidade = (5 + 4) / 2 = 4.5
    // scoreManual = (3.5 + 4.5 + 3.5 + 4.5) / 4 = 4.0
    // ratingGlobal = scoreAuto * 0.4 + scoreManual * 0.6 = (3.3333 * 0.4) + (4.0 * 0.6) = 1.3333 + 2.4 = 3.7333
    expect(result.nota_global_classificacao_bid_frete_internacional).toBeCloseTo(3.73, 2)
  })
})
