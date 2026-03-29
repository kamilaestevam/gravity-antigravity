/**
 * Testes unitarios — BID Frete / monetizacao v2
 * Testa cobranca por frete fechado, free tier e resumo do fornecedor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('axios', () => ({ default: { post: vi.fn(), get: vi.fn() } }))

const mockPrisma = {
  bidResponse: { count: vi.fn() },
}

vi.mock('@prisma/client', () => ({ PrismaClient: vi.fn(() => mockPrisma) }))

import { monetizacao } from '../../../produto/bid-frete/server/src/services/monetizacao.js'

// ─── registrarCobranca ──────────────────────────────────────────────────────

describe('monetizacao.registrarCobranca', () => {
  beforeEach(() => vi.clearAllMocks())

  const base = {
    fornecedor_id: 'f1',
    fornecedor_email: 'test@forn.com',
    cotacao_id: 'cot-1',
    cotacao_numero: 'BID-20260328-0001',
    valor_frete_aprovado: 3000,
    tenant_id: 'tenant-1',
  }

  it('deve isentar dentro do free tier (primeiras 10 cotacoes)', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(5) // 5 cotacoes fechadas

    const result = await monetizacao.registrarCobranca(mockPrisma as any, base)

    expect(result.status).toBe('ISENTA')
    expect(result.taxa_cobrada).toBe(0)
    expect(result.motivo_isencao).toContain('Free tier')
  })

  it('deve isentar no limite exato do free tier (10 cotacoes)', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(10) // exatamente 10

    const result = await monetizacao.registrarCobranca(mockPrisma as any, base)

    expect(result.status).toBe('ISENTA')
    expect(result.taxa_cobrada).toBe(0)
  })

  it('deve cobrar USD 5.00 apos free tier', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(15) // acima do free tier

    const result = await monetizacao.registrarCobranca(mockPrisma as any, base)

    expect(result.status).toBe('PENDENTE')
    expect(result.taxa_cobrada).toBe(5.00)
    expect(result.moeda).toBe('USD')
  })

  it('deve cobrar na 11a cotacao (borda do free tier)', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(11)

    const result = await monetizacao.registrarCobranca(mockPrisma as any, base)

    expect(result.status).toBe('PENDENTE')
    expect(result.taxa_cobrada).toBe(5.00)
  })

  it('deve retornar todos os campos da cobranca', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(20)

    const result = await monetizacao.registrarCobranca(mockPrisma as any, base)

    expect(result.fornecedor_id).toBe('f1')
    expect(result.fornecedor_email).toBe('test@forn.com')
    expect(result.cotacao_id).toBe('cot-1')
    expect(result.cotacao_numero).toBe('BID-20260328-0001')
    expect(result.valor_frete_aprovado).toBe(3000)
    expect(result.moeda).toBe('USD')
  })

  it('deve contar apenas respostas APROVADAS para verificar free tier', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(0)

    await monetizacao.registrarCobranca(mockPrisma as any, base)

    expect(mockPrisma.bidResponse.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fornecedor_id: 'f1',
          status: 'APROVADA',
        }),
      })
    )
  })

  it('deve incluir contagem no motivo_isencao', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(7)

    const result = await monetizacao.registrarCobranca(mockPrisma as any, base)

    expect(result.motivo_isencao).toContain('7')
    expect(result.motivo_isencao).toContain('10')
  })

  it('cobranca pendente nao deve ter motivo_isencao', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(20)

    const result = await monetizacao.registrarCobranca(mockPrisma as any, base)

    expect(result.motivo_isencao).toBeUndefined()
  })

  it('deve isentar quando fornecedor tem 0 cotacoes', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(0)

    const result = await monetizacao.registrarCobranca(mockPrisma as any, base)

    expect(result.status).toBe('ISENTA')
    expect(result.taxa_cobrada).toBe(0)
  })
})

// ─── resumoFornecedor ───────────────────────────────────────────────────────

describe('monetizacao.resumoFornecedor', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve calcular resumo corretamente acima do free tier', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(25)

    const result = await monetizacao.resumoFornecedor(mockPrisma as any, 'f1')

    expect(result.total_fretes_fechados).toBe(25)
    expect(result.free_tier_restante).toBe(0) // 25 > 10
    expect(result.free_tier_total).toBe(10)
    expect(result.cobrancas_totais).toBe(15) // 25 - 10
    expect(result.taxa_unitaria_usd).toBe(5.00)
    expect(result.total_cobrado_usd).toBe(75) // 15 * 5.00
    expect(result.modelo).toBe('por_frete')
  })

  it('deve mostrar free tier restante quando abaixo do limite', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(3)

    const result = await monetizacao.resumoFornecedor(mockPrisma as any, 'f1')

    expect(result.total_fretes_fechados).toBe(3)
    expect(result.free_tier_restante).toBe(7) // 10 - 3
    expect(result.cobrancas_totais).toBe(0)
    expect(result.total_cobrado_usd).toBe(0)
  })

  it('deve retornar free_tier_restante = 0 quando exatamente no limite', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(10)

    const result = await monetizacao.resumoFornecedor(mockPrisma as any, 'f1')

    expect(result.free_tier_restante).toBe(0)
    expect(result.cobrancas_totais).toBe(0)
    expect(result.total_cobrado_usd).toBe(0)
  })

  it('deve retornar valores corretos quando fornecedor tem 0 cotacoes', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(0)

    const result = await monetizacao.resumoFornecedor(mockPrisma as any, 'f1')

    expect(result.total_fretes_fechados).toBe(0)
    expect(result.free_tier_restante).toBe(10)
    expect(result.cobrancas_totais).toBe(0)
    expect(result.total_cobrado_usd).toBe(0)
  })

  it('deve contar apenas respostas APROVADAS', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(0)

    await monetizacao.resumoFornecedor(mockPrisma as any, 'f1')

    expect(mockPrisma.bidResponse.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fornecedor_id: 'f1',
          status: 'APROVADA',
        }),
      })
    )
  })

  it('deve calcular cobrancas para volume alto', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(100)

    const result = await monetizacao.resumoFornecedor(mockPrisma as any, 'f1')

    expect(result.cobrancas_totais).toBe(90) // 100 - 10
    expect(result.total_cobrado_usd).toBe(450) // 90 * 5.00
  })

  it('deve nunca retornar free_tier_restante negativo', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(999)

    const result = await monetizacao.resumoFornecedor(mockPrisma as any, 'f1')

    expect(result.free_tier_restante).toBe(0)
    expect(result.free_tier_restante).toBeGreaterThanOrEqual(0)
  })

  it('deve nunca retornar cobrancas_totais negativo', async () => {
    mockPrisma.bidResponse.count.mockResolvedValue(0)

    const result = await monetizacao.resumoFornecedor(mockPrisma as any, 'f1')

    expect(result.cobrancas_totais).toBeGreaterThanOrEqual(0)
  })
})
