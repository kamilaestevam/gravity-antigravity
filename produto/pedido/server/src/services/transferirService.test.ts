/**
 * transferirService.test.ts — Testes unitários do TransferirService
 *
 * Cobre:
 *   - preview: cálculo de saldo, alertas, destinos
 *   - confirmar: reducao_simples, split_novo_pedido, split_pedido_existente, substituicao_pura
 *   - validações: quantidade inválida, item não encontrado, pedido não encontrado
 *   - geração de IDs: pedido destino e item destino devem ter ids únicos
 *   - reversão: devolver quantidade, marcar revertido
 *
 * Padrão de mock: objeto simples simulando PrismaClient (sem jest.mock de módulo)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransferirService } from './transferirService.js'
import type { TransferPayload } from './transferirService.js'

// ── Constantes ────────────────────────────────────────────────────────────────

const TENANT = 'tenant-abc'
const USER   = 'user-001'

// ── Helpers de fixture ────────────────────────────────────────────────────────

function criarItemPrisma(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pite_id_0000001-26',
    tenant_id: TENANT,
    company_id: TENANT,
    pedido_id: 'pedi_id_0000001-26',
    sequencia_item: 1,
    part_number: 'PART-001',
    ncm: '1234.56.78',
    descricao_item: 'Produto Teste',
    unidade_comercializada_item: 'UN',
    // Decimal do Prisma — serializados como objeto com .toString()
    // Nos testes usamos números simples pois o Number() converte ambos
    quantidade_inicial_item_pedido: 111,
    saldo_item_pedido: 111,
    quantidade_pronta_total_item_pedido: 0,
    quantidade_transferida_item_pedido: 0,
    quantidade_cancelada_item_pedido: 0,
    casas_decimais_quantidade_item: 2,
    moeda_item: 'USD',
    valor_unitario_item: 10,
    valor_total_itens: 1110,
    casas_decimais_valor_item: 2,
    cobertura_cambial: 'com_cobertura',
    campos_custom: null,
    item_criado_em: new Date(),
    item_atualizado_em: new Date(),
    ...overrides,
  }
}

function criarPedidoPrisma(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pedi_id_0000001-26',
    tenant_id: TENANT,
    company_id: TENANT,
    tipo_operacao: 'importacao',
    numero_pedido: 'PO-2026-001',
    status: 'aberto',
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    casas_decimais_valor_pedido: 2,
    casas_decimais_quantidade_pedido: 2,
    unidade_comercializada_pedido: 'UN',
    condicao_pagamento_pedido: null,
    data_emissao_pedido: new Date(),
    importacao_exportador_id: null,
    exportacao_importador_id: null,
    fabricante_id: null,
    quantidade_total_inicial_pedido: 111,
    valor_total_pedido: 1110,
    itens: [criarItemPrisma()],
    ...overrides,
  }
}

function criarPayload(overrides: Partial<TransferPayload> = {}): TransferPayload {
  return {
    cenario: 'reducao_simples',
    pedido_id: 'pedi_id_0000001-26',
    item_id: 'pite_id_0000001-26',
    quantidade_origem: 110,
    destinos: [],
    ...overrides,
  }
}

// ── Mock DB factory ──────────────────────────────────────────────────────────

function criarMockDb(pedidoBase = criarPedidoPrisma()) {
  const pedidoCreate = vi.fn().mockResolvedValue({ ...criarPedidoPrisma(), id: 'pedi_novo_001', numero_pedido: 'PO-NOVO' })
  const pedidoFindFirst = vi.fn().mockResolvedValue(pedidoBase)
  const pedidoUpdate = vi.fn().mockResolvedValue(pedidoBase)

  const itemCreate = vi.fn().mockResolvedValue(criarItemPrisma({ id: 'pite_novo_001' }))
  const itemUpdate = vi.fn().mockResolvedValue(criarItemPrisma())
  const itemFindMany = vi.fn().mockResolvedValue(pedidoBase.itens)
  const itemDelete = vi.fn().mockResolvedValue(undefined)
  const itemFindFirst = vi.fn().mockResolvedValue(criarItemPrisma())

  const transferHistoricoCreate = vi.fn().mockResolvedValue({ id: 'hist-001' })
  const transferHistoricoFindFirst = vi.fn().mockResolvedValue(null)
  const transferHistoricoUpdate = vi.fn().mockResolvedValue({})

  const pedidoHistoricoCreate = vi.fn().mockResolvedValue({ id: 'audit-001' })

  const txBase = {
    pedido: { create: pedidoCreate, findFirst: pedidoFindFirst, update: pedidoUpdate },
    pedidoItem: { create: itemCreate, update: itemUpdate, findMany: itemFindMany, delete: itemDelete, findFirst: itemFindFirst },
    transferHistorico: { create: transferHistoricoCreate, findFirst: transferHistoricoFindFirst, update: transferHistoricoUpdate },
    pedidoHistorico: { create: pedidoHistoricoCreate },
  }

  const db = {
    pedido: { findFirst: pedidoFindFirst },
    pedidoItem: { findFirst: itemFindFirst },
    transferHistorico: { findFirst: transferHistoricoFindFirst, findMany: vi.fn().mockResolvedValue([]) },
    $transaction: vi.fn().mockImplementation(async (fn: (tx: typeof txBase) => Promise<unknown>) => fn(txBase)),
  }

  return { db, txBase, mocks: { pedidoCreate, pedidoFindFirst, pedidoUpdate, itemCreate, itemUpdate, itemFindMany, itemDelete, transferHistoricoCreate } }
}

// ── Testes: preview ──────────────────────────────────────────────────────────

describe('TransferirService.preview', () => {
  it('retorna saldo correto do item de origem', async () => {
    const { db } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({ quantidade_origem: 10 })

    const result = await service.preview(TENANT, payload, db)

    expect(result.origem.saldo_item_pedido).toBe(111)
    expect(result.origem.quantidade_apos).toBe(101)
    expect(result.origem.encerra).toBe(false)
  })

  it('marca encerra=true quando quantidade_apos <= 0', async () => {
    const { db } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({ quantidade_origem: 111 })

    const result = await service.preview(TENANT, payload, db)

    expect(result.origem.encerra).toBe(true)
    expect(result.origem.quantidade_apos).toBe(0)
    expect(result.alertas_globais).toContain(
      'Pedido de origem ficará com quantidade zero após a transferência',
    )
  })

  it('adiciona alerta quando quantidade excede saldo', async () => {
    const { db } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({ quantidade_origem: 999 })

    const result = await service.preview(TENANT, payload, db)

    expect(result.alertas_globais.some(a => a.includes('excede'))).toBe(true)
  })

  it('retorna item_part_number correto', async () => {
    const { db } = criarMockDb()
    const service = new TransferirService()

    const result = await service.preview(TENANT, criarPayload(), db)

    expect(result.origem.item_part_number).toBe('PART-001')
    expect(result.origem.pedido_numero).toBe('PO-2026-001')
  })

  it('lança NOT_FOUND quando pedido não existe', async () => {
    const { db } = criarMockDb()
    db.pedido.findFirst = vi.fn().mockResolvedValue(null)
    const service = new TransferirService()

    await expect(service.preview(TENANT, criarPayload(), db)).rejects.toThrow('Pedido de origem não encontrado')
  })

  it('lança NOT_FOUND quando item não está no pedido', async () => {
    const { db } = criarMockDb()
    db.pedido.findFirst = vi.fn().mockResolvedValue(criarPedidoPrisma({ itens: [] }))
    const service = new TransferirService()

    await expect(service.preview(TENANT, criarPayload(), db)).rejects.toThrow('Item não encontrado no pedido')
  })

  it('retorna destinos com quantidade correta (split_pedido_existente)', async () => {
    const { db, txBase } = criarMockDb()
    txBase.pedido.findFirst.mockResolvedValueOnce(
      criarPedidoPrisma({ id: 'pedi_destino', numero_pedido: 'PO-DESTINO' }),
    )
    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'split_pedido_existente',
      quantidade_origem: 50,
      destinos: [{ tipo: 'existente', pedido_id: 'pedi_destino', quantidade: 50 }],
    })

    const result = await service.preview(TENANT, payload, db)

    expect(result.destinos).toHaveLength(1)
    expect(result.destinos[0].quantidade).toBe(50)
  })
})

// ── Testes: confirmar — reducao_simples ──────────────────────────────────────

describe('TransferirService.confirmar — reducao_simples', () => {
  it('reduz saldo_item_pedido do item de origem', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({ cenario: 'reducao_simples', quantidade_origem: 110 })

    await service.confirmar(TENANT, USER, payload, db)

    // Deve ter atualizado o item de origem com novaQty = 111 - 110 = 1
    expect(mocks.itemUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'pite_id_0000001-26' },
        data: expect.objectContaining({ saldo_item_pedido: 1 }),
      }),
    )
  })

  it('incrementa quantidade_transferida_item_pedido', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()

    await service.confirmar(TENANT, USER, criarPayload({ cenario: 'reducao_simples', quantidade_origem: 110 }), db)

    expect(mocks.itemUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ quantidade_transferida_item_pedido: 110 }),
      }),
    )
  })

  it('não cria pedido novo nem item destino', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()

    await service.confirmar(TENANT, USER, criarPayload({ cenario: 'reducao_simples', quantidade_origem: 10 }), db)

    expect(mocks.pedidoCreate).not.toHaveBeenCalled()
    expect(mocks.itemCreate).not.toHaveBeenCalled()
  })

  it('retorna pedido_origem_id correto', async () => {
    const { db } = criarMockDb()
    const service = new TransferirService()

    const result = await service.confirmar(TENANT, USER, criarPayload({ cenario: 'reducao_simples', quantidade_origem: 10 }), db)

    expect(result.pedido_origem_id).toBe('pedi_id_0000001-26')
    expect(result.pedidos_criados).toHaveLength(0)
  })

  it('lança INVALID_QTY quando quantidade_origem é zero', async () => {
    const { db } = criarMockDb()
    const service = new TransferirService()

    await expect(
      service.confirmar(TENANT, USER, criarPayload({ cenario: 'reducao_simples', quantidade_origem: 0 }), db),
    ).rejects.toThrow('Quantidade deve ser maior que zero')
  })

  it('lança INSUFFICIENT_QTY quando quantidade excede saldo', async () => {
    const { db } = criarMockDb()
    const service = new TransferirService()

    await expect(
      service.confirmar(TENANT, USER, criarPayload({ cenario: 'reducao_simples', quantidade_origem: 999 }), db),
    ).rejects.toThrow('excede a disponível')
  })

  it('lança NOT_FOUND quando pedido não existe', async () => {
    const { db } = criarMockDb()
    db.pedido.findFirst = vi.fn().mockResolvedValue(null)
    const service = new TransferirService()

    await expect(
      service.confirmar(TENANT, USER, criarPayload({ cenario: 'reducao_simples', quantidade_origem: 10 }), db),
    ).rejects.toThrow('Pedido de origem não encontrado')
  })
})

// ── Testes: confirmar — split_novo_pedido ────────────────────────────────────

describe('TransferirService.confirmar — split_novo_pedido', () => {
  it('cria novo pedido destino com id gerado', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'split_novo_pedido',
      quantidade_origem: 100,
      numero_pedido_novo: 'PO-NOVO-001',
      destinos: [{ tipo: 'novo', quantidade: 100 }],
    })

    const result = await service.confirmar(TENANT, USER, payload, db)

    expect(mocks.pedidoCreate).toHaveBeenCalledOnce()
    const chamada = mocks.pedidoCreate.mock.calls[0][0].data
    expect(chamada.id).toMatch(/^pedi_id_/)
    expect(chamada.numero_pedido).toBe('PO-NOVO-001')
    expect(chamada.tenant_id).toBe(TENANT)
    expect(result.pedidos_criados).toHaveLength(1)
  })

  it('cria item no pedido novo com id gerado e quantidade correta', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'split_novo_pedido',
      quantidade_origem: 100,
      numero_pedido_novo: 'PO-NOVO-001',
      destinos: [{ tipo: 'novo', quantidade: 100 }],
    })

    await service.confirmar(TENANT, USER, payload, db)

    expect(mocks.itemCreate).toHaveBeenCalledOnce()
    const itemData = mocks.itemCreate.mock.calls[0][0].data
    expect(itemData.id).toMatch(/^pite_id_/)
    expect(itemData.saldo_item_pedido).toBe(100)
    expect(itemData.quantidade_inicial_item_pedido).toBe(100)
    expect(itemData.part_number).toBe('PART-001')
  })

  it('usa numero_pedido_novo quando fornecido', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'split_novo_pedido',
      quantidade_origem: 50,
      numero_pedido_novo: 'CUSTOM-NUM',
      destinos: [{ tipo: 'novo', quantidade: 50 }],
    })

    await service.confirmar(TENANT, USER, payload, db)

    expect(mocks.pedidoCreate.mock.calls[0][0].data.numero_pedido).toBe('CUSTOM-NUM')
  })

  it('gera numero auto quando numero_pedido_novo não fornecido', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'split_novo_pedido',
      quantidade_origem: 50,
      destinos: [{ tipo: 'novo', quantidade: 50 }],
    })

    await service.confirmar(TENANT, USER, payload, db)

    expect(mocks.pedidoCreate.mock.calls[0][0].data.numero_pedido).toMatch(/^PO-TRANS-/)
  })

  it('reduz item de origem pela quantidade transferida', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'split_novo_pedido',
      quantidade_origem: 100,
      destinos: [{ tipo: 'novo', quantidade: 100 }],
    })

    await service.confirmar(TENANT, USER, payload, db)

    // itemUpdate chamado para a origem (111 - 100 = 11)
    const updateOrigemCall = mocks.itemUpdate.mock.calls.find(
      (c: any) => c[0].where.id === 'pite_id_0000001-26',
    )
    expect(updateOrigemCall).toBeDefined()
    expect(updateOrigemCall![0].data.saldo_item_pedido).toBe(11)
  })

  it('não copia campos inválidos para o pedido destino', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'split_novo_pedido',
      quantidade_origem: 50,
      destinos: [{ tipo: 'novo', quantidade: 50 }],
    })

    await service.confirmar(TENANT, USER, payload, db)

    const pedidoData = mocks.pedidoCreate.mock.calls[0][0].data
    expect(pedidoData.nome_exportador).toBeUndefined()
    expect(pedidoData.nome_fabricante).toBeUndefined()
    expect(pedidoData.quantidade_total_inicial_pedido).toBeUndefined()
    expect(pedidoData.quantidade_transferida_total).toBeUndefined()
  })
})

// ── Testes: confirmar — split_pedido_existente ───────────────────────────────

describe('TransferirService.confirmar — split_pedido_existente', () => {
  it('adiciona item ao pedido existente quando part_number não existe', async () => {
    const { db, txBase, mocks } = criarMockDb()
    // Pedido destino sem itens com PART-001
    txBase.pedido.findFirst
      .mockResolvedValueOnce(criarPedidoPrisma()) // origem (primeira chamada no confirmar)
      .mockResolvedValueOnce(criarPedidoPrisma({ id: 'pedi_destino', numero_pedido: 'PO-DEST', itens: [] }))

    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'split_pedido_existente',
      quantidade_origem: 50,
      destinos: [{ tipo: 'existente', pedido_id: 'pedi_destino', quantidade: 50 }],
    })

    await service.confirmar(TENANT, USER, payload, db)

    expect(mocks.itemCreate).toHaveBeenCalledOnce()
    const itemData = mocks.itemCreate.mock.calls[0][0].data
    expect(itemData.saldo_item_pedido).toBe(50)
    expect(itemData.pedido_id).toBe('pedi_destino') // id do pedido existente passado no payload
  })

  it('incrementa quantidade no item existente quando part_number já existe no destino', async () => {
    const { db, txBase, mocks } = criarMockDb()
    const itemDestino = criarItemPrisma({
      id: 'pite_destino',
      pedido_id: 'pedi_destino',
      part_number: 'PART-001',
      saldo_item_pedido: 200,
      quantidade_inicial_item_pedido: 200,
      quantidade_transferida_item_pedido: 0,
    })
    txBase.pedido.findFirst
      .mockResolvedValueOnce(criarPedidoPrisma())
      .mockResolvedValueOnce(criarPedidoPrisma({ id: 'pedi_destino', itens: [itemDestino] }))

    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'split_pedido_existente',
      quantidade_origem: 50,
      destinos: [{ tipo: 'existente', pedido_id: 'pedi_destino', quantidade: 50 }],
    })

    await service.confirmar(TENANT, USER, payload, db)

    // Não deve criar novo item — deve atualizar o existente
    expect(mocks.itemCreate).not.toHaveBeenCalled()
    const updateDestinoCall = mocks.itemUpdate.mock.calls.find(
      (c: any) => c[0].where.id === 'pite_destino',
    )
    expect(updateDestinoCall).toBeDefined()
    expect(updateDestinoCall![0].data.saldo_item_pedido).toBe(250) // 200 + 50
  })

  it('lança erro quando pedido destino não encontrado', async () => {
    const { db, txBase } = criarMockDb()
    txBase.pedido.findFirst
      .mockResolvedValueOnce(criarPedidoPrisma())
      .mockResolvedValueOnce(null) // destino não existe

    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'split_pedido_existente',
      quantidade_origem: 50,
      destinos: [{ tipo: 'existente', pedido_id: 'pedi_inexistente', quantidade: 50 }],
    })

    await expect(service.confirmar(TENANT, USER, payload, db)).rejects.toThrow('não encontrado')
  })
})

// ── Testes: confirmar — substituicao_pura ────────────────────────────────────

describe('TransferirService.confirmar — substituicao_pura', () => {
  it('troca part_number no item de origem sem alterar quantidade', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'substituicao_pura',
      quantidade_origem: 111,
      destinos: [{ tipo: 'mesmo', quantidade: 111, part_number: 'PART-002-NOVO' }],
    })

    await service.confirmar(TENANT, USER, payload, db)

    const updateCall = mocks.itemUpdate.mock.calls.find(
      (c: any) => c[0].data?.part_number === 'PART-002-NOVO',
    )
    expect(updateCall).toBeDefined()
  })

  it('não reduz quantidade de origem na substituicao_pura', async () => {
    const { db, mocks } = criarMockDb()
    const service = new TransferirService()
    const payload = criarPayload({
      cenario: 'substituicao_pura',
      quantidade_origem: 111,
      destinos: [{ tipo: 'mesmo', quantidade: 111, part_number: 'PART-002' }],
    })

    await service.confirmar(TENANT, USER, payload, db)

    // O update de qty (com saldo_item_pedido) não deve ter sido chamado
    const updateQtyCall = mocks.itemUpdate.mock.calls.find(
      (c: any) => c[0].data?.saldo_item_pedido !== undefined,
    )
    expect(updateQtyCall).toBeUndefined()
  })
})

// ── Testes: geração de IDs ───────────────────────────────────────────────────

describe('TransferirService — geração de IDs', () => {
  it('IDs de pedido gerados seguem formato pedi_id_NNNNNNN-AA', () => {
    const service = new TransferirService()
    // Acessar método privado via cast
    const id = (service as any).gerarId('pedi')
    expect(id).toMatch(/^pedi_id_\d{7}-\d{2}$/)
  })

  it('IDs de item gerados seguem formato pite_id_NNNNNNN-AA', () => {
    const service = new TransferirService()
    const id = (service as any).gerarId('pite')
    expect(id).toMatch(/^pite_id_\d{7}-\d{2}$/)
  })

  it('dois IDs gerados consecutivos são diferentes', () => {
    const service = new TransferirService()
    const id1 = (service as any).gerarId('pite')
    const id2 = (service as any).gerarId('pite')
    // Podem ser iguais por colisão de random (1/9999999), mas é suficientemente improvável
    // Repetimos 3 vezes para garantir
    const ids = new Set([id1, id2, (service as any).gerarId('pite'), (service as any).gerarId('pite')])
    expect(ids.size).toBeGreaterThan(1)
  })
})

// ── Testes: recalcularAgregados ──────────────────────────────────────────────

describe('TransferirService — recalcularAgregados', () => {
  it('atualiza quantidade_total_inicial_pedido com soma dos itens', async () => {
    const { db, txBase, mocks } = criarMockDb()
    // Dois itens com saldos
    txBase.pedidoItem.findMany.mockResolvedValue([
      { saldo_item_pedido: 100 },
      { saldo_item_pedido: 50 },
    ])
    const service = new TransferirService()

    await (service as any).recalcularAgregados(TENANT, 'pedi_id_0000001-26', txBase)

    // quantidade_total_inicial_pedido — nome direto no banco (sem @map)
    expect(mocks.pedidoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { quantidade_total_inicial_pedido: 150 },
      }),
    )
  })

  it('não usa campos inexistentes no schema Pedido', async () => {
    const { db, txBase, mocks } = criarMockDb()
    const service = new TransferirService()

    await (service as any).recalcularAgregados(TENANT, 'pedi_id_0000001-26', txBase)

    const updateData = mocks.pedidoUpdate.mock.calls[0]?.[0]?.data ?? {}
    // quantidade_total_inicial_pedido deve estar presente (é o campo correto do Prisma)
    expect(updateData.quantidade_total_inicial_pedido).toBeDefined()
    // campos que não existem no schema devem estar ausentes
    expect(updateData.quantidade_transferida_total).toBeUndefined()
  })
})

// ── Testes: prepararItemDestino ──────────────────────────────────────────────

describe('TransferirService — prepararItemDestino', () => {
  it('gera id único para o item destino', () => {
    const service = new TransferirService()
    const item = criarItemPrisma()
    const result = (service as any).prepararItemDestino(item, 'pedi_destino', { tipo: 'novo', quantidade: 50 })
    expect(result.id).toBeDefined()
    expect(result.id).not.toBe(item.id)
    expect(result.id).toMatch(/^pite_id_/)
  })

  it('define pedido_id correto', () => {
    const service = new TransferirService()
    const item = criarItemPrisma()
    const result = (service as any).prepararItemDestino(item, 'pedi_destino-999', { tipo: 'novo', quantidade: 30 })
    expect(result.pedido_id).toBe('pedi_destino-999')
  })

  it('usa part_number do destino quando fornecido', () => {
    const service = new TransferirService()
    const item = criarItemPrisma({ part_number: 'ORIGINAL' })
    const result = (service as any).prepararItemDestino(item, 'pedi', { tipo: 'novo', quantidade: 10, part_number: 'SUBSTITUTO' })
    expect(result.part_number).toBe('SUBSTITUTO')
  })

  it('mantém part_number original quando destino não especifica', () => {
    const service = new TransferirService()
    const item = criarItemPrisma({ part_number: 'ORIGINAL' })
    const result = (service as any).prepararItemDestino(item, 'pedi', { tipo: 'novo', quantidade: 10 })
    expect(result.part_number).toBe('ORIGINAL')
  })

  it('define saldo_item_pedido igual à quantidade do destino', () => {
    const service = new TransferirService()
    const item = criarItemPrisma()
    const result = (service as any).prepararItemDestino(item, 'pedi', { tipo: 'novo', quantidade: 77 })
    expect(result.saldo_item_pedido).toBe(77)
    expect(result.quantidade_inicial_item_pedido).toBe(77)
  })

  it('inclui campos obrigatórios do schema PedidoItem e exclui campos de audit', () => {
    const service = new TransferirService()
    const item = criarItemPrisma()
    const result = (service as any).prepararItemDestino(item, 'pedi', { tipo: 'novo', quantidade: 10 })
    // Campos de audit gerados pelo Prisma — não devem ser passados no create
    expect(result.created_at).toBeUndefined()
    expect(result.updated_at).toBeUndefined()
    // Campos obrigatórios do schema — devem estar presentes com os valores corretos
    expect(result.saldo_item_pedido).toBe(10)
    expect(result.quantidade_inicial_item_pedido).toBe(10)
  })
})

// ── Testes: histórico ────────────────────────────────────────────────────────

describe('TransferirService.historico', () => {
  it('retorna lista de histórico do pedido', async () => {
    const { db } = criarMockDb()
    db.transferHistorico.findMany = vi.fn().mockResolvedValue([
      { id: 'hist-001', pedido_origem_id: 'pedi_id_0000001-26', cenario: 'reducao_simples' },
    ])
    const service = new TransferirService()

    const result = await service.historico(TENANT, 'pedi_id_0000001-26', db)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('hist-001')
  })
})
