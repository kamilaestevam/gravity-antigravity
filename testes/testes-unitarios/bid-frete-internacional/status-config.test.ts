// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'

const SEED_MODULE =
  '../../../servicos-global/produto/bid-frete-internacional/server/src/services/seedStatusPadrao.js'

describe('seedStatusPadrao — Seed de status canônicos (BID Frete Internacional)', () => {
  it('deve criar 9 status canônicos via $transaction', async () => {
    const mockCreate = vi.fn().mockResolvedValue({})
    const mockTransaction = vi.fn().mockImplementation((promises: Promise<unknown>[]) => Promise.all(promises))
    const mockPrisma = {
      statusCotacaoConfigBidFreteInternacional: { create: mockCreate },
      $transaction: mockTransaction,
    }

    const { seedStatusPadrao } = await import(SEED_MODULE)
    await seedStatusPadrao(mockPrisma as never, 'org_test_123')

    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledTimes(9)

    for (const call of mockCreate.mock.calls) {
      expect(call[0].data.id_organizacao).toBe('org_test_123')
    }

    const nomes = mockCreate.mock.calls.map(
      (c) =>
        (c[0] as { data: { nome_status_cotacao_config_bid_frete_internacional: string } }).data
          .nome_status_cotacao_config_bid_frete_internacional,
    )
    expect(nomes).toContain('RASCUNHO')
    expect(nomes).toContain('ENVIADA_FORNECEDORES')
    expect(nomes).toContain('EM_COTACAO')
    expect(nomes).toContain('AGUARDANDO_APROVACAO')
    expect(nomes).toContain('APROVADA')
    expect(nomes).toContain('REPROVADA')
    expect(nomes).toContain('CANCELADA')
    expect(nomes).toContain('FALTA_INFORMACAO')
    expect(nomes).toContain('EXPIRADA')
  })

  it('deve marcar RASCUNHO como padrão', async () => {
    const mockCreate = vi.fn().mockResolvedValue({})
    const mockTransaction = vi.fn().mockImplementation((promises: Promise<unknown>[]) => Promise.all(promises))
    const mockPrisma = {
      statusCotacaoConfigBidFreteInternacional: { create: mockCreate },
      $transaction: mockTransaction,
    }

    const { seedStatusPadrao } = await import(SEED_MODULE)
    await seedStatusPadrao(mockPrisma as never, 'org_abc')

    type CreateCall = [
      {
        data: {
          nome_status_cotacao_config_bid_frete_internacional: string
          padrao_status_cotacao_config_bid_frete_internacional: boolean
          gerenciado_sistema_status_cotacao_config_bid_frete_internacional: boolean
        }
      },
    ]
    const rascunhoCall = mockCreate.mock.calls.find(
      (c) =>
        (c as CreateCall)[0].data.nome_status_cotacao_config_bid_frete_internacional === 'RASCUNHO',
    ) as CreateCall | undefined

    expect(rascunhoCall).toBeDefined()
    expect(rascunhoCall![0].data.padrao_status_cotacao_config_bid_frete_internacional).toBe(true)
  })

  it('deve atribuir ordens de 1 a 9 sequencialmente', async () => {
    const mockCreate = vi.fn().mockResolvedValue({})
    const mockTransaction = vi.fn().mockImplementation((promises: Promise<unknown>[]) => Promise.all(promises))
    const mockPrisma = {
      statusCotacaoConfigBidFreteInternacional: { create: mockCreate },
      $transaction: mockTransaction,
    }

    const { seedStatusPadrao } = await import(SEED_MODULE)
    await seedStatusPadrao(mockPrisma as never, 'org_xyz')

    const ordens = mockCreate.mock.calls.map(
      (c) =>
        (c[0] as { data: { ordem_status_cotacao_config_bid_frete_internacional: number } }).data
          .ordem_status_cotacao_config_bid_frete_internacional,
    )
    expect(ordens).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})
