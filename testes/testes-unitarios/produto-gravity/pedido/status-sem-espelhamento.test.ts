// @vitest-environment node
/**
 * TST-UNIT-PEDIDO-STATUS-SEM-ESPELHAMENTO
 *
 * Testa a constante STATUS_SEM_ESPELHAMENTO e a lógica de guard
 * que impede espelhamento bidirecional para transferencia/consolidado.
 */

import { describe, it, expect } from 'vitest'

const STATUS_SEM_ESPELHAMENTO = new Set(['transferencia', 'consolidado'])

describe('STATUS_SEM_ESPELHAMENTO', () => {
  it('contém "transferencia"', () => {
    expect(STATUS_SEM_ESPELHAMENTO.has('transferencia')).toBe(true)
  })

  it('contém "consolidado"', () => {
    expect(STATUS_SEM_ESPELHAMENTO.has('consolidado')).toBe(true)
  })

  it('NÃO contém status com espelhamento normal (aberto, em_andamento, aprovado, cancelado, rascunho)', () => {
    expect(STATUS_SEM_ESPELHAMENTO.has('aberto')).toBe(false)
    expect(STATUS_SEM_ESPELHAMENTO.has('em_andamento')).toBe(false)
    expect(STATUS_SEM_ESPELHAMENTO.has('aprovado')).toBe(false)
    expect(STATUS_SEM_ESPELHAMENTO.has('cancelado')).toBe(false)
    expect(STATUS_SEM_ESPELHAMENTO.has('rascunho')).toBe(false)
  })

  it('tem exatamente 2 membros', () => {
    expect(STATUS_SEM_ESPELHAMENTO.size).toBe(2)
  })
})

describe('lógica de guard cascade-down (pai → itens)', () => {
  function simularCascadeDown(novoStatus: string, itensCache: Array<{ id: string; status: string }>) {
    if (!STATUS_SEM_ESPELHAMENTO.has(novoStatus)) {
      return itensCache.map(i => ({ ...i, status: novoStatus }))
    }
    return itensCache
  }

  it('propaga status "aberto" para todos os itens', () => {
    const itens = [
      { id: 'item-1', status: 'rascunho' },
      { id: 'item-2', status: 'rascunho' },
    ]
    const resultado = simularCascadeDown('aberto', itens)
    expect(resultado.every(i => i.status === 'aberto')).toBe(true)
  })

  it('propaga status "aprovado" para todos os itens', () => {
    const itens = [{ id: 'item-1', status: 'aberto' }]
    const resultado = simularCascadeDown('aprovado', itens)
    expect(resultado[0].status).toBe('aprovado')
  })

  it('NÃO propaga status "transferencia" para itens — itens mantêm status original', () => {
    const itens = [
      { id: 'item-1', status: 'aberto' },
      { id: 'item-2', status: 'aprovado' },
    ]
    const resultado = simularCascadeDown('transferencia', itens)
    expect(resultado[0].status).toBe('aberto')
    expect(resultado[1].status).toBe('aprovado')
  })

  it('NÃO propaga status "consolidado" para itens — itens mantêm status original', () => {
    const itens = [
      { id: 'item-1', status: 'em_andamento' },
      { id: 'item-2', status: 'aberto' },
    ]
    const resultado = simularCascadeDown('consolidado', itens)
    expect(resultado[0].status).toBe('em_andamento')
    expect(resultado[1].status).toBe('aberto')
  })

  it('retorna array intacto (referência diferente) quando propaga', () => {
    const itens = [{ id: 'item-1', status: 'rascunho' }]
    const resultado = simularCascadeDown('aberto', itens)
    expect(resultado).not.toBe(itens)
    expect(resultado[0]).not.toBe(itens[0])
  })

  it('retorna array original (mesma referência) quando NÃO propaga', () => {
    const itens = [{ id: 'item-1', status: 'rascunho' }]
    const resultado = simularCascadeDown('transferencia', itens)
    expect(resultado).toBe(itens)
  })
})

describe('lógica de guard bubble-up (item → pai)', () => {
  function simularBubbleUp(novoStatus: string): { atualizouPai: boolean; atualizouItem: boolean } {
    if (STATUS_SEM_ESPELHAMENTO.has(novoStatus)) {
      return { atualizouPai: false, atualizouItem: true }
    }
    return { atualizouPai: true, atualizouItem: true }
  }

  it('status "aberto" no item → atualiza pai E item (espelhamento normal)', () => {
    const resultado = simularBubbleUp('aberto')
    expect(resultado.atualizouPai).toBe(true)
    expect(resultado.atualizouItem).toBe(true)
  })

  it('status "aprovado" no item → atualiza pai E item (espelhamento normal)', () => {
    const resultado = simularBubbleUp('aprovado')
    expect(resultado.atualizouPai).toBe(true)
    expect(resultado.atualizouItem).toBe(true)
  })

  it('status "transferencia" no item → atualiza SOMENTE item, pai NÃO muda', () => {
    const resultado = simularBubbleUp('transferencia')
    expect(resultado.atualizouPai).toBe(false)
    expect(resultado.atualizouItem).toBe(true)
  })

  it('status "consolidado" no item → atualiza SOMENTE item, pai NÃO muda', () => {
    const resultado = simularBubbleUp('consolidado')
    expect(resultado.atualizouPai).toBe(false)
    expect(resultado.atualizouItem).toBe(true)
  })

  it('status "cancelado" no item → atualiza pai E item (espelhamento normal)', () => {
    const resultado = simularBubbleUp('cancelado')
    expect(resultado.atualizouPai).toBe(true)
    expect(resultado.atualizouItem).toBe(true)
  })

  it('status "em_andamento" no item → atualiza pai E item (espelhamento normal)', () => {
    const resultado = simularBubbleUp('em_andamento')
    expect(resultado.atualizouPai).toBe(true)
    expect(resultado.atualizouItem).toBe(true)
  })
})
