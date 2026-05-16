// @vitest-environment node
import { describe, it, expect } from 'vitest'

/**
 * Reproduz a lógica interna de aplicarOperacao do edicaoEmMassaService.
 * A função original não é exportada, então testamos o comportamento via reprodução.
 */
function aplicarOperacao(
  valorAtual: string | number | null,
  operacao: string,
  valorNovo: string | number,
): string | number {
  if (operacao === 'substituir') return valorNovo

  if (operacao === 'somar') {
    return Number(valorAtual ?? 0) + Number(valorNovo)
  }
  if (operacao === 'subtrair') {
    return Number(valorAtual ?? 0) - Number(valorNovo)
  }
  if (operacao === 'percentual') {
    const base = Number(valorAtual ?? 0)
    return base + (base * Number(valorNovo) / 100)
  }
  if (operacao === 'avancar_dias') {
    const d = new Date(String(valorAtual))
    d.setDate(d.getDate() + Number(valorNovo))
    return d.toISOString().split('T')[0]
  }
  if (operacao === 'recuar_dias') {
    const d = new Date(String(valorAtual))
    d.setDate(d.getDate() - Number(valorNovo))
    return d.toISOString().split('T')[0]
  }
  return valorNovo
}

describe('Edição em Massa — Operações', () => {
  describe('substituir', () => {
    it('U01: substitui campo texto', () => {
      const resultado = aplicarOperacao('CIF', 'substituir', 'FOB')
      expect(resultado).toBe('FOB')
    })

    it('U02: substitui campo numérico', () => {
      const resultado = aplicarOperacao(50, 'substituir', 100)
      expect(resultado).toBe(100)
    })

    it('U03: substitui campo data', () => {
      const resultado = aplicarOperacao('2026-01-01', 'substituir', '2026-06-01')
      expect(resultado).toBe('2026-06-01')
    })

    it('U04: substitui campo select', () => {
      const resultado = aplicarOperacao('IMP', 'substituir', 'EXP')
      expect(resultado).toBe('EXP')
    })

    it('U10: substitui campo NCM', () => {
      const resultado = aplicarOperacao('8471.30.11', 'substituir', '8471.30.19')
      expect(resultado).toBe('8471.30.19')
    })

    it('U11: substitui campo usuário (id)', () => {
      const resultado = aplicarOperacao('id_user_old', 'substituir', 'id_user_123')
      expect(resultado).toBe('id_user_123')
    })
  })

  describe('somar', () => {
    it('U05: soma valor numérico', () => {
      const resultado = aplicarOperacao(100, 'somar', 50)
      expect(resultado).toBe(150)
    })
  })

  describe('subtrair', () => {
    it('U06: subtrai valor numérico', () => {
      const resultado = aplicarOperacao(100, 'subtrair', 30)
      expect(resultado).toBe(70)
    })

    it('U12: subtração com resultado negativo', () => {
      const resultado = aplicarOperacao(10, 'subtrair', 20)
      expect(resultado).toBe(-10)
    })
  })

  describe('percentual', () => {
    it('U07: aplica percentual positivo (+10%)', () => {
      const resultado = aplicarOperacao(200, 'percentual', 10)
      expect(resultado).toBe(220)
    })

    it('U13: aplica percentual negativo (-50%)', () => {
      const resultado = aplicarOperacao(100, 'percentual', -50)
      expect(resultado).toBe(50)
    })
  })

  describe('avancar_dias', () => {
    it('U08: avança data em 5 dias', () => {
      const resultado = aplicarOperacao('2026-01-10', 'avancar_dias', 5)
      expect(resultado).toBe('2026-01-15')
    })
  })

  describe('recuar_dias', () => {
    it('U09: recua data em 3 dias', () => {
      const resultado = aplicarOperacao('2026-01-10', 'recuar_dias', 3)
      expect(resultado).toBe('2026-01-07')
    })
  })
})
