/**
 * Testes unitarios — Pedido / saldoEngine.ts
 *
 * Testa a Matematica de Saldo Imutavel:
 *   quantidade_inicial_pedido = quantidade_saldo_pedido + quantidade_transferida_pedido + quantidade_cancelada_pedido
 *
 * Cenarios:
 *   - Transferencia valida
 *   - Anti-sobre-execucao (rejeitar quando saldo insuficiente)
 *   - Cancelamento valido
 *   - Cancelamento excedente (rejeitar)
 *   - Atualizar quantidade pronta
 *   - Validacao de integridade da formula
 *   - Quantidade zero ou negativa (rejeitar)
 *   - Item nao encontrado (404)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saldoEngine, AppError } from '../../../servicos-global/tenant/processos-core/src/services/saldoEngine'

// ── Mock do Prisma ────────────────────────────────────────────────────────────

function criarItemMock(overrides = {}) {
  return {
    id: 'pite_id_0000001/26',
    tenant_id: 'tenant-001',
    company_id: 'company-001',
    pedido_id: 'pedi_id_0000001/26',
    quantidade_inicial_pedido: 1000,
    quantidade_saldo_pedido: 1000,
    quantidade_pronta_pedido: 0,
    quantidade_transferida_pedido: 0,
    quantidade_cancelada_pedido: 0,
    ...overrides,
  }
}

function criarPrismaMock(itemData = criarItemMock()) {
  const findFirst = vi.fn().mockResolvedValue(itemData)
  const update = vi.fn().mockImplementation(({ data }) => {
    const updated = { ...itemData, ...data }
    return Promise.resolve(updated)
  })
  const findMany = vi.fn().mockResolvedValue([itemData])
  const pedidoUpdate = vi.fn().mockResolvedValue({})

  const prisma = {
    pedidoItem: { findFirst, update, findMany },
    pedido: { update: pedidoUpdate },
    $transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      return fn({
        pedidoItem: { findFirst, update, findMany },
        pedido: { update: pedidoUpdate },
      })
    }),
  }

  return prisma as unknown
}

// ── Testes: Transferencia ─────────────────────────────────────────────────────

describe('saldoEngine.transferir', () => {
  it('deve transferir quantidade e debitar saldo atual', async () => {
    const item = criarItemMock({ quantidade_saldo_pedido: 1000, quantidade_transferida_pedido: 0 })
    const prisma = criarPrismaMock(item)

    const result = await saldoEngine.transferir(prisma as never, {
      pedido_item_id: 'pite_id_0000001/26',
      quantidade: 400,
      tenant_id: 'tenant-001',
      company_id: 'company-001',
    })

    expect(result.quantidade_saldo_pedido).toBe(600)
    expect(result.quantidade_transferida_pedido).toBe(400)
    expect(result.quantidade_inicial_pedido).toBe(1000)
  })

  it('deve transferir toda a quantidade disponivel', async () => {
    const item = criarItemMock({ quantidade_saldo_pedido: 500, quantidade_transferida_pedido: 500 })
    const prisma = criarPrismaMock(item)

    const result = await saldoEngine.transferir(prisma as never, {
      pedido_item_id: 'pite_id_0000001/26',
      quantidade: 500,
      tenant_id: 'tenant-001',
      company_id: 'company-001',
    })

    expect(result.quantidade_saldo_pedido).toBe(0)
    expect(result.quantidade_transferida_pedido).toBe(1000)
  })

  it('deve REJEITAR transferencia quando saldo insuficiente (anti-sobre-execucao)', async () => {
    const item = criarItemMock({ quantidade_saldo_pedido: 100, quantidade_transferida_pedido: 900 })
    const prisma = criarPrismaMock(item)

    await expect(
      saldoEngine.transferir(prisma as never, {
        pedido_item_id: 'pite_id_0000001/26',
        quantidade: 150,
        tenant_id: 'tenant-001',
        company_id: 'company-001',
      })
    ).rejects.toThrow('Quantidade solicitada (150) excede saldo disponivel (100)')
  })

  it('deve REJEITAR transferencia com quantidade zero', async () => {
    const prisma = criarPrismaMock()

    await expect(
      saldoEngine.transferir(prisma as never, {
        pedido_item_id: 'pite_id_0000001/26',
        quantidade: 0,
        tenant_id: 'tenant-001',
        company_id: 'company-001',
      })
    ).rejects.toThrow('Quantidade deve ser maior que zero')
  })

  it('deve REJEITAR transferencia com quantidade negativa', async () => {
    const prisma = criarPrismaMock()

    await expect(
      saldoEngine.transferir(prisma as never, {
        pedido_item_id: 'pite_id_0000001/26',
        quantidade: -10,
        tenant_id: 'tenant-001',
        company_id: 'company-001',
      })
    ).rejects.toThrow('Quantidade deve ser maior que zero')
  })

  it('deve retornar 404 quando item nao encontrado', async () => {
    const prisma = criarPrismaMock(null as never)
    ;(prisma as { pedidoItem: { findFirst: ReturnType<typeof vi.fn> } }).pedidoItem.findFirst = vi.fn().mockResolvedValue(null)
    ;(prisma as { $transaction: ReturnType<typeof vi.fn> }).$transaction = vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      return fn({
        pedidoItem: { findFirst: vi.fn().mockResolvedValue(null), update: vi.fn() },
        pedido: { update: vi.fn() },
      })
    })

    await expect(
      saldoEngine.transferir(prisma as never, {
        pedido_item_id: 'inexistente',
        quantidade: 100,
        tenant_id: 'tenant-001',
        company_id: 'company-001',
      })
    ).rejects.toThrow('Item do pedido nao encontrado')
  })
})

// ── Testes: Cancelamento ──────────────────────────────────────────────────────

describe('saldoEngine.cancelar', () => {
  it('deve cancelar quantidade e debitar saldo atual', async () => {
    const item = criarItemMock({ quantidade_saldo_pedido: 1000, quantidade_cancelada_pedido: 0 })
    const prisma = criarPrismaMock(item)

    const result = await saldoEngine.cancelar(prisma as never, {
      pedido_item_id: 'pite_id_0000001/26',
      quantidade: 200,
      tenant_id: 'tenant-001',
      company_id: 'company-001',
    })

    expect(result.quantidade_saldo_pedido).toBe(800)
    expect(result.quantidade_cancelada_pedido).toBe(200)
    expect(result.quantidade_inicial_pedido).toBe(1000)
  })

  it('deve REJEITAR cancelamento quando saldo insuficiente', async () => {
    const item = criarItemMock({ quantidade_saldo_pedido: 50, quantidade_transferida_pedido: 950 })
    const prisma = criarPrismaMock(item)

    await expect(
      saldoEngine.cancelar(prisma as never, {
        pedido_item_id: 'pite_id_0000001/26',
        quantidade: 100,
        tenant_id: 'tenant-001',
        company_id: 'company-001',
      })
    ).rejects.toThrow('Quantidade a cancelar (100) excede saldo disponivel (50)')
  })

  it('deve REJEITAR cancelamento com quantidade zero', async () => {
    const prisma = criarPrismaMock()

    await expect(
      saldoEngine.cancelar(prisma as never, {
        pedido_item_id: 'pite_id_0000001/26',
        quantidade: 0,
        tenant_id: 'tenant-001',
        company_id: 'company-001',
      })
    ).rejects.toThrow('Quantidade deve ser maior que zero')
  })
})

// ── Testes: Atualizar Pronta ──────────────────────────────────────────────────

describe('saldoEngine.atualizarPronta', () => {
  it('deve atualizar quantidade pronta sem afetar saldo', async () => {
    const item = criarItemMock({ quantidade_saldo_pedido: 1000, quantidade_pronta_pedido: 0 })
    const prisma = criarPrismaMock(item)
    // Override para nao usar $transaction
    ;(prisma as { pedidoItem: { findFirst: ReturnType<typeof vi.fn> } }).pedidoItem.findFirst = vi.fn().mockResolvedValue(item)
    ;(prisma as { pedidoItem: { update: ReturnType<typeof vi.fn> } }).pedidoItem.update = vi.fn().mockResolvedValue({
      ...item,
      quantidade_pronta_pedido: 600,
    })

    const result = await saldoEngine.atualizarPronta(prisma as never, {
      pedido_item_id: 'pite_id_0000001/26',
      quantidade_pronta_pedido: 600,
      tenant_id: 'tenant-001',
      company_id: 'company-001',
    })

    expect(result.quantidade_pronta_pedido).toBe(600)
    expect(result.quantidade_saldo_pedido).toBe(1000) // nao afeta saldo
    expect(result.quantidade_transferida_pedido).toBe(0)
  })

  it('deve REJEITAR quantidade pronta negativa', async () => {
    const prisma = criarPrismaMock()

    await expect(
      saldoEngine.atualizarPronta(prisma as never, {
        pedido_item_id: 'pite_id_0000001/26',
        quantidade_pronta: -10,
        tenant_id: 'tenant-001',
        company_id: 'company-001',
      })
    ).rejects.toThrow('Quantidade pronta nao pode ser negativa')
  })
})

// ── Testes: Validacao de Integridade ──────────────────────────────────────────

describe('saldoEngine.validarIntegridade', () => {
  it('deve validar formula imutavel (1000 = 600 + 200 + 200)', () => {
    const result = saldoEngine.validarIntegridade({
      id: 'test',
      quantidade_inicial_pedido: 1000,
      quantidade_saldo_pedido: 600,
      quantidade_transferida_pedido: 200,
      quantidade_cancelada_pedido: 200,
      quantidade_pronta_pedido: 0,
    })
    expect(result).toBe(true)
  })

  it('deve validar formula com saldo totalmente transferido (1000 = 0 + 1000 + 0)', () => {
    const result = saldoEngine.validarIntegridade({
      id: 'test',
      quantidade_inicial_pedido: 1000,
      quantidade_saldo_pedido: 0,
      quantidade_transferida_pedido: 1000,
      quantidade_cancelada_pedido: 0,
      quantidade_pronta_pedido: 0,
    })
    expect(result).toBe(true)
  })

  it('deve validar formula com saldo totalmente cancelado', () => {
    const result = saldoEngine.validarIntegridade({
      id: 'test',
      quantidade_inicial_pedido: 500,
      quantidade_saldo_pedido: 0,
      quantidade_transferida_pedido: 0,
      quantidade_cancelada_pedido: 500,
      quantidade_pronta_pedido: 0,
    })
    expect(result).toBe(true)
  })

  it('deve detectar integridade violada (soma nao bate)', () => {
    const result = saldoEngine.validarIntegridade({
      id: 'test',
      quantidade_inicial_pedido: 1000,
      quantidade_saldo_pedido: 600,
      quantidade_transferida_pedido: 200,
      quantidade_cancelada_pedido: 100, // 600 + 200 + 100 = 900 != 1000
      quantidade_pronta_pedido: 0,
    })
    expect(result).toBe(false)
  })

  it('deve tolerar diferenca de arredondamento (<0.001)', () => {
    const result = saldoEngine.validarIntegridade({
      id: 'test',
      quantidade_inicial_pedido: 100,
      quantidade_saldo_pedido: 33.333,
      quantidade_transferida_pedido: 33.333,
      quantidade_cancelada_pedido: 33.334,
      quantidade_pronta_pedido: 0,
    })
    expect(result).toBe(true)
  })

  it('deve aceitar item intacto (saldo = inicial)', () => {
    const result = saldoEngine.validarIntegridade({
      id: 'test',
      quantidade_inicial_pedido: 5000,
      quantidade_saldo_pedido: 5000,
      quantidade_transferida_pedido: 0,
      quantidade_cancelada_pedido: 0,
      quantidade_pronta_pedido: 3000,
    })
    expect(result).toBe(true)
  })
})
