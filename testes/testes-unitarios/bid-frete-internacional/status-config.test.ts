// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Testes unitários — Status Dinâmico do BID Frete
 * Cobre: seedStatusPadrao, tipos helpers (sincronizarStatusLocal, gerarAbasStatus, obterInfoStatus)
 */

// ─── seedStatusPadrao ──────────────────────────────────────────────────────────

describe('seedStatusPadrao — Seed de status canônicos', () => {
  it('deve criar 9 status canônicos via $transaction', async () => {
    const mockCreate = vi.fn().mockResolvedValue({})
    const mockTransaction = vi.fn().mockImplementation((promises: Promise<unknown>[]) => Promise.all(promises))
    const mockPrisma = {
      statusCotacaoBidFrete: { create: mockCreate },
      $transaction: mockTransaction,
    }

    const { seedStatusPadrao } = await import(
      '../../../servicos-global/produto/bid-frete/server/src/services/seedStatusPadrao.js'
    )

    await seedStatusPadrao(mockPrisma, 'org_test_123')

    // Deve ter chamado $transaction com 9 creates
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledTimes(9)

    // Verifica que todos receberam id_organizacao
    for (const call of mockCreate.mock.calls) {
      expect(call[0].data.id_organizacao).toBe('org_test_123')
    }

    // Verifica nomes dos 9 status canônicos
    const nomes = mockCreate.mock.calls.map(
      (c) => (c[0] as { data: { nome_status_cotacao_bid_frete: string } }).data.nome_status_cotacao_bid_frete
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

  it('deve marcar RASCUNHO como padrão e gerenciado pelo sistema', async () => {
    const mockCreate = vi.fn().mockResolvedValue({})
    const mockTransaction = vi.fn().mockImplementation((promises: Promise<unknown>[]) => Promise.all(promises))
    const mockPrisma = {
      statusCotacaoBidFrete: { create: mockCreate },
      $transaction: mockTransaction,
    }

    const { seedStatusPadrao } = await import(
      '../../../servicos-global/produto/bid-frete/server/src/services/seedStatusPadrao.js'
    )

    await seedStatusPadrao(mockPrisma, 'org_abc')

    type CreateCall = [{ data: { nome_status_cotacao_bid_frete: string; padrao_status_cotacao_bid_frete: boolean; gerenciado_sistema_status_cotacao_bid_frete: boolean } }]
    const rascunhoCall = mockCreate.mock.calls.find(
      (c) => (c as CreateCall)[0].data.nome_status_cotacao_bid_frete === 'RASCUNHO'
    ) as CreateCall | undefined
    expect(rascunhoCall).toBeDefined()
    expect(rascunhoCall![0].data.padrao_status_cotacao_bid_frete).toBe(true)
    expect(rascunhoCall![0].data.gerenciado_sistema_status_cotacao_bid_frete).toBe(true)
  })

  it('deve atribuir ordens de 1 a 9 sequencialmente', async () => {
    const mockCreate = vi.fn().mockResolvedValue({})
    const mockTransaction = vi.fn().mockImplementation((promises: Promise<unknown>[]) => Promise.all(promises))
    const mockPrisma = {
      statusCotacaoBidFrete: { create: mockCreate },
      $transaction: mockTransaction,
    }

    const { seedStatusPadrao } = await import(
      '../../../servicos-global/produto/bid-frete/server/src/services/seedStatusPadrao.js'
    )

    await seedStatusPadrao(mockPrisma, 'org_xyz')

    const ordens = mockCreate.mock.calls.map(
      (c) => (c[0] as { data: { ordem_status_cotacao_bid_frete: number } }).data.ordem_status_cotacao_bid_frete
    )
    expect(ordens).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})

// ─── gerarAbasStatus ───────────────────────────────────────────────────────────

const TYPES_MODULE = '../../../servicos-global/produto/bid-frete/client/src/shared/types'

interface StatusConfig {
  nome_status_cotacao_bid_frete: string
  rotulo_status_cotacao_bid_frete: string
  cor_status_cotacao_bid_frete?: string
}

describe('gerarAbasStatus — Gera abas dinâmicas a partir do config', () => {
  it('deve incluir aba "Todas" como primeira', async () => {
    const { gerarAbasStatus } = await import(TYPES_MODULE)
    const t = (key: string, fallback?: string) => fallback ?? key

    const abas = gerarAbasStatus([], t)
    expect(abas).toHaveLength(1)
    expect(abas[0].valor).toBe('TODAS')
  })

  it('deve criar uma aba para cada status na lista', async () => {
    const { gerarAbasStatus } = await import(TYPES_MODULE)
    const t = (key: string, fallback?: string) => fallback ?? key

    const statusList: StatusConfig[] = [
      { nome_status_cotacao_bid_frete: 'RASCUNHO', rotulo_status_cotacao_bid_frete: 'Rascunho' },
      { nome_status_cotacao_bid_frete: 'APROVADA', rotulo_status_cotacao_bid_frete: 'Aprovada' },
    ]

    const abas = gerarAbasStatus(statusList, t)
    expect(abas).toHaveLength(3)
    expect(abas[1].valor).toBe('RASCUNHO')
    expect(abas[1].label).toBe('Rascunho')
    expect(abas[2].valor).toBe('APROVADA')
    expect(abas[2].label).toBe('Aprovada')
  })
})

// ─── obterInfoStatus ───────────────────────────────────────────────────────────

describe('obterInfoStatus — Resolve rótulo e cor de um status', () => {
  it('deve retornar dados do config quando encontrado', async () => {
    const { obterInfoStatus } = await import(TYPES_MODULE)

    const config: StatusConfig[] = [
      {
        nome_status_cotacao_bid_frete: 'APROVADA',
        rotulo_status_cotacao_bid_frete: 'Aprovada Custom',
        cor_status_cotacao_bid_frete: '#00ff00',
      },
    ]

    const info = obterInfoStatus('APROVADA', config)
    expect(info.rotulo).toBe('Aprovada Custom')
    expect(info.cor).toBe('#00ff00')
  })

  it('deve retornar fallback hardcoded quando status nao encontrado no config', async () => {
    const { obterInfoStatus } = await import(TYPES_MODULE)

    const info = obterInfoStatus('APROVADA', [])
    expect(info.rotulo).toBe('Aprovada')
    expect(info.cor).toBeTruthy()
  })

  it('deve retornar o proprio nome quando status desconhecido e sem config', async () => {
    const { obterInfoStatus } = await import(TYPES_MODULE)

    const info = obterInfoStatus('STATUS_INVENTADO', [])
    expect(info.rotulo).toBe('STATUS_INVENTADO')
    expect(info.cor).toBe('#64748b') // default
  })
})
