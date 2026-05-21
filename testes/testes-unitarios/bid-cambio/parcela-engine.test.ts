/**
 * @vitest-environment node
 *
 * parcela-engine.test.ts — Testes do motor de gestao de parcelas.
 * Verifica agendarParcelas, pagarParcela, retornarParaPendente, recalcularParcelas
 * com nomes DDD e transicoes de status corretas.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  agendarParcelas,
  pagarParcela,
  retornarParaPendente,
  recalcularParcelas,
} from '../../../servicos-global/produto/bid-cambio/server/src/services/parcelaEngine'

// ============================================================
// Mock do Prisma
// ============================================================

function criarMockPrisma() {
  return {
    bidCambioParcela: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
    bidCambioAnexo: {
      createMany: vi.fn(),
    },
  }
}

type MockPrisma = ReturnType<typeof criarMockPrisma>

// ============================================================
// Fixtures
// ============================================================

const TENANT_ID = 'org-123'
const USER_ID = 'usr-456'

function criarParcelaPendente(overrides: Record<string, unknown> = {}) {
  return {
    id_parcela_bid_cambio: 'parcela-001',
    id_organizacao: TENANT_ID,
    referencia_processo_parcela_bid_cambio: 'PROC-001',
    numero_pedido_parcela_bid_cambio: 'PED-001',
    status_parcela_bid_cambio: 'PENDENTE',
    moeda_parcela_bid_cambio: 'USD',
    cambio_total_parcela_bid_cambio: 100000,
    porcentagem_parcela_bid_cambio: 50,
    valor_a_pagar_parcela_bid_cambio: 50000,
    valor_a_pagar_brl_parcela_bid_cambio: 275000,
    numero_parcela_bid_cambio: 1,
    total_parcelas_parcela_bid_cambio: 2,
    data_vencimento_parcela_bid_cambio: '2026-06-01',
    data_vencimento_original_parcela_bid_cambio: '2026-06-01',
    ...overrides,
  }
}

// ============================================================
// 1. agendarParcelas
// ============================================================
describe('agendarParcelas', () => {
  let mockPrisma: MockPrisma

  beforeEach(() => {
    mockPrisma = criarMockPrisma()
  })

  it('agenda parcelas PENDENTE -> AGENDADO com campos DDD', async () => {
    const parcela = criarParcelaPendente()
    mockPrisma.bidCambioParcela.findMany.mockResolvedValue([parcela])
    mockPrisma.bidCambioParcela.updateMany.mockResolvedValue({ count: 1 })

    const resultado = await agendarParcelas(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      TENANT_ID,
      USER_ID,
      {
        parcela_ids: ['parcela-001'],
        data_agendamento_parcela_bid_cambio: '2026-06-15',
      },
    )

    expect(resultado.agendadas).toBe(1)
    expect(resultado.data).toBe('2026-06-15')

    // Verifica que updateMany usa campos DDD
    const chamadaUpdate = mockPrisma.bidCambioParcela.updateMany.mock.calls[0][0]
    expect(chamadaUpdate.where).toHaveProperty('id_parcela_bid_cambio')
    expect(chamadaUpdate.where).toHaveProperty('status_parcela_bid_cambio', 'PENDENTE')
    expect(chamadaUpdate.data).toHaveProperty('status_parcela_bid_cambio', 'AGENDADO')
    expect(chamadaUpdate.data).toHaveProperty('data_agendamento_parcela_bid_cambio')
    expect(chamadaUpdate.data).toHaveProperty('data_vencimento_parcela_bid_cambio')
  })

  it('lanca erro quando nenhuma parcela pendente encontrada', async () => {
    mockPrisma.bidCambioParcela.findMany.mockResolvedValue([])

    await expect(
      agendarParcelas(
        mockPrisma as unknown as import('@prisma/client').PrismaClient,
        TENANT_ID,
        USER_ID,
        { parcela_ids: ['inexistente'], data_agendamento_parcela_bid_cambio: '2026-06-15' },
      ),
    ).rejects.toThrow('Nenhuma parcela pendente encontrada')
  })

  it('lanca erro quando quantidade de parcelas encontradas difere da solicitada', async () => {
    const parcela = criarParcelaPendente()
    mockPrisma.bidCambioParcela.findMany.mockResolvedValue([parcela])

    await expect(
      agendarParcelas(
        mockPrisma as unknown as import('@prisma/client').PrismaClient,
        TENANT_ID,
        USER_ID,
        {
          parcela_ids: ['parcela-001', 'parcela-002'],
          data_agendamento_parcela_bid_cambio: '2026-06-15',
        },
      ),
    ).rejects.toThrow('Algumas parcelas nao estao pendentes')
  })

  it('consulta findMany com campo DDD id_parcela_bid_cambio e status_parcela_bid_cambio', async () => {
    mockPrisma.bidCambioParcela.findMany.mockResolvedValue([criarParcelaPendente()])
    mockPrisma.bidCambioParcela.updateMany.mockResolvedValue({ count: 1 })

    await agendarParcelas(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      TENANT_ID,
      USER_ID,
      { parcela_ids: ['parcela-001'], data_agendamento_parcela_bid_cambio: '2026-06-15' },
    )

    const chamadaFind = mockPrisma.bidCambioParcela.findMany.mock.calls[0][0]
    expect(chamadaFind.where).toHaveProperty('id_parcela_bid_cambio')
    expect(chamadaFind.where).toHaveProperty('status_parcela_bid_cambio', 'PENDENTE')
  })
})

// ============================================================
// 2. pagarParcela
// ============================================================
describe('pagarParcela', () => {
  let mockPrisma: MockPrisma

  beforeEach(() => {
    mockPrisma = criarMockPrisma()
  })

  it('paga parcela com transicao PENDENTE -> PAGO usando campos DDD', async () => {
    const parcela = criarParcelaPendente()
    mockPrisma.bidCambioParcela.findFirst.mockResolvedValueOnce(parcela)
    mockPrisma.bidCambioParcela.aggregate.mockResolvedValue({
      _sum: { valor_pago_parcela_bid_cambio: 0 },
    })
    mockPrisma.bidCambioParcela.update.mockResolvedValue({})

    const resultado = await pagarParcela(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      TENANT_ID,
      USER_ID,
      {
        id_parcela_bid_cambio: 'parcela-001',
        valor_pago_parcela_bid_cambio: 50000,
        taxa_fechamento_parcela_bid_cambio: 5.5,
        banco_corretora_parcela_bid_cambio: 'Banco do Brasil',
      },
    )

    expect(resultado.id_parcela_bid_cambio).toBe('parcela-001')
    expect(resultado.status_parcela_bid_cambio).toBe('PAGO')
    expect(resultado.valor_pago_parcela_bid_cambio).toBe(50000)
    expect(resultado.taxa_fechamento_parcela_bid_cambio).toBe(5.5)
    // valor_pago_brl = 50000 * 5.5 = 275000
    expect(resultado.valor_pago_brl_parcela_bid_cambio).toBe(275000)
  })

  it('calcula valor BRL corretamente arredondando para 2 casas', async () => {
    const parcela = criarParcelaPendente({ valor_a_pagar_parcela_bid_cambio: 33333.33 })
    mockPrisma.bidCambioParcela.findFirst.mockResolvedValueOnce(parcela)
    mockPrisma.bidCambioParcela.aggregate.mockResolvedValue({
      _sum: { valor_pago_parcela_bid_cambio: 0 },
    })
    mockPrisma.bidCambioParcela.update.mockResolvedValue({})

    const resultado = await pagarParcela(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      TENANT_ID,
      USER_ID,
      {
        id_parcela_bid_cambio: 'parcela-001',
        valor_pago_parcela_bid_cambio: 33333.33,
        taxa_fechamento_parcela_bid_cambio: 5.1234,
        banco_corretora_parcela_bid_cambio: 'Itau',
      },
    )

    // 33333.33 * 5.1234 = 170779.88822... -> arredonda para 170779.89
    expect(resultado.valor_pago_brl_parcela_bid_cambio).toBe(
      Math.round(33333.33 * 5.1234 * 100) / 100,
    )
  })

  it('lanca erro quando parcela nao encontrada ou ja paga', async () => {
    mockPrisma.bidCambioParcela.findFirst.mockResolvedValue(null)

    await expect(
      pagarParcela(
        mockPrisma as unknown as import('@prisma/client').PrismaClient,
        TENANT_ID,
        USER_ID,
        {
          id_parcela_bid_cambio: 'inexistente',
          valor_pago_parcela_bid_cambio: 1000,
          taxa_fechamento_parcela_bid_cambio: 5.0,
          banco_corretora_parcela_bid_cambio: 'Banco X',
        },
      ),
    ).rejects.toThrow('Parcela nao encontrada ou ja paga')
  })

  it('lanca erro quando valor excede limite restante', async () => {
    const parcela = criarParcelaPendente({ cambio_total_parcela_bid_cambio: 100000 })
    mockPrisma.bidCambioParcela.findFirst.mockResolvedValueOnce(parcela)
    mockPrisma.bidCambioParcela.aggregate.mockResolvedValue({
      _sum: { valor_pago_parcela_bid_cambio: 90000 },
    })

    await expect(
      pagarParcela(
        mockPrisma as unknown as import('@prisma/client').PrismaClient,
        TENANT_ID,
        USER_ID,
        {
          id_parcela_bid_cambio: 'parcela-001',
          valor_pago_parcela_bid_cambio: 20000,
          taxa_fechamento_parcela_bid_cambio: 5.0,
          banco_corretora_parcela_bid_cambio: 'Banco X',
        },
      ),
    ).rejects.toThrow('excede o limite restante')
  })

  it('update do Prisma usa campos DDD corretos', async () => {
    const parcela = criarParcelaPendente()
    mockPrisma.bidCambioParcela.findFirst.mockResolvedValueOnce(parcela)
    mockPrisma.bidCambioParcela.aggregate.mockResolvedValue({
      _sum: { valor_pago_parcela_bid_cambio: 0 },
    })
    mockPrisma.bidCambioParcela.update.mockResolvedValue({})

    await pagarParcela(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      TENANT_ID,
      USER_ID,
      {
        id_parcela_bid_cambio: 'parcela-001',
        valor_pago_parcela_bid_cambio: 50000,
        taxa_fechamento_parcela_bid_cambio: 5.5,
        banco_corretora_parcela_bid_cambio: 'BB',
      },
    )

    const chamada = mockPrisma.bidCambioParcela.update.mock.calls[0][0]
    expect(chamada.where).toHaveProperty('id_parcela_bid_cambio', 'parcela-001')
    expect(chamada.data).toHaveProperty('status_parcela_bid_cambio', 'PAGO')
    expect(chamada.data).toHaveProperty('valor_pago_parcela_bid_cambio', 50000)
    expect(chamada.data).toHaveProperty('valor_pago_brl_parcela_bid_cambio')
    expect(chamada.data).toHaveProperty('taxa_fechamento_parcela_bid_cambio', 5.5)
    expect(chamada.data).toHaveProperty('banco_corretora_parcela_bid_cambio', 'BB')
    expect(chamada.data).toHaveProperty('data_pagamento_parcela_bid_cambio')
  })

  it('ajusta proxima parcela quando valor pago e menor (diferenca negativa)', async () => {
    const parcela = criarParcelaPendente({ valor_a_pagar_parcela_bid_cambio: 50000 })
    const proximaParcela = criarParcelaPendente({
      id_parcela_bid_cambio: 'parcela-002',
      numero_parcela_bid_cambio: 2,
      valor_a_pagar_parcela_bid_cambio: 50000,
    })

    mockPrisma.bidCambioParcela.findFirst
      .mockResolvedValueOnce(parcela)      // busca parcela a pagar
      .mockResolvedValueOnce(proximaParcela) // busca proxima parcela
    mockPrisma.bidCambioParcela.aggregate.mockResolvedValue({
      _sum: { valor_pago_parcela_bid_cambio: 0 },
    })
    mockPrisma.bidCambioParcela.update.mockResolvedValue({})

    await pagarParcela(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      TENANT_ID,
      USER_ID,
      {
        id_parcela_bid_cambio: 'parcela-001',
        valor_pago_parcela_bid_cambio: 40000, // 10000 a menos
        taxa_fechamento_parcela_bid_cambio: 5.0,
        banco_corretora_parcela_bid_cambio: 'BB',
      },
    )

    // Verifica que proxima parcela foi ajustada (50000 - (-10000) = 60000)
    const chamadaProxima = mockPrisma.bidCambioParcela.update.mock.calls[1][0]
    expect(chamadaProxima.where).toHaveProperty('id_parcela_bid_cambio', 'parcela-002')
    expect(chamadaProxima.data).toHaveProperty('valor_a_pagar_parcela_bid_cambio', 60000)
  })

  it('deleta proxima parcela quando ajuste zera o valor (RN-105)', async () => {
    const parcela = criarParcelaPendente({ valor_a_pagar_parcela_bid_cambio: 50000 })
    const proximaParcela = criarParcelaPendente({
      id_parcela_bid_cambio: 'parcela-002',
      numero_parcela_bid_cambio: 2,
      valor_a_pagar_parcela_bid_cambio: 5000,
    })

    mockPrisma.bidCambioParcela.findFirst
      .mockResolvedValueOnce(parcela)
      .mockResolvedValueOnce(proximaParcela)
    mockPrisma.bidCambioParcela.aggregate.mockResolvedValue({
      _sum: { valor_pago_parcela_bid_cambio: 0 },
    })
    mockPrisma.bidCambioParcela.update.mockResolvedValue({})
    mockPrisma.bidCambioParcela.delete.mockResolvedValue({})

    await pagarParcela(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      TENANT_ID,
      USER_ID,
      {
        id_parcela_bid_cambio: 'parcela-001',
        valor_pago_parcela_bid_cambio: 55000, // 5000 a mais -> proxima: 5000 - 5000 = 0
        taxa_fechamento_parcela_bid_cambio: 5.0,
        banco_corretora_parcela_bid_cambio: 'BB',
      },
    )

    // Verifica delete com campo DDD
    expect(mockPrisma.bidCambioParcela.delete).toHaveBeenCalledWith({
      where: { id_parcela_bid_cambio: 'parcela-002' },
    })
  })

  it('cria anexos com campos DDD quando fornecidos', async () => {
    const parcela = criarParcelaPendente()
    mockPrisma.bidCambioParcela.findFirst.mockResolvedValueOnce(parcela)
    mockPrisma.bidCambioParcela.aggregate.mockResolvedValue({
      _sum: { valor_pago_parcela_bid_cambio: 0 },
    })
    mockPrisma.bidCambioParcela.update.mockResolvedValue({})
    mockPrisma.bidCambioAnexo.createMany.mockResolvedValue({ count: 1 })

    await pagarParcela(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      TENANT_ID,
      USER_ID,
      {
        id_parcela_bid_cambio: 'parcela-001',
        valor_pago_parcela_bid_cambio: 50000,
        taxa_fechamento_parcela_bid_cambio: 5.5,
        banco_corretora_parcela_bid_cambio: 'BB',
        anexos: [
          {
            nome_arquivo_anexo_bid_cambio: 'arquivo-uuid.pdf',
            nome_original_anexo_bid_cambio: 'contrato.pdf',
            url_anexo_bid_cambio: 'https://storage.example.com/arquivo-uuid.pdf',
            categoria_anexo_bid_cambio: 'Contrato de Cambio',
          },
        ],
      },
    )

    expect(mockPrisma.bidCambioAnexo.createMany).toHaveBeenCalledTimes(1)
    const chamadaAnexo = mockPrisma.bidCambioAnexo.createMany.mock.calls[0][0]
    const anexoData = chamadaAnexo.data[0]
    expect(anexoData).toHaveProperty('id_parcela_bid_cambio', 'parcela-001')
    expect(anexoData).toHaveProperty('nome_arquivo_anexo_bid_cambio', 'arquivo-uuid.pdf')
    expect(anexoData).toHaveProperty('nome_original_anexo_bid_cambio', 'contrato.pdf')
    expect(anexoData).toHaveProperty('url_anexo_bid_cambio')
    expect(anexoData).toHaveProperty('categoria_anexo_bid_cambio', 'Contrato de Cambio')
  })

  it('aggregate usa campo DDD valor_pago_parcela_bid_cambio', async () => {
    const parcela = criarParcelaPendente()
    mockPrisma.bidCambioParcela.findFirst.mockResolvedValueOnce(parcela)
    mockPrisma.bidCambioParcela.aggregate.mockResolvedValue({
      _sum: { valor_pago_parcela_bid_cambio: 0 },
    })
    mockPrisma.bidCambioParcela.update.mockResolvedValue({})

    await pagarParcela(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      TENANT_ID,
      USER_ID,
      {
        id_parcela_bid_cambio: 'parcela-001',
        valor_pago_parcela_bid_cambio: 50000,
        taxa_fechamento_parcela_bid_cambio: 5.0,
        banco_corretora_parcela_bid_cambio: 'BB',
      },
    )

    const chamadaAggregate = mockPrisma.bidCambioParcela.aggregate.mock.calls[0][0]
    expect(chamadaAggregate.where).toHaveProperty('referencia_processo_parcela_bid_cambio')
    expect(chamadaAggregate.where).toHaveProperty('numero_pedido_parcela_bid_cambio')
    expect(chamadaAggregate.where).toHaveProperty('status_parcela_bid_cambio', 'PAGO')
    expect(chamadaAggregate._sum).toHaveProperty('valor_pago_parcela_bid_cambio', true)
  })
})

// ============================================================
// 3. retornarParaPendente
// ============================================================
describe('retornarParaPendente', () => {
  let mockPrisma: MockPrisma

  beforeEach(() => {
    mockPrisma = criarMockPrisma()
  })

  it('transicao PAGO -> PENDENTE com reset dos campos DDD (RN-106)', async () => {
    const parcelaPaga = criarParcelaPendente({
      status_parcela_bid_cambio: 'PAGO',
      valor_pago_parcela_bid_cambio: 50000,
      valor_pago_brl_parcela_bid_cambio: 275000,
      taxa_fechamento_parcela_bid_cambio: 5.5,
      data_pagamento_parcela_bid_cambio: '2026-05-01',
      data_vencimento_original_parcela_bid_cambio: '2026-06-01',
    })
    mockPrisma.bidCambioParcela.findFirst.mockResolvedValue(parcelaPaga)
    mockPrisma.bidCambioParcela.update.mockResolvedValue({})

    const resultado = await retornarParaPendente(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      'parcela-001',
    )

    expect(resultado.id_parcela_bid_cambio).toBe('parcela-001')
    expect(resultado.status_parcela_bid_cambio).toBe('PENDENTE')

    const chamada = mockPrisma.bidCambioParcela.update.mock.calls[0][0]
    expect(chamada.where).toHaveProperty('id_parcela_bid_cambio', 'parcela-001')
    expect(chamada.data.status_parcela_bid_cambio).toBe('PENDENTE')
    expect(chamada.data.valor_pago_parcela_bid_cambio).toBeNull()
    expect(chamada.data.valor_pago_brl_parcela_bid_cambio).toBeNull()
    expect(chamada.data.taxa_fechamento_parcela_bid_cambio).toBeNull()
    expect(chamada.data.data_pagamento_parcela_bid_cambio).toBeNull()
    expect(chamada.data.data_agendamento_parcela_bid_cambio).toBeNull()
    // RN-106: vencimento volta para o original
    expect(chamada.data.data_vencimento_parcela_bid_cambio).toBe('2026-06-01')
  })

  it('lanca erro quando parcela nao encontrada ou nao esta paga', async () => {
    mockPrisma.bidCambioParcela.findFirst.mockResolvedValue(null)

    await expect(
      retornarParaPendente(
        mockPrisma as unknown as import('@prisma/client').PrismaClient,
        'parcela-inexistente',
      ),
    ).rejects.toThrow('Parcela nao encontrada ou nao esta paga')
  })

  it('findFirst busca com campo DDD status_parcela_bid_cambio = PAGO', async () => {
    mockPrisma.bidCambioParcela.findFirst.mockResolvedValue(null)

    await retornarParaPendente(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      'parcela-001',
    ).catch(() => {
      // Erro esperado
    })

    const chamada = mockPrisma.bidCambioParcela.findFirst.mock.calls[0][0]
    expect(chamada.where).toHaveProperty('id_parcela_bid_cambio', 'parcela-001')
    expect(chamada.where).toHaveProperty('status_parcela_bid_cambio', 'PAGO')
  })
})

// ============================================================
// 4. recalcularParcelas (RN-110)
// ============================================================
describe('recalcularParcelas', () => {
  let mockPrisma: MockPrisma

  beforeEach(() => {
    mockPrisma = criarMockPrisma()
  })

  it('recalcula valores proporcionais com campos DDD', async () => {
    const parcelas = [
      criarParcelaPendente({
        id_parcela_bid_cambio: 'p1',
        porcentagem_parcela_bid_cambio: 60,
        numero_parcela_bid_cambio: 1,
      }),
      criarParcelaPendente({
        id_parcela_bid_cambio: 'p2',
        porcentagem_parcela_bid_cambio: 40,
        numero_parcela_bid_cambio: 2,
      }),
    ]
    mockPrisma.bidCambioParcela.findMany.mockResolvedValue(parcelas)
    mockPrisma.bidCambioParcela.update.mockResolvedValue({})

    const resultado = await recalcularParcelas(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      'PROC-001',
      'PED-001',
      200000,
    )

    expect(resultado.recalculadas).toBe(2)

    // Parcela 1: 60% de 200000 = 120000
    const chamada1 = mockPrisma.bidCambioParcela.update.mock.calls[0][0]
    expect(chamada1.where).toHaveProperty('id_parcela_bid_cambio', 'p1')
    expect(chamada1.data).toHaveProperty('cambio_total_parcela_bid_cambio', 200000)
    expect(chamada1.data).toHaveProperty('valor_a_pagar_parcela_bid_cambio', 120000)

    // Parcela 2: 40% de 200000 = 80000
    const chamada2 = mockPrisma.bidCambioParcela.update.mock.calls[1][0]
    expect(chamada2.where).toHaveProperty('id_parcela_bid_cambio', 'p2')
    expect(chamada2.data).toHaveProperty('valor_a_pagar_parcela_bid_cambio', 80000)
  })

  it('deleta parcela quando recalculo zera o valor (RN-105)', async () => {
    const parcelas = [
      criarParcelaPendente({
        id_parcela_bid_cambio: 'p1',
        porcentagem_parcela_bid_cambio: 50,
      }),
    ]
    mockPrisma.bidCambioParcela.findMany.mockResolvedValue(parcelas)
    mockPrisma.bidCambioParcela.delete.mockResolvedValue({})

    await recalcularParcelas(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      'PROC-001',
      'PED-001',
      0, // cambio total = 0 => 50% de 0 = 0 => deleta
    )

    expect(mockPrisma.bidCambioParcela.delete).toHaveBeenCalledWith({
      where: { id_parcela_bid_cambio: 'p1' },
    })
  })

  it('findMany filtra com campos DDD corretos', async () => {
    mockPrisma.bidCambioParcela.findMany.mockResolvedValue([])

    await recalcularParcelas(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      'PROC-001',
      'PED-001',
      100000,
    )

    const chamada = mockPrisma.bidCambioParcela.findMany.mock.calls[0][0]
    expect(chamada.where).toHaveProperty('referencia_processo_parcela_bid_cambio', 'PROC-001')
    expect(chamada.where).toHaveProperty('numero_pedido_parcela_bid_cambio', 'PED-001')
    expect(chamada.where.status_parcela_bid_cambio).toEqual({ in: ['PENDENTE', 'AGENDADO'] })
    expect(chamada.orderBy).toHaveProperty('numero_parcela_bid_cambio', 'asc')
  })

  it('arredonda valor para 2 casas decimais', async () => {
    const parcelas = [
      criarParcelaPendente({
        id_parcela_bid_cambio: 'p1',
        porcentagem_parcela_bid_cambio: 33.33,
      }),
    ]
    mockPrisma.bidCambioParcela.findMany.mockResolvedValue(parcelas)
    mockPrisma.bidCambioParcela.update.mockResolvedValue({})

    await recalcularParcelas(
      mockPrisma as unknown as import('@prisma/client').PrismaClient,
      'PROC-001',
      'PED-001',
      100000,
    )

    const chamada = mockPrisma.bidCambioParcela.update.mock.calls[0][0]
    // 33.33% de 100000 = 33330 (exato neste caso)
    const valorEsperado = Math.round((33.33 / 100) * 100000 * 100) / 100
    expect(chamada.data.valor_a_pagar_parcela_bid_cambio).toBe(valorEsperado)
  })
})
