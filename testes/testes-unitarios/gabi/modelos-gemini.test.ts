// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  MODELS_CHAIN,
  MODEL_PRICING,
  calcularCusto,
  precoDoModelo,
} from '../../../servicos-global/servicos-plataforma/gabi/server/lib/modelos-gemini.js'

describe('MODELS_CHAIN', () => {
  it('tem gemini-3.5-flash como modelo primario', () => {
    expect(MODELS_CHAIN[0]).toBe('gemini-3.5-flash')
  })

  it('todo modelo da chain tem preco cadastrado', () => {
    for (const modelo of MODELS_CHAIN) {
      expect(MODEL_PRICING[modelo]).toBeDefined()
    }
  })
})

describe('calcularCusto', () => {
  it('cobra input fresco a preco cheio', () => {
    // 1M tokens de input de gemini-3.5-flash = $1.50
    expect(calcularCusto('gemini-3.5-flash', 1_000_000, 0, 0)).toBeCloseTo(1.5, 6)
  })

  it('desconta tokens cacheados do input fresco e cobra preco de cache', () => {
    // 1M input, 900k cacheados: 100k fresco*1.50 + 900k cached*0.15 = 0.15 + 0.135
    const custo = calcularCusto('gemini-3.5-flash', 1_000_000, 0, 900_000)
    expect(custo).toBeCloseTo(0.15 + 0.135, 6)
  })

  it('cobra output ao preco de output', () => {
    // 1M output de gemini-3.5-flash = $9.00
    expect(calcularCusto('gemini-3.5-flash', 0, 1_000_000, 0)).toBeCloseTo(9.0, 6)
  })

  it('cache maior que input nao gera custo negativo', () => {
    const custo = calcularCusto('gemini-3.5-flash', 100, 0, 999_999)
    expect(custo).toBeGreaterThanOrEqual(0)
  })

  it('modelo desconhecido usa preco padrao conservador', () => {
    const p = precoDoModelo('modelo-inexistente')
    expect(p.input).toBeGreaterThan(0)
    expect(p.output).toBeGreaterThan(0)
  })
})
