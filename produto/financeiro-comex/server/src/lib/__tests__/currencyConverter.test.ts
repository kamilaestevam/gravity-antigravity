import { describe, it, expect } from 'vitest'
import { calcularValorBRL, formatarTaxa, roundTo4, parseTaxa, TAXA_BRL } from '../currencyConverter.js'

describe('calcularValorBRL', () => {
  it('converte USD para BRL corretamente', () => {
    // 100 USD × 5.6923000 = 569.2300
    expect(calcularValorBRL(100, 5.6923)).toBe(569.23)
  })

  it('converte EUR com 7 casas decimais na taxa', () => {
    // 3929 EUR × 6.1864 = 24.306,3656 → arredondado 24306.3656
    const result = calcularValorBRL(3929, 6.1864)
    expect(result).toBeCloseTo(24306.37, 1)
  })

  it('BRL × 1.0 = mesmo valor', () => {
    expect(calcularValorBRL(1500, 1.0)).toBe(1500)
  })

  it('lanca erro para valor negativo', () => {
    expect(() => calcularValorBRL(-100, 5.0)).toThrow()
  })

  it('lanca erro para taxa zero', () => {
    expect(() => calcularValorBRL(100, 0)).toThrow()
  })

  it('lanca erro para taxa negativa', () => {
    expect(() => calcularValorBRL(100, -1)).toThrow()
  })

  it('arredonda para 4 casas decimais', () => {
    const result = calcularValorBRL(1, 3.33333333)
    expect(result.toString()).toMatch(/^\d+\.\d{1,4}$/)
  })
})

describe('roundTo4', () => {
  it('arredonda para cima no meio', () => {
    expect(roundTo4(1.23455)).toBe(1.2346)
  })

  it('mantem inteiros', () => {
    expect(roundTo4(100)).toBe(100)
  })

  it('mantem valores com menos de 4 casas', () => {
    expect(roundTo4(1.5)).toBe(1.5)
  })
})

describe('parseTaxa', () => {
  it('aceita numero direto', () => {
    expect(parseTaxa(5.6923)).toBe(5.6923)
  })

  it('aceita string com ponto', () => {
    expect(parseTaxa('5.6923000')).toBe(5.6923)
  })

  it('aceita string com virgula (formato BR)', () => {
    expect(parseTaxa('5,6923')).toBe(5.6923)
  })

  it('lanca erro para valor invalido', () => {
    expect(() => parseTaxa('abc')).toThrow()
  })

  it('lanca erro para zero', () => {
    expect(() => parseTaxa(0)).toThrow()
  })
})

describe('TAXA_BRL', () => {
  it('taxa BRL e 1.0', () => {
    expect(TAXA_BRL).toBe(1.0)
  })
})

describe('formatarTaxa', () => {
  it('formata com 7 casas decimais', () => {
    expect(formatarTaxa(5.6923)).toBe('5.6923000')
  })

  it('formata inteiro com zeros', () => {
    expect(formatarTaxa(1)).toBe('1.0000000')
  })
})
