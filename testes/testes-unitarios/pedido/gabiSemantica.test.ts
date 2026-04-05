/**
 * gabiSemantica.test.ts — Testes unitários do analisador semântico GABI
 *
 * Cobre:
 *   - Parser (formulaEngine): casos válidos e inválidos
 *   - Regra 1: parcela somada ao seu total
 *   - Regra 2: unidades físicas incompatíveis
 *   - Regra 3: divisão sem proteção SE()
 *   - Regra 4: campo somado com ele mesmo
 *   - Casos felizes: fórmulas semanticamente corretas retornam null
 */

import { describe, it, expect } from 'vitest'
import { parsearFormula } from '../../../produto/pedido/client/src/shared/formulaEngine.js'
import { analisarSemanticaFormula } from '../../../produto/pedido/client/src/shared/gabiSemantica.js'

// ── Parser — testes de sintaxe ────────────────────────────────────────────────

describe('parsearFormula — sintaxe', () => {
  it('aceita campo simples', () => {
    expect(() => parsearFormula('quantidade_total_inicial_pedido')).not.toThrow()
  })

  it('aceita soma de dois campos', () => {
    expect(() => parsearFormula('quantidade_total_inicial_pedido+quantidade_transferida_total')).not.toThrow()
  })

  it('aceita soma com espaços', () => {
    expect(() => parsearFormula('quantidade_total_inicial_pedido + quantidade_transferida_total')).not.toThrow()
  })

  it('aceita subtração', () => {
    expect(() => parsearFormula('quantidade_total_inicial_pedido - quantidade_cancelada_total_pedido')).not.toThrow()
  })

  it('aceita divisão', () => {
    expect(() => parsearFormula('valor_total / quantidade_total_inicial_pedido')).not.toThrow()
  })

  it('aceita SE()', () => {
    expect(() => parsearFormula('SE(quantidade_total_inicial_pedido == 0, 0, valor_total / quantidade_total_inicial_pedido)')).not.toThrow()
  })

  it('aceita SOMA_ITENS()', () => {
    expect(() => parsearFormula('SOMA_ITENS(quantidade_total_inicial_pedido)')).not.toThrow()
  })

  it('aceita número literal', () => {
    expect(() => parsearFormula('quantidade_total_inicial_pedido * 0.15')).not.toThrow()
  })

  it('rejeita expressão terminando em operador', () => {
    expect(() => parsearFormula('quantidade_total_inicial_pedido +')).toThrow()
  })

  it('rejeita parêntese sem fechar', () => {
    expect(() => parsearFormula('(quantidade_total_inicial_pedido + 1')).toThrow()
  })

  it('rejeita caractere inválido', () => {
    expect(() => parsearFormula('campo@inválido')).toThrow()
  })

  it('rejeita string vazia', () => {
    expect(() => parsearFormula('')).toThrow()
  })
})

// ── Regra 1: parcela somada ao total ─────────────────────────────────────────

describe('analisarSemanticaFormula — Regra 1: parcela + total', () => {
  it('detecta: quantidade_cancelada (parcela) + quantidade_inicial (total)', () => {
    const r = analisarSemanticaFormula('quantidade_cancelada_total_pedido + quantidade_total_inicial_pedido')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Parcela somada ao seu total')
    expect(r!.sugestao).toBe('quantidade_total_inicial_pedido - quantidade_cancelada_total_pedido')
  })

  it('detecta: quantidade_inicial (total) + quantidade_cancelada (parcela)', () => {
    const r = analisarSemanticaFormula('quantidade_total_inicial_pedido + quantidade_cancelada_total_pedido')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Parcela somada ao seu total')
    expect(r!.sugestao).toBe('quantidade_total_inicial_pedido - quantidade_cancelada_total_pedido')
  })

  it('detecta: quantidade_inicial + quantidade_transferida', () => {
    const r = analisarSemanticaFormula('quantidade_total_inicial_pedido + quantidade_transferida_total')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Parcela somada ao seu total')
  })

  it('detecta: quantidade_inicial + quantidade_pronta', () => {
    const r = analisarSemanticaFormula('quantidade_total_inicial_pedido + quantidade_pronta_itens_pedido_total')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Parcela somada ao seu total')
  })

  it('NÃO dispara para subtração (inicial - cancelada é correto)', () => {
    const r = analisarSemanticaFormula('quantidade_total_inicial_pedido - quantidade_cancelada_total_pedido')
    expect(r).toBeNull()
  })

  it('NÃO dispara para multiplicação entre parcela e total', () => {
    const r = analisarSemanticaFormula('quantidade_total_inicial_pedido * quantidade_cancelada_total_pedido')
    expect(r).toBeNull()
  })
})

// ── Regra 4: campo somado com ele mesmo ──────────────────────────────────────

describe('analisarSemanticaFormula — Regra 4: campo + mesmo campo', () => {
  it('detecta: valor_total + valor_total', () => {
    const r = analisarSemanticaFormula('valor_total + valor_total')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Campo somado com ele mesmo')
    expect(r!.sugestao).toBe('valor_total * 2')
  })

  it('detecta: quantidade_total_inicial_pedido + quantidade_total_inicial_pedido', () => {
    const r = analisarSemanticaFormula('quantidade_total_inicial_pedido + quantidade_total_inicial_pedido')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Campo somado com ele mesmo')
  })

  it('NÃO dispara para campos distintos', () => {
    const r = analisarSemanticaFormula('valor_total + saldo_itens_do_pedido')
    // pode disparar regra 2 (unidades) mas não regra 4
    if (r) expect(r.titulo).not.toBe('Campo somado com ele mesmo')
  })
})

// ── Regra 2: unidades incompatíveis ──────────────────────────────────────────

describe('analisarSemanticaFormula — Regra 2: unidades incompatíveis', () => {
  it('detecta: quantidade + valor financeiro', () => {
    const r = analisarSemanticaFormula('quantidade_total_inicial_pedido + valor_total')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Unidades incompatíveis')
    expect(r!.texto).toContain('quantidade')
    expect(r!.texto).toContain('valor financeiro')
  })

  it('detecta: quantidade + peso', () => {
    const r = analisarSemanticaFormula('quantidade_total_inicial_pedido + peso_liquido_total_pedido')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Unidades incompatíveis')
  })

  it('detecta: valor financeiro + cubagem', () => {
    const r = analisarSemanticaFormula('valor_total + cubagem_total_pedido')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Unidades incompatíveis')
  })

  it('NÃO dispara para campos da mesma unidade', () => {
    const r = analisarSemanticaFormula('peso_liquido_total_pedido + peso_bruto_total_pedido')
    // peso + peso é mesma unidade, não deve disparar unidades incompatíveis
    if (r) expect(r.titulo).not.toBe('Unidades incompatíveis')
  })

  it('NÃO dispara para campo único', () => {
    const r = analisarSemanticaFormula('quantidade_total_inicial_pedido * 2')
    expect(r).toBeNull()
  })
})

// ── Regra 3: divisão sem SE ───────────────────────────────────────────────────

describe('analisarSemanticaFormula — Regra 3: divisão sem SE', () => {
  it('detecta: campo / campo sem SE', () => {
    const r = analisarSemanticaFormula('valor_total / quantidade_total_inicial_pedido')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Divisão sem proteção')
    expect(r!.texto).toContain('Quantidade Inicial')
  })

  it('detecta: campo / número sem SE', () => {
    const r = analisarSemanticaFormula('valor_total / 100')
    expect(r).not.toBeNull()
    expect(r!.titulo).toBe('Divisão sem proteção')
  })

  it('NÃO dispara quando divisão está dentro de SE()', () => {
    const r = analisarSemanticaFormula(
      'SE(quantidade_total_inicial_pedido == 0, 0, valor_total / quantidade_total_inicial_pedido)'
    )
    expect(r).toBeNull()
  })
})

// ── Casos felizes: fórmulas corretas retornam null ────────────────────────────

describe('analisarSemanticaFormula — casos corretos (sem aviso)', () => {
  it('saldo = inicial - cancelada - transferida', () => {
    const r = analisarSemanticaFormula(
      'quantidade_total_inicial_pedido - quantidade_cancelada_total_pedido - quantidade_transferida_total'
    )
    expect(r).toBeNull()
  })

  it('percentual cancelado com SE()', () => {
    const r = analisarSemanticaFormula(
      'SE(quantidade_total_inicial_pedido == 0, 0, quantidade_cancelada_total_pedido / quantidade_total_inicial_pedido)'
    )
    expect(r).toBeNull()
  })

  it('multiplicação por constante', () => {
    const r = analisarSemanticaFormula('quantidade_total_inicial_pedido * 0.15')
    expect(r).toBeNull()
  })

  it('campo único sem operação', () => {
    const r = analisarSemanticaFormula('saldo_itens_do_pedido')
    expect(r).toBeNull()
  })

  it('expressão inválida retorna null (não lança)', () => {
    const r = analisarSemanticaFormula('campo_invalido +')
    expect(r).toBeNull() // parser lança → capturado → null
  })
})
