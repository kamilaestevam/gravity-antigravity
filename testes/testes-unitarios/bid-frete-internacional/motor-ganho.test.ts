import { describe, it, expect, vi } from 'vitest'
import { motorGanho } from '../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-ganho'
import type { PrismaClient } from '@prisma/client'

describe('motorGanho — Motor de Ganhos e Savings', () => {
  it('deve calcular corretamente as métricas quando houver registros', async () => {
    // Arrange: Mock PrismaClient and findMany output
    const mockFindMany = vi.fn().mockResolvedValue([
      {
        ganho_vs_meta_ganho_bid_frete_internacional: 1500,
        ganho_vs_media_ganho_bid_frete_internacional: 2000,
        valor_aprovado_ganho_bid_frete_internacional: 12000,
        ganho_percentual_ganho_bid_frete_internacional: 15,
      },
      {
        ganho_vs_meta_ganho_bid_frete_internacional: 800,
        ganho_vs_media_ganho_bid_frete_internacional: 1200,
        valor_aprovado_ganho_bid_frete_internacional: 8500,
        ganho_percentual_ganho_bid_frete_internacional: 20,
      },
      {
        ganho_vs_meta_ganho_bid_frete_internacional: null, // edge case: null saving target
        ganho_vs_media_ganho_bid_frete_internacional: 500,
        valor_aprovado_ganho_bid_frete_internacional: 5000,
        ganho_percentual_ganho_bid_frete_internacional: 10,
      }
    ])

    const mockPrisma = {
      bidFreteInternacionalGanho: {
        findMany: mockFindMany
      }
    } as unknown as PrismaClient

    // Act
    const result = await motorGanho.calcularMetricas(mockPrisma, {
      id_workspace: 'workspace-123',
      data_inicio: new Date('2026-01-01'),
      data_fim: new Date('2026-12-31')
    })

    // Assert
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        id_produto_gravity: 'bid-frete-internacional',
        id_workspace: 'workspace-123',
        created_at: {
          gte: expect.any(Date),
          lte: expect.any(Date)
        }
      }
    })

    expect(result.total_cotacoes_aprovadas_classificacao_bid_frete_internacional).toBe(3)
    expect(result.total_saving_vs_target).toBe(2300) // 1500 + 800 + 0
    expect(result.total_saving_vs_media).toBe(3700) // 2000 + 1200 + 500
    expect(result.total_valor_aprovado).toBe(25500) // 12000 + 8500 + 5000
    expect(result.media_saving_percentual).toBe(15) // (15 + 20 + 10) / 3
    expect(result.moeda_ganho_bid_frete_internacional).toBe('USD')
  })

  it('deve retornar métricas zeradas se não houver registros', async () => {
    // Arrange
    const mockFindMany = vi.fn().mockResolvedValue([])
    const mockPrisma = {
      bidFreteInternacionalGanho: {
        findMany: mockFindMany
      }
    } as unknown as PrismaClient

    // Act
    const result = await motorGanho.calcularMetricas(mockPrisma)

    // Assert
    expect(result.total_cotacoes_aprovadas_classificacao_bid_frete_internacional).toBe(0)
    expect(result.total_saving_vs_target).toBe(0)
    expect(result.total_saving_vs_media).toBe(0)
    expect(result.total_valor_aprovado).toBe(0)
    expect(result.media_saving_percentual).toBe(0)
  })
})
