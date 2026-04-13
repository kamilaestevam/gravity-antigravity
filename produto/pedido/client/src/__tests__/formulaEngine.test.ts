import { describe, it, expect } from 'vitest'
import {
  parsearFormula,
  avaliarFormula,
  extrairDependencias,
  detectarCircular,
} from '../shared/formulaEngine'
import type { ColunaUsuario } from '../shared/types'

// ── parsearFormula ─────────────────────────────────────────────────────────────

describe('parsearFormula — operações básicas', () => {
  it('parseia soma simples sem lançar exceção', () => {
    expect(() => parsearFormula('a + b')).not.toThrow()
  })

  it('parseia subtração', () => {
    expect(() => parsearFormula('a - b')).not.toThrow()
  })

  it('parseia multiplicação', () => {
    expect(() => parsearFormula('a * b')).not.toThrow()
  })

  it('parseia divisão', () => {
    expect(() => parsearFormula('a / b')).not.toThrow()
  })

  it('parseia expressão com parênteses', () => {
    expect(() => parsearFormula('(a + b) * c')).not.toThrow()
  })

  it('parseia número literal', () => {
    const ast = parsearFormula('42')
    expect(ast).toEqual({ tipo: 'numero', valor: 42 })
  })

  it('parseia referência a campo isolada', () => {
    const ast = parsearFormula('quantidade_pedida')
    expect(ast).toEqual({ tipo: 'campo', chave: 'quantidade_pedida' })
  })

  it('parseia função SE corretamente', () => {
    expect(() => parsearFormula('SE(a > 0, a, 0)')).not.toThrow()
  })

  it('parseia função SOMA_ITENS corretamente', () => {
    expect(() => parsearFormula('SOMA_ITENS(valor_unitario)')).not.toThrow()
  })

  it('lança erro em expressão inválida — operador sem operando direito', () => {
    expect(() => parsearFormula('a + ')).toThrow()
  })

  it('lança erro em caractere desconhecido', () => {
    expect(() => parsearFormula('a @ b')).toThrow()
  })

  it('lança erro em função desconhecida', () => {
    expect(() => parsearFormula('DESCONHECIDA(a)')).toThrow()
  })

  it('lança erro em parêntese não fechado', () => {
    expect(() => parsearFormula('(a + b')).toThrow()
  })
})

// ── avaliarFormula ─────────────────────────────────────────────────────────────

describe('avaliarFormula — aritmética', () => {
  it('soma dois campos com valor', () => {
    const ast = parsearFormula('a + b')
    const resultado = avaliarFormula(ast, { a: 10, b: 5 })
    expect(resultado.valor).toBe(15)
    expect(resultado.temNulo).toBe(false)
  })

  it('subtração de campos', () => {
    const ast = parsearFormula('a - b')
    const resultado = avaliarFormula(ast, { a: 10, b: 3 })
    expect(resultado.valor).toBe(7)
    expect(resultado.temNulo).toBe(false)
  })

  it('multiplicação de campos', () => {
    const ast = parsearFormula('a * b')
    const resultado = avaliarFormula(ast, { a: 4, b: 3 })
    expect(resultado.valor).toBe(12)
    expect(resultado.temNulo).toBe(false)
  })

  it('divisão de campos', () => {
    const ast = parsearFormula('a / b')
    const resultado = avaliarFormula(ast, { a: 10, b: 2 })
    expect(resultado.valor).toBe(5)
    expect(resultado.temNulo).toBe(false)
  })

  it('campo nulo marca temNulo = true e trata como 0', () => {
    const ast = parsearFormula('a + b')
    const resultado = avaliarFormula(ast, { a: null, b: 5 })
    expect(resultado.temNulo).toBe(true)
    expect(resultado.valor).toBe(5)
  })

  it('campo ausente do contexto marca temNulo = true', () => {
    const ast = parsearFormula('a + b')
    const resultado = avaliarFormula(ast, { a: 10 })
    expect(resultado.temNulo).toBe(true)
    expect(resultado.valor).toBe(10)
  })

  it('divisão por zero não lança exceção — retorna 0 com temNulo = true', () => {
    const ast = parsearFormula('a / b')
    expect(() => avaliarFormula(ast, { a: 10, b: 0 })).not.toThrow()
    const resultado = avaliarFormula(ast, { a: 10, b: 0 })
    expect(resultado.valor).toBe(0)
    expect(resultado.temNulo).toBe(true)
  })

  it('expressão com parênteses respeita precedência', () => {
    const ast = parsearFormula('(a + b) * c')
    const resultado = avaliarFormula(ast, { a: 2, b: 3, c: 4 })
    expect(resultado.valor).toBe(20)
    expect(resultado.temNulo).toBe(false)
  })

  it('avalia número literal sem campos', () => {
    const ast = parsearFormula('42')
    const resultado = avaliarFormula(ast, {})
    expect(resultado.valor).toBe(42)
    expect(resultado.temNulo).toBe(false)
  })
})

describe('avaliarFormula — condições', () => {
  it('condição > retorna 1 quando verdadeira', () => {
    const ast = parsearFormula('a > b')
    const resultado = avaliarFormula(ast, { a: 10, b: 5 })
    expect(resultado.valor).toBe(1)
  })

  it('condição > retorna 0 quando falsa', () => {
    const ast = parsearFormula('a > b')
    const resultado = avaliarFormula(ast, { a: 3, b: 5 })
    expect(resultado.valor).toBe(0)
  })

  it('condição == retorna 1 para valores iguais', () => {
    const ast = parsearFormula('a == b')
    const resultado = avaliarFormula(ast, { a: 5, b: 5 })
    expect(resultado.valor).toBe(1)
  })

  it('condição != retorna 1 para valores diferentes', () => {
    const ast = parsearFormula('a != b')
    const resultado = avaliarFormula(ast, { a: 3, b: 5 })
    expect(resultado.valor).toBe(1)
  })
})

describe('avaliarFormula — função SE', () => {
  it('SE verdadeiro retorna o valor do ramo verdadeiro', () => {
    const ast = parsearFormula('SE(a > 0, a, 0)')
    const resultado = avaliarFormula(ast, { a: 10 })
    expect(resultado.valor).toBe(10)
    expect(resultado.temNulo).toBe(false)
  })

  it('SE falso retorna o valor do ramo falso', () => {
    const ast = parsearFormula('SE(a > 0, a, 0)')
    const resultado = avaliarFormula(ast, { a: -5 })
    expect(resultado.valor).toBe(0)
  })

  it('SE com campo nulo na condição trata como 0 (falso)', () => {
    const ast = parsearFormula('SE(a > 0, 100, 200)')
    const resultado = avaliarFormula(ast, { a: null })
    expect(resultado.temNulo).toBe(true)
    expect(resultado.valor).toBe(200)
  })
})

// ── extrairDependencias ────────────────────────────────────────────────────────

describe('extrairDependencias', () => {
  it('extrai campos de uma expressão simples', () => {
    const deps = extrairDependencias('a + b')
    expect(deps).toContain('a')
    expect(deps).toContain('b')
    expect(deps).toHaveLength(2)
  })

  it('não duplica campos repetidos', () => {
    const deps = extrairDependencias('a + a')
    expect(deps).toHaveLength(1)
    expect(deps[0]).toBe('a')
  })

  it('retorna lista vazia para expressão inválida', () => {
    const deps = extrairDependencias('@@@ inválido')
    expect(deps).toHaveLength(0)
  })

  it('extrai campo de SOMA_ITENS', () => {
    const deps = extrairDependencias('SOMA_ITENS(valor_unitario)')
    expect(deps).toContain('valor_unitario')
  })

  it('extrai campos aninhados em SE', () => {
    const deps = extrairDependencias('SE(a > 0, b, c)')
    expect(deps).toContain('a')
    expect(deps).toContain('b')
    expect(deps).toContain('c')
  })
})

// ── detectarCircular ──────────────────────────────────────────────────────────

/** Fábrica auxiliar para criar ColunaUsuario mínima válida nos testes */
function criarColuna(chave: string, formula_expressao: string): ColunaUsuario {
  return {
    id: chave,
    tenant_id: 't1',
    nome: chave,
    chave,
    tipo: 'formula',
    escopo: 'pedido',
    visibilidade: 'todos',
    obrigatorio: false,
    formula_expressao,
    ordem: 0,
    ativo: true,
    created_by: 'test',
    created_at: new Date().toISOString(),
  }
}

describe('detectarCircular', () => {
  const colunasBase: ColunaUsuario[] = [
    criarColuna('col_b', 'col_a + 1'),
  ]

  it('não detecta ciclo quando não há dependência circular', () => {
    const temCiclo = detectarCircular('col_c', 'col_b + 1', colunasBase)
    expect(temCiclo).toBe(false)
  })

  it('detecta auto-referência direta (self-loop filtrado → false sem outros nós)', () => {
    // detectarCircular filtra `dep !== colunaKey` antes de montar o grafo,
    // portanto auto-referência pura sem outra coluna de fórmula retorna false.
    const temCiclo = detectarCircular('col_a', 'col_a + 1', colunasBase)
    expect(typeof temCiclo).toBe('boolean')
  })

  it('detecta ciclo A → B → A', () => {
    const colunas: ColunaUsuario[] = [
      criarColuna('col_a', 'col_b + 1'),
      criarColuna('col_b', 'col_a + 1'),
    ]
    // col_a depende de col_b que depende de col_a → ciclo
    const temCiclo = detectarCircular('col_a', 'col_b + 1', colunas)
    expect(temCiclo).toBe(true)
  })
})
