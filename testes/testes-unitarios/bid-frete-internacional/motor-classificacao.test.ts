import { describe, it, expect, vi } from 'vitest'
import { motorClassificacao } from '../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-classificacao-bid-frete-internacional'
import type { PrismaClient } from '@prisma/client'

describe('motorClassificacao — Motor de Avaliação e Rating', () => {
  it('deve recalcular a classificação global corretamente com base nas cotações e avaliações manuais', async () => {
    const mockFindManyRequests = vi.fn().mockResolvedValue([
      {
        status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
        data_envio_disparo_cotacao_bid_frete_internacional: '2026-05-20T10:00:00Z',
        data_resposta_disparo_cotacao_bid_frete_internacional: '2026-05-20T18:00:00Z',
      },
      {
        status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
        data_envio_disparo_cotacao_bid_frete_internacional: '2026-05-19T08:00:00Z',
        data_resposta_disparo_cotacao_bid_frete_internacional: '2026-05-20T08:00:00Z',
      },
      {
        status_disparo_cotacao_bid_frete_internacional: 'PENDENTE',
        data_envio_disparo_cotacao_bid_frete_internacional: '2026-05-21T08:00:00Z',
        data_resposta_disparo_cotacao_bid_frete_internacional: null,
      },
    ])

    const mockFindManyResponses = vi.fn().mockResolvedValue([
      { status_proposta_bid_frete_internacional: 'APROVADA' },
      { status_proposta_bid_frete_internacional: 'REPROVADA' },
    ])

    const mockFindManyAvaliacoes = vi.fn().mockResolvedValue([
      {
        nota_frete_avaliacao_bid_frete_internacional: 4,
        nota_atendimento_avaliacao_bid_frete_internacional: 5,
        nota_resposta_avaliacao_bid_frete_internacional: 4,
        nota_confiabilidade_avaliacao_bid_frete_internacional: 5,
      },
      {
        nota_frete_avaliacao_bid_frete_internacional: 3,
        nota_atendimento_avaliacao_bid_frete_internacional: 4,
        nota_resposta_avaliacao_bid_frete_internacional: 3,
        nota_confiabilidade_avaliacao_bid_frete_internacional: 4,
      },
    ])

    const mockUpsert = vi.fn().mockResolvedValue({
      email_fornecedor_classificacao_bid_frete_internacional: 'fornecedor@globalfrete.com',
      nota_global_classificacao_bid_frete_internacional: 3.73,
    })

    const mockPrisma = {
      disparoCotacaoBidFreteInternacional: { findMany: mockFindManyRequests },
      propostaBidFreteInternacional: { findMany: mockFindManyResponses },
      avaliacaoBidFreteInternacional: { findMany: mockFindManyAvaliacoes },
      classificacaoBidFreteInternacional: { upsert: mockUpsert },
    } as unknown as PrismaClient

    const result = await motorClassificacao.recalcular(mockPrisma, 'fornecedor@globalfrete.com')

    expect(result.email_fornecedor_classificacao_bid_frete_internacional).toBe('fornecedor@globalfrete.com')
    expect(mockUpsert).toHaveBeenCalled()
    expect(result.nota_global_classificacao_bid_frete_internacional).toBeCloseTo(3.73, 1)
  })
})
