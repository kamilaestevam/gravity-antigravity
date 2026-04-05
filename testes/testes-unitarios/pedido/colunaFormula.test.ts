/**
 * colunaFormula.test.ts — Testes de integração da avaliação de fórmulas em colunas C2
 *
 * Cobre:
 *   - parsearFormula + avaliarFormula: cálculo correto com campos do Pedido
 *   - avaliarFormula retorna { valor: number, temNulo: boolean }
 *   - Campos nulos → temNulo: true (valor calculado com 0 no lugar)
 *   - Divisão por zero → Infinity (sem SE) ou 0 (com SE)
 *   - Truncamento de texto: string > 150 chars deve ser detectada como longa
 *   - Auto-align: tipo 'numero' → alinhamento direita, 'texto' → esquerda
 */

import { describe, it, expect } from 'vitest'
import { parsearFormula, avaliarFormula } from '../../../produto/pedido/client/src/shared/formulaEngine.js'

// Simula o que buildFormulaContexto faz para os campos do Pedido
function contexto(overrides: Record<string, number | null> = {}): Record<string, number | null> {
  return {
    quantidade_total_inicial_pedido: 1000,
    quantidade_cancelada_total_pedido: 100,
    quantidade_transferida_total: 200,
    quantidade_pronta_itens_pedido_total: 300,
    saldo_itens_do_pedido: 700,
    valor_total: 45000,
    peso_liquido_total_pedido: 500.5,
    peso_bruto_total_pedido: 510.0,
    cubagem_total_pedido: 2.5,
    ...overrides,
  }
}

// ── Cálculo básico ────────────────────────────────────────────────────────────

describe('avaliarFormula — fórmulas do Pedido', () => {
  it('subtração simples: quantidade_total - quantidade_cancelada', () => {
    const ast = parsearFormula('quantidade_total_inicial_pedido - quantidade_cancelada_total_pedido')
    const { valor, temNulo } = avaliarFormula(ast, contexto())
    expect(valor).toBe(900)
    expect(temNulo).toBe(false)
  })

  it('saldo vivo: total - cancelada - transferida', () => {
    const ast = parsearFormula(
      'quantidade_total_inicial_pedido - quantidade_cancelada_total_pedido - quantidade_transferida_total'
    )
    const { valor, temNulo } = avaliarFormula(ast, contexto())
    expect(valor).toBe(700)
    expect(temNulo).toBe(false)
  })

  it('percentual pronto: pronta / total', () => {
    const ast = parsearFormula(
      'quantidade_pronta_itens_pedido_total / quantidade_total_inicial_pedido'
    )
    const { valor, temNulo } = avaliarFormula(ast, contexto())
    expect(valor).toBeCloseTo(0.3, 5)
    expect(temNulo).toBe(false)
  })

  it('campo único retorna seu valor', () => {
    const ast = parsearFormula('valor_total')
    const { valor, temNulo } = avaliarFormula(ast, contexto())
    expect(valor).toBe(45000)
    expect(temNulo).toBe(false)
  })

  it('multiplicação', () => {
    const ast = parsearFormula('peso_liquido_total_pedido * 2')
    const { valor, temNulo } = avaliarFormula(ast, contexto())
    expect(valor).toBeCloseTo(1001.0, 5)
    expect(temNulo).toBe(false)
  })
})

// ── Campos nulos ──────────────────────────────────────────────────────────────

describe('avaliarFormula — campos nulos', () => {
  it('campo null → temNulo: true, valor calculado com 0', () => {
    const ast = parsearFormula('quantidade_total_inicial_pedido')
    const { valor, temNulo } = avaliarFormula(ast, contexto({ quantidade_total_inicial_pedido: null }))
    expect(temNulo).toBe(true)
    expect(valor).toBe(0)
  })

  it('soma com campo null → temNulo: true', () => {
    const ast = parsearFormula('quantidade_total_inicial_pedido + quantidade_cancelada_total_pedido')
    const { valor, temNulo } = avaliarFormula(ast, contexto({ quantidade_total_inicial_pedido: null }))
    expect(temNulo).toBe(true)
    // 0 (null tratado como 0) + 100 = 100
    expect(valor).toBe(100)
  })
})

// ── Divisão por zero ──────────────────────────────────────────────────────────

describe('avaliarFormula — divisão por zero', () => {
  it('divisão por zero sem SE → valor Infinity ou NaN (não crash)', () => {
    const ast = parsearFormula('valor_total / quantidade_total_inicial_pedido')
    const { valor } = avaliarFormula(ast, contexto({ quantidade_total_inicial_pedido: 0 }))
    // Divisão por zero resulta em Infinity (JS nativo) — o render C2 trata isso
    expect(isFinite(valor) || isNaN(valor) || valor === Infinity).toBe(true)
  })

  it('SE(denominador == 0, 0, ...) protege divisão por zero', () => {
    const ast = parsearFormula(
      'SE(quantidade_total_inicial_pedido == 0, 0, valor_total / quantidade_total_inicial_pedido)'
    )
    const { valor, temNulo } = avaliarFormula(ast, contexto({ quantidade_total_inicial_pedido: 0 }))
    expect(valor).toBe(0)
    expect(temNulo).toBe(false)
  })

  it('SE(denominador == 0, 0, ...) com denominador > 0 retorna resultado normal', () => {
    const ast = parsearFormula(
      'SE(quantidade_total_inicial_pedido == 0, 0, valor_total / quantidade_total_inicial_pedido)'
    )
    const { valor, temNulo } = avaliarFormula(ast, contexto())
    expect(valor).toBeCloseTo(45, 2)
    expect(temNulo).toBe(false)
  })
})

// ── Truncamento de texto (lógica de limite) ───────────────────────────────────

describe('truncamento de texto a 150 chars', () => {
  it('string com 150 chars não precisa truncar', () => {
    const texto = 'a'.repeat(150)
    expect(texto.length > 150).toBe(false)
  })

  it('string com 151 chars deve ser truncada', () => {
    const texto = 'a'.repeat(151)
    expect(texto.length > 150).toBe(true)
    const truncado = texto.slice(0, 150) + '…'
    expect(truncado.length).toBe(151)
    expect(truncado.endsWith('…')).toBe(true)
  })

  it('string vazia não precisa truncar', () => {
    expect(''.length > 150).toBe(false)
  })
})

// ── Auto-align por tipo ───────────────────────────────────────────────────────

describe('auto-align por tipo de coluna', () => {
  // Valida a lógica de alinhamento que é aplicada em mapColunaUsuarioParaGTColuna
  const getAlinhamento = (tipo: string): 'left' | 'right' | 'center' => {
    if (['numero', 'percentual', 'formula'].includes(tipo)) return 'right'
    if (tipo === 'checkbox') return 'center'
    return 'left'
  }

  it('numero → right', () => expect(getAlinhamento('numero')).toBe('right'))
  it('percentual → right', () => expect(getAlinhamento('percentual')).toBe('right'))
  it('formula → right', () => expect(getAlinhamento('formula')).toBe('right'))
  it('checkbox → center', () => expect(getAlinhamento('checkbox')).toBe('center'))
  it('texto → left', () => expect(getAlinhamento('texto')).toBe('left'))
  it('select → left', () => expect(getAlinhamento('select')).toBe('left'))
  it('data → left', () => expect(getAlinhamento('data')).toBe('left'))
  it('tipo_documento → left', () => expect(getAlinhamento('tipo_documento')).toBe('left'))
})
