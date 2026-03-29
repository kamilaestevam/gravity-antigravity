/**
 * Testes unitarios — BID Frete / savingsEngine v2
 * Testa calculo de metricas de savings: totais, medias, filtros
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPrisma = {
  saving: {
    findMany: vi.fn(),
  },
}

vi.mock('@prisma/client', () => ({ PrismaClient: vi.fn(() => mockPrisma) }))

import { savingsEngine } from '../../../produto/bid-frete/server/src/services/savingsEngine.js'

describe('savingsEngine.calcularMetricas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve calcular metricas de savings corretamente', async () => {
    mockPrisma.saving.findMany.mockResolvedValue([
      { saving_vs_target: 500, saving_vs_media: 200, valor_aprovado: 3000, saving_percentual: 14.3 },
      { saving_vs_target: 1000, saving_vs_media: 400, valor_aprovado: 2500, saving_percentual: 28.6 },
      { saving_vs_target: null, saving_vs_media: 100, valor_aprovado: 4000, saving_percentual: 3.2 },
    ])

    const result = await savingsEngine.calcularMetricas(mockPrisma as any)

    expect(result.total_cotacoes_aprovadas).toBe(3)
    expect(result.total_saving_vs_target).toBe(1500) // 500 + 1000 (null ignorado)
    expect(result.total_saving_vs_media).toBe(700) // 200 + 400 + 100
    expect(result.total_valor_aprovado).toBe(9500) // 3000 + 2500 + 4000
    expect(result.media_saving_percentual).toBeCloseTo(15.37, 1) // (14.3+28.6+3.2)/3
  })

  it('deve retornar zeros quando nao ha savings', async () => {
    mockPrisma.saving.findMany.mockResolvedValue([])

    const result = await savingsEngine.calcularMetricas(mockPrisma as any)

    expect(result.total_cotacoes_aprovadas).toBe(0)
    expect(result.total_saving_vs_target).toBe(0)
    expect(result.total_saving_vs_media).toBe(0)
    expect(result.total_valor_aprovado).toBe(0)
    expect(result.media_saving_percentual).toBe(0)
  })

  it('deve retornar moeda USD como padrao', async () => {
    mockPrisma.saving.findMany.mockResolvedValue([])

    const result = await savingsEngine.calcularMetricas(mockPrisma as any)

    expect(result.moeda).toBe('USD')
  })

  it('deve filtrar por company_id', async () => {
    mockPrisma.saving.findMany.mockResolvedValue([])

    await savingsEngine.calcularMetricas(mockPrisma as any, { company_id: 'comp-1' })

    expect(mockPrisma.saving.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ company_id: 'comp-1' }),
      })
    )
  })

  it('deve filtrar por periodo de datas', async () => {
    const inicio = new Date('2026-01-01')
    const fim = new Date('2026-03-31')
    mockPrisma.saving.findMany.mockResolvedValue([])

    await savingsEngine.calcularMetricas(mockPrisma as any, { data_inicio: inicio, data_fim: fim })

    expect(mockPrisma.saving.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          created_at: { gte: inicio, lte: fim },
        }),
      })
    )
  })

  it('deve filtrar por data_inicio sem data_fim', async () => {
    const inicio = new Date('2026-01-01')
    mockPrisma.saving.findMany.mockResolvedValue([])

    await savingsEngine.calcularMetricas(mockPrisma as any, { data_inicio: inicio })

    const call = mockPrisma.saving.findMany.mock.calls[0][0]
    expect(call.where.created_at.gte).toEqual(inicio)
    expect(call.where.created_at.lte).toBeUndefined()
  })

  it('deve filtrar por data_fim sem data_inicio', async () => {
    const fim = new Date('2026-03-31')
    mockPrisma.saving.findMany.mockResolvedValue([])

    await savingsEngine.calcularMetricas(mockPrisma as any, { data_fim: fim })

    const call = mockPrisma.saving.findMany.mock.calls[0][0]
    expect(call.where.created_at.lte).toEqual(fim)
    expect(call.where.created_at.gte).toBeUndefined()
  })

  it('deve sempre filtrar por product_id bid-frete', async () => {
    mockPrisma.saving.findMany.mockResolvedValue([])

    await savingsEngine.calcularMetricas(mockPrisma as any)

    expect(mockPrisma.saving.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ product_id: 'bid-frete' }),
      })
    )
  })

  it('deve combinar filtros company_id e datas', async () => {
    const inicio = new Date('2026-01-01')
    const fim = new Date('2026-03-31')
    mockPrisma.saving.findMany.mockResolvedValue([])

    await savingsEngine.calcularMetricas(mockPrisma as any, {
      company_id: 'comp-1',
      data_inicio: inicio,
      data_fim: fim,
    })

    const call = mockPrisma.saving.findMany.mock.calls[0][0]
    expect(call.where.product_id).toBe('bid-frete')
    expect(call.where.company_id).toBe('comp-1')
    expect(call.where.created_at).toEqual({ gte: inicio, lte: fim })
  })

  it('deve somar saving_vs_media incluindo valores zero', async () => {
    mockPrisma.saving.findMany.mockResolvedValue([
      { saving_vs_target: 100, saving_vs_media: 0, valor_aprovado: 5000, saving_percentual: 2.0 },
      { saving_vs_target: 200, saving_vs_media: 50, valor_aprovado: 4800, saving_percentual: 4.0 },
    ])

    const result = await savingsEngine.calcularMetricas(mockPrisma as any)

    expect(result.total_saving_vs_media).toBe(50) // 0 + 50
  })

  it('deve tratar saving_vs_media null como zero', async () => {
    mockPrisma.saving.findMany.mockResolvedValue([
      { saving_vs_target: 100, saving_vs_media: null, valor_aprovado: 5000, saving_percentual: 2.0 },
    ])

    const result = await savingsEngine.calcularMetricas(mockPrisma as any)

    expect(result.total_saving_vs_media).toBe(0)
  })

  it('deve calcular media percentual com um unico registro', async () => {
    mockPrisma.saving.findMany.mockResolvedValue([
      { saving_vs_target: 1000, saving_vs_media: 500, valor_aprovado: 4000, saving_percentual: 20.0 },
    ])

    const result = await savingsEngine.calcularMetricas(mockPrisma as any)

    expect(result.media_saving_percentual).toBe(20.0)
    expect(result.total_cotacoes_aprovadas).toBe(1)
  })

  it('deve tratar saving_percentual null como zero na media', async () => {
    mockPrisma.saving.findMany.mockResolvedValue([
      { saving_vs_target: null, saving_vs_media: 100, valor_aprovado: 5000, saving_percentual: null },
      { saving_vs_target: 500, saving_vs_media: 200, valor_aprovado: 4500, saving_percentual: 10.0 },
    ])

    const result = await savingsEngine.calcularMetricas(mockPrisma as any)

    // (0 + 10.0) / 2 = 5.0
    expect(result.media_saving_percentual).toBeCloseTo(5.0, 1)
  })
})
