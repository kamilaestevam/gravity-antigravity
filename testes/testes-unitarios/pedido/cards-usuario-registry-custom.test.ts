/// <reference types="vitest/globals" />

import {
  buildCustomCardEntry,
  computeCardStats,
  type CardComputedStats,
} from '../../../servicos-global/produto/pedido/client/src/shared/cardRegistry.js'
import type { CardUsuario } from '../../../servicos-global/produto/pedido/client/src/shared/types.js'

// ── Fixtures ─────────────────────────────────────────────────────────────────

function criarStats(parcial: Partial<CardComputedStats> = {}): CardComputedStats {
  return {
    total: 10,
    valorTotal: 50000,
    qtdTotal: 1000,
    qtdAtualTotal: 800,
    itensProntos: 200,
    coberturaPend: 5000,
    pedidosAtrasados: 2,
    pedidosAbertos: 4,
    pedidosEmAndamento: 3,
    qtdTransferida: 150,
    qtdInicial: 950,
    valorItens: 45000,
    nItens: 25,
    ...parcial,
  }
}

function criarCardUsuario(parcial: Partial<CardUsuario> = {}): CardUsuario {
  return {
    id: 'card_01',
    tenant_id: 'org_01',
    nome: 'Saldo Valor',
    icone: 'CurrencyDollar',
    cor: '#34d399',
    formula_expressao: 'valor_total_pedido',
    formula_dependencias: ['valor_total_pedido'],
    ordem: 0,
    ativo: true,
    created_by: 'user_01',
    created_at: '2026-05-17T00:00:00.000Z',
    ...parcial,
  }
}

// ── buildCustomCardEntry ─────────────────────────────────────────────────────

describe('buildCustomCardEntry', () => {
  it('retorna entry com subtexto = nome do card', () => {
    const card = criarCardUsuario({ nome: 'Meu KPI' })
    const entry = buildCustomCardEntry(card)
    expect(entry.subtexto(criarStats())).toBe('Meu KPI')
  })

  it('getValue avalia campo simples (valor_total_pedido)', () => {
    const card = criarCardUsuario({ formula_expressao: 'valor_total_pedido' })
    const entry = buildCustomCardEntry(card)
    const stats = criarStats({ valorTotal: 75000 })
    expect(entry.getValue(stats)).toBe(75000)
  })

  it('getValue avalia soma de dois campos', () => {
    const card = criarCardUsuario({
      formula_expressao: 'valor_total_pedido + valor_total_item',
    })
    const entry = buildCustomCardEntry(card)
    const stats = criarStats({ valorTotal: 10000, valorItens: 8000 })
    expect(entry.getValue(stats)).toBe(18000)
  })

  it('getValue avalia subtração', () => {
    const card = criarCardUsuario({
      formula_expressao: 'quantidade_total_pedido - quantidade_transferida_pedido',
    })
    const entry = buildCustomCardEntry(card)
    const stats = criarStats({ qtdTotal: 500, qtdTransferida: 120 })
    expect(entry.getValue(stats)).toBe(380)
  })

  it('getValue avalia multiplicação', () => {
    const card = criarCardUsuario({
      formula_expressao: 'total_pedidos * quantidade_inicial_pedido',
    })
    const entry = buildCustomCardEntry(card)
    const stats = criarStats({ total: 5, qtdInicial: 200 })
    expect(entry.getValue(stats)).toBe(1000)
  })

  it('getValue avalia divisão', () => {
    const card = criarCardUsuario({
      formula_expressao: 'valor_total_pedido / total_pedidos',
    })
    const entry = buildCustomCardEntry(card)
    const stats = criarStats({ valorTotal: 10000, total: 4 })
    expect(entry.getValue(stats)).toBe(2500)
  })

  it('divisão por zero retorna 0', () => {
    const card = criarCardUsuario({
      formula_expressao: 'valor_total_pedido / total_pedidos',
    })
    const entry = buildCustomCardEntry(card)
    const stats = criarStats({ valorTotal: 10000, total: 0 })
    expect(entry.getValue(stats)).toBe(0)
  })

  it('fórmula inválida retorna 0', () => {
    const card = criarCardUsuario({
      formula_expressao: '+ + + inválido',
    })
    const entry = buildCustomCardEntry(card)
    expect(entry.getValue(criarStats())).toBe(0)
  })

  it('campo desconhecido na fórmula retorna 0 para aquele campo', () => {
    const card = criarCardUsuario({
      formula_expressao: 'campo_inexistente',
    })
    const entry = buildCustomCardEntry(card)
    expect(entry.getValue(criarStats())).toBe(0)
  })

  it('format retorna string formatada (fmtQuantidade)', () => {
    const card = criarCardUsuario()
    const entry = buildCustomCardEntry(card)
    const formatted = entry.format(12345.67)
    expect(typeof formatted).toBe('string')
    expect(formatted).not.toBe('')
  })

  it('saldo_itens_do_pedido mapeia para qtdAtualTotal', () => {
    const card = criarCardUsuario({
      formula_expressao: 'saldo_itens_do_pedido',
    })
    const entry = buildCustomCardEntry(card)
    const stats = criarStats({ qtdAtualTotal: 777 })
    expect(entry.getValue(stats)).toBe(777)
  })

  it('card com metric:pedidos_abertos usa valor do registry', () => {
    const card = criarCardUsuario({
      formula_expressao: 'metric:pedidos_abertos',
    })
    const entry = buildCustomCardEntry(card)
    const stats = criarStats({ pedidosAbertos: 12 })
    expect(entry.getValue(stats)).toBe(12)
  })
})

// ── computeCardStats ─────────────────────────────────────────────────────────

describe('computeCardStats', () => {
  it('retorna total do argumento, não pedidos.length', () => {
    const stats = computeCardStats([], [], 42, '2026-05-17')
    expect(stats.total).toBe(42)
  })

  it('soma valorTotal dos pedidos', () => {
    const pedidos = [
      { valor_total_pedido: 100, status: 'aberto' },
      { valor_total_pedido: 250, status: 'aberto' },
    ] as any[]
    const stats = computeCardStats(pedidos, [], 2, '2026-05-17')
    expect(stats.valorTotal).toBe(350)
  })

  it('soma qtdTotal dos pedidos', () => {
    const pedidos = [
      { quantidade_total_pedido: 50, status: 'aberto' },
      { quantidade_total_pedido: 30, status: 'aberto' },
    ] as any[]
    const stats = computeCardStats(pedidos, [], 2, '2026-05-17')
    expect(stats.qtdTotal).toBe(80)
  })

  it('soma valorItens dos itens', () => {
    const itens = [
      { valor_total_item: 500 },
      { valor_total_item: 300 },
    ] as any[]
    const stats = computeCardStats([], itens, 0, '2026-05-17')
    expect(stats.valorItens).toBe(800)
  })

  it('conta pedidosAtrasados corretamente (exclui consolidado/cancelado)', () => {
    const pedidos = [
      { status: 'aberto', data_prevista_pedido_pronto: '2026-05-01' },
      { status: 'aberto', data_prevista_pedido_pronto: '2026-06-01' },
      { status: 'consolidado', data_prevista_pedido_pronto: '2026-04-01' },
    ] as any[]
    const stats = computeCardStats(pedidos, [], 3, '2026-05-17')
    expect(stats.pedidosAtrasados).toBe(1)
  })

  it('conta pedidosEmAndamento com transferencia e em_andamento', () => {
    const pedidos = [
      { status: 'transferencia' },
      { status: 'em_andamento' },
      { status: 'aberto' },
    ] as any[]
    const stats = computeCardStats(pedidos, [], 3, '2026-05-17')
    expect(stats.pedidosEmAndamento).toBe(2)
  })

  it('safeNum evita concatenação string em soma de qtdTotal', () => {
    const pedidos = [
      { quantidade_total_pedido: 100, status: 'aberto' },
      { quantidade_total_pedido: '50', status: 'aberto' },
    ] as any[]
    const stats = computeCardStats(pedidos, [], 2, '2026-05-17')
    expect(stats.qtdTotal).toBe(150)
  })

  it('usa totalItensBanco quando fornecido e > 0', () => {
    const itens = [{ valor_total_item: 1 }, { valor_total_item: 2 }] as any[]
    const stats = computeCardStats([], itens, 0, '2026-05-17', 100)
    expect(stats.nItens).toBe(100)
  })

  it('usa itens.length quando totalItensBanco é 0', () => {
    const itens = [{ valor_total_item: 1 }, { valor_total_item: 2 }] as any[]
    const stats = computeCardStats([], itens, 0, '2026-05-17', 0)
    expect(stats.nItens).toBe(2)
  })

  it('calcula coberturaPend de pedidos sem cobertura', () => {
    const pedidos = [
      { valor_total_pedido: 1000, itens: [{ cobertura_cambial: 'sem_cobertura' }] },
      { valor_total_pedido: 2000, itens: [{ cobertura_cambial: 'com_cobertura' }] },
    ] as any[]
    const stats = computeCardStats(pedidos, [], 2, '2026-05-17')
    expect(stats.coberturaPend).toBe(1000)
  })

  it('lista vazia produz stats zeradas', () => {
    const stats = computeCardStats([], [], 0, '2026-05-17')
    expect(stats.valorTotal).toBe(0)
    expect(stats.qtdTotal).toBe(0)
    expect(stats.qtdAtualTotal).toBe(0)
    expect(stats.itensProntos).toBe(0)
    expect(stats.pedidosAtrasados).toBe(0)
    expect(stats.pedidosAbertos).toBe(0)
    expect(stats.pedidosEmAndamento).toBe(0)
  })
})
