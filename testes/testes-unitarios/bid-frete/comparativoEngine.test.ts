/**
 * Testes unitarios — BID Frete / comparativoEngine v2
 * Testa ranking por preco, transit time, avaliacao, calculo de saving e fluxo de aprovacao/rejeicao
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPrisma = {
  cotacao: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  bidResponse: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  ratingFornecedor: {
    findMany: vi.fn(),
  },
  saving: {
    create: vi.fn(),
  },
}

vi.mock('@prisma/client', () => ({ PrismaClient: vi.fn(() => mockPrisma) }))

import { comparativoEngine } from '../../../produto/bid-frete/server/src/services/comparativoEngine.js'

// ─── Dados base para testes ─────────────────────────────────────────────────

const cotacaoBase = {
  id: 'cot-001',
  valor_target: 5000,
  moeda_target: 'USD',
  company_id: 'comp-1',
}

const respostasBase = [
  {
    id: 'resp-1',
    fornecedor: { id: 'f1', nome: 'Agente A', tipo: 'AGENTE_CARGA', email: 'a@test.com' },
    valor_total: 3000,
    valor_frete: 2500,
    taxas_origem: 200,
    taxas_destino: 300,
    transit_time_dias: 35,
    free_time_dias: 14,
    moeda: 'USD',
    transbordos: 1,
    validade_cotacao: '2026-04-30',
    via_tabela_padrao: false,
    via_api: false,
    detalhes_taxas: [],
  },
  {
    id: 'resp-2',
    fornecedor: { id: 'f2', nome: 'Armador B', tipo: 'ARMADOR', email: 'b@test.com' },
    valor_total: 2500,
    valor_frete: 2000,
    taxas_origem: 200,
    taxas_destino: 300,
    transit_time_dias: 40,
    free_time_dias: 10,
    moeda: 'USD',
    transbordos: 2,
    validade_cotacao: '2026-04-30',
    via_tabela_padrao: false,
    via_api: false,
    detalhes_taxas: [],
  },
  {
    id: 'resp-3',
    fornecedor: { id: 'f3', nome: 'Cia Aerea C', tipo: 'CIA_AEREA', email: 'c@test.com' },
    valor_total: 4000,
    valor_frete: 3500,
    taxas_origem: 200,
    taxas_destino: 300,
    transit_time_dias: 5,
    free_time_dias: null,
    moeda: 'USD',
    transbordos: 0,
    validade_cotacao: '2026-04-30',
    via_tabela_padrao: false,
    via_api: false,
    detalhes_taxas: [],
  },
]

// ─── ranquear ───────────────────────────────────────────────────────────────

describe('comparativoEngine.ranquear', () => {
  beforeEach(() => vi.clearAllMocks())

  function setupMocks(opts?: { cotacao?: unknown; responses?: unknown[]; ratings?: unknown[] }) {
    mockPrisma.cotacao.findFirst.mockResolvedValue(opts?.cotacao ?? cotacaoBase)
    mockPrisma.bidResponse.findMany.mockResolvedValue(opts?.responses ?? respostasBase)
    mockPrisma.ratingFornecedor.findMany.mockResolvedValue(opts?.ratings ?? [])
    mockPrisma.bidResponse.update.mockResolvedValue({})
  }

  it('deve ranquear por preco corretamente (menor valor = posicao 1)', async () => {
    setupMocks()

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    expect(result.ranking).toHaveLength(3)

    const armadorB = result.ranking.find(r => r.fornecedor_nome === 'Armador B')
    expect(armadorB?.ranking_preco).toBe(1)
    expect(armadorB?.tags).toContain('MELHOR_PRECO')

    const agenteA = result.ranking.find(r => r.fornecedor_nome === 'Agente A')
    expect(agenteA?.ranking_preco).toBe(2)

    const ciaC = result.ranking.find(r => r.fornecedor_nome === 'Cia Aerea C')
    expect(ciaC?.ranking_preco).toBe(3)
  })

  it('deve ranquear por transit time (menor dias = posicao 1)', async () => {
    setupMocks()

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    const ciaC = result.ranking.find(r => r.fornecedor_nome === 'Cia Aerea C')
    expect(ciaC?.ranking_transit).toBe(1)
    expect(ciaC?.tags).toContain('MELHOR_TRANSIT')

    const agenteA = result.ranking.find(r => r.fornecedor_nome === 'Agente A')
    expect(agenteA?.ranking_transit).toBe(2)

    const armadorB = result.ranking.find(r => r.fornecedor_nome === 'Armador B')
    expect(armadorB?.ranking_transit).toBe(3)
  })

  it('deve calcular ranking geral com pesos: 40% preco, 30% transit, 30% avaliacao', async () => {
    setupMocks()

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    for (const r of result.ranking) {
      const expected = Math.round(r.ranking_preco * 0.4 + r.ranking_transit * 0.3 + r.ranking_avaliacao * 0.3)
      expect(r.ranking_geral).toBe(expected)
    }
  })

  it('deve ordenar ranking final por ranking_geral', async () => {
    setupMocks()

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    for (let i = 1; i < result.ranking.length; i++) {
      expect(result.ranking[i].ranking_geral).toBeGreaterThanOrEqual(result.ranking[i - 1].ranking_geral)
    }
  })

  it('deve calcular saving vs target corretamente', async () => {
    setupMocks()

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    // Melhor preco (ranking[0]) vs target (5000)
    const melhorPreco = result.ranking[0].valor_total
    expect(result.saving.vs_target).toBe(5000 - melhorPreco)
    expect(result.saving.percentual).toBeCloseTo(((5000 - melhorPreco) / 5000) * 100, 1)
  })

  it('deve calcular saving vs media quando nao ha target', async () => {
    setupMocks({ cotacao: { ...cotacaoBase, valor_target: null } })

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    expect(result.saving.vs_target).toBeNull()
    // Media = (3000+2500+4000)/3 = 3166.67, melhor = primeiro no ranking geral
    expect(result.saving.vs_media).toBeGreaterThan(0)
    expect(result.saving.percentual).toBeGreaterThan(0)
  })

  it('deve retornar ranking vazio se nao ha respostas', async () => {
    setupMocks({ responses: [] })

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    expect(result.ranking).toHaveLength(0)
    expect(result.saving.vs_target).toBeNull()
    expect(result.saving.vs_media).toBeNull()
    expect(result.saving.percentual).toBeNull()
  })

  it('deve lancar erro quando cotacao nao e encontrada', async () => {
    mockPrisma.cotacao.findFirst.mockResolvedValue(null)

    await expect(
      comparativoEngine.ranquear(mockPrisma as any, 'invalid-id')
    ).rejects.toThrow('Cotacao nao encontrada')
  })

  it('deve incluir rating global quando disponivel', async () => {
    setupMocks({
      ratings: [
        { fornecedor_email: 'a@test.com', rating_global: 4.5 },
        { fornecedor_email: 'b@test.com', rating_global: 3.2 },
      ],
    })

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    const agenteA = result.ranking.find(r => r.fornecedor_nome === 'Agente A')
    expect(agenteA?.rating_global).toBe(4.5)

    const armadorB = result.ranking.find(r => r.fornecedor_nome === 'Armador B')
    expect(armadorB?.rating_global).toBe(3.2)

    const ciaC = result.ranking.find(r => r.fornecedor_nome === 'Cia Aerea C')
    expect(ciaC?.rating_global).toBeNull()
  })

  it('deve marcar MELHOR_AVALIACAO no fornecedor com maior rating', async () => {
    setupMocks({
      ratings: [
        { fornecedor_email: 'a@test.com', rating_global: 4.5 },
        { fornecedor_email: 'b@test.com', rating_global: 3.2 },
        { fornecedor_email: 'c@test.com', rating_global: 2.0 },
      ],
    })

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    const agenteA = result.ranking.find(r => r.fornecedor_nome === 'Agente A')
    expect(agenteA?.tags).toContain('MELHOR_AVALIACAO')
  })

  it('deve atualizar rankings no banco para cada resposta', async () => {
    setupMocks()

    await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    expect(mockPrisma.bidResponse.update).toHaveBeenCalledTimes(3)
  })

  it('deve preservar dados originais de cada resposta no ranking', async () => {
    setupMocks()

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    const armadorB = result.ranking.find(r => r.fornecedor_nome === 'Armador B')
    expect(armadorB?.valor_frete).toBe(2000)
    expect(armadorB?.taxas_origem).toBe(200)
    expect(armadorB?.taxas_destino).toBe(300)
    expect(armadorB?.transit_time_dias).toBe(40)
    expect(armadorB?.moeda).toBe('USD')
    expect(armadorB?.transbordos).toBe(2)
    expect(armadorB?.fornecedor_tipo).toBe('ARMADOR')
  })

  it('deve retornar a cotacao original no resultado', async () => {
    setupMocks()

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    expect(result.cotacao).toEqual(cotacaoBase)
  })

  it('deve funcionar com uma unica resposta', async () => {
    setupMocks({ responses: [respostasBase[0]] })

    const result = await comparativoEngine.ranquear(mockPrisma as any, 'cot-001')

    expect(result.ranking).toHaveLength(1)
    expect(result.ranking[0].ranking_preco).toBe(1)
    expect(result.ranking[0].ranking_transit).toBe(1)
    expect(result.ranking[0].tags).toContain('MELHOR_PRECO')
    expect(result.ranking[0].tags).toContain('MELHOR_TRANSIT')
  })
})

// ─── aprovar ────────────────────────────────────────────────────────────────

describe('comparativoEngine.aprovar', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve aprovar resposta e calcular saving vs target', async () => {
    mockPrisma.bidResponse.findFirst.mockResolvedValue({
      id: 'resp-1', cotacao_id: 'cot-001', fornecedor_id: 'f1', valor_total: 3000, moeda: 'USD',
    })
    mockPrisma.cotacao.findFirst.mockResolvedValue({
      id: 'cot-001', valor_target: 5000, company_id: 'comp-1',
    })
    mockPrisma.bidResponse.update.mockResolvedValue({})
    mockPrisma.bidResponse.updateMany.mockResolvedValue({})
    mockPrisma.bidResponse.findMany.mockResolvedValue([
      { valor_total: 3000 }, { valor_total: 4000 },
    ])
    mockPrisma.cotacao.update.mockResolvedValue({})
    mockPrisma.saving.create.mockResolvedValue({})

    const result = await comparativoEngine.aprovar(mockPrisma as any, 'cot-001', 'resp-1', 'user-1')

    expect(result.approved).toBe(true)
    // Saving = (5000-3000)/5000 * 100 = 40%
    expect(result.saving_percentual).toBe(40)
  })

  it('deve atualizar cotacao com status APROVADA e fornecedor vencedor', async () => {
    mockPrisma.bidResponse.findFirst.mockResolvedValue({
      id: 'resp-1', cotacao_id: 'cot-001', fornecedor_id: 'f1', valor_total: 3000, moeda: 'USD',
    })
    mockPrisma.cotacao.findFirst.mockResolvedValue({
      id: 'cot-001', valor_target: 5000, company_id: 'comp-1',
    })
    mockPrisma.bidResponse.update.mockResolvedValue({})
    mockPrisma.bidResponse.updateMany.mockResolvedValue({})
    mockPrisma.bidResponse.findMany.mockResolvedValue([{ valor_total: 3000 }])
    mockPrisma.cotacao.update.mockResolvedValue({})
    mockPrisma.saving.create.mockResolvedValue({})

    await comparativoEngine.aprovar(mockPrisma as any, 'cot-001', 'resp-1', 'user-1')

    expect(mockPrisma.cotacao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cot-001' },
        data: expect.objectContaining({
          status: 'APROVADA',
          fornecedor_vencedor_id: 'f1',
        }),
      })
    )
  })

  it('deve reprovar todas as outras respostas', async () => {
    mockPrisma.bidResponse.findFirst.mockResolvedValue({
      id: 'resp-1', cotacao_id: 'cot-001', fornecedor_id: 'f1', valor_total: 3000, moeda: 'USD',
    })
    mockPrisma.cotacao.findFirst.mockResolvedValue({
      id: 'cot-001', valor_target: 5000, company_id: 'comp-1',
    })
    mockPrisma.bidResponse.update.mockResolvedValue({})
    mockPrisma.bidResponse.updateMany.mockResolvedValue({})
    mockPrisma.bidResponse.findMany.mockResolvedValue([{ valor_total: 3000 }])
    mockPrisma.cotacao.update.mockResolvedValue({})
    mockPrisma.saving.create.mockResolvedValue({})

    await comparativoEngine.aprovar(mockPrisma as any, 'cot-001', 'resp-1', 'user-1')

    expect(mockPrisma.bidResponse.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cotacao_id: 'cot-001', id: { not: 'resp-1' } },
        data: { status: 'REPROVADA' },
      })
    )
  })

  it('deve registrar saving no banco', async () => {
    mockPrisma.bidResponse.findFirst.mockResolvedValue({
      id: 'resp-1', cotacao_id: 'cot-001', fornecedor_id: 'f1', valor_total: 3000, moeda: 'USD',
    })
    mockPrisma.cotacao.findFirst.mockResolvedValue({
      id: 'cot-001', valor_target: 5000, company_id: 'comp-1',
    })
    mockPrisma.bidResponse.update.mockResolvedValue({})
    mockPrisma.bidResponse.updateMany.mockResolvedValue({})
    mockPrisma.bidResponse.findMany.mockResolvedValue([
      { valor_total: 3000 }, { valor_total: 4000 },
    ])
    mockPrisma.cotacao.update.mockResolvedValue({})
    mockPrisma.saving.create.mockResolvedValue({})

    await comparativoEngine.aprovar(mockPrisma as any, 'cot-001', 'resp-1', 'user-1')

    expect(mockPrisma.saving.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          product_id: 'bid-frete',
          user_id: 'user-1',
          cotacao_id: 'cot-001',
          company_id: 'comp-1',
          valor_target: 5000,
          valor_aprovado: 3000,
          saving_vs_target: 2000,
          moeda: 'USD',
        }),
      })
    )
  })

  it('deve calcular saving vs media quando nao ha target', async () => {
    mockPrisma.bidResponse.findFirst.mockResolvedValue({
      id: 'resp-2', cotacao_id: 'cot-001', fornecedor_id: 'f2', valor_total: 2500, moeda: 'USD',
    })
    mockPrisma.cotacao.findFirst.mockResolvedValue({
      id: 'cot-001', valor_target: null, company_id: 'comp-1',
    })
    mockPrisma.bidResponse.update.mockResolvedValue({})
    mockPrisma.bidResponse.updateMany.mockResolvedValue({})
    mockPrisma.bidResponse.findMany.mockResolvedValue([
      { valor_total: 2500 }, { valor_total: 3000 }, { valor_total: 4000 },
    ])
    mockPrisma.cotacao.update.mockResolvedValue({})
    mockPrisma.saving.create.mockResolvedValue({})

    const result = await comparativoEngine.aprovar(mockPrisma as any, 'cot-001', 'resp-2', 'user-1')

    // Media = (2500+3000+4000)/3 = 3166.67
    // Saving pct = ((3166.67-2500)/3166.67)*100 = 21.05%
    expect(result.saving_percentual).toBeCloseTo(21.05, 0)
  })

  it('deve lancar erro quando resposta nao e encontrada', async () => {
    mockPrisma.bidResponse.findFirst.mockResolvedValue(null)

    await expect(
      comparativoEngine.aprovar(mockPrisma as any, 'cot-001', 'invalid', 'user-1')
    ).rejects.toThrow('Resposta nao encontrada')
  })

  it('deve marcar data_aprovacao na cotacao', async () => {
    mockPrisma.bidResponse.findFirst.mockResolvedValue({
      id: 'resp-1', cotacao_id: 'cot-001', fornecedor_id: 'f1', valor_total: 3000, moeda: 'USD',
    })
    mockPrisma.cotacao.findFirst.mockResolvedValue({
      id: 'cot-001', valor_target: 5000, company_id: 'comp-1',
    })
    mockPrisma.bidResponse.update.mockResolvedValue({})
    mockPrisma.bidResponse.updateMany.mockResolvedValue({})
    mockPrisma.bidResponse.findMany.mockResolvedValue([{ valor_total: 3000 }])
    mockPrisma.cotacao.update.mockResolvedValue({})
    mockPrisma.saving.create.mockResolvedValue({})

    await comparativoEngine.aprovar(mockPrisma as any, 'cot-001', 'resp-1', 'user-1')

    const updateCall = mockPrisma.cotacao.update.mock.calls[0][0]
    expect(updateCall.data.data_aprovacao).toBeInstanceOf(Date)
  })
})
