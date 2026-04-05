/**
 * edicaoEmMassaService.test.ts — Testes unitários do serviço de edição em massa
 *
 * Cobertura:
 *   - Operações: substituir, somar, subtrair, percentual, avancar_dias, recuar_dias
 *   - Campos bloqueados rejeitados
 *   - Detecção de múltiplos valores
 *   - Nível item — aplica em todos os itens dos pedidos
 *   - Campo não tocado — mantém valor original
 *   - Cross-tenant — rejeita pedidos de outro tenant
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EdicaoEmMassaService } from '../../../produto/pedido/server/src/services/edicaoEmMassaService'

// ── Helpers de mock ───────────────────────────────────────────────────────────

function criarPedidoMock(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    tenant_id: 'tenant-abc',
    company_id: 'company-1',
    numero_pedido: `PO-${id}`,
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    condicao_pagamento: '30/60/90',
    data_emissao_pedido: '2026-04-01T00:00:00.000Z',
    valor_total_pedido: 1000,
    itens: [],
    ...overrides,
  }
}

function criarItemMock(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    tenant_id: 'tenant-abc',
    pedido_id: 'pedido-1',
    part_number: 'PN-001',
    quantidade_inicial_item_pedido: 100,
    saldo_item_pedido: 100,
    quantidade_transferida_item: 0,
    valor_unitario: 10,
    valor_item: 1000,
    ...overrides,
  }
}

function criarDbMock(pedidos: ReturnType<typeof criarPedidoMock>[]) {
  const txMock = {
    pedido: {
      update: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
    },
    pedidoItem: {
      update: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
    },
    pedidoHistorico: {
      createMany: vi.fn().mockResolvedValue({}),
    },
  }

  return {
    pedido: {
      findMany: vi.fn().mockResolvedValue(pedidos),
    },
    $transaction: vi.fn().mockImplementation(async (fn: (tx: typeof txMock) => Promise<unknown>) => {
      return fn(txMock)
    }),
    _tx: txMock,
  }
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('EdicaoEmMassaService', () => {
  let service: EdicaoEmMassaService
  const TENANT = 'tenant-abc'
  const USER = 'user-1'

  beforeEach(() => {
    service = new EdicaoEmMassaService()
  })

  // ── substituir texto ────────────────────────────────────────────────────────

  it('substituir texto — campo atualizado em todos os pedidos', async () => {
    const pedidos = [
      criarPedidoMock('p1', { incoterm: 'FOB' }),
      criarPedidoMock('p2', { incoterm: 'CIF' }),
    ]
    const db = criarDbMock(pedidos)

    await service.confirmar(TENANT, USER, db, {
      pedido_ids: ['p1', 'p2'],
      campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CFR' }],
      nivel: 'pedido',
    })

    expect(db._tx.pedido.update).toHaveBeenCalledTimes(2)
    expect(db._tx.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { incoterm: 'CFR' } })
    )
  })

  // ── somar numero ────────────────────────────────────────────────────────────

  it('somar numero — 1000 + 100 = 1100', async () => {
    const pedidos = [criarPedidoMock('p1', { itens: [criarItemMock('i1', { quantidade_inicial_item_pedido: 1000 })] })]
    const db = criarDbMock(pedidos)

    await service.confirmar(TENANT, USER, db, {
      pedido_ids: ['p1'],
      campos: [{ campo: 'quantidade_inicial_item_pedido', tipo: 'numero', nivel: 'item', operacao: 'somar', valor: 100 }],
      nivel: 'item',
    })

    expect(db._tx.pedidoItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantidade_inicial_item_pedido: 1100 } })
    )
  })

  // ── subtrair numero ─────────────────────────────────────────────────────────

  it('subtrair numero — 1000 - 100 = 900', async () => {
    const pedidos = [criarPedidoMock('p1', { itens: [criarItemMock('i1', { quantidade_inicial_item_pedido: 1000 })] })]
    const db = criarDbMock(pedidos)

    await service.confirmar(TENANT, USER, db, {
      pedido_ids: ['p1'],
      campos: [{ campo: 'quantidade_inicial_item_pedido', tipo: 'numero', nivel: 'item', operacao: 'subtrair', valor: 100 }],
      nivel: 'item',
    })

    expect(db._tx.pedidoItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantidade_inicial_item_pedido: 900 } })
    )
  })

  // ── percentual ──────────────────────────────────────────────────────────────

  it('percentual — 1000 + 10% = 1100', async () => {
    const pedidos = [criarPedidoMock('p1', { itens: [criarItemMock('i1', { quantidade_inicial_item_pedido: 1000 })] })]
    const db = criarDbMock(pedidos)

    await service.confirmar(TENANT, USER, db, {
      pedido_ids: ['p1'],
      campos: [{ campo: 'quantidade_inicial_item_pedido', tipo: 'numero', nivel: 'item', operacao: 'percentual', valor: 10 }],
      nivel: 'item',
    })

    expect(db._tx.pedidoItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantidade_inicial_item_pedido: 1100 } })
    )
  })

  // ── avancar_dias ────────────────────────────────────────────────────────────

  it('avancar_dias — 10/04 + 5 = 15/04', async () => {
    const dataBase = '2026-04-10T00:00:00.000Z'
    const pedidos = [criarPedidoMock('p1', { data_emissao_pedido: dataBase })]
    const db = criarDbMock(pedidos)

    await service.confirmar(TENANT, USER, db, {
      pedido_ids: ['p1'],
      campos: [{ campo: 'data_emissao_pedido', tipo: 'data', nivel: 'pedido', operacao: 'avancar_dias', valor: 5 }],
      nivel: 'pedido',
    })

    const chamada = db._tx.pedido.update.mock.calls[0][0]
    const dataResultante = new Date(chamada.data.data_emissao_pedido as string)
    expect(dataResultante.getUTCDate()).toBe(15)
  })

  // ── recuar_dias ─────────────────────────────────────────────────────────────

  it('recuar_dias — 10/04 - 5 = 05/04', async () => {
    const dataBase = '2026-04-10T00:00:00.000Z'
    const pedidos = [criarPedidoMock('p1', { data_emissao_pedido: dataBase })]
    const db = criarDbMock(pedidos)

    await service.confirmar(TENANT, USER, db, {
      pedido_ids: ['p1'],
      campos: [{ campo: 'data_emissao_pedido', tipo: 'data', nivel: 'pedido', operacao: 'recuar_dias', valor: 5 }],
      nivel: 'pedido',
    })

    const chamada = db._tx.pedido.update.mock.calls[0][0]
    const dataResultante = new Date(chamada.data.data_emissao_pedido as string)
    expect(dataResultante.getUTCDate()).toBe(5)
  })

  // ── campo bloqueado — rejeita ───────────────────────────────────────────────

  it('campo bloqueado — rejeita valor_total_pedido', async () => {
    const db = criarDbMock([])

    await expect(
      service.confirmar(TENANT, USER, db, {
        pedido_ids: ['p1'],
        campos: [{ campo: 'valor_total_pedido', tipo: 'numero', nivel: 'pedido', operacao: 'substituir', valor: 9999 }],
        nivel: 'pedido',
      })
    ).rejects.toThrow('CAMPO_BLOQUEADO')
  })

  it('campo bloqueado — rejeita saldo_item_pedido no item', async () => {
    const db = criarDbMock([])

    await expect(
      service.confirmar(TENANT, USER, db, {
        pedido_ids: ['p1'],
        campos: [{ campo: 'saldo_item_pedido', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 999 }],
        nivel: 'item',
      })
    ).rejects.toThrow('CAMPO_BLOQUEADO')
  })

  // ── multiplos_valores — detecta corretamente ────────────────────────────────

  it('multiplos_valores — detecta corretamente campos com valores distintos', async () => {
    const pedidos = [
      criarPedidoMock('p1', { incoterm: 'FOB' }),
      criarPedidoMock('p2', { incoterm: 'CIF' }),
    ]
    const db = criarDbMock(pedidos)

    const result = await service.preview(TENANT, db, {
      pedido_ids: ['p1', 'p2'],
      campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CFR' }],
      nivel: 'pedido',
    })

    expect(result.campos[0].multiplos_valores).toBe(true)
    expect(result.campos[0].valores_distintos).toContain('FOB')
    expect(result.campos[0].valores_distintos).toContain('CIF')
  })

  it('multiplos_valores = false quando todos os pedidos têm o mesmo valor', async () => {
    const pedidos = [
      criarPedidoMock('p1', { incoterm: 'FOB' }),
      criarPedidoMock('p2', { incoterm: 'FOB' }),
    ]
    const db = criarDbMock(pedidos)

    const result = await service.preview(TENANT, db, {
      pedido_ids: ['p1', 'p2'],
      campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CFR' }],
      nivel: 'pedido',
    })

    expect(result.campos[0].multiplos_valores).toBe(false)
  })

  // ── nivel item — aplica em todos os itens ───────────────────────────────────

  it('nivel item — aplica em todos os itens dos pedidos selecionados', async () => {
    const pedidos = [
      criarPedidoMock('p1', {
        itens: [
          criarItemMock('i1', { quantidade_inicial_item_pedido: 100 }),
          criarItemMock('i2', { quantidade_inicial_item_pedido: 200 }),
        ],
      }),
    ]
    const db = criarDbMock(pedidos)

    const result = await service.confirmar(TENANT, USER, db, {
      pedido_ids: ['p1'],
      campos: [{ campo: 'quantidade_inicial_item_pedido', tipo: 'numero', nivel: 'item', operacao: 'somar', valor: 50 }],
      nivel: 'item',
    })

    expect(result.itens_atualizados).toBe(2)
    expect(db._tx.pedidoItem.update).toHaveBeenCalledTimes(2)
  })

  // ── campo não tocado — mantém valor original ────────────────────────────────

  it('campo nao tocado — mantém valor original (apenas campos especificados são alterados)', async () => {
    const pedidos = [criarPedidoMock('p1', { incoterm: 'FOB', moeda_pedido: 'USD' })]
    const db = criarDbMock(pedidos)

    await service.confirmar(TENANT, USER, db, {
      pedido_ids: ['p1'],
      campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
      nivel: 'pedido',
    })

    // Apenas incoterm foi passado — moeda_pedido não deve aparecer no update
    const chamada = db._tx.pedido.update.mock.calls[0][0]
    expect(chamada.data).toHaveProperty('incoterm', 'CIF')
    expect(chamada.data).not.toHaveProperty('moeda_pedido')
  })

  // ── cross-tenant — rejeita pedidos de outro tenant ──────────────────────────

  it('cross-tenant — rejeita quando nenhum pedido pertence ao tenant', async () => {
    // findMany retorna vazio (tenant_id diferente filtra no banco)
    const db = criarDbMock([])

    await expect(
      service.confirmar(TENANT, USER, db, {
        pedido_ids: ['pedido-outro-tenant'],
        campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'pedido',
      })
    ).rejects.toThrow('NOT_FOUND')
  })

  // ── preview retorna afetados corretamente ───────────────────────────────────

  it('preview — retorna pedidos_afetados e itens_afetados corretamente', async () => {
    const pedidos = [
      criarPedidoMock('p1', { itens: [criarItemMock('i1'), criarItemMock('i2')] }),
      criarPedidoMock('p2', { itens: [criarItemMock('i3')] }),
    ]
    const db = criarDbMock(pedidos)

    const result = await service.preview(TENANT, db, {
      pedido_ids: ['p1', 'p2'],
      campos: [{ campo: 'incoterm', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
      nivel: 'pedido',
    })

    expect(result.pedidos_afetados).toBe(2)
    expect(result.itens_afetados).toBe(3)
  })
})
