/**
 * Testes unitários — formulaEngine.ts (backend port)
 *
 * Cobre o parser + evaluator duplicado do client para rodar no backend.
 * O arquivo duplica produto/pedido/client/src/shared/formulaEngine.ts com
 * o marcador "MANTER EM SINCRONIA". Este teste trava o contrato.
 *
 * Cenários:
 *   - Parser: números, campos, aritmética, precedência, parênteses
 *   - Parser: condição com SE()
 *   - Parser: SOMA_ITENS()
 *   - Parser: erros de sintaxe descritivos
 *   - Evaluator: operações aritméticas corretas
 *   - Evaluator: temNulo quando campo é null/undefined
 *   - Evaluator: divisão por zero → temNulo=true
 *   - Evaluator: SE() verdadeiro/falso
 *   - buildContextoItem: mapeia tokens pedido-level → valores item-level
 *   - SALDO_FORMULA_PADRAO: fórmula default válida e parseável
 *   - TOKEN_PEDIDO_PARA_ITEM: mapa completo dos 5 tokens esperados
 *   - extrairDependencias: retorna campos únicos de uma expressão
 */

import { describe, it, expect } from 'vitest'
import {
  parsearFormula,
  avaliarFormula,
  buildContextoItem,
  extrairDependencias,
  SALDO_FORMULA_PADRAO,
  TOKEN_PEDIDO_PARA_ITEM,
} from '../../../servicos-global/tenant/processos-core/src/services/formulaEngine'

// ── Parser ────────────────────────────────────────────────────────────────────

describe('parsearFormula — parser básico', () => {
  it('parseia número literal', () => {
    const ast = parsearFormula('42')
    expect(ast).toEqual({ tipo: 'numero', valor: 42 })
  })

  it('parseia número decimal', () => {
    const ast = parsearFormula('3.14')
    expect(ast).toEqual({ tipo: 'numero', valor: 3.14 })
  })

  it('parseia referência a campo', () => {
    const ast = parsearFormula('quantidade_inicial')
    expect(ast).toEqual({ tipo: 'campo', chave: 'quantidade_inicial' })
  })

  it('parseia soma simples', () => {
    const ast = parsearFormula('a + b')
    expect(ast).toEqual({
      tipo: 'binop',
      op: '+',
      esq: { tipo: 'campo', chave: 'a' },
      dir: { tipo: 'campo', chave: 'b' },
    })
  })

  it('respeita precedência * > +', () => {
    // a + b * c = a + (b * c)
    const ast = parsearFormula('a + b * c')
    expect(ast).toEqual({
      tipo: 'binop',
      op: '+',
      esq: { tipo: 'campo', chave: 'a' },
      dir: {
        tipo: 'binop',
        op: '*',
        esq: { tipo: 'campo', chave: 'b' },
        dir: { tipo: 'campo', chave: 'c' },
      },
    })
  })

  it('respeita parênteses', () => {
    // (a + b) * c
    const ast = parsearFormula('(a + b) * c')
    expect(ast).toEqual({
      tipo: 'binop',
      op: '*',
      esq: {
        tipo: 'binop',
        op: '+',
        esq: { tipo: 'campo', chave: 'a' },
        dir: { tipo: 'campo', chave: 'b' },
      },
      dir: { tipo: 'campo', chave: 'c' },
    })
  })

  it('parseia subtração unária', () => {
    const ast = parsearFormula('-5')
    // Implementação: binop 0 - 5
    expect(ast).toEqual({
      tipo: 'binop',
      op: '-',
      esq: { tipo: 'numero', valor: 0 },
      dir: { tipo: 'numero', valor: 5 },
    })
  })

  it('parseia fórmula default do saldo', () => {
    const ast = parsearFormula(SALDO_FORMULA_PADRAO)
    expect(ast.tipo).toBe('binop')
  })
})

describe('parsearFormula — funções', () => {
  it('parseia SE(condicao, v1, v2)', () => {
    const ast = parsearFormula('SE(saldo > 0, saldo, 0)')
    expect(ast.tipo).toBe('se')
  })

  it('parseia SOMA_ITENS(campo)', () => {
    const ast = parsearFormula('SOMA_ITENS(quantidade)')
    expect(ast).toEqual({ tipo: 'soma_itens', campo: 'quantidade' })
  })

  it('rejeita função desconhecida', () => {
    expect(() => parsearFormula('FOO(a, b)')).toThrow(/Funcao desconhecida/)
  })
})

describe('parsearFormula — erros', () => {
  it('rejeita operador duplicado', () => {
    expect(() => parsearFormula('a + + b')).toThrow(/Token inesperado/)
  })

  it('rejeita parêntese não fechado', () => {
    expect(() => parsearFormula('(a + b')).toThrow()
  })

  it('rejeita caractere inválido', () => {
    expect(() => parsearFormula('a @ b')).toThrow(/Caractere inesperado/)
  })

  it('rejeita expressão vazia', () => {
    expect(() => parsearFormula('')).toThrow()
  })
})

// ── Evaluator ─────────────────────────────────────────────────────────────────

describe('avaliarFormula — operações básicas', () => {
  it('soma', () => {
    const ast = parsearFormula('a + b')
    const { valor, temNulo } = avaliarFormula(ast, { a: 10, b: 5 })
    expect(valor).toBe(15)
    expect(temNulo).toBe(false)
  })

  it('subtração', () => {
    const ast = parsearFormula('a - b - c')
    const { valor } = avaliarFormula(ast, { a: 100, b: 30, c: 20 })
    expect(valor).toBe(50)
  })

  it('multiplicação', () => {
    const ast = parsearFormula('a * b')
    const { valor } = avaliarFormula(ast, { a: 6, b: 7 })
    expect(valor).toBe(42)
  })

  it('divisão', () => {
    const ast = parsearFormula('a / b')
    const { valor, temNulo } = avaliarFormula(ast, { a: 10, b: 4 })
    expect(valor).toBe(2.5)
    expect(temNulo).toBe(false)
  })

  it('divisão por zero marca temNulo e retorna 0', () => {
    const ast = parsearFormula('a / b')
    const { valor, temNulo } = avaliarFormula(ast, { a: 10, b: 0 })
    expect(valor).toBe(0)
    expect(temNulo).toBe(true)
  })

  it('precedência aritmética', () => {
    const ast = parsearFormula('2 + 3 * 4')
    const { valor } = avaliarFormula(ast, {})
    expect(valor).toBe(14)
  })

  it('parênteses alteram precedência', () => {
    const ast = parsearFormula('(2 + 3) * 4')
    const { valor } = avaliarFormula(ast, {})
    expect(valor).toBe(20)
  })

  it('campo null marca temNulo e retorna 0', () => {
    const ast = parsearFormula('a + b')
    const { valor, temNulo } = avaliarFormula(ast, { a: 10, b: null })
    expect(valor).toBe(10)
    expect(temNulo).toBe(true)
  })

  it('campo undefined marca temNulo e retorna 0', () => {
    const ast = parsearFormula('a + b')
    const { valor, temNulo } = avaliarFormula(ast, { a: 10 })
    expect(valor).toBe(10)
    expect(temNulo).toBe(true)
  })
})

describe('avaliarFormula — SE()', () => {
  it('retorna ramo verdadeiro quando condição > 0', () => {
    const ast = parsearFormula('SE(a > 5, 100, 200)')
    const { valor } = avaliarFormula(ast, { a: 10 })
    expect(valor).toBe(100)
  })

  it('retorna ramo falso quando condição <= 0', () => {
    const ast = parsearFormula('SE(a > 5, 100, 200)')
    const { valor } = avaliarFormula(ast, { a: 3 })
    expect(valor).toBe(200)
  })

  it('operadores de comparação', () => {
    expect(avaliarFormula(parsearFormula('SE(a == 5, 1, 0)'), { a: 5 }).valor).toBe(1)
    expect(avaliarFormula(parsearFormula('SE(a != 5, 1, 0)'), { a: 5 }).valor).toBe(0)
    expect(avaliarFormula(parsearFormula('SE(a >= 5, 1, 0)'), { a: 5 }).valor).toBe(1)
    expect(avaliarFormula(parsearFormula('SE(a <= 5, 1, 0)'), { a: 5 }).valor).toBe(1)
    expect(avaliarFormula(parsearFormula('SE(a < 5,  1, 0)'), { a: 5 }).valor).toBe(0)
  })
})

// ── Fórmula default de saldo (regressão: resultado deve bater em item real) ──

describe('SALDO_FORMULA_PADRAO — regressão', () => {
  const formulaDefault = parsearFormula(SALDO_FORMULA_PADRAO)

  it('A=1000, C=100, D=200 → saldo = 700', () => {
    const ctx = {
      quantidade_total_inicial_pedido:      1000,
      quantidade_cancelada_total_pedido:    100,
      quantidade_transferida_total:         200,
      quantidade_pronta_itens_pedido_total: 500, // pronta NÃO entra no saldo
      saldo_itens_do_pedido:                0,
    }
    const { valor, temNulo } = avaliarFormula(formulaDefault, ctx)
    expect(valor).toBe(700)
    expect(temNulo).toBe(false)
  })

  it('A=1603.11, C=89.09, D=106.67 → saldo = 1407.35', () => {
    // Cenário real do item_pedi_med_0000425_001 do seed
    const ctx = {
      quantidade_total_inicial_pedido:      1603.11,
      quantidade_cancelada_total_pedido:    89.09,
      quantidade_transferida_total:         106.67,
      quantidade_pronta_itens_pedido_total: 669.45,
      saldo_itens_do_pedido:                0,
    }
    const { valor } = avaliarFormula(formulaDefault, ctx)
    expect(valor).toBeCloseTo(1407.35, 2)
  })

  it('fórmula NÃO inclui quantidade_pronta_itens_pedido_total', () => {
    // Regressão contra o bug que eu mesmo introduzi na primeira tentativa
    // de cascade: usar A - B - C em vez de A - C - D.
    const deps = extrairDependencias(SALDO_FORMULA_PADRAO)
    expect(deps).not.toContain('quantidade_pronta_itens_pedido_total')
    expect(deps).toContain('quantidade_total_inicial_pedido')
    expect(deps).toContain('quantidade_transferida_total')
    expect(deps).toContain('quantidade_cancelada_total_pedido')
  })
})

// ── buildContextoItem ────────────────────────────────────────────────────────

describe('buildContextoItem', () => {
  it('mapeia campos item-level → tokens pedido-level', () => {
    const item = {
      quantidade_inicial_item_pedido:       1000,
      quantidade_pronta_total_item_pedido:  500,
      quantidade_cancelada_item_pedido:     100,
      quantidade_transferida_item_pedido:   200,
      saldo_item_pedido:                    700,
      // Outros campos que devem ser ignorados
      part_number: 'ABC-123',
      descricao_item: 'Qualquer coisa',
    }
    const ctx = buildContextoItem(item)
    expect(ctx.quantidade_total_inicial_pedido).toBe(1000)
    expect(ctx.quantidade_pronta_itens_pedido_total).toBe(500)
    expect(ctx.quantidade_cancelada_total_pedido).toBe(100)
    expect(ctx.quantidade_transferida_total).toBe(200)
    expect(ctx.saldo_itens_do_pedido).toBe(700)
  })

  it('valor string numérico é convertido', () => {
    const item = { quantidade_inicial_item_pedido: '1234.56' }
    const ctx = buildContextoItem(item)
    expect(ctx.quantidade_total_inicial_pedido).toBe(1234.56)
  })

  it('valor null vira null (evaluator trata como 0 + temNulo)', () => {
    const item = { quantidade_inicial_item_pedido: null }
    const ctx = buildContextoItem(item)
    expect(ctx.quantidade_total_inicial_pedido).toBeNull()
  })

  it('integração com fórmula default (A=2000, C=89.09, D=106.67)', () => {
    const item = {
      quantidade_inicial_item_pedido:      2000,
      quantidade_cancelada_item_pedido:    89.09,
      quantidade_transferida_item_pedido:  106.67,
      quantidade_pronta_total_item_pedido: 669.45,
    }
    const ctx = buildContextoItem(item)
    const { valor } = avaliarFormula(parsearFormula(SALDO_FORMULA_PADRAO), ctx)
    expect(valor).toBeCloseTo(1804.24, 2)
  })
})

// ── TOKEN_PEDIDO_PARA_ITEM ────────────────────────────────────────────────────

describe('TOKEN_PEDIDO_PARA_ITEM', () => {
  it('cobre os 5 tokens de saldo', () => {
    expect(TOKEN_PEDIDO_PARA_ITEM.quantidade_total_inicial_pedido).toBe('quantidade_inicial_item_pedido')
    expect(TOKEN_PEDIDO_PARA_ITEM.quantidade_pronta_itens_pedido_total).toBe('quantidade_pronta_total_item_pedido')
    expect(TOKEN_PEDIDO_PARA_ITEM.quantidade_cancelada_total_pedido).toBe('quantidade_cancelada_item_pedido')
    expect(TOKEN_PEDIDO_PARA_ITEM.quantidade_transferida_total).toBe('quantidade_transferida_item_pedido')
    expect(TOKEN_PEDIDO_PARA_ITEM.saldo_itens_do_pedido).toBe('saldo_item_pedido')
  })
})

// ── extrairDependencias ──────────────────────────────────────────────────────

describe('extrairDependencias', () => {
  it('retorna lista única de campos', () => {
    const deps = extrairDependencias('a + b - a * c')
    expect(deps.sort()).toEqual(['a', 'b', 'c'])
  })

  it('retorna lista vazia para expressão com só números', () => {
    expect(extrairDependencias('1 + 2 * 3')).toEqual([])
  })

  it('inclui campo de SOMA_ITENS', () => {
    const deps = extrairDependencias('SOMA_ITENS(quantidade) * 2')
    expect(deps).toContain('quantidade')
  })

  it('retorna vazio para expressão inválida (sem throw)', () => {
    expect(extrairDependencias('a + + b')).toEqual([])
  })
})
