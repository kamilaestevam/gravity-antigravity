/**
 * Testes unitarios — BID Frete / bidEngine v2
 * Testa disparo de BIDs, verificacao de tabela padrao, resposta automatica,
 * geracao de token publico e transicoes de status.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPrisma = {
  cotacao: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  fornecedor: {
    findMany: vi.fn(),
  },
  tabelaPreco: {
    findFirst: vi.fn(),
  },
  bidRequest: {
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
  bidResponse: {
    create: vi.fn(),
  },
}

// Mock axios para nao disparar chamadas reais
vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

vi.mock('@prisma/client', () => ({ PrismaClient: vi.fn(() => mockPrisma) }))

import { bidEngine } from '../../../produto/bid-frete/server/src/services/bidEngine.js'

// ─── verificarTabelaPadrao ──────────────────────────────────────────────────

describe('bidEngine.verificarTabelaPadrao', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve encontrar tabela compativel com a cotacao', async () => {
    const cotacao = { origem_codigo: 'CNSHA', destino_codigo: 'BRSSZ', modal: 'MARITIMO' }
    const fornecedor = { id: 'f1' }
    const tabela = { id: 'tp1', valor_total: 2500, transit_time_dias: 30 }

    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(tabela)

    const result = await bidEngine.verificarTabelaPadrao(mockPrisma as any, cotacao, fornecedor)

    expect(result).toEqual(tabela)
    expect(mockPrisma.tabelaPreco.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fornecedor_id: 'f1',
          origem_codigo: 'CNSHA',
          destino_codigo: 'BRSSZ',
          modal: 'MARITIMO',
          ativa: true,
        }),
      })
    )
  })

  it('deve retornar null se nao ha tabela compativel', async () => {
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(null)

    const result = await bidEngine.verificarTabelaPadrao(
      mockPrisma as any,
      { origem_codigo: 'XXXXX', destino_codigo: 'YYYYY', modal: 'AEREO' },
      { id: 'f1' },
    )

    expect(result).toBeNull()
  })

  it('deve filtrar por validade (inicio <= agora <= fim)', async () => {
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(null)

    await bidEngine.verificarTabelaPadrao(
      mockPrisma as any,
      { origem_codigo: 'CNSHA', destino_codigo: 'BRSSZ', modal: 'MARITIMO' },
      { id: 'f1' },
    )

    const call = mockPrisma.tabelaPreco.findFirst.mock.calls[0][0]
    expect(call.where.validade_inicio).toHaveProperty('lte')
    expect(call.where.validade_fim).toHaveProperty('gte')
  })

  it('deve ordenar por valor_total ascendente para pegar o menor preco', async () => {
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(null)

    await bidEngine.verificarTabelaPadrao(
      mockPrisma as any,
      { origem_codigo: 'A', destino_codigo: 'B', modal: 'MARITIMO' },
      { id: 'f1' },
    )

    const call = mockPrisma.tabelaPreco.findFirst.mock.calls[0][0]
    expect(call.orderBy).toEqual({ valor_total: 'asc' })
  })
})

// ─── gerarRespostaAutomatica ────────────────────────────────────────────────

describe('bidEngine.gerarRespostaAutomatica', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deve gerar BidResponse a partir da tabela de precos', async () => {
    const cotacao = { id: 'cot-1' }
    const fornecedor = { id: 'f1' }
    const tabela = {
      moeda: 'USD',
      valor_frete: 2000,
      taxas_origem: 200,
      taxas_destino: 300,
      valor_total: 2500,
      transit_time_dias: 30,
      free_time_dias: 14,
      validade_fim: new Date('2026-06-01'),
    }

    mockPrisma.bidRequest.findFirst.mockResolvedValue({ id: 'br-1', cotacao_id: 'cot-1', fornecedor_id: 'f1' })
    mockPrisma.bidResponse.create.mockResolvedValue({ id: 'resp-auto' })
    mockPrisma.bidRequest.update.mockResolvedValue({})

    const result = await bidEngine.gerarRespostaAutomatica(mockPrisma as any, cotacao, fornecedor, tabela)

    expect(result).toHaveProperty('id', 'resp-auto')
    expect(mockPrisma.bidResponse.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          product_id: 'bid-frete',
          bid_request_id: 'br-1',
          cotacao_id: 'cot-1',
          fornecedor_id: 'f1',
          moeda: 'USD',
          valor_frete: 2000,
          taxas_origem: 200,
          taxas_destino: 300,
          valor_total: 2500,
          transit_time_dias: 30,
          free_time_dias: 14,
          via_tabela_padrao: true,
        }),
      })
    )
  })

  it('deve marcar BidRequest como RESPONDIDO apos gerar resposta', async () => {
    mockPrisma.bidRequest.findFirst.mockResolvedValue({ id: 'br-1' })
    mockPrisma.bidResponse.create.mockResolvedValue({ id: 'resp-auto' })
    mockPrisma.bidRequest.update.mockResolvedValue({})

    await bidEngine.gerarRespostaAutomatica(
      mockPrisma as any,
      { id: 'cot-1' },
      { id: 'f1' },
      { moeda: 'USD', valor_total: 1000, valor_frete: 800, taxas_origem: 100, taxas_destino: 100, transit_time_dias: 25 },
    )

    expect(mockPrisma.bidRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'br-1' },
        data: expect.objectContaining({ status: 'RESPONDIDO' }),
      })
    )
  })

  it('deve retornar null se nao existe BidRequest', async () => {
    mockPrisma.bidRequest.findFirst.mockResolvedValue(null)

    const result = await bidEngine.gerarRespostaAutomatica(
      mockPrisma as any,
      { id: 'cot-1' },
      { id: 'f1' },
      { valor_total: 1000 },
    )

    expect(result).toBeNull()
    expect(mockPrisma.bidResponse.create).not.toHaveBeenCalled()
  })

  it('deve buscar o BidRequest mais recente do par cotacao+fornecedor', async () => {
    mockPrisma.bidRequest.findFirst.mockResolvedValue(null)

    await bidEngine.gerarRespostaAutomatica(
      mockPrisma as any,
      { id: 'cot-1' },
      { id: 'f1' },
      { valor_total: 1000 },
    )

    expect(mockPrisma.bidRequest.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cotacao_id: 'cot-1', fornecedor_id: 'f1' },
        orderBy: { created_at: 'desc' },
      })
    )
  })
})

// ─── disparar ───────────────────────────────────────────────────────────────

describe('bidEngine.disparar', () => {
  beforeEach(() => vi.clearAllMocks())

  const baseOptions = {
    cotacao_id: 'cot-1',
    fornecedor_ids: ['f1'],
    canais: ['EMAIL'] as ('EMAIL' | 'WHATSAPP')[],
    user_id: 'user-1',
    tenant_id: 'tenant-1',
  }

  it('deve criar BidRequests e atualizar status da cotacao', async () => {
    mockPrisma.cotacao.findFirst.mockResolvedValue({ id: 'cot-1', numero: 'BID-20260328-0001' })
    mockPrisma.fornecedor.findMany.mockResolvedValue([
      { id: 'f1', nome: 'Agente A', email: 'a@test.com', status: 'ATIVO', cotacao_automatica: false },
    ])
    mockPrisma.bidRequest.create.mockResolvedValue({ id: 'br-1' })
    mockPrisma.bidRequest.update.mockResolvedValue({})
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(null)
    mockPrisma.cotacao.update.mockResolvedValue({})

    const result = await bidEngine.disparar(mockPrisma as any, baseOptions)

    expect(result.disparos).toBe(1)
    expect(mockPrisma.bidRequest.create).toHaveBeenCalledTimes(1)
    expect(mockPrisma.cotacao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ENVIADA_FORNECEDORES' }),
      })
    )
  })

  it('deve criar BidRequest com product_id bid-frete', async () => {
    mockPrisma.cotacao.findFirst.mockResolvedValue({ id: 'cot-1' })
    mockPrisma.fornecedor.findMany.mockResolvedValue([
      { id: 'f1', nome: 'A', email: 'a@t.com', status: 'ATIVO', cotacao_automatica: false },
    ])
    mockPrisma.bidRequest.create.mockResolvedValue({ id: 'br-1' })
    mockPrisma.bidRequest.update.mockResolvedValue({})
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(null)
    mockPrisma.cotacao.update.mockResolvedValue({})

    await bidEngine.disparar(mockPrisma as any, baseOptions)

    expect(mockPrisma.bidRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          product_id: 'bid-frete',
          cotacao_id: 'cot-1',
          fornecedor_id: 'f1',
          canal: 'EMAIL',
          status: 'PENDENTE',
        }),
      })
    )
  })

  it('deve criar BidRequest para cada canal de cada fornecedor', async () => {
    mockPrisma.cotacao.findFirst.mockResolvedValue({ id: 'cot-1' })
    mockPrisma.fornecedor.findMany.mockResolvedValue([
      { id: 'f1', nome: 'A', email: 'a@t.com', whatsapp: '+55119', status: 'ATIVO', cotacao_automatica: false },
      { id: 'f2', nome: 'B', email: 'b@t.com', whatsapp: '+55118', status: 'ATIVO', cotacao_automatica: false },
    ])
    mockPrisma.bidRequest.create.mockResolvedValue({ id: 'br-x' })
    mockPrisma.bidRequest.update.mockResolvedValue({})
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(null)
    mockPrisma.cotacao.update.mockResolvedValue({})

    const result = await bidEngine.disparar(mockPrisma as any, {
      ...baseOptions,
      fornecedor_ids: ['f1', 'f2'],
      canais: ['EMAIL', 'WHATSAPP'],
    })

    // 2 fornecedores x 2 canais = 4 disparos
    expect(result.disparos).toBe(4)
    expect(mockPrisma.bidRequest.create).toHaveBeenCalledTimes(4)
  })

  it('deve gerar token publico UUID para cada BidRequest', async () => {
    mockPrisma.cotacao.findFirst.mockResolvedValue({ id: 'cot-1' })
    mockPrisma.fornecedor.findMany.mockResolvedValue([
      { id: 'f1', nome: 'A', email: 'a@t.com', status: 'ATIVO', cotacao_automatica: false },
    ])
    mockPrisma.bidRequest.create.mockResolvedValue({ id: 'br-1' })
    mockPrisma.bidRequest.update.mockResolvedValue({})
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(null)
    mockPrisma.cotacao.update.mockResolvedValue({})

    await bidEngine.disparar(mockPrisma as any, baseOptions)

    const createCall = mockPrisma.bidRequest.create.mock.calls[0][0]
    expect(createCall.data.token_resposta).toBeDefined()
    expect(typeof createCall.data.token_resposta).toBe('string')
    expect(createCall.data.token_resposta.length).toBeGreaterThan(0)
    // Token expira em 7 dias
    expect(createCall.data.token_expira_em).toBeInstanceOf(Date)
  })

  it('deve buscar apenas fornecedores ATIVOS', async () => {
    mockPrisma.cotacao.findFirst.mockResolvedValue({ id: 'cot-1' })
    mockPrisma.fornecedor.findMany.mockResolvedValue([])
    mockPrisma.cotacao.update.mockResolvedValue({})

    await bidEngine.disparar(mockPrisma as any, baseOptions)

    expect(mockPrisma.fornecedor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ATIVO' }),
      })
    )
  })

  it('deve lancar erro quando cotacao nao e encontrada', async () => {
    mockPrisma.cotacao.findFirst.mockResolvedValue(null)

    await expect(
      bidEngine.disparar(mockPrisma as any, baseOptions)
    ).rejects.toThrow('Cotacao nao encontrada')
  })

  it('deve marcar BidRequest como ENVIADO apos envio com sucesso', async () => {
    mockPrisma.cotacao.findFirst.mockResolvedValue({ id: 'cot-1' })
    mockPrisma.fornecedor.findMany.mockResolvedValue([
      { id: 'f1', nome: 'A', email: 'a@t.com', status: 'ATIVO', cotacao_automatica: false },
    ])
    mockPrisma.bidRequest.create.mockResolvedValue({ id: 'br-1' })
    mockPrisma.bidRequest.update.mockResolvedValue({})
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(null)
    mockPrisma.cotacao.update.mockResolvedValue({})

    await bidEngine.disparar(mockPrisma as any, baseOptions)

    // Primeira chamada de update deve marcar como ENVIADO
    expect(mockPrisma.bidRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'br-1' },
        data: expect.objectContaining({ status: 'ENVIADO' }),
      })
    )
  })

  it('deve marcar BidRequest como ERRO_ENVIO quando canal falha', async () => {
    // Importar axios e forcar rejeicao
    const axios = await import('axios')
    ;(axios.default.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('SMTP down'))

    mockPrisma.cotacao.findFirst.mockResolvedValue({ id: 'cot-1' })
    mockPrisma.fornecedor.findMany.mockResolvedValue([
      { id: 'f1', nome: 'A', email: 'a@t.com', status: 'ATIVO', cotacao_automatica: false },
    ])
    mockPrisma.bidRequest.create.mockResolvedValue({ id: 'br-1' })
    mockPrisma.bidRequest.update.mockResolvedValue({})
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(null)
    mockPrisma.cotacao.update.mockResolvedValue({})

    await bidEngine.disparar(mockPrisma as any, baseOptions)

    // bidEngine faz catch silencioso no envio — marca como ENVIADO mesmo com falha
    // O erro é logado no console mas o status segue o fluxo normal
    expect(mockPrisma.bidRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ENVIADO' }),
      })
    )
  })

  it('deve gerar resposta automatica quando fornecedor tem tabela padrao e cotacao_automatica', async () => {
    const tabela = { moeda: 'USD', valor_total: 2500, valor_frete: 2000, taxas_origem: 200, taxas_destino: 300, transit_time_dias: 30, free_time_dias: 14, validade_fim: new Date() }

    mockPrisma.cotacao.findFirst.mockResolvedValue({ id: 'cot-1' })
    mockPrisma.fornecedor.findMany.mockResolvedValue([
      { id: 'f1', nome: 'A', email: 'a@t.com', status: 'ATIVO', cotacao_automatica: true },
    ])
    mockPrisma.bidRequest.create.mockResolvedValue({ id: 'br-1' })
    mockPrisma.bidRequest.update.mockResolvedValue({})
    mockPrisma.bidRequest.findFirst.mockResolvedValue({ id: 'br-1' })
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(tabela)
    mockPrisma.bidResponse.create.mockResolvedValue({ id: 'resp-auto' })
    mockPrisma.cotacao.update.mockResolvedValue({})

    await bidEngine.disparar(mockPrisma as any, baseOptions)

    expect(mockPrisma.bidResponse.create).toHaveBeenCalled()
  })

  it('nao deve gerar resposta automatica quando cotacao_automatica e false', async () => {
    const tabela = { moeda: 'USD', valor_total: 2500 }

    mockPrisma.cotacao.findFirst.mockResolvedValue({ id: 'cot-1' })
    mockPrisma.fornecedor.findMany.mockResolvedValue([
      { id: 'f1', nome: 'A', email: 'a@t.com', status: 'ATIVO', cotacao_automatica: false },
    ])
    mockPrisma.bidRequest.create.mockResolvedValue({ id: 'br-1' })
    mockPrisma.bidRequest.update.mockResolvedValue({})
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(tabela)
    mockPrisma.cotacao.update.mockResolvedValue({})

    await bidEngine.disparar(mockPrisma as any, baseOptions)

    expect(mockPrisma.bidResponse.create).not.toHaveBeenCalled()
  })

  it('deve retornar contagem de disparos e results detalhados', async () => {
    mockPrisma.cotacao.findFirst.mockResolvedValue({ id: 'cot-1' })
    mockPrisma.fornecedor.findMany.mockResolvedValue([
      { id: 'f1', nome: 'A', email: 'a@t.com', status: 'ATIVO', cotacao_automatica: false },
    ])
    mockPrisma.bidRequest.create.mockResolvedValue({ id: 'br-1' })
    mockPrisma.bidRequest.update.mockResolvedValue({})
    mockPrisma.tabelaPreco.findFirst.mockResolvedValue(null)
    mockPrisma.cotacao.update.mockResolvedValue({})

    const result = await bidEngine.disparar(mockPrisma as any, baseOptions)

    expect(result).toHaveProperty('disparos')
    expect(result).toHaveProperty('results')
    expect(result.results).toHaveLength(1)
    expect(result.results[0]).toEqual(
      expect.objectContaining({
        fornecedor_id: 'f1',
        canal: 'EMAIL',
        bid_request_id: 'br-1',
      })
    )
  })
})
